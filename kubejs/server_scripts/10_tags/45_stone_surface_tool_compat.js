var BTM_STONE_SURFACE_PICK_ONLY_BLOCKS = [
    'unearthed:beige_limestone_grassy_regolith',
    'unearthed:conglomerate_grassy_regolith',
    'unearthed:dolomite_grassy_regolith',
    'unearthed:gabbro_grassy_regolith',
    'unearthed:granodiorite_grassy_regolith',
    'unearthed:grey_limestone_grassy_regolith',
    'unearthed:kimberlite_grassy_regolith',
    'unearthed:limestone_grassy_regolith',
    'unearthed:mudstone_grassy_regolith',
    'unearthed:overgrown_andesite',
    'unearthed:overgrown_diorite',
    'unearthed:overgrown_granite',
    'unearthed:phyllite_grassy_regolith',
    'unearthed:quartzite_grassy_regolith',
    'unearthed:rhyolite_grassy_regolith',
    'unearthed:sandstone_grassy_regolith',
    'unearthed:siltstone_grassy_regolith',
    'unearthed:slate_grassy_regolith',
    'unearthed:stone_grassy_regolith',
    'unearthed:white_granite_grassy_regolith',
    'unearthed:white_granite_regolith'
]

ServerEvents.tags('block', function (event) {
    for (var i = 0; i < BTM_STONE_SURFACE_PICK_ONLY_BLOCKS.length; i++) {
        var id = BTM_STONE_SURFACE_PICK_ONLY_BLOCKS[i]
        event.add('minecraft:mineable/pickaxe', id)
        event.remove('minecraft:mineable/axe', id)
        event.remove('minecraft:mineable/shovel', id)
        event.remove('minecraft:mineable/hoe', id)
        event.remove('minecraft:sword_efficient', id)
    }
})
