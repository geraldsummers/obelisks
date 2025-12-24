function spawnFx(e, p) {
    const name = p.username;

    // Prefer cosmetic lightning. If your command parser rejects it, remove this line and keep the particles.
    e.server.runCommandSilent(`execute at ${name} run summon minecraft:lightning_bolt ~ ~ ~ {visual_only:1b}`);

    // SFX + extra VFX (safe)
    e.server.runCommandSilent(`execute at ${name} run playsound minecraft:entity.lightning_bolt.thunder master @a[distance=..64] ~ ~ ~ 0.8 1.0`);
    e.server.runCommandSilent(`execute at ${name} run particle minecraft:flash ~ ~1 ~ 0 0 0 0 1 force @a[distance=..64]`);
    e.server.runCommandSilent(`execute at ${name} run particle minecraft:electric_spark ~ ~1 ~ 0.35 0.7 0.35 0.2 80 force @a[distance=..64]`);
}

PlayerEvents.loggedIn(e => spawnFx(e, e.player));
PlayerEvents.respawned(e => spawnFx(e, e.player));
