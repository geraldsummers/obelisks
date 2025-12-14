// Tiered chest loot injection for tech + exploration packs.
// Works with LootJS 1.20.1 wiki API: addLootTableModifier + addWeightedLoot. :contentReference[oaicite:4]{index=4}
// Uses Item.exists to skip missing IDs safely. :contentReference[oaicite:5]{index=5}

LootJS.modifiers(event => {
    // Turn on once to discover loot table IDs in logs/latest.log, then set false.
    const DEBUG_LOG = true;
    if (DEBUG_LOG) event.enableLogging(); // :contentReference[oaicite:6]{index=6}

    const firstId = (...ids) => ids.find(id => Item.exists(id)) ?? null;

    const E = (ids, count, weight) => {
        const id = Array.isArray(ids) ? firstId(...ids) : firstId(ids);
        if (!id) return null;
        return Item.of(id, count).withChance(weight); // weight-style usage in LootJS weighted loot :contentReference[oaicite:7]{index=7}
    };

    const compact = arr => arr.filter(x => x !== null);

    // --- TIERS (edit weights + counts to taste) ---
    const T1 = {
        rolls: [1, 3],
        items: compact([
            // Vanilla survival
            E("minecraft:torch", 12, 35),
                       E("minecraft:bread", 6, 25),
                       E("minecraft:iron_ingot", 4, 20),
                       E("minecraft:redstone", 12, 18),
                       E("minecraft:emerald", 2, 8),

                       // Create early
                       E("create:andesite_alloy", 4, 22),
                       E("create:zinc_ingot", 3, 14),
                       E("create:cogwheel", 2, 12),
                       E("create:shaft", 4, 12),

                       // AE2 early (handles either namespace)
                       E(["ae2:certus_quartz_crystal", "appliedenergistics2:certus_quartz_crystal"], 6, 22),
                       E(["ae2:fluix_crystal", "appliedenergistics2:fluix_crystal"], 4, 14),
                       E(["ae2:cell_component_1k", "appliedenergistics2:cell_component_1k"], 1, 4),

                       // Mekanism early
                       E("mekanism:ingot_osmium", 3, 10),

                       // Storage QoL (rare)
                       E("sophisticatedbackpacks:backpack", 1, 2),
        ])
    };

    const T2 = {
        rolls: [2, 4],
        items: compact([
            // Vanilla mid
            E("minecraft:diamond", 1, 6),
                       E("minecraft:ender_pearl", 2, 10),
                       E("minecraft:golden_apple", 1, 4),
                       E("minecraft:experience_bottle", 8, 8),

                       // Create mid components
                       E("create:electron_tube", 2, 14),
                       E("create:brass_ingot", 4, 14),
                       E("create:brass_sheet", 4, 10),
                       E("create:precision_mechanism", 1, 4),

                       // AE2 processors + patterns
                       E(["ae2:logic_processor", "appliedenergistics2:logic_processor"], 2, 10),
                       E(["ae2:calculation_processor", "appliedenergistics2:calculation_processor"], 2, 10),
                       E(["ae2:engineering_processor", "appliedenergistics2:engineering_processor"], 2, 10),
                       E(["ae2:printed_logic_processor", "appliedenergistics2:printed_logic_processor"], 3, 10),
                       E(["ae2:printed_calculation_processor", "appliedenergistics2:printed_calculation_processor"], 3, 10),
                       E(["ae2:printed_engineering_processor", "appliedenergistics2:printed_engineering_processor"], 3, 10),
                       E(["ae2:blank_pattern", "appliedenergistics2:blank_pattern"], 8, 12),

                       // Mekanism circuits + alloys (names vary across versions so we try multiple)
                       E(["mekanism:basic_control_circuit", "mekanism:control_circuit"], 2, 10),
                       E(["mekanism:alloy_infused", "mekanism:infused_alloy"], 2, 8),
        ])
    };

    const T3 = {
        rolls: [2, 5],
        items: compact([
            // Vanilla nether/stronghold-ish
            E("minecraft:blaze_rod", 4, 12),
                       E("minecraft:ghast_tear", 1, 4),
                       E("minecraft:ancient_debris", 1, 2),

                       // Create advanced
                       E("create:sturdy_sheet", 2, 10),
                       E("create:precision_mechanism", 2, 8),

                       // AE2 bigger components
                       E(["ae2:cell_component_4k", "appliedenergistics2:cell_component_4k"], 1, 6),
                       E(["ae2:cell_component_16k", "appliedenergistics2:cell_component_16k"], 1, 3),

                       // Mekanism higher tiers
                       E(["mekanism:advanced_control_circuit"], 2, 8),
                       E(["mekanism:alloy_reinforced", "mekanism:reinforced_alloy"], 1, 6),
                       E(["mekanism:ingot_steel", "mekanism:steel_ingot"], 6, 10),
        ])
    };

    const T4 = {
        rolls: [3, 6],
        items: compact([
            // Vanilla late
            E("minecraft:netherite_scrap", 1, 3),
                       E("minecraft:enchanted_golden_apple", 1, 1),

                       // AE2 late
                       E(["ae2:singularity", "appliedenergistics2:singularity"], 1, 2),
                       E(["ae2:cell_component_64k", "appliedenergistics2:cell_component_64k"], 1, 3),

                       // Mekanism late
                       E(["mekanism:elite_control_circuit"], 2, 6),
                       E(["mekanism:alloy_atomic", "mekanism:atomic_alloy"], 1, 4),
        ])
    };

    // Tier 5 is intentionally empty until you add modded dungeon/boss chest loot table IDs.
    const T5 = {
        rolls: [4, 8],
        items: compact([
            E(["mekanism:ultimate_control_circuit"], 2, 6),
                       E(["ae2:singularity", "appliedenergistics2:singularity"], 2, 6),
                       E("minecraft:netherite_ingot", 1, 1),
                       // Add your Cataclysm / Relics / Artifacts items here once you confirm exact IDs.
        ])
    };

    // --- LOOT TABLE TARGETS ---
    // T1: early overworld exploration
    const tier1Tables = [
        "minecraft:chests/village/village_plains_house",
        "minecraft:chests/village/village_taiga_house",
        "minecraft:chests/village/village_savanna_house",
        "minecraft:chests/village/village_snowy_house",
        "minecraft:chests/village/village_desert_house",
        "minecraft:chests/shipwreck_supply",
        "minecraft:chests/spawn_bonus_chest"
    ];

    // T2: common structures
    const tier2Tables = [
        "minecraft:chests/abandoned_mineshaft",
        "minecraft:chests/simple_dungeon",
        "minecraft:chests/desert_pyramid",
        "minecraft:chests/jungle_temple",
        "minecraft:chests/ruined_portal",
        "minecraft:chests/igloo_chest",
        "minecraft:chests/underwater_ruin_small",
        "minecraft:chests/underwater_ruin_big"
    ];

    // T3: stronghold + nether
    const tier3Tables = [
        "minecraft:chests/stronghold_corridor",
        "minecraft:chests/stronghold_crossing",
        "minecraft:chests/stronghold_library",
        "minecraft:chests/nether_bridge",
        "minecraft:chests/bastion_other",
        "minecraft:chests/bastion_bridge"
    ];

    // T4: “treasure” structures
    const tier4Tables = [
        "minecraft:chests/bastion_treasure",
        "minecraft:chests/end_city_treasure",
        "minecraft:chests/ancient_city",
        "minecraft:chests/woodland_mansion",
        "minecraft:chests/buried_treasure"
    ];

    // T5: add modded loot table IDs once discovered in logs
    const tier5Tables = [
        // Example placeholders:
        // "l_ender_s_cataclysm:chests/...",
        // "bosses_of_mass_destruction:chests/..."
    ];

    const applyTier = (tables, tier) => {
        tables.forEach(t => event.addLootTableModifier(t).addWeightedLoot(tier.rolls, tier.items));
    };

    applyTier(tier1Tables, T1);
    applyTier(tier2Tables, T2);
    applyTier(tier3Tables, T3);
    applyTier(tier4Tables, T4);
    applyTier(tier5Tables, T5);
});
