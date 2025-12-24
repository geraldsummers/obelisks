// kubejs/server_scripts/clear_inv_first_join.js

global.clearInvQueue ??= {} // uuid -> { name, ticks }

// queue on login
PlayerEvents.loggedIn(event => {
    const p = event.player
    const data = p.persistentData

    p.tell("login hook fired")

    if (data.getBoolean("cleared_inv_once")) return

        global.clearInvQueue[String(p.uuid)] = { name: p.username, ticks: 400 } // 20s
        p.tell("queued clear")
})

// process queue
ServerEvents.tick(event => {
    const q = global.clearInvQueue
    if (!q) return

        for (const uuid of Object.keys(q)) {
            q[uuid].ticks--

            if (q[uuid].ticks <= 0) {
                // clear inventory using UUID selector
                event.server.runCommandSilent(`clear @a[uuid=${uuid}]`)

                // mark as done if player is online (prefer uuid)
                const player = event.server.getPlayer(uuid) ?? event.server.getPlayer(q[uuid].name)
                if (player) player.persistentData.putBoolean("cleared_inv_once", true)

                    delete q[uuid]
            }
        }
})
