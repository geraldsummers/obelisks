// priority: 100

ServerEvents.tick(event => {
    const { server } = event

    server.entities.filterSelector("@e[type=minecraft:tnt]").forEach(tnt => {
        const v = tnt.deltaMovement
        const vy = Math.min(v.y, 0) // allow falling, block upward shove

        // avoid exact float compares
        if (Math.abs(v.x) > 1e-4 || Math.abs(v.z) > 1e-4 || v.y > 0) {
            tnt.setDeltaMovement(0, vy, 0)

            // optional but matches common Forge practice for motion sync
            tnt.hasImpulse = true
        }
    })
})
