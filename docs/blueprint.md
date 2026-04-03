# 🗺️ PROJECT_BLUEPRINT: ISP Tycoon (v2.0)

> [!NOTE]
> This document is the living seed of the project. All design and architecture decisions must be validated against this vision. Updated to reflect actual codebase state after PRs #111, #112, #113.

---

## 1. North Star

The game is a **historical infrastructure simulator**. The player starts in the 1970s managing a garage-sized local network and must evolve technologically — through eras, hardware generations, and strategic topology decisions — until managing the global internet backbone in the modern era.

The focus is not clicking. It is **Topology vs. Demand**: routing capacity, signal physics, latency tradeoffs, and tech tree investment. Every decision is spatial and economic.

---

## 2. Current Architecture

```text
src/
├── config/
│   ├── eraConfig.json       # Era definitions: years, modifiers, unlock conditions (6 eras)
│   ├── techTreeConfig.json  # Tech tree: 8 technologies with modifiers and prerequisites
│   └── nodeRegistry.ts      # NODE_TEMPLATES array + ISPNodeType union (SSoT for node types)
│
├── store/
│   ├── useISPStore.ts       # Primary game store: nodes, links, economy, tick(), era state
│   └── useTechStore.ts      # Tech unlock state, modifier aggregation, TP spend
│
├── systems/
│   └── SimulationWorker.ts  # Web Worker: Dijkstra pathfinding, signal attenuation, revenue
│
└── components/
    ├── DebugConsole.tsx     # Dev overlay: economy cheats, era jump, tech tree bypass
    ├── NetworkNode.tsx      # SVG node renderer, drag-to-link interaction
    └── EraWrapper.tsx       # Era-aware UI shell / theme wrapper
```

> [!IMPORTANT]
> `ISPNodeType` is derived exclusively from `nodeRegistry.ts`. It is never hardcoded as a string literal union elsewhere in the codebase. All node type checks must go through `NODE_TEMPLATES`.

---

## 3. Core Loop (tick() Flow)

Each tick is initiated by a `setInterval` in the UI layer calling `useISPStore.tick()`:

```
useISPStore.tick()
  │
  ├─ 1. Compute canUpgradeEra (totalData + money vs. nextEra.unlockCondition)
  │
  ├─ 2. TP Generation
  │       tpGain = max(1, floor(allNodes × 0.1 + activeNodes × 0.4))
  │       activeNodes = nodes where traffic > 0
  │
  ├─ 3. Fetch aggregate tech modifiers from useTechStore.getAggregateModifiers()
  │
  ├─ 4. Apply tech bandwidth multiplier to all nodes and links (pre-postMessage)
  │       node.bandwidth = floor(baseBandwidth × multipliers.bandwidthMultiplier)
  │
  └─ 5. worker.postMessage({ nodes, links, rangeLevel, tickRate, era, techModifiers })

SimulationWorker (Web Worker)
  │
  ├─ 1. Dijkstra from node '0' (Core Gateway) across the link graph
  │       Edge weight = (distance / (link.bandwidth / 100)) × LATENCY_MOD
  │       LATENCY_MOD = techModifiers.latencyMultiplier
  │
  ├─ 2. Per-node physics:
  │       signalStrength = exp(-K_ATTENUATION × pathDistance)
  │       K_ATTENUATION = era.modifiers.signalAttenuation / 1000
  │       traffic = drift toward (bandwidth × targetScaling × signalStrength)
  │       health decay on loadRatio > 0.8, mitigated by RELIABILITY_MOD
  │
  ├─ 3. Per-node OPEX:
  │       layer 1: 50 × 1.1^(level-1) per tick
  │       layer 2: 20 × 1.1^(level-1) per tick
  │       layer 3: 10 × 1.1^(level-1) per tick
  │       Link OPEX: 5 per link per tick
  │
  └─ 4. Revenue (layer > 1, reachable nodes only):
          efficiency = rangeLevel match ? 0.8 : 0.2
          healthMultiplier = avgHealth < 50 ? 0.5 : 1.0
          nodeRevenue = traffic × efficiency × healthMultiplier
                        × (signalStrength / 100) × (QUALITY_MOD / 0.55) × dT
          Congested nodes (traffic > bandwidth): revenue × 0.5

worker.postMessage → useISPStore
  ├─ nodes (updated traffic, health, latency, signalStrength, hazard)
  ├─ revenue, totalMaintenanceCost → money delta (skipped in God Mode)
  ├─ totalLoad → totalData += floor(totalLoad / 10)
  ├─ networkHealth (average node health)
  └─ avgLatency
```

---

## 4. Node System

All node types are derived from `nodeRegistry.ts`. The `ISPNodeType` union is:

```typescript
type ISPNodeType = 'hub_local' | 'hub_regional' | 'terminal' | 'backbone'
// derived as: typeof NODE_TEMPLATES[number]['type']
```

| Type | Tier | Era Unlock | Scopes | baseBandwidth | baseCost | maxConnections |
|---|---|---|---|---|---|---|
| `terminal` | 0 | 70s | [1] | 100 | $100 | 3 |
| `hub_local` | 1 | 70s | [1, 2] | 500 | $500 | 8 |
| `hub_regional` | 2 | 80s | [2, 3] | 2,000 | $2,000 | 12 |
| `backbone` | 3 | 90s | [3, 4] | 10,000 | $10,000 | 20 |

