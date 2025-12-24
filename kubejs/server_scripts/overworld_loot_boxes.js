console.info("[loot_tiers] loaded");

LootJS.modifiers(function (event) {
    console.info("[loot_tiers] modifiers active");

    var DEBUG_LOG = true;
    if (DEBUG_LOG && event.enableLogging) event.enableLogging();

    function firstId(ids) {
        var i;
        for (i = 0; i < ids.length; i++) {
            if (Item.exists(ids[i])) return ids[i];
        }
        return null;
    }

    function E(idOrIds, count, chance) {
        var id = null;

        if (Array.isArray(idOrIds)) id = firstId(idOrIds);
        else id = firstId([idOrIds]);

        if (!id) return null;
        return Item.of(id, count).withChance(chance);
    }

    function compact(arr) {
        var out = [];
        var i;
        for (i = 0; i < arr.length; i++) if (arr[i] !== null) out.push(arr[i]);
        return out;
    }

    function applyTier(tables, tier) {
        var i;
        for (i = 0; i < tables.length; i++) {
            event.addLootTableModifier(tables[i]).addWeightedLoot(tier.rolls, tier.items);
        }
    }

    var T1 = {
        rolls: [1, 3],
        items: compact([
            E("minecraft:torch", 12, 0.35),
                       E("minecraft:bread", 6, 0.25),

                       E("create:andesite_alloy", 4, 0.22),
                       E("create:zinc_ingot", 3, 0.14),

                       // added items
                       E("minecraft:tnt", 16, 0.5),
                       E("rehooked:wooden_hook", 1, 0.05), // closest vanilla item to “rehooked wooden hook”
                       E("minecraft:potion{Potion:\"minecraft:fire_resistance\"}", 1, 0.1),
                       E("minecraft:water_bottle", 6, 0.5),
                       E("minecraft:flint_and_steel", 1, 0.09)
        ])
    };



    var T2 = {
        rolls: [2, 4],
        items: compact([
            E("minecraft:diamond", 1, 0.06),
                       E("minecraft:ender_pearl", 2, 0.10),

                       E("create:brass_ingot", 4, 0.14),
                       E("create:electron_tube", 2, 0.14),

                       E(["ae2:logic_processor", "appliedenergistics2:logic_processor"], 2, 0.10),
                       E(["ae2:calculation_processor", "appliedenergistics2:calculation_processor"], 2, 0.10),
                       E(["ae2:engineering_processor", "appliedenergistics2:engineering_processor"], 2, 0.10),
                       E(["ae2:blank_pattern", "appliedenergistics2:blank_pattern"], 8, 0.12),

                       E(["mekanism:basic_control_circuit", "mekanism:control_circuit"], 2, 0.10)
        ])
    };

    var T3 = {
        rolls: [2, 5],
        items: compact([
            E("minecraft:blaze_rod", 4, 0.12),
                       E("minecraft:ancient_debris", 1, 0.02),

                       E(["ae2:cell_component_4k", "appliedenergistics2:cell_component_4k"], 1, 0.06),
                       E(["ae2:cell_component_16k", "appliedenergistics2:cell_component_16k"], 1, 0.03),

                       E(["mekanism:advanced_control_circuit"], 2, 0.08),
                       E(["mekanism:ingot_steel", "mekanism:steel_ingot"], 6, 0.10)
        ])
    };

    var T4 = {
        rolls: [3, 6],
        items: compact([
            E("minecraft:netherite_scrap", 1, 0.03),
                       E(["ae2:cell_component_64k", "appliedenergistics2:cell_component_64k"], 1, 0.03),
                       E(["mekanism:elite_control_circuit"], 2, 0.06)
        ])
    };

    var tier1Tables = [
        "apotheosis:chests/chest_valuable",
        "apotheosis:chests/spawner_brutal",
        "apotheosis:chests/spawner_brutal_rotate",
        "apotheosis:chests/spawner_swarm",
        "apotheosis:chests/tome_tower",
        "ae2:blocks/chests/meteorite",
        "artifacts:chests/campsite_barrel",
        "artifacts:chests/campsite_barrel/cobblestone",
        "artifacts:chests/campsite_barrel/cobwebs",
        "artifacts:chests/campsite_barrel/crops",
        "artifacts:chests/campsite_barrel/food",
        "artifacts:chests/campsite_barrel/gems",
        "artifacts:chests/campsite_barrel/ingots",
        "artifacts:chests/campsite_barrel/minecarts",
        "artifacts:chests/campsite_barrel/ores",
        "artifacts:chests/campsite_barrel/rails",
        "artifacts:chests/campsite_barrel/tnt",
        "artifacts:chests/campsite_chest",
        "artifacts:inject/chests/abandoned_mineshaft",
        "artifacts:inject/chests/ancient_city",
        "artifacts:inject/chests/ancient_city_ice_box",
        "artifacts:inject/chests/bastion_hoglin_stable",
        "artifacts:inject/chests/bastion_treasure",
        "artifacts:inject/chests/buried_treasure",
        "artifacts:inject/chests/desert_pyramid",
        "artifacts:inject/chests/end_city_treasure",
        "artifacts:inject/chests/igloo_chest",
        "artifacts:inject/chests/jungle_temple",
        "artifacts:inject/chests/nether_bridge",
        "artifacts:inject/chests/pillager_outpost",
        "artifacts:inject/chests/ruined_portal",
        "artifacts:inject/chests/shipwreck_treasure",
        "artifacts:inject/chests/spawn_bonus_chest",
        "artifacts:inject/chests/stronghold_corridor",
        "artifacts:inject/chests/underwater_ruin_big",
        "artifacts:inject/chests/village/village_armorer",
        "artifacts:inject/chests/village/village_butcher",
        "artifacts:inject/chests/village/village_desert_house",
        "artifacts:inject/chests/village/village_plains_house",
        "artifacts:inject/chests/village/village_savanna_house",
        "artifacts:inject/chests/village/village_snowy_house",
        "artifacts:inject/chests/village/village_taiga_house",
        "artifacts:inject/chests/village/village_tannery",
        "artifacts:inject/chests/village/village_temple",
        "artifacts:inject/chests/village/village_toolsmith",
        "artifacts:inject/chests/village/village_weaponsmith",
        "artifacts:inject/chests/woodland_mansion",
        "blue_skies:chests/blinding_dungeon/library_chest",
        "blue_skies:chests/blinding_dungeon/library_chest_key",
        "blue_skies:chests/blinding_dungeon/prison_chest_everbright",
        "blue_skies:chests/blinding_dungeon/prison_chest_everdawn",
        "blue_skies:chests/blinding_dungeon/study_chest",
        "blue_skies:chests/bunker/common",
        "blue_skies:chests/bunker/rare",
        "blue_skies:chests/cave_spawner/chest_everbright",
        "blue_skies:chests/cave_spawner/chest_everdawn",
        "blue_skies:chests/gatekeeper_house/book",
        "blue_skies:chests/gatekeeper_house/mountain",
        "blue_skies:chests/gatekeeper_house/plains",
        "blue_skies:chests/gatekeeper_house/snowy",
        "blue_skies:chests/nature_dungeon/chest",
        "blue_skies:chests/nature_dungeon/chest_key",
        "blue_skies:chests/poison_dungeon/chest",
        "blue_skies:chests/poison_dungeon/chest_key",
        "blue_skies:chests/village/brightlands",
        "blue_skies:chests/village/calming_skies",
        "blue_skies:chests/village/crystal_dunes",
        "blue_skies:chests/village/shaded_woodlands",
        "blue_skies:chests/village/slushlands",
        "blue_skies:chests/village/sunset_maple_forest",
        "bosses_of_mass_destruction:chests/gauntlet",
        "bosses_of_mass_destruction:chests/lich_tower",
        "bosses_of_mass_destruction:chests/obsidilith",
        "minecraft:chests/basic_chest",
        "minecraft:chests/chest_level_1",
        "minecraft:chests/chest_level_2",
        "minecraft:chests/chest_level_3",
        "minecraft:chests/farm_drop",
        "minecraft:chests/firewell_d",
        "minecraft:chests/shater",
        "block_factorys_bosses:chests/dragon_tower_common",
        "block_factorys_bosses:chests/dragon_trial",
        "block_factorys_bosses:chests/undead_arena_common",
        "block_factorys_bosses:chests/undead_arena_rare",
        "chefsdelight:chests/cooker",
        "deeperdarker:chests/ancient_temple_apex",
        "deeperdarker:chests/ancient_temple_basement",
        "deeperdarker:chests/ancient_temple_fountain",
        "deeperdarker:chests/ancient_temple_secret",
        "deeperdarker:chests/ancient_temple_storage",
        "deeperdarker:chests/crystallized_amber",
        "magistuarmory:chests/desert_pyramid",
        "magistuarmory:chests/end_city_treasure",
        "magistuarmory:chests/jungle_temple",
        "magistuarmory:chests/nether_bridge",
        "magistuarmory:chests/ruined_portal",
        "magistuarmory:chests/simple_dungeon",
        "magistuarmory:chests/stronghold_corridor",
        "magistuarmory:chests/village/village_weaponsmith",
        "farmersdelight:chests/fd_abandoned_mineshaft",
        "farmersdelight:chests/fd_bastion_hoglin_stable",
        "farmersdelight:chests/fd_bastion_treasure",
        "farmersdelight:chests/fd_end_city_treasure",
        "farmersdelight:chests/fd_pillager_outpost",
        "farmersdelight:chests/fd_ruined_portal",
        "farmersdelight:chests/fd_shipwreck_supply",
        "farmersdelight:chests/fd_simple_dungeon",
        "farmersdelight:chests/fd_village_butcher",
        "farmersdelight:chests/fd_village_desert_house",
        "farmersdelight:chests/fd_village_plains_house",
        "farmersdelight:chests/fd_village_savanna_house",
        "farmersdelight:chests/fd_village_snowy_house",
        "farmersdelight:chests/fd_village_taiga_house",
        "cataclysm:chests/acropolis_treasure",
        "cataclysm:chests/frosted_prison_treasure",
        "lootr:chests/elytra",
        "minecraft:chests/bunbug_chest",
        "minecraft:chests/collector_wagon_loot",
        "minecraft:chests/ship_barrel",
        "minecraft:chests/ship_cannons",
        "minecraft:chests/ship_treasure_chests",
        "minecraft:chests/wagon_badlands",
        "minecraft:chests/wagon_desert",
        "minecraft:chests/wagon_jungle",
        "minecraft:chests/wagon_ocean",
        "minecraft:chests/wagon_plains",
        "minecraft:chests/wagon_savanna",
        "minecraft:chests/wagon_swamp",
        "minecraft:chests/wagon_taiga",
        "minecraft:chests/wagon_tundra",
        "mynethersdelight:chests/mnd_bastion_hoglin_stable",
        "mynethersdelight:chests/mnd_bastion_treasure",
        "repurposed_structures:chests/ancient_cities/end",
        "repurposed_structures:chests/ancient_cities/end_spawner_box",
        "repurposed_structures:chests/ancient_cities/nether",
        "repurposed_structures:chests/ancient_cities/nether_magma_box",
        "repurposed_structures:chests/ancient_cities/ocean",
        "repurposed_structures:chests/ancient_cities/ocean_ice_box",
        "repurposed_structures:chests/bastions/underground/bridge",
        "repurposed_structures:chests/bastions/underground/other",
        "repurposed_structures:chests/bastions/underground/skeleton_horse_stable",
        "repurposed_structures:chests/bastions/underground/treasure",
        "repurposed_structures:chests/cities/nether",
        "repurposed_structures:chests/cities/overworld",
        "repurposed_structures:chests/dungeons/badlands",
        "repurposed_structures:chests/dungeons/dark_forest",
        "repurposed_structures:chests/dungeons/deep",
        "repurposed_structures:chests/dungeons/desert",
        "repurposed_structures:chests/dungeons/icy",
        "repurposed_structures:chests/dungeons/jungle",
        "repurposed_structures:chests/dungeons/mushroom",
        "repurposed_structures:chests/dungeons/nether",
        "repurposed_structures:chests/dungeons/ocean",
        "repurposed_structures:chests/dungeons/snow",
        "repurposed_structures:chests/dungeons/swamp",
        "repurposed_structures:chests/fortresses/jungle_center",
        "repurposed_structures:chests/fortresses/jungle_hallway",
        "repurposed_structures:chests/fortresses/jungle_shrine",
        "repurposed_structures:chests/igloos/grassy",
        "repurposed_structures:chests/igloos/mangrove",
        "repurposed_structures:chests/igloos/mushroom",
        "repurposed_structures:chests/igloos/stone",
        "repurposed_structures:chests/lucky_pool",
        "repurposed_structures:chests/mansions/birch",
        "repurposed_structures:chests/mansions/birch_storage",
        "repurposed_structures:chests/mansions/desert",
        "repurposed_structures:chests/mansions/desert_storage",
        "repurposed_structures:chests/mansions/jungle",
        "repurposed_structures:chests/mansions/jungle_storage",
        "repurposed_structures:chests/mansions/mangrove",
        "repurposed_structures:chests/mansions/mangrove_storage",
        "repurposed_structures:chests/mansions/oak",
        "repurposed_structures:chests/mansions/oak_storage",
        "repurposed_structures:chests/mansions/savanna",
        "repurposed_structures:chests/mansions/savanna_storage",
        "repurposed_structures:chests/mansions/snowy",
        "repurposed_structures:chests/mansions/snowy_storage",
        "repurposed_structures:chests/mansions/taiga",
        "repurposed_structures:chests/mansions/taiga_storage",
        "repurposed_structures:chests/mineshafts/birch",
        "repurposed_structures:chests/mineshafts/crimson",
        "repurposed_structures:chests/mineshafts/dark_forest",
        "repurposed_structures:chests/mineshafts/desert",
        "repurposed_structures:chests/mineshafts/end",
        "repurposed_structures:chests/mineshafts/icy",
        "repurposed_structures:chests/mineshafts/jungle",
        "repurposed_structures:chests/mineshafts/nether",
        "repurposed_structures:chests/mineshafts/ocean",
        "repurposed_structures:chests/mineshafts/savanna",
        "repurposed_structures:chests/mineshafts/stone",
        "repurposed_structures:chests/mineshafts/swamp",
        "repurposed_structures:chests/mineshafts/taiga",
        "repurposed_structures:chests/mineshafts/warped",
        "repurposed_structures:chests/monuments/desert",
        "repurposed_structures:chests/monuments/icy",
        "repurposed_structures:chests/monuments/jungle",
        "repurposed_structures:chests/monuments/nether",
        "repurposed_structures:chests/outposts/badlands",
        "repurposed_structures:chests/outposts/birch",
        "repurposed_structures:chests/outposts/crimson",
        "repurposed_structures:chests/outposts/desert",
        "repurposed_structures:chests/outposts/giant_tree_taiga",
        "repurposed_structures:chests/outposts/icy",
        "repurposed_structures:chests/outposts/jungle",
        "repurposed_structures:chests/outposts/mangrove",
        "repurposed_structures:chests/outposts/nether_brick",
        "repurposed_structures:chests/outposts/oak",
        "repurposed_structures:chests/outposts/snowy",
        "repurposed_structures:chests/outposts/taiga",
        "repurposed_structures:chests/outposts/warped",
        "repurposed_structures:chests/pyramids/dark_forest",
        "repurposed_structures:chests/pyramids/end",
        "repurposed_structures:chests/pyramids/flower_forest",
        "repurposed_structures:chests/pyramids/giant_tree_taiga",
        "repurposed_structures:chests/pyramids/icy",
        "repurposed_structures:chests/pyramids/jungle",
        "repurposed_structures:chests/pyramids/mushroom",
        "repurposed_structures:chests/pyramids/snowy",
        "repurposed_structures:chests/ruined_portals/end/large_portal",
        "repurposed_structures:chests/ruined_portals/end/small_portal",
        "repurposed_structures:chests/ruins/land_cold/large",
        "repurposed_structures:chests/ruins/land_cold/small",
        "repurposed_structures:chests/ruins/land_hot/large",
        "repurposed_structures:chests/ruins/land_hot/small",
        "repurposed_structures:chests/ruins/land_icy/large",
        "repurposed_structures:chests/ruins/land_icy/small",
        "repurposed_structures:chests/ruins/land_warm/large",
        "repurposed_structures:chests/ruins/land_warm/small",
        "repurposed_structures:chests/ruins/nether",
        "repurposed_structures:chests/shipwrecks/crimson/map",
        "repurposed_structures:chests/shipwrecks/crimson/supply",
        "repurposed_structures:chests/shipwrecks/crimson/treasure",
        "repurposed_structures:chests/shipwrecks/end/map",
        "repurposed_structures:chests/shipwrecks/end/supply",
        "repurposed_structures:chests/shipwrecks/end/treasure",
        "repurposed_structures:chests/shipwrecks/nether_bricks/treasure",
        "repurposed_structures:chests/shipwrecks/warped/map",
        "repurposed_structures:chests/shipwrecks/warped/supply",
        "repurposed_structures:chests/shipwrecks/warped/treasure",
        "repurposed_structures:chests/strongholds/nether_hallway",
        "repurposed_structures:chests/strongholds/nether_library",
        "repurposed_structures:chests/strongholds/nether_storage_room",
        "repurposed_structures:chests/temples/basalt",
        "repurposed_structures:chests/temples/crimson",
        "repurposed_structures:chests/temples/ocean",
        "repurposed_structures:chests/temples/soul",
        "repurposed_structures:chests/temples/taiga",
        "repurposed_structures:chests/temples/warped",
        "repurposed_structures:chests/temples/wasteland",
        "repurposed_structures:chests/villages/badlands_house",
        "repurposed_structures:chests/villages/bamboo_house",
        "repurposed_structures:chests/villages/birch_house",
        "repurposed_structures:chests/villages/cherry_house",
        "repurposed_structures:chests/villages/crimson_cartographer",
        "repurposed_structures:chests/villages/crimson_fisher",
        "repurposed_structures:chests/villages/crimson_house",
        "repurposed_structures:chests/villages/crimson_tannery",
        "repurposed_structures:chests/villages/crimson_weaponsmith",
        "repurposed_structures:chests/villages/dark_forest_house",
        "repurposed_structures:chests/villages/giant_taiga_house",
        "repurposed_structures:chests/villages/jungle_house",
        "repurposed_structures:chests/villages/mountains_house",
        "repurposed_structures:chests/villages/mushroom_house",
        "repurposed_structures:chests/villages/oak_house",
        "repurposed_structures:chests/villages/ocean_cartographer",
        "repurposed_structures:chests/villages/ocean_house",
        "repurposed_structures:chests/villages/swamp_house",
        "repurposed_structures:chests/villages/warped_cartographer",
        "repurposed_structures:chests/villages/warped_fisher",
        "repurposed_structures:chests/villages/warped_house",
        "repurposed_structures:chests/villages/warped_tannery",
        "repurposed_structures:chests/villages/warped_weaponsmith",
        "repurposed_structures:trapped_chests/pyramids/badlands",
        "repurposed_structures:trapped_chests/pyramids/end",
        "repurposed_structures:trapped_chests/pyramids/nether",
        "repurposed_structures:trapped_chests/pyramids/ocean",
        "repurposed_structures:trapped_chests/temples/warped",
        "sophisticatedbackpacks:inject/chests/abandoned_mineshaft",
        "sophisticatedbackpacks:inject/chests/bastion_treasure",
        "sophisticatedbackpacks:inject/chests/desert_pyramid",
        "sophisticatedbackpacks:inject/chests/end_city_treasure",
        "sophisticatedbackpacks:inject/chests/nether_bridge",
        "sophisticatedbackpacks:inject/chests/shipwreck_treasure",
        "sophisticatedbackpacks:inject/chests/simple_dungeon",
        "sophisticatedbackpacks:inject/chests/spawn_bonus_chest",
        "sophisticatedbackpacks:inject/chests/woodland_mansion",
        "spartanweaponry:inject/chests/end_city_treasure",
        "spartanweaponry:inject/chests/village/village_fletcher",
        "spartanweaponry:inject/chests/village/village_weaponsmith",
        "undergarden:chests/catacombs",
        "thirst:chests/abandoned_mineshaft",
        "thirst:chests/abandoned_mineshaft_bc",
        "thirst:chests/abandoned_mineshaft_fr",
        "thirst:chests/bastion_other",
        "thirst:chests/bastion_other_bc",
        "thirst:chests/bastion_other_fr",
        "thirst:chests/nether_bridge",
        "thirst:chests/nether_bridge_bc",
        "thirst:chests/nether_bridge_fr",
        "thirst:chests/shipwreck_supply",
        "thirst:chests/shipwreck_supply_bc",
        "thirst:chests/shipwreck_supply_fr",
        "thirst:chests/simple_dungeon",
        "thirst:chests/simple_dungeon_bc",
        "thirst:chests/simple_dungeon_fr",
        "ubesdelight:chests/ud_village_plains_house",
        "minecraft:chests/ancient_end_city",
        "minecraft:chests/end_house_library",
        "unusualend:chests/end_city_additional_loots",
        "unusualend:chests/flying_ship",
        "unusualend:chests/gloopy_altar",
        "unusualend:chests/wandering_house",
        "unusualend:chests/wandering_house_barrel",
        "unusualend:chests/warped_ship",
        "valhelsia_structures:chests/castle",
        "valhelsia_structures:chests/castle_ruin",
        "valhelsia_structures:chests/desert_house",
        "valhelsia_structures:chests/forge",
        "valhelsia_structures:chests/kitchen",
        "valhelsia_structures:chests/miscellaneous",
        "valhelsia_structures:chests/player_house",
        "valhelsia_structures:chests/spawner_dungeon",
        "valhelsia_structures:chests/spawner_dungeon_dispenser",
        "valhelsia_structures:chests/treasure",
        "valhelsia_structures:chests/witch_hut",
        "betterdungeons:skeleton_dungeon/chests/common",
        "betterdungeons:skeleton_dungeon/chests/middle",
        "betterdungeons:small_dungeon/chests/loot_piles",
        "betterdungeons:small_nether_dungeon/chests/common",
        "betterdungeons:spider_dungeon/chests/egg_room",
        "betterdungeons:zombie_dungeon/chests/common",
        "betterdungeons:zombie_dungeon/chests/special",
        "betterdungeons:zombie_dungeon/chests/tombstone",
        "betteroceanmonuments:chests/upper_side_chamber"
    ]

    var tier2Tables = [
        "minecraft:chests/abandoned_mineshaft",
        "minecraft:chests/simple_dungeon",
        "minecraft:chests/desert_pyramid",
        "minecraft:chests/ruined_portal"
    ];

    var tier3Tables = [
        "minecraft:chests/stronghold_corridor",
        "minecraft:chests/nether_bridge",
        "minecraft:chests/bastion_other"
    ];

    var tier4Tables = [
        "minecraft:chests/bastion_treasure",
        "minecraft:chests/end_city_treasure",
        "minecraft:chests/ancient_city"
    ];

    applyTier(tier1Tables, T1);
    applyTier(tier2Tables, T2);
    applyTier(tier3Tables, T3);
    applyTier(tier4Tables, T4);
});
