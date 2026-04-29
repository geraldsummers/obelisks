// Global loot progression scrub. Loot is a crafting surface, so high-power materials
// and creative/flight/global-bypass items must not enter through random tables.

var BTM_LOOT_REMOVE_ITEMS = [
    // Creative or effectively creative infrastructure.
    'ae2:creative_energy_cell',
    'ars_nouveau:creative_source_jar',
    'botania:creative_pool',
    'create:creative_crate',
    'create:creative_fluid_tank',
    'create:creative_motor',
    'create_connected:creative_fluid_vessel',

    // Vanilla flight and netherite skip paths. Reintroduce only through authored endgame branches.
    'minecraft:elytra',
    'minecraft:netherite_ingot',
    'minecraft:netherite_scrap',
    'minecraft:netherite_upgrade_smithing_template',
    'minecraft:netherite_sword',
    'minecraft:netherite_pickaxe',
    'minecraft:netherite_axe',
    'minecraft:netherite_shovel',
    'minecraft:netherite_hoe',
    'minecraft:netherite_helmet',
    'minecraft:netherite_chestplate',
    'minecraft:netherite_leggings',
    'minecraft:netherite_boots',

    // Blood Magic dungeon netherite stand-ins and fragments are too strong as generic loot.
    'bloodmagic:fragment_netherite_scrap',
    'bloodmagic:sand_netherite',

    // Create/space netherite equipment should be authored through space/lava-depth progression.
    'create:netherite_backtank',
    'create_new_age:netherite_magnet',
    'creatingspace:netherite_oxygen_backtank'
]

var BTM_LOOT_EMERALD_TABLES_TO_COIN = [
    'minecraft:chests/village/village_armorer',
    'minecraft:chests/village/village_butcher',
    'minecraft:chests/village/village_cartographer',
    'minecraft:chests/village/village_desert_house',
    'minecraft:chests/village/village_fisher',
    'minecraft:chests/village/village_fletcher',
    'minecraft:chests/village/village_mason',
    'minecraft:chests/village/village_plains_house',
    'minecraft:chests/village/village_savanna_house',
    'minecraft:chests/village/village_shepherd',
    'minecraft:chests/village/village_snowy_house',
    'minecraft:chests/village/village_taiga_house',
    'minecraft:chests/village/village_tannery',
    'minecraft:chests/village/village_temple',
    'minecraft:chests/village/village_toolsmith',
    'minecraft:chests/village/village_weaponsmith'
]

LootJS.modifiers(function (event) {
    var allLoot = event.addLootTableModifier(/.*/)
    for (var i = 0; i < BTM_LOOT_REMOVE_ITEMS.length; i++) {
        allLoot.removeLoot(BTM_LOOT_REMOVE_ITEMS[i])
    }

    for (var j = 0; j < BTM_LOOT_EMERALD_TABLES_TO_COIN.length; j++) {
        event.addLootTableModifier(BTM_LOOT_EMERALD_TABLES_TO_COIN[j])
            .replaceLoot('minecraft:emerald', Item.of('dotcoinmod:copper_coin', 4), true)
    }
})