**Link hierarchy rule:** Only adjacent-tier connections are permitted (diff = 1). Peer links between nodes of the same tier ≥ 1 are allowed. God Mode bypasses all validation.

**Node markers on `ISPNode`:**
- `isCore: true` — Spawned at game start, cannot be deleted
- `isDevSpawned: true` — Spawned via debug tools, can be deleted via `removeNode()`

---

## 5. Tech Tree System

Managed by `useTechStore`. State lives outside `useISPStore` to keep concerns separated.

### Technologies (8 total)

| ID | Era | TP Cost | Prerequisites | Key Modifier |
|---|---|---|---|---|
| `copper_standard` | 70s | 0 | — | Baseline (starts unlocked) |
| `manual_switching` | 70s | 150 | copper_standard | latency ×2.0 |
| `coaxial_early` | 70s | 300 | copper_standard | bw ×1.8, dist 600km |
| `tdm_basic` | 70s | 500 | coaxial_early | cap ×2.0 |
| `coaxial_mature` | 80s | 800 | coaxial_early | bw ×3.0, dist 1000km |
| `digital_switching` | 80s | 1200 | manual_switching + coaxial_early | latency ×0.5 |
| `isdn_early` | 80s | 2500 | digital_switching | bw ×5.0 |
| `fiber_experimental` | 80s | 4000 | coaxial_mature + digital_switching | bw ×10.0, latency ×0.3 |

### Modifier Merging Rules (`getAggregateModifiers`)

- **Multiplicative:** `bandwidthMultiplier`, `latencyMultiplier`, `capacityMultiplier`
- **Highest-value wins:** `maxDistance`, `signalQuality`, `connectionReliability`
- **Floor:** `latencyMultiplier` is floored at `0.1` (cannot reduce latency below 10% of baseline)

### TP Currency

- Earned passively each tick: `max(1, floor(allNodes × 0.1 + activeNodes × 0.4))`
- Spent via `unlockTech(id, currentEra, currentTP, addTechPoints)` — subtracts TP atomically
- `canUnlockTech()` validates: not already unlocked, prerequisites met, era reached, TP sufficient

### Era Advancement Gate

`canAdvanceEra()` checks `totalData >= nextEra.unlockCondition.totalData && money >= nextEra.unlockCondition.money`. This is separate from tech unlock — eras and tech tree are independent progressions.

---

## 6. Business Formulas

### Link Cost
```
cost = 100 + (distance × 1.5)
maxDistance = techModifiers.maxDistance  (default 300, copper_standard baseline)
```

### Node Upgrade Cost & Bandwidth
```
upgradeCost = floor(50 × 1.15^level)
newBandwidth = floor(baseBandwidth × 1.4^level)
```

### TP Generation (per tick)
```
tpGain = max(1, floor(allNodes × 0.1 + activeNodes × 0.4))
```

### Revenue (per tick, per node where layer > 1 and reachable)
```
efficiency     = node.layer === rangeLevel ? 0.8 : 0.2
healthMult     = avgNetworkHealth < 50 ? 0.5 : 1.0
qualityMult    = techModifiers.signalQuality / 0.55
nodeRevenue    = traffic × efficiency × healthMult × (signalStrength/100) × qualityMult × dT
congestion     = traffic > bandwidth → nodeRevenue × 0.5
```

### Era Unlock Conditions

| Era | totalData | money |
|---|---|---|
| 70s | 0 | $0 (start) |
| 80s | 5,000 | $20,000 |
| 90s | 50,000 | $100,000 |
| 00s | 250,000 | $300,000 |
| 2010s | 1,000,000 | $1,500,000 |
| modern | 5,000,000 | $5,000,000 |

---

## 7. Guardrails

- **No hardcoded node types** — `ISPNodeType` is always derived from `NODE_TEMPLATES` in `nodeRegistry.ts`. String literal unions must not appear in store or worker code.
- **Store is SSoT** — No persistent business logic in React components. Components read state; they do not compute it.
- **Tech modifiers applied at read time** — `useTechStore.getAggregateModifiers()` is called in `tick()` before `postMessage`. The registry and store state are never mutated by tech unlocks; only `unlockedTechIds[]` changes.
- **All physics constants from `eraConfig.json`** — `signalAttenuation`, `revenueMultiplier`, `maintenanceCost` come from the config, not hardcoded in the worker. The worker scales attenuation as `signalAttenuation / 1000`.
- **Worker is stateless** — `SimulationWorker.ts` receives all inputs per message and returns all outputs per message. No shared memory.
- **Coordinate integrity** — Node positions use absolute SVG coordinates. ViewBox snapping (`RANGE_PRESETS`) handles zoom, never coordinate transforms.

---

## 8. Active Roadmap

Issues in current priority order:

| Priority | Issue | Status |
|---|---|---|
| — | [#115] Debug Console Tech Tree Controls | Complete (pending merge) |
| 1 | [#114] Era Milestone Conditions | Queued |
| 2 | [#116] Tech Tree UI | Queued |
| 3 | [#86] Demand Cell Heatmap Engine | Queued |
| 4 | [#87] Local Construction Mechanics | Queued |

---

*Single Source of Truth — v2.0 [post-PR #111, #112, #113]*
