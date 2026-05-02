# Raw Material Recipe Audit (Wave A)

Date: 2026-05-01
Repo: `/home/gerald/obelisks`
Scope: raw-material usage and replacement policy for iron/copper/gold/redstone/lapis/diamond/emerald/amethyst, with emphasis on replacement targets: plates, alloys, casts, circuits, coins, extracts.

## Inputs Audited

Primary KubeJS surfaces:

- `kubejs/server_scripts/30_recipe_replace/115_material_economy_recipe_pass.js`
- `kubejs/server_scripts/30_recipe_replace/130_manufactured_plate_recipe_pass.js`
- `kubejs/server_scripts/30_recipe_replace/121_create_stack_integration_gates.js`
- `kubejs/server_scripts/30_recipe_replace/99_machine_casing_progression.js`
- `kubejs/server_scripts/40_recipe_add/65_chemlib_plate_manufacturing_routes.js`
- `kubejs/server_scripts/40_recipe_add/50_create_deposit_preprocessing.js`
- `kubejs/server_scripts/40_recipe_add/60_acid_vat_deposit_slurries.js`
- `kubejs/server_scripts/40_recipe_add/70_food_potion_reagents.js`
- `kubejs/server_scripts/90_dev_debug/10_recipe_audit_dumps.js`

Related economy surface:

- `docs/emerald_loot_coin_replacement_pass.md`

## Evidence Status

The latest generated dump outputs (`kubejs/config/recipe_audit_summary.json`, `kubejs/config/valuable_material_usage_recipes.json`) are not present in this working tree. This audit is therefore source-of-truth from current KubeJS scripts plus prior audit docs.

## Coverage Summary

1. `iron`:
- Broadly replaced in machine/logistics outputs with `create:iron_sheet` or `#forge:plates/iron`.
- Higher tiers move iron-bearing costs to casings, OC2R parts, and sky-steel sheets.
- Deposit processing routes also convert ore identity into Create crushed forms and chemistry outputs.

2. `copper`:
- Broadly replaced with `create:copper_sheet` / `#forge:plates/copper` for machine classes.
- AE2 fluid/storage classes use `creatingspace:reinforced_copper_sheet`.
- Create New Age and Create stack pass uses copper plates and power-era circuits.

3. `gold`:
- Replaced in automation/electronics surfaces with `create:golden_sheet` or `#forge:plates/gold`.
- Additional replacement to power/OC2R/AE2-part intermediates in high-impact outputs.

4. `redstone`:
- Major replacement target is `powergrid:redstone_relay` and `powergrid:integrated_circuit`.
- This replacement is consistently applied to Create control blocks, AE2 cards/cells, OC2R electronics, and utility automation upgrades.

5. `lapis`:
- Selective replacement exists in high-impact outputs (example: Blood Magic experience book -> reinforced slate; building gadget/control classes -> power circuits).
- Not globally rewritten by design.

6. `diamond`:
- Replaced in high-impact surfaces with Blood slates, precision mechanisms, network/electronic intermediates, or sky-steel tier parts.
- Deposit chemistry routes still intentionally emit some direct diamonds as geological identity outputs.

7. `emerald`:
- Recipe-side high-impact replacements include spirit gems / deorum in magic tooling.
- Economy-side conversion away from emerald currency is handled in loot/trade via Dot Coin pass, not only crafting recipes.

8. `amethyst`:
- Replaced in specific power/magic outputs with precision/palladium-tier intermediates.
- Remains intentionally present in low-risk recipes and some material-identity outputs.

## Replacement Mechanism Audit

1. Plates:
- Strong coverage via `#forge:plates/iron|copper|gold|brass` in both material economy and manufactured-part passes.

2. Alloys:
- `create:andesite_alloy` is used as a manufactured replacement for selected vanilla automation outputs and casing progression.

3. Casts:
- Explicit cast-backed routes are present for selected chemlib plates in `65_chemlib_plate_manufacturing_routes.js` (Create pressing + TCon casting table variants).
- Core iron/copper/gold cast-standardization is still mostly implicit through tags/mod recipes, not centrally authored in this pass.

4. Circuits:
- Very strong coverage using `powergrid:redstone_relay`, `powergrid:integrated_circuit`, and OC2R circuit parts.

5. Coins:
- Addressed in loot/trade economy (`dotcoinmod:*_coin`) through dedicated emerald loot replacement pass; this is outside direct crafting recipe rewrites but aligned with stated policy.

6. Extracts:
- Extract pipeline exists in food/potion progression (`kubejs:*_extract`), but not currently used as a general replacement target for the audited eight raw valuables.

## Gaps / Risks

1. No current fresh dump artifacts in `kubejs/config/` for this branch state.
2. `10_recipe_audit_dumps.js` is known to be pre-addition at `ServerEvents.recipes` time; final post-KubeJS graph proof still requires a final-manager dump method.
3. Replacement strategy is output-class driven, not exhaustive global substitution; remaining raw valuable usage is expected in low-impact or intentionally identity-preserving recipes.
4. Cast standardization for base metals (iron/copper/gold) is not explicitly enforced in a dedicated pass.
5. Coin and extract policies are currently parallel tracks; they are not yet unified into one material-policy validator.

## Wave A Conclusion

Raw material replacement is already substantial and coherent for high-impact automation/electronics/magic progression. The strongest implemented levers are plates and circuits, with alloys and casing ladders supporting machine authority. Coin conversion is active in loot/trade surfaces. The main remaining audit need is final effective-recipe verification plus targeted completion for cast-standardization and any remaining high-impact outliers.
