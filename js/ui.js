// ===== UI Controller =====

document.addEventListener("DOMContentLoaded", () => {
  validateData();
  setupEventListeners();
});

// ===== Screen Management =====

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
}

function showModal(modalId) {
  document.getElementById(modalId).classList.remove("hidden");
}

function hideModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

// ===== Event Listeners =====

function setupEventListeners() {
  document.getElementById("btn-start").addEventListener("click", onStartGame);
  document.getElementById("btn-how-to-play").addEventListener("click", () => showModal("modal-rules"));
  document.getElementById("btn-close-rules").addEventListener("click", () => hideModal("modal-rules"));
  document.getElementById("btn-confirm-missions").addEventListener("click", onConfirmMissions);
  document.getElementById("btn-gather").addEventListener("click", onOpenGather);
  document.getElementById("btn-visit").addEventListener("click", onVisitPark);
  document.getElementById("btn-gather-cancel").addEventListener("click", () => hideModal("modal-gather"));
  document.getElementById("btn-gather-confirm").addEventListener("click", onConfirmGather);
  document.getElementById("btn-replay").addEventListener("click", onStartGame);

  document.querySelectorAll(".gather-mode").forEach(btn => {
    btn.addEventListener("click", () => onSwitchGatherMode(btn.dataset.mode));
  });
}

// ===== Title → Mission Select =====

function onStartGame() {
  initGame();
  renderMissionSelect();
  showScreen("screen-mission");
}

// ===== Mission Select =====

const selectedMissionIndices = new Set();

function renderMissionSelect() {
  selectedMissionIndices.clear();
  const container = document.getElementById("mission-candidates");
  container.innerHTML = "";

  gameState.player.missionCandidates.forEach((m, i) => {
    const card = document.createElement("div");
    card.className = "mission-card";
    card.dataset.index = i;
    card.innerHTML = `
      <span class="difficulty-badge ${m.difficulty}">${m.difficulty === "easy" ? "ง่าย +3" : m.difficulty === "medium" ? "กลาง +5" : "ยาก +7"}</span>
      <div class="mission-name">${m.name}</div>
      <div class="mission-bonus">+${m.bonus} แต้ม</div>
      <div class="mission-desc">${m.desc}</div>
    `;
    card.addEventListener("click", () => toggleMission(i));
    container.appendChild(card);
  });

  updateMissionCount();
}

function toggleMission(index) {
  if (selectedMissionIndices.has(index)) {
    selectedMissionIndices.delete(index);
  } else if (selectedMissionIndices.size < 2) {
    selectedMissionIndices.add(index);
  }

  document.querySelectorAll(".mission-card").forEach((card, i) => {
    card.classList.toggle("selected", selectedMissionIndices.has(i));
  });

  updateMissionCount();
}

function updateMissionCount() {
  document.getElementById("mission-count").textContent = `เลือกแล้ว ${selectedMissionIndices.size}/2`;
  document.getElementById("btn-confirm-missions").disabled = selectedMissionIndices.size !== 2;
}

function onConfirmMissions() {
  selectMissions([...selectedMissionIndices]);
  showScreen("screen-game");
  onNewTurn();
}

// ===== Game Board Rendering =====

function render() {
  renderTurnInfo();
  renderResourceBar();
  renderMarket();
  renderPlayerParks();
  renderPlayerMissions();
  updateActionButtons();
}

function renderTurnInfo() {
  const turn = Math.min(gameState.turn, MAX_TURNS);
  document.getElementById("turn-label").textContent = `เทิร์น ${turn}/${MAX_TURNS}`;

  const phaseLabel = document.getElementById("phase-label");
  if (gameState.turnPhase === "choose_action") {
    phaseLabel.textContent = "เลือกการกระทำ";
  } else if (gameState.turnPhase === "bonus") {
    phaseLabel.textContent = "รับโบนัส";
  }
}

function renderResourceBar() {
  const bar = document.getElementById("resource-bar");
  const res = gameState.player.resources;
  const total = getResourceTotal(res);

  bar.innerHTML = RESOURCES.map(r =>
    `<span class="resource-item">${RESOURCE_EMOJI[r]} <strong>×${res[r]}</strong></span>`
  ).join("") + `<span class="resource-total">(${total}/${MAX_RESOURCES})</span>`;
}

