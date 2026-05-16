# Food Effect And Potion Engineering Pass Plan

## Dump Audit

- Food dump: `../.local/share/PrismLauncher/instances/Bound to Matter-Playtest 3 - v1/minecraft/kubejs/config/food_effect_index.json`
- Foods scanned: 1035
- Foods with direct effects: 517
- Distinct direct effects: 58
- Recipe graph: 29130 recipes from `../.local/share/PrismLauncher/instances/Bound to Matter-Playtest 3 - v1/minecraft/kubejs/config/full_recipe_index_manifest.json`

## Existing Brewing Surfaces

| Recipe type | Count |
| --- | ---: |
| create:filling | 127 |
| create:emptying | 98 |
| brewinandchewin:keg_pouring | 62 |
| farmersrespite:kettle_pouring | 47 |
| farmersrespite:brewing | 47 |
| bloodmagic:flask_potionlength | 46 |
| bloodmagic:flask_potionpotency | 32 |
| brewinandchewin:fermenting | 31 |
| reliquary:potion_effects | 19 |
| bloodmagic:flask_potioneffect | 14 |
| bloodmagic:flask_potiontransform | 13 |
| createdieselgenerators:basin_fermenting | 6 |
| tconstruct:casting_table_potion | 4 |
| createdieselgenerators:bulk_fermenting | 4 |
| ars_nouveau:potion_flask | 3 |
| bloodmagic:flask_potionfill | 2 |
| bloodmagic:flask_potionflasktransform | 2 |
| bloodmagic:flask_potioncycle | 1 |
| brewinandchewin:create_potion_pouring | 1 |
| bloodmagic:arc_potion | 1 |
| apotheosis:potion_charm_enchanting | 1 |
| apotheosis:potion_charm | 1 |

## Design Direction

Food preparation should become potion engineering, not sit beside vanilla brewing. The player first learns to preserve, steep, cook, and ferment for nutrition. The next step is to isolate the same biological sources into controlled effects.

The vanilla brewing stand should stop being the main potion recipe authority. It can remain as a bottling/finishing station or as an ingredient in later apparatus, but Nether Wart plus arbitrary vanilla reagents should not bypass the food graph.

## Implementation Model

1. `Kettle infusion`: short, clean, plant-forward extracts from water, tea, juice, and simple food sources.
2. `Keg fermentation`: stronger, slower, riskier concentrates from alcohol, nether heat, sugars, proteins, and region-specific crops.
3. `Create bottling`: mechanical filling/emptying for scale, not new effect discovery.
4. `Vanilla brewing stand`: remove vanilla potion mixes with `MoreJSEvents.registerPotionBrewing`; re-add only pack-authored finishing recipes if needed.
5. `Magic potion systems`: Blood Magic, Botania, Ars, Reliquary, and TCon potion systems become later amplification/specialization layers, not early effect discovery.

## Proposed Effect Source Catalogue

### minecraft:haste

- Stage: `kettle_infusion`
- Preferred source ingredients: `farmersrespite:green_tea_leaves`, `farmersrespite:coffee_beans`
- Foods currently proving this effect: 24

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `farmersrespite:long_green_tea` | 270s | 1 | none |
| `create:builders_tea` | 180s | 1 | none |
| `collectorsreap:lime_green_tea` | 180s | 1 | none |
| `collectorsreap:reanimators_garden` | 120s | 3 | none |
| `farmersrespite:green_tea` | 180s | 1 | none |
| `farmersrespite:strong_green_tea` | 90s | 2 | none |

### minecraft:speed

- Stage: `kettle_infusion`
- Preferred source ingredients: `farmersrespite:coffee_beans`, `create:bar_of_chocolate`, `minecraft:sugar`
- Foods currently proving this effect: 52

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `collectorsreap:reanimators_garden` | 120s | 3 | none |
| `collectorsreap:chocolate_gummy` | 10s | 5 | none |
| `rusticdelight:coffee` | 90s | 1 | none |
| `rusticdelight:syrup_coffee` | 90s | 1 | none |
| `delightful:rock_candy` | 30s | 2 | sugars |
| `collectorsreap:chocolate_cannoli` | 30s | 2 | none |

