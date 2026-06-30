#!/usr/bin/env python3
"""Helpers for deriving active mod inputs from the pack directory.

Validation scripts should not carry their own custom-mod inventories. The pack
root's `mods/` directory is the source of truth for bundled jars and manifests.
"""

from __future__ import annotations

import re
import tomllib
import zipfile
from pathlib import Path


def active_mod_files(pack_root: Path) -> list[str]:
    mods_dir = pack_root / "mods"
    if not mods_dir.is_dir():
        return []
    return sorted(
        path.name
        for path in mods_dir.iterdir()
        if path.is_file() and (path.suffix in {".jar", ".so"} or path.name.endswith(".pw.toml"))
    )


def bundled_mod_jars(pack_root: Path) -> list[Path]:
    mods_dir = pack_root / "mods"
    if not mods_dir.is_dir():
        return []
    return sorted(path for path in mods_dir.glob("*.jar") if path.is_file())


def bundled_mod_ids(pack_root: Path) -> set[str]:
    ids: set[str] = set()
    for jar in bundled_mod_jars(pack_root):
        ids.update(mod_ids_from_jar(jar))
    return ids


def bundled_mod_jar_patterns(pack_root: Path) -> dict[str, list[str]]:
    patterns: dict[str, list[str]] = {}
    for jar in bundled_mod_jars(pack_root):
        for mod_id in mod_ids_from_jar(jar):
            patterns.setdefault(mod_id, []).append(jar.name)
    return patterns


def bundled_mod_regexes(pack_root: Path) -> list[str]:
    return [f"^{re.escape(jar.name)}$" for jar in bundled_mod_jars(pack_root)]


def filter_active_patterns(pack_root: Path, patterns: list[str]) -> list[str]:
    filenames = active_runtime_filenames(pack_root)
    return [pattern for pattern in patterns if any(re.match(pattern, filename, re.IGNORECASE) for filename in filenames)]


def active_runtime_filenames(pack_root: Path) -> list[str]:
    mods_dir = pack_root / "mods"
    filenames = [jar.name for jar in bundled_mod_jars(pack_root)]
    for manifest in sorted(mods_dir.glob("*.pw.toml")) if mods_dir.is_dir() else []:
        try:
            data = tomllib.loads(manifest.read_text())
        except Exception:
            continue
        filename = data.get("filename")
        if isinstance(filename, str) and filename:
            filenames.append(filename)
    return sorted(set(filenames))


def mod_ids_from_jar(jar: Path) -> list[str]:
    try:
        with zipfile.ZipFile(jar) as archive:
            target = next((name for name in archive.namelist() if name.endswith("META-INF/mods.toml")), None)
            if target is None:
                return []
            data = tomllib.loads(archive.read(target).decode("utf-8", "replace"))
    except Exception:
        return []
    return [mod["modId"] for mod in data.get("mods", []) if mod.get("modId")]