function renderMarket() {
  const container = document.getElementById("market");
  container.innerHTML = "";

  gameState.market.forEach((park, i) => {
    const affordable = canAfford(park);
    const card = createParkCard(park, false);
    card.dataset.marketIndex = i;

    if (!affordable) card.classList.add("unaffordable");
    if (i === gameState.selectedMarketIndex) card.classList.add("selected");

    card.addEventListener("click", () => {
      if (!affordable) return;
      gameState.selectedMarketIndex = (gameState.selectedMarketIndex === i) ? -1 : i;
      renderMarket();
      updateActionButtons();
    });

    container.appendChild(card);
  });
}

function createParkCard(park, mini) {
  if (mini) {
    const card = document.createElement("div");
    card.className = "park-card-mini";
    card.dataset.region = park.region;
    const tierStars = "★".repeat(park.tier);
    card.innerHTML = `
      <span class="mini-header">${park.region}</span>
      <div class="mini-name">${park.name}</div>
      <div class="mini-tier">${tierStars} ${park.points}pt</div>
    `;
    return card;
  }

  const card = document.createElement("div");
  card.className = "park-card";
  card.dataset.region = park.region;

  const tierStars = "★".repeat(park.tier);
  const cost = getEffectiveCost(park, gameState.player.parks);
  const costEmoji = RESOURCES.map(r => RESOURCE_EMOJI[r].repeat(cost[r])).join("");

  let effectsHTML = "";
  if (park.effects.length > 0) {
    effectsHTML = park.effects.map(eff => {
      const info = EFFECT_INFO[eff];
      return `<span class="effect-badge ${info.type}" title="${info.desc}">${info.name}</span>`;
    }).join("");
  }

  card.innerHTML = `
    <div class="card-header">
      <span class="card-region">${park.region}</span>
      <span class="card-tier">${tierStars}</span>
    </div>
    <div class="card-points">${park.points}</div>
    <div class="card-body">
      <div class="card-name">${park.name}</div>
      <div class="card-desc">${park.desc}</div>
      <div class="card-cost">${costEmoji}</div>
      <div class="card-effects">${effectsHTML}</div>
    </div>
  `;
  return card;
}

function renderPlayerParks() {
  const container = document.getElementById("player-parks");
  const parks = gameState.player.parks;
  document.getElementById("park-count").textContent = `(${parks.length} ใบ)`;

  if (parks.length === 0) {
    container.innerHTML = '<div class="player-parks-empty">ยังไม่มีอุทยาน — เริ่มสำรวจเลย!</div>';
    return;
  }

  container.innerHTML = "";
  parks.forEach(p => container.appendChild(createParkCard(p, true)));
}

function renderPlayerMissions() {
  const container = document.getElementById("player-missions");
  container.innerHTML = "";

  gameState.player.missions.forEach(m => {
    const check = checkMission(m, gameState.player.parks);
    const mini = document.createElement("div");
    mini.className = "mission-mini" + (check.passed ? " completed" : "");
    mini.innerHTML = `
      <div class="mini-mission-name">${m.name} <span class="mini-mission-bonus">+${m.bonus}</span></div>
      <div class="mini-mission-desc">${m.desc}</div>
      <div class="mini-mission-desc">${check.passed ? "✅ สำเร็จ" : `📊 ${check.current}/${check.target}`}</div>
    `;
    container.appendChild(mini);
  });
}

function updateActionButtons() {
  const btnVisit = document.getElementById("btn-visit");
  const hasSelection = gameState.selectedMarketIndex >= 0;
  const park = hasSelection ? gameState.market[gameState.selectedMarketIndex] : null;
  btnVisit.disabled = !hasSelection || !park || !canAfford(park);
}

// ===== Turn Flow =====

function onNewTurn() {
  if (gameState.turn > MAX_TURNS || isGameOver()) {
    onGameOver();
    return;
  }

  const bonusDescs = startTurn();

  const banner = document.getElementById("bonus-banner");
  if (bonusDescs.length > 0) {
    banner.textContent = "🎁 โบนัสต้นเทิร์น: " + bonusDescs.join(", ");
    banner.classList.remove("hidden");
    setTimeout(() => banner.classList.add("hidden"), 3000);
  } else {
    banner.classList.add("hidden");
  }

  render();
}

// ===== Gather =====

let gatherPicks = [];
let gatherMode = "diverse";

function onOpenGather() {
  gatherPicks = [];
  gatherMode = "diverse";
  renderGatherModal();
  showModal("modal-gather");
}

function onSwitchGatherMode(mode) {
  gatherMode = mode;
  gatherPicks = [];
  renderGatherModal();
}

