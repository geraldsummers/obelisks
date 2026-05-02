# Economy Loot Trade Audit

Scope: villager/wanderer coin trades, Wares loot tables, and emerald-to-coin loot replacement coverage.

## Files Reviewed

- `kubejs/server_scripts/35_villager_trades/10_coin_villager_trades.js`
- `kubejs/server_scripts/50_loot/20_world_chest_coin_tiers.js`
- `kubejs/server_scripts/50_loot/30_global_loot_progression_scrub.js`
- `kubejs/server_scripts/50_loot/40_emerald_loot_coin_replacement.js`
- `kubejs/data/wares/loot_tables/agreement/village/*.json`
- `kubejs/data/wares/loot_tables/agreement/wandering_trader/*.json`
- `kubejs/data/wares/loot_tables/package/village/*.json`
- `config/ftbquests/quests/chapters/village_economy.snbt`
- `config/ftbquests/quests/chapters/major_gates.snbt`

## Current Economy Model

- Vanilla and modded villager trades are removed and rebuilt in coin terms (`removeVanillaTrades` + `removeModdedTrades`).
- Coin exchange is intentionally lossy in both directions via cleric/cartographer ladders.
- Sell-to-villager loops pay copper coins rather than emeralds.
- A live trade-time emerald scrub (`playerStartTrading`) attempts to replace residual emerald offers with copper coin.
- Wares agreement and wandering trader price tables are coin-based (no emerald entries in reviewed JSONs).
- Emerald loot replacement script maps many chest/entity/package tables to coin tiers and replaces emerald entries.

## Findings

1. Wares contract/payment/requested-buy tables are fully coinized in the reviewed dataset.
2. Village economy quests align with coin-first intent and explicitly describe no-emerald contract behavior.
3. Cleric economy path sells Blood Magic slates through platinum tier, introducing a direct economy-to-magic gate bridge.
4. Emerald replacement coverage is broad, but coin injection is duplicated across two scripts:
   - `20_world_chest_coin_tiers.js` adds baseline copper+iron to known chest tables.
   - `40_emerald_loot_coin_replacement.js` also adds baseline copper+iron to its computed table set.
   - Overlapping tables likely receive both baseline injections, increasing coin float above intended tuning.
5. `40_emerald_loot_coin_replacement.js` comment says block ore drops are excluded; replacement logic is table-driven and world-loot filtered, consistent with that claim.

## Emerald/Coin/Loot Gap Analysis

- Gap A: Duplicate baseline coin injection across `20_*` and `40_*` scripts can inflate early/mid coin liquidity.
- Gap B: Emerald replacement depends on explicit table lists; new mod loot tables with emeralds can drift out of coverage unless regenerated.
- Gap C: Trade scrub safety net runs at trade start, but relies on MoreJS hooks and successful reflective offer replacement; failure path only warns.

## Heart + Economy Cross-System Constraint Notes

- Economy currently offers slates directly (cleric tiered stock), while heart/orb progression has stronger RPG/death constraints.
- This creates asymmetric pressure: heart-orb progression is strict, slate acquisition can be partially market-driven.

## Recommended Follow-up Checks (No Changes Applied)

1. Decide single source of baseline coin injection (`20_world_chest_coin_tiers.js` or `40_emerald_loot_coin_replacement.js`) to avoid stacked float.
2. Periodically regenerate/re-audit emerald replacement table coverage when mods/loot tables change.
3. Validate whether high-tier cleric slate sales are intentional for target pacing.
4. Add CI/audit assertion for residual `minecraft:emerald` entries in non-ore loot tables to catch regressions.

## Audit Outcome

- No recipe edits performed.
- Economy conversion is largely coherent and comprehensive.
- Main issues are duplicated baseline chest injections and potential long-term coverage drift for newly added loot tables.
