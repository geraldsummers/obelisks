# Machine Casing Craft Ecosystem Audit

Date: 2026-05-16

## Summary

The casing ladder is now treated as a repeated factory material rather than a single milestone key. The previous state had strong tier identity, but most tiers only consumed casings in a small number of representative machines. The new expansion pass adds explicit EMI-facing recipes for block-like machines, infrastructure, and tier-defining components.

Implementation files:

- `kubejs/server_scripts/30_recipe_replace/136_machine_casing_ecosystem_expansion.js`
- `kubejs/config/btm_expert_graph_catalog.json`
- `tools/pack_test_suite.mjs`

The existing runtime recipe dump still does not include KubeJS-added recipes, so this audit uses authored KubeJS as the source of truth for casing usage counts.

The FTB Quests book has been intentionally removed from the authored pack source. Validation now treats an empty quest book as intentional and skips quest-only coverage checks.

## Direct Casing Recipe Coverage

| Tier | Identity | Explicit recipes in new pass | Notes |
|---|---:|---:|---|
| Seared | early molten/passive item handling | 17 | Smeltery, melter, heater, casting, drains, tanks, gauges, passive Create item utilities |
| Scorched | high-heat foundry/passive fluid handling | 17 | Foundry, alloyer, scorched casting, ducts, tank/gauge, anvil, passive Create fluid utilities |
| Andesite | Create kinetic workcells | 12 | Millstone, press/mixer/saw/drill/crafter, pistons, SU controls |
| Brass | precision automation and stronger SU generation | 17 | Steam engine, arms, observers, smart logistics, displays, package/stock tools, diesel engines |
| Airtight | PNCR pressure/refining/assembly | 15 | Tubes, valves, refinery, thermo plant, fluid mixer, assembly, advanced compressor |
| Electrical | electricity, metering, and heat conversion | 17 | Batteries, motors, generator parts, relays, gauges, connectors, energisers |
| Circuited | programmable control | 15 | OC2R computers, hub, monitor, drives, interfaces, cards, CPU/memory parts |
| Space | sealed rocket-era systems | 15 | Electrolysis, liquefaction, oxygen sealing, rocket controls, tanks, suit support |
| Raw Impossible | unfinished AE2 body components | 6 | High cell housings and spatial/storage components only |
| Impossible | AE2 controller-tier authority | 15 | Controller, drive, interfaces, IO, assembler, pattern, wireless, planes |

## Deadlock Guards

These are intentionally preserved:

- `create:deployer` remains before Andesite casing because Create casing bootstrap depends on deployed casings.
- Passive Create utility blocks that do not consume SU, such as basins, depots, chutes, tanks, drains, and spouts, are allowed before Andesite through Seared/Scorched casing.
- Water wheels and windmill bearings remain the Andesite entry point for passive SU generation; later generator blocks, including steam and diesel, stay Brass or later.
- Basic PNCR pressure materials remain before Airtight casing; Airtight then unlocks pressure chamber, refinery, and assembly surfaces.
- Power Grid precursor parts used by Electrical casing are not gated by Electrical casing.
- `oc2r:network_connector` remains before Circuited casing because Circuited casing consumes it.
- `creatingspace:rocket_engineer_table` and `creatingspace:rocket_casing` remain before Space casing because Space casing consumes rocket casing.
- AE2 charger, inscriber, and processor precursor work remain before Impossible casing.
- Raw Impossible casing is used for components, not full AE2 controller-tier machines.

## Validation Targets

- Each normal casing has at least 8 meaningful direct craft uses.
- Late tiers have 12 or more direct craft uses where the mod surface exists.
- Raw Impossible has at least 4 component uses without becoming a functional block tier.
- Every optional output recipe is guarded by `Item.exists` to avoid missing-mod load errors.
- The new pass should pass `node --check` and pack recipe validation.