function renderGatherModal() {
  document.querySelectorAll(".gather-mode").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mode === gatherMode);
  });

  const picker = document.getElementById("gather-picker");
  picker.innerHTML = RESOURCES.map(r => `
    <div class="resource-btn" data-resource="${r}">
      ${RESOURCE_EMOJI[r]}
      <span class="res-label">${RESOURCE_NAMES[r]}</span>
    </div>
  `).join("");

  picker.querySelectorAll(".resource-btn").forEach(btn => {
    btn.addEventListener("click", () => onPickResource(btn.dataset.resource));
  });

  updateGatherPreview();
}

function onPickResource(resource) {
  const maxPicks = gatherMode === "diverse" ? 3 : 2;
  if (gatherPicks.length >= maxPicks) return;

  if (gatherMode === "diverse") {
    if (gatherPicks.includes(resource)) return;
  } else {
    if (gatherPicks.length > 0 && gatherPicks[0] !== resource) {
      gatherPicks = [];
    }
  }

  gatherPicks.push(resource);
  updateGatherPreview();
}

function updateGatherPreview() {
  const preview = document.getElementById("gather-preview");
  preview.textContent = gatherPicks.map(r => RESOURCE_EMOJI[r]).join(" ");

  const maxPicks = gatherMode === "diverse" ? 3 : 2;
  document.getElementById("btn-gather-confirm").disabled = gatherPicks.length !== maxPicks;
}

function onConfirmGather() {
  if (!validateGather(gatherPicks, gatherMode)) return;

  const excess = applyGather(gatherPicks);
  hideModal("modal-gather");

  if (excess > 0) {
    handleResourceOverflow(excess);
  } else {
    finishAction();
  }
}

function handleResourceOverflow(excess) {
  let remaining = excess;
  const pickToDiscard = () => {
    if (remaining <= 0) { finishAction(); return; }

    const choices = document.getElementById("effect-choices");
    choices.innerHTML = "";
    RESOURCES.forEach(r => {
      if (gameState.player.resources[r] > 0) {
        const btn = document.createElement("div");
        btn.className = "effect-choice";
        btn.textContent = `${RESOURCE_EMOJI[r]} ${RESOURCE_NAMES[r]} (${gameState.player.resources[r]})`;
        btn.addEventListener("click", () => {
          gameState.player.resources[r]--;
          remaining--;
          if (remaining > 0) pickToDiscard();
          else { hideModal("modal-effect"); finishAction(); }
        });
        choices.appendChild(btn);
      }
    });

    document.getElementById("effect-title").textContent = "ทรัพยากรเกิน!";
    document.getElementById("effect-desc").textContent = `ถือได้สูงสุด ${MAX_RESOURCES} ชิ้น — เลือกทิ้ง ${remaining} ชิ้น`;
    document.getElementById("btn-effect-confirm").style.display = "none";
    showModal("modal-effect");
  };

  pickToDiscard();
}

// ===== Visit =====

function onVisitPark() {
  const idx = gameState.selectedMarketIndex;
  if (idx < 0) return;

  const result = visitPark(idx);
  if (!result) return;

  gameState.selectedMarketIndex = -1;

  if (result.instantEffects.length > 0) {
    resolveInstantEffects(result.instantEffects, 0, () => finishAction());
  } else {
    finishAction();
  }
}

// ===== Instant Effect Resolution =====

function resolveInstantEffects(effects, index, callback) {
  if (index >= effects.length) { callback(); return; }

  const eff = effects[index];
  const next = () => resolveInstantEffects(effects, index + 1, callback);

  if (eff === "I1") resolveI1(next);
  else if (eff === "I2") resolveI2(next);
  else if (eff === "I3") resolveI3(next);
  else next();
}

function resolveI1(callback) {
  const top3 = gameState.deck.splice(0, Math.min(3, gameState.deck.length));
  if (top3.length === 0) { callback(); return; }

  document.getElementById("effect-title").textContent = "🔍 ค้นพบ!";
  document.getElementById("effect-desc").textContent = "เลือก 1 ใบ เพิ่มเข้ากองกลาง";

  const choices = document.getElementById("effect-choices");
  choices.innerHTML = "";
  let selected = -1;

  top3.forEach((park, i) => {
    const card = createParkCard(park, false);
    card.style.width = "140px";
    card.style.fontSize = "0.8rem";
    card.addEventListener("click", () => {
      selected = i;
      choices.querySelectorAll(".park-card").forEach((c, j) => {
        c.classList.toggle("selected", j === i);
      });
      document.getElementById("btn-effect-confirm").disabled = false;
    });
    choices.appendChild(card);
  });

  const confirmBtn = document.getElementById("btn-effect-confirm");
  confirmBtn.style.display = "";
  confirmBtn.disabled = true;
  confirmBtn.onclick = () => {
    const chosen = top3.splice(selected, 1)[0];
    gameState.market.push(chosen);
    top3.forEach(p => gameState.deck.push(p));
    hideModal("modal-effect");
    render();
    callback();
  };

  showModal("modal-effect");
}

