# Automated Pack Test Report

Generated: 2026-06-24T23:33:59.575Z

Repo: `/home/dev/workspace`

Instance: `/home/gerald/.local/share/PrismLauncher/instances/Bound to Matter-Playtest 3 - v1/minecraft`

Runtime evidence mode: `opportunistic`

Data dump evidence mode: `opportunistic`

Data dump evidence scope: vanilla `/dump` output under `dump/data_raw`, separate from KubeJS audit dumps under `kubejs/config`

Explicit instance: `no`

## Result

| Class         | Count |
| ------------- | ----- |
| Passes        | 65    |
| Hard failures | 2     |
| Soft findings | 0     |
| Skipped       | 3     |

## Hard Failures

| Test                                | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pack contract validates             | ok - pack contract parses (btm.pack_contract.v1)
ok - Minecraft version contract matches pack.toml (1.20.1)
ok - Forge version contract matches pack.toml (47.4.13)
ok - authoritative source roots exist (10 roots)
ok - source surface minimum file count (3137 >= 1900)
ok - kubejs file count floor (655 >= 500)
ok - config file count floor (1647 >= 1400)
ok - defaultconfigs file count floor (5 >= 5)
ok - datapacks file count floor (456 >= 30)
ok - mods file count floor (251 >= 220)
ok - docs file count floor (5 >= 5)
ok - tools file count floor (113 >= 50)
ok - KubeJS JS surface floor (100 files)
ok - KubeJS JSON surface floor (410 files)
ok - docs contain exactly the five living summaries (README.md, content_systems.md, performance_and_mods.md, progression.md, runtime_validation.md)
ok - packwiz index excludes generated/tool roots
ok - pack.toml index hash matches index.toml
ok - pack manifest count floor (232 manifests)
ok - bundled custom jar count floor (18 jars)
ok - required manifest exists: mods/applied-energistics-2.pw.toml
ok - required manifest exists: mods/ars-nouveau.pw.toml
ok - required manifest exists: mods/blood-magic.pw.toml
ok - required manifest exists: mods/botania.pw.toml
ok - required manifest exists: mods/chemlib.pw.toml
ok - required manifest exists: mods/cold-sweat.pw.toml
ok - required manifest exists: mods/concurrent-chunk-management-engine-for-forge-the.pw.toml
ok - required manifest exists: mods/create.pw.toml
ok - required manifest exists: mods/create-creating-space.pw.toml
ok - required manifest exists: mods/create-deco.pw.toml
ok - required manifest exists: mods/diet.pw.toml
ok - required manifest exists: mods/distant-horizons.pw.toml
ok - required manifest exists: mods/emi.pw.toml
ok - required manifest exists: mods/ftb-quests-forge.pw.toml
ok - required manifest exists: mods/goety.pw.toml
ok - required manifest exists: mods/hexerei.pw.toml
ok - required manifest exists: mods/irons-spells-n-spellbooks.pw.toml
ok - required manifest exists: mods/jei.pw.toml
ok - required manifest exists: mods/large-ore-deposits.pw.toml
ok - required manifest exists: mods/malum.pw.toml
ok - required manifest exists: mods/oc2r.pw.toml
ok - required manifest exists: mods/occultism.pw.toml
ok - required manifest exists: mods/pneumaticcraft-repressurized.pw.toml
ok - required manifest exists: mods/power-grid.pw.toml
ok - required manifest exists: mods/the-flesh-that-hates.pw.toml
ok - required manifest exists: mods/the-lost-cities.pw.toml
ok - required manifest exists: mods/thirst-was-taken.pw.toml
ok - required manifest exists: mods/tinkers-construct.pw.toml
ok - required manifest exists: mods/wares.pw.toml
ok - required bundled jar exists and is indexed: mods/btmfixes-0.1.0.jar
ok - required bundled jar exists and is indexed: mods/classselector-1.0.0.jar
ok - required bundled jar exists and is indexed: mods/computerbridge-0.1.0.jar
ok - required bundled jar exists and is indexed: mods/create-transmission-loss-0.1.0.jar
ok - required bundled jar exists and is indexed: mods/dtmalum-1.0.0.jar
ok - required bundled jar exists and is indexed: mods/dthexerei-1.0.0.jar
ok - required bundled jar exists and is indexed: mods/heatsync-0.1.0.jar
ok - required bundled jar exists and is indexed: mods/latent_chemlib-0.1.0.jar
ok - required bundled jar exists and is indexed: mods/oc2rwireless-1.0.0.jar
ok - required bundled jar exists and is indexed: mods/pillagercampaigns-0.2.0.jar
ok - required bundled jar exists and is indexed: mods/procedural_bouquets-0.1.0.jar
ok - required bundled jar exists and is indexed: mods/realisticores-0.1.0.jar
ok - required bundled jar exists and is indexed: mods/rpgstats-1.0.0.jar
ok - required bundled jar exists and is indexed: mods/settlementroads-0.1.0.jar
ok - required bundled jar exists and is indexed: mods/villagewalls-1.0.0.jar
ok - forbidden retired/bypass files are absent
ok - progression tier order matches contract (10 tiers)
ok - coin tier order matches contract (7 tiers)
ok - machine casing ladder matches contract (8 casings)
ok - Blood Magic gate catalog covers contract (5 gates)
ok - system bounded_matter_geology_chemistry required files exist (17 files)
ok - system bounded_matter_geology_chemistry required dirs exist (0 dirs)
ok - system bounded_matter_geology_chemistry markers hold in kubejs/server_scripts/40_recipe_add/55_realistic_ores_identity_outputs.js
ok - system bounded_matter_geology_chemistry markers hold in kubejs/server_scripts/40_recipe_add/57_grown_material_acid_ball_processing.js
ok - system bounded_matter_geology_chemistry markers hold in kubejs/server_scripts/40_recipe_add/56_alchemistry_dissolver_create_port.js
ok - system bounded_matter_geology_chemistry JSON minimum kubejs/config/alchemistry_dissolver_port.json:recipes (1386 >= 1000)
ok - system machine_casing_spine required files exist (12 files)
ok - system machine_casing_spine required dirs exist (0 dirs)
ok - system machine_casing_spine markers hold in kubejs/server_scripts/30_recipe_replace/143_circuit_pncr_assembly_authority.js
ok - system magic_body_survival_spine required files exist (11 files)
ok - system magic_body_survival_spine required dirs exist (0 dirs)
ok - system magic_body_survival_spine markers hold in kubejs/server_scripts/40_recipe_add/40_blood_orbs_from_still_beating_hearts.js
ok - system magic_body_survival_spine markers hold in kubejs/server_scripts/40_recipe_add/58_blood_magic_manual_create_yields.js
ok - system magic_body_survival_spine markers hold in kubejs/server_scripts/30_recipe_replace/126_cross_magic_irons_spellcraft.js
ok - system coin_villager_wares_economy required files exist (5 files)
ok - system coin_villager_wares_economy required dirs exist (2 dirs)
ok - system coin_villager_wares_economy markers hold in kubejs/server_scripts/35_villager_trades/10_coin_villager_trades.js
ok - system adventure_dimensions_combat_pressure required files exist (17 files)
ok - system adventure_dimensions_combat_pressure required dirs exist (0 dirs)
ok - system adventure_dimensions_combat_pressure markers hold in kubejs/server_scripts/30_recipe_replace/170_space_dimension_access_gates.js
ok - system adventure_dimensions_combat_pressure markers hold in kubejs/data/creatingspace/creatingspace/rocket_accessible_dimension/earth_orbit.json
ok - system adventure_dimensions_combat_pressure markers hold in config/twilightforest-common.toml
ok - system runtime_concurrency_performance required files exist (9 files)
ok - system runtime_concurrency_performance required dirs exist (0 dirs)
ok - system runtime_concurrency_performance markers hold in tools/lc_tfth_c2me_dh_stability.py
ok - system runtime_concurrency_performance markers hold in tools/log_hard_failure_scan.mjs
ok - system client_visibility_guidance required files exist (3 files)
ok - system client_visibility_guidance required dirs exist (0 dirs)
ok - system client_visibility_guidance markers hold in kubejs/client_scripts/40_hide_quarantined_systems.js
ok - system worldgen_statistical_sampling required files exist (5 files)
ok - system worldgen_statistical_sampling required dirs exist (0 dirs)
ok - system worldgen_statistical_sampling markers hold in docs/runtime_validation.md
ok - system playtest_telemetry_friction required files exist (4 files)
ok - system playtest_telemetry_friction required dirs exist (0 dirs)
ok - system playtest_telemetry_friction markers hold in tools/engine_world_log_metrics.mjs
ok - validation tier L0 has required tools (inventory/source integrity)
ok - validation tier L1 has required tools (static syntax/schema/reference checks)
ok - validation tier L2 has required tools (extracted progression/economy graph invariants)
ok - validation tier L3 has required tools (fresh runtime dump invariants)
ok - validation tier L4 has required tools (client/server scenario harnesses)
ok - validation tier L5 has required tools (statistical seed/worldgen/performance sampling)
ok - validation tier L6 has required tools (human playtest telemetry and friction metrics)
ok - custom mod source root exists (generated/custom-mod-sources)
ok - custom mod build file exists: btmfixes
ok - custom mod code surface: btmfixes (13 >= 8)
ok - custom mod test surface: btmfixes (1 >= 1)
ok - custom mod bundled jar exists and is indexed: btmfixes
ok - custom mod build file exists: classselector
ok - custom mod code surface: classselector (29 >= 20)
ok - custom mod test surface: classselector (7 >= 5)
ok - custom mod bundled jar exists and is indexed: classselector
ok - custom mod build file exists: transmissionloss
ok - custom mod code surface: transmissionloss (15 >= 12)
ok - custom mod test surface: transmissionloss (4 >= 4)
ok - custom mod bundled jar exists and is indexed: transmissionloss
ok - custom mod build file exists: dtmalum
ok - custom mod code surface: dtmalum (4 >= 3)
ok - custom mod test surface: dtmalum (1 >= 1)
ok - custom mod bundled jar exists and is indexed: dtmalum
ok - custom mod build file exists: dthexerei
ok - custom mod code surface: dthexerei (4 >= 3)
ok - custom mod test surface: dthexerei (1 >= 1)
ok - custom mod bundled jar exists and is indexed: dthexerei
ok - custom mod build file exists: heatsync
ok - custom mod code surface: heatsync (41 >= 35)
ok - custom mod test surface: heatsync (7 >= 7)
ok - custom mod bundled jar exists and is indexed: heatsync
ok - custom mod build file exists: dimensionalfonts
ok - custom mod code surface: dimensionalfonts (62 >= 50)
ok - custom mod test surface: dimensionalfonts (7 >= 5)
ok - custom mod bundled jar exists and is indexed: dimensionalfonts
ok - custom mod build file exists: computerbridge
ok - custom mod code surface: computerbridge (29 >= 25)
ok - custom mod test surface: computerbridge (4 >= 4)
ok - custom mod bundled jar exists and is indexed: computerbridge
ok - custom mod build file exists: pillagercampaigns
ok - custom mod code surface: pillagercampaigns (40 >= 35)
ok - custom mod test surface: pillagercampaigns (15 >= 15)
ok - custom mod bundled jar exists and is indexed: pillagercampaigns
ok - custom mod build file exists: procedural_bouquets
ok - custom mod code surface: procedural_bouquets (23 >= 20)
ok - custom mod test surface: procedural_bouquets (1 >= 1)
ok - custom mod bundled jar exists and is indexed: procedural_bouquets
ok - custom mod build file exists: realisticores
ok - custom mod code surface: realisticores (13 >= 10)
ok - custom mod test surface: realisticores (2 >= 2)
ok - custom mod bundled jar exists and is indexed: realisticores
ok - custom mod build file exists: rpgstats
ok - custom mod code surface: rpgstats (41 >= 35)
ok - custom mod test surface: rpgstats (2 >= 2)
ok - custom mod bundled jar exists and is indexed: rpgstats
ok - custom mod build file exists: settlementroads
ok - custom mod code surface: settlementroads (42 >= 35)
ok - custom mod test surface: settlementroads (11 >= 10)
ok - custom mod bundled jar exists and is indexed: settlementroads
ok - custom mod build file exists: villagewalls
ok - custom mod code surface: villagewalls (20 >= 15)
ok - custom mod test surface: villagewalls (6 >= 5)
ok - custom mod bundled jar exists and is indexed: villagewalls

