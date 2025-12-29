// kubejs/server_scripts/random_respawn_pool.js
// Forge 1.20.1 + KubeJS 6
//
// Bedless respawns get redirected to a safe surface on whitelisted blocks.
// Also redirects INITIAL SPAWN for new players (or anyone who joins near worldspawn and has no bed).
// Center is the ORIGINAL world spawn as of the first time this script ever runs.
// Spawns are random within an annulus [MIN_DISTANCE, MAX_DISTANCE] and de-clustered over time
// via usage-balanced coarse cells.

const DIM = 'minecraft:overworld'

// Annulus around frozen world spawn (blocks)
const MIN_DISTANCE = 200
const MAX_DISTANCE = 800

// Initial-spawn redirect guard.
// To avoid teleporting established players on existing servers, this only triggers if the player logs in
// within this radius of frozen worldspawn AND has no personal spawnpoint AND has not been redirected before.
const INITIAL_SPAWN_REDIRECT_RADIUS = 96

// De-clustering controls
const CELL_SIZE = 128
const CELL_SAMPLE = 16

// Pool sizing and background work limits
const POOL_TARGET = 200
const ATTEMPTS_PER_FILL = 2
const FILL_EVERY_N_TICKS = 5

// Persist cell usage across restarts
const PERSIST_CELL_COUNTS = true

// “Sane” ground whitelist
const SAFE_GROUND = new Set([
    'minecraft:grass_block',
    'minecraft:dirt',
    'minecraft:coarse_dirt',
    'minecraft:podzol',
    'minecraft:rooted_dirt',
    'minecraft:stone',
    'minecraft:deepslate'
])

const AIR = new Set(['minecraft:air', 'minecraft:cave_air', 'minecraft:void_air'])
const BAD_FLUIDS = new Set(['minecraft:water', 'minecraft:lava'])

// Overworld-ish scan bounds (1.20.x default)
const TOP_Y = 319
const BOTTOM_Y = -64

global.__rr_pool = global.__rr_pool || []
global.__rr_validCells = global.__rr_validCells || null
global.__rr_counts = global.__rr_counts || null

function randInt(min, maxInclusive) {
    return min + Math.floor(Math.random() * (maxInclusive - min + 1))
}

function playerSelector(player) {
    const name = String(player.username).replace(/"/g, '\\"')
    return `@a[name="${name}"]`
}

function readWorldSpawnXZ(level) {
    let pos = null
    if (level && typeof level.getSharedSpawnPos === 'function') pos = level.getSharedSpawnPos()
        else if (level && typeof level.getSpawnPos === 'function') pos = level.getSpawnPos()
            else if (level && level.sharedSpawnPos) pos = level.sharedSpawnPos
                else if (level && level.spawnPos) pos = level.spawnPos

                    if (!pos) return { x: 0, z: 0 }

                    const x = (typeof pos.getX === 'function') ? pos.getX() : pos.x
                    const z = (typeof pos.getZ === 'function') ? pos.getZ() : pos.z
                    return { x: Number(x) | 0, z: Number(z) | 0 }
}

function getFrozenWorldSpawnXZ(server) {
    const data = server.persistentData
    if (!data.getBoolean('rr_center_locked')) {
        const level = server.overworld()
        const s = readWorldSpawnXZ(level)
        data.putInt('rr_center_x', s.x)
        data.putInt('rr_center_z', s.z)
        data.putBoolean('rr_center_locked', true)
    }
    return { x: data.getInt('rr_center_x'), z: data.getInt('rr_center_z') }
}

function playerHasPersonalSpawn(player) {
    const nbt = player.fullNBT ?? player.nbt
    if (!nbt) return false
        return nbt.SpawnX != null || nbt.SpawnY != null || nbt.SpawnZ != null || nbt.SpawnDimension != null
}

function isSafeSpot(level, x, y, z) {
    const feet = level.getBlock(x, y, z).id
    const head = level.getBlock(x, y + 1, z).id
    if (!AIR.has(feet) || !AIR.has(head)) return false

        const below = level.getBlock(x, y - 1, z).id
        if (!SAFE_GROUND.has(below)) return false

            if (BAD_FLUIDS.has(feet)) return false

                // adjacent fluid reject
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dz = -1; dz <= 1; dz++) {
                        const near = level.getBlock(x + dx, y, z + dz).id
                        if (BAD_FLUIDS.has(near)) return false
                    }
                }

                return true
}

