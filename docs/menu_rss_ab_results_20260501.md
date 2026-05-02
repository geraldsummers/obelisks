# Menu RSS A/B Results - 2026-05-01

Method: Prism menu-only launch, no `--world`, `Xmx6G`, `Xms2G`, NMT enabled, `MALLOC_ARENA_MAX=2`, THP disabled for child process, fixed 300 second sampling window where the run stayed alive. Metric is process RSS at main menu/resource-loaded state, not in-world TPS/FPS.

| Variant | Status | Disabled jars | Loaded mods | Peak RSS | Delta vs baseline | Post-GC Java RSS | Post-GC delta | Interpretation |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `baseline` | `sampled_timeout` | 0 | 356 | 10.50 GiB | baseline | 9.65 GiB | baseline | Full current pack |
| `tcon_addons` | `sampled_timeout` | 10 | 346 | 8.74 GiB | -1.76 GiB | 8.52 GiB | -1.13 GiB | Cut all TCon add-ons; keep TConstruct and Mantle |
| `ticex_only` | `sampled_timeout` | 1 | 355 | 9.72 GiB | -0.78 GiB | 8.76 GiB | -0.89 GiB | Cut only TiCEX |
| `tcon_advanced_docs` | `sampled_timeout` | 5 | 351 | 9.86 GiB | -0.64 GiB | 9.07 GiB | -0.58 GiB | Cut etstlib, Tinkers Advanced core/tools, Tinkers Ponder, TConJEI |
| `tcon_weapon_addons` | `sampled_timeout` | 4 | 352 | 11.19 GiB | +0.70 GiB | 10.42 GiB | +0.76 GiB | Cut TCon weapon/combat add-ons |
| `client_render_audio` | `sampled_timeout` | 13 | 341 | 10.43 GiB | -0.06 GiB | 9.47 GiB | -0.18 GiB | Cut client render/audio/UI helpers |
| `physics_weather` | `sampled_timeout` | 6 | 350 | 10.07 GiB | -0.43 GiB | 9.25 GiB | -0.40 GiB | Cut physics/weather/destruction/water stack |
| `tcon_addons_physics_weather` | `exited` | 16 | 340 | 8.57 GiB | -1.93 GiB | n/a | n/a | Cut TCon add-ons plus physics/weather |
| `food_stack` | `sampled_timeout` | 19 | 336 | 10.17 GiB | -0.33 GiB | 9.27 GiB | -0.38 GiB | Cut Farmer/food/thirst/nutrition stack |
| `adventure_dimensions` | `sampled_timeout` | 18 | 336 | 9.92 GiB | -0.58 GiB | 8.93 GiB | -0.73 GiB | Cut major adventure/dimension/village combat stack |
| `full_tcon_invalid` | `failed` | 12 | 344 | 4.44 GiB | -6.06 GiB | 4.37 GiB | -5.29 GiB | Diagnostic full TCon/Mantle cut; invalid crash |

## Findings

- Strongest valid menu RSS lever: the TCon add-on layer. Cutting the full add-on layer drops peak RSS from 10.50 GiB to 8.74 GiB while keeping TConstruct and Mantle.
- Within that layer, `ticex` alone saves about 0.78 GiB peak and the Tinkers Advanced/docs group saves about 0.64 GiB peak. These are the first surgical candidates.
- The TCon weapon/combat add-on subgroup is a negative result in this metric: cutting it increased peak RSS to 11.19 GiB. Do not cut that subgroup for memory without a repeat test and a stronger reason.
- TConstruct core/Mantle cannot simply be removed in the current pack. The full TCon diagnostic crashed during client loading, so it is not a valid memory profile and indicates hard references remain.
- Client render/audio/UI helpers are not a meaningful main-menu RSS target. They may still matter for FPS or in-world stutter, but they saved only about 0.06 GiB peak in this metric.
- Physics/weather is a moderate target by itself and stacks somewhat with TCon add-ons, but the combined run exited before post-GC diagnostics. Its peak stayed below 8.6 GiB.
- Food and adventure/dimension clusters reduce RSS, but less efficiently than the TCon add-on layer relative to their gameplay importance.

## Recommended Next Test

- Repeat `ticex_only` once if this becomes a removal candidate, then test `ticex + tcon_advanced_docs` together. That should show whether the two largest TCon add-on savings stack cleanly without cutting the weapon showcase.
- If pursuing `<8 GiB`, combine `ticex + tcon_advanced_docs` with physics/weather and then validate world entry, not just menu RSS.
