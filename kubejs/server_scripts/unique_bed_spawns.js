// Enforce: 1 bed spawn binding = 1 player (vanilla beds)
// Forge 1.20.1 + KubeJS 6

const MODID = 'unique_bed_spawn'
const KEY_OWNERS = `${MODID}:owners`         // map bedKey -> playerUUID
const KEY_PLAYER = `${MODID}:player_to_bed`  // map playerUUID -> bedKey

function ensureMaps(server) {
    const pd = server.persistentData
    if (!pd[KEY_OWNERS]) pd[KEY_OWNERS] = {}
    if (!pd[KEY_PLAYER]) pd[KEY_PLAYER] = {}
    return { owners: pd[KEY_OWNERS], playerToBed: pd[KEY_PLAYER] }
}

function dimId(level) {
    return `${level.dimension.location()}`
}

function bedKey(dim, pos) {
    return `${dim}|${pos.x},${pos.y},${pos.z}`
}

function isVanillaBedId(id) {
    return id.startsWith('minecraft:') && id.endsWith('_bed')
}

function releaseKey(owners, playerToBed, k) {
    const uuid = owners[k]
    if (!uuid) return
        delete owners[k]
        if (playerToBed[uuid] === k) delete playerToBed[uuid]
}

// Claim on spawn-set
ForgeEvents.onEvent('net.minecraftforge.event.entity.player.PlayerSetSpawnEvent', e => {
    const player = e.entity
    if (!player || player.level.isClientSide()) return
        if (!e.newSpawn) return

            // Only enforce when setting spawn in the player's current dimension
            const dim = dimId(player.level)
            if (`${e.spawnLevel}` !== dim) return

                const pos = e.newSpawn
                const block = player.level.getBlock(pos)
                if (!block) return

                    const blockId = `${block.id}`
                    if (!isVanillaBedId(blockId)) return

                        const { owners, playerToBed } = ensureMaps(player.server)
                        const uuid = `${player.uuid}`
                        const k = bedKey(dim, pos)

                        // If player already reserved a different bed, free it
                        const old = playerToBed[uuid]
                        if (old && old !== k) releaseKey(owners, playerToBed, old)

                            // If someone else owns this bed, deny
                            const owner = owners[k]
                            if (owner && owner !== uuid) {
                                e.cancel()
                                player.tell(Text.red('That bed already has a spawn bound to another player.'))
                                return
                            }

                            owners[k] = uuid
                            playerToBed[uuid] = k
})

// Cleanup on bed break (best-effort: clears this pos and the other half if properties are readable)
BlockEvents.broken(event => {
    const id = `${event.block.id}`
    if (!isVanillaBedId(id)) return

        const server = event.level.server
        if (!server) return

            const { owners, playerToBed } = ensureMaps(server)
            const dim = dimId(event.level)
            const pos = event.block.pos

            const targets = [bedKey(dim, pos)]

            try {
                const props = event.block.properties
                const part = `${props.part}`     // "head" or "foot"
                const facing = `${props.facing}` // "north"|"south"|"east"|"west"

                const dx = (facing === 'east') ? 1 : (facing === 'west') ? -1 : 0
                const dz = (facing === 'south') ? 1 : (facing === 'north') ? -1 : 0

                const other = (part === 'foot')
                ? { x: pos.x + dx, y: pos.y, z: pos.z + dz }
                : { x: pos.x - dx, y: pos.y, z: pos.z - dz }

                targets.push(`${dim}|${other.x},${other.y},${other.z}`)
            } catch (_) {
                // Fallback: also clear adjacent blocks
                targets.push(`${dim}|${pos.x+1},${pos.y},${pos.z}`)
                targets.push(`${dim}|${pos.x-1},${pos.y},${pos.z}`)
                targets.push(`${dim}|${pos.x},${pos.y},${pos.z+1}`)
                targets.push(`${dim}|${pos.x},${pos.y},${pos.z-1}`)
            }

            targets.forEach(k => releaseKey(owners, playerToBed, k))
})
