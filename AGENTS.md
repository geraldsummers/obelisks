# AGENTS.md

## Scope
This repo is the expert-pack content layer for Forge 1.20.1: KubeJS recipes/gates, quest content, config balancing, and validation tooling.

## Headlining Systems
- Bounded matter economy: geological deposits, Y-band locality, processing ladders.
- Dual crafting spines: Tinkers/Create tech spine and Blood Magic–parented magic spine.
- Adventure spine: obelisks/dimensions/combat feeding progression.
- Coin + villager/wares economy as a core progression lane.
- Local logistics thesis: trains/physical logistics first, AE2 local, OC2R intersite.
- Pillager campaign pressure as ongoing surface threat.
- Body systems loop: food, water quality, nutrition, and still-beating-heart bridge into Blood Magic.
- Tiered machine casing progression across mods.

## Where To Work
- `kubejs/server_scripts/`: progression and recipe overrides (authoritative)
- `kubejs/startup_scripts/`: startup hooks only
- `config/`, `defaultconfigs/`: mod behavior + server/world defaults
- `docs/`: audits, plans, validation evidence
- `tools/`: test/profiling/worldgen harness scripts
- `server-instance/`: dedicated server runner

## Core Rules
- Do not invent IDs; mark unknowns as `UNKNOWN`.
- Keep KubeJS Rhino-safe and deterministic (`kubejs:*` IDs).
- Prefer data-driven generation over copy-paste recipes.
- Remove bypasses; do not introduce deadlocks.
- Update docs when progression behavior changes.

## Validate Before Shipping
1. `node --check` for touched JS scripts.
2. Run relevant `tools/` harness/tests.
3. Confirm recipe visibility (EMI/JEI-facing paths).
4. Recheck known chokepoints (alloy, casing, grout, gates, coins/trades).
5. Record findings in `docs/`.

## Custom Mods Source (`/home/gerald/mcmods`)
Active pack-critical sources:
- `acid-vat` (`acid_vat`)
- `bound-to-matter-fixes` (`btmfixes`)
- `class-selector` (`classselector`)
- `create-transmission-loss` (`transmissionloss`)
- `cursed-biomes` (`cursedbiomes`)
- `dynamic-trees-malum` (`dtmalum`)
- `fission-reactor` (`fission_reactor`)
- `gases-and-plasmas` (`gases_and_plasmas`)
- `heat-sync` (`heatsync`)
- `liquid-coolant` (`liquid_coolant`)
- `meteor-obelisks` (`obelisks`)
- `oc2r-create-bridge` (`computerbridge`)
- `pillager-campaigns` (`pillagercampaigns`)
- `procedural-bouquets` (`procedural_bouquets`)
- `realistic-ores` (`realisticores`)
- `rpg-stats` (`rpgstats`)
- `settlement-roads` (`settlementroads`)
- `village-walls` (`villagewalls`)
Deferred:
- `deferred/oc2rwireless` (`oc2rwireless`)

Note: `settlementroads` appears in multiple dirs; use `/home/gerald/mcmods/settlement-roads` as canonical unless explicitly told otherwise.
