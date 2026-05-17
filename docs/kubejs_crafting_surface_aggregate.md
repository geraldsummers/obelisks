# KubeJS Crafting Surface Aggregate

Date: 2026-05-16

## Scope

This document aggregates the pack's primary crafting surfaces for Forge 1.20.1
KubeJS work. It is based on the user-provided combined recipe surface map and
the repo-confirmed notes in `docs/recipe_type_capabilities.md`.

The surfaces that matter most for this pack are:

- Create
- Tinkers' Construct
- Blood Magic
- Ars Nouveau
- PneumaticCraft: Repressurized
- Vanilla and Forge recipes because Create can automate several vanilla recipe
  classes

Pack-specific interpretation:

- KubeJS recipe scripts live in `kubejs/server_scripts/`.
- Prefer direct helper APIs when they are confirmed and readable.
- Use `event.custom(...)` for JSON-first systems and for any helper whose local
  bridge support is uncertain.
- Keep all KubeJS Rhino-safe and deterministic.
- Do not invent recipe type IDs; mark unconfirmed IDs as `UNKNOWN` until runtime
  dumps or in-instance probes confirm them.

## Surface Summary

| Surface | Authoring style | Strength | Pack role | Validation posture |
| --- | --- | --- | --- | --- |
| Vanilla and Forge | `event.shaped`, `event.shapeless`, furnace helpers, `event.custom` | Basic recipes and Create-visible automation | Emergency fallbacks, simple gates, recipes Create can piggyback | Confirm no bypasses |
| Create | `event.recipes.create.*` | Mechanical, visible, multi-output processing | Bulk work, ore preprocessing, sequenced machine parts, visible chemistry | Strong helper support |
| Tinkers' Construct | helpers if present, otherwise `event.custom` | Molten legitimacy, casting, alloying | Metals, foundry gates, heat identity | Validate helper/addon support in instance |
| Blood Magic | `event.recipes.bloodmagic.*` | LP, will, ritual authority | Raw magic authority, impossible matter, life-force gates | Strong addon surface expected |
| Ars Nouveau | `event.recipes.ars_nouveau.*`, behavior JSON | Purified/stabilized magic | Source gates, glyphs, apparatus, purified Blood Magic identity | Strong addon surface expected |
| PneumaticCraft | mostly `event.custom` datapack JSON | Pressure, heat, sealed chemistry, assembly | Boards, processors, oil, gas-adjacent chemistry, high-pressure reactions | JSON-first |
| Latent ChemLib | file-based config plus KJS recipes around blocks/items | Gas, plasma, heavy element state | Volatile chemistry and nuclear traversal substrate | Recipe-facing station support still limited |

## Create

Create has the cleanest helper surface. Use it as the default visible tech
crafting layer where moving parts should matter.

