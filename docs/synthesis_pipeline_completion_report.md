# Synthesis Pipeline Completion Report

Date: 2026-05-16

## Summary

The synthesis pipeline now has a concrete implementation bridge across tech,
magic, and Latent ChemLib state.

Implemented in this pass:

- Latent ChemLib sealed chemical cells.
- Machine state transfer through sealed cells.
- Reaction chamber rule loading from datapack JSON.
- Reaction chamber CNA heat buffer.
- Pack-authored periodic traversal rules for fusion, capture, and heavy decay.
- Create/PNCR formulaic molecular family routes.
- Alchemistry dissolver parity ported to Create mixer + acid + grinding ball
  routes, with Alchemistry and AlchemyLib removed from the pack manifest.
- Blood Magic manual high-yield synthesis alternatives.
- Itemized, durability-based magic-acid cutting fluids for Blood synthesis.
- Ars Nouveau purified crystal/source alternatives.
- Validation coverage for the new synthesis files.

This does not make ordinary KubeJS recipes chemically inspect sealed-cell NBT.
That remains a hard limitation of generic recipe ingredients. Exact gas identity
belongs in Latent ChemLib reaction rules; KubeJS recipes use sealed cells as the
immersive containment gate.

## Process Ownership

- Create owns broad visible salt, oxide, carbonate, hydroxide, sulfide, and
  acid-family mixing, including the former Alchemistry dissolver decomposition
  surface.
- PNCR owns pressure-and-heat boosted chloride, nitrate, and sulfate yields
  through thermo plant routes that still consume the relevant acid fluid.
- Blood Magic owns life-force reductions, crushed-deposit cutting, and trace
  extraction alternatives.
- Ars Nouveau owns purified crystal, source-stabilized, and resonance routes.
- Latent ChemLib owns sealed gas/plasma/heavy-element state and productive
  high-energy reaction rules.

## Magic Alternatives

Magic routes are intentionally not passive industrial throughput. Tech stays the
automatable backbone; Blood Magic is the manual, high-yield route for players
who are willing to spend LP, slate tier, and direct attention.

- Blood alchemy charges ChemLib acids into damageable cutting-fluid items using
  Blood Magic's own cutting fluids as the reusable vessel.
- Blood alchemy turns selected oxides back into four elements using LP, slate,
  and sulfuric cutting-fluid durability.
- Blood alchemy can cut crushed Realistic Ores deposits into high-count primary
  products, trace products, hard fractions, and rare fractions at LP/time cost;
  each route spends one use from a matching magic-acid cutting fluid.
- Ars imbuement handles quartz/silica, beryl/beryllium, and AE-compatible
  crystal resonance.
- Ars apparatus can stabilize sealed chemical cells as a source-and-slate ritual
  rather than a machine-only operation.

## Latent Bridge

Latent ChemLib now has a real item bridge:

- `latent_chemlib:sealed_chemical_cell`
- Empty cells can be filled from machine storage.
- Filled cells can drain into compatible machine storage.
- Gas capture still pulls clouds into internal storage.
- Gas release still emits internal storage as a cloud.
- Reaction chamber agitates stored matter and applies loaded reaction rules when
  heat/state thresholds match.
- Loose ChemLib chemicals only become clouds when Chemlib marks their matter
  state as `GAS`; solid and liquid elements stay itemized.

Reaction rules now cover:

- 56 high-energy fusion jumps through lower and mid-table elements,
- 117 adjacent neutron-capture style transmutation steps across the installed
  ChemLib periodic table,
- 36 half-life-based nuclear decay steps in
  `kubejs/data/latent_chemlib/nuclear_decay/default.json`,
- a 240-rule validation cap so the Latent machine rule scan stays within the
  intended tick budget.

## Validation

New validator:

- `node tools/validate_synthesis_pipeline.mjs`

Expected checks:

- ore acid/ball loops remain complete,
- Alchemistry dissolver parity remains on Create mixing and the Alchemistry
  pack entries stay removed,
- sealed-cell gas bridge is present,
- formulaic synthesis routes include Create, PNCR, Blood Magic, and Ars,
- sealed chemical cell recipe exists,
- Latent reaction rules span fusion/capture and nuclear decay is owned by the
  separate real-half-life decay table,
- Latent coefficient groups are present.
