// Extreme Y-band reward gates.
// These recipes make terrain commitment pay off with powerful but bounded utility.
// Mountain materials come from high-altitude deposits; deepslate and lava-depth
// materials come from ADLODS bands tightened in config/adlods/Deposits.

var BTM_EXTREME = {
    mountain: {
        emerald: 'minecraft:emerald',
        ruby: 'art_update:ruby',
        sapphire: 'iceandfire:sapphire_gem'
    },
    deepslate: {
        platinum: 'chemlib:platinum_plate',
        palladium: 'chemlib:palladium_plate',
        rhodium: 'chemlib:rhodium_plate',
        ruthenium: 'chemlib:ruthenium_plate'
    },
    lava: {
        uranium: 'chemlib:uranium_plate',
        thorium: 'chemlib:thorium_plate',
        osmium: 'chemlib:osmium_plate',
        iridium: 'chemlib:iridium_plate',
        debris: 'minecraft:netherite_scrap'
    },
    gate: {
        brass: 'kubejs:brass_machine_casing',
        power: 'kubejs:power_grid_machine_casing',
        oc2r: 'kubejs:oc2r_machine_casing',
        space: 'kubejs:space_machine_casing',
        ae2: 'kubejs:ae2_machine_casing',
        etherealSlate: 'bloodmagic:etherealslate'
    }
}

function btmExtremeRecipe(event, output, pattern, keys, id) {
    event.remove({ output: output })
    event.shaped(output, pattern, keys).id(id)
}

