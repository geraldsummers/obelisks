# Latent ChemLib Integration

Latent ChemLib replaces the retired custom `fission_reactor` and
`gases_and_plasmas` jars. It also retires Create: New Age reactor blocks from
the pack progression while keeping CNA heat pipes, heat pumps, solar heat,
Stirling, and heat API integration.

Active pack ids:

- `latent_chemlib:chemical_cloud`
- `latent_chemlib:gas_capture`
- `latent_chemlib:gas_tank`
- `latent_chemlib:gas_reaction_chamber`
- `latent_chemlib:gas_release`

The system is intentionally file-configured: ChemLib registry data seeds
numeric traits and datapack JSON can override scheduler profiles, chemical
trait curves, reaction rules, and nuclear decay rules. Gameplay should emerge
from containment, pressure, density, temperature, charge, instability,
absorption, half-life probability, and configured curve intercepts rather than
element-specific hard-coded branches.

Only Chemlib chemicals whose own matter state is `GAS` should escape inventory
or item entities into chemical clouds. Solid and liquid elements remain items;
heavy solid elements participate in the neutron economy rather than becoming
gas clouds.

Validation expectations:

- `mods/latent_chemlib-0.1.0.jar` is present.
- Retired custom jars are absent.
- CNA reactor blocks have no visible recipes.
- Late TiCEX, Protection Pixel, and Tome of Blood gates use
  `latent_chemlib:gas_reaction_chamber`.
- `node tools/validate_synthesis_pipeline.mjs` confirms the synthesis files and
  Latent coefficient/rule data are present.
- Reaction chamber agitates stored matter and applies loaded reaction rules when
  heat/state thresholds match.
- Nuclear decay is separate from generic reaction rules. The chamber evaluates
  loaded `latent_chemlib/nuclear_decay/*.json` entries once per second using
  `1 - 2^(-elapsed / half_life)` probability from representative real isotope
  half-lives.
- Homogeneous nuclear simulation is a budgeted world service. Active Latent
  machines and chemical clouds evaluate stored chemical state through the same
  decay/capture/fission logic used by item surfaces; player inventories,
  dropped item entities, and loaded block inventories are scanned with rolling
  per-dimension budgets rather than full-world tick scans.
- Nuclear budgets are configured in
  `kubejs/data/latent_chemlib/scheduler_profiles/default.json`: surface scans,
  stack evaluations, state evaluations, mutations, radiation emissions, and
  heat emissions each have separate per-second caps. Mutation is limited to one
  nuclear event per evaluated surface pass.
- Player inventory heavy-element stacks are scanned every two seconds. Decayed
  stack items become their configured daughter element item, while neutron
  economy/radiation still runs from instability. Dropped items and block
  inventories are revisited by cursor when budgets are exhausted.
- Machine chemistry emits visible gas side products where the recipe surface can
  represent them. Create mixing routes for deposit acids, dissolver parity, and
  formulaic synthesis add chance outputs such as carbon dioxide, hydrogen,
  sulfur dioxide, nitrogen dioxide, hydrogen sulfide, and oxygen. Blood Magic
  alchemy-table recipes remain single-output, so gas side products are exposed
  through Alchemical Reaction Chamber variants using the sanguine cutting-fluid
  tools.
- The current pack table has 173 generic reaction rules and 36 half-life-based
  nuclear decay rules. Stable elements are omitted; Bi-209 is included with its
  real effectively-stable half-life.
