# Pillager Campaigns Stack Audit

## Current Finding

The pack previously used Base Raid for ominous bottles/base raids, but its custom patrol scheduler was not reliable enough for a core surface-pressure system. Base Raid has now been removed from the active pack.

`pillagercampaigns-0.2.0.jar` is the authoritative patrol scheduler. It disables vanilla patrol spawning on server start and owns pack-authored overworld campaign pressure.

## Active Pillager/Raid/Spawn Stack

- Pillager Campaigns: pack-owned patrol scheduling, surface placement, immediate player targeting, patrol captain marking, and active mob caps.
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

## Removed From Active Stack

- Base Raid.
- legacy KubeJS patrol scheduler.
- Base Raid ominous bottle drop bridge in Pillager Campaigns.

## Debug Surface

Commands:

- `/pillagercampaigns status`: prints enabled state, ticks, attempts, spawned groups, spawned mobs, and last status.
- `/pillagercampaigns now`: forces an immediate patrol attempt around every eligible overworld player.
- `/ppatrol status`: short alias.
- `/ppatrol now`: short alias.

Expected log line:

- `Pillager Campaigns attempt source=... force=... players=... spawned_groups=... status=...`

## Current Defaults

Configured in `config/pillagercampaigns-common.toml`:

- Attempt interval: 1200 ticks.
- Spawn chance: 95% per eligible overworld player.
- Spawn radius: 32-64 blocks.
- Patrol size: one leader plus 4-7 pillagers.
- Special support: 75% chance for 2 special illagers from vanilla, It Takes a Pillage, and Savage & Ravage.
- Active cap: 48 pressure mobs near a player within 128 blocks.
- Creative players are eligible for tuning; spectators are skipped.

## Validation Notes

This is a full-restart change because it removes a Forge mod jar and updates another. `/reload` is insufficient. After restart, use `/pillagercampaigns now` first; if that spawns a group, scheduled campaigns should follow on the interval.
