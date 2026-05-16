# Food Reagent Material Identity

This pass treats food preparation as the first potion-engineering layer.

## Rule

Food blocks process material identity. The vanilla brewing stand only combines finished reagents into potions after the source has been prepared enough.

## Processing Roles

| Surface | Role | Current examples |
|---|---|---|
| Cutting board | expose plant/animal/mineral source | green tea leaves, salmonberries, cactus chili |
| Campfire cooking | crude heat and roasting | coffee beans, cactus chili |
| Cooking pot | multi-ingredient culinary extraction | brine, vision, heatproof, leaping, featherlight, life, turtle guard, corrupting extracts, stabilized reagent |
| Kettle | clean aqueous extraction | green tea, coffee, rose hip, yellow tea, purulent tea extracts |
| Keg | fermentation and stronger concentrates | red rum to pomegranate strength extract, salty folly to brine extract |
| Brewing stand | final potion combining only | stabilized reagent to awkward, extracts to vanilla potion effects |

## Current Reagent Items

| Item | Identity | Potion role |
|---|---|---|
| `kubejs:green_tea_extract` | green tea / haste identity | intermediate/stabilized reagent input |
| `kubejs:caffeine_extract` | coffee speed identity | swiftness potion finisher |
| `kubejs:vision_extract` | golden carrot + ube + glow berries | night vision potion finisher |
| `kubejs:brine_extract` | salmonberry / sea / salt route | water breathing potion finisher |
| `kubejs:rose_hip_extract` | rose hip recovery identity | regeneration potion finisher |
| `kubejs:heatproof_extract` | cactus chili / hot spice / magma | fire resistance potion finisher |
| `kubejs:fortifying_extract` | yellow tea / resistance identity | reserved for later resistance systems |
| `kubejs:fermented_pomegranate_extract` | red rum / pomegranate strength route | strength potion finisher |
| `kubejs:toxic_extract` | purulent tea / poison identity | poison potion finisher |
| `kubejs:leaping_extract` | gloomper leg + rabbit-foot spring identity | leaping potion finisher |
| `kubejs:featherlight_extract` | marshmallow + phantom membrane lightness | slow falling potion finisher |
| `kubejs:melon_life_extract` | glistering melon + rose hip recovery | healing potion finisher |
| `kubejs:turtle_guard_extract` | scute / turtle / brine protection | turtle master potion finisher |
| `kubejs:weakening_extract` | purulent tea + fermented spider eye | weakness potion finisher |
| `kubejs:shadow_extract` | corrupted vision + ender eye | invisibility transform |
| `kubejs:harm_extract` | corrupted poison/life identity | harming transform |
| `kubejs:slowness_extract` | corrupted speed/leaping identity | slowness transform |
| `kubejs:stabilized_reagent` | green tea + nether wart + honey | water to awkward potion bridge |

## Notes

- Existing Farmer's Respite and Brewin' and Chewin' fluids remain the identity carriers where possible.
- Custom KubeJS items are only used where crossing into the brewing stand would otherwise lose source identity.
- MoreJS removes the vanilla Awkward Potion shortcuts for the covered effects and re-adds extract-based finishers.
- Nether wart no longer turns water into Awkward Potion by itself; `kubejs:stabilized_reagent` is the processed base reagent.
- Fermented spider eye no longer directly owns weakness, invisibility, harming, or slowness; those outcomes use processed corruption extracts.
