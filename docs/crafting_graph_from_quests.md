# Crafting Graph from Quests (Wave A)

Scope:
- `config/ftbquests/quests/chapters/*.snbt` (generated quest graph state)
- `tools/generate_expert_quest_book.mjs` (authoritative chapter/quest source and naming transforms)

Notes:
- In script source, many nodes are named `* Gate`; in generated SNBT they are displayed as `* Milestone` (`displayQuestTitle` rewrites `Gate -> Milestone`).
- This document extracts recipe-driving targets only; no recipe files were edited.

## Ordered Gate Targets (Progression Spine)

1. `SO_EXIT_TECH` -> `tconstruct:seared_brick`
2. `MG_TCON` (shown as Tinkers Metallurgy Milestone) -> `tconstruct:foundry_controller`
3. `MG_CREATE` (Create Manufacturing Milestone) -> `kubejs:brass_machine_casing`
4. `MG_POWER` (Grid Power Milestone) -> `powergrid:generator_housing`
5. `MG_OC2R` (OC2R Control Milestone) -> `oc2r:computer`
6. `MG_SPACE` (Space Logistics Milestone) -> `creatingspace:chemical_synthesizer`
7. `MG_MAGIC` (Blood Magic Milestone) -> `bloodmagic:etherealslate`
8. `MG_ECONOMY` (Village Economy Milestone) -> `wares:completed_delivery_agreement`
9. `MG_SYNTHESIS` (Synthesis Milestone) -> `acid_vat:acid_vat`
10. `MG_AE2` -> `ae2:controller`
11. `MG_POST_AE2` -> `advanced_ae:quantum_structure`

Supporting gate-like exits that feed the spine:
- `SO_EXIT_MAGIC` -> `rpgstats:still_beating_heart`
- `S1_SYNTHESIS_EXIT` -> `chemlib:osmium_plate`
- `SH_EXIT_GRID` -> `powergrid:conductive_casing`

## Ordered Capstone Targets

Create/Logistics capstones (explicit `Capstone:` quests):
1. `C1_FOUNDATION_CAPSTONE` -> `create:andesite_casing`, `create:water_wheel`, `create:windmill_bearing`
2. `C2_COMPONENT_CAPSTONE` -> `kubejs:andesite_machine_casing`, `create:mechanical_press`, `create:mechanical_mixer`
3. `CB_CAPSTONE` -> `create:mechanical_arm`, `create:stockpile_switch`, `kubejs:brass_machine_casing`
4. `CL_CAPSTONE` -> `create:packager`, `create:stock_ticker`, `createadvlogistics:package_content_filter`
5. `C3_CAPSTONE` -> `create:track_station`, `create:schedule`, `oc2r:redstone_interface`

Other functional capstones encoded in descriptions/titles:
- `FI_ROUTE_TABLE` (Food I kitchen baseline)
- `FII_STOCKPILE` (Food II pantry baseline)
- `BRW_EXTRACTION_SUITE` (brew extract pipeline)
- `PE_ROUTE_DOSSIER` (potion route readiness)
- `FC_EXPEDITION_MENU` (food planning board)
- `PC_BATTLE_STANDARD` (pillager pressure -> economy loop)
- `TA_ROUTE_ARMORY` (Tinkers arsenal completion)

## Catalogue Targets

Tinkers catalogue/showcase:
- `TC_SHOWCASE_CORE_TOOLS`
- `TC_SHOWCASE_MELEE`
- `TC_SHOWCASE_RANGED`
- `TC_SHOWCASE_ARMOR`
- `TC_SHOWCASE_LATE_TOOLS`

Food catalogue/showcase:
- `FB_SHOWCASE_VANILLA`
- `FB_SHOWCASE_FARMERS`
- `FB_SHOWCASE_DRINKS`
- `FB_SHOWCASE_FIELD_CROPS`
- `FB_SHOWCASE_DELIGHTFUL`
- `FB_SHOWCASE_NETHER_END_OCEAN`
- `FB_SHOWCASE_REGIONAL`

These are broad item-list catalogue nodes (often `match_nbt:false` or very large lists), intended as coverage/visibility checkpoints rather than hard machine progression.

## Optional Targets (Inferred)

`generate_expert_quest_book.mjs` marks some quests with `subtitle:"Source option"` when title contains `Source:` or `Heat Source:`. These are option nodes (alternative supply routes) rather than strict single-path gates.

Likely optional/side-path groups by role:
- Source-option nodes in SU/Heat and related infrastructure chapters.
- Reference/book nodes in `books.snbt` (documentation visibility, not hard gates).
- Large showcase/catalogue nodes above (useful for completion and planning, not strict bottlenecks).

## Immediate Recipe Rewrite Targets

Prioritize rewrites for items that appear as gate/capstone blockers and/or repeated casing milestones.

Tier 0: progression-critical gate blockers
1. `kubejs:brass_machine_casing`
2. `powergrid:generator_housing`
3. `oc2r:computer`
4. `creatingspace:chemical_synthesizer`
5. `bloodmagic:etherealslate`
6. `wares:completed_delivery_agreement`
7. `acid_vat:acid_vat`
8. `ae2:controller`
9. `advanced_ae:quantum_structure`

Tier 1: repeated casing and chapter-entry infrastructure
1. `kubejs:seared_machine_casing`
2. `kubejs:scorched_machine_casing`
3. `kubejs:andesite_machine_casing`
4. `kubejs:power_grid_machine_casing`
5. `kubejs:oc2r_machine_casing`
6. `kubejs:ae2_machine_casing`
7. `kubejs:space_machine_casing`
8. `create:andesite_casing`
9. `creatingspace:rocket_casing`

Tier 2: capstone throughput validators (automation integrity)
1. `create:mechanical_press`
2. `create:mechanical_mixer`
3. `create:mechanical_arm`
4. `create:stockpile_switch`
5. `create:packager`
6. `create:stock_ticker`
7. `createadvlogistics:package_content_filter`
8. `create:track_station`
9. `create:schedule`
10. `oc2r:redstone_interface`

Tier 3: branch exits and route economy support
1. `tconstruct:foundry_controller`
2. `powergrid:conductive_casing`
3. `chemlib:osmium_plate`
4. `rpgstats:still_beating_heart`
5. `dotcoinmod:iron_coin` / `dotcoinmod:brass_coin` (for `PC_BATTLE_STANDARD` flow)

## Chapter Order Source (from generator)

Primary progression-relevant order as authored in `chapters[]` in `tools/generate_expert_quest_book.mjs`:
- Starting Out -> Major Gates -> Tinkers I/II/Arsenal -> Death/Food/Brewing/Potion/Food Catalogue -> Create Foundations/Components/Brass/Fluids/SU-Heat -> Grid Power/Fission-Fusion/OC2R -> Space/AE2/Create Applied Kinetics/Create Rail -> Magic/Synthesis branches -> world branches -> post-AE2 branches.

This order should be treated as authoritative for rewrite sequencing.
