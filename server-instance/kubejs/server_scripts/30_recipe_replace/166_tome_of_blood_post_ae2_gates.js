// Tome of Blood is treated as a post-AE2 hybrid combat-magic branch. Its native
// recipes are small Blood/Ars conversions, but the outputs let Ars casting spend
// LP, scale with Demon Will, and merge Living Armor with mage gear.

function btmTobExists(id) {
    try { return Item.exists(id) } catch (e) { return false }
}

function btmTobRemoveIds(event, ids) {
    for (var i = 0; i < ids.length; i++) event.remove({ id: ids[i] })
}

function btmTobAlchemy(event, output, input, syphon, ticks, upgradeLevel, id) {
    if (!btmTobExists(output)) return
    event.custom({
        type: 'bloodmagic:alchemytable',
        input: input,
        output: { item: output },
        syphon: syphon,
        ticks: ticks,
        upgradeLevel: upgradeLevel
    }).id(id)
}

function btmTobGlyph(event, output, exp, inputItems, id) {
    if (!btmTobExists(output)) return
    event.custom({
        type: 'ars_nouveau:glyph',
        count: 1,
        exp: exp,
        inputItems: inputItems.map(function (item) { return { item: { item: item } } }),
        output: output
    }).id(id)
}

function btmTobArmor(event, output, reagent, id) {
    if (!btmTobExists(output)) return
    event.custom({
        type: 'ars_nouveau:enchanting_apparatus',
        keepNbtOfReagent: true,
        output: { item: output },
        pedestalItems: [
            { item: 'ars_nouveau:magebloom_fiber' },
            { item: 'bloodmagic:etherealslate' },
            { item: 'advanced_ae:quantum_alloy_plate' },
            { item: 'kubejs:sky_steel_sheet' },
            { item: 'advanced_ae:quantum_core' },
            { item: 'kubejs:ae2_machine_casing' }
        ],
        reagent: [{ item: reagent }],
        sourceCost: 12000
    }).id(id)
}

ServerEvents.recipes(function (event) {
    if (!btmTobExists('tomeofblood:novice_tome_of_blood')) return

    btmTobRemoveIds(event, [
        'tomeofblood:altar/novice_blood_tome',
        'tomeofblood:altar/apprentice_blood_tome',
        'tomeofblood:altar/archmage_blood_tome',
        'tomeofblood:alchemytable/apprentice_tome',
        'tomeofblood:alchemytable/archmage_tome',
        'tomeofblood:glyph_sentient_harm',
        'tomeofblood:glyph_sentient_wrath',
        'tomeofblood:living_mage_hood',
        'tomeofblood:living_mage_robes',
        'tomeofblood:living_mage_leggings',
        'tomeofblood:living_mage_boots'
    ])

    btmTobAlchemy(event, 'tomeofblood:novice_tome_of_blood', [
        { item: 'ars_nouveau:novice_spell_book' },
        { item: 'ars_nouveau:source_gem_block' },
        { item: 'bloodmagic:etherealslate' },
        { item: 'kubejs:ae2_machine_casing' },
        { item: 'advanced_ae:quantum_alloy_plate' }
    ], 25000, 200, 4, 'kubejs:tomeofblood/alchemytable/novice_tome_post_ae2')

    btmTobAlchemy(event, 'tomeofblood:apprentice_tome_of_blood', [
        { item: 'tomeofblood:novice_tome_of_blood' },
        { item: 'ars_nouveau:apprentice_spell_book' },
        { item: 'ars_nouveau:wilden_tribute' },
        { item: 'bloodmagic:etherealslate' },
        { item: 'advanced_ae:quantum_core' },
        { item: 'kubejs:sky_steel_sheet' }
    ], 50000, 240, 4, 'kubejs:tomeofblood/alchemytable/apprentice_tome_post_ae2')

    btmTobAlchemy(event, 'tomeofblood:archmage_tome_of_blood', [
        { item: 'tomeofblood:apprentice_tome_of_blood' },
        { item: 'ars_nouveau:archmage_spell_book' },
        { item: 'minecraft:nether_star' },
        { item: 'bloodmagic:etherealslate' },
        { item: 'advanced_ae:quantum_core' },
        { item: 'fission_reactor:fission_reactor_rod' }
    ], 100000, 320, 5, 'kubejs:tomeofblood/alchemytable/archmage_tome_post_ae2')

    btmTobGlyph(event, 'tomeofblood:glyph_sentient_harm', 80, [
        'bloodmagic:soulsword',
        'bloodmagic:etherealslate',
        'advanced_ae:quantum_alloy_plate',
        'kubejs:ae2_machine_casing'
    ], 'kubejs:tomeofblood/glyph_sentient_harm_post_ae2')

    btmTobGlyph(event, 'tomeofblood:glyph_sentient_wrath', 120, [
        'bloodmagic:soulscythe',
        'bloodmagic:throwing_dagger',
        'ars_nouveau:conjuration_essence',
        'bloodmagic:etherealslate',
        'advanced_ae:quantum_core',
        'fission_reactor:fission_reactor_rod'
    ], 'kubejs:tomeofblood/glyph_sentient_wrath_post_ae2')

    btmTobArmor(event, 'tomeofblood:living_mage_hood', 'bloodmagic:livinghelmet', 'kubejs:tomeofblood/living_mage_hood_post_ae2')
    btmTobArmor(event, 'tomeofblood:living_mage_robes', 'bloodmagic:livingplate', 'kubejs:tomeofblood/living_mage_robes_post_ae2')
    btmTobArmor(event, 'tomeofblood:living_mage_leggings', 'bloodmagic:livingleggings', 'kubejs:tomeofblood/living_mage_leggings_post_ae2')
    btmTobArmor(event, 'tomeofblood:living_mage_boots', 'bloodmagic:livingboots', 'kubejs:tomeofblood/living_mage_boots_post_ae2')
})