| Helper / recipe source | Machine / process | Input shape | Output shape | Fluids | Chance | Cost / modifiers | Best pack use |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `event.recipes.create.mixing` | Mechanical Mixer + Basin | many items/fluids | many items/fluids | yes | yes | `.heated()`, `.superheated()` | General visible chemistry, acid/ball ore processing |
| `event.recipes.create.compacting` | Press + Basin | many items/fluids | many outputs | partial | yes | `.heated()`, `.superheated()` | Dense products, briquettes, pressure-like preforms |
| `event.recipes.create.crushing` | Crushing Wheels | 1 item/block | many items | no | yes | `.processingTime(ticks)` | Physical ore/deposit preprocessing |
| `event.recipes.create.milling` | Millstone | 1 item/block | many items | no | yes | none | Low-tier grind and soft materials |
| `event.recipes.create.cutting` | Mechanical Saw | 1 item/block | many items | no | yes | `.processingTime(ticks)` | Logs, planks, precision cuts |
| `event.recipes.create.pressing` | Mechanical Press | 1 item | many items | no | yes | none | Plates, sheets, simple forms |
| `event.recipes.create.deploying` | Deployer | base item + held item | many items | no | yes | `.keepHeldItem()` | Tool/catalyst application and staged parts |
| `event.recipes.create.filling` | Spout | item + fluid | 1 item | fluid input | no | none | Filling, coating, valid sequenced assembly step |
| `event.recipes.create.emptying` | Item Drain | 1 item | item + fluid | fluid output | no | none | Draining, container extraction |
| `event.recipes.create.splashing` | Fan washing | 1 item | many items | implicit water | yes | none | Simple wash/purification route |
| `event.recipes.create.haunting` | Fan haunting | 1 item | many items | implicit soul fire | yes | none | Spirit/corruption conversions |
| `event.recipes.create.sandpaper_polishing` | Sandpaper | 1 item | 1 item | no | limited | sandpaper item | Manual polish route |
| `event.recipes.create.mechanical_crafting` | Mechanical Crafters | shaped grid | 1 item | no | no | pattern/key | Large structural crafts |
| `event.recipes.create.sequenced_assembly` | Sequenced Assembly | start item + step chain | weighted final result | via filling step | weighted salvage | `.transitionalItem()`, `.loops()` | High-skill manufactured components |
| `event.smelting` | Furnace + Create bulk smelting visibility | 1 item | 1 item | no | no | `.xp()`, `.cookingTime()` | Vanilla piggyback only |
| `event.blasting` | Blast Furnace + bulk blasting visibility | 1 item | 1 item | no | no | `.xp()`, `.cookingTime()` | Vanilla piggyback only |
| `event.smoking` | Smoker + bulk smoking visibility | 1 item | 1 item | no | no | `.xp()`, `.cookingTime()` | Food/material piggyback only |
| `event.shapeless` | Crafting table + possible mixer piggyback | many items | 1 item | no | no | normal crafting | Simple recipes, but treat as Create-visible |
| `event.shaped` | Crafting table + possible mechanical crafter route | shaped grid | 1 item | no | no | normal crafting | Simple gates, but audit bypasses |

Design warning: vanilla recipes are not neutral in a Create pack. Smelting,
blasting, smoking, shaped, and shapeless recipes may become Create-automatable
or Create-visible, so mark them as vanilla plus Create-visible when auditing
progression.

## Tinkers' Construct

TCon owns molten legitimacy. Use it when the recipe should feel like metal,
glass, ceramic, cast tooling, or foundry heat rather than general-purpose
industrial chemistry.

| Helper / recipe type | System | Input shape | Output shape | Fluids | Chance | Cost / modifiers | Validation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `event.recipes.tconstruct.casting_table` | Casting Table | fluid + optional cast | 1 item | input | no | cooling time / cast methods | Validate helper locally |
| `event.recipes.tconstruct.casting_basin` | Casting Basin | fluid + optional cast/block | 1 item/block | input | no | cooling time / cast methods | Validate helper locally |
| `tconstruct:melting` | Melting | 1 item/block | 1 fluid | output | no | temperature/time | Confirmed recipe type |
| `tconstruct:alloying` | Smeltery alloying | many fluids | 1 fluid | in/out | no | temperature | Confirmed recipe type |
| `tconstruct:melting_fuel` | Smeltery fuel | 1 fluid | fuel behavior | input | no | temp/duration/rate | Validate schema before use |
| `table_duplication` | Cast duplication | item + fluid | copied item | input | no | cooling | `UNKNOWN` until bridge confirms |
| `basin_duplication` | Basin duplication | block/item + fluid | copied block/item | input | no | cooling | `UNKNOWN` until bridge confirms |
| `table_filling` | Table filling | item + fluid | filled item behavior | input | no | bridge-specific | `UNKNOWN` until bridge confirms |
| `basin_filling` | Basin filling | item/block + fluid | filled block/item behavior | input | no | bridge-specific | `UNKNOWN` until bridge confirms |
| `molding_table` | Mold/cast creation | material + pattern/cast-ish item | mold/cast item | maybe | no | bridge-specific | `UNKNOWN` until bridge confirms |

