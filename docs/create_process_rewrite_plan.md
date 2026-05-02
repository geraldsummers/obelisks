# Create Process Rewrite Plan (Wave A)

Date: 2026-05-01
Repo: `/home/gerald/obelisks`
Constraint: planning only, no recipe edits in this wave.

## Goal

Increase recipe-authoring consistency around Create manufacturing primitives:

- `create:pressing`
- `create:mixing`
- `create:deploying`
- `create:sequenced_assembly`
- `create:mechanical_crafting`

Focus areas are remaining high-impact recipes that still rely on broad input replacement or simple crafting forms rather than explicit machine-process authoring.

## Current Baseline

Already implemented and relevant:

1. Casing ladder uses explicit Create processes (`99_machine_casing_progression.js`):
- sequenced assembly for brass casing
- mechanical crafting for power/oc2r/space/ae2 casings
- heated mixing + pressing for sky steel

2. Manufactured parts/material economy passes (`115`, `130`, `121`) perform broad `replaceInput` and many targeted reshapes.

3. Chemlib plate routes (`65`) already provide explicit pressing and optional cast flows.

## Priority Rewrite Targets

1. Replace broad `replaceInput` on key Create-machine outputs with explicit Create-machine recipes.
- Surface: major groups in `130_manufactured_plate_recipe_pass.js` and `121_create_stack_integration_gates.js`.
- Why: explicit process recipes are easier to audit than transitive replacements and reduce hidden bypasses from alternate recipes.

2. Promote plate/sheet conversions to authored pressing where missing.
- Surface: any high-impact outputs still depending on tag-only plate availability.
- Why: ensure each plate economy step visibly passes through Create press or defined casting.

3. Expand deployer-based assembly for “control module” style items.
- Candidate classes: redstone/control/interface blocks currently reshaped in crafting table form in `121`.
- Why: deployer stages communicate factory assembly better than flat shaped recipes.

4. Promote selected multi-part machine kits into sequenced assembly.
- Candidate classes: package/logistics control components, electric subassemblies, advanced addon connectors.
- Why: enforce progressive manufacturing complexity without requiring entirely new materials.

5. Reserve mechanical crafting for explicit tier boundaries and large machine chassis.
- Keep current casing usage.
- Add only where output is truly “machine-frame/chassis authority” to avoid overusing 5x5 crafting.

6. Expand heated mixing as alloy/intermediate authority where shaped swaps still do material gating.
- Candidate classes: power/electric intermediate compounds now represented as direct ingredient swaps.
- Why: converts implicit material substitution into visible process requirements.

## Candidate Worklist (No Edits Yet)

1. `kubejs/server_scripts/30_recipe_replace/130_manufactured_plate_recipe_pass.js`
- Convert highest-impact clusters from replace-only to explicit machine recipes:
  - Create logistics control items
  - Power Grid control components
  - OC2R board/circuit hardware
  - AE2 addon machine-adjacent blocks

2. `kubejs/server_scripts/30_recipe_replace/121_create_stack_integration_gates.js`
- Review crafting-table rewrites and reclassify by process type:
  - `pressing`: sheet/plate intermediates
  - `deploying`: electronics/control insertion
  - `sequenced_assembly`: compound kits
  - `mechanical_crafting`: branch capstones only

3. `kubejs/server_scripts/30_recipe_replace/115_material_economy_recipe_pass.js`
- Keep as policy-level replacement pass, but migrate tier-critical outputs into dedicated explicit recipes to reduce ambiguity.

4. `kubejs/server_scripts/40_recipe_add/50_create_deposit_preprocessing.js`
- Evaluate additional Create process chaining for deposit outputs (where appropriate) so ore identity -> processed intermediate -> final part is more explicit.

## Guardrails

1. Do not deadlock early Create progression:
- andesite-tier gating cannot require machines that themselves require andesite-tier casing.

2. Keep low-impact/decorative recipes out of heavy processization.

3. Preserve branch identity:
- mechanical crafting for structural authority
- sequenced assembly for multi-step precision manufacture
- deployer for assembly insertion
- pressing for form-factor conversion
- mixing for alloy/compound transformation

4. Validate against known dump limitation:
- current `ServerEvents.recipes` dump is not final post-KubeJS manager state; verification strategy must account for this.

## Validation Plan for Next Wave

1. Generate/update final audit artifacts for this branch state.
2. Diff counts of shaped/shapeless replacements vs explicit Create process recipes in targeted scripts.
3. Check for recipe deadlocks on:
- andesite machine casing
- deployer
- mechanical crafter
- brass/power/oc2r/space/ae2 casing chain
4. Smoke-check representative outputs in EMI/JEI across each Create process class.

## Deliverable Intent

Next implementation wave should convert the highest-impact replacement-only recipe clusters into explicit Create process recipes while preserving existing progression gates and avoiding early-tier deadlocks.
