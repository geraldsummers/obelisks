// Alchemistry dissolver parity without Alchemistry machines.
//
// The source table is generated from Alchemistry's dissolver JSON, then expressed
// as Create mixing: item/tag + ChemLib acid/solvent + grinding ball catalyst.

var BTM_ADP_TABLE = JsonIO.read('kubejs/config/alchemistry_dissolver_port.json') || { recipes: [] }

function btmAdpItemExists(id) {
    if (!id || id === 'minecraft:air') return false
    try { return Item.exists(id) } catch (e) { return false }
}

function btmAdpTagExists(tag) {
    if (!tag) return false
    try {
        var ingredient = Ingredient.of('#' + tag)
        if (ingredient.isEmpty && ingredient.isEmpty()) return false
        if (ingredient.itemIds && ingredient.itemIds.length === 0) return false
        return true
    } catch (e) {
        return false
    }
}

function btmAdpIngredientExists(input) {
    if (!input) return false
    if (input.item) return btmAdpItemExists(input.item)
    if (input.tag) return btmAdpTagExists(input.tag)
    return false
}

function btmAdpIngredientJson(input) {
    if (input.item) return { item: input.item }
    return { tag: input.tag }
}

function btmAdpSolventById(id) {
    var solvents = global.BTM_RO_SOLVENTS || []
    for (var i = 0; i < solvents.length; i++) if (solvents[i].id === id) return solvents[i]
    return null
}

function btmAdpBallById(id) {
    var balls = global.BTM_RO_BALLS || []
    for (var i = 0; i < balls.length; i++) if (balls[i].id === id) return balls[i]
    return null
}

function btmAdpRetention(acid, ball) {
    if (!global.BTM_RO_RETENTION) return 0.75
    if (!global.BTM_RO_RETENTION[acid]) return 0.75
    return global.BTM_RO_RETENTION[acid][ball] || 0.75
}

function btmAdpResults(row) {
    var results = []
    for (var i = 0; i < row.results.length; i++) {
        var source = row.results[i]
        if (!btmAdpItemExists(source.item)) continue
        var result = { item: source.item }
        if (source.count && source.count > 1) result.count = source.count
        if (source.chance && source.chance < 1) result.chance = source.chance
        results.push(result)
    }
    return results
}

var BTM_ADP_GAS_PRODUCTS = {
    ethanol: { item: 'chemlib:carbon_dioxide', chance: 0.06 },
    acetic: { item: 'chemlib:carbon_dioxide', chance: 0.10 },
    sulfuric: { item: 'chemlib:sulfur_dioxide', chance: 0.18 },
    hydrochloric: { item: 'chemlib:hydrogen', chance: 0.16 },
    nitric: { item: 'chemlib:nitrogen_dioxide', chance: 0.22 },
    phosphoric: { item: 'chemlib:hydrogen', chance: 0.08 }
}

function btmAdpAddGasSideProduct(results, row) {
    var gas = BTM_ADP_GAS_PRODUCTS[row.acid]
    if (!gas || !btmAdpItemExists(gas.item)) return
    results.push({ item: gas.item, chance: gas.chance })
}

ServerEvents.recipes(function (event) {
    var recipes = BTM_ADP_TABLE.recipes || []
    for (var i = 0; i < recipes.length; i++) {
        var row = recipes[i]
        var solvent = btmAdpSolventById(row.acid)
        var ball = btmAdpBallById(row.ball)
        if (!solvent || !ball) continue
        if (!btmAdpIngredientExists(row.input) || !btmAdpItemExists(ball.item)) continue

        var results = btmAdpResults(row)
        if (!results.length) continue
        results.push({ item: ball.item, chance: btmAdpRetention(row.acid, row.ball) })
        btmAdpAddGasSideProduct(results, row)

        var recipe = {
            type: 'create:mixing',
            ingredients: [
                btmAdpIngredientJson(row.input),
                { item: ball.item },
                { fluid: solvent.fluid, amount: solvent.amount }
            ],
            results: results,
            processingTime: row.processingTime || solvent.time || 220
        }

        if (row.heat || solvent.heat) recipe.heatRequirement = row.heat || solvent.heat
        event.custom(recipe).id('kubejs:alchemistry_dissolver_port/' + row.id)
    }
})
