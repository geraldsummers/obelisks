# RSS 10 GiB A/B Cluster Plan

Date: 2026-05-01

Goal: get the current repo-active Prism profile to about `10 GiB` RSS in a fresh integrated-client world, not just the main menu.

Current repo-active mod entries: `281` files in `mods/`.

Prior validated world-entry baseline:

- `docs/memory_target_findings.md` recorded `12.33 GiB` peak RSS / `12.29 GiB` final RSS after a client-created fresh world.
- That profile had already removed Abyss II, Thalassophobia, and Create Track Map.
- Menu-only results are useful for triage but are not sufficient for this target. The test marker must be `in_game`.

## Test Method

Use the existing profiler:

```bash
BTM_MAX_MEM=6000 \
BTM_MIN_MEM=2000 \
BTM_DISABLE_THP_PRCTL=1 \
MALLOC_ARENA_MAX=2 \
BTM_SETTLE_SECONDS=30 \
BTM_PROFILE_WORLD='New World' \
tools/profile_prism_variant.sh VARIANT_NAME REGEX_PATTERN ...
```

Rules:

- Every result must reach `marker=in_game`.
- Record peak RSS, post-GC RSS, loaded mod count, load time, tick-behind warnings, and block atlas size from latest.log.
- Retest any cluster that appears to save at least `0.7 GiB` because previous results were non-additive.
- Do not infer wins from jar size.
- Do not cut core design clusters permanently until they have direct world-entry evidence.

## Baseline First

### `rss_current_world_baseline`

Disable nothing.

Purpose: re-measure the current post-quest/post-structure-cleanup repo before testing cuts. Prior baseline may be stale after recent mod, config, and quest changes.

Expected: around `12 GiB` RSS if the pack shape is still similar.

## Phase 1: Low-Design-Risk / High-Prior Evidence

These are first because they either had prior empirical wins or are mostly runtime/client-effect pressure rather than progression content.

### A. Client Render / Audio / Shader Surface

Variant: `rss_cut_client_render_audio`

Patterns:

```text
DistantHorizons|oculus|AmbientSounds|PresenceFootsteps|particular|BetterGrassify|sound-physics|shoulder|controllable|controlling|ding|lighty
```

Current repo entries:

- `distant-horizons.pw.toml`
- `oculus.pw.toml`
- `ambientsounds.pw.toml`
- `presence-footsteps-forge.pw.toml`
- `particular-reforged.pw.toml`
- `bettergrassify.pw.toml`
- `sound-physics-remastered.pw.toml`
- `shoulder-surfing-reloaded.pw.toml`
- `controllable.pw.toml`
- `controlling.pw.toml`
- `ding.pw.toml`
- `lighty.pw.toml`

Evidence:

- Prior no-client-effects test was weak in the old 398-mod world-entry profile, but current pack is smaller and this cluster is still low-risk.
- Oculus/DH can amplify native/render RSS even if not the sole cause.

Risk: loses visual/audio polish and controller/QoL tools, not core progression.

Decision rule: keep as optional if win is `<0.4 GiB`; consider default-off if `>=0.7 GiB`.

### B. Physics / Weather / Destruction

Variant: `rss_cut_physics_weather_destruction`

Patterns:

```text
realistic-block-physics|realistic-physics|explosion-overhaul|Weather2|weather-storms|coroutil|finite-water|pollution-of-the-realms
```

Current repo entries:

- `realistic-block-physics.pw.toml`
- `realistic-physics.pw.toml`
- `explosion-overhaul-a-new-level-of-destruction.pw.toml`
- `weather-storms-tornadoes.pw.toml`
- `coroutil.pw.toml`
- `finite-water.pw.toml`
- `pollution-of-the-realms.pw.toml`

Evidence:

- Prior menu A/B found `Explosion Overhaul` was a real isolated win, about `0.90 GiB` below that baseline.
- Prior Weather2+CoroUtil also looked moderate, about `0.95 GiB` below that baseline.
- Physics/destruction systems are runtime-heavy and not required for recipe graph completeness.

Risk: removes environmental chaos/simulation flavor.

Decision rule: strong candidate if world-entry win is `>=0.8 GiB`.

### C. Player Revive / Death QoL

Variant: `rss_cut_player_revive_death_qol`

Patterns:

```text
playerrevive|configurable-death|keepcuriosinventory|hold-my-items
```

Current repo entries:

- `playerrevive.pw.toml`
- `configurable-death.pw.toml`
- `keepcuriosinventory.pw.toml`
- `hold-my-items-reforged.pw.toml`

