// Replace bucket requirement in kettle recipes with Blood Magic altar capacity rune.

ServerEvents.recipes(function (event) {
    event.replaceInput(
        { output: 'farmersrespite:kettle' },
        'minecraft:bucket',
        'bloodmagic:altarcapacityrune'
    )
})
