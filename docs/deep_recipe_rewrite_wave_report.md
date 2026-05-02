# Deep Recipe Rewrite Wave Report

Date: 2026-05-01

## Implemented

- Added `kubejs/server_scripts/30_recipe_replace/135_recipe_graph_closure.js` as a final closure pass over generated recipe graph gaps.
- Re-authored remaining high-signal machine outputs around the casing ladder:
  - TCon smeltery/foundry controllers use seared/scorched machine casings.
  - Create gearbox/control/fluid utilities use andesite machine casing or manufactured controls.
  - Create Connected gearboxes use brass machine casing.
  - Create Diesel Generators engines and pumpjack parts use brass/power casing authority.
  - Acid Vat pump/centrifuge parts use brass machine casing.
  - Create New Age reactor/heat machinery uses power-grid machine casing.
  - ExtendedAE/Ex Pattern Provider part conversions use AE2 machine casing.
  - Railways portable fuel interface uses brass machine casing.
- Closed residual raw valuable machine-input paths for redstone and amethyst outliers by replacing them with power relays or sky steel sheets.
- Removed the remaining player-facing Alchemistry guide recipe so Acid Vat stays the chemistry surface.
- Updated `tools/pack_test_suite.mjs` so stale live recipe dumps are not treated as proof after repo recipe scripts change.
- Aligned Major Gates in the quest generator to casing authority instead of endpoint machines.
- Reframed the post-AE2 Major Gate as a multi-branch gate: Advanced AE, Protection Pixel, and Tome of Blood.
- Added an effect-loadout capstone to Potion Engineering so the food/potion system expresses practical route power, not only process completion.
- Removed duplicate baseline coin injection from `40_emerald_loot_coin_replacement.js`; baseline copper/iron chest float is now owned by `20_world_chest_coin_tiers.js`.

## Subagent Audits Produced

- `docs/crafting_graph_from_quests.md`
- `docs/machine_casing_audit.md`
- `docs/raw_material_recipe_audit.md`
- `docs/create_process_rewrite_plan.md`
- `docs/magic_gate_recipe_audit.md`
- `docs/economy_loot_trade_audit.md`
- `docs/quest_recipe_alignment_followup.md`

## Validation

Passed repo-side checks:

- `node --check tools/generate_expert_quest_book.mjs`
- `node tools/generate_expert_quest_book.mjs`
- `node tools/validate_quest_dependencies.mjs`
- `node --check tools/pack_test_suite.mjs`
- `node --check kubejs/server_scripts/30_recipe_replace/135_recipe_graph_closure.js`
- `node --check kubejs/server_scripts/50_loot/40_emerald_loot_coin_replacement.js`
- `git diff --check`
- `packwiz refresh`
- `node tools/pack_test_suite.mjs`

Latest suite result: 57 passes, 0 hard failures, 1 soft finding, 2 skips.

## Remaining Runtime Proof Needed

The live instance was synced with repo `kubejs/` and `config/ftbquests/`, which removed the stale generated recipe index from `kubejs/config`. A Minecraft `/reload` or fresh launch must regenerate:

- `kubejs/config/full_recipe_index_manifest.json`
- `kubejs/config/full_recipe_index_*.json`
- generated loot dump files if the dump mod is enabled for loot

After that, run:

```sh
node tools/pack_test_suite.mjs
```

The suite now explicitly skips generated-graph assertions when the live recipe index is missing or stale, rather than reporting old graph findings as current truth.
