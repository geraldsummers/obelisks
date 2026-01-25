// kubejs/server_scripts/respawn_hubs.js
// Forge 1.20.1 + KubeJS 6 (Rhino-safe ES5)
//
// Manual one-off builder, strict surface and open-sky rules, randomized per-hub search.
// - Nothing happens until /kubejs custom_command rrhubs_enable or rrhubs_rebuild
// - enable/rebuild locks center to CURRENT world spawn X/Z
// - Valid hub requires:
//   - feet + head are exactly air/cave_air/void_air
//   - ground is solid and not fluid
//   - no nearby water/lava at feet level in 3x3
//   - OPEN SKY: every block above head to TOP_Y is air/cave_air/void_air
// - MAX_DISTANCE halved to 400
// - Parallel validation (no throttling), but still async (forceload + schedule)
// - Randomization:
//   - Each slot has its own RNG stream and step size
//   - On failure it "walks" around the ring so it does not keep hitting the same coords
//   - Scheduling order is shuffled continuously so no slot is always first
//
// Custom commands:
//   /kubejs custom_command rrhubs_enable
//   /kubejs custom_command rrhubs_rebuild
//   /kubejs custom_command rrhubs_status
//   /kubejs custom_command rrhubs_cancel
//   /kubejs custom_command rrhubs_disable
//   /kubejs custom_command rrhubs_reset

var DIM = 'minecraft:overworld'
var SCRIPT_VERSION = 'v8_randomized_strict_open_sky_fast'

// Annulus
var MIN_DISTANCE = 0
var MAX_DISTANCE = 300 // halved

// Hubs
var HUB_COUNT = 16
var CANDIDATE_POOL = 8000

// Fast validation
var MAX_INFLIGHT = 64
var FORCELOAD_WAIT_TICKS = 1

// Surface finding
var NEARBY_SEARCH_RADIUS = 12
var Y_SCAN_UP = 3
var Y_SCAN_DOWN = 8

// Retries per hub slot before rerolling its ring-walk params
var MAX_VALIDATE_RETRIES_PER_HUB = 80

// Logging
var LOG_EACH_FAIL = false
var LOG_FAIL_EVERY = 50
var SAVE_COUNTS_EVERY_TICKS = 200

// Safety
var ADJ_FLUID_RADIUS = 1
var BAD_FLUIDS = { 'minecraft:water': true, 'minecraft:lava': true }

var SKY_AIR = {
    'minecraft:air': true,
    'minecraft:cave_air': true,
    'minecraft:void_air': true
}

var SAFE_GROUND = {
    'minecraft:grass_block': true,
    'minecraft:dirt': true,
    'minecraft:coarse_dirt': true,
    'minecraft:podzol': true,
    'minecraft:rooted_dirt': true,
    'minecraft:mycelium': true,
    'minecraft:dirt_path': true,
    'minecraft:farmland': true,
    'minecraft:moss_block': true,
    'minecraft:mud': true,
    'minecraft:packed_mud': true,
    'minecraft:stone': true,
    'minecraft:deepslate': true,
    'minecraft:andesite': true,
    'minecraft:diorite': true,
    'minecraft:granite': true,
    'minecraft:tuff': true,
    'minecraft:calcite': true,
    'minecraft:sand': true,
    'minecraft:red_sand': true,
    'minecraft:gravel': true,
    'minecraft:clay': true,
    'minecraft:snow_block': true,
    'minecraft:ice': true,
    'minecraft:packed_ice': true,
    'minecraft:blue_ice': true,
    'minecraft:terracotta': true
}

var TOP_Y = 319
var BOTTOM_Y = -64

