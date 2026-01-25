// kubejs/server_scripts/powdered_ores_recipes.js
;(function () {
    var DEBUG = false

    var MOD_PRIORITY = ['minecraft', 'create']

    var NUGGETS_PER_INPUT = 4
    var INCLUDE_RAW = true

    // If true, tries to remove existing Create crushing recipes for these inputs
    var REMOVE_EXISTING_CREATE_CRUSHING = true

    function safeId(s) {
        return ('' + s).replace(/[:/]/g, '_')
    }

    function uniq(list) {
        var out = []
        var seen = {}
        var i, v
        for (i = 0; i < list.length; i++) {
            v = '' + list[i]
            if (!seen[v]) { seen[v] = true; out.push(v) }
        }
        return out
    }

    function pickFromTag(tagId) {
        var ids = Ingredient.of('#' + tagId).itemIds
        if (!ids || ids.length === 0) return null

            var i, j, id, ns
            for (i = 0; i < MOD_PRIORITY.length; i++) {
                var mod = MOD_PRIORITY[i]
                for (j = 0; j < ids.length; j++) {
                    id = '' + ids[j]
                    ns = id.split(':')[0]
                    if (ns === mod) return id
                }
            }
            return '' + ids[0]
    }

    ServerEvents.recipes(function (event) {
        var mats = global.POWDERED_ORES_MATERIALS || []
        var nugMap = global.POWDERED_ORES_NUGGET_MAP || {}

        if (!mats || mats.length === 0) {
            console.log('[powdered_ores] No materials list. Startup script did not run or you did not restart.')
            return
        }

        var hasCreate = false
        try { hasCreate = Platform.isLoaded('create') } catch (e) { hasCreate = false }

        // Hammer recipe (adjust to taste)
        event.shaped('kubejs:ore_hammer', [
            ' II',
            ' SI',
            'S  '
        ], {
            I: '#forge:ingots/iron',
            S: 'minecraft:stick'
        }).id('kubejs:powdered_ores/ore_hammer')

        var i
        for (i = 0; i < mats.length; i++) {
            var mat = ('' + mats[i]).toLowerCase()

            var ingot = pickFromTag('forge:ingots/' + mat)
            if (!ingot) {
                if (DEBUG) console.log('[powdered_ores] skip ' + mat + ' no ingot tag')
                    continue
            }

            var nugget = nugMap[mat] || pickFromTag('forge:nuggets/' + mat)
            if (!nugget) {
                if (DEBUG) console.log('[powdered_ores] skip ' + mat + ' no nugget and no map')
                    continue
            }

            var powder = 'kubejs:powdered_' + mat

            // Prevent bypass: remove crafting that turns nuggets into ingots for this ingot
            event.remove({ output: ingot, input: '#forge:nuggets/' + mat })
            event.remove({ output: ingot, input: nugget })

            // Powder -> ingot
            event.remove({ type: 'minecraft:smelting', input: powder })
            event.remove({ type: 'minecraft:blasting', input: powder })
            event.smelting(ingot, powder).xp(0.7).id('kubejs:powdered_ores/powder_smelting_' + safeId(mat))
            event.blasting(ingot, powder).xp(0.7).id('kubejs:powdered_ores/powder_blasting_' + safeId(mat))

            // Inputs: ores + (optional) raw materials
            var oreIds = Ingredient.of('#forge:ores/' + mat).itemIds || []
            var rawIds = INCLUDE_RAW ? (Ingredient.of('#forge:raw_materials/' + mat).itemIds || []) : []
            var inputs = uniq(oreIds.concat(rawIds))

            if (inputs.length === 0) continue

                var j
                for (j = 0; j < inputs.length; j++) {
                    var input = inputs[j]
                    var key = safeId(input)

                    // Replace furnace outputs with 4 nuggets
                    event.remove({ type: 'minecraft:smelting', input: input })
                    event.remove({ type: 'minecraft:blasting', input: input })
                    event.smelting(Item.of(nugget, NUGGETS_PER_INPUT), input).xp(0.1)
                    .id('kubejs:powdered_ores/smelt_' + key + '_to_' + safeId(nugget))
                    event.blasting(Item.of(nugget, NUGGETS_PER_INPUT), input).xp(0.1)
                    .id('kubejs:powdered_ores/blast_' + key + '_to_' + safeId(nugget))

                    // Hand crush with hammer
                    event.recipes.kubejs.shapeless(powder, [input, 'kubejs:ore_hammer'])
                    .damageIngredient('kubejs:ore_hammer', 1)
                    .id('kubejs:powdered_ores/handcrush_' + key + '_to_' + safeId(powder))

                    // Create crushing (guarded)
                    if (hasCreate) {
                        if (REMOVE_EXISTING_CREATE_CRUSHING) {
                            event.remove({ type: 'create:crushing', input: input })
                        }
                        event.custom({
                            type: 'create:crushing',
                            ingredients: [{ item: input }],
                            results: [{ item: powder, count: 1 }],
                            processingTime: 250
                        }).id('kubejs:powdered_ores/createcrush_' + key + '_to_' + safeId(powder))
                    }
                }
        }
    })
})()