Evidence:

- Prior isolated `playerrevive` menu test showed a large win in one run and a smaller repeat win. It needs current world-entry confirmation.

Risk: touches death UX and may interact with Still-Beating Heart pacing.

Decision rule: if `playerrevive` alone is the win, prefer cutting only that and keeping death configs that support pack rules.

## Phase 2: Medium-Risk Content Clusters

These can affect progression identity, but are plausible routes to 10 GiB if Phase 1 is insufficient.

### D. Food Addon Breadth

Variant: `rss_cut_food_addon_breadth`

Patterns:

```text
chefs-delight|collectors-reap|corn-delight|cravings|delightful|ends-delight|my-nethers-delight|oceans-delight|rustic-delight|ubes-delight|undergarden-delight|veggies-delight
```

Keep for this test:

- Farmer's Delight
- Farmer's Respite
- Brewin' and Chewin'
- Diet / Spice of Life / thirst stack

Evidence:

- Prior menu A/B found food addon cluster around `1.50 GiB` win.
- Food breadth creates many items, models, recipes, and quest nodes.

Risk: food is a real progression system in this pack. If cut, preserve the core food/potion graph with fewer mods.

Decision rule: likely strong if `>=0.9 GiB`; prefer a narrower “low-signal food addons” subset before permanent removal.

### E. TCon Expansion Breadth

Variant: `rss_cut_tcon_addon_breadth`

Patterns:

```text
ticex|tinker-and-better-combat|tinkers-advanced|tinkers-battle-spades|additional-weaponry|tinkers-weaponry|tinkers-ponder|tconjei
```

Keep for this test:

- `tinkers-construct.pw.toml`
- `mantle.pw.toml`

Evidence:

- Old world-entry A/B showed TCon add-ons were one of the larger single branch wins in the 398-mod profile.
- Current pack deliberately uses TCon combat/tool breadth, so this must be measured carefully.

Risk: high. TCon is a core pillar, and TiCEX is planned post-AE2.

Decision rule: if the win is large, split into two follow-up tests: `TCon combat forms` vs `TiCEX/post-AE2` vs `docs/JEI helpers`.

### F. Adventure Dimension / Boss Breadth

Variant: `rss_cut_adventure_dimension_breadth`

Patterns:

```text
aether|blue-skies|deeperdarker|fallout-wastelands|ice-and-fire|the-lost-cities|the-twilight-forest|the-undergarden|undergarden-delight|the-finley|artifacts|relics|apotheosis|apotheotic|apothic
```

Evidence:

- Old world-entry tests showed adventure dimensions were a modest win alone but important in combined cuts.
- These mods carry lots of blocks/entities/models/loot and are likely active in atlases even before travel.

Risk: high. This is an explicit adventure/progression lane.

Decision rule: only cut as a profile split or if a single low-signal member is found to dominate.

### G. Magic Breadth Beyond Blood Magic

Variant: `rss_cut_side_magic_breadth`

Patterns:

```text
ars-nouveau|botania|malum|occultism|theurgy|reliquary|tome-of-blood|dtmalum|dynamic-trees-ars
```

Keep for this test:

- `blood-magic.pw.toml`
- `kubejs-addon-blood-magic.pw.toml`

Evidence:

- Old world-entry heavy-magic cut was meaningful but design-breaking.
- Magic mods have many models, particles, guidebooks, entities, and recipes.

Risk: high. Blood Magic backbone plus Ars powerhouse is core design.

Decision rule: do not permanently remove whole cluster; use result to identify individual candidates for later A/B.

## Phase 3: Core-System Breadth Tests

These should happen only if the above cannot reach 10 GiB.

### H. Create Addon Breadth

Variant: `rss_cut_create_addon_breadth`

Patterns:

```text
create-additional-logistics|create-advanced-logistics|create-applied-kinetics|create-blocks-bogies|create-connected|create-enchantment-industry|create-misc-and-things|create-more-additions|create-more-drill-heads|create-new-age|create-power-loader|create-stuff-additions|little-logistics|alekiships
```

Keep:

- Core Create
- Create Diesel Generators
- Create Liquid Fuel
- Create Creating Space
- Create Central Kitchen if food tests keep it
- Power Grid if testing tech progression honestly
- Steam n Rails should be split separately because trains are core.

Evidence:

- Old broad Create clutter test was weak, but current Create stack is larger and more deeply wired.

Risk: high. Create is the pack's authored logistics/manufacturing backbone.