pack contract audit: 167 pass(es), 0 finding(s), 4 hard failure(s)
FAIL - packwiz indexed files exist: mods/btmdimtrees-0.1.0.jar
shaderpacks/ComplementaryReimagined_r5.7.1.zip
FAIL - packwiz indexed file hashes match: AGENTS.md: bbce7dfacfe9938ef748ec6a2ffecea1c4a7b731368cacb3133afa816071f8b8 != d4d5dbab8dbb2cd3854537ceb488b30d62a59a7e4d0d5cfe60bba11a865bcc42
datapacks/dt_forest_worldgen_fix/data/btmdimtrees/worldgen/configured_feature/bluebright_tree.json: 63993fb608bf21c5b1a81a1ec3c826e412421bbdb2219d2ec6138786dfec4692 != 2e1953fa7e6a6a55344983fb14ff86751777346bc1a95b5552fbd64dcc42138e
datapacks/dt_forest_worldgen_fix/data/btmdimtrees/worldgen/configured_feature/dusk_tree.json: 656bcae3c410a4be324695989fd0e8a1eb7a5e3fe5c2e64fd81b9aec96045c91 != 419b62a6468b61b3bdecffa7b19ca0d62c9f886805d721b0d41bf2c18753aefa
datapacks/dt_forest_worldgen_fix/data/btmdimtrees/worldgen/configured_feature/finley_wood_tree.json: a8e32bd01d9a8ded22c88fe8867aa5a4dae691bce2107b7acf1ae2d9eb6b0c11 != 2c622319075788e1f90c29a1f0ded418322dd7dd7c1d4e04056337acecc4ed0b
datapacks/dt_forest_worldgen_fix/data/btmdimtrees/worldgen/configured_feature/frostbright_tree.json: 70a6635e4f1d03103944133608739a7afc340142fbad4b254d69ff3f571f44b4 != a7eeec987acca2ff1f72b18d8ccb0663463e18470dcdcf37cf6c71e35e97ac3c
datapacks/dt_forest_worldgen_fix/data/btmdimtrees/worldgen/configured_feature/grongle_tree.json: b531a32453f4362c50e737d32d52f26bae86c30ca3d8195efffec2b74c098073 != e193771ba401c1c14f51d36f884cdd1523c2cced837aeae02a85ee37a542e75e
datapacks/dt_forest_worldgen_fix/data/btmdimtrees/worldgen/configured_feature/living_wood_tree.json: a8633b1f149ffd7d5220c8803d1df79f46e1e9246820aa092bfec15b0e7e95eb != e151f0410f5c9adcd55cca59e491f7c03530848bf7bd47a9ea587d462bfde9b6
datapacks/dt_forest_worldgen_fix/data/btmdimtrees/worldgen/configured_feature/maple_tree.json: 6ff85035435065eb26fb6658f81874e74df11f84d2e6aa9490b8b869fb8efa8e != 300fd3d2a996e39d7942c9fa14bb462bf93281ddfcfc32588b20fb69d6c9c365
datapacks/dt_forest_worldgen_fix/data/btmdimtrees/worldgen/configured_feature/silent_tree_tree.json: 3b645ecc1c9ef6ff0f0f809bca7765565240e9b846f67fa038b0dc68656cdc1f != c0ccc31dbaf4de88dd09878992fe17ce93861c4da0acaa9ae2e7f97f7397b227
datapacks/dt_forest_worldgen_fix/data/btmdimtrees/worldgen/configured_feature/smogstem_tree.json: 54237cbe156c2c96223355caf4f4ebc0cff523ebff617364f3a214337a093d03 != 220716d4119757e0b1daeb9d3a7bf0aee6e5119d66ed23acae1883cefe611084
datapacks/dt_forest_worldgen_fix/data/btmdimtrees/worldgen/configured_feature/starlit_tree.json: 343e86ea5634627946f9dfdb964932ceefb2c7e4b994cc52a9b750335352a99b != e2a3db0b4c9c0041e6fc92888ee6e29d5ea2e823551e2ddab86686d0aae8c167
datapacks/dt_forest_worldgen_fix/data/btmdimtrees/worldgen/configured_feature/wigglewood_tree.json: 5cf1acd01e3a5c641fa6ff9f3bc10bc0fdba741092c67341e90ff4b89f1993e2 != f7b2410cf5aef5611c85c5e30bd51380d71639934c81dbd84a097ce16d34ae11
shaderpacks/ComplementaryReimagined_r5.7.1/shaders/block.properties: c36acc3b1f43d68436b11833c8eaac0c210ce844197b69f601c62ee81c3c7a36 != a5e357cc4b79400b192af709f4d474afefc834e796a583e1c50fff650a186823
FAIL - custom mod source exists: latent_chemlib: generated/custom-mod-sources/latent-chemlib
FAIL - custom mod source exists: oc2rwireless: generated/custom-mod-sources/oc2rwireless |
| autonomous contract validators pass | ok - economy coin tier map is complete (7 tiers)
ok - coin exchange rows are well-formed (9 rows)
ok - coin exchange graph has no profitable conversion cycle
ok - villager buy/sell trades have no direct profitable item loop (329 buys, 57 sells)
ok - Wares economy has no emerald currency (17 tables)
ok - Wares economy uses coin currency
ok - food effect graph has required route/body categories (1035 foods, 654 candidates)
ok - runtime food effect dump has provenance metadata (btm.food_effect_audit.v2, 2026-05-31T11:43:01.052Z)
ok - runtime food effect dump has no extraction errors (831 foods from generated/runtime-dumps/kubejs-config/food_effect_index.json)
ok - runtime food effect summary matches index (831 foods)
ok - runtime food effect dump is fresh enough for source inputs
ok - Blood Orb heart bridge escalates monotonically (5 typed orb tiers + weak fallback)
ok - Blood Magic lifeforce escalation markers exist
ok - death overhaul source contract keeps items, resets RPG power, and locks respawn
ok - death overhaul is covered in living docs
ok - starting options avoid tools, storage, logs, and missing-logistics progression items (6 kits, 64 embark items)
ok - live FTB quest content is populated (56 chapters, 473 quest nodes, 12 groups)
ok - generated quest output remains available for regeneration audits (5 generated files)
ok - quarantined items are removed and hidden from JEI/EMI source hooks (5 anchors)
ok - vanilla-style tool suppression covers audited mod families (23 markers)
ok - vanilla-style tools are blocked from crafting and recipe viewers server-side (8 hooks)
ok - vanilla-style tools are hidden from JEI and EMI
ok - vanilla-style tool suppression avoids TConstruct tool-building entries
ok - vanilla-style tool recipe removals are unconditional
ok - NTP audited assignments keep gravel hand-breakable
ok - NTP hand-breakable tag covers vanilla and forge gravel
ok - NTP hook refreshes audited assignments after startup load ordering
ok - primitive soft ground blocks remain hand-mineable (11 representative blocks)
ok - stone-like blocks remain pickaxe-mineable (9 representative blocks)
ok - wood-like blocks remain axe-mineable (7 representative blocks)
ok - soft ground blocks remain shovel-usable through hand or shovel gates (8 representative blocks)
ok - grass-over-stone blocks remain pickaxe-mineable (4 representative blocks)
ok - flint/wood butcher knife primitive recipe remains craftable
ok - straw/flint/stick hand axe primitive recipe remains craftable
ok - flint butcher knife remains a Farmer Delight straw harvester
ok - knife-gated plant cutting consumes knife durability
ok - TConstruct pattern routes use canvas grid and Create paper pressing
ok - TConstruct shapeless gravel-to-flint shortcut stays removed
ok - gunpowder from gravel stays at reduced chance
ok - hardness probe covers ore tier and deepslate representative pairs (8 ore families)
ok - deepslate ore hardness runtime check is probe-ready (no retained block_hardness_probe.json)
ok - vanillish recipe pass does not add grid or furnace recipes
ok - vanillish non-magic shortcuts are routed to Create surfaces (14 markers)
ok - vanillish magic shortcuts are routed to Blood Magic alchemy (11 markers)
ok - non-grown infinite resource recipe sources are quarantined (9 markers)
ok - non-grown infinite resource shortcuts are hidden from JEI/EMI (8 markers)
ok - Create config disables bottomless fluid sources and source placement
ok - Finite Water config has no infinite biome/refill pipe sources
ok - restocking trades reject non-grown material buy results (7 markers)
ok - living docs cover non-grown infinite resource policy
ok - RBP Overworld physics is explicit-definition only
ok - RBP generated pack-solid definition covers broad solid block surface (9471 explicit ids)
ok - RBP generated pack-solid definition excludes Dynamic Trees-managed blocks
ok - RBP modded whitelist covers broad explicit block surface (4573 ids in 11 files)
ok - RBP generated whitelist excludes lifecycle/progression/decor-sensitive blocks
ok - Tectonic Overworld exposes lava-depth terrain band (min_y=-64, lava_tunnels=true)
ok - ADLODS deposit surface remains broad (30 deposits)
ok - retired Create New Age deposits stay absent
ok - foraging datapack is Undergarden-only (48 placed features, 39 biome modifiers, 10 biome tags)
ok - Excavated Variants treats gravel as a gravel ore substrate
ok - stone-style meteor ores can replace gravel
ok - gravel Excavated Variants ore blocks stay shovel-gated and RBP-managed (7 representatives)
ok - deep geology datapacks cover lava-depth and Hyle anchors (10 files)
ok - Hyle stone replacement starts at world bottom (y=-64)
ok - Hyle datapack data uses namespaced loader paths
ok - lava-depth configured features use the Realistic Ores lava-exposed feature (3 configured features)
ok - lava-depth placed features are height-bounded and lava-contact filtered (3 placed features)
ok - lava-depth danger spawner targets lava diving band
ok - Realistic Ores implements per-block lava-exposed ore placement
ok - osmiridium avoids normal osmium/iridium ore-source tags
ok - Occultism miner bypass recipes stay removed
ok - osmiridium lava diving route is visible and consumed by post-AE2 progression
ok - dimension proof graph-start recipe ids cover mapped route dimensions (aether, everdawn)
ok - dimension proof graph-start pass uses explicit helper and recipe counter
ok - dimension proof graph-start outputs stay on route-tool surfaces (4 outputs)
ok - dimension proof graph-start recipes avoid self-label and spine reassignment outputs (2 authored outputs)
ok - obelisk graph starts reject self-label dimension mappings
ok - obelisk graph-start table does not reassign tech or magic spines
ok - Everdawn route leaves basic water ungated
ok - direct dimension portal/key routes are suppressed and not re-authored (20 route items)
ok - Twilight Forest direct portal config is disabled
ok - Creating Space rocket graph owns non-meteor adventure dimensions (5 dimensions)
ok - portal-bearing structures are disabled (25 structures)
ok - configured font routes include required Aether entry
ok - obelisks runtime blocks vanilla/generic portal travel bypasses

