# Validation Report

Date: 2026-05-16

## Validation Passed

Commands run successfully after the Latent ChemLib pass:

```sh
(cd /home/gerald/mcmods/latent-chemlib && ./gradlew --no-daemon test)
(cd /home/gerald/mcmods/latent-chemlib && ./gradlew --no-daemon build)
packwiz refresh
tools/server_content_smoke.sh --server-dir /tmp/btm-latent-smoke --port 25572 --reset-runtime --timeout 480
git diff --check -- . ':!server-instance'
```

## Current Generated State

- Quest book: intentionally empty, with 0 chapters and no chapter groups.
- Server content smoke: reached dedicated server `Done`.
- KubeJS recipe parse health: 0 parse errors, 0 failed recipes.
- Pack test suite: 60 passes, 0 hard failures, 0 soft findings.
- Generated recipe records scanned by the pack suite: 26352.
- Villager professions covered by the pack suite: 13.

## Confirmed Static Fixes

- Andesite alloy non-alloying recipes are explicitly removed by KubeJS.
- Andesite casing is deployer-only in the pack script.
- Later custom machine casings use Create mechanical crafting.
- Sky Steel ingots use heated Create mixing and Sky Steel sheets use Create pressing.
- Emerald currency loot in non-block loot tables is explicitly replaced with Dot Coin tiers by LootJS.
- Quest rewards use copper-only Starting Out rewards and cumulative coin-tier rewards elsewhere.
- Acid Vat is retired; active pack scripts use Create and PNCR chemistry.

## In-Game Validation Still Required

- Launch a disposable instance and run `/reload`.
- Confirm no KubeJS, LootJS, MoreJS, FTB Quests, or recipe loading errors in logs.
- Confirm the quest book remains empty unless a later pass intentionally rebuilds it.
- Spawn each villager profession and wandering trader; confirm Dot Coin trades replace emerald trades.
- Open representative loot chests and confirm emerald currency has become Dot Coins while ore/block drops remain intact.
- Check EMI/JEI visibility for later machine casing mechanical crafting and Sky Steel mixing/pressing.
- Re-run after any chemistry route or recipe dump changes.

## Latent ChemLib Integration

- Added `mods/latent_chemlib-0.1.0.jar`.
- Removed retired `fission_reactor` and `gases_and_plasmas` jars from active pack content.
- Added pack-side Latent ChemLib containment recipes in `140_latent_chemlib_power_gates.js`.
- Removed recipes and client visibility for retired Create: New Age reactor blocks.
- Replaced late fission rod gates with `latent_chemlib:gas_reaction_chamber`.
- Overrode SWEM's natural horse spawn biome modifier to avoid a reproducible C2ME `CheckedThreadLocalRandom` worldgen failure during server smoke validation.