var HeightmapTypes = null
try { HeightmapTypes = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types') } catch (e) { HeightmapTypes = null }

// ---------- persistent keys ----------
var K_ENABLED = 'rrhubs_enabled'
var K_BUILD_REQUESTED = 'rrhubs_build_requested'
var K_NOTIFY_NAME = 'rrhubs_notify_name'

var K_CENTER_LOCKED = 'rrhubs_center_locked'
var K_CENTER_X = 'rrhubs_center_x'
var K_CENTER_Z = 'rrhubs_center_z'

var K_HUBS_FINAL = 'rrhubs_hubs_final'
var K_HUBS_JSON = 'rrhubs_hubs_json'
var K_COUNTS_JSON = 'rrhubs_counts_json'
var K_CFG = 'rrhubs_cfg'

// ---------- runtime ----------
var rrServer = null
var rrCenter = null
var rrHubs = []
var rrCounts = []
var rrCountsDirty = false

var rrBuild = {
    active: false,
    gen: 0,
    plan: [],
    slots: [],
    inflightCount: 0,
    order: null,
    orderPos: 0
}

// ---------- utils ----------
function pd(server) { return server.persistentData }
function has(map, key) { return map != null && map[key] === true }
function randInt(min, maxInclusive) { return min + Math.floor(Math.random() * (maxInclusive - min + 1)) }

function configKey() {
    return String(SCRIPT_VERSION) + ':' +
    String(MIN_DISTANCE) + ':' + String(MAX_DISTANCE) + ':' +
    String(HUB_COUNT) + ':' + String(CANDIDATE_POOL) + ':' +
    String(MAX_INFLIGHT) + ':' + String(FORCELOAD_WAIT_TICKS) + ':' +
    String(NEARBY_SEARCH_RADIUS) + ':' + String(Y_SCAN_UP) + ':' + String(Y_SCAN_DOWN) + ':' +
    String(MAX_VALIDATE_RETRIES_PER_HUB)
}

function isEnabled(server) { try { return pd(server).getBoolean(K_ENABLED) } catch (e) { return false } }
function isBuildRequested(server) { try { return pd(server).getBoolean(K_BUILD_REQUESTED) } catch (e) { return false } }
function isFinal(server) { try { return pd(server).getBoolean(K_HUBS_FINAL) } catch (e) { return false } }

function setEnabled(server, v) { try { pd(server).putBoolean(K_ENABLED, !!v) } catch (e) {} }
function setBuildRequested(server, v) { try { pd(server).putBoolean(K_BUILD_REQUESTED, !!v) } catch (e) {} }
function setFinal(server, v) { try { pd(server).putBoolean(K_HUBS_FINAL, !!v) } catch (e) {} }

function getNotifyName(server) { try { return String(pd(server).getString(K_NOTIFY_NAME) || '') } catch (e) { return '' } }
function setNotifyName(server, name) { try { pd(server).putString(K_NOTIFY_NAME, String(name || '')) } catch (e) {} }

function escSelector(name) { return String(name || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"') }
function escText(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"') }

function tellPlayer(server, username, msg) {
    if (!username) return
        var n = escSelector(username)
        var t = escText('[RRHubs] ' + msg)
        server.runCommandSilent('tellraw @a[name="' + n + '"] {"text":"' + t + '"}')
}

function rrLog(msg) { console.info('[RRHubs] ' + msg) }

function rrBroadcast(server, msg) {
    rrLog(msg)
    var n = getNotifyName(server)
    if (n) tellPlayer(server, n, msg)
}

function noteInvoker(eventOrNull) {
    try { if (eventOrNull && eventOrNull.player) setNotifyName(eventOrNull.server, String(eventOrNull.player.username)) } catch (e) {}
}

function shuffledIndices(n) {
    var a = []
    for (var i = 0; i < n; i++) a.push(i)
        for (var j = n - 1; j > 0; j--) {
            var k = randInt(0, j)
            var tmp = a[j]; a[j] = a[k]; a[k] = tmp
        }
        return a
}

// ---------- deterministic per-slot RNG (LCG) ----------
function lcgNext(s) { return (Math.imul(1664525, s) + 1013904223) | 0 }
function lcgFloat01(s) { // returns {s, f}
s = lcgNext(s)
var u = (s >>> 0) / 4294967296.0
return { s: s, f: u }
}
function lcgInt(s, min, maxInclusive) {
    var t = lcgFloat01(s)
    var v = min + Math.floor(t.f * (maxInclusive - min + 1))
    return { s: t.s, v: v }
}

// ---------- spawn center ----------
function readWorldSpawnXZ(level) {
    var pos = null
    if (level && typeof level.getSharedSpawnPos === 'function') pos = level.getSharedSpawnPos()
        else if (level && typeof level.getSpawnPos === 'function') pos = level.getSpawnPos()
            else if (level && level.sharedSpawnPos) pos = level.sharedSpawnPos
                else if (level && level.spawnPos) pos = level.spawnPos

                    if (!pos) return { x: 0, z: 0 }

                    var x = (typeof pos.getX === 'function') ? pos.getX() : pos.x
                    var z = (typeof pos.getZ === 'function') ? pos.getZ() : pos.z
                    return { x: Math.floor(Number(x)), z: Math.floor(Number(z)) }
}

function lockCenterToCurrentWorldSpawn(server) {
    var s = readWorldSpawnXZ(server.overworld())
    try {
        pd(server).putBoolean(K_CENTER_LOCKED, true)
        pd(server).putInt(K_CENTER_X, s.x)
        pd(server).putInt(K_CENTER_Z, s.z)
    } catch (e) {}
    rrCenter = { x: s.x, z: s.z }
    return rrCenter
}

function getLockedCenter(server) {
    try {
        if (pd(server).getBoolean(K_CENTER_LOCKED)) {
            return { x: pd(server).getInt(K_CENTER_X), z: pd(server).getInt(K_CENTER_Z) }
        }
    } catch (e) {}
    return readWorldSpawnXZ(server.overworld())
}

// ---------- persistence ----------
var REBUILD_IF_CONFIG_CHANGED = true

function loadState(server) {
    rrCenter = getLockedCenter(server)

    if (REBUILD_IF_CONFIG_CHANGED) {
        try {
            var key = pd(server).getString(K_CFG)
            if (key && String(key) !== String(configKey())) {
                rrBroadcast(server, 'Config changed (old=' + key + ' new=' + configKey() + '). Hubs invalid until rebuild/reset.')
                setFinal(server, false)
                setBuildRequested(server, false)
                pd(server).putString(K_HUBS_JSON, '[]')
                pd(server).putString(K_COUNTS_JSON, '[]')
            }
        } catch (e0) {}
    }

    rrHubs = []
    rrCounts = []

    try {
        var hs = pd(server).getString(K_HUBS_JSON)
        if (hs) {
            var arr = JSON.parse(String(hs))
            if (arr && arr.length) rrHubs = arr
        }
    } catch (e1) {}

    try {
        var cs = pd(server).getString(K_COUNTS_JSON)
        if (cs) {
            var carr = JSON.parse(String(cs))
            if (carr && carr.length) rrCounts = carr
        }
    } catch (e2) {}

    while (rrCounts.length < rrHubs.length) rrCounts.push(0)
        rrCountsDirty = false
}

function savePartial(server) {
    try {
        pd(server).putString(K_HUBS_JSON, JSON.stringify(rrHubs || []))
        pd(server).putString(K_COUNTS_JSON, JSON.stringify(rrCounts || []))
        pd(server).putString(K_CFG, String(configKey()))
        setFinal(server, false)
    } catch (e) {}
}

function saveFinal(server) {
    try {
        pd(server).putString(K_HUBS_JSON, JSON.stringify(rrHubs || []))
        pd(server).putString(K_COUNTS_JSON, JSON.stringify(rrCounts || []))
        pd(server).putString(K_CFG, String(configKey()))
        setFinal(server, true)
        setBuildRequested(server, false)
    } catch (e) {}
}

function saveCounts(server) {
    if (!rrCountsDirty) return
        rrCountsDirty = false
        try { pd(server).putString(K_COUNTS_JSON, JSON.stringify(rrCounts || [])) } catch (e) {}
}

// ---------- geometry ----------
function dist2(a, b) { var dx = a.dx - b.dx; var dz = a.dz - b.dz; return dx * dx + dz * dz }

function minDist2ToSet(p, set) {
    var best = 2147483647
    for (var i = 0; i < set.length; i++) {
        var d = dist2(p, set[i])
        if (d < best) best = d
    }
    return best
}

function randomAnnulusPointFromSeed(seed) {
    // returns {seed, p:{dx,dz}}
    var min2 = MIN_DISTANCE * MIN_DISTANCE
    var max2 = MAX_DISTANCE * MAX_DISTANCE

    for (var tries = 0; tries < 40; tries++) {
        var t1 = lcgFloat01(seed); seed = t1.s
        var t2 = lcgFloat01(seed); seed = t2.s

        var r2 = min2 + t1.f * (max2 - min2)
        var r = Math.sqrt(r2)
        var a = t2.f * Math.PI * 2

        var dx = Math.floor(Math.round(r * Math.cos(a)))
        var dz = Math.floor(Math.round(r * Math.sin(a)))

        var d2 = dx * dx + dz * dz
        if (d2 >= min2 && d2 <= max2) return { seed: seed, p: { dx: dx, dz: dz } }
    }

    // fallback integer pick
    while (true) {
        var rx = lcgInt(seed, -MAX_DISTANCE, MAX_DISTANCE); seed = rx.s
        var rz = lcgInt(seed, -MAX_DISTANCE, MAX_DISTANCE); seed = rz.s
        var dx2 = rx.v
        var dz2 = rz.v
        var d22 = dx2 * dx2 + dz2 * dz2
        if (d22 >= min2 && d22 <= max2) return { seed: seed, p: { dx: dx2, dz: dz2 } }
    }
}

function buildCandidates(n) {
    var out = []
    for (var i = 0; i < n; i++) out.push(randomAnnulusPointFromSeed((Math.random() * 2147483647) | 0).p)
        return out
}

function farthestPointPlan(candidates, k) {
    var chosen = []
    if (candidates.length === 0) return chosen

        chosen.push(candidates[randInt(0, candidates.length - 1)])
        var used = {}
        used[String(chosen[0].dx) + ',' + String(chosen[0].dz)] = true

        while (chosen.length < k) {
            var best = null
            var bestD = -1

            for (var i = 0; i < candidates.length; i++) {
                var p = candidates[i]
                var key = String(p.dx) + ',' + String(p.dz)
                if (used[key]) continue

                    var d = minDist2ToSet(p, chosen)
                    if (d > bestD) { bestD = d; best = p }
            }

            if (!best) break
                chosen.push(best)
                used[String(best.dx) + ',' + String(best.dz)] = true
        }

        return chosen
}

function relToAbs(center, p) {
    return { x: Math.floor(center.x + p.dx), z: Math.floor(center.z + p.dz) }
}

function chunkCoord(blockCoord) { return Math.floor(blockCoord / 16) }

// ---------- strict safety ----------
function blockIdAt(level, x, y, z) {
    try { return String(level.getBlock(x, y, z).id) } catch (e) { return 'minecraft:air' }
}
function isBadFluidId(id) { return has(BAD_FLUIDS, id) }
function isStrictAir(id) { return has(SKY_AIR, id) }

function isSafeGround(level, x, y, z) {
    var id = blockIdAt(level, x, y, z)
    if (!id) return false
        if (isBadFluidId(id)) return false
            if (has(SAFE_GROUND, id)) return true
                // fallback: any colliding block
                try { return !!level.getBlock(x, y, z).hasCollision() } catch (e) { return false }
}

function isOpenSkyAbove(level, x, headY, z) {
    var y = headY + 1
    if (y < BOTTOM_Y) y = BOTTOM_Y
        if (y > TOP_Y) return true
            for (; y <= TOP_Y; y++) {
                var id = blockIdAt(level, x, y, z)
                if (!isStrictAir(id)) return false
            }
            return true
}

function hasNearbyFluids(level, x, y, z) {
    for (var dx = -ADJ_FLUID_RADIUS; dx <= ADJ_FLUID_RADIUS; dx++) {
        for (var dz = -ADJ_FLUID_RADIUS; dz <= ADJ_FLUID_RADIUS; dz++) {
            var id = blockIdAt(level, x + dx, y, z + dz)
            if (isBadFluidId(id)) return true
        }
    }
    return false
}

function isValidSpawn(level, x, y, z) {
    var feet = blockIdAt(level, x, y, z)
    var head = blockIdAt(level, x, y + 1, z)
    if (!isStrictAir(feet) || !isStrictAir(head)) return false
        if (!isSafeGround(level, x, y - 1, z)) return false
            if (hasNearbyFluids(level, x, y, z)) return false
                if (!isOpenSkyAbove(level, x, y + 1, z)) return false
                    return true
}

function surfaceSeedY(level, x, z) {
    if (!(HeightmapTypes && level && typeof level.getHeight === 'function')) return null
        try { return Math.floor(Number(level.getHeight(HeightmapTypes.MOTION_BLOCKING_NO_LEAVES, x, z))) } catch (e) { return null }
}

function findSpawnAt(level, x, z) {
    var y0 = surfaceSeedY(level, x, z)
    if (y0 == null) return null

        // reject if the block above the "surface" is fluid
        var above = blockIdAt(level, x, y0 + 1, z)
        if (isBadFluidId(above)) return null

            var start = Math.min(TOP_Y, y0 + Y_SCAN_UP)
            var end = Math.max(BOTTOM_Y, y0 - Y_SCAN_DOWN)

            for (var y = start; y >= end; y--) {
                if (isValidSpawn(level, x, y, z)) return { x: x, y: y, z: z }
            }
            return null
}

function findSpawnNear(level, x, z, radius) {
    var s = findSpawnAt(level, x, z)
    if (s) return s

        for (var r = 1; r <= radius; r++) {
            var dx, dz
            dz = -r
            for (dx = -r; dx <= r; dx++) { s = findSpawnAt(level, x + dx, z + dz); if (s) return s }
            dz = r
            for (dx = -r; dx <= r; dx++) { s = findSpawnAt(level, x + dx, z + dz); if (s) return s }
            dx = -r
            for (dz = -r + 1; dz <= r - 1; dz++) { s = findSpawnAt(level, x + dx, z + dz); if (s) return s }
            dx = r
            for (dz = -r + 1; dz <= r - 1; dz++) { s = findSpawnAt(level, x + dx, z + dz); if (s) return s }
        }

        return null
}

// ---------- randomized per-slot search (ring walk) ----------
function initSlotSearchParams(slotIdx, baseRel, seedBase) {
    // Each slot gets its own RNG stream and walk parameters.
    // walkAngle drifts, walkRadius jitters. This prevents "same coords" across hubs.
    var s = (seedBase ^ (slotIdx * 0x9E3779B9)) | 0
    var a = lcgFloat01(s); s = a.s
    var r = lcgFloat01(s); s = r.s
    var j = lcgFloat01(s); s = j.s

    var angle = a.f * Math.PI * 2
    var radius = MIN_DISTANCE + r.f * (MAX_DISTANCE - MIN_DISTANCE)
    var angleStep = (0.35 + j.f * 1.25) * (slotIdx % 2 === 0 ? 1 : -1) // radians per fail

    // Keep dx/dz near baseRel but let walk override quickly on fails.
    return {
        seed: s,
        angle: angle,
        radius: radius,
        angleStep: angleStep,
        radJitter: 0.10 + (slotIdx % 7) * 0.02
    }
}

function nextRelForSlot(slot) {
    // Advance slot walk and produce a new rel point in annulus.
    var t = lcgFloat01(slot.search.seed); slot.search.seed = t.s
    var jitter = (t.f - 0.5) * 2.0 * slot.search.radJitter

    slot.search.angle = slot.search.angle + slot.search.angleStep
    var rad = slot.search.radius * (1.0 + jitter)

    // Clamp radius into annulus
    if (rad < MIN_DISTANCE) rad = MIN_DISTANCE + (MIN_DISTANCE - rad)
        if (rad > MAX_DISTANCE) rad = MAX_DISTANCE - (rad - MAX_DISTANCE)
            if (rad < MIN_DISTANCE) rad = MIN_DISTANCE
                if (rad > MAX_DISTANCE) rad = MAX_DISTANCE

                    var dx = Math.floor(Math.round(rad * Math.cos(slot.search.angle)))
                    var dz = Math.floor(Math.round(rad * Math.sin(slot.search.angle)))

                    // Ensure inside annulus after rounding, otherwise fallback to seeded annulus pick
                    var d2 = dx * dx + dz * dz
                    var min2 = MIN_DISTANCE * MIN_DISTANCE
                    var max2 = MAX_DISTANCE * MAX_DISTANCE
                    if (d2 < min2 || d2 > max2) {
                        var rp = randomAnnulusPointFromSeed(slot.search.seed)
                        slot.search.seed = rp.seed
                        return rp.p
                    }

                    return { dx: dx, dz: dz }
}

function rerollSlot(slot) {
    // When a slot is "stuck", reset its search params.
    var s = slot.search.seed | 0
    var rp = randomAnnulusPointFromSeed(s)
    s = rp.seed
    slot.rel = rp.p
    slot.search.seed = s

    // also change steps
    var t = lcgFloat01(s); s = t.s
    slot.search.angleStep = (0.45 + t.f * 1.55) * (t.f > 0.5 ? 1 : -1)
    slot.search.radJitter = 0.10 + (t.f * 0.35)
    slot.search.seed = s
}

// ---------- build pipeline ----------
function initBuild(server) {
    rrCenter = getLockedCenter(server)
    rrBuild.gen = rrBuild.gen + 1
    rrBuild.active = true
    rrBuild.inflightCount = 0

    var candidates = buildCandidates(CANDIDATE_POOL)
    rrBuild.plan = farthestPointPlan(candidates, HUB_COUNT)

    rrBuild.slots = []
    var seedBase = ((Math.random() * 2147483647) | 0) ^ (rrCenter.x | 0) ^ (rrCenter.z | 0) ^ (rrBuild.gen | 0)

    for (var i = 0; i < HUB_COUNT; i++) {
        var rel = rrBuild.plan[i] || randomAnnulusPointFromSeed(seedBase ^ i).p
        rrBuild.slots.push({
            rel: rel,
            done: false,
            inflight: false,
            attempts: 0,
            fails: 0,
            search: initSlotSearchParams(i, rel, seedBase),
                           stuckTrips: 0
        })
    }

    rrBuild.order = shuffledIndices(HUB_COUNT)
    rrBuild.orderPos = 0

    rrHubs = [] // sparse by slot while building
    rrCounts = []
    for (var j = 0; j < HUB_COUNT; j++) rrCounts.push(0)
        rrCountsDirty = true
        savePartial(server)

        rrBroadcast(server,
                    'Build init. center=(' + rrCenter.x + ',' + rrCenter.z + ')' +
                    ' annulus=[' + MIN_DISTANCE + ',' + MAX_DISTANCE + ']' +
                    ' hubs=' + HUB_COUNT +
                    ' inflightMax=' + MAX_INFLIGHT +
                    ' candidates=' + CANDIDATE_POOL +
                    ' cfg=' + configKey()
        )
}

function countDone() {
    var d = 0
    for (var i = 0; i < rrBuild.slots.length; i++) if (rrBuild.slots[i].done) d++
        return d
}

function scheduleValidate(server, slotIdx) {
    var slot = rrBuild.slots[slotIdx]
    if (!slot || slot.done || slot.inflight) return
        if (rrBuild.inflightCount >= MAX_INFLIGHT) return

            var gen = rrBuild.gen
            slot.inflight = true
            slot.attempts = slot.attempts + 1
            rrBuild.inflightCount = rrBuild.inflightCount + 1

            var abs = relToAbs(rrCenter, slot.rel)
            var x = abs.x
            var z = abs.z
            var cx = chunkCoord(x)
            var cz = chunkCoord(z)

            rrBroadcast(server, 'Hub ' + (slotIdx + 1) + '/' + HUB_COUNT +
            ' try ' + slot.attempts +
            ' base=(' + x + ',' + z + ')' +
            ' chunk=(' + cx + ',' + cz + ')' +
            ' inflight=' + rrBuild.inflightCount + '/' + MAX_INFLIGHT
            )

            server.runCommandSilent('execute in ' + DIM + ' run forceload add ' + cx + ' ' + cz)

            server.scheduleInTicks(FORCELOAD_WAIT_TICKS, function () {
                function cleanup() {
                    try { server.runCommandSilent('execute in ' + DIM + ' run forceload remove ' + cx + ' ' + cz) } catch (e0) {}
                }

                if (rrBuild.gen !== gen) {
                    cleanup()
                    slot.inflight = false
                    rrBuild.inflightCount = Math.max(0, rrBuild.inflightCount - 1)
                    return
                }

                var level = server.overworld()
                var spot = null
                var reason = 'no_valid_surface_open_sky'

                try {
                    var found = findSpawnNear(level, x, z, NEARBY_SEARCH_RADIUS)
                    if (found) {
                        spot = { dim: DIM, x: found.x + 0.5, y: found.y, z: found.z + 0.5 }
                        reason = 'ok'
                    }
                } catch (e1) {
                    spot = null
                    reason = 'exception'
                }

                cleanup()

                slot.inflight = false
                rrBuild.inflightCount = Math.max(0, rrBuild.inflightCount - 1)

                if (rrBuild.gen !== gen) return

                    if (spot) {
                        slot.done = true
                        rrHubs[slotIdx] = spot
                        rrCounts[slotIdx] = 0
                        rrCountsDirty = true
                        savePartial(server)

                        var gx = Math.floor(spot.x)
                        var gz = Math.floor(spot.z)
                        var ground = blockIdAt(level, gx, spot.y - 1, gz)

                        rrBroadcast(server, 'Hub ' + (slotIdx + 1) + ' OK pos=(' + gx + ',' + spot.y + ',' + gz + ')' +
                        ' ground=' + ground +
                        ' done=' + countDone() + '/' + HUB_COUNT
                        )
                        return
                    }

                    // failure path: advance this slot's search so it does not keep probing same coords
                    slot.fails = slot.fails + 1

                    if (LOG_EACH_FAIL || (slot.fails % LOG_FAIL_EVERY === 0) || (slot.attempts >= MAX_VALIDATE_RETRIES_PER_HUB)) {
                        rrBroadcast(server, 'Hub ' + (slotIdx + 1) + ' FAIL reason=' + reason +
                        ' fails=' + slot.fails +
                        ' tries=' + slot.attempts + '/' + MAX_VALIDATE_RETRIES_PER_HUB
                        )
                    }

                    // move to a new rel point (ring walk)
                    slot.rel = nextRelForSlot(slot)

                    // if we have been failing too long, reroll the walk parameters
                    if (slot.attempts >= MAX_VALIDATE_RETRIES_PER_HUB) {
                        slot.stuckTrips = slot.stuckTrips + 1
                        rrBroadcast(server, 'Hub ' + (slotIdx + 1) + ' STUCK x' + slot.attempts + '. Rerolling search (trip ' + slot.stuckTrips + ').')
                        slot.attempts = 0
                        slot.fails = 0
                        rerollSlot(slot)
                    }
            })
}

function stepBuild(server) {
    if (!rrBuild.active) return
        if (!isEnabled(server)) return
            if (!isBuildRequested(server)) return
                if (isFinal(server)) { rrBuild.active = false; return }

                var done = countDone()
                if (done >= HUB_COUNT) {
                    // pack only successful hubs, keep order stable (by slot index)
                    var finalHubs = []
                    var finalCounts = []
                    for (var i = 0; i < HUB_COUNT; i++) {
                        if (rrHubs[i]) { finalHubs.push(rrHubs[i]); finalCounts.push(0) }
                    }
                    rrHubs = finalHubs
                    rrCounts = finalCounts
                    rrCountsDirty = true

                    rrBroadcast(server, 'Build complete. hubs=' + rrHubs.length + '/' + HUB_COUNT + ' Saving final.')
                    saveFinal(server)
                    rrBuild.active = false
                    return
                }

                // Ensure scheduling order exists
                if (!rrBuild.order || rrBuild.order.length !== HUB_COUNT) {
                    rrBuild.order = shuffledIndices(HUB_COUNT)
                    rrBuild.orderPos = 0
                }

                // Schedule in shuffled order; reshuffle continuously.
                var guard = 0
                while (rrBuild.inflightCount < MAX_INFLIGHT && guard < HUB_COUNT) {
                    var idx = rrBuild.order[rrBuild.orderPos]
                    rrBuild.orderPos = rrBuild.orderPos + 1
                    if (rrBuild.orderPos >= rrBuild.order.length) {
                        rrBuild.order = shuffledIndices(HUB_COUNT)
                        rrBuild.orderPos = 0
                    }

                    var s2 = rrBuild.slots[idx]
                    if (s2 && !s2.done && !s2.inflight) scheduleValidate(server, idx)
                        guard = guard + 1
                }
}

// ---------- respawn redirect ----------
function chooseLeastUsedHubIndex() {
    if (!rrHubs || rrHubs.length === 0) return -1
        while (rrCounts.length < rrHubs.length) rrCounts.push(0)

            var bestC = 2147483647
            var best = []

            for (var i = 0; i < rrHubs.length; i++) {
                var c = Math.floor(Number(rrCounts[i]))
                if (c < bestC) { bestC = c; best = [i] }
                else if (c === bestC) best.push(i)
            }

            var idx = (best.length === 1) ? best[0] : best[randInt(0, best.length - 1)]
            rrCounts[idx] = Math.floor(Number(rrCounts[idx])) + 1
            rrCountsDirty = true
            return idx
}

function teleportPlayerToHub(server, player, hub) {
    var name = escSelector(player.username)
    var y = Number(hub.y) + 0.1
    server.runCommandSilent('execute as @a[name="' + name + '"] in ' + hub.dim + ' run tp @s ' + hub.x + ' ' + y + ' ' + hub.z)
}

function playerHasPersonalSpawn(player) {
    var nbt = (player.fullNBT != null) ? player.fullNBT : player.nbt
    if (!nbt) return false
        return nbt.SpawnX != null || nbt.SpawnY != null || nbt.SpawnZ != null || nbt.SpawnDimension != null
}

// ---------- actions ----------
function actionEnable(server) {
    setEnabled(server, true)
    setBuildRequested(server, true)
    setFinal(server, false)

    var c = lockCenterToCurrentWorldSpawn(server)

    rrBuild.gen = rrBuild.gen + 1
    rrBuild.active = false
    rrBuild.slots = []
    rrBuild.inflightCount = 0
    rrBuild.order = null
    rrBuild.orderPos = 0

    rrHubs = []
    rrCounts = []
    rrCountsDirty = false

    try {
        pd(server).putString(K_HUBS_JSON, '[]')
        pd(server).putString(K_COUNTS_JSON, '[]')
        pd(server).putString(K_CFG, String(configKey()))
    } catch (e) {}

    rrBroadcast(server, 'Enabled. Locked center=(' + c.x + ',' + c.z + '). Starting build.')
    initBuild(server)
}

function actionRebuild(server) { actionEnable(server) }

function actionCancel(server) {
    setBuildRequested(server, false)
    rrBuild.gen = rrBuild.gen + 1
    rrBuild.active = false
    rrBuild.slots = []
    rrBuild.inflightCount = 0
    rrBuild.order = null
    rrBuild.orderPos = 0
    rrBroadcast(server, 'Cancelled build.')
}

function actionDisable(server) {
    setEnabled(server, false)
    setBuildRequested(server, false)
    rrBuild.gen = rrBuild.gen + 1
    rrBuild.active = false
    rrBuild.slots = []
    rrBuild.inflightCount = 0
    rrBuild.order = null
    rrBuild.orderPos = 0
    rrBroadcast(server, 'Disabled. Respawn redirects off. Hubs kept on disk.')
}

function actionReset(server) {
    setEnabled(server, false)
    setBuildRequested(server, false)
    setFinal(server, false)

    rrBuild.gen = rrBuild.gen + 1
    rrBuild.active = false
    rrBuild.slots = []
    rrBuild.inflightCount = 0
    rrBuild.order = null
    rrBuild.orderPos = 0

    rrCenter = null
    rrHubs = []
    rrCounts = []
    rrCountsDirty = false

    try {
        var d = pd(server)
        d.putBoolean(K_CENTER_LOCKED, false)
        d.putInt(K_CENTER_X, 0)
        d.putInt(K_CENTER_Z, 0)
        d.putString(K_HUBS_JSON, '[]')
        d.putString(K_COUNTS_JSON, '[]')
        d.putString(K_CFG, '')
    } catch (e) {}

    rrBroadcast(server, 'Reset complete. Everything cleared and disabled.')
}

function actionStatus(server) {
    loadState(server)

    var enabled = isEnabled(server)
    var requested = isBuildRequested(server)
    var fin = isFinal(server)
    var cn = getLockedCenter(server)

    var locked = false
    try { locked = pd(server).getBoolean(K_CENTER_LOCKED) } catch (e) {}

    var inflight = rrBuild.inflightCount || 0
    var done = (rrBuild.slots && rrBuild.slots.length) ? countDone() : 0

    rrBroadcast(server,
                'Status: enabled=' + enabled +
                ' build_requested=' + requested +
                ' final=' + fin +
                ' center_locked=' + locked +
                ' center=(' + cn.x + ',' + cn.z + ')' +
                ' hubs_saved=' + ((rrHubs && rrHubs.length) || 0) +
                ' build_done=' + done + '/' + HUB_COUNT +
                ' inflight=' + inflight + '/' + MAX_INFLIGHT +
                ' cfg=' + configKey()
    )
}

// ---------- events ----------
ServerEvents.loaded(function (event) {
    rrServer = event.server
    rrLog('Script loaded: ' + SCRIPT_VERSION)
})

PlayerEvents.respawned(function (event) {
    var player = event.player
    var server = event.server

    if (!isEnabled(server)) return
        if (playerHasPersonalSpawn(player)) return
            if (!isFinal(server)) return

                if (!rrHubs || rrHubs.length === 0) loadState(server)
                    if (!rrHubs || rrHubs.length === 0) return

                        server.scheduleInTicks(1, function () {
                            if (!isEnabled(server)) return
                                if (!isFinal(server)) return
                                    if (!rrHubs || rrHubs.length === 0) return

                                        var idx = chooseLeastUsedHubIndex()
                                        if (idx < 0) return
                                            teleportPlayerToHub(server, player, rrHubs[idx])
                        })
})

ServerEvents.tick(function (event) {
    var server = event.server

    if (isEnabled(server) && isBuildRequested(server) && !isFinal(server)) {
        if (!rrBuild.active) {
            rrBroadcast(server, 'Build requested. Starting builder now.')
            initBuild(server)
        }
        stepBuild(server)
    }

    var SAVE_EVERY = (typeof SAVE_COUNTS_EVERY_TICKS === 'number') ? SAVE_COUNTS_EVERY_TICKS : 200
    if (server.tickCount % SAVE_EVERY === 0) saveCounts(server)
})

// ---------- custom commands ----------
ServerEvents.customCommand('rrhubs_enable', function (event) {
    noteInvoker(event)
    rrBroadcast(event.server, 'Command: enable')
    actionEnable(event.server)
})
ServerEvents.customCommand('rrhubs_rebuild', function (event) {
    noteInvoker(event)
    rrBroadcast(event.server, 'Command: rebuild')
    actionRebuild(event.server)
})
ServerEvents.customCommand('rrhubs_status', function (event) {
    noteInvoker(event)
    rrBroadcast(event.server, 'Command: status')
    actionStatus(event.server)
})
ServerEvents.customCommand('rrhubs_cancel', function (event) {
    noteInvoker(event)
    rrBroadcast(event.server, 'Command: cancel')
    actionCancel(event.server)
})
ServerEvents.customCommand('rrhubs_disable', function (event) {
    noteInvoker(event)
    rrBroadcast(event.server, 'Command: disable')
    actionDisable(event.server)
})
ServerEvents.customCommand('rrhubs_reset', function (event) {
    noteInvoker(event)
    rrBroadcast(event.server, 'Command: reset')
    actionReset(event.server)
})
