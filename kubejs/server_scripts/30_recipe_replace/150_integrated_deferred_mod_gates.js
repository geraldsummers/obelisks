// Pack integration gates for custom mods promoted from deferred.
// Keep this Rhino-safe for KubeJS 6.

ServerEvents.recipes(function (event) {
    event.remove({ output: 'heatsync:coolant_exchanger' })

    event.custom({
        type: 'create:mechanical_crafting',
        acceptMirrored: false,
        pattern: [
            'HPFH',
            'BCTB',
            'BTCB',
            'HFPH'
        ],
        key: {
            H: { item: 'heatsync:heat_pipe' },
            P: { item: 'powergrid:copper_coil' },
            F: { item: 'create:fluid_tank' },
            B: { item: 'create:brass_sheet' },
            C: { item: 'kubejs:electrical_machine_casing' },
            T: { item: 'powergrid:electric_motor' }
        },
        result: { item: 'heatsync:coolant_exchanger' }
    }).id('kubejs:create/mechanical_crafting/heatsync/coolant_exchanger')

    event.remove({ output: 'procedural_bouquets:bouquet_grid' })
    global.btmCreateMechanicalCrafting(event, 'kubejs:decor/procedural_bouquets/bouquet_grid', 'procedural_bouquets:bouquet_grid', 1, [
        'SSS',
        'SCS',
        'PAP'
    ], {
        S: '#minecraft:wooden_slabs',
        C: 'wares:cardboard_box',
        P: 'minecraft:stick',
        A: 'create:andesite_casing'
    }, true)
})
