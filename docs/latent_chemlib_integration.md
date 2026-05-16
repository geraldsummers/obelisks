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
numeric traits and datapack JSON can override scheduler profiles and chemical
trait curves. Gameplay should emerge from containment, pressure, density,
temperature, charge, instability, absorption, and configured curve intercepts
rather than element-specific hard-coded branches.

Validation expectations:

- `mods/latent_chemlib-0.1.0.jar` is present.
- Retired custom jars are absent.
- CNA reactor blocks have no visible recipes.
- Late TiCEX, Protection Pixel, and Tome of Blood gates use
  `latent_chemlib:gas_reaction_chamber`.
