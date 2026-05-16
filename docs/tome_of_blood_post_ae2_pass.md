# Tome of Blood Post-AE2 Pass

Tome of Blood was moved out of the Altar III side-magic lane and into the post-AE2 hybrid branch.

## Reason

The mod is small, but its outputs are high-leverage:

- Ars spell books can bridge into Blood Magic LP use.
- Sentient glyphs scale through Blood Magic Demon Will combat items.
- Living Mage armor merges Blood Magic Living Armor with Ars armor behavior.

This makes it a better late hybrid combat-magic reward than an early Imbued Slate side branch.

## Recipe Changes

Implemented in `kubejs/server_scripts/30_recipe_replace/166_tome_of_blood_post_ae2_gates.js`.

Removed native bypass recipes:

- Blood Altar tome conversions for novice, apprentice, and archmage tomes.
- Default alchemy-table apprentice and archmage tome upgrades.
- Default Sentient Harm and Sentient Wrath glyph recipes.
- Default Living Mage armor apparatus recipes.

Added post-AE2 replacements using:

- `kubejs:impossible_machine_casing`
- `advanced_ae:quantum_core`
- `advanced_ae:quantum_alloy_plate`
- `bloodmagic:etherealslate`
- `kubejs:sky_steel_sheet`
- `latent_chemlib:gas_reaction_chamber`
- Ars spell books and Demon Will weapons

The old Altar III KubeJS gate was removed from `80_magic_progression_blood_slate_gates.js`.

## Quest Book

Added `config/ftbquests/quests/chapters/tome_of_blood.snbt` via `tools/generate_expert_quest_book.mjs`.

The branch is in Late Matter Branches and depends on:

- AE2 local intelligence / post-AE2 quantum branch
- Source-AE bridge
- Ars Archmage work
- Ethereal Slate

Nodes cover novice tome, apprentice tome, Living Mage armor, Sentient Harm, Sentient Wrath, and Archmage Tome of Blood.

## Validation

`node tools/pack_test_suite.mjs` now verifies:

- the post-AE2 Tome script exists,
- Tome recipes contain the required late materials,
- the old Imbued Slate side-gate is gone,
- the quest book includes Tome of Blood anchors.
