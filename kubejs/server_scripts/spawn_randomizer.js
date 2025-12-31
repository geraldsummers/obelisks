// kubejs/server_scripts/random_respawn_pool.js
// Forge 1.20.1 + KubeJS 6 (Rhino-safe)
//
// Bedless respawns get redirected to a safe surface on whitelisted blocks.
// Center is the ORIGINAL world spawn as of the first time this script ever runs.
// Spawns are random within an annulus [MIN_DISTANCE, MAX_DISTANCE] and de-clustered over time
// via stratified sampling across coarse cells (usage-balanced).
//
// Assumption: your annulus/ring is PRE-GENERATED, but it may be UNLOADED at runtime.
// This script will temporarily /forceload chunks (load-from-disk) under a strict budget,
// and uses a heightmap + small window validation instead of scanning 319..-64.

var DIM = 'minecraft:overworld'

// Annulus around frozen world spawn (blocks)
var MIN_DISTANCE = 200
var MAX_DISTANCE = 800

// De-clustering controls
// Bigger cell = more even spread, less “pure random”. Smaller cell = more random, more clustering.
var CELL_SIZE = 128
var CELL_SAMPLE = 16 // sample this many random cells, pick least-used

// Pool sizing and background work limits
var POOL_TARGET = 200

// Pool fill cadence
var FILL_EVERY_N_TICKS = 20        // 20 = once per second
var QUEUE_PER_FILL = 1             // how many new chunk-load requests to queue each fill tick
var PROCESS_PER_TICK = 2           // how many pending chunk-load requests to resolve each tick

// Chunk load throttling (temporary /forceload add then remove)
var CHUNK_FORCELOADS_PER_SECOND = 2
var PENDING_WAIT_TICKS = 5         // wait after /forceload add before probing
var PENDING_MAX_RETRIES = 3         // per pending request

// Persist cell usage across restarts
var PERSIST_CELL_COUNTS = true
var SAVE_COUNTS_EVERY_TICKS = 200  // write JSON to persistentData every 10s if dirty

// “Sane” ground whitelist (Rhino-safe "set": object map)
var SAFE_GROUND = {
    'minecraft:grass_block': true,
    'minecraft:dirt': true,
    'minecraft:coarse_dirt': true,
    'minecraft:podzol': true,
    'minecraft:rooted_dirt': true,
    'minecraft:stone': true,
    'minecraft:deepslate': true
}

var AIR = {
    'minecraft:air': true,
    'minecraft:cave_air': true,
    'minecraft:void_air': true
}

var BAD_FLUIDS = {
    'minecraft:water': true,
    'minecraft:lava': true
}

// Fallback scan bounds (1.20.x default)
var TOP_Y = 319
var BOTTOM_Y = -64

// Heightmap class (optional, but expected in 1.20.1)
var HeightmapTypes = null
try {
    HeightmapTypes = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types')
} catch (e) {
    HeightmapTypes = null
}

// Script-scope state (avoid global.* reads which can return null and crash Rhino)
var rrPool = []
var rrValidCells = null

var rrCountsCache = null
var rrCountsDirty = false

// Pending pool fill requests: { x, z, readyTick, tries }
var rrPending = []

var rrChunkBudget = 0

function has(map, key) {
    return map != null && map[key] === true
}

function randInt(min, maxInclusive) {
    return min + Math.floor(Math.random() * (maxInclusive - min + 1))
}