### minecraft:night_vision

- Stage: `kettle_infusion`
- Preferred source ingredients: `ubesdelight:ube`, `minecraft:golden_carrot`, `collectorsreap:carrot_gummy`
- Foods currently proving this effect: 10

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `creatingspace:space_food` | 3600s | 2 | none |
| `ubesdelight:ensaymada_ube` | 180s | 1 | none |
| `ubesdelight:pandesal_ube` | 180s | 1 | none |
| `ubesdelight:hopia_ube` | 180s | 1 | none |
| `collectorsreap:carrot_gummy` | 60s | 1 | none |
| `ubesdelight:milk_tea_ube` | 60s | 1 | none |

### minecraft:water_breathing

- Stage: `kettle_infusion`
- Preferred source ingredients: `delightful:salmonberries`, `minecraft:sea_pickle`, `minecraft:pufferfish`
- Foods currently proving this effect: 9

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `immersive_weathering:enchanted_golden_moss_clump` | 80s | 3 | none |
| `delightful:salmon_and_roe_blini` | 60s | 1 | none |
| `brewinandchewin:salty_folly` | 90s | 1 | none |
| `collectorsreap:rose_moon` | 90s | 1 | none |
| `delightful:salmonberry_ice_cream` | 60s | 1 | none |
| `delightful:salmonberry_gummy` | 45s | 1 | none |

### minecraft:fire_resistance

- Stage: `keg_distillation`
- Preferred source ingredients: `delightful:cactus_chili`, `mynethersdelight:hot_spice`, `minecraft:magma_cream`
- Foods currently proving this effect: 21

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `minecraft:enchanted_golden_apple` | 300s | 1 | fruits |
| `collectorsreap:prickly_pear_gummy` | 90s | 1 | none |
| `delightful:cactus_chili` | 60s | 1 | none |
| `collectorsreap:spicy_grenadine_jelly` | 60s | 1 | none |
| `mynethersdelight:enchanted_golden_egg` | 60s | 1 | none |
| `collectorsreap:wild_berry_gummy` | 5s | 3 | none |

### minecraft:regeneration

- Stage: `keg_distillation`
- Preferred source ingredients: `farmersrespite:rose_hips`, `collectorsreap:strawberry`, `minecraft:ghast_tear`
- Foods currently proving this effect: 57

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `ends_delight:fried_dragon_egg` | 240s | 3 | none |
| `collectorsreap:reanimators_garden` | 120s | 4 | none |
| `ends_delight:steamed_dragon_egg` | 60s | 3 | none |
| `ends_delight:roasted_dragon_steak` | 25s | 2 | none |
| `ends_delight:liquid_dragon_egg` | 60s | 1 | none |
| `ends_delight:dragon_breath_and_chorus_soup` | 20s | 2 | none |

### minecraft:resistance

- Stage: `keg_distillation`
- Preferred source ingredients: `farmersrespite:yellow_tea_leaves`, `delightful:cantaloupe`, `undergarden:ink_mushroom`
- Foods currently proving this effect: 36

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `ends_delight:fried_dragon_egg` | 240s | 3 | none |
| `minecraft:enchanted_golden_apple` | 300s | 1 | fruits |
| `delightful:azalea_tea` | 240s | 2 | none |
| `farmersrespite:long_yellow_tea` | 270s | 1 | none |
| `farmersrespite:yellow_tea` | 180s | 1 | none |
| `ends_delight:steamed_dragon_egg` | 60s | 3 | none |

### minecraft:strength

