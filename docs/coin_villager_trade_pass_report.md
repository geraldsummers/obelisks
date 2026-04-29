# Coin Villager Trade Pass Report

## Scope

This pass fixes the Dot Coin disabled-item visual bug and expands village trading into a broad coin sink across all difficulty coin tiers.

## Config Fix

`config/dcm.json` now enables every coin item:

- copper
- iron
- tin
- bronze
- nickel
- silver
- steel
- brass
- gold
- osmium
- platinum
- diamond
- emerald
- ruby
- sapphire
- topaz

Coin conversion remains disabled with `conversionRate: 0`. Coin drops, Dot Coin chest loot, and spawner-entity coin loot remain disabled as global Dot Coin sources; pack-authored quests, loot tables, obelisk/dimension systems, and trades should define coin flow.

## Trade Design

The villager trade script now:

- Removes vanilla villager trades.
- Removes vanilla wandering trader trades.
- Uses Dot Coin purchases instead of emerald trades.
- Guards each trade with `Item.exists` so optional/moved IDs skip cleanly instead of crashing.
- Uses all coin tiers at least once.
- Keeps trades focused on recovery, convenience, settlement support, travel stock, route tools, decoration, and limited expedition supplies.
- Avoids making villagers a bulk production replacement.

## Profession Coverage

- Farmer: food recovery, cooking infrastructure, feast restock.
- Butcher: protein and meal recovery.
- Fisherman: water travel, ocean supplies, fishing recovery.
- Fletcher: arrows, ranged tools, route marking.
- Shepherd: beds, wool, banners, comfort/decor.
- Leatherworker: backpacks, carry upgrades, temperature/travel gear.
- Mason: construction materials and limited casing-adjacent convenience stock.
- Toolsmith: repair kits, workshop tools, building gadgets.
- Armorer: defensive recovery gear.
- Weaponsmith: weapons, gunpowder, TNT, blast-mining support.
- Cleric: ritual and magic recovery materials.
- Librarian: books, manuals, XP bottles, local intelligence support.
- Cartographer: maps, route tools, compasses, rail navigation support.
- Wandering Trader: cross-tier travel/adventure oddities and late-tier curios.

## Validation

- `node --check kubejs/server_scripts/35_villager_trades/10_coin_villager_trades.js` passed.
- Trade result item IDs were checked against the live item registry dump at `/home/gerald/.local/share/PrismLauncher/instances/Bound to Matter-Playtest 3 - v1/minecraft/dump/registry_builtin/minecraft/item/_entries.txt`; no missing result item IDs remain.
- `packwiz refresh` was run after config/script/doc changes.

## Runtime Checks

- Confirm every coin item no longer shows disabled/server-disabled tooltip text.
- Spawn each vanilla profession and verify it has Dot Coin trades.
- Spawn a wandering trader and verify both trade levels use Dot Coin costs.
- Confirm no emerald trades remain.
- Confirm high-tier trades are acceptable as convenience/adventure sinks, not mandatory progression shortcuts.
