function addAllToTargets(event, targets, entries) {
    for (var ti = 0; ti < targets.length; ti++) {
        for (var ei = 0; ei < entries.length; ei++) {
            event.add(targets[ti], entries[ei])
        }
    }
}

var sandLikeEntries = [
    'minecraft:sand',
    'minecraft:red_sand',
    'natures_spirit:pink_sand'
]

ServerEvents.tags('item', function (event) {
    addAllToTargets(event, ['forge:sand', 'c:sand'], sandLikeEntries)
    addAllToTargets(event, ['forge:sand/colorless'], [
        'minecraft:sand',
        'natures_spirit:pink_sand'
    ])
    addAllToTargets(event, ['forge:sand/red'], [
        'minecraft:red_sand'
    ])
})

ServerEvents.tags('block', function (event) {
    addAllToTargets(event, ['forge:sand', 'c:sand'], sandLikeEntries)
    addAllToTargets(event, ['forge:sand/colorless'], [
        'minecraft:sand',
        'natures_spirit:pink_sand'
    ])
    addAllToTargets(event, ['forge:sand/red'], [
        'minecraft:red_sand'
    ])
})