- Stage: `keg_distillation`
- Preferred source ingredients: `brewinandchewin:red_rum`, `collectorsreap:pomegranate`, `minecraft:blaze_powder`
- Foods currently proving this effect: 21

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `ends_delight:fried_dragon_egg` | 240s | 3 | none |
| `ends_delight:steamed_dragon_egg` | 60s | 3 | none |
| `ends_delight:dragon_breath_and_chorus_soup` | 60s | 2 | none |
| `collectorsreap:asparagus_aspic` | 10s | 4 | none |
| `ends_delight:liquid_dragon_egg` | 60s | 1 | none |
| `collectorsreap:deific_blood` | 90s | 1 | none |

### minecraft:absorption

- Stage: `kettle_infusion`
- Preferred source ingredients: `minecraft:golden_apple`, `mynethersdelight:enchanted_golden_egg`
- Foods currently proving this effect: 13

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `minecraft:enchanted_golden_apple` | 120s | 4 | fruits |
| `ends_delight:dragon_leg_with_sauce` | 75s | 3 | none |
| `ends_delight:dragon_meat_stew` | 75s | 3 | none |
| `immersive_weathering:enchanted_golden_moss_clump` | 80s | 3 | none |
| `ends_delight:steamed_dragon_egg` | 60s | 3 | none |
| `minecraft:golden_apple` | 120s | 1 | fruits |

### minecraft:slow_falling

- Stage: `kettle_infusion`
- Preferred source ingredients: `delightful:marshmallow_stick`, `minecraft:phantom_membrane`
- Foods currently proving this effect: 3

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `undergarden:veiled_stew` | 30s | 1 | none |
| `delightful:smore` | 10s | 1 | none |
| `delightful:cooked_marshmallow_stick` | 15s | 1 | none |

### minecraft:jump_boost

- Stage: `kettle_infusion`
- Preferred source ingredients: `undergarden:gloomper_leg`, `minecraft:rabbit_foot`
- Foods currently proving this effect: 2

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `collectorsreap:banana_gummy` | 10s | 3 | none |
| `undergarden:gloomper_leg` | 30s | 1 | none |

### minecraft:poison

- Stage: `dangerous_extraction`
- Preferred source ingredients: `minecraft:spider_eye`, `minecraft:pufferfish`, `minecraft:poisonous_potato`
- Foods currently proving this effect: 6

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `minecraft:pufferfish` | 60s | 2 | proteins |
| `supplementaries:soap` | 6s | 3 | none |
| `minecraft:poisonous_potato` | 5s | 1 | vegetables |
| `minecraft:spider_eye` | 5s | 1 | proteins |
| `mynethersdelight:strider_slice` | 10s | 1 | none |
| `tconstruct:venom_bottle` | 13s | 1 | none |

### minecraft:weakness

- Stage: `dangerous_extraction`
- Preferred source ingredients: `farmersrespite:purulent_tea`, `minecraft:fermented_spider_eye`
- Foods currently proving this effect: 7

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `brewinandchewin:withering_dross` | 150s | 1 | none |
| `collectorsreap:stygian_pomegranate` | 9s | 2 | fruits |
| `occultism:demons_dream_essence` | 15s | 2 | none |
| `farmersrespite:purulent_tea` | 30s | 1 | none |
| `farmersrespite:strong_purulent_tea` | 30s | 1 | none |
| `farmersrespite:nether_wart_sourdough` | 10s | 1 | none |

### minecraft:levitation

- Stage: `dangerous_extraction`
- Preferred source ingredients: `ends_delight:shulker_meat`, `minecraft:shulker_shell`
- Foods currently proving this effect: 13

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `ends_delight:shulker_omelette` | 5s | 2 | none |
| `ends_delight:stir_fried_shulker_meat` | 5s | 2 | none |
| `ends_delight:shulker_soup` | 5s | 2 | none |
| `ends_delight:ender_noodle` | 3s | 2 | none |
| `ends_delight:grilled_shulker` | 2s | 2 | none |
| `ends_delight:roasted_shulker_meat` | 4s | 2 | none |

### minecraft:glowing

