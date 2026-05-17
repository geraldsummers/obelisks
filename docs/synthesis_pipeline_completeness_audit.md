# Synthesis Pipeline Completeness Audit

Date: 2026-05-16

## Verdict

The synthesis pipeline is complete for the current installed synthesis surfaces.

It now has working breadth across ore chemistry, Create, PNCR, Blood Magic, Ars
Nouveau, and Latent ChemLib. Completeness is measured against the installed
pack, not an imagined chemistry universe: all current ChemLib family compounds
with usable item IDs are either covered by the formulaic family routes or by a
special molecular route.

## Coverage Counts

- Ore matrix deposits: 21
- Ore solvents/acids: 6
- Grinding balls: 8
- Intended ore mixer combinations: 1008
- Alchemistry dissolver routes ported to Create mixer: 1386
- Dissolver-port acid families used: 5
- Dissolver-port grinding ball families used: 7
- Invalid dissolver-port routes: 0
- Alchemistry/AlchemyLib still installed: no
- Missing ore matrix IDs: 0
- Missing ball retention cells: 0
- Minimum unique solvent outputs per ore: 5
- Average unique solvent outputs per ore: 5.48
- Minimum unique ball-biased outputs per ore: 6
- Average unique ball-biased outputs per ore: 7.43
- Minimum retention spread by solvent: 0.16
- Missing critical hard/exotic ore outputs: 0
- Formulaic element/family candidates: 256
- Formulaic candidates resolvable against current Chemlib/KubeJS items: 112
- Installed ChemLib family compounds audited: 117
- Installed ChemLib family compounds covered: 117
- Installed ChemLib family compounds missing routes: 0
- Special molecular family compounds covered outside formulaic routes: 8
- Blood oxide reduction candidates: 21
- Blood crushed-deposit manual alternatives: 84
- Blood manual high-yield markers: 6/6
- Blood itemized magic-acid cutting fluids: 5/5
- Ars synthesis/stabilization routes: 5
- Latent reaction rules: 173
- Latent nuclear decay rules: 36
- Latent rule tick-budget cap: 240
- Latent fusion/capture rules: 56/117
- Latent reaction rule missing IDs: 0
- Latent nuclear decay missing IDs: 0

## Identity And Sanity Failures

- none

## Formulaic Gaps By Family

- carbonate: 14 unresolved candidates
- chloride: 20 unresolved candidates
- sulfate: 13 unresolved candidates
- sulfide: 24 unresolved candidates
- phosphate: 32 unresolved candidates
- oxide: 11 unresolved candidates
- hydroxide: 17 unresolved candidates
- nitrate: 13 unresolved candidates

## Missing Installed Family Compounds

- none

## Missing Latent Rule IDs

- none

## Missing Latent Nuclear Decay IDs

- none

## Audit Findings

- Ore acid/ball coverage is complete at the table level: every deposit has every
  solvent and every ball.
- Acid identity is not flat: each deposit has at least four distinct
  solvent-selected outputs, and the average is 5.48.
- Ball identity is not flat: each deposit has at least five distinct
  ball-biased output choices, and retention changes per acid/ball pair.
- Hard and rare deposits expose unique power outputs such as beryllium,
  tungsten, titanium, uranium/thorium, platinum/palladium, gallium, vanadium,
  fluorine, AE2 crystals, diamond, and emerald.
- Grinding ball retention is complete per solvent and per ball.
- Ore outputs are registry-backed and avoid new one-off intermediates in the
  mixer matrix.
- Alchemistry dissolver semantics are ported into 1386
  Create mixing routes that require a selected acid/solvent and grinding ball;
  Alchemistry and AlchemyLib packwiz entries are removed.
- Acid production has a progression ladder from biological/basic solvent work
  through sulfur, chlorine, nitrogen oxide, and phosphate chemistry instead of a
  single best universal acid.
- PNCR boosted formulaic routes consume the relevant acid fluid in the thermo
  plant instead of bypassing the acid ladder through item-only pressure chamber
  recipes.
- Blood Magic provides manual high-yield alternatives for ore cutting, hard/rare
  fraction extraction, and oxide reduction where target items exist; those
  routes consume durability from itemized magic-acid cutting fluids.
- Ars Nouveau covers purified crystal/source routes and sealed-cell
  stabilization.
- Loose gas item inputs in the molecular KubeJS pass: none.
- Latent ChemLib rules now define a broad periodic traversal: high-energy
  fusion jumps through the lower/mid table, adjacent capture steps across the
  installed periodic table. Nuclear decay is in a separate real-half-life table
  so heavy elements decay by representative isotope half-life rather than
  generic reaction thresholds.

## Known Boundary

- Generic KubeJS recipes cannot inspect sealed-cell NBT. Exact gas identity
  belongs to Latent ChemLib machine state and reaction rules; KubeJS recipes use
  sealed cells as the containment gate.