ServerEvents.recipes(function (event) {
    // Mountain-height rewards: strong exploration and movement utility without teleportation or flight.
    btmExtremeRecipe(event, 'artifacts:cloud_in_a_bottle', [
        'SES',
        'RPR',
        'SBS'
    ], {
        S: BTM_EXTREME.mountain.sapphire,
        E: BTM_EXTREME.mountain.emerald,
        R: BTM_EXTREME.mountain.ruby,
        P: 'create:precision_mechanism',
        B: BTM_EXTREME.gate.power
    }, 'kubejs:extreme_y_rewards/mountain/cloud_in_a_bottle')

    btmExtremeRecipe(event, 'artifacts:digging_claws', [
        'RER',
        'SBS',
        'RER'
    ], {
        R: BTM_EXTREME.mountain.ruby,
        E: BTM_EXTREME.mountain.emerald,
        S: BTM_EXTREME.mountain.sapphire,
        B: BTM_EXTREME.gate.brass
    }, 'kubejs:extreme_y_rewards/mountain/digging_claws')

    btmExtremeRecipe(event, 'artifacts:pocket_piston', [
        'RPR',
        'EBE',
        'SAS'
    ], {
        R: BTM_EXTREME.mountain.ruby,
        P: 'create:piston_extension_pole',
        E: BTM_EXTREME.mountain.emerald,
        B: BTM_EXTREME.gate.power,
        S: BTM_EXTREME.mountain.sapphire,
        A: 'create:andesite_alloy'
    }, 'kubejs:extreme_y_rewards/mountain/pocket_piston')

    // Deepslate-depth rewards: high-value workshop/local-site utility.
    btmExtremeRecipe(event, 'sophisticatedbackpacks:advanced_magnet_upgrade', [
        'PMP',
        'RBR',
        'PMP'
    ], {
        P: BTM_EXTREME.deepslate.palladium,
        M: 'sophisticatedbackpacks:magnet_upgrade',
        R: BTM_EXTREME.deepslate.rhodium,
        B: BTM_EXTREME.gate.oc2r
    }, 'kubejs:extreme_y_rewards/deepslate/advanced_magnet_upgrade')

    btmExtremeRecipe(event, 'sophisticatedbackpacks:advanced_tool_swapper_upgrade', [
        'RTR',
        'PBP',
        'RTR'
    ], {
        R: BTM_EXTREME.deepslate.ruthenium,
        T: 'sophisticatedbackpacks:tool_swapper_upgrade',
        P: BTM_EXTREME.deepslate.platinum,
        B: BTM_EXTREME.gate.oc2r
    }, 'kubejs:extreme_y_rewards/deepslate/advanced_tool_swapper_upgrade')

    btmExtremeRecipe(event, 'buildinggadgets2:gadget_destruction', [
        'RPR',
        'SBS',
        'UTU'
    ], {
        R: BTM_EXTREME.deepslate.rhodium,
        P: BTM_EXTREME.deepslate.platinum,
        S: BTM_EXTREME.gate.space,
        B: 'buildinggadgets2:gadget_building',
        U: BTM_EXTREME.deepslate.ruthenium,
        T: BTM_EXTREME.deepslate.palladium
    }, 'kubejs:extreme_y_rewards/deepslate/gadget_destruction')

    btmExtremeRecipe(event, 'ae2:spatial_anchor', [
        'RPR',
        'SBS',
        'RPR'
    ], {
        R: BTM_EXTREME.deepslate.ruthenium,
        P: BTM_EXTREME.deepslate.platinum,
        S: 'ae2:singularity',
        B: BTM_EXTREME.gate.ae2
    }, 'kubejs:extreme_y_rewards/deepslate/spatial_anchor')

    // Lava-depth rewards: survival/combat upgrades for the most dangerous extraction band.
    btmExtremeRecipe(event, 'artifacts:obsidian_skull', [
        'DUO',
        'SBS',
        'OTD'
    ], {
        D: BTM_EXTREME.lava.debris,
        U: BTM_EXTREME.lava.uranium,
        O: BTM_EXTREME.lava.osmium,
        S: 'minecraft:obsidian',
        B: BTM_EXTREME.gate.space,
        T: BTM_EXTREME.lava.thorium
    }, 'kubejs:extreme_y_rewards/lava_depths/obsidian_skull')

    btmExtremeRecipe(event, 'artifacts:fire_gauntlet', [
        'UOU',
        'IBI',
        'TST'
    ], {
        U: BTM_EXTREME.lava.uranium,
        O: BTM_EXTREME.lava.osmium,
        I: BTM_EXTREME.lava.iridium,
        B: BTM_EXTREME.gate.space,
        T: BTM_EXTREME.lava.thorium,
        S: 'bloodmagic:demonslate'
    }, 'kubejs:extreme_y_rewards/lava_depths/fire_gauntlet')

    btmExtremeRecipe(event, 'artifacts:universal_attractor', [
        'OIO',
        'PBP',
        'OIO'
    ], {
        O: BTM_EXTREME.lava.osmium,
        I: BTM_EXTREME.lava.iridium,
        P: BTM_EXTREME.deepslate.palladium,
        B: BTM_EXTREME.gate.ae2
    }, 'kubejs:extreme_y_rewards/lava_depths/universal_attractor')

    btmExtremeRecipe(event, 'advanced_ae:lava_immunity_card', [
        'UTU',
        'OBO',
        'UTU'
    ], {
        U: BTM_EXTREME.lava.uranium,
        T: BTM_EXTREME.lava.thorium,
        O: BTM_EXTREME.lava.osmium,
        B: 'advanced_ae:quantum_upgrade_base'
    }, 'kubejs:extreme_y_rewards/lava_depths/advanced_ae_lava_immunity_card')

    btmExtremeRecipe(event, 'advanced_ae:regeneration_card', [
        'ITI',
        'EBO',
        'ITI'
    ], {
        I: BTM_EXTREME.lava.iridium,
        T: BTM_EXTREME.lava.thorium,
        E: BTM_EXTREME.gate.etherealSlate,
        B: 'advanced_ae:quantum_upgrade_base',
        O: BTM_EXTREME.lava.osmium
    }, 'kubejs:extreme_y_rewards/lava_depths/advanced_ae_regeneration_card')

    btmExtremeRecipe(event, 'advanced_ae:strength_card', [
        'OIO',
        'UBU',
        'OIO'
    ], {
        O: BTM_EXTREME.lava.osmium,
        I: BTM_EXTREME.lava.iridium,
        U: BTM_EXTREME.lava.uranium,
        B: 'advanced_ae:quantum_upgrade_base'
    }, 'kubejs:extreme_y_rewards/lava_depths/advanced_ae_strength_card')

    btmExtremeRecipe(event, 'advanced_ae:reach_card', [
        'IRI',
        'UBU',
        'IRI'
    ], {
        I: BTM_EXTREME.lava.iridium,
        R: BTM_EXTREME.deepslate.ruthenium,
        U: BTM_EXTREME.lava.uranium,
        B: 'advanced_ae:quantum_upgrade_base'
    }, 'kubejs:extreme_y_rewards/lava_depths/advanced_ae_reach_card')

    btmExtremeRecipe(event, 'advanced_ae:magnet_card', [
        'OPO',
        'IBI',
        'OPO'
    ], {
        O: BTM_EXTREME.lava.osmium,
        P: BTM_EXTREME.deepslate.palladium,
        I: BTM_EXTREME.lava.iridium,
        B: 'advanced_ae:quantum_upgrade_base'
    }, 'kubejs:extreme_y_rewards/lava_depths/advanced_ae_magnet_card')

    btmExtremeRecipe(event, 'advanced_ae:quantum_helmet', [
        'IUI',
        'PBP',
        'EAE'
    ], {
        I: BTM_EXTREME.lava.iridium,
        U: BTM_EXTREME.lava.uranium,
        P: 'advanced_ae:quantum_alloy_plate',
        B: BTM_EXTREME.gate.ae2,
        E: 'ae2:engineering_processor',
        A: BTM_EXTREME.gate.etherealSlate
    }, 'kubejs:extreme_y_rewards/lava_depths/advanced_ae_quantum_helmet')

    btmExtremeRecipe(event, 'advanced_ae:quantum_chestplate', [
        'PBP',
        'IOI',
        'UTU'
    ], {
        P: 'advanced_ae:quantum_alloy_plate',
        B: BTM_EXTREME.gate.ae2,
        I: BTM_EXTREME.lava.iridium,
        O: BTM_EXTREME.lava.osmium,
        U: BTM_EXTREME.lava.uranium,
        T: BTM_EXTREME.lava.thorium
    }, 'kubejs:extreme_y_rewards/lava_depths/advanced_ae_quantum_chestplate')

    btmExtremeRecipe(event, 'advanced_ae:quantum_leggings', [
        'IOI',
        'PBP',
        'U U'
    ], {
        I: BTM_EXTREME.lava.iridium,
        O: BTM_EXTREME.lava.osmium,
        P: 'advanced_ae:quantum_alloy_plate',
        B: BTM_EXTREME.gate.ae2,
        U: BTM_EXTREME.lava.uranium
    }, 'kubejs:extreme_y_rewards/lava_depths/advanced_ae_quantum_leggings')

    btmExtremeRecipe(event, 'advanced_ae:quantum_boots', [
        'PBP',
        'I I',
        'O O'
    ], {
        P: 'advanced_ae:quantum_alloy_plate',
        B: BTM_EXTREME.gate.ae2,
        I: BTM_EXTREME.lava.iridium,
        O: BTM_EXTREME.lava.osmium
    }, 'kubejs:extreme_y_rewards/lava_depths/advanced_ae_quantum_boots')

    btmExtremeRecipe(event, 'sophisticatedstorage:netherite_chest', [
        'IDI',
        'OCO',
        'IDI'
    ], {
        I: BTM_EXTREME.lava.iridium,
        D: BTM_EXTREME.lava.debris,
        O: BTM_EXTREME.lava.osmium,
        C: 'sophisticatedstorage:diamond_chest'
    }, 'kubejs:extreme_y_rewards/lava_depths/netherite_chest')

    btmExtremeRecipe(event, 'sophisticatedstorage:netherite_barrel', [
        'IDI',
        'OCO',
        'IDI'
    ], {
        I: BTM_EXTREME.lava.iridium,
        D: BTM_EXTREME.lava.debris,
        O: BTM_EXTREME.lava.osmium,
        C: 'sophisticatedstorage:diamond_barrel'
    }, 'kubejs:extreme_y_rewards/lava_depths/netherite_barrel')
})