Repo-confirmed TCon recipe types include `tconstruct:melting`,
`tconstruct:alloying`, `tconstruct:casting_table`,
`tconstruct:casting_basin`, `tconstruct:material`,
`tconstruct:part_builder`, `tconstruct:tinker_station`, and
`tconstruct:severing`.

## Blood Magic

Blood Magic owns raw authority, LP cost, will, impossible bonds, and dangerous
transformation. It should not become a generic replacement for tech processing;
in the synthesis pipeline it is the manual, high-yield, non-throughput
alternative to automatable machinery. Damageable Blood alchemy inputs lose one
durability per craft, which makes itemized magic-acid cutting fluids a strong
fit for repeated manual ore cuts.

| Helper | System | Input shape | Output shape | Fluids | Chance | Cost / modifiers | Best pack use |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `event.recipes.bloodmagic.altar(output, input)` | Blood Altar | 1 item | 1 item | no | no | `.upgradeLevel(int)`, `.altarSyphon(int)`, `.consumptionRate(int)`, `.drainRate(int)` | LP-gated authority and orb-tier transformations |
| `event.recipes.bloodmagic.array(output, baseInput, addedInput)` | Arcane Ashes / Arrays | base item + added item | 1 item | no | no | `.texture(string)` | Ground ritual crafts |
| `event.recipes.bloodmagic.soulforge(output, input)` | Hellfire Forge | many item inputs | 1 item | no | no | `.drain(double)`, `.minimumDrain(double)` | Demon will crafts; avoid new broad chains for now |
| `event.recipes.bloodmagic.arc(output, input, tool)` | Alchemical Reaction Chamber | item + tool/catalyst | 1 item | maybe | unclear | `.consumeIngredient(boolean)` | Validate fluid argument in instance |
| `event.recipes.bloodmagic.alchemytable(output, inputs[])` | Alchemy Table | many item inputs | 1 item | no | no | `.syphon(int)`, `.ticks(int)`, `.upgradeLevel(int)` | LP + time + tier gates |

Repo-confirmed Blood Magic recipe types include `bloodmagic:altar`,
`bloodmagic:alchemytable`, `bloodmagic:array`, `bloodmagic:arc`,
`bloodmagic:soulforge`, and `bloodmagic:meteor`.

## Ars Nouveau

Ars is purified Blood Magic in the pack fiction. Use it for stabilized source,
glyph work, controlled apparatus rituals, and purified catalysts.

| Helper / recipe type | System | Input shape | Output shape | Fluids | Chance | Cost / modifiers | Best pack use |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `event.recipes.ars_nouveau.enchanting_apparatus` | Enchanting Apparatus | pedestal items + central reagent | 1 item | no | no | source cost, keep NBT | Main purified ritual craft |
| `event.recipes.ars_nouveau.enchantment` | Apparatus enchantment | pedestal items + enchant target context | enchantment application | no | no | source cost, level | Magical enhancement gates |
| `event.recipes.ars_nouveau.imbuement` | Imbuement Chamber | 1 input + optional pedestal items | 1 item | no | no | source cost / duration | Infusion and purified catalysts |
| `event.recipes.ars_nouveau.crush` | Crush glyph behavior | 1 item/block/entity-item input | loot-style outputs | no | yes | drop/world flags | Magical breaking and conversion |
| `event.recipes.ars_nouveau.glyph` | Glyph craft/unlock | many item inputs | 1 glyph item | no | no | XP cost | Spell unlock economy |
| `event.recipes.ars_nouveau.caster_tome` | Caster Tome definition | spell glyph list + metadata | tome definition/result | no | no | name, description, color, sound | Tome definitions and controlled spell packs |
| `ars_nouveau:summon_ritual` via `event.custom` | Summoning ritual | augment item/tag | entity spawn behavior | no | weighted mobs | count/weight | Behavior definition |
| `ars_nouveau:scry_ritual` via `event.custom` | Scry ritual | augment item/tag | highlighted block tag | no | no | tag mapping | Discovery/scanning gate |
| `ars_nouveau:dispel_entity` via `event.custom` | Dispel glyph loot | entity + conditions | loot table output | no | loot table logic | predicates | Entity purification/loot |
| `ars_nouveau:budding_conversion` via `event.custom` | Amethyst Golem conversion | block | block | no | no | none | Block conversion |