Decision rule: if weak again, stop testing Create breadth as a memory target.

### I. AE2 Addon Breadth

Variant: `rss_cut_ae2_addon_breadth`

Patterns:

```text
advancedae|ae-additions|ae2-network-analyser|ae2-things|ex-pattern-provider|merequester|modern-ae2|polymorphic-energistics
```

Keep:

- `applied-energistics-2.pw.toml`

Evidence:

- Prior menu test was not a win and may have been worse, but post-AE2 graph has grown.

Risk: medium-high. AE2 is local site intelligence and post-AE2 branching depends on this stack.

Decision rule: only revisit if Phase 1/2 fail and diagnostics show AE2 models/classes dominating.

### J. Dynamic Worldgen / Terrain / Trees

Variant: `rss_cut_dynamic_worldgen_trees`

Patterns:

```text
dynamictrees|dynamic-trees|natures-spirit|geophilic|tectonic|terrablender|lithostitched|choicetheorems|towns-and-towers|villagewalls|settlementroads
```

Evidence:

- Old Dynamic Trees cut was mostly neutral, but current world-entry logs showed repeated `SettlementRoads` network rebuilds.
- Worldgen systems can affect load time and runtime memory more than menu memory.

Risk: medium-high. Terrain/villages/pillager bases are important to exploration and distance.

Decision rule: split `settlementroads/villagewalls/ctov/towns` from `trees/terrain` if there is a measurable win.

## Phase 4: Dev/UI Recipe Surface

### K. Dev Recipe / Recipe Viewer Surface

Variant: `rss_cut_dev_recipe_ui`

Patterns:

```text
emi|jei|registry-dumper|findme|guideme|notenoughrecipebook|no-recipe-book|tconjei
```

Keep only if needed for launch:

- KubeJS and recipe runtime mods are not part of this cut.

Evidence:

- Recipe UI is expensive in heap/object count, but EMI is important for expert pack comprehension.
- Prior “base EMI re-enabled” was accepted for playability; this test establishes the cost ceiling.

Risk: high for player usability, low for actual progression logic.

Decision rule: do not remove EMI from normal expert profile unless the win is extreme; consider a dev/play profile split.

## Combined Candidate Runs

After individual tests, run direct combinations. Do not add deltas together.

Recommended combinations:

### Combo 1: Low-risk target attempt

Variant: `rss_combo_low_risk_10gb_attempt`

Clusters:

- Client render/audio/shader surface
- Physics/weather/destruction
- PlayerRevive/death QoL, if isolated win confirms

Expected: best chance to approach 10 GiB without cutting core content.

### Combo 2: Low-risk + food breadth

Variant: `rss_combo_low_risk_food_10gb_attempt`

Clusters:

- Combo 1
- Food addon breadth, keeping core food/potion stack

Expected: plausible if current baseline remains around 12.3 GiB.

### Combo 3: World-entry design split

Variant: `rss_combo_profile_split_candidate`

Clusters:

- Combo 2
- One of: TCon expansion breadth, adventure dimension breadth, side magic breadth

Expected: should get under 10 GiB if any broad content cut still has signal, but this becomes a separate profile/design decision rather than a free win.

## Current Priority Order

1. Re-measure current world-entry baseline.
2. Test `physics_weather_destruction` because prior evidence is strong and design risk is acceptable.
3. Test `client_render_audio` because it is low design risk.
4. Test `player_revive_death_qol` because prior isolated evidence was surprisingly strong.
5. Test `food_addon_breadth` because prior evidence is strong but design risk is real.
6. Test `tcon_addon_breadth` because prior old-profile evidence was strong and TiCEX/post-AE2 can be separated.
7. Test `adventure_dimension_breadth` and `side_magic_breadth` only if the target is still missed.
8. Test `create_addon_breadth`, `ae2_addon_breadth`, and `dev_recipe_ui` only after diagnostics justify touching core comprehension/progression systems.

## Expected Outcome

If the current world baseline is still around `12.3 GiB`, the most plausible route to `~10 GiB` without gutting the pack is:

- remove or profile-disable physics/weather/destruction extras,
- remove low-signal client effect/audio/render extras,
- cut only the weakest food addon breadth,
- keep Create/TCon/Blood Magic/AE2/coins/quests/trains/adventure mostly intact.

If those clusters do not save at least `2 GiB` in direct combination, then `10 GiB` integrated single-player RSS is not a free-win target for this full content profile. At that point the choice is explicit: accept a higher full-profile target, or define a leaner profile with fewer adventure/magic/TCon branches.
