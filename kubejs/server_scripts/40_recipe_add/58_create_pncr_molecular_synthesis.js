// Create + PNCR molecular synthesis.
//
// Create owns bulk visible chemistry. PNCR owns sealed pressure/gas handling.
// These routes intentionally make easy molecules appear before Airtight and make
// stronger solvents depend on the machine tiers they help justify.

function btmChemItem(id) {
    try { return Item.exists(id) } catch (e) { return false }
}

function btmChemMixing(event, id, ingredients, results, heat, time) {
    var recipe = {
        type: 'create:mixing',
        ingredients: ingredients,
        results: results,
        processingTime: time || 160
    }
    if (heat) recipe.heatRequirement = heat
    event.custom(recipe).id('kubejs:chemistry/create_mixing/' + id)
}

function btmChemCompacting(event, id, ingredients, results, heat) {
    var recipe = {
        type: 'create:compacting',
        ingredients: ingredients,
        results: results
    }
    if (heat) recipe.heatRequirement = heat
    event.custom(recipe).id('kubejs:chemistry/create_compacting/' + id)
}

function btmChemPressure(event, id, inputs, result, pressure) {
    event.custom({
        type: 'pneumaticcraft:pressure_chamber',
        inputs: inputs,
        pressure: pressure,
        results: [result]
    }).id('kubejs:chemistry/pneumaticcraft/pressure_chamber/' + id)
}

function btmChemThermo(event, id, itemInput, fluidInput, fluidOutput, pressure, minTemp) {
    var recipe = {
        type: 'pneumaticcraft:thermo_plant',
        exothermic: false,
        item_input: itemInput,
        fluid_input: fluidInput,
        fluid_output: fluidOutput,
        pressure: pressure || 2,
        speed: 0.45
    }
    if (minTemp) recipe.temperature = { min_temp: minTemp }
    event.custom(recipe).id('kubejs:chemistry/pneumaticcraft/thermo_plant/' + id)
}

