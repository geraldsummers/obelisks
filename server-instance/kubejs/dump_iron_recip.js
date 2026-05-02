// KubeJS 6+ (Forge 1.20.1) - Rhino safe, no Java.loadClass
// Robust approach: scan recipe.json as STRING (survives class filters / Java-backed maps)

const NEEDLES_EXACT = [
    '"minecraft:iron_ingot"',   // item usage
'minecraft:iron_ingot',     // fallback if formatting differs
'forge:ingots/iron',
'c:iron_ingots'
];

// broaden to catch e.g. mytags:ingots/iron, etc.
const NEEDLES_SUBSTR = [
    'ingots/iron',
'iron_ingots',
'iron/ingots'
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

        // recipe.json is a JsonElement-like thing; String(...) is safe
        const jsonStr = String(recipe.json);

        // Must contain either exact hits or one of the substrings
        let hit = false;

        if (stringContainsAny(jsonStr, NEEDLES_EXACT)) {
            hit = true;
        } else if (stringContainsAny(jsonStr, NEEDLES_SUBSTR)) {
            // Optional: reduce some noise by requiring it's likely an ingredient/tag field
            // (still loose enough to work on modded schemas)
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

            console.info('[IRON-RECIPE] ' + id + '  (type=' + type + ')');

            // Store the raw JSON string; easiest to grep + reliable under filters
            matches.push({
                id: id,
                type: type,
                json: jsonStr
            });
        }
    });

    // If subfolders don't auto-create in your setup, change to 'kubejs/iron_recipes.json'
    JsonIO.write('kubejs/recipe_dumps/iron_recipes.json', {
        scanned: scanned,
        matched: matches.length,
        matches: matches
    });

    console.info('[IRON-RECIPE] Done. Scanned=' + scanned + ', Matched=' + matches.length);
    console.info('[IRON-RECIPE] Wrote: kubejs/recipe_dumps/iron_recipes.json');
});
