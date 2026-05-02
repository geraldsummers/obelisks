// KubeJS 6+ (Forge 1.20.1) - Rhino safe, no Java.loadClass
// Robust approach: scan recipe.json as STRING (survives class filters / Java-backed maps)

const NEEDLES_EXACT = [
    '"minecraft:copper_ingot"',   // item usage
'minecraft:copper_ingot',     // fallback if formatting differs
'forge:ingots/copper',
'c:copper_ingots'
];

// broaden to catch e.g. mytags:ingots/copper, etc.
const NEEDLES_SUBSTR = [
    'ingots/copper',
'copper_ingots',
'copper/ingots'
];

function stringContainsAny(hay, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (hay.indexOf(arr[i]) !== -1) return true;
    }
    return false;
}

ServerEvents.recipes(function (event) {
    let scanned = 0;
    const matches = [];

    event.forEachRecipe({}, function (recipe) {
        scanned++;

        const jsonStr = String(recipe.json);

        let hit = false;

        if (stringContainsAny(jsonStr, NEEDLES_EXACT)) {
            hit = true;
        } else if (stringContainsAny(jsonStr, NEEDLES_SUBSTR)) {
            // reduce noise a bit: only accept if recipe looks like it has ingredients
            if (jsonStr.indexOf('"ingredient"') !== -1 ||
                jsonStr.indexOf('"ingredients"') !== -1 ||
                jsonStr.indexOf('"key"') !== -1 ||
                jsonStr.indexOf('"tag"') !== -1 ||
                jsonStr.indexOf('"item"') !== -1) {
                hit = true;
                }
        }

        if (hit) {
            const id = String(recipe.getId());
            const type = String(recipe.getType());

            console.info('[COPPER-RECIPE] ' + id + '  (type=' + type + ')');

            matches.push({
                id: id,
                type: type,
                json: jsonStr
            });
        }
    });

    // If subfolders don't auto-create in your setup, change to 'kubejs/copper_recipes.json'
    JsonIO.write('kubejs/recipe_dumps/copper_recipes.json', {
        scanned: scanned,
        matched: matches.length,
        matches: matches
    });

    console.info('[COPPER-RECIPE] Done. Scanned=' + scanned + ', Matched=' + matches.length);
    console.info('[COPPER-RECIPE] Wrote: kubejs/recipe_dumps/copper_recipes.json');
});
