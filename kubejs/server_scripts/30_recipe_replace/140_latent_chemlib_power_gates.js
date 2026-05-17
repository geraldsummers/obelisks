// Latent ChemLib owns chemical cloud containment, high-energy reactions, and
// neutron-economy traversal. CNA reactor blocks are intentionally retired.

function btmLatentRemove(event, ids) {
    for (var i = 0; i < ids.length; i++) event.remove({ id: ids[i] })
}

ServerEvents.recipes(function (event) {
    btmLatentRemove(event, [
        'create_new_age:reactor_fuel_acceptor',
        'create_new_age:reactor_rod',
        'create_new_age:reactor_heat_vent',
        'create_new_age:reactor_casing',
        'create_new_age:reactor_glass'
    ])

    event.remove({ output: 'create_new_age:reactor_fuel_acceptor' })
    event.remove({ output: 'create_new_age:reactor_rod' })
    event.remove({ output: 'create_new_age:reactor_heat_vent' })
    event.remove({ output: 'create_new_age:reactor_casing' })
    event.remove({ output: 'create_new_age:reactor_glass' })

    event.custom({
        type: 'create:mechanical_crafting',
        acceptMirrored: false,
        pattern: [
            ' V ',
            'ACA',
            ' P '
        ],
        key: {
            V: { item: 'create:fluid_valve' },
            A: { item: 'kubejs:airtight_machine_casing' },
            C: { item: 'pneumaticcraft:pressure_chamber_wall' },
            P: { item: 'pneumaticcraft:reinforced_pressure_tube' }
        },
        result: { item: 'latent_chemlib:gas_capture' }
    }).id('kubejs:create/mechanical_crafting/latent_chemlib/gas_capture')

    event.custom({
        type: 'create:mechanical_crafting',
        acceptMirrored: false,
        pattern: [
            'GPG',
            'ACA',
            'GPG'
        ],
        key: {
            G: { tag: 'forge:glass' },
            P: { item: 'create_new_age:heat_pipe' },
            A: { item: 'kubejs:airtight_machine_casing' },
            C: { item: 'latent_chemlib:gas_capture' }
        },
        result: { item: 'latent_chemlib:gas_tank' }
    }).id('kubejs:create/mechanical_crafting/latent_chemlib/gas_tank')

    event.custom({
        type: 'create:mechanical_crafting',
        acceptMirrored: false,
        pattern: [
            'SES',
            'TCT',
            'SPS'
        ],
        key: {
            S: { item: 'creatingspace:inconel_sheet' },
            E: { item: 'powergrid:electromagnet' },
            T: { item: 'latent_chemlib:gas_tank' },
            C: { item: 'kubejs:space_machine_casing' },
            P: { item: 'powergrid:battery' }
        },
        result: { item: 'latent_chemlib:gas_reaction_chamber' }
    }).id('kubejs:create/mechanical_crafting/latent_chemlib/gas_reaction_chamber')

    event.custom({
        type: 'create:mechanical_crafting',
        acceptMirrored: false,
        pattern: [
            ' P ',
            'TCT',
            ' V '
        ],
        key: {
            P: { item: 'create:propeller' },
            T: { item: 'create_new_age:heat_pipe' },
            C: { item: 'latent_chemlib:gas_tank' },
            V: { item: 'create:fluid_valve' }
        },
        result: { item: 'latent_chemlib:gas_release' }
    }).id('kubejs:create/mechanical_crafting/latent_chemlib/gas_release')

    event.custom({
        type: 'create:mechanical_crafting',
        acceptMirrored: true,
        pattern: [
            ' G ',
            'SCS',
            ' P '
        ],
        key: {
            G: { tag: 'forge:glass' },
            S: { item: 'kubejs:pressure_seal' },
            C: { item: 'pneumaticcraft:small_tank' },
            P: { item: 'create_new_age:heat_pipe' }
        },
        result: { item: 'latent_chemlib:sealed_chemical_cell', count: 4 }
    }).id('kubejs:create/mechanical_crafting/latent_chemlib/sealed_chemical_cell')
})
