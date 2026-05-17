# Create Stack Integration Pass

## Quest Book Structure

The Create path is now grouped under **Create Systems** and split by player-facing function:

| Chapter | Purpose | Main handoff |
|---|---|---|
| Create Foundations | Seared/Scorched passive Create utilities, andesite alloy, hand power, millstone, deployer, andesite casing, first water/wind SU, clean water, deposit preprocessing | `C1_CRUSHED` |
| Create Components | Andesite machine casing, press, plates, mixer, saw/drill, mechanical crafting, kinetic basin work | `C2_CRAFTER` / `C2_MIXER` |
| Create Brass Automation | Brass ingots/sheets, precision mechanisms, brass machine casing, arms, speed control, observed automation | `C2_BRASS` |
| Create Fluids and Packages | Fluid handling, tanks/drains/spouts, portable interfaces, package network, stock control, Connected/AddLog/AdvLog devices | `CL_CONTENT_FILTERS` |
| Create Power: Heat and Electricity | Water/wind/blaze/diesel/solar heat, Power Grid, New Age heat, coolant, fission | `PG_FISSION_ROD` |
| Create Rail Logistics | Steam 'n Rails, stations, signals, schedules, yards, OC2R dispatch | `C3_OC_DISPATCH` |
| Create Applied Kinetics | Post-AE2 Create/AE bridge and processor automation | `CAK_LOCAL_INTELLIGENCE` |

The chapter layouts stay left-to-right with dependencies visible. Showcase or side systems branch vertically and merge back into a clear handoff node.

## Recipe Integration

Added `kubejs/server_scripts/30_recipe_replace/121_create_stack_integration_gates.js`.

Implemented gates:

- Removes `createadvlogistics:package_wormhole` as an item-teleport logistics bypass.
- Re-authors passive no-SU Create utilities around `kubejs:seared_machine_casing` and `kubejs:scorched_machine_casing`; SU-consuming kinetics remain Andesite+.
- Keeps water wheels and windmill bearings at `kubejs:andesite_machine_casing` as the first passive SU sources, while later SU generation starts at Brass or later.
- Re-authors core package logistics around `kubejs:brass_machine_casing`.
- Re-authors Connected and package-addon logistics around brass components and precision mechanisms.
- Gates `createadvlogistics:redstone_radio` behind OC2R infrastructure.
- Re-authors station/signal/coupler train control recipes behind brass automation.
- Reinforces diesel infrastructure as brass logistics, with larger diesel engines needing `kubejs:electrical_machine_casing`.
- Reintroduces selected Create New Age electric parts after Power Grid so the removed vanilla crafting path does not become a dead end.
- Reinforces Create Applied Kinetics as post-AE2 by replacing bridge inputs with `kubejs:impossible_machine_casing`.

## Notes

- The pass intentionally does not make every decorative Create addon block deep. Decorative/variant content remains shallow unless it affects logistics, power, storage, automation, or remote-site behavior.
- Chunk loading remains separately gated in the existing graph audit pass; package wormholes are removed outright because they conflict with bounded distance and trains-first logistics.
