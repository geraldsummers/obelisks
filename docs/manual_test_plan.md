# Manual Test Plan

Run these checks in a disposable Prism instance built from this branch. Static validation has already covered syntax and generated quest dependencies; this plan is for runtime behavior, UI visibility, and balance sanity.

## Load And Reload

1. Launch a fresh instance and create a new world.
2. Run `/reload` once after joining.
3. Check `logs/latest.log` for KubeJS errors from recipe, loot, villager trade, and quest-related scripts.
4. Confirm FTB Quests opens without chapter parse errors.
5. Confirm EMI/JEI finishes indexing recipes.

## Starting Progression

1. Verify `tconstruct:grout` requires netherrack and does not require Create mixing.
2. Verify `tconstruct:nether_grout` is made through Create mixing.
3. Verify `create:andesite_alloy` has no shaped, shapeless, Create mixing, or Create compacting bypass.
4. Verify `create:andesite_alloy` is available through TCon alloying only.
5. Verify `create:hand_crank`, `create:millstone`, and `create:deployer` sit after andesite alloy in the visible recipe path.
6. Verify `create:andesite_casing` is made by deployer assembly only.
7. Verify `create:water_wheel` and `create:windmill_bearing` require `create:andesite_casing`.
8. Verify gravel-to-gunpowder and early TNT are visible and cheap enough to matter.

## Ore And Deposit Processing

1. Verify starter deposit blocks smelt or blast only into poor fallback outputs.
2. Verify starter deposit blocks can be crushed into Realistic Ores crushed deposit items.
3. Verify crushed starter deposits can be washed into Create/ChemLib concentrates where supported.
4. Verify supported deposit concentrates can enter the Create acid-ball identity path once the chemistry route lands.
5. Verify unsupported outputs are missing cleanly rather than producing invented items or fluids.
6. Verify vanilla-style ore blocks do not become the best early source of iron, copper, gold, redstone, lapis, diamond, emerald, or amethyst.

## Plates And Manufactured Components

1. Verify common ingot-heavy machine recipes prefer plates, sheets, rods, gears, or modded components where the graph supports them.
2. Verify ChemLib plates used by KubeJS recipes are makeable through Create pressing or TCon casting routes.
3. Verify decorative block recipes have only shallow graph depth and can be sideloaded through trades where appropriate.
4. Verify no recipe silently requires a disabled or missing plate item.

## Machine Casings

1. Verify each casing recipe is visible from seared through AE2.
2. Verify `kubejs:seared_machine_casing` uses TCon seared materials.
3. Verify `kubejs:scorched_machine_casing` requires the seared casing tier.
4. Verify `kubejs:andesite_machine_casing` requires Create andesite infrastructure.
5. Verify `kubejs:brass_machine_casing` uses Create mechanical crafting.
6. Verify `kubejs:electrical_machine_casing` uses Create mechanical crafting and includes Create Power Grid complexity.
7. Verify `kubejs:circuited_machine_casing` uses Create mechanical crafting and includes OC2R complexity.
8. Verify `kubejs:space_machine_casing` uses Create mechanical crafting and includes Creating Space complexity.
9. Verify `kubejs:sky_steel_ingot` is made by heated Create mixing.
10. Verify `kubejs:sky_steel_sheet` is made by Create pressing.
11. Verify `kubejs:impossible_machine_casing` uses Create mechanical crafting, Sky Steel sheets, AE2 cable/processor infrastructure, and does not require `ae2:controller`.

## Magic And Hearts

1. Convert a Still-Beating Heart into `kubejs:weak_blood_heart` with the configured catalyst.
2. Use the heart route to make the Weak Blood Orb.
3. Verify Blood Orbs act as non-consumed catalysts where configured.
4. Verify Blood Magic slates gate magic workstation/core recipes by tier.
5. Verify guidebooks are not gated unless there is no better entry item.
6. Verify major magic mods do not bypass the Blood Magic tier assigned in the quest book.

## Quest Book

1. Confirm the quest book has 19 generated chapters.
2. Confirm all chapter descriptions render correctly in FTB Quests.
3. Confirm Starting Out is readable as a tutorial path, not a flat checklist.
4. Confirm Starting Out quests reward only 16 Copper Coins.
5. Confirm non-starting chapters reward cumulative 4-coin bundles for their assigned difficulty tier.
6. Confirm quest dependencies do not expose late branches before their intended prerequisite chapters.
7. Confirm the Village Economy chapter explains villager trades, Wares contracts, and coin usage.
8. Confirm Create, TCon, Magic, Synthesis, Space, AE2, and Post-AE2 chapters each communicate what recipes to inspect next.
9. Confirm the onboarding-complete visibility hook is either functioning or clearly documented as pending until the onboarding mod exposes it.