- Stage: `kettle_infusion`
- Preferred source ingredients: `minecraft:glow_berries`, `minecraft:glow_ink_sac`
- Foods currently proving this effect: 11

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `collectorsreap:hemp_gummy` | 60s | 5 | none |
| `delightful:glow_jam_jar` | 60s | 1 | none |
| `undergarden:droopvine_item` | 30s | 1 | fruits |
| `occultism:demons_dream_essence` | 15s | 2 | none |
| `collectorsreap:glow_berry_gummy` | 30s | 1 | none |
| `brewinandchewin:glittering_grenadine` | 30s | 1 | none |

### minecraft:luck

- Stage: `kettle_infusion`
- Preferred source ingredients: `occultism:otherworld_essence`, `minecraft:rabbit_foot`
- Foods currently proving this effect: 2

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `occultism:demons_dream_essence` | 300s | 2 | none |
| `occultism:otherworld_essence` | 300s | 2 | none |

### farmersdelight:comfort

- Stage: `kitchen_infrastructure`
- Preferred source ingredients: `farmersrespite:rose_hips`, `farmersdelight:chicken_soup`
- Foods currently proving this effect: 63

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `brewinandchewin:fiery_fondue` | 420s | 1 | none |
| `mynethersdelight:spicy_noodle_soup` | 300s | 1 | none |
| `farmersdelight:baked_cod_stew` | 300s | 1 | none |
| `farmersdelight:chicken_soup` | 300s | 1 | none |
| `farmersdelight:fried_rice` | 300s | 1 | none |
| `farmersdelight:noodle_soup` | 300s | 1 | none |

### farmersdelight:nourishment

- Stage: `kitchen_infrastructure`
- Preferred source ingredients: `farmersdelight:cabbage`, `farmersdelight:ham`, `brewinandchewin:scarlet_pierogi`
- Foods currently proving this effect: 111

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `brewinandchewin:scarlet_pierogi` | 420s | 1 | none |
| `farmersdelight:honey_glazed_ham` | 300s | 1 | fruits, grains, proteins, sugars |
| `farmersdelight:roast_chicken` | 300s | 1 | grains, proteins, vegetables |
| `farmersdelight:stuffed_pumpkin` | 300s | 1 | fruits, grains, vegetables |
| `farmersdelight:shepherds_pie` | 300s | 1 | proteins, vegetables |
| `ends_delight:roasted_dragon_steak` | 300s | 1 | none |

### farmersrespite:caffeinated

- Stage: `kitchen_infrastructure`
- Preferred source ingredients: `farmersrespite:coffee_beans`, `farmersrespite:green_tea_leaves`
- Foods currently proving this effect: 19

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `farmersrespite:long_coffee` | 600s | 1 | none |
| `farmersrespite:coffee` | 300s | 2 | none |
| `delightful:ender_nectar` | 180s | 3 | none |
| `delightful:berry_matcha_latte` | 180s | 2 | none |
| `delightful:matcha_latte` | 180s | 2 | none |
| `farmersrespite:strong_coffee` | 150s | 3 | none |

### brewinandchewin:intoxication

- Stage: `keg_distillation`
- Preferred source ingredients: `brewinandchewin:vodka`, `brewinandchewin:mead`
- Foods currently proving this effect: 22

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `brewinandchewin:dread_nog` | 210s | 1 | none |
| `brewinandchewin:pale_jane` | 150s | 1 | none |
| `brewinandchewin:salty_folly` | 150s | 1 | none |
| `brewinandchewin:vodka` | 150s | 1 | none |
| `brewinandchewin:withering_dross` | 150s | 1 | none |
| `collectorsreap:rose_moon` | 150s | 1 | none |

### brewinandchewin:raging

- Stage: `keg_distillation`
- Preferred source ingredients: `brewinandchewin:red_rum`, `collectorsreap:deific_blood`
- Foods currently proving this effect: 3

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `brewinandchewin:red_rum` | 120s | 1 | none |
| `collectorsreap:deific_blood` | 120s | 1 | none |
| `brewinandchewin:bloody_mary` | 60s | 1 | none |

