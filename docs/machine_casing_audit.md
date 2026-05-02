# Machine Casing Audit (Wave A)

## Scope and sources inspected

- Generated recipe dump pipeline:
  - `kubejs/server_scripts/90_dev_debug/10_recipe_audit_dumps.js`
  - `kubejs/config/audit_dumps.json`
  - `docs/kubejs_recipe_audit_dumps.md`
- KubeJS progression/gating scripts:
  - `kubejs/server_scripts/30_recipe_replace/99_machine_casing_progression.js`
  - `kubejs/server_scripts/30_recipe_replace/98_starting_progression_bypasses.js`
  - `kubejs/server_scripts/30_recipe_replace/100_high_value_mod_progression_gates.js`
  - `kubejs/server_scripts/30_recipe_replace/120_graph_audit_recipe_gates.js`
- Tier authority catalogue:
  - `kubejs/startup_scripts/00_globals/20_progression_catalogues.js`
- Quest chapters:
  - `config/ftbquests/quests/chapters/tinkers_i.snbt`
  - `config/ftbquests/quests/chapters/tinkers_ii.snbt`
  - `config/ftbquests/quests/chapters/create_components.snbt`
  - `config/ftbquests/quests/chapters/create_brass_automation.snbt`
  - `config/ftbquests/quests/chapters/grid_power.snbt`
  - `config/ftbquests/quests/chapters/oc2r.snbt`
  - `config/ftbquests/quests/chapters/space.snbt`
  - `config/ftbquests/quests/chapters/ae2.snbt`
  - `config/ftbquests/quests/chapters/post_ae2.snbt`

## Generated recipe dumps: current state

- `kubejs/config/audit_dumps.json` is present and enabled (`"enabled": true`).
- At audit time, generated outputs were not present in `kubejs/config/`:
  - `recipe_audit_summary.json`
  - `progression_recipe_mentions.json`
  - `known_bypass_candidate_recipes.json`
  - `full_recipe_index_manifest.json`
- Implication: this report relies on authored KubeJS scripts and quest data, not fresh post-reload dump artifacts.

## Casing tiers and canonical recipe ids

1. TCon seared
- Item: `kubejs:seared_machine_casing`
- Recipe id: `kubejs:machine_casing/seared`

2. TCon scorched
- Item: `kubejs:scorched_machine_casing`
- Recipe id: `kubejs:machine_casing/scorched`

3. Create andesite
- Item: `kubejs:andesite_machine_casing`
- Recipe id: `kubejs:machine_casing/andesite`

4. Create brass
- Item: `kubejs:brass_machine_casing`
- Recipe id: `kubejs:create/sequenced_assembly/machine_casing/brass`

5. Power Grid
- Item: `kubejs:power_grid_machine_casing`
- Recipe id: `kubejs:create/mechanical_crafting/machine_casing/power_grid`

6. OC2R
- Item: `kubejs:oc2r_machine_casing`
- Recipe id: `kubejs:create/mechanical_crafting/machine_casing/oc2r`

7. Space
- Item: `kubejs:space_machine_casing`
- Recipe id: `kubejs:create/mechanical_crafting/machine_casing/space`

8. AE2
- Item: `kubejs:ae2_machine_casing`
- Supporting ids:
  - `kubejs:create/mixing/sky_steel_ingot`
  - `kubejs:create/pressing/sky_steel_sheet`
  - `kubejs:create/mechanical_crafting/machine_casing/ae2`

## Machine-like outputs mapped to casing tier

### tcon seared
- Scripted machine-like outputs (replaceInput-gated):
  - `tconstruct:smeltery_controller`
  - `tconstruct:seared_fuel_tank`
  - `tconstruct:seared_melter`
- Quest milestone node: `5E1A5472D23D62D4` (`Seared Machine Casing`)

### tcon scorched
- Scripted machine-like outputs (replaceInput-gated):
  - `tconstruct:foundry_controller`
  - `tconstruct:scorched_fuel_tank`
  - `tconstruct:alloyer`
- Quest milestone node: `4FF82A40E0CFE52B` (`Scorched Machine Casing`)

### create andesite
- Scripted machine-like outputs (replaceInput-gated):
  - `create:mechanical_press`
  - `create:mechanical_mixer`
  - `create:mechanical_saw`
  - `create:mechanical_drill`
  - `create:mechanical_crafter`
- Explicit graph-gate authored recipe ids:
  - `kubejs:graph_gate/create/fluid_pipe`
  - `kubejs:graph_gate/create/mechanical_pump`
  - `kubejs:graph_gate/create/track_observer`
- Quest milestone node: `747708EE29DA1318` (`Andesite Machine Casing`)

### create brass
- Scripted machine-like outputs (replaceInput-gated):
  - `create:rotation_speed_controller`
  - `create:mechanical_arm`
  - `create:stockpile_switch`
  - `create:content_observer`
  - `create:cart_assembler`
  - `acid_vat:acid_vat`
  - `acid_vat:acid_vat_faucet`
  - `acid_vat:centrifuge_bearing`
  - `acid_vat:centrifuge_anchor`
  - `acid_vat:centrifuge_chamber`
  - `acid_vat:smart_slurry_pipe`
- Explicit graph-gate authored recipe ids:
  - `kubejs:graph_gate/create_connected/sequenced_pulse_generator`
  - `kubejs:graph_gate/create_connected/linked_transmitter`
  - `kubejs:graph_gate/createdieselgenerators/distillation_controller`
  - `kubejs:graph_gate/createdieselgenerators/pumpjack_hole`
  - `kubejs:graph_gate/createdieselgenerators/pumpjack_head`
  - `kubejs:graph_gate/acid_vat/smart_slurry_pipe`
  - `kubejs:graph_gate/acid_vat/portable_slurry_interface`