Repo-confirmed Ars recipe types include `ars_nouveau:imbuement`,
`ars_nouveau:enchanting_apparatus`, `ars_nouveau:book_upgrade`,
`ars_nouveau:glyph`, `ars_nouveau:spell_write`, and `ars_nouveau:crush`.

## PneumaticCraft: Repressurized

PNCR is JSON-first for this pack unless a helper is proven locally. It owns
pressure, heat, refinery work, assembly, sealed processing, and gas-adjacent
chemistry.

| Recipe type / system | PNCR system | Input shape | Output shape | Fluids | Chance | Cost / modifiers | Best pack use |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `pneumaticcraft:pressure_chamber` | Pressure Chamber | many item inputs | many item outputs | no | no | minimum pressure | Core pressure-gated craft |
| `pneumaticcraft:explosion_crafting` | Explosion crafting | 1 item | many item outputs | no | loss rate | explosion / loss | Dangerous conversion |
| `pneumaticcraft:assembly_laser` | Assembly Line laser | 1 item | 1 item | no | no | machine pressure indirectly | Precision part route |
| `pneumaticcraft:assembly_drill` | Assembly Line drill | 1 item | 1 item | no | no | machine pressure indirectly | Precision part route |
| `pneumaticcraft:refinery` | Refinery | 1 fluid | 2-4 fluids | in/out | no | heat range | Oil fractioning |
| `pneumaticcraft:thermo_plant` | Thermopneumatic Processing Plant | fluid and/or item | fluid and/or item | yes | no | pressure, temp, speed, exothermic | Chemical reactor |
| `pneumaticcraft:fluid_mixer` | Fluid Mixer | 2 fluids | fluid and/or item | in/out | no | pressure, time | Two-fluid reactions |
| `pneumaticcraft:heat_frame_cooling` | Heat Frame | item or fluid container | item | possible | bonus possible | max temperature, bonus cap | Cooling and solidifying |
| `pneumaticcraft:fuel_quality` | Fuel quality | 1 fluid | fuel behavior | input | no | air produced, burn rate | Liquid compressor tuning |
| `pneumaticcraft:heat_properties` | Heat behavior | block/blockstate/fluid-ish target | thermal behavior/transforms | sometimes | no | temp, resistance, heat capacity | Heat-world integration |
| `pneumaticcraft:amadron` | Amadron trades | trade input | trade output | items/fluids | no | trade definition | Market route |
| `pneumaticcraft:experience_fluid` | XP fluid definition | fluid | XP behavior | fluid | no | XP equivalence | XP compatibility |

Use `event.custom({...})` as the default PNCR authoring path and validate
schemas with recipe dumps or runtime load logs.

## Latent ChemLib

Latent ChemLib is not a normal recipe surface yet. It is a stateful simulation
surface that KubeJS should wire around.

| Surface | Authoring path | Current role | Missing bridge |
| --- | --- | --- | --- |
| Chemical traits | `kubejs/data/latent_chemlib/chemical_traits/**` | Defines volatile/heavy/gas behavior data | Needs complete periodic coverage |
| Scheduler profiles | `kubejs/data/latent_chemlib/scheduler_profiles/**` | Tick budget and simulation behavior | Needs pack tuning after runtime testing |
| Gas capture/release/storage blocks | normal recipes plus mod behavior | Containment and transport of gas state | Needs recipe-visible gas contents |
| Reaction chamber | normal recipes plus mod behavior | Agitation and high-energy chemistry substrate | Needs product mutation recipes |
| Heavy element behavior | traits plus mod behavior | Radiation/neutron economy substrate | Needs productive transmutation/decay graph |

Do not consume ordinary gas items heavily in late recipes once Latent gas escape
is active. Prefer captured state, PNCR sealed reactions, or explicit container
forms when the bridge exists.

## Shape Index

