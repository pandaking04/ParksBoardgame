// ===== Game State =====

let gameState = null;

function createInitialState() {
  return {
    phase: "title",
    turn: 0,
    deck: [],
    market: [],
    player: {
      resources: { forest: 0, water: 0, mountain: 0, activity: 0 },
      parks: [],
      missions: [],
      missionCandidates: [],
      gears: [],
    },
    gearShop: [],
    turnPhase: "bonus",
    pendingEffect: null,
    selectedMarketIndex: -1,
    gatherMode: "diverse",
    gatherPicks: [],
  };
}

// ===== Deck & Market =====

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initGame() {
  gameState = createInitialState();
  gameState.deck = shuffle(PARKS);
  gameState.market = gameState.deck.splice(0, MARKET_SIZE);
  gameState.player.missionCandidates = shuffle([...MISSIONS]).slice(0, 3);
  gameState.gearShop = [...GEARS];
  gameState.phase = "mission_select";
}

function getEffectiveMarketSize() {
  if (gameState.player.gears.some(g => g.effectType === "market_size")) return 4;
  return MARKET_SIZE;
}

function refillMarket() {
  const size = getEffectiveMarketSize();
  while (gameState.market.length < size && gameState.deck.length > 0) {
    gameState.market.push(gameState.deck.shift());
  }
}

// ===== Resources =====

function getEffectiveMaxResources() {
  if (gameState.player.gears.some(g => g.effectType === "max_resources")) return MAX_RESOURCES + 2;
  return MAX_RESOURCES;
}

function getResourceTotal(resources) {
  return RESOURCES.reduce((sum, r) => sum + resources[r], 0);
}

function enforceResourceCap(state) {
  const cap = getEffectiveMaxResources();
  const total = getResourceTotal(state.player.resources);
  if (total > cap) {
    return total - cap;
  }
  return 0;
}

function canAfford(park) {
  const cost = getEffectiveCost(park, gameState.player.parks, gameState.turn, gameState.player.gears);
  return RESOURCES.every(r => gameState.player.resources[r] >= cost[r]);
}

function canAffordGear(gear) {
  return RESOURCES.every(r => gameState.player.resources[r] >= gear.cost[r]);
}

function payResources(cost) {
  RESOURCES.forEach(r => {
    gameState.player.resources[r] -= cost[r];
  });
}

// ===== Gather =====

function getGatherMax(mode) {
  const bonus = gameState.player.gears.some(g => g.effectType === "gather_bonus") ? 1 : 0;
  return (mode === "diverse" ? 3 : 2) + bonus;
}

function validateGather(picks, mode) {
  const max = getGatherMax(mode);
  if (picks.length !== max) return false;
  if (mode === "diverse") {
    const unique = new Set(picks);
    return unique.size === picks.length;
  } else {
    return picks.every(p => p === picks[0]);
  }
}

function applyGather(picks) {
  picks.forEach(r => { gameState.player.resources[r]++; });
  return enforceResourceCap(gameState);
}

// ===== Visit Park =====

function visitPark(marketIndex) {
  const park = gameState.market[marketIndex];
  if (!park) return null;

  const cost = getEffectiveCost(park, gameState.player.parks, gameState.turn, gameState.player.gears);
  if (!RESOURCES.every(r => gameState.player.resources[r] >= cost[r])) return null;

  payResources(cost);
  gameState.player.parks.push(park);
  gameState.market.splice(marketIndex, 1);
  refillMarket();

  const hasRefund = gameState.player.gears.some(g => g.effectType === "visit_refund");
  const instantEffects = park.effects.filter(e => e.startsWith("I"));
  return { park, instantEffects, hasRefund };
}

// ===== Gear =====

function purchaseGear(gearId) {
  const idx = gameState.gearShop.findIndex(g => g.id === gearId);
  if (idx < 0) return null;

  const gear = gameState.gearShop[idx];
  if (!canAffordGear(gear)) return null;

  payResources(gear.cost);
  gameState.player.gears.push(gear);
  gameState.gearShop.splice(idx, 1);

  if (gear.effectType === "market_size") refillMarket();

  return gear;
}

// ===== Turn Management =====

function selectMissions(indices) {
  gameState.player.missions = indices.map(i => gameState.player.missionCandidates[i]);
  gameState.player.missionCandidates = [];
  gameState.phase = "playing";
  gameState.turn = 1;
  gameState.turnPhase = "bonus";
}

function startTurn() {
  gameState.turnPhase = "bonus";
  const descriptions = applyOngoingEffects(gameState);

  // โบนัสฤดูกาล
  const season = getCurrentSeason(gameState.turn);
  let seasonAmount = 1;
  if (gameState.player.gears.some(g => g.effectType === "season_double")) seasonAmount = 2;
  gameState.player.resources[season.bonusResource] += seasonAmount;
  descriptions.push(`${season.icon} ${season.name}: +${seasonAmount}${RESOURCE_EMOJI[season.bonusResource]}`);
  enforceResourceCap(gameState);

  gameState.turnPhase = "choose_action";
  return descriptions;
}

function endTurn() {
  gameState.selectedMarketIndex = -1;
  gameState.turn++;
  if (isGameOver()) {
    gameState.phase = "game_over";
    return true;
  }
  return false;
}

function isGameOver() {
  return gameState.turn > MAX_TURNS || (gameState.deck.length === 0 && gameState.market.length === 0);
}

// ===== Scoring =====

function calculateScore() {
  const parks = gameState.player.parks;
  const basePoints = parks.reduce((sum, p) => sum + p.points, 0);
  const endgameResults = calcEndgameEffects(gameState);
  const endgamePoints = endgameResults.reduce((sum, r) => sum + r.points, 0);

  const missionResults = gameState.player.missions.map(m => {
    const check = checkMission(m, parks);
    return {
      mission: m,
      ...check,
      bonus: check.passed ? m.bonus : 0
    };
  });
  const missionPoints = missionResults.reduce((sum, r) => sum + r.bonus, 0);

  const total = basePoints + endgamePoints + missionPoints;
  const rank = SOLO_RANKS.find(r => total >= r.min);

  return { basePoints, endgameResults, endgamePoints, missionResults, missionPoints, total, rank };
}

// ===== I3 Helper =====

function getAffordableTier1InMarket() {
  return gameState.market
    .map((p, i) => ({ park: p, index: i }))
    .filter(({ park }) => park.tier === 1 && canAfford(park));
}
