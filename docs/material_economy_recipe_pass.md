# Material Economy Recipe Pass

This pass reviews recipes using vanilla underground valuables:

- iron
- copper
- gold
- redstone
- lapis
- diamond
- emerald
- amethyst

The effective recipe dump contains thousands of hits, so the pass is policy-driven rather than a blind global replacement.

## Policy

Low-power or decorative uses may keep vanilla valuables. Examples include basic blocks, trim/building variants, low-impact foods/decorations, and chemistry parity recipes.

High-impact outputs should not be carried by raw vanilla materials alone. For those recipes, vanilla inputs are replaced by one of:

- processed sheets or plates for basic mechanical authority
- Create alloys/mechanisms for automation authority
- Power Grid circuits/relays for electronic control
- OC2R parts for network/local intelligence authority
- space alloys for AE2 entry hardware
- sky steel for mature AE2 systems
- Blood Magic slates for magic authority
- extreme Y-band plates for post-AE2 or very strong utility

## Implemented Surface

KubeJS script:

- `kubejs/server_scripts/30_recipe_replace/115_material_economy_recipe_pass.js`

## Changed Classes

### Vanilla Automation

- Hoppers use `create:iron_sheet` instead of raw iron.
- Pistons use `create:andesite_alloy` instead of raw iron.
- Droppers, dispensers, observers, and detector rails use `powergrid:redstone_relay` instead of loose redstone.
- Rails using iron/gold use processed sheets.
- Quark easy hopper and Aether skyroot piston bypasses are removed.

### Vanilla Magic and Utility

- Enchanting table diamond input is replaced with `bloodmagic:blankslate`.
- Jukebox diamond input is replaced with `minecraft:amethyst_shard`.

### AE2

- AE2 entry hardware uses Creating Space sheets, not raw iron/copper.
- AE2 storage/network recipes use `powergrid:integrated_circuit`, sky steel, reinforced copper, and OC2R network parts.
- Spatial storage cells use deepslate-depth plates.
- AE2 tools use sky steel and power circuits.

Deadlock avoidance: AE2 processor recipes are not globally rewritten, because `kubejs:ae2_machine_casing` already depends on `ae2:engineering_processor`.

### AE2 Addons and Advanced AE

- Oversized AE2 Additions storage uses sky steel and extreme-depth materials instead of vanilla diamonds/redstone.
- AE2 Additions wireless transceiver uses OC2R network parts.
- Advanced AE cards and pattern tools use sky steel or deepslate-depth materials instead of raw vanilla valuables.

### Blood Magic

- `bloodmagic:teleposer` is removed because normal teleport logistics conflicts with the pack thesis.
- Lava crystal and ritual diviner spend Blood Magic slates instead of plain diamonds.
- Experience book spends a Blood Magic slate instead of lapis.

### Ars / Magic

- Strong manipulation glyphs using emeralds now use `occultism:spirit_attuned_gem`.
- Strong mobility/structure glyphs using diamonds now use `bloodmagic:demonslate`.
- Redstone glyphs use `powergrid:redstone_relay`.
- Ars enchanting apparatus and Ars Technica high-impact items use source/machine intermediates instead of plain gems.

### Building Gadgets and Sophisticated Upgrades

- Building Gadgets power ingredients use `powergrid:integrated_circuit` and `create:precision_mechanism`.
- Sophisticated high-impact upgrades use Power Grid circuits or brass casing instead of loose redstone/lapis.

## Deferred

The following remain intentionally out of scope for this pass:

- Decorative block variant recipes from mods like Absent by Design.
- Alchemistry/ChemLib dissolver/combiner parity recipes.
- TCon repair/embellishment recipes where vanilla gems are normal modifier semantics.
- Vanilla low-impact utility unless it creates automation/logistics/magic bypass pressure.
- Full rewrite of every Ars enchantment recipe. Those are better handled as a separate enchantment economy pass.
