// MoreJS brewing registry edits: vanilla reagents are not the discovery layer.
// Potions are finished from food-derived extracts produced by kitchen/kettle/keg recipes.

var BtmPotions = Java.loadClass('net.minecraft.world.item.alchemy.Potions')

MoreJSEvents.registerPotionBrewing(function (event) {
    var removals = [
        [BtmPotions.WATER, 'minecraft:nether_wart', BtmPotions.AWKWARD],
        ['minecraft:sugar', BtmPotions.SWIFTNESS],
        ['minecraft:golden_carrot', BtmPotions.NIGHT_VISION],
        ['minecraft:pufferfish', BtmPotions.WATER_BREATHING],
        ['minecraft:magma_cream', BtmPotions.FIRE_RESISTANCE],
        ['minecraft:ghast_tear', BtmPotions.REGENERATION],
        ['minecraft:blaze_powder', BtmPotions.STRENGTH],
        ['minecraft:spider_eye', BtmPotions.POISON],
        ['minecraft:rabbit_foot', BtmPotions.LEAPING],
        ['minecraft:glistering_melon_slice', BtmPotions.HEALING],
        ['minecraft:phantom_membrane', BtmPotions.SLOW_FALLING],
        ['minecraft:turtle_helmet', BtmPotions.TURTLE_MASTER]
    ]

    for (var i = 0; i < removals.length; i++) {
        if (removals[i].length === 3) {
            event.removeByPotion(removals[i][0], Ingredient.of(removals[i][1]), removals[i][2])
        } else {
            event.removeByPotion(BtmPotions.AWKWARD, Ingredient.of(removals[i][0]), removals[i][1])
        }
    }

    var corruptions = [
        [BtmPotions.WATER, BtmPotions.WEAKNESS],
        [BtmPotions.AWKWARD, BtmPotions.WEAKNESS],
        [BtmPotions.NIGHT_VISION, BtmPotions.INVISIBILITY],
        [BtmPotions.SWIFTNESS, BtmPotions.SLOWNESS],
        [BtmPotions.LEAPING, BtmPotions.SLOWNESS],
        [BtmPotions.HEALING, BtmPotions.HARMING],
        [BtmPotions.POISON, BtmPotions.HARMING]
    ]

    for (var c = 0; c < corruptions.length; c++) {
        event.removeByPotion(corruptions[c][0], Ingredient.of('minecraft:fermented_spider_eye'), corruptions[c][1])
    }

    event.addPotionBrewing(Ingredient.of('kubejs:stabilized_reagent'), BtmPotions.WATER, BtmPotions.AWKWARD)
    event.addPotionBrewing(Ingredient.of('kubejs:caffeine_extract'), BtmPotions.AWKWARD, BtmPotions.SWIFTNESS)
    event.addPotionBrewing(Ingredient.of('kubejs:vision_extract'), BtmPotions.AWKWARD, BtmPotions.NIGHT_VISION)
    event.addPotionBrewing(Ingredient.of('kubejs:brine_extract'), BtmPotions.AWKWARD, BtmPotions.WATER_BREATHING)
    event.addPotionBrewing(Ingredient.of('kubejs:heatproof_extract'), BtmPotions.AWKWARD, BtmPotions.FIRE_RESISTANCE)
    event.addPotionBrewing(Ingredient.of('kubejs:rose_hip_extract'), BtmPotions.AWKWARD, BtmPotions.REGENERATION)
    event.addPotionBrewing(Ingredient.of('kubejs:fermented_pomegranate_extract'), BtmPotions.AWKWARD, BtmPotions.STRENGTH)
    event.addPotionBrewing(Ingredient.of('kubejs:toxic_extract'), BtmPotions.AWKWARD, BtmPotions.POISON)
    event.addPotionBrewing(Ingredient.of('kubejs:leaping_extract'), BtmPotions.AWKWARD, BtmPotions.LEAPING)
    event.addPotionBrewing(Ingredient.of('kubejs:melon_life_extract'), BtmPotions.AWKWARD, BtmPotions.HEALING)
    event.addPotionBrewing(Ingredient.of('kubejs:featherlight_extract'), BtmPotions.AWKWARD, BtmPotions.SLOW_FALLING)
    event.addPotionBrewing(Ingredient.of('kubejs:turtle_guard_extract'), BtmPotions.AWKWARD, BtmPotions.TURTLE_MASTER)
    event.addPotionBrewing(Ingredient.of('kubejs:weakening_extract'), BtmPotions.WATER, BtmPotions.WEAKNESS)
    event.addPotionBrewing(Ingredient.of('kubejs:weakening_extract'), BtmPotions.AWKWARD, BtmPotions.WEAKNESS)
    event.addPotionBrewing(Ingredient.of('kubejs:shadow_extract'), BtmPotions.NIGHT_VISION, BtmPotions.INVISIBILITY)
    event.addPotionBrewing(Ingredient.of('kubejs:slowness_extract'), BtmPotions.SWIFTNESS, BtmPotions.SLOWNESS)
    event.addPotionBrewing(Ingredient.of('kubejs:slowness_extract'), BtmPotions.LEAPING, BtmPotions.SLOWNESS)
    event.addPotionBrewing(Ingredient.of('kubejs:harm_extract'), BtmPotions.HEALING, BtmPotions.HARMING)
    event.addPotionBrewing(Ingredient.of('kubejs:harm_extract'), BtmPotions.POISON, BtmPotions.HARMING)
})
