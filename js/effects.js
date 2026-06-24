// ===== Effect Resolution =====

function applyOngoingEffects(state) {
  const bonuses = { forest: 0, water: 0, mountain: 0, activity: 0 };
  const descriptions = [];

  state.player.parks.forEach(park => {
    park.effects.forEach(eff => {
      if (eff === "O1") { bonuses.forest++; descriptions.push(`${park.name}: +1🌳`); }
      if (eff === "O2") { bonuses.water++; descriptions.push(`${park.name}: +1🌊`); }
      if (eff === "O3") { bonuses.mountain++; descriptions.push(`${park.name}: +1⛰️`); }
    });
  });

  RESOURCES.forEach(r => {
    state.player.resources[r] += bonuses[r];
  });

  enforceResourceCap(state);
  return descriptions;
}

function getEffectiveCost(park, playerParks) {
  const cost = { ...park.cost };
  const hasDiscount = playerParks.some(p =>
    p.effects.includes("O4") && p.region === park.region
  );

  if (hasDiscount) {
    let reduced = false;
    const order = ["activity", "mountain", "water", "forest"];
    for (const r of order) {
      if (cost[r] > 0) {
        cost[r]--;
        reduced = true;
        break;
      }
    }
    const total = RESOURCES.reduce((sum, r) => sum + cost[r], 0);
    if (total < 1 && reduced) {
      cost[order.find(r => park.cost[r] > 0) || "forest"]++;
    }
  }
  return cost;
}

function getCostTotal(cost) {
  return RESOURCES.reduce((sum, r) => sum + cost[r], 0);
}

// ===== Endgame Scoring =====

function calcEndgameEffects(state) {
  const results = [];
  const regionCounts = {};
  state.player.parks.forEach(p => {
    regionCounts[p.region] = (regionCounts[p.region] || 0) + 1;
  });

  state.player.parks.forEach(park => {
    park.effects.forEach(eff => {
      if (eff === "S1") {
        let bonus = 0;
        Object.values(regionCounts).forEach(count => {
          bonus += Math.floor(count / 3);
        });
        if (bonus > 0) results.push({ name: `${park.name} (นักสะสม)`, points: bonus });
      }
      if (eff === "S2") {
        let bonus = 0;
        Object.values(regionCounts).forEach(count => {
          if (count >= 3) bonus++;
        });
        if (bonus > 0) results.push({ name: `${park.name} (นักเดินทาง)`, points: bonus });
      }
      if (eff === "S3") {
        results.push({ name: `${park.name} (ผู้พิทักษ์)`, points: 2 });
      }
    });
  });

  return results;
}

// ===== Mission Checking =====

function checkMission(mission, parks) {
  const p = mission.params;
  switch (mission.checkType) {
    case "cost_has_resource": {
      const count = parks.filter(pk => pk.cost[p.resource] > 0).length;
      return { passed: count >= p.min, current: count, target: p.min };
    }
    case "region_count": {
      const count = parks.filter(pk => pk.region === p.region).length;
      return { passed: count >= p.min, current: count, target: p.min };
    }
    case "tier_count": {
      const count = parks.filter(pk => pk.tier === p.tier).length;
      return { passed: count >= p.min, current: count, target: p.min };
    }
    case "tier_min_count": {
      const count = parks.filter(pk => pk.tier >= p.minTier).length;
      return { passed: count >= p.min, current: count, target: p.min };
    }
    case "multi_region": {
      const regionCounts = {};
      parks.forEach(pk => { regionCounts[pk.region] = (regionCounts[pk.region] || 0) + 1; });
      const qualifying = Object.values(regionCounts).filter(c => c >= p.minPerRegion).length;
      return { passed: qualifying >= p.regionsNeeded, current: qualifying, target: p.regionsNeeded };
    }
    case "any_region_max": {
      const regionCounts = {};
      parks.forEach(pk => { regionCounts[pk.region] = (regionCounts[pk.region] || 0) + 1; });
      const maxCount = Math.max(0, ...Object.values(regionCounts));
      return { passed: maxCount >= p.min, current: maxCount, target: p.min };
    }
    case "tier4_multi_region": {
      const t4regions = new Set(parks.filter(pk => pk.tier === 4).map(pk => pk.region));
      return { passed: t4regions.size >= p.regionsNeeded, current: t4regions.size, target: p.regionsNeeded };
    }
    case "total_parks": {
      return { passed: parks.length >= p.min, current: parks.length, target: p.min };
    }
    case "cost_has_both": {
      const count = parks.filter(pk => pk.cost[p.resource1] > 0 && pk.cost[p.resource2] > 0).length;
      return { passed: count >= p.min, current: count, target: p.min };
    }
    case "tier4_plus_tier1_region": {
      const t4parks = parks.filter(pk => pk.tier === 4);
      for (const t4 of t4parks) {
        const t1count = parks.filter(pk => pk.tier === 1 && pk.region === t4.region).length;
        if (t1count >= p.tier1Min) return { passed: true, current: t1count, target: p.tier1Min };
      }
      let best = 0;
      t4parks.forEach(t4 => {
        const c = parks.filter(pk => pk.tier === 1 && pk.region === t4.region).length;
        if (c > best) best = c;
      });
      return { passed: false, current: best, target: p.tier1Min };
    }
    default:
      return { passed: false, current: 0, target: 0 };
  }
}
