# High-Value Mod Progression Audit

This pass audits installed mods for systems that can bypass the pack thesis: bounded matter, bounded distance, authored logistics, local AE2, no creative flight, and no infinite storage.

Implementation surface: `kubejs/server_scripts/30_recipe_replace/100_high_value_mod_progression_gates.js`.

## MUST DO

### Disable Infinite Storage

- Proposal: remove craftability for Sophisticated infinity upgrades and Extended Pattern Provider infinity cell.
- Evidence: confirmed items `sophisticatedbackpacks:infinity_upgrade`, `sophisticatedbackpacks:survival_infinity_upgrade`, `sophisticatedstorage:infinity_upgrade`, and `expatternprovider:infinity_cell` in registry/recipe dumps.
- Why it fits the design: prevents infinite storage from replacing local infrastructure and physical logistics.
- Risk: if these items exist only as loot, loot tables still need a later audit.
- Implementation surface: recipe output removal.
- Confidence level: High.

### Remove Creative Flight Upgrade Path

- Proposal: remove Advanced AE `flight_card` and `flight_drift_card` recipes.
- Evidence: recipe dump contains `advanced_ae/minecraft/crafting_shaped/flight_card.json`; item registry confirms both cards.
- Why it fits the design: direct creative-flight-style upgrade conflicts with no creative flight.
- Risk: if loot awards cards, loot tables need a later audit.
- Implementation surface: recipe output removal.
- Confidence level: High.

### Gate Chunk Loading

- Proposal: gate Create Power Loader chunk loaders behind Power Grid and OC2R casings.
- Evidence: recipes use `create:andesite_casing`, `create:brass_casing`, `create:precision_mechanism`, and `minecraft:respawn_anchor`.
- Why it fits the design: remote-site infrastructure should require power/computing logistics rather than appear at basic Create.
- Risk: may be too strict for early outposts; playtest should decide whether Power Grid tier is enough.
- Implementation surface: replace chunk-loader recipe inputs with `kubejs:power_grid_machine_casing` and `kubejs:oc2r_machine_casing`.
- Confidence level: High.

### Remove Package Wormhole

- Proposal: remove `createadvlogistics:package_wormhole` craftability.
- Evidence: item registry confirms package wormhole; name and mod role indicate non-physical logistics bypass.
- Why it fits the design: package wormholes directly undermine trains and distance.
- Risk: if the item is decorative or inert, this is stricter than necessary, but safe for thesis.
- Implementation surface: recipe output removal.
- Confidence level: Medium.

## SHOULD DO

### Gate Build Tools

- Proposal: place Building Wands and Building Gadgets on Power Grid, OC2R, and Space tiers.
- Evidence: recipe dumps show Building Gadgets recipes are simple diamond/emerald/redstone crafts; Wands diamond wand is a diamond+sticks recipe.
- Why it fits the design: mass building tools are valuable infrastructure accelerators, not first-night shortcuts.
- Risk: recipe replacement may need runtime tuning if exact ingredients differ across generated recipes.
- Implementation surface: replace diamond/emerald/redstone/ender-pearl inputs by casing tiers.
- Confidence level: High.

### Gate Sophisticated Automation

- Proposal: allow basic backpacks/storage, but gate backpack automation, stack upgrades, storage controllers, and high tier upgrades.
- Evidence: registry and recipes confirm many backpack/storage automation upgrades.
- Why it fits the design: early carry is useful; automated/centralized storage competes with authored logistics and AE2.
- Risk: some recipes may become expensive due to multiple matching replaced inputs.
- Implementation surface: recipe input replacement and infinite-upgrade removals.
- Confidence level: Medium-High.

### Gate AE2 Addons

- Proposal: gate wireless, requester, extended pattern, oversized crafting, and high storage cells behind OC2R/AE2/Space casings.
- Evidence: registry confirms AE2 Additions, AE2 Things, Advanced AE, ME Requester, and Extended Pattern Provider items.
- Why it fits the design: AE2 should be local site intelligence; remote/wireless/oversized automation should be late and expensive.
- Risk: exact addon recipe IDs vary; output-based replacement is broad but should be checked in EMI.
- Implementation surface: recipe input replacement and infinite-cell removal.
- Confidence level: Medium-High.

### Gate Apotheosis And Enchanting Industry

- Proposal: parent Apotheosis reforging/salvaging/gem cutting and Create Enchantment Industry to Blood Magic slate tiers.
- Evidence: recipe dumps show Apotheosis table/shelf recipes and Create Enchantment Industry machine recipes.
- Why it fits the design: these are combat/adventure power multipliers and should not bypass Blood Magic as the magic backbone.
- Risk: Apotheosis has loot/spawner systems beyond crafting; later config/loot audit is needed.
- Implementation surface: replace table/shelf/machine inputs with Imbued/Demonic/Ethereal slates.
- Confidence level: Medium.

### Gate Late Create Logistics

- Proposal: gate electronic/logistics add-ons while leaving physical rail logistics encouraged.
- Evidence: registry confirms Create Additional Logistics and Create Advanced Logistics package tools/radio/filter.
- Why it fits the design: trains and physical routes stay core; abstract logistics needs brass-era infrastructure.
- Risk: some recipe IDs may use unexpected ingredients and escape output-based replacement.
- Implementation surface: input replacement and package wormhole removal.
- Confidence level: Medium.

## MAYBE

### Gate Nature's Compass

- Proposal: consider a coin or exploration-gated Nature's Compass recipe later.
- Evidence: recipe is cheap saplings/logs/compass.
- Why it fits the design: biome finding can reduce terrain discovery friction too much.
- Risk: it may be valuable accessibility for a giant pack; not changed in this pass.
- Implementation surface: recipe rewrite.
- Confidence level: Medium.

### Gate Relics/Artifacts Loot

- Proposal: audit loot tables for Relics and Artifacts progression leaks.
- Evidence: many powerful items are registry-confirmed but mostly loot-sourced, not recipe-sourced.
- Why it fits the design: movement, food, magnet, and combat relics can bypass survival/adventure progression.
- Risk: loot gating requires loot-table knowledge and playtest balance.
- Implementation surface: LootJS or datapack loot modifiers.
- Confidence level: Medium.

## DO NOT DO

### Do Not Gate Decorative Mods Broadly

- Proposal: leave furniture, building blocks, ambience, client/QOL, and library mods alone unless a specific bypass appears.
- Evidence: mod list contains many decorative/client/library mods.
- Why it fits the design: gating them adds noise without strengthening progression.
- Risk: individual decorative mods may include one utility block; later targeted audit can catch those.
- Implementation surface: none.
- Confidence level: High.