## Villagers, Wares, And Coins

1. Give yourself every Dot Coin item and verify none show a disabled or server-disabled tooltip.
2. Spawn each vanilla villager profession and verify trades use Dot Coins instead of emeralds.
3. Spawn a wandering trader and verify both trade pools use Dot Coins.
4. Check high-tier trades and verify they are convenience, recovery, adventure, decor, or sideload rewards rather than mandatory progression skips.
5. Verify Wares contracts no longer use emerald pricing once Wares datapack/config hooks are loaded.
6. Verify village economy trades provide low-friction market access without trivializing production.

## Loot Economy

1. Open representative village, bonus, mineshaft, ruined portal, shipwreck, desert pyramid, jungle temple, simple dungeon, and woodland mansion chests.
2. Verify emerald-as-currency entries in non-block loot are replaced with Dot Coin tiers.
3. Verify emerald ore/block drops remain intact and are not converted to Dot Coins.
4. Verify low and mid coin tiers appear in world loot at sensible rates.
5. Verify Artifacts and Sophisticated Backpacks injection loot does not flood early overworld chests.
6. Verify Apotheosis rogue spawner valuable chests contain bounded coins/supplies instead of random gems, affix items, or diamond gear.
7. Kill an Apotheosis treasure goblin and verify it drops bounded coins/supplies instead of random affix gear and gems.
8. Open Apotheotic Additions themed spawner chests and verify `apotheosis:gem_dust` and `apotheosis:gem_fused_slate` do not appear too early.
9. Check End City and Twilight Forest structure loot and verify high-value affix/gem loot appears only at reduced intended rates.

## Extreme Y-Band Rewards

1. In a fresh generated world, confirm ADLODS mountain deposits for emerald, ruby, sapphire, and topaz only appear in high terrain.
2. Confirm platinum, palladium, rhodium, ruthenium, and diamond deposits only appear in deepslate-depth bands and are not air-exposed.
3. Confirm uranium, thorium, osmium, and iridium deposits only appear in lava-depth bands and are not air-exposed.
4. Confirm ancient debris ADLODS deposits only appear in the Nether low band and are not air-exposed.
5. Confirm vanilla ADLODS singleton generation is disabled for `diamond_ore`, `emerald_ore`, and `ancient_debris`.
6. Confirm Ice and Fire sapphire generation is disabled and sapphire comes from the mountain-height ADLODS path.
7. Inspect EMI/JEI recipes under `kubejs:extreme_y_rewards/*` and verify mountain, deepslate, and lava-depth materials appear in intended reward recipes.

## High-Value Bypass Checks

1. Verify `sophisticatedbackpacks:infinity_upgrade`, `sophisticatedbackpacks:survival_infinity_upgrade`, `sophisticatedstorage:infinity_upgrade`, and `expatternprovider:infinity_cell` have no crafting recipe.
2. Verify `advanced_ae:flight_card` and `advanced_ae:flight_drift_card` have no crafting recipe.
3. Verify Create Power Loader chunk loaders require Power Grid or OC2R machine casings.
4. Verify Building Gadgets are gated by Power Grid, OC2R, or Space casing depending on power level.
5. Verify AE2 addon wireless, requester, extended pattern, and high-storage items require OC2R, AE2, or Space casing as configured.
6. Verify Compact Machines and dimension-style systems cannot create a block economy violation or global logistics bypass before the intended post-AE2 branch.

## Regression Targets

1. Generate a new world and verify world creation does not hang near 57%.
2. If world generation hangs, capture the last 200 lines of `logs/latest.log` and the latest crash report.
3. Re-run `/reload` after entering the world and verify the reload completes.
4. Re-open EMI/JEI and verify recipe categories still index after reload.
5. Confirm packwiz metadata matches changed files after `packwiz refresh`.

## Nuclear Synthesis And Power

1. Verify the pack loads with `latent_chemlib-0.1.0.jar` present and the retired gas/fission jars absent.
2. Verify `latent_chemlib:gas_capture`, `gas_tank`, `gas_reaction_chamber`, and `gas_release` use Create mechanical crafting.
3. Verify CNA reactor blocks have no visible recipes and are hidden from EMI/JEI.
4. Verify gas items escape unsafe storage but remain controllable through Latent ChemLib containment.
5. Verify high-energy matter and neutron effects are budgeted and do not burst catch up after budget exhaustion.
6. Verify the FTB Quests electricity chapter still teaches heat/electric infrastructure without CNA reactor progression.
7. Verify the new `Platinum Tier - Latent ChemLib` chapter appears and stays hidden behind AE2/chemistry prerequisites where expected.
