# Magic Gate Recipe Audit

Scope: `kubejs` magic gate scripts, Blood Magic heart/orb flow, and quest chapter alignment.

## Files Reviewed

- `kubejs/server_scripts/30_recipe_replace/80_magic_progression_blood_slate_gates.js`
- `kubejs/server_scripts/30_recipe_replace/125_magic_power_spike_gates.js`
- `kubejs/server_scripts/30_recipe_replace/166_tome_of_blood_post_ae2_gates.js`
- `kubejs/server_scripts/40_recipe_add/40_blood_orbs_from_still_beating_hearts.js`
- `kubejs/startup_scripts/20_globals/30_blood_heart_types.js`
- `kubejs/client_scripts/10_blood_orb_heart_requirements_tooltips.js`
- `config/ftbquests/quests/chapters/magic_i.snbt`
- `config/ftbquests/quests/chapters/magic_ii.snbt`
- `config/ftbquests/quests/chapters/tome_of_blood.snbt`
- `config/ftbquests/quests/chapters/death.snbt`
- `config/ftbquests/quests/chapters/major_gates.snbt`

## Current Gate Model

- Slate ladder is consistently defined as T1..T5 (`blank`, `reinforced`, `infused`, `demonic`, `ethereal`) in both magic gate layers.
- Entry gates (`80_magic_progression_blood_slate_gates.js`) replace specific key ingredients on workstation unlock recipes.
- Power-spike gates (`125_magic_power_spike_gates.js`) broadly replace common valuables (diamond/emerald/redstone/lapis/gold/amethyst/glowstone variants) on operational magic outputs.
- Post-AE2 Tome of Blood recipes are explicit and all anchored to `bloodmagic:etherealslate` plus AE2/AAE2/fission components.

## Blood Orb + Heart Constraints

- Base Blood Magic orb altar recipes are removed and replaced with typed-heart altar recipes in `40_blood_orbs_from_still_beating_hearts.js`.
- Typed hearts are gated by catalyst and constraints in `30_blood_heart_types.js`:
  - Weak: sacrificial dagger catalyst.
  - Apprentice: weak orb catalyst + level 10.
  - Magician: apprentice orb catalyst + ritual tier 2 + level 20 + hemostasis 20.
  - Master: magician orb catalyst + ritual tier 3 + level 30 + hemostasis 28 + wither death cause.
  - Archmage: master orb catalyst + ritual tier 4 + level 40 + End dimension + hemostasis 36.
- Tooltips communicate the intended typed-heart progression and explicitly discourage bulk-heart farming.

## Quest Alignment

- `magic_i.snbt` has explicit milestone chain for all slate tiers through Ethereal.
- `major_gates.snbt` includes Blood Magic milestone keyed to Ethereal Slate.
- `tome_of_blood.snbt` correctly depends on Ethereal Slate and post-AE2 branch prerequisites.
- `death.snbt` currently tracks Still-Beating Heart -> Weak Blood Heart -> Weak Blood Orb, but does not mirror higher typed-heart/orb constraints (level, hemostasis, wither death, End dimension).

## Findings

1. Slate gating is structurally coherent across magic entry, spike, and post-AE2 magic branches.
2. Blood orb production is strongly constrained by heart typing and RPG/death conditions, not by default altar throughput.
3. Late magic recipes are slate-heavy, but orb items are mostly progression catalysts and are not reused as broad late-branch recipe catalysts.
4. Cleric trade stock now keeps only Blank Slate as a low-tier ritual convenience. Reinforced, Imbued, Demon, and Ethereal Slates remain altar-authored progression materials.

## Blood Orb Catalyst Opportunities

- Opportunity A: Use orb-tier catalysts in selected late hybrid recipes (especially post-AE2 magic branch conversions) to keep orb relevance beyond heart-channeling.
- Opportunity B: Tie additional quest checks to higher typed hearts/orbs so quest progression reflects hemostasis, death-cause, and dimension constraints already enforced in scripts.
- Opportunity C: Add selected high-tier orb catalysts to late hybrid recipes if orb relevance needs more pressure beyond heart-channeling.

## Risk Notes

- Because orb recipes replace defaults globally, missing/disabled RPGStats or Blood Magic KubeJS altar API would suppress intended orb path (script already warns and exits).
- Existing quest text implies deep heart constraints but only explicitly tracks weak-orb path in `death.snbt`.

## Audit Outcome

- High-tier cleric slate trades were removed from `10_coin_villager_trades.js` during the completeness pass.
- Gate architecture is consistent and intentional.
- Primary remaining pressure point is quest visibility for high-tier heart constraints if quest content is restored later.
