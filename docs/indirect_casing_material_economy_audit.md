# Indirect Casing Material Economy Audit

Date: 2026-05-16

## Question

Not every important item should contain a machine casing directly. Many items
should instead become valuable because they are only made on machines whose
recipes are casing-gated.

This audit checks that second path: cased machine surface -> component/material
output -> later economy use.

## Tool

Audit script:

- `tools/audit_indirect_casing_economy.mjs`

Generated evidence:

- `docs/generated/indirect_casing_economy_audit.json`

The tool executes authored KubeJS recipe scripts in a fake recipe event, records
machine-surface recipes and recipe removals, then folds in base mod recipe-dump
machine surfaces. Runtime dumps are useful for non-KubeJS base recipes, but the
current dump set still lacks KubeJS recipes, so this remains a hybrid
source-plus-dump audit rather than a full runtime proof.

## Result

Summary from the current run:

| Metric | Count |
| --- | ---: |
| KubeJS source recipes observed | 2,740 |
| Runtime dump recipes observed | 23,169 |
| Cased machine-surface recipes observed | 4,757 |
| Valuable indirect outputs | 717 |
| Direct casing-input outputs on cased surfaces | 1 |
| Active direct casing consumers | 1 |
| Aesthetic direct casing consumers | 0 |
| Simple recipe bypass candidates | 113 |
| Benign classified bypass candidates | 113 |
| Actionable component bypass candidates | 0 |
| Source eval warnings | 0 |

Most simple bypass candidates are intentionally not component-economy problems:
raw ingots, nuggets, storage blocks, wooden pressure plates, decorative weathered
plates, and reversible orientation conversions. `quark:rusty_iron_plate` is
classified as decorative weathering, and `powergrid:generator_commutator` is
classified as a reversible horizontal/vertical conversion rather than a material
economy leak.

## Coverage By Gate

| Gate | Indirect valuable outputs | Identity |
| --- | ---: | --- |
| `kubejs:andesite_machine_casing` | 515 | Create bulk processing, ore chemistry, sheets, acids, salts, crushed outputs |
| `kubejs:airtight_machine_casing` | 121 | PNCR pressure chemistry, PCBs, PVC, sealed salts, high-pressure molecules, OC2R board stock |
| `kubejs:brass_machine_casing` | 25 | Sequenced parts and staged manufactured components |
| `kubejs:electrical_machine_casing` | 14 | Create New Age energising, overcharged power parts, coils, electromagnets, gauges, connectors |
| `kubejs:seared_machine_casing` | 65 | TCon molten/casting legitimacy and plate routes |
| Blood Magic authority | 49 | Magic alternative element recovery and life-force components |
| Ars Nouveau authority | 11 | Purified-source alternatives for selected chemistry outputs |

## Interpretation

The pack already uses the indirect-gating pattern substantially.

Strong examples:

- Standard Create processing outputs become valuable because SU-consuming
  presses, mixers, crushing wheels, saws, millstones, and kinetic workcells
  are behind Andesite casing. Passive no-SU Create utilities such as basins,
  depots, chutes, tanks, drains, and spouts intentionally sit earlier at
  Seared/Scorched casing.
- Ore acid/ball outputs are indirectly Andesite-gated through Create mixing,
  then acid identity and ball retention make the same deposit produce different
  economies.
- PNCR outputs such as `pneumaticcraft:printed_circuit_board`,
  `chemlib:polyvinyl_chloride`, `chemlib:copper_chloride`, nitrates, sulfates,
  and sealed molecule steps are indirectly Airtight-gated through pressure
  chamber or thermopneumatic processing.
- `latent_chemlib:sealed_chemical_cell`, `oc2r:raw_silicon_wafer`,
  `oc2r:silicon_wafer`, `oc2r:transistor`, `oc2r:circuit_board`,
  `oc2r:bus_cable`, and `oc2r:network_connector` now come from PNCR
  pressure/assembly surfaces instead of plain crafting. Those parts feed
  Circuited casing, programmable-control hardware, and AE2 processor closure.
- Electrical machine surfaces now include Create New Age energising. Current
  Electrical indirect outputs include `powergrid:heating_coil`,
  `powergrid:carbon_pile_coil`, `powergrid:electromagnet`, and
  `powergrid:electrical_gizmo`, plus the base overcharged Create New Age parts.
- `create:precision_mechanism` and
  `kubejs:rotational_compressor_core` are indirect Brass/staged-manufacturing
  components.
- Small Create logistics fittings, pressure tubes, power gauges/connectors,
  OC2R cards/modules, space wearables/fabric, and AE2 addon interface parts no
  longer contain whole machine casings directly. They are now made through
  sequenced assembly, PNCR pressure/assembly work, Create New Age energising,
  or mechanical crafting while spending casing-derived components.
- TCon plate/casting routes give molten materials value without putting casings
  into every plate recipe.
- Blood Magic and Ars provide non-tech alternatives for selected element and
  chemistry outputs without pretending to be machine casings.

## Remaining Gaps

The indirect material economy is now complete enough for the current pack
shape: early/mid tiers produce broad material families, Airtight produces sealed
chemistry and programmable-board stock, and Electrical produces energised power
components. Circuited, Space, Raw Impossible, and Impossible remain deliberately
stronger as direct authority/machine gates than as broad generic material
producers.

Do not flatten those late tiers into another generic dust/plate ladder unless a
new machine surface exists for them. Better future additions would be narrow and
identity-heavy:

- Circuited: firmware modules, bus controllers, programmable control cards.
- Space: thermal composites, sealed hull laminates, oxygen-system membranes.
- Impossible: spatial matrices, fluix logic wafers, impossible machine
  subassemblies.

## Completion Changes

Implemented in:

- `kubejs/server_scripts/30_recipe_replace/142_late_tier_material_economy_completion.js`
- `kubejs/server_scripts/30_recipe_replace/137_casing_aesthetic_component_routes.js`
- `tools/audit_indirect_casing_economy.mjs`

Recipe changes:

- Reworked aesthetic casing offenders so small fittings, portable interfaces,
  tubes, gauges, cards, wearables, fabric, and interface parts are outputs of
  casing-gated machine surfaces instead of direct casing crafts.
- Removed direct Impossible casing from Tome of Blood mage armor, purified
  source core, novice tome, and Sentient Harm glyph in favor of impossible
  circuits, living binding, source core, AE2 controller, and other
  casing-derived authority.
- Moved `latent_chemlib:sealed_chemical_cell` to PNCR pressure chamber output.
- Reauthored the first `create_new_age:basic_energiser` to use normal authored
  copper wire, breaking the bootstrap loop where the first energiser required
  already-energised wire.
- Reauthored OC2R wafer, transistor, circuit board, bus cable, and network
  connector stock through PNCR pressure chamber/assembly recipes.
- Added Electrical-tier energising routes for Power Grid heating coils, carbon
  pile coils, electromagnets, and electrical gizmos.
- Made AE2 processor and core/card recipes spend OC2R board/transistor outputs
  where KubeJS replacement can reach the recipes.
- Made selected rocket/gas recipes prefer Creating Space engine-wall/injector
  subassemblies and Power Grid gizmos over plain sheet/motor placeholders.

## Validation Caveat

The current full recipe dumps still contain no KubeJS recipes and no KubeJS
casing references. This audit is therefore source-level for authored KubeJS and
dump-level only for base mod recipe surfaces. A full runtime proof requires
syncing/reloading the current pack, regenerating `full_recipe_index_*.json`,
and rerunning:

```bash
node tools/audit_indirect_casing_economy.mjs
```
