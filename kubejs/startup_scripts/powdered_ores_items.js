// kubejs/startup_scripts/powdered_ores_items.js
;(function () {
    var DEBUG = false

    // Earlier = higher priority. Align this with your AU priorities manually.
    var MOD_PRIORITY = ['minecraft', 'create']

    var STRIP_PREFIXES = [
        'deepslate_', 'nether_', 'end_', 'grimstone_', 'blackstone_', 'stone_',
        'poor_', 'rich_', 'dense_', 'small_', 'large_'
    ]

    // caches for tinting and tag-picks
    if (!global.__POWDER_TINT_CACHE) global.__POWDER_TINT_CACHE = {}
    if (!global.__POWDER_PICK_CACHE) global.__POWDER_PICK_CACHE = {}

    function uniqPush(arr, seen, v) {
        if (!seen[v]) { seen[v] = true; arr.push(v) }
    }

    function stripPrefixes(path) {
        var p = '' + path
        var changed = true
        while (changed) {
            changed = false
            var i
            for (i = 0; i < STRIP_PREFIXES.length; i++) {
                var pref = STRIP_PREFIXES[i]
                if (p.indexOf(pref) === 0) {
                    p = p.substring(pref.length)
                    changed = true
                    break
                }
            }
        }
        return p
    }

    function extractMaterialFromId(id) {
        var parts = ('' + id).split(':')
        if (parts.length !== 2) return null
            var path = stripPrefixes(parts[1])

            // A: <mat>_ore
            if (path.length > 4 && path.lastIndexOf('_ore') === path.length - 4) {
                return path.substring(0, path.length - 4)
            }
            // B: ore_<mat>
            if (path.indexOf('ore_') === 0 && path.length > 4) {
                return path.substring(4)
            }
            // C: <mat>_ore_<suffix>
            var idx = path.indexOf('_ore_')
            if (idx > 1) {
                return path.substring(0, idx)
            }
            // D: raw_<mat>
            if (path.indexOf('raw_') === 0 && path.length > 4) {
                return path.substring(4)
            }

            return null
    }

    function tagHasAny(tagId) {
        var ids = Ingredient.of('#' + tagId).itemIds
        return ids && ids.length > 0
    }

    function pickFromTag(tagId) {
        var key = 'tag:' + tagId
        if (global.__POWDER_PICK_CACHE.hasOwnProperty(key)) return global.__POWDER_PICK_CACHE[key]

            var ids = Ingredient.of('#' + tagId).itemIds
            if (!ids || ids.length === 0) {
                global.__POWDER_PICK_CACHE[key] = null
                return null
            }

            var i, j, id, ns
            for (i = 0; i < MOD_PRIORITY.length; i++) {
                var mod = MOD_PRIORITY[i]
                for (j = 0; j < ids.length; j++) {
                    id = '' + ids[j]
                    ns = id.split(':')[0]
                    if (ns === mod) {
                        global.__POWDER_PICK_CACHE[key] = id
                        return id
                    }
                }
            }

            global.__POWDER_PICK_CACHE[key] = '' + ids[0]
            return '' + ids[0]
    }

    function discoverMaterials() {
        var candidates = []
        var seen = {}

        var ores = Ingredient.of('#forge:ores').itemIds || []
        var raws = Ingredient.of('#forge:raw_materials').itemIds || []
        var all = Ingredient.all.itemIds || []

        function scan(list, liteFilter) {
            var i
            for (i = 0; i < list.length; i++) {
                var id = '' + list[i]
                if (liteFilter) {
                    if (id.indexOf('ore') === -1 && id.indexOf('raw_') === -1) continue
                }

                var mat = extractMaterialFromId(id)
                if (!mat) continue
                    mat = ('' + mat).toLowerCase()

                    // must have ingot tag to be treated as “metal-like”
                    if (!tagHasAny('forge:ingots/' + mat)) continue
                        // must have an ore or raw input tag
                        if (!tagHasAny('forge:ores/' + mat) && !tagHasAny('forge:raw_materials/' + mat)) continue

                            uniqPush(candidates, seen, mat)
            }
        }

        scan(ores, false)
        scan(raws, false)
        scan(all, true)

        candidates.sort()
        return candidates
    }

    // ---- Tinting (client-only at render time; safe fallback on server) ----

    function guessTexturePaths(itemId) {
        var parts = ('' + itemId).split(':')
        if (parts.length !== 2) return []
            var ns = parts[0]
            var path = parts[1]
            var base = path.replace(/.*_ingot$/, '')

            return [
                [ns, 'textures/item/' + path + '.png'],
                [ns, 'textures/item/' + base + '_ingot.png'],
                [ns, 'textures/item/ingots/' + path + '.png'],
                [ns, 'textures/item/ingots/' + base + '.png'],
                [ns, 'textures/item/materials/' + path + '.png'],
                [ns, 'textures/item/materials/' + base + '.png']
            ]
    }

    function avgColorFromTexture(rl) {
        try {
            var Minecraft = Java.loadClass('net.minecraft.client.Minecraft')

            var NativeImage = null
            try { NativeImage = Java.loadClass('com.mojang.blaze3d.platform.NativeImage') } catch (e0) {}
            if (!NativeImage) {
                try { NativeImage = Java.loadClass('net.minecraft.client.renderer.texture.NativeImage') } catch (e1) {}
            }
            if (!NativeImage) return -1

                var mc = Minecraft.getInstance()
                var rm = mc.getResourceManager()

                var opt = rm.getResource(rl)
                if (!opt || !opt.isPresent || !opt.isPresent()) return -1

                    var res = opt.get()
                    var is = null
                    try {
                        // Resource has open() in 1.20.x
                        is = res.open()
                    } catch (e2) {
                        try { is = res.getInputStream() } catch (e3) { is = null }
                    }
                    if (!is) return -1

                        var img = null
                        try {
                            img = NativeImage.read(is)
                        } finally {
                            try { is.close() } catch (e4) {}
                        }
                        if (!img) return -1

                            var w = img.getWidth()
                            var h = img.getHeight()
                            var rSum = 0, gSum = 0, bSum = 0, n = 0
                            var x, y

                            for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
                                // usually ABGR packed
                                var c = img.getPixelRGBA(x, y)
                                var a = (c >>> 24) & 255
                                if (a < 16) continue
                                    var b = (c >>> 16) & 255
                                    var g = (c >>> 8) & 255
                                    var r = (c >>> 0) & 255
                                    rSum += r; gSum += g; bSum += b; n++
                            }

                            try { img.close() } catch (e5) {}

                            if (n <= 0) return -1
                                return (((rSum / n) | 0) << 16) | (((gSum / n) | 0) << 8) | ((bSum / n) | 0)
        } catch (e) {
            return -1
        }
    }

    function tintForMaterial(mat) {
        var m = ('' + mat).toLowerCase()
        if (global.__POWDER_TINT_CACHE.hasOwnProperty(m)) return global.__POWDER_TINT_CACHE[m]

            try {
                var ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
                var ingot = pickFromTag('forge:ingots/' + m)
                if (!ingot) {
                    global.__POWDER_TINT_CACHE[m] = -1
                    return -1
                }

                var guesses = guessTexturePaths(ingot)
                var i
                for (i = 0; i < guesses.length; i++) {
                    var rl = new ResourceLocation(guesses[i][0], guesses[i][1])
                    var rgb = avgColorFromTexture(rl)
                    if (rgb !== -1) {
                        global.__POWDER_TINT_CACHE[m] = rgb
                        return rgb
                    }
                }

                global.__POWDER_TINT_CACHE[m] = -1
                return -1
            } catch (e2) {
                global.__POWDER_TINT_CACHE[m] = -1
                return -1
            }
    }

    function titleCase(s) {
        var parts = ('' + s).split('_')
        var out = []
        var i
        for (i = 0; i < parts.length; i++) {
            if (parts[i].length > 0) out.push(parts[i].charAt(0).toUpperCase() + parts[i].slice(1))
        }
        return out.join(' ')
    }

    // Discover at startup
    var MATERIALS = discoverMaterials()
    global.POWDERED_ORES_MATERIALS = MATERIALS

    // Nugget map: use forge nugget if present, else create kubejs:nugget_<mat>
    var nuggetMap = {}
    var i
    for (i = 0; i < MATERIALS.length; i++) {
        var m = MATERIALS[i]
        var nug = pickFromTag('forge:nuggets/' + m)
        nuggetMap[m] = nug ? nug : ('kubejs:nugget_' + m)
        if (DEBUG && !nug) console.log('[powdered_ores] no nugget tag for ' + m + ' using ' + nuggetMap[m])
    }
    global.POWDERED_ORES_NUGGET_MAP = nuggetMap

    console.log('[powdered_ores] discovered materials: ' + MATERIALS.length)

    StartupEvents.registry('item', function (event) {
        // IMPORTANT: this must exist in only ONE startup script.
        event.create('ore_hammer')
        .displayName('Ore Hammer')
        .maxDamage(1024)
        .unstackable()
        .textureJson({ layer0: 'kubejs:item/ore_hammer' })

        // Create missing nuggets (if needed)
        for (i = 0; i < MATERIALS.length; i++) {
            var mat = MATERIALS[i]
            var nugItem = nuggetMap[mat]
            if (nugItem.indexOf('kubejs:nugget_') === 0) {
                event.create('nugget_' + mat)
                .displayName(titleCase(mat) + ' Nugget')
                .textureJson({ layer0: 'minecraft:item/gold_nugget' })
            }
        }

        // Powder items with tint
        for (i = 0; i < MATERIALS.length; i++) {
            ;(function (mat) {
                event.create('powdered_' + mat)
                .displayName(titleCase(mat) + ' Powdered Ore')
                .textureJson({ layer0: 'minecraft:item/gunpowder' })
                .color(function (stack, tintIndex) {
                    if (tintIndex !== 0) return -1
                        return tintForMaterial(mat)
                })
            })(MATERIALS[i])
        }
    })
})()
