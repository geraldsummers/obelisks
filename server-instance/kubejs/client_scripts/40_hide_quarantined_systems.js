var BTM_HIDDEN_QUARANTINED_ITEMS = [
    'alchemistry:atomizer',
    'alchemistry:combiner',
    'alchemistry:compactor',
    'alchemistry:dissolver',
    'alchemistry:fission_chamber_controller',
    'alchemistry:fission_core',
    'alchemistry:fusion_chamber_controller',
    'alchemistry:fusion_core',
    'alchemistry:liquifier',
    'alchemistry:reactor_casing',
    'alchemistry:reactor_energy',
    'alchemistry:reactor_glass',
    'alchemistry:reactor_input',
    'alchemistry:reactor_output',
    'occultism:miner_debug_unspecialized',
    'occultism:miner_foliot_unspecialized',
    'occultism:miner_djinni_ores',
    'occultism:miner_afrit_deeps',
    'occultism:miner_marid_master',
    'sophisticatedbackpacks:stack_upgrade_omega_tier',
    'sophisticatedstorage:stack_upgrade_omega_tier'
]

JEIEvents.hideItems(function (event) {
    BTM_HIDDEN_QUARANTINED_ITEMS.forEach(function (item) { event.hide(item) })
})

if (Platform.isLoaded('emi') && typeof EMIEvents !== 'undefined') {
    EMIEvents.hideItems(function (event) {
        BTM_HIDDEN_QUARANTINED_ITEMS.forEach(function (item) { event.hide(item) })
    })
}
