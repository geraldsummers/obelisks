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
                       E("minecraft:iron_ingot", 4, 0.20),
                       E("minecraft:redstone", 12, 0.18),

                       E("create:andesite_alloy", 4, 0.22),
                       E("create:zinc_ingot", 3, 0.14),

                       E(["ae2:certus_quartz_crystal", "appliedenergistics2:certus_quartz_crystal"], 6, 0.22),
                       E(["ae2:fluix_crystal", "appliedenergistics2:fluix_crystal"], 4, 0.14),

                       E("mekanism:ingot_osmium", 3, 0.10)
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
        "minecraft:chests/village/village_plains_house",
        "minecraft:chests/shipwreck_supply",
        "minecraft:chests/spawn_bonus_chest"
    ];

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