autonomous contract validators: 85 pass(es), 1 hard failure(s)
FAIL - custom mod source/jar provenance signals are current: latent_chemlib: missing source generated/custom-mod-sources/latent-chemlib
oc2rwireless: missing source generated/custom-mod-sources/oc2rwireless                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

## Soft Findings

| Rank | Test | Detail |
| ---- | ---- | ------ |

## Passes

| Test                                                                    | Detail                                                                                               |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| progression catalog parses                                              | 10 tiers                                                                                             |
| all repo JSON parses                                                    | 280 files                                                                                            |
| all KubeJS/tool JS parses with node --check                             | 128 files                                                                                            |
| performance budget: JSON and JS syntax validation                       | 228 ms <= 8000 ms                                                                                    |
| critical expert-pack surfaces exist                                     | 18 files                                                                                             |
| retired Acid Vat deposit slurry script is absent                        |                                                                                                      |
| server runtime mod pruner uses shared side-exclusion policy             |                                                                                                      |
| server bootstrap prunes stale cached mods                               |                                                                                                      |
| machine casing IDs are referenced                                       | 8 casings                                                                                            |
| Raw Impossible casing does not consume AE2 controller                   |                                                                                                      |
| retired TiCEX post-AE2 gate script is absent                            |                                                                                                      |
| Protection Pixel is hard-gated as post-AE2 armor                        |                                                                                                      |
| Protection Pixel late armor is displaced into explicit post-AE2 recipes |                                                                                                      |
| compressed air is gated to the SU rotational compressor                 |                                                                                                      |
| SU rotational compressor has explicit Create mechanical crafting recipe |                                                                                                      |
| Tome of Blood is hard-gated as post-AE2 hybrid magic                    |                                                                                                      |
| Tome of Blood is no longer gated as an Altar III side mod               |                                                                                                      |
| Hooks and Create SA drones are tier-gated                               |                                                                                                      |
| High-impact backpack upgrades are post-AE2                              |                                                                                                      |
| Quarantined machines/upgrades are removed and hidden                    |                                                                                                      |
| Direct dimension portal/key items are removed and hidden                | 20 items                                                                                             |
| Direct dimension route pass does not re-author portal recipes           |                                                                                                      |
| Twilight Forest direct portal is disabled                               |                                                                                                      |
| Creating Space Earth orbit exposes all non-meteor adventure dimensions  | 5 routes                                                                                             |
| Space-routed adventure dimensions return to Earth orbit                 |                                                                                                      |
| Direct portal structures are disabled                                   | 17 structures                                                                                        |
| Creating Space access advancement has a concrete space item trigger     |                                                                                                      |
| performance budget: critical progression surfaces                       | 7.53 ms <= 750 ms                                                                                    |
| performance budget: pack contract validation                            | 82.16 ms <= 1000 ms                                                                                  |
| contract completeness is classified                                     | contract completeness: 12 dimensions classified; 9 strong, 3 explicit open; 0 error(s), 0 warning(s) |
| performance budget: contract completeness classification                | 15.4 ms <= 1000 ms                                                                                   |
| performance budget: autonomous contract validation                      | 80.53 ms <= 1500 ms                                                                                  |
| all chapters are assigned to existing chapter groups                    | 56 chapters                                                                                          |
| chapter titles do not duplicate chapter group labels                    |                                                                                                      |
| quest dependencies resolve                                              | 641 refs                                                                                             |
| quest nodes expose stable recipe hooks                                  |                                                                                                      |
| Starting Out rewards exactly 4 copper per quest                         | 20 quests                                                                                            |
| non-Starting quest coin rewards use 4-count tier packets                |                                                                                                      |
| quest book covers major progression nodes                               | 28 anchors                                                                                           |
| Food chapter exposes food showcase coverage                             | 9 representative foods                                                                               |
| TCon chapter exposes weapon and tool showcase coverage                  | 6 representative tools                                                                               |
| TCon showcase tasks ignore NBT                                          |                                                                                                      |
| performance budget: quest book validation                               | 10.42 ms <= 250 ms                                                                                   |
| Wares contracts do not use emerald currency                             | 17 tables                                                                                            |
| Wares contracts contain Create Deco coin currency                       | 17 tables                                                                                            |
| villager trade script covers broad profession set                       | 13 professions                                                                                       |
| villager trade script has no emerald currency                           |                                                                                                      |
| sell-trade helper pays copper coins instead of emeralds                 |                                                                                                      |
| performance budget: Wares and villager trade validation                 | 0.53 ms <= 250 ms                                                                                    |
| repo loot table JSON parses                                             | 96 tables                                                                                            |
| repo loot tables inject many coin sources                               | 32 tables                                                                                            |
| repo loot tables contain no direct emerald loot                         |                                                                                                      |
| repo loot tables contain no obvious high-power outputs                  |                                                                                                      |
| performance budget: repo loot data validation                           | 2.11 ms <= 500 ms                                                                                    |
| performance budget: generated recipe graph validation                   | 0.27 ms <= 5000 ms                                                                                   |
| performance budget: generated loot dump validation                      | 0.05 ms <= 2500 ms                                                                                   |
| performance budget: engine and world performance log analysis           | 0.18 ms <= 250 ms                                                                                    |
| KubeJS custom assets validate                                           | ok - kubejs assets validate (60 custom items, 8 casings, 16 crate tiers, 112 models)                 |
| performance budget: KubeJS asset validation                             | 22.89 ms <= 500 ms                                                                                   |
| chemistry identity matrix validates                                     | ok - chemistry identity matrix validates                                                             |
| performance budget: chemistry identity validation                       | 26.15 ms <= 500 ms                                                                                   |
| dev dump script emits expected artifacts                                |                                                                                                      |
| dev food effect dump script emits expected artifacts                    |                                                                                                      |
| food effect graph analyzer emits expected artifacts                     |                                                                                                      |
| performance budget: dev dump health validation                          | 0.14 ms <= 50 ms                                                                                     |

