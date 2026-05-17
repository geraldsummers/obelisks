// Forge 1.20.1 / KubeJS 6+
// Keep first passive SU generation at the Andesite machine-casing tier.
// Later SU generation is handled in the casing ecosystem pass.

ServerEvents.recipes(event => {
    const shaft = 'create:shaft'
    const casing = 'kubejs:andesite_machine_casing'

    event.replaceInput(
        { id: 'create:crafting/kinetics/water_wheel' },
        shaft,
        casing
    )

    event.replaceInput(
        { id: 'create:crafting/kinetics/windmill_bearing' },
        shaft,
        casing
    )

    event.replaceInput(
        { id: 'create:crafting/kinetics/large_water_wheel' },
        shaft,
        casing
    )
})
