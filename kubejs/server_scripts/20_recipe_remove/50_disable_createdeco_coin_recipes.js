ServerEvents.recipes(function (event) {
    var outputs = [
        'createdeco:copper_coin',
        'createdeco:iron_coin',
        'createdeco:industrial_iron_coin',
        'createdeco:brass_coin',
        'createdeco:gold_coin',
        'createdeco:zinc_coin',
        'createdeco:netherite_coin',
        'createdeco:copper_coinstack',
        'createdeco:iron_coinstack',
        'createdeco:industrial_iron_coinstack',
        'createdeco:brass_coinstack',
        'createdeco:gold_coinstack',
        'createdeco:zinc_coinstack',
        'createdeco:netherite_coinstack'
    ]

    for (var i = 0; i < outputs.length; i++) {
        event.remove({ output: outputs[i] })
    }
})