## Skipped

| Test                                  | Detail                                                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| generated recipe graph tests          | missing /home/gerald/.local/share/PrismLauncher/instances/Bound to Matter-Playtest 3 - v1/minecraft/kubejs/config/full_recipe_index_manifest.json |
| generated loot dump tests             | missing /home/gerald/.local/share/PrismLauncher/instances/Bound to Matter-Playtest 3 - v1/minecraft/dump/data_raw/loot_tables                     |
| engine/world performance log analysis | missing /home/gerald/.local/share/PrismLauncher/instances/Bound to Matter-Playtest 3 - v1/minecraft/logs/latest.log                               |

## Metrics

```json
{
  "questChapters": 56,
  "villagerProfessionsCovered": 13,
  "performance": {
    "budgetsMs": {
      "JSON and JS syntax validation": 8000,
      "critical progression surfaces": 750,
      "pack contract validation": 1000,
      "contract completeness classification": 1000,
      "autonomous contract validation": 1500,
      "quest book validation": 250,
      "Wares and villager trade validation": 250,
      "repo loot data validation": 500,
      "generated recipe graph validation": 5000,
      "generated loot dump validation": 2500,
      "engine and world performance log analysis": 250,
      "KubeJS asset validation": 500,
      "chemistry identity validation": 500,
      "dev dump health validation": 50
    },
    "hardLimitsMs": {
      "JSON and JS syntax validation": 24000,
      "critical progression surfaces": 3000,
      "pack contract validation": 5000,
      "contract completeness classification": 5000,
      "autonomous contract validation": 6000,
      "quest book validation": 1500,
      "Wares and villager trade validation": 1500,
      "repo loot data validation": 3000,
      "generated recipe graph validation": 20000,
      "generated loot dump validation": 10000,
      "engine and world performance log analysis": 1500,
      "KubeJS asset validation": 2000,
      "chemistry identity validation": 2000,
      "dev dump health validation": 500
    },
    "results": [
      {
        "name": "JSON and JS syntax validation",
        "durationMs": 228,
        "budgetMs": 8000,
        "hardLimitMs": 24000
      },
      {
        "name": "critical progression surfaces",
        "durationMs": 7.53,
        "budgetMs": 750,
        "hardLimitMs": 3000
      },
      {
        "name": "pack contract validation",
        "durationMs": 82.16,
        "budgetMs": 1000,
        "hardLimitMs": 5000
      },
      {
        "name": "contract completeness classification",
        "durationMs": 15.4,
        "budgetMs": 1000,
        "hardLimitMs": 5000
      },
      {
        "name": "autonomous contract validation",
        "durationMs": 80.53,
        "budgetMs": 1500,
        "hardLimitMs": 6000
      },
      {
        "name": "quest book validation",
        "durationMs": 10.42,
        "budgetMs": 250,
        "hardLimitMs": 1500
      },
      {
        "name": "Wares and villager trade validation",
        "durationMs": 0.53,
        "budgetMs": 250,
        "hardLimitMs": 1500
      },
      {
        "name": "repo loot data validation",
        "durationMs": 2.11,
        "budgetMs": 500,
        "hardLimitMs": 3000
      },
      {
        "name": "generated recipe graph validation",
        "durationMs": 0.27,
        "budgetMs": 5000,
        "hardLimitMs": 20000
      },
      {
        "name": "generated loot dump validation",
        "durationMs": 0.05,
        "budgetMs": 2500,
        "hardLimitMs": 10000
      },
      {
        "name": "engine and world performance log analysis",
        "durationMs": 0.18,
        "budgetMs": 250,
        "hardLimitMs": 1500
      },
      {
        "name": "KubeJS asset validation",
        "durationMs": 22.89,
        "budgetMs": 500,
        "hardLimitMs": 2000
      },
      {
        "name": "chemistry identity validation",
        "durationMs": 26.15,
        "budgetMs": 500,
        "hardLimitMs": 2000
      },
      {
        "name": "dev dump health validation",
        "durationMs": 0.14,
        "budgetMs": 50,
        "hardLimitMs": 500
      }
    ]
  }
}
```