function playerSelector(player) {
    var name = String(player.username).replace(/"/g, '\\"')
    return '@a[name="' + name + '"]'
}

function readWorldSpawnXZ(level) {
    var pos = null

    if (level && typeof level.getSharedSpawnPos === 'function') {
        pos = level.getSharedSpawnPos()
    } else if (level && typeof level.getSpawnPos === 'function') {
        pos = level.getSpawnPos()
    } else if (level && level.sharedSpawnPos) {
        pos = level.sharedSpawnPos
    } else if (level && level.spawnPos) {
        pos = level.spawnPos
    }

    if (!pos) return { x: 0, z: 0 }

    var x = (typeof pos.getX === 'function') ? pos.getX() : pos.x
    var z = (typeof pos.getZ === 'function') ? pos.getZ() : pos.z

    return { x: (Number(x) | 0), z: (Number(z) | 0) }
}

function getFrozenWorldSpawnXZ(server) {
    var data = server.persistentData
    if (!data.getBoolean('rr_center_locked')) {
        var level = server.overworld()
        var s = readWorldSpawnXZ(level)
        data.putInt('rr_center_x', s.x)
        data.putInt('rr_center_z', s.z)
        data.putBoolean('rr_center_locked', true)
    }
    return { x: data.getInt('rr_center_x'), z: data.getInt('rr_center_z') }
}

function playerHasPersonalSpawn(player) {
    var nbt = (player.fullNBT != null) ? player.fullNBT : player.nbt
    if (!nbt) return false
        return nbt.SpawnX != null || nbt.SpawnY != null || nbt.SpawnZ != null || nbt.SpawnDimension != null
}

function isSafeSpot(level, x, y, z) {
    var feet = level.getBlock(x, y, z).id
    var head = level.getBlock(x, y + 1, z).id
    if (!has(AIR, feet) || !has(AIR, head)) return false

        var below = level.getBlock(x, y - 1, z).id
        if (!has(SAFE_GROUND, below)) return false

            // reject if any adjacent fluid at feet level
            for (var dx = -1; dx <= 1; dx++) {
                for (var dz = -1; dz <= 1; dz++) {
                    var near = level.getBlock(x + dx, y, z + dz).id
                    if (has(BAD_FLUIDS, near)) return false
                }
            }

            return true
}

// Heightmap-assisted search with tight validation window.
// Works even if heightmap is off-by-one because we scan around it.
function findSafeY(level, x, z) {
    var y0 = null

    if (HeightmapTypes && level && typeof level.getHeight === 'function') {
        try {
            y0 = level.getHeight(HeightmapTypes.MOTION_BLOCKING_NO_LEAVES, x, z)
        } catch (e) {
            y0 = null
        }
    }

    // If heightmap isn't available, do a reduced fallback scan (still expensive).
    if (y0 == null) {
        for (var y = TOP_Y; y >= BOTTOM_Y; y--) {
            if (isSafeSpot(level, x, y, z)) return y
        }
        return null
    }

    y0 = Number(y0) | 0

    // Fast reject if the reported top is fluid
    try {
        var topId = level.getBlock(x, y0, z).id
        if (has(BAD_FLUIDS, topId)) return null
    } catch (e2) {
        // ignore
    }

    // Validate a small window around y0
    var start = Math.min(TOP_Y, y0 + 3)
    var end = Math.max(BOTTOM_Y, y0 - 12)

    for (var y2 = start; y2 >= end; y2--) {
        if (isSafeSpot(level, x, y2, z)) return y2
    }

    return null
}

// Rectangle distance helpers for cell-annulus intersection test (relative coords)
function rectMinDist2(x0, x1, z0, z1) {
    var dx = (x0 <= 0 && 0 <= x1) ? 0 : Math.min(Math.abs(x0), Math.abs(x1))
    var dz = (z0 <= 0 && 0 <= z1) ? 0 : Math.min(Math.abs(z0), Math.abs(z1))
    return dx * dx + dz * dz
}
function rectMaxDist2(x0, x1, z0, z1) {
    var dx = Math.max(Math.abs(x0), Math.abs(x1))
    var dz = Math.max(Math.abs(z0), Math.abs(z1))
    return dx * dx + dz * dz
}

function buildValidCells() {
    var cells = []
    var min2 = MIN_DISTANCE * MIN_DISTANCE
    var max2 = MAX_DISTANCE * MAX_DISTANCE

    var minI = Math.floor(-MAX_DISTANCE / CELL_SIZE)
    var maxI = Math.floor(MAX_DISTANCE / CELL_SIZE)

    for (var ix = minI; ix <= maxI; ix++) {
        for (var iz = minI; iz <= maxI; iz++) {
            var x0 = ix * CELL_SIZE
            var z0 = iz * CELL_SIZE
            var x1 = x0 + (CELL_SIZE - 1)
            var z1 = z0 + (CELL_SIZE - 1)

            var mn = rectMinDist2(x0, x1, z0, z1)
            var mx = rectMaxDist2(x0, x1, z0, z1)

            if (mn <= max2 && mx >= min2) {
                var key = String(ix) + ',' + String(iz)
                cells.push({ ix: ix, iz: iz, x0: x0, x1: x1, z0: z0, z1: z1, key: key })
            }
        }
    }

    return cells
}

function loadCounts(server) {
    if (rrCountsCache != null) return rrCountsCache
        rrCountsCache = {}

        if (!PERSIST_CELL_COUNTS) return rrCountsCache

            var s = server.persistentData.getString('rr_cell_counts')
            if (!s) return rrCountsCache

                try {
                    var obj = JSON.parse(String(s))
                    if (obj && typeof obj === 'object') rrCountsCache = obj
                } catch (e) {
                    // ignore
                }

                return rrCountsCache
}

function saveCounts(server) {
    if (!PERSIST_CELL_COUNTS) return
        if (!rrCountsDirty) return
            rrCountsDirty = false

            try {
                server.persistentData.putString('rr_cell_counts', JSON.stringify(rrCountsCache || {}))
            } catch (e) {
                // ignore
            }
}

function getCount(counts, key) {
    if (!counts) return 0
        if (Object.prototype.hasOwnProperty.call(counts, key)) return Number(counts[key]) | 0
            return 0
}

function chooseLeastUsedCell(server) {
    var cells = rrValidCells
    var counts = loadCounts(server)

    var best = []
    var bestCount = 2147483647

    for (var i = 0; i < CELL_SAMPLE; i++) {
        var cell = cells[randInt(0, cells.length - 1)]
        var c = getCount(counts, cell.key)

        if (c < bestCount) {
            bestCount = c
            best = [cell]
        } else if (c === bestCount) {
            best.push(cell)
        }
    }

    return (best.length === 1) ? best[0] : best[randInt(0, best.length - 1)]
}

function markCellUsed(server, cellKey) {
    var counts = loadCounts(server)
    var cur = getCount(counts, cellKey)
    counts[cellKey] = cur + 1
    rrCountsDirty = true
}

// Random integer X/Z uniformly from annulus but guided by cell balancing.
// Rejection inside chosen cell to enforce true annulus bounds.
function pickXZBalanced(server) {
    var cell = chooseLeastUsedCell(server)
    var min2 = MIN_DISTANCE * MIN_DISTANCE
    var max2 = MAX_DISTANCE * MAX_DISTANCE

    for (var tries = 0; tries < 80; tries++) {
        var dx = randInt(cell.x0, cell.x1)
        var dz = randInt(cell.z0, cell.z1)
        var d2 = dx * dx + dz * dz
        if (d2 >= min2 && d2 <= max2) {
            markCellUsed(server, cell.key)
            return { dx: dx, dz: dz }
        }
    }

    // Fallback: pure annulus rejection (rare)
    while (true) {
        var dx2 = randInt(-MAX_DISTANCE, MAX_DISTANCE)
        var dz2 = randInt(-MAX_DISTANCE, MAX_DISTANCE)
        var d22 = dx2 * dx2 + dz2 * dz2
        if (d22 >= min2 && d22 <= max2) return { dx: dx2, dz: dz2 }
    }
}

function makeSpot(level, x, z) {
    var y = findSafeY(level, x, z)
    if (y == null) return null
        return { dim: DIM, x: x + 0.5, y: y, z: z + 0.5 }
}

function poolPopOrNull() {
    return (rrPool.length > 0) ? rrPool.pop() : null
}

function storeNext(player, spot) {
    player.persistentData.putString('rr_dim', spot.dim)
    player.persistentData.putDouble('rr_x', spot.x)
    player.persistentData.putDouble('rr_y', spot.y)
    player.persistentData.putDouble('rr_z', spot.z)
    player.persistentData.putBoolean('rr_has', true)
}

function loadNext(player) {
    if (!player.persistentData.getBoolean('rr_has')) return null
        return {
            dim: player.persistentData.getString('rr_dim'),
            x: player.persistentData.getDouble('rr_x'),
            y: player.persistentData.getDouble('rr_y'),
            z: player.persistentData.getDouble('rr_z')
        }
}

function assignNextIfMissing(server, player) {
    if (player.persistentData.getBoolean('rr_has')) return

        var spot = poolPopOrNull()
        if (spot) {
            storeNext(player, spot)
            return
        }
}

// ---- Chunk forceload pipeline (pool filler) ----

function queueOnePoolCandidate(server) {
    if (!rrValidCells || rrChunkBudget <= 0) return false
        if (rrPool.length + rrPending.length >= POOL_TARGET) return false

            var c = getFrozenWorldSpawnXZ(server)
            var off = pickXZBalanced(server)

            var x = (c.x + off.dx) | 0
            var z = (c.z + off.dz) | 0

            // Temporarily forceload this chunk (block coords are fine)
            server.runCommandSilent('execute in ' + DIM + ' run forceload add ' + x + ' ' + z)

            rrPending.push({
                x: x,
                z: z,
                readyTick: (server.tickCount + PENDING_WAIT_TICKS) | 0,
                           tries: 0
            })

            rrChunkBudget--
            return true
}

function processPending(server) {
    if (rrPending.length === 0) return
        var level = server.overworld()

        var processed = 0
        for (var i = rrPending.length - 1; i >= 0 && processed < PROCESS_PER_TICK; i--) {
            var p = rrPending[i]
            if (server.tickCount < p.readyTick) continue

                var spot = null
                try {
                    spot = makeSpot(level, p.x, p.z)
                } catch (e) {
                    spot = null
                }

                if (spot) {
                    rrPool.push(spot)
                    server.runCommandSilent('execute in ' + DIM + ' run forceload remove ' + p.x + ' ' + p.z)
                    rrPending.splice(i, 1)
                    processed++
                    continue
                }

                p.tries++
                if (p.tries >= PENDING_MAX_RETRIES) {
                    server.runCommandSilent('execute in ' + DIM + ' run forceload remove ' + p.x + ' ' + p.z)
                    rrPending.splice(i, 1)
                    processed++
                } else {
                    p.readyTick = (server.tickCount + PENDING_WAIT_TICKS) | 0
                }
        }
}

// ---- Direct async teleport on respawn (if pool is empty) ----

function beginAsyncCandidate(server, triesLeft, onDone) {
    if (!rrValidCells) {
        onDone(null)
        return
    }

    var c = getFrozenWorldSpawnXZ(server)
    var off = pickXZBalanced(server)
    var x = (c.x + off.dx) | 0
    var z = (c.z + off.dz) | 0

    server.runCommandSilent('execute in ' + DIM + ' run forceload add ' + x + ' ' + z)

    server.scheduleInTicks(PENDING_WAIT_TICKS, server, function (ctx) {
        var srv = ctx.data
        var level = srv.overworld()

        var spot = null
        try {
            spot = makeSpot(level, x, z)
        } catch (e) {
            spot = null
        }

        srv.runCommandSilent('execute in ' + DIM + ' run forceload remove ' + x + ' ' + z)

        if (spot) {
            onDone(spot)
            return
        }

        if (triesLeft > 1) {
            beginAsyncCandidate(srv, triesLeft - 1, onDone)
        } else {
            onDone(null)
        }
    })
}

function teleportPlayerToSpot(server, player, spot) {
    var sel = playerSelector(player)
    server.runCommandSilent(
        'execute as ' + sel + ' in ' + spot.dim + ' run tp @s ' + spot.x + ' ' + spot.y + ' ' + spot.z
    )
}

// ---- Events ----

ServerEvents.loaded(function (event) {
    var server = event.server
    getFrozenWorldSpawnXZ(server)
    rrValidCells = buildValidCells()
    loadCounts(server)
})

PlayerEvents.loggedIn(function (event) {
    assignNextIfMissing(event.server, event.player)
})

PlayerEvents.respawned(function (event) {
    var player = event.player
    var server = event.server

    if (playerHasPersonalSpawn(player)) return

        // If we already have a precomputed spot, use it next tick.
        assignNextIfMissing(server, player)

        server.scheduleInTicks(1, server, function (cb) {
            var srv = cb.data

            // Avoid overlapping in-flight direct teleports
            if (player.persistentData.getBoolean('rr_inflight')) return

                var spot = loadNext(player)
                if (spot) {
                    teleportPlayerToSpot(srv, player, spot)
                    player.persistentData.putBoolean('rr_has', false)
                    assignNextIfMissing(srv, player)
                    return
                }

                // Pool empty: do a slow but reliable async candidate and teleport when ready.
                player.persistentData.putBoolean('rr_inflight', true)

                beginAsyncCandidate(srv, 4, function (res) {
                    try {
                        if (res) teleportPlayerToSpot(srv, player, res)
                    } catch (e) {
                        // ignore
                    } finally {
                        player.persistentData.putBoolean('rr_inflight', false)
                    }
                })
        })
})

ServerEvents.tick(function (event) {
    var server = event.server
    if (!rrValidCells) return

        // Refill chunk-forceload budget each second
        if (server.tickCount % 20 === 0) rrChunkBudget = CHUNK_FORCELOADS_PER_SECOND

            // Resolve pending chunk loads into pool entries
            processPending(server)

            // Persist cell counts occasionally
            if (PERSIST_CELL_COUNTS && server.tickCount % SAVE_COUNTS_EVERY_TICKS === 0) {
                saveCounts(server)
            }

            // Queue new pool candidates on cadence
            if (server.tickCount % FILL_EVERY_N_TICKS !== 0) return
                if (rrPool.length + rrPending.length >= POOL_TARGET) return

                    var queued = 0
                    while (queued < QUEUE_PER_FILL) {
                        if (!queueOnePoolCandidate(server)) break
                            queued++
                    }
})