function findSafeY(level, x, z) {
    for (let y = TOP_Y; y >= BOTTOM_Y; y--) {
        if (isSafeSpot(level, x, y, z)) return y
    }
    return null
}

// Rectangle distance helpers for cell-annulus intersection test (relative coords)
function rectMinDist2(x0, x1, z0, z1) {
    const dx = (x0 <= 0 && 0 <= x1) ? 0 : Math.min(Math.abs(x0), Math.abs(x1))
    const dz = (z0 <= 0 && 0 <= z1) ? 0 : Math.min(Math.abs(z0), Math.abs(z1))
    return dx * dx + dz * dz
}
function rectMaxDist2(x0, x1, z0, z1) {
    const dx = Math.max(Math.abs(x0), Math.abs(x1))
    const dz = Math.max(Math.abs(z0), Math.abs(z1))
    return dx * dx + dz * dz
}

function buildValidCells() {
    const cells = []
    const min2 = MIN_DISTANCE * MIN_DISTANCE
    const max2 = MAX_DISTANCE * MAX_DISTANCE

    const minI = Math.floor(-MAX_DISTANCE / CELL_SIZE)
    const maxI = Math.floor(MAX_DISTANCE / CELL_SIZE)

    for (let ix = minI; ix <= maxI; ix++) {
        for (let iz = minI; iz <= maxI; iz++) {
            const x0 = ix * CELL_SIZE
            const z0 = iz * CELL_SIZE
            const x1 = x0 + (CELL_SIZE - 1)
            const z1 = z0 + (CELL_SIZE - 1)

            const mn = rectMinDist2(x0, x1, z0, z1)
            const mx = rectMaxDist2(x0, x1, z0, z1)

            if (mn <= max2 && mx >= min2) {
                const key = `${ix},${iz}`
                cells.push({ ix, iz, x0, x1, z0, z1, key })
            }
        }
    }
    return cells
}

function loadCounts(server) {
    if (global.__rr_counts) return global.__rr_counts
        global.__rr_counts = {}

        if (!PERSIST_CELL_COUNTS) return global.__rr_counts

            const s = server.persistentData.getString('rr_cell_counts')
            if (!s) return global.__rr_counts

                try {
                    const obj = JSON.parse(String(s))
                    if (obj && typeof obj === 'object') global.__rr_counts = obj
                } catch (e) {}

                return global.__rr_counts
}

function saveCounts(server) {
    if (!PERSIST_CELL_COUNTS) return
        try {
            server.persistentData.putString('rr_cell_counts', JSON.stringify(global.__rr_counts || {}))
        } catch (e) {}
}

function chooseLeastUsedCell(server) {
    const cells = global.__rr_validCells
    const counts = loadCounts(server)

    let best = []
    let bestCount = Infinity

    for (let i = 0; i < CELL_SAMPLE; i++) {
        const cell = cells[randInt(0, cells.length - 1)]
        const c = counts[cell.key] == null ? 0 : (Number(counts[cell.key]) | 0)

        if (c < bestCount) {
            bestCount = c
            best = [cell]
        } else if (c === bestCount) {
            best.push(cell)
        }
    }

    return best.length === 1 ? best[0] : best[randInt(0, best.length - 1)]
}

function markCellUsed(server, cellKey) {
    const counts = loadCounts(server)
    counts[cellKey] = (counts[cellKey] == null ? 1 : ((Number(counts[cellKey]) | 0) + 1))
    saveCounts(server)
}

