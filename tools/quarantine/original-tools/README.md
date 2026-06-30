# Quarantined Original Tools

This directory contains the original top-level `.py` and `.sh` tools that were removed from the active `tools/` root.

Rules:
- Treat these files as quarantined archival references, not the supported public workflow.
- Use `tools/btm` for supported validation, build, and doctor commands.
- Do not restore quarantined files to the active `tools/` root.
- If a quarantined file is still needed for parity or investigation, migrate its behavior into Kotlin or an internal non-public helper first.