- Quest milestone node: `D2133DDEB59BA2D1` (`Brass Machine Casing`)

### power grid
- Scripted machine-like outputs (replaceInput-gated):
  - `powergrid:battery`
  - `powergrid:electric_motor`
  - `powergrid:generator_housing`
  - `create_power_loader:empty_andesite_chunk_loader`
  - `create_power_loader:andesite_chunk_loader`
- Explicit graph-gate authored recipe ids:
  - `kubejs:graph_gate/create_new_age/heat_pipe`
  - `kubejs:graph_gate/create_new_age/heat_pump`
  - `kubejs:graph_gate/create_power_loader/empty_andesite_chunk_loader`
- Quest milestone node: `56F1197DFE6AEAC3` (`Power Grid Machine Casing`)

### oc2r
- Scripted machine-like outputs (replaceInput-gated):
  - `oc2r:computer`
  - `oc2r:network_hub`
  - `oc2r:network_connector`
  - `oc2r:disk_drive`
  - `oc2r:monitor`
  - `oc2r:pci_card_cage`
  - `oc2r:charger`
  - `create_power_loader:empty_brass_chunk_loader`
  - `create_power_loader:brass_chunk_loader`
- Explicit graph-gate authored recipe id:
  - `kubejs:graph_gate/create_power_loader/empty_brass_chunk_loader`
- Quest milestone node: `90641BA11E475D58` (`OC2R Machine Casing`)

### space
- Scripted machine-like outputs (replaceInput-gated):
  - `creatingspace:chemical_synthesizer`
  - `creatingspace:air_liquefier`
- Quest milestone node: `50F234860F0786DA` (`Space Machine Casing`)

### ae2
- Scripted machine-like outputs (replaceInput-gated):
  - `ae2:controller`
  - `ae2:drive`
  - `ae2:energy_acceptor`
  - `ae2:interface`
  - `ae2:io_port`
  - `ae2:spatial_io_port`
  - `ae2:charger`
  - `ae2:inscriber`
  - `ae2:vibration_chamber`
  - `ae2:condenser`
  - `ae2:molecular_assembler`
  - `ae2:pattern_provider`
- Explicit graph-gate authored recipe id:
  - `kubejs:graph_gate/expatternprovider/oversize_interface`
- Quest milestone node: `8C645968D65FE74D` (`AE2 Machine Casing`)

### post-ae2
- No `kubejs:post_ae2_machine_casing` item exists.
- Operationally, post-AE2 outputs are gated mostly via `kubejs:ae2_machine_casing` plus additional materials/systems in post-AE2 scripts and chapter `post_ae2.snbt`.

## Bypasses and exceptions

## Removed bypass routes (exact ids)

- Andesite alloy shortcut removals:
  - `create:crafting/materials/andesite_alloy`
  - `create:crafting/materials/andesite_alloy_from_zinc`
  - `create:crafting/materials/andesite_alloy_from_block`
  - `create:crafting/materials/andesite_alloy_block`
  - `create:mixing/andesite_alloy`
  - `create:mixing/andesite_alloy_from_zinc`
  - `create:cutting/andesite_alloy`
  - `tconstruct:casting_basin/compat/create/andesite_alloy_iron`
  - `tconstruct:casting_basin/compat/create/andesite_alloy_zinc`
- Andesite casing item-application bypass removals:
  - `create:item_application/andesite_casing_from_log`
  - `create:item_application/andesite_casing_from_wood`
  - plus blanket remove on output/type: `{ output: 'create:andesite_casing', type: 'create:item_application' }`
- Teleport/chunk-loader bypass removals:
  - `vampirism:crossbow_arrow_teleport`
  - `naturesaura:chunk_loader`
- Infinite-scale storage/flight removals:
  - `sophisticatedbackpacks:infinity_upgrade`
  - `sophisticatedbackpacks:survival_infinity_upgrade`
  - `sophisticatedstorage:infinity_upgrade`
  - `expatternprovider:infinity_cell`
  - `advanced_ae:flight_card`
  - `advanced_ae:flight_drift_card`

## Intentional progression exceptions (deadlock avoidance)

- `create:deployer` is intentionally not gated by andesite casing, because andesite casing itself is authored via deploying (`kubejs:create/deploying/andesite_casing`).
- `powergrid:conductive_casing` and `powergrid:circuit_design_table` are intentionally not gated by power-grid casing because they are power-grid casing ingredients.
- `creatingspace:rocket_engineer_table` and `creatingspace:rocket_casing` are intentionally not gated by space casing because they are space-casing ingredients.
- `ae2:inscriber` and `ae2:charger` are intentionally not pre-gated out of AE2 precursor work; AE2 casing depends on `ae2:engineering_processor` and sky-steel chain.

## Places where exact ids are not available

- Most tier enforcement in `99_machine_casing_progression.js` and `100_high_value_mod_progression_gates.js` is done via `event.replaceInput({ output: ... }, oldInput, newInput)`.
- For those cases, exact *output ids* are available (listed above), but individual underlying original recipe ids are not enumerated by the script itself.
- Fresh generated dumps (`progression_recipe_mentions.json`, `full_recipe_index_####.json`) would be needed to enumerate every affected concrete recipe id instance after load.
