# Pillager Pressure Stack Audit

## Current Finding

The pack has multiple systems affecting pillager pressure. Base Raid provides the Bad Omen bottle and base-raid trigger, but `base_raid-0.5.jar` does not reliably schedule custom patrols: inspection found `HomeRaidSpawnLogic` and `VanillaPatrolHandler` registered, while `CustomPatrolSpawner` had no clear event registration path. Live testing also reported `btmpatrol status = Unknown` after reload, so KubeJS command registration was not reliable enough for a core threat system.

## Implemented Direction

`pillagerpressure-0.1.0.jar` is now the authoritative patrol scheduler. The old KubeJS `btmpatrol` script was removed.

Base Raid custom patrols are disabled in `config/baseraid-common.toml`; Base Raid remains responsible for ominous bottles and fake-villager base raid triggering. Pillager Pressure disables vanilla patrol spawning on server start and owns pack-authored overworld patrol pressure.

## Active Pillager/Raid/Spawn Stack

- Pillager Pressure: pack-owned patrol scheduling, surface placement, immediate player targeting, patrol captain marking, Base Raid bottle drop bridge.
- Base Raid: Bad Omen bottle item and fake-villager base raid trigger. Its custom patrols are disabled.
- In Control: broad surface spawn denial, with first-rule allow for intended patrol illagers retained for compatibility.
- It Takes a Pillage: extra patrol candidates.
- Savage & Ravage: extra patrol candidates.
- Guard Villagers: village defense pressure and villager combat behavior.
- Golem Overhaul: village defense changes.
- Enhanced AI: pillager shooting range/accuracy and general mob behavior.
- Farsighted Mobs: hostile follow range floor of 64 via default server config.
- Mob AI Tweaks: general AI behavior changes.
- No Mob Farms: anti-farming behavior; watch if patrol drops behave oddly.
- Raider Detector: raid detection/tooling.
- Village Walls / Village Spawn Point: village/base context but not patrol source.

## Debug Surface

Commands:

- `/pillagerpressure status`: prints enabled state, ticks, attempts, spawned groups, spawned mobs, and last status.
- `/pillagerpressure now`: forces an immediate patrol attempt around every eligible overworld player.
- `/ppatrol status`: short alias.
- `/ppatrol now`: short alias.

Expected log line:

- `Pillager Pressure attempt source=... force=... players=... spawned_groups=... status=...`

## Current Defaults

Configured in `config/pillagerpressure-common.toml`:

- Attempt interval: 1200 ticks.
- Spawn chance: 95% per eligible overworld player.
- Spawn radius: 32-64 blocks.
- Patrol size: one leader plus 4-7 pillagers.
- Special support: 75% chance for 2 special illagers from vanilla, It Takes a Pillage, and Savage & Ravage.
- Active cap: 48 pressure mobs near a player within 128 blocks.
- Creative players are eligible for tuning; spectators are skipped.

## Validation Notes

This is a full-restart change because it adds a Forge mod jar. `/reload` will not load the new mod. After restart, use `/pillagerpressure now` first; if that spawns a group, scheduled pressure should follow on the interval.
