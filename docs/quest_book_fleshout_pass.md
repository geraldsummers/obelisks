# Quest Book Flesh-Out Pass

This pass moves the quest book from a bare progression skeleton toward a playable expert-pack guide while keeping it generated from `tools/generate_expert_quest_book.mjs`.

## Added

- Quest and chapter description generation for all generated chapters.
- Custom Starting Out prose for foothold, water, food, Tinkers, TNT, Nether netherrack, grout, meltery, and three exits.
- New `food_body` chapter with 12 quests covering cutting boards, dough, canvas, stove, hydrating meals, feasts, clean water, kettle drinks, fermentation, preserved foods, and brews.
- New `village_economy` chapter with 12 quests covering Trading Post, Wares boxes/contracts/completions, furniture tools, furnished rooms, garden market, builder stock, lighting stock, and coin-tier floats.
- Villager trade backing for the new village/decor quest items so decorative sideload content is available through coin markets instead of deep mandatory crafting.

## Intent

- Starting Out remains a tutorial chapter, not a giant checklist.
- Food/water/body progression now bridges survival, route preparation, and Still-Beating Heart/Blood Magic theming.
- Villager trades and Wares are represented as crafting/economy systems.
- Decorative blocks have shallow graph depth through villages and coins, not deeper than the Create andesite tier.
- Acid Vat source remains read-only; pack-side quests and recipes only reference exposed Acid Vat items.

## Validation

- `node --check tools/generate_expert_quest_book.mjs`
- `node tools/generate_expert_quest_book.mjs`
- `node tools/validate_quest_dependencies.mjs`
- `packwiz refresh`
