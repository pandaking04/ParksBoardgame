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
    },
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
  gameState.phase = "mission_select";
}

function refillMarket() {
  while (gameState.market.length < MARKET_SIZE && gameState.deck.length > 0) {
    gameState.market.push(gameState.deck.shift());
  }
}

// ===== Resources =====

function getResourceTotal(resources) {
  return RESOURCES.reduce((sum, r) => sum + resources[r], 0);
}

function enforceResourceCap(state) {
  const total = getResourceTotal(state.player.resources);
  if (total > MAX_RESOURCES) {
    const excess = total - MAX_RESOURCES;
    return excess;
  }
  return 0;
}

function canAfford(park) {
  const cost = getEffectiveCost(park, gameState.player.parks);
  return RESOURCES.every(r => gameState.player.resources[r] >= cost[r]);
}

function payResources(cost) {
  RESOURCES.forEach(r => {
    gameState.player.resources[r] -= cost[r];
  });
}

// ===== Gather =====

function validateGather(picks, mode) {
  if (mode === "diverse") {
    if (picks.length !== 3) return false;
    const unique = new Set(picks);
    return unique.size === 3;
  } else {
    if (picks.length !== 2) return false;
    return picks[0] === picks[1];
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

  const cost = getEffectiveCost(park, gameState.player.parks);
  if (!RESOURCES.every(r => gameState.player.resources[r] >= cost[r])) return null;

  payResources(cost);
  gameState.player.parks.push(park);
  gameState.market.splice(marketIndex, 1);
  refillMarket();

  const instantEffects = park.effects.filter(e => e.startsWith("I"));
  return { park, instantEffects };
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
