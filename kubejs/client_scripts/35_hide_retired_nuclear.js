var BTM_RETIRED_NUCLEAR_ITEMS = [
    'create_new_age:reactor_fuel_acceptor',
    'create_new_age:reactor_rod',
    'create_new_age:reactor_heat_vent',
    'create_new_age:reactor_casing',
    'create_new_age:reactor_glass'
]

JEIEvents.hideItems(function (event) {
    BTM_RETIRED_NUCLEAR_ITEMS.forEach(function (item) { event.hide(item) })
})

if (Platform.isLoaded('emi') && typeof EMIEvents !== 'undefined') {
    EMIEvents.hideItems(function (event) {
        BTM_RETIRED_NUCLEAR_ITEMS.forEach(function (item) { event.hide(item) })
    })
}
