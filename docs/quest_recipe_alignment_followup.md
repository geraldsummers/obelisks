# Quest/Recipe Alignment Follow-up (Gate + Capstone Focus)

Date: 2026-05-01
Scope: verify quest gate/capstone nodes against the current recipe backbone, with emphasis on casing tiers, food/potion systems, economy/trades, Create chapters, and post-AE2 branches.

## Backbone References Checked

- `tools/generate_expert_quest_book.mjs`
- `docs/machine_casing_audit.md`
- `docs/crafting_graph_from_quests.md`
- `docs/food_effect_graph_audit.md`
- `docs/economy_loot_trade_audit.md`
- `docs/create_stack_integration_pass.md`
- `docs/post_ae2_branch_plan.md`
- `docs/protection_pixel_post_ae2_pass.md`
- `docs/tome_of_blood_post_ae2_pass.md`

## High-Priority Mismatches

1. Major gate icons do not consistently reflect the actual casing-tier gates
- Current major-gate quest anchors use functional machines (`powergrid:generator_housing`, `oc2r:computer`, `creatingspace:chemical_synthesizer`, `ae2:controller`) while recipe enforcement is primarily centered on machine casing tiers (`kubejs:*_machine_casing`).
- Impact: players can read the gate spine as “unlock by endpoint machine” while recipe progression is “unlock by casing authority.” This weakens gate readability and increases false troubleshooting when a machine fails due to missing casing-tier progression.
- Affected gate lane: `MG_POWER`, `MG_OC2R`, `MG_SPACE`, `MG_AE2`.

2. Post-AE2 top gate is single-anchored to Advanced AE, but recipe backbone is now multi-branch
- `MG_POST_AE2` is anchored to `advanced_ae:quantum_structure`, while live post-AE2 recipe branches also include Protection Pixel and Tome of Blood as first-class late branches.
- Impact: the major-gate node implies one dominant branch even though late-game recipes are now distributed across multiple branch-defining systems.
- Affected gate lane: `MG_POST_AE2` and chapter-entry signaling into `PA`, `PP`, `TOB`.

3. No explicit post-AE2 “casing-equivalent” capstone despite casing-tier logic being the pack’s main machine authority language
- Progression has explicit casing milestones through AE2, but no comparable post-AE2 material authority node (even though late branches rely on quantum/fission/slate composite gates).
- Impact: the transition from casing-tier progression into post-AE2 branch material authority is under-signaled in the quest backbone.
- Affected transition: `MG_AE2` -> `MG_POST_AE2` -> late branch chapters.

4. Food/Potion quest capstones remain pipeline-centric, while recipe/system strength is now effect-centric
- `PE_ROUTE_DOSSIER` and related nodes teach extracts and brewing flow, but do not explicitly anchor the strongest effect-driven route/combat foods identified in the current audit.
- Impact: body-prep branch signals process completion but underrepresents practical loadout completion, which is now the stronger progression expression for route survivability and expedition pressure.
- Affected nodes: `FB_EFFECT_SOURCES`, `FB_POTION_ENGINEERING`, `PE_ROUTE_DOSSIER`, `FC_EXPEDITION_MENU`.

5. Economy gate/capstone assumptions can drift from actual coin float due to known duplicate baseline injections
- Quest economy milestones assume a stable coin curve, but current loot scripts can double-inject baseline coin into overlapping chest tables.
- Impact: gate timing and reward weight can drift early/midgame, reducing the intended pressure loop between routes, contracts, and major-gate affordability.
- Affected nodes: `MG_ECONOMY`, `VE_*` progression expectations, `PC_BATTLE_STANDARD` economy feedback loop.

## Create Chapter Alignment Snapshot

- Create chapter structure and capstones are generally aligned with recipe backbone.
- Highest-risk gap is not missing capstones, but that major-gate lane messaging emphasizes endpoint machines over casing-tier authority after Create.

## Priority Order For Follow-up Quest Adjustments

1. Align major-gate visual/task anchors with casing-tier authority where recipes are casing-gated.
2. Reframe `MG_POST_AE2` as a branch fan-out gate (not single-system identity).
3. Add a post-AE2 material-authority capstone node to mirror pre-AE2 casing-language continuity.
4. Add at least one explicit effect-loadout capstone in Food/Potion flow tied to audited combat/route effect classes.
5. Resolve economy float duplication before further economy milestone tuning.