ServerEvents.recipes(function (event) {
    event.remove({ id: 'kubejs:pneumaticcraft/pressure_seal' })
    btmChemCompacting(event, 'pressure_seal', [
        { item: 'minecraft:slime_ball' },
        { item: 'minecraft:dried_kelp' },
        { item: 'chemlib:sulfur' },
        { item: 'chemlib:carbon' },
        { fluid: 'chemlib:ethanol_fluid', amount: 250 }
    ], [{ item: 'kubejs:pressure_seal', count: 2 }], null)

    btmChemMixing(event, 'ethanol_from_sugar', [
        { item: 'minecraft:sugar' },
        { item: 'chemlib:carbon' },
        { fluid: 'minecraft:water', amount: 250 }
    ], [{ fluid: 'chemlib:ethanol_fluid', amount: 250 }], null, 120)

    btmChemMixing(event, 'acetic_acid_from_ethanol', [
        { item: 'chemlib:oxygen' },
        { item: 'chemlib:carbon' },
        { fluid: 'chemlib:ethanol_fluid', amount: 250 }
    ], [{ fluid: 'chemlib:acetic_acid_fluid', amount: 250 }], 'heated', 180)

    btmChemMixing(event, 'sulfuric_acid_from_sulfur_trioxide', [
        { item: 'chemlib:sulfur_trioxide' },
        { item: 'chemlib:oxygen' },
        { fluid: 'minecraft:water', amount: 250 }
    ], [{ fluid: 'chemlib:sulfuric_acid_fluid', amount: 250 }], 'heated', 200)

    btmChemMixing(event, 'hydrochloric_acid_from_chlorine', [
        { item: 'chemlib:chlorine' },
        { item: 'chemlib:hydrogen' },
        { fluid: 'minecraft:water', amount: 250 }
    ], [{ fluid: 'chemlib:hydrochloric_acid_fluid', amount: 250 }], 'heated', 200)

    btmChemMixing(event, 'nitric_acid_from_nitrogen_dioxide', [
        { item: 'chemlib:nitrogen_dioxide' },
        { item: 'chemlib:oxygen' },
        { fluid: 'minecraft:water', amount: 250 }
    ], [{ fluid: 'chemlib:nitric_acid_fluid', amount: 250 }], 'heated', 220)

    btmChemMixing(event, 'phosphoric_acid_fluid', [
        { item: 'chemlib:phosphoric_acid' },
        { item: 'chemlib:phosphorus' },
        { fluid: 'minecraft:water', amount: 250 }
    ], [{ fluid: 'kubejs:phosphoric_acid_fluid', amount: 250 }], 'heated', 180)

    btmChemMixing(event, 'phosphoric_acid_molecule', [
        { item: 'chemlib:phosphorus' },
        { item: 'chemlib:oxygen' },
        { item: 'minecraft:bone_meal' },
        { fluid: 'minecraft:water', amount: 250 }
    ], [{ item: 'chemlib:phosphoric_acid', count: 2 }], 'heated', 180)

    btmChemCompacting(event, 'sodium_hydroxide', [
        { item: 'chemlib:sodium' },
        { item: 'chemlib:oxygen' },
        { fluid: 'minecraft:water', amount: 250 }
    ], [{ item: 'chemlib:sodium_hydroxide', count: 2 }], null)

    btmChemCompacting(event, 'silicon_dioxide', [
        { item: 'chemlib:silicon' },
        { item: 'chemlib:oxygen' },
        { item: 'minecraft:quartz' }
    ], [{ item: 'chemlib:silicon_dioxide', count: 2 }], null)

    btmChemCompacting(event, 'calcium_carbonate', [
        { item: 'chemlib:calcium' },
        { item: 'chemlib:carbon' },
        { item: 'minecraft:bone_meal' }
    ], [{ item: 'chemlib:calcium_carbonate', count: 2 }], null)

    btmChemCompacting(event, 'calcium_oxide', [
        { item: 'chemlib:calcium_carbonate' },
        { item: 'minecraft:charcoal' }
    ], [{ item: 'chemlib:calcium_oxide' }, { item: 'chemlib:carbon_dioxide' }], 'heated')

    btmChemPressure(event, 'copper_chloride', [
        { item: 'chemlib:copper' },
        { item: 'chemlib:chlorine' },
        { item: 'chemlib:sodium_chloride' }
    ], { item: 'chemlib:copper_chloride', count: 2 }, 2.5)

    btmChemPressure(event, 'copper_nitrate', [
        { item: 'chemlib:copper' },
        { item: 'chemlib:nitrogen_dioxide' },
        { item: 'chemlib:oxygen' }
    ], { item: 'chemlib:copper_nitrate', count: 2 }, 3.0)

    btmChemPressure(event, 'pvc', [
        { item: 'chemlib:ethylene' },
        { item: 'chemlib:chlorine' },
        { item: 'chemlib:carbon' },
        { item: 'kubejs:pressure_seal' }
    ], { item: 'chemlib:polyvinyl_chloride', count: 4 }, 3.5)

    btmChemThermo(event, 'sulfur_dioxide', { item: 'chemlib:sulfur' }, {
        type: 'pneumaticcraft:fluid',
        fluid: 'chemlib:oxygen_fluid',
        amount: 250
    }, { fluid: 'chemlib:sulfur_dioxide_fluid', amount: 250 }, 2.0, 473)

    btmChemThermo(event, 'sulfur_trioxide', { item: 'chemlib:sulfur_dioxide' }, {
        type: 'pneumaticcraft:fluid',
        fluid: 'chemlib:oxygen_fluid',
        amount: 250
    }, { fluid: 'chemlib:sulfur_trioxide_fluid', amount: 250 }, 3.0, 573)

    btmChemThermo(event, 'nitrogen_dioxide', { item: 'chemlib:nitric_oxide' }, {
        type: 'pneumaticcraft:fluid',
        fluid: 'chemlib:oxygen_fluid',
        amount: 250
    }, { fluid: 'chemlib:nitrogen_dioxide_fluid', amount: 250 }, 3.0, 523)
})
