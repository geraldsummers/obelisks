// Late dimension access routes. Twilight Forest, Fallout Wastelands, and Lost Cities
// are space-era route branches; the direct Fallout portal recipes are rewritten here.

ServerEvents.recipes(function (event) {
    if (Item.exists('fallout_wastelands_:portal_frame')) {
        event.remove({ output: 'fallout_wastelands_:portal_frame' })
        event.shaped(Item.of('fallout_wastelands_:portal_frame', 4), [
            'HSH',
            'SCS',
            'HSH'
        ], {
            H: 'creatingspace:hastelloy_sheet',
            S: 'kubejs:space_machine_casing',
            C: 'creatingspace:chemical_synthesizer'
        }).id('kubejs:space_dimension_access/fallout_portal_frame')
    }

    if (Item.exists('fallout_wastelands_:wastelands')) {
        event.remove({ output: 'fallout_wastelands_:wastelands' })
        event.shaped('fallout_wastelands_:wastelands', [
            ' R ',
            'OCO',
            'SES'
        ], {
            R: 'creatingspace:rocket_controls',
            O: 'creatingspace:netherite_oxygen_backtank',
            C: 'kubejs:space_machine_casing',
            S: 'creatingspace:hastelloy_sheet',
            E: 'creatingspace:rocket_engine'
        }).id('kubejs:space_dimension_access/fallout_portal_igniter')
    }
})