| Interface | Best surfaces |
| --- | --- |
| 1 item/block -> 1 item | Create pressing/polishing, vanilla furnace helpers, Blood altar, PNCR assembly, Ars imbuement |
| 1 item/block -> many item outputs | Create crushing/milling/cutting/splashing/haunting, PNCR explosion crafting, Ars crush |
| many items -> 1 item | Create mechanical crafting/shaped/shapeless/mixing/compacting, Blood alchemy table/soulforge, Ars glyph/apparatus, PNCR pressure chamber |
| many items -> many items | Create mixing/compacting/sequenced assembly, PNCR pressure chamber |
| item + item/tool/cast -> item | Create deploying, TCon casting, Blood array/ARC, Ars apparatus |
| item + fluid -> item | Create filling, TCon casting, PNCR thermo plant/heat frame, possible Blood ARC |
| item -> item + fluid | Create emptying, PNCR thermo plant where schema allows |
| item/block -> fluid | TCon melting, PNCR thermo plant where schema allows |
| fluids -> fluid | TCon alloying, Create mixing, PNCR fluid mixer/refinery |
| 1 fluid -> many fluids | PNCR refinery |
| fluid + item -> fluid and/or item | PNCR thermo plant, Create mixing/compacting/filling, TCon casting |
| staged/state-machine crafting | Create sequenced assembly, PNCR assembly line concept, Ars apparatus rituals, Blood altar progress |
| behavior-definition recipes | Ars ritual/behavior recipes, PNCR fuel/heat/Amadron/XP recipes, TCon melting fuel |

## Pack Pillar Ownership

| Interface | Primary owner | Secondary owner | Notes |
| --- | --- | --- | --- |
| Mechanical item processing | Create | PNCR assembly for precision | Visible movement should matter |
| Multi-output ore preprocessing | Create | Blood Magic cutting as magic alternative | Physical route before chemical interpretation |
| Acid/ball ore chemistry | Create mixing | PNCR for sealed/high-pressure follow-up | Acid changes family; ball changes ratios and retention |
| Molten material legitimacy | TCon | Create only for industrial mixtures | TCon should own casts, melts, and metal seriousness |
| Alloying | TCon | Create mixing where deliberately industrial/chemical | Do not let cheap mixer routes flatten foundry identity |
| Pressure + heat chemistry | PNCR | Latent ChemLib for volatile state | Airtight tier and above |
| Oil/fuel fractioning | PNCR refinery | Create Diesel Generators only burns fuels | CDG refining blocks stay hidden/removed |
| Magic source gates | Ars Nouveau | Blood Magic as parent fiction | Ars is purified Blood Magic |
| Blood/LP/will gates | Blood Magic | Ars only after purification | Raw authority and impossible matter |
| Manufactured components | Create sequenced assembly | PNCR assembly for boards/processors | Use sequenced assembly for tactile multi-step parts |
| Volatile gases/plasma | Latent ChemLib | PNCR sealed processing | Must be stateful, not ordinary item spam |
| Nuclear/heavy element traversal | Latent ChemLib | CNA heat/electrical parts only | CNA reactor blocks stay disabled |
| Messy slurry/byproduct chains | Create + PNCR | Acid Vat only if explicitly reintroduced | Acid Vat is not current default progression |

## Current Design Implications

- Casing progression should use multiple surfaces per tier rather than a single
  static craft: Create assembly, TCon molten work, PNCR pressure, Blood/Ars
  authority, and AE2/OC2R logistics should all appear where appropriate.
- Ore chemistry should remain on Create mixing for the visible acid + grinding
  ball interface, with PNCR taking over where pressure, sealed gases, high heat,
  or refined chemical control is the point.
- Harder acids should unlock new product families and machine capabilities
  without making earlier acids obsolete.
- Gas and plasma recipes should be delayed until Latent ChemLib has a
  recipe-visible containment bridge, or they should consume explicit sealed
  containers rather than loose gas items.
- TCon helper availability must be validated before a large TCon rewrite. Raw
  `event.custom` recipes are the fallback.
