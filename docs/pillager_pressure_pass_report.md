# Pillager Pressure Pass

## Finding

Base Raid was configured for frequent custom patrols, but live behavior did not produce patrol pressure. KubeJS fallback commands were also unreliable after reload. Pillager pressure is core gameplay, so it should not depend on reload-sensitive KubeJS command registration.

## Implemented Fix

Added a dedicated Forge mod jar: `mods/pillagerpressure-0.1.0.jar`.

Current behavior:

- Runs every 1200 ticks.
- 95% spawn chance per eligible overworld player.
- Spawns on a surface ring 32-64 blocks from the player.
- Spawns one patrol leader plus 4-7 pillagers.
- 75% chance to add 2 special illagers from vanilla, It Takes a Pillage, and Savage & Ravage.
- Tags spawned mobs with `BoundToMatterPillagerPressure` persistent data.
- Marks leaders as patrol captains.
- Drops Base Raid's ominous bottle from tagged patrol leaders if Base Raid is loaded and no other bottle drop already exists.
- Targets the player immediately.
- Applies persistence to pressure mobs, with an active cap to prevent runaway accumulation.
- Skips spectators and includes creative players for playtest tuning.

## Removed

Removed `kubejs/server_scripts/70_spawn/20_pillager_patrol_pressure.js`.

## Tuning Surface

Edit `config/pillagerpressure-common.toml`:

- `interval_ticks`
- `spawn_chance`
- `min_radius`
- `max_radius`
- `min_pillagers`
- `max_pillagers`
- `special_chance`
- `special_amount`
- `max_active_near_player`
- `active_check_radius`
- `allow_creative_players`

## Validation Commands

- `/pillagerpressure status`
- `/pillagerpressure now`
- `/ppatrol status`
- `/ppatrol now`

## Operational Note

The live Prism instance has been patched with the new jar and config, but it requires a full Minecraft restart. `/reload` is insufficient for adding Forge mods.