function resolveI2(callback) {
  let picks = [];

  document.getElementById("effect-title").textContent = "⛺ ตั้งแคมป์!";
  document.getElementById("effect-desc").textContent = "เลือกทรัพยากร 2 ชิ้น (แบบใดก็ได้)";

  const choices = document.getElementById("effect-choices");
  choices.innerHTML = "";

  RESOURCES.forEach(r => {
    const btn = document.createElement("div");
    btn.className = "effect-choice";
    btn.innerHTML = `${RESOURCE_EMOJI[r]}<br>${RESOURCE_NAMES[r]}`;
    btn.addEventListener("click", () => {
      if (picks.length < 2) {
        picks.push(r);
        btn.classList.add("selected");
      }
      document.getElementById("btn-effect-confirm").disabled = picks.length !== 2;
    });
    choices.appendChild(btn);
  });

  const confirmBtn = document.getElementById("btn-effect-confirm");
  confirmBtn.style.display = "";
  confirmBtn.disabled = true;
  confirmBtn.onclick = () => {
    picks.forEach(r => gameState.player.resources[r]++);
    enforceResourceCap(gameState);
    hideModal("modal-effect");
    render();
    callback();
  };

  showModal("modal-effect");
}

function resolveI3(callback) {
  const affordable = getAffordableTier1InMarket();
  if (affordable.length === 0) {
    callback();
    return;
  }

  document.getElementById("effect-title").textContent = "🛤️ เส้นทางลัด!";
  document.getElementById("effect-desc").textContent = "เลือก ★ 1 ใบ สำรวจทันที (จ่าย cost ตามปกติ) หรือข้าม";

  const choices = document.getElementById("effect-choices");
  choices.innerHTML = "";
  let selected = -1;

  affordable.forEach(({ park, index }) => {
    const card = createParkCard(park, false);
    card.style.width = "140px";
    card.style.fontSize = "0.8rem";
    card.addEventListener("click", () => {
      selected = index;
      choices.querySelectorAll(".park-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      document.getElementById("btn-effect-confirm").disabled = false;
    });
    choices.appendChild(card);
  });

  const skipBtn = document.createElement("div");
  skipBtn.className = "effect-choice";
  skipBtn.textContent = "ข้าม";
  skipBtn.addEventListener("click", () => {
    hideModal("modal-effect");
    callback();
  });
  choices.appendChild(skipBtn);

  const confirmBtn = document.getElementById("btn-effect-confirm");
  confirmBtn.style.display = "";
  confirmBtn.disabled = true;
  confirmBtn.onclick = () => {
    const result = visitPark(selected);
    hideModal("modal-effect");
    if (result && result.instantEffects.length > 0) {
      render();
      resolveInstantEffects(result.instantEffects, 0, callback);
    } else {
      render();
      callback();
    }
  };

  showModal("modal-effect");
}

// ===== End Turn =====

function finishAction() {
  render();
  const isOver = endTurn();
  if (isOver) {
    onGameOver();
  } else {
    onNewTurn();
  }
}

// ===== Game Over =====

function onGameOver() {
  gameState.phase = "game_over";
  const score = calculateScore();

  document.getElementById("rank-display").textContent = score.rank.label;

  const breakdown = document.getElementById("score-breakdown");
  let rows = `<div class="score-row"><span class="score-label">แต้มพื้นฐาน (${gameState.player.parks.length} ใบ)</span><span class="score-value">${score.basePoints}</span></div>`;

  score.endgameResults.forEach(r => {
    rows += `<div class="score-row"><span class="score-label">${r.name}</span><span class="score-value">+${r.points}</span></div>`;
  });

  score.missionResults.forEach(r => {
    const cls = r.passed ? "mission-pass" : "mission-fail";
    const status = r.passed ? `✅ +${r.bonus}` : `❌ ${r.current}/${r.target}`;
    rows += `<div class="score-row"><span class="score-label">${r.mission.name}</span><span class="score-value ${cls}">${status}</span></div>`;
  });

  rows += `<div class="score-row total"><span class="score-label">รวม</span><span class="score-value">${score.total} แต้ม</span></div>`;
  breakdown.innerHTML = rows;

  document.getElementById("final-score").textContent = `${score.total} แต้ม`;

  showScreen("screen-gameover");
}
