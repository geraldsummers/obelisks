# Machine Casing Asset Notes

## Design Direction

The casing textures are pack-owned assets for the expert progression casing ladder. They are intentionally more distinct than recolors because each tier represents another manufacturing authority being embedded into every later block machine.

## Tier Visual Language

- `kubejs:seared_machine_casing`: seared ceramic brick, riveted frame, contained molten core.
- `kubejs:scorched_machine_casing`: dark foundry brick, triangular furnace throat, hotter red-orange seams.
- `kubejs:andesite_machine_casing`: grey Create-style casing, bevels, rivets, gear-like center.
- `kubejs:brass_machine_casing`: polished brass precision housing, gold panels, small teal control spark.
- `kubejs:airtight_machine_casing`: PNCR-inspired pressure casing with compressed-iron framing, glass pressure panels, gasket seams, and gauge markings.
- `kubejs:electrical_machine_casing`: dark conductive shell, copper traces, green circuit pads.
- `kubejs:circuited_machine_casing`: black terminal/computer shell, neon status screen and IO traces.
- `kubejs:space_machine_casing`: pale rocket shell, dark structural frame, blue porthole/propulsion accent, red hazard stripe.
- `kubejs:raw_impossible_casing`: unfinished sky-stone body with exposed fluix lattice and raw blood-binding seams.
- `kubejs:impossible_machine_casing`: dark sky-stone/controller casing, fluix/cyan grid lights and purple controller accent.

## Asset Inspiration

The palettes and motifs were derived from local mod assets in the playtest instance:

- TConstruct seared/scorched bricks and controller faces.
- Create andesite/brass casings and mechanical casings.
- PneumaticCraft pressure chamber wall/glass, compressed iron, pressure tubes, and gauges.
- Create: Power Grid conductive casing and circuit board textures.
- OC2R computer textures and terminal overlays.
- Creating Space rocket casing and rocket-control textures.
- AE2 controller, sky stone, fluix, and processor textures.

The generated textures are original pack-owned pixel assets rather than copied mod textures.

## Files

- Blockstates: `kubejs/assets/kubejs/blockstates/*_machine_casing.json`
- Block models: `kubejs/assets/kubejs/models/block/*_machine_casing.json`
- Item models: `kubejs/assets/kubejs/models/item/*_machine_casing.json`
- Textures: `kubejs/assets/kubejs/textures/block/*_machine_casing_*.png`
- Preview sheet: `docs/machine_casing_texture_sheet.png`

The current texture filenames match the current casing IDs. Retired names such as `ae2_machine_casing`, `oc2r_machine_casing`, and `power_grid_machine_casing` are guarded against by `tools/validate_chemistry_identity.mjs`.