### brewinandchewin:sweet_heart

- Stage: `keg_distillation`
- Preferred source ingredients: `brewinandchewin:mead`, `minecraft:honey_bottle`
- Foods currently proving this effect: 5

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `collectorsreap:reanimators_garden` | 120s | 5 | none |
| `brewinandchewin:saccharine_rum` | 180s | 1 | none |
| `collectorsreap:heavens_cream` | 120s | 3 | none |
| `collectorsreap:hermits_sour` | 120s | 2 | none |
| `brewinandchewin:mead` | 120s | 1 | none |

### mynethersdelight:b_pungent

- Stage: `kitchen_infrastructure`
- Preferred source ingredients: `delightful:cactus_chili`, `mynethersdelight:hot_spice`
- Foods currently proving this effect: 14

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `mynethersdelight:spicy_curry` | 300s | 2 | none |
| `mynethersdelight:hot_wings_bucket` | 180s | 1 | none |
| `mynethersdelight:rock_soup` | 60s | 3 | none |
| `mynethersdelight:spicy_noodle_soup` | 60s | 2 | none |
| `mynethersdelight:spicy_hoglin_stew` | 60s | 2 | none |
| `mynethersdelight:fried_hoglin_chop` | 60s | 1 | none |

### ars_nouveau:mana_regen

- Stage: `magic_distillation`
- Preferred source ingredients: `ars_nouveau:sourceberry_bush`, `ars_nouveau:source_berry`
- Foods currently proving this effect: 8

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `ars_nouveau:source_berry_pie` | 60s | 2 | none |
| `ars_nouveau:source_berry_roll` | 60s | 1 | none |
| `delightful:source_berry_ice_cream` | 60s | 1 | none |
| `delightful:source_berry_gummy` | 4s | 3 | none |
| `delightful:source_berry_pie_slice` | 15s | 2 | none |
| `delightful:source_berry_milkshake` | 30s | 1 | none |

### occultism:third_eye

- Stage: `magic_distillation`
- Preferred source ingredients: `occultism:datura`, `occultism:demons_dream_essence`
- Foods currently proving this effect: 4

| Food evidence | Duration | Amp | Diet groups |
| --- | ---: | ---: | --- |
| `occultism:demons_dream_essence` | 60s | 2 | none |
| `occultism:otherworld_essence` | 60s | 2 | none |
| `occultism:datura` | 15s | 2 | none |
| `occultism:datura_seeds` | 15s | 2 | none |

## MUST DO

- Remove vanilla potion mix progression with `MoreJSEvents.registerPotionBrewing` so vanilla ingredient shortcuts do not bypass kettle/keg engineering.
- Add a data-driven effect-source catalogue under `kubejs/config`, generated from this audit but curated by hand before recipe generation.
- Route early utility effects through `farmersrespite:brewing` and `farmersrespite:kettle_pouring`.
- Route stronger combat and hazard effects through `brewinandchewin:fermenting` and `brewinandchewin:keg_pouring`.
- Keep Create filling/emptying as scale/logistics support after effect discovery.

## SHOULD DO

- Add quest nodes after `FB_KEG`: `Effect Sources`, `Kettle Infusions`, `Fermented Concentrates`, `Potion Engineering`.
- Put each effect in the quest text with its source identity: coffee means speed/haste, rose hips mean recovery, cactus chili means heat immunity, salmonberries mean water routes.
- Add JEI-visible recipes for effect concentrates before final potions so players can reason about the graph.

## MAYBE

- Add custom intermediate items or fluids such as `kubejs:rose_hip_extract` only if existing fluids/items cannot clearly represent the effect.
- Use Blood Magic flask recipes as a later intensification layer for duration/potency after the food-derived base effect exists.

## DO NOT DO

- Do not leave vanilla Nether Wart potion brewing as the default route.
- Do not make every food with an effect craft directly into a potion.
- Do not assign one universal reagent to all effects. The effect should be identified with a source family.
