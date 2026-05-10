# Coin Villager Trade Pass Report

## Scope

This pass keeps the Create Deco coin migration intact and fixes the in-game trade gap where higher coin tiers were defined in script but silently blocked by the tier whitelist.

## Source Data

- Current trade source: `kubejs/server_scripts/35_villager_trades/10_coin_villager_trades.js`
- Old instance item dump: `/home/gerald/Bound to Matter-Playtest 3 - v1-37471267/minecraft/generated/runtime-dumps/registries.manual.json`
- Current runtime dump references: `generated/runtime-dumps/`

## Fixes

- Enabled all Create Deco coin tiers in villager trade guards:
  - copper: `createdeco:copper_coin`
  - zinc: `createdeco:zinc_coin`
  - iron: `createdeco:iron_coin`
  - industrial iron: `createdeco:industrial_iron_coin`
  - brass: `createdeco:brass_coin`
  - gold: `createdeco:gold_coin`
  - platinum/netherite: `createdeco:netherite_coin`
- Added a dedicated industrial-iron market with 30 active Create/workshop/rail support trades.
- Added gold and platinum top-up markets so each high tier has at least about 30 active coin-cost trades.
- Replaced stale optional IDs that were absent from the old item dump:
  - `mynethersdelight:roast_stuffed_hoglin`
  - `artifacts:snorkel`
  - `railways:conductor_whistle`
  - `railways:track_coupler`
  - `artifacts:night_vision_goggles`
- Updated the expert graph catalog to include zinc and industrial iron coin tiers.
- Updated pack validation wording/checks from Dot Coin to Create Deco coins.

## Active Trade Counts

Mocked MoreJS validation against the old instance item registry reports these active coin-cost trades:

| Tier | Active Trades |
| --- | ---: |
| copper | 64 |
| zinc | 34 |
| iron | 52 |
| industrial_iron | 30 |
| brass | 64 |
| gold | 33 |
| platinum | 46 |

Sell-to-villager payout trades are not counted in this table because their input is an item and their output is copper coins.

## Validation

- `node --check kubejs/server_scripts/35_villager_trades/10_coin_villager_trades.js`
- All referenced item result IDs were checked against the old instance manual item registry dump.
- A mocked MoreJS execution counted active coin-cost offers after `Item.exists` filtering.

