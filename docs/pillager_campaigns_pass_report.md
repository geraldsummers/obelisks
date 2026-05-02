# Pillager Campaigns Pass

## Finding

Base Raid did not provide reliable custom campaign pressure, and KubeJS fallback commands were unreliable after reload. Pillager pressure is core gameplay, so it now lives in a dedicated Forge mod.

## Implemented Fix

Active jar: `mods/pillagercampaigns-0.2.0.jar`.

Current behavior:

- Runs every 1200 ticks.
- 95% spawn chance per eligible overworld player.
- Spawns on a surface ring 32-64 blocks from the player.
- Spawns one patrol leader plus 4-7 pillagers.
- 75% chance to add 2 special illagers from vanilla, It Takes a Pillage, and Savage & Ravage.
- Tags spawned mobs with `BoundToMatterPillagerCampaigns` persistent data.
- Marks leaders as patrol captains.
- Targets the player immediately.
- Applies persistence to pressure mobs, with an active cap to prevent runaway accumulation.
- Skips spectators and includes creative players for playtest tuning.

## Removed

- Removed Base Raid from the active pack.
- Removed `config/baseraid-common.toml`.
- Removed `mods/base-raid.pw.toml`.
- Removed `kubejs/server_scripts/70_spawn/20_pillager_patrol_pressure.js` in the earlier pass.
- Removed the Base Raid ominous bottle drop bridge from Pillager Campaigns.

## Tuning Surface

Edit `config/pillagercampaigns-common.toml`:

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

- `/pillagercampaigns status`
- `/pillagercampaigns now`
- `/ppatrol status`
- `/ppatrol now`

## Operational Note

The live Prism instance has been patched with the updated jar/config and Base Raid has been removed there too. This requires a full Minecraft restart.
