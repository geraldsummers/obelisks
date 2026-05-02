// Gates found by the offline expert graph audit. These are explicit recipes/removals for
// high-impact outputs that broad replaceInput passes can miss.

var BTM_GRAPH_GATE = {
    andesite: 'kubejs:andesite_machine_casing',
    brass: 'kubejs:brass_machine_casing',
    power: 'kubejs:power_grid_machine_casing',
    oc2r: 'kubejs:oc2r_machine_casing',
    ae2: 'kubejs:ae2_machine_casing',
    demonic: 'bloodmagic:demonslate',
    ethereal: 'bloodmagic:etherealslate'
}

function btmGraphItemExists(id) {
    try { return Item.exists(id) } catch (e) { return false }
}

function btmGraphRemoveOutputs(event, outputs) {
    for (var i = 0; i < outputs.length; i++) event.remove({ output: outputs[i] })
}

function btmGraphShaped(event, output, pattern, keys, id) {
    if (!btmGraphItemExists(output)) return
    event.remove({ output: output })
    event.shaped(output, pattern, keys).id(id)
}

ServerEvents.recipes(function (event) {
    // Teleportation and chunk-loading bypasses: remove generic routes unless explicitly re-authored.
    btmGraphRemoveOutputs(event, [
        'vampirism:crossbow_arrow_teleport',
        'naturesaura:chunk_loader'
    ])

    // Early Create utility should still depend on the andesite machine casing tier once it is block-machine-like.
    btmGraphShaped(event, 'create:fluid_pipe', [
        ' C ',
        'SAS',
        ' C '
    ], {
        C: 'minecraft:copper_ingot',
        S: 'create:copper_sheet',
        A: BTM_GRAPH_GATE.andesite
    }, 'kubejs:graph_gate/create/fluid_pipe')

    btmGraphShaped(event, 'create:mechanical_pump', [
        ' S ',
        'FAF',
        ' C '
    ], {
        S: 'create:shaft',
        F: 'create:fluid_pipe',
        A: BTM_GRAPH_GATE.andesite,
        C: 'create:cogwheel'
    }, 'kubejs:graph_gate/create/mechanical_pump')

    btmGraphShaped(event, 'create:track_observer', [
        ' R ',
        'CAC',
        ' T '
    ], {
        R: 'minecraft:redstone',
        C: 'create:electron_tube',
        A: BTM_GRAPH_GATE.andesite,
        T: 'create:track'
    }, 'kubejs:graph_gate/create/track_observer')

    // Create Connected and diesel logistics are brass-era infrastructure.
    btmGraphShaped(event, 'create_connected:sequenced_pulse_generator', [
        'RCR',
        'ABA',
        'RCR'
    ], {
        R: 'minecraft:redstone',
        C: 'create:electron_tube',
        A: 'create:brass_sheet',
        B: BTM_GRAPH_GATE.brass
    }, 'kubejs:graph_gate/create_connected/sequenced_pulse_generator')

    btmGraphShaped(event, 'create_connected:linked_transmitter', [
        ' E ',
        'RBR',
        ' P '
    ], {
        E: 'minecraft:ender_pearl',
        R: 'minecraft:redstone',
        B: BTM_GRAPH_GATE.brass,
        P: 'create:precision_mechanism'
    }, 'kubejs:graph_gate/create_connected/linked_transmitter')

    btmGraphShaped(event, 'createdieselgenerators:distillation_controller', [
        'PBP',
        'TCT',
        'PBP'
    ], {
        P: 'create:brass_sheet',
        B: BTM_GRAPH_GATE.brass,
        T: 'create:fluid_tank',
        C: 'create:precision_mechanism'
    }, 'kubejs:graph_gate/createdieselgenerators/distillation_controller')

    btmGraphShaped(event, 'createdieselgenerators:pumpjack_hole', [
        'SBS',
        'PAP',
        'SBS'
    ], {
        S: 'create:shaft',
        B: BTM_GRAPH_GATE.brass,
        P: 'create:fluid_pipe',
        A: 'create:precision_mechanism'
    }, 'kubejs:graph_gate/createdieselgenerators/pumpjack_hole')

    btmGraphShaped(event, 'createdieselgenerators:pumpjack_head', [
        'SPS',
        'ABA',
        'SPS'
    ], {
        S: 'create:shaft',
        P: 'create:fluid_pipe',
        A: 'create:brass_sheet',
        B: BTM_GRAPH_GATE.brass
    }, 'kubejs:graph_gate/createdieselgenerators/pumpjack_head')

    // Acid Vat logistics stay brass-era chemistry infrastructure.
    btmGraphShaped(event, 'acid_vat:smart_slurry_pipe', [
        'RPR',
        'PBP',
        'RPR'
    ], {
        R: 'minecraft:redstone',
        P: 'acid_vat:acid_tube',
        B: BTM_GRAPH_GATE.brass
    }, 'kubejs:graph_gate/acid_vat/smart_slurry_pipe')

    btmGraphShaped(event, 'acid_vat:portable_slurry_interface', [
        'TPT',
        'PBP',
        'TPT'
    ], {
        T: 'acid_vat:slurry_tank',
        P: 'acid_vat:smart_slurry_pipe',
        B: BTM_GRAPH_GATE.brass
    }, 'kubejs:graph_gate/acid_vat/portable_slurry_interface')

    // Power Grid / New Age heat infrastructure should not be simple Create-era crafting.
    btmGraphShaped(event, 'create_new_age:heat_pipe', [
        'SCS',
        'PBP',
        'SCS'
    ], {
        S: 'create:copper_sheet',
        C: 'powergrid:conductive_casing',
        P: 'create:fluid_pipe',
        B: BTM_GRAPH_GATE.power
    }, 'kubejs:graph_gate/create_new_age/heat_pipe')

    btmGraphShaped(event, 'create_new_age:heat_pump', [
        'PHP',
        'CBC',
        'PHP'
    ], {
        P: 'create_new_age:heat_pipe',
        H: 'powergrid:electric_motor',
        C: 'powergrid:conductive_casing',
        B: BTM_GRAPH_GATE.power
    }, 'kubejs:graph_gate/create_new_age/heat_pump')

    // Chunk loading is remote-site infrastructure and must sit behind power/compute logistics.
    btmGraphShaped(event, 'create_power_loader:empty_andesite_chunk_loader', [
        'SPS',
        'CBC',
        'SPS'
    ], {
        S: 'create:andesite_alloy',
        P: 'powergrid:battery',
        C: 'powergrid:conductive_casing',
        B: BTM_GRAPH_GATE.power
    }, 'kubejs:graph_gate/create_power_loader/empty_andesite_chunk_loader')

    btmGraphShaped(event, 'create_power_loader:empty_brass_chunk_loader', [
        'SPS',
        'CBC',
        'SPS'
    ], {
        S: 'create:brass_sheet',
        P: 'oc2r:network_connector',
        C: 'oc2r:circuit_board',
        B: BTM_GRAPH_GATE.oc2r
    }, 'kubejs:graph_gate/create_power_loader/empty_brass_chunk_loader')

    // AE2 addon oversize interface is local-intelligence scale, not a cheap alternate interface.
    btmGraphShaped(event, 'expatternprovider:oversize_interface', [
        'IPI',
        'BAB',
        'IPI'
    ], {
        I: 'ae2:interface',
        P: 'ae2:engineering_processor',
        B: BTM_GRAPH_GATE.ae2,
        A: 'ae2:annihilation_core'
    }, 'kubejs:graph_gate/expatternprovider/oversize_interface')
})