function pickXZBalanced(server) {
    const cell = chooseLeastUsedCell(server)
    const min2 = MIN_DISTANCE * MIN_DISTANCE
    const max2 = MAX_DISTANCE * MAX_DISTANCE

    for (let tries = 0; tries < 80; tries++) {
        const dx = randInt(cell.x0, cell.x1)
        const dz = randInt(cell.z0, cell.z1)
        const d2 = dx * dx + dz * dz
        if (d2 >= min2 && d2 <= max2) {
            markCellUsed(server, cell.key)
            return { dx, dz }
        }
    }

    // Fallback: pure annulus rejection
    while (true) {
        const dx = randInt(-MAX_DISTANCE, MAX_DISTANCE)
        const dz = randInt(-MAX_DISTANCE, MAX_DISTANCE)
        const d2 = dx * dx + dz * dz
        if (d2 >= min2 && d2 <= max2) return { dx, dz }
    }
}

function makeCandidate(server, level) {
    const c = getFrozenWorldSpawnXZ(server)
    const { dx, dz } = pickXZBalanced(server)
    const x = (c.x + dx) | 0
    const z = (c.z + dz) | 0

    const y = findSafeY(level, x, z)
    if (y == null) return null
        return { dim: DIM, x: x + 0.5, y: y, z: z + 0.5 }
}

function poolPopOrNull() {
    return global.__rr_pool.length > 0 ? global.__rr_pool.pop() : null
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

        const spot = poolPopOrNull()
        if (spot) {
            storeNext(player, spot)
            return
        }

        const level = server.overworld()
        for (let i = 0; i < 10; i++) {
            const cand = makeCandidate(server, level)
            if (cand) {
                storeNext(player, cand)
                return
            }
        }
}

function isNearFrozenSpawn(server, player, radius) {
    const c = getFrozenWorldSpawnXZ(server)
    const dx = (player.blockX | 0) - c.x
    const dz = (player.blockZ | 0) - c.z
    return (dx * dx + dz * dz) <= (radius * radius)
}

ServerEvents.loaded(event => {
    const server = event.server
    getFrozenWorldSpawnXZ(server)
    global.__rr_validCells = buildValidCells()
    loadCounts(server)
})

PlayerEvents.loggedIn(event => {
    const server = event.server
    const player = event.player

    // INITIAL SPAWN redirect
    // Only once per player. Only if they have no bed spawn and they appear to have spawned near worldspawn.
    if (!player.persistentData.getBoolean('rr_initial_done')
        && !playerHasPersonalSpawn(player)
        && isNearFrozenSpawn(server, player, INITIAL_SPAWN_REDIRECT_RADIUS)) {

        assignNextIfMissing(server, player)

        // Let vanilla finish login placement, then move them.
        server.scheduleInTicks(5, server, cb => {
            const spot = loadNext(player)
            if (!spot) return

                const sel = playerSelector(player)
                cb.data.runCommandSilent(`execute in ${DIM} run tp ${sel} ${spot.x} ${spot.y} ${spot.z}`)

                player.persistentData.putBoolean('rr_initial_done', true)

                // consume and allocate new "next"
                player.persistentData.putBoolean('rr_has', false)
                assignNextIfMissing(cb.data, player)
        })
        return
        }

        // Normal: ensure they have a queued location for future bedless deaths.
        assignNextIfMissing(server, player)
})

PlayerEvents.respawned(event => {
    const player = event.player
    const server = event.server

    // Only redirect when they do NOT have a personal respawn point.
    if (playerHasPersonalSpawn(player)) return

        assignNextIfMissing(server, player)

        server.scheduleInTicks(1, server, cb => {
            const spot = loadNext(player)
            if (!spot) return

                const sel = playerSelector(player)
                cb.data.runCommandSilent(`execute in ${DIM} run tp ${sel} ${spot.x} ${spot.y} ${spot.z}`)

                player.persistentData.putBoolean('rr_has', false)
                assignNextIfMissing(cb.data, player)
        })
})

ServerEvents.tick(event => {
    const server = event.server
    if (!global.__rr_validCells) return

        if (server.tickCount % FILL_EVERY_N_TICKS !== 0) return
            if (global.__rr_pool.length >= POOL_TARGET) return

                const level = server.overworld()

                let tries = 0
                while (global.__rr_pool.length < POOL_TARGET && tries < ATTEMPTS_PER_FILL) {
                    const cand = makeCandidate(server, level)
                    if (cand) global.__rr_pool.push(cand)
                        tries++
                }
})
