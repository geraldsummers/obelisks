# Tool Migration Matrix

## Supported Front Door

Use `tools/btm` for all supported repo workflows.

Public commands:
- `tools/btm doctor ...`
- `tools/btm test ...`
- `tools/btm build ...`
- `tools/btm internal ...` for checked-in validator and maintenance entrypoints that are intentionally exposed through `btm`

## Repo Policy

The Kotlin-backed `tools/btm` surface is the maintained interface for pack work.

Legacy shell, Python, Node, and one-off generators may still exist internally under `tools/` or `tools/quarantine/`, but they are not the user-facing contract unless a current `tools/btm` command delegates to them.

## Current State

| Area | Supported Entry | Notes |
| --- | --- | --- |
| Environment checks | `tools/btm doctor env` | Authoritative prerequisite check |
| Repo checks | `tools/btm doctor repo` | Source-shape and policy checks |
| Runtime checks | `tools/btm doctor runtime --instance ...` | Fresh runtime inspection |
| Static validation | `tools/btm test static` | Source plus retained generated-dump checks |
| Runtime validation | `tools/btm test runtime --instance ...` | Strict runtime evidence |
| Fresh smoke | `tools/btm test smoke --server-dir ... --reset-runtime` | Disposable server bootstrap and strict runtime suite |
| Scenario harnesses | `tools/btm test scenario ...` | Portable server/client scenarios |
| Sync server/client | `tools/btm build sync server ...`, `tools/btm build sync client ...` | Supported sync flows |
| Bundle export | `tools/btm build bundle ...` | Supported export flows |

## Legacy Status

- `tools/quarantine/original-tools/` is archival only.
- Checked-in non-`btm` files under `tools/` may remain as implementation detail during migration.
- Validation and documentation should describe the `btm` commands, not the legacy direct entrypoints.
