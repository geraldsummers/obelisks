#!/usr/bin/env python3
"""Runtime audit for Dynamic Trees generation in forest biomes."""

from __future__ import annotations

import argparse
import gzip
import json
import math
import os
import re
import shutil
import struct
import subprocess
import sys
import time
import zipfile
import zlib
from pathlib import Path


REPO = Path(__file__).resolve().parents[1]
DEFAULT_TARGETS = [
    "minecraft:overworld:minecraft:forest",
    "minecraft:overworld:minecraft:flower_forest",
    "minecraft:overworld:minecraft:birch_forest",
    "minecraft:overworld:minecraft:old_growth_birch_forest",
    "minecraft:overworld:minecraft:dark_forest",
    "minecraft:overworld:minecraft:jungle",
    "minecraft:overworld:minecraft:sparse_jungle",
    "minecraft:overworld:minecraft:bamboo_jungle",
    "minecraft:overworld:minecraft:swamp",
    "minecraft:overworld:minecraft:windswept_forest",
    "minecraft:overworld:natures_spirit:redwood_forest",
    "minecraft:overworld:natures_spirit:snowy_redwood_forest",
]
LOG_Y_BANDS = [(-64, 31), (32, 47), (48, 95), (96, 159), (160, 223), (224, 319)]
GROUND_BLOCKS = [
    "minecraft:grass_block",
    "minecraft:dirt",
    "minecraft:coarse_dirt",
    "minecraft:rooted_dirt",
    "minecraft:moss_block",
    "minecraft:mud",
    *[
        f"unearthed:{stone}_{suffix}"
        for stone in [
            "beige_limestone",
            "conglomerate",
            "dolomite",
            "gabbro",
            "granodiorite",
            "grey_limestone",
            "kimberlite",
            "limestone",
            "mudstone",
            "phyllite",
            "quartzite",
            "rhyolite",
            "sandstone",
            "siltstone",
            "slate",
            "stone",
            "white_granite",
        ]
        for suffix in ["regolith", "grassy_regolith"]
    ],
    "unearthed:overgrown_andesite",
    "unearthed:overgrown_diorite",
    "unearthed:overgrown_granite",
]
DT_DEBUG_BLOCKS = {
    "failedChance": "minecraft:blue_concrete",
    "failedSoil": "minecraft:brown_concrete",
    "unhandledBiome": "minecraft:yellow_concrete",
    "failedGeneration": "minecraft:red_concrete",
    "noSoil": "minecraft:purple_concrete",
    "noTree": "minecraft:black_concrete",
    "generated": "minecraft:white_concrete",
    "alreadyGenerated": "minecraft:gray_concrete",
}
DT_TREE_BLOCK_TAGS = [
    "#dynamictrees:branches",
    "#dynamictrees:branches_that_burn",
    "#dynamictrees:stripped_branches",
    "#dynamictrees:stripped_branches_that_burn",
    "#dynamictrees:roots",
]
EXPECTED_DT_BRANCHES_BY_TARGET = {
    "minecraft:overworld:minecraft:forest": ["dynamictrees:oak_branch", "dynamictrees:birch_branch"],
    "minecraft:overworld:minecraft:flower_forest": ["dynamictrees:oak_branch", "dynamictrees:birch_branch"],
    "minecraft:overworld:minecraft:birch_forest": ["dynamictrees:birch_branch"],
    "minecraft:overworld:minecraft:old_growth_birch_forest": ["dynamictrees:birch_branch"],
    "minecraft:overworld:minecraft:dark_forest": ["dynamictrees:dark_oak_branch"],
    "minecraft:overworld:minecraft:jungle": ["dynamictrees:jungle_branch"],
    "minecraft:overworld:minecraft:sparse_jungle": ["dynamictrees:jungle_branch"],
    "minecraft:overworld:minecraft:bamboo_jungle": ["dynamictrees:jungle_branch"],
    "minecraft:overworld:minecraft:swamp": ["dynamictrees:oak_branch"],
    "minecraft:overworld:minecraft:windswept_forest": ["dynamictrees:oak_branch", "dynamictrees:spruce_branch"],
    "minecraft:overworld:natures_spirit:redwood_forest": ["dtnatures_spirit:redwood_branch"],
    "minecraft:overworld:natures_spirit:snowy_redwood_forest": ["dtnatures_spirit:frosty_redwood_branch"],
    "aether:the_aether:aether:skyroot_forest": ["dtaether:skyroot_branch"],
    "aether:the_aether:aether:skyroot_woodland": ["dtaether:skyroot_branch"],
    "aether:the_aether:aether:skyroot_grove": ["dtaether:skyroot_branch"],
    "twilightforest:twilight_forest:twilightforest:forest": [
        "dttwilightforest:canopy_branch",
        "dynamictrees:oak_branch",
        "dynamictrees:birch_branch",
    ],
    "twilightforest:twilight_forest:twilightforest:firefly_forest": [
        "dttwilightforest:canopy_branch",
        "dynamictrees:oak_branch",
        "dynamictrees:birch_branch",
    ],
    "twilightforest:twilight_forest:twilightforest:dense_forest": [
        "dttwilightforest:twilight_oak_branch",
        "dttwilightforest:canopy_branch",
        "dynamictrees:oak_branch",
        "dynamictrees:birch_branch",
    ],
    "twilightforest:twilight_forest:twilightforest:dark_forest": [
        "dttwilightforest:darkwood_branch",
        "dynamictrees:oak_branch",
        "dynamictrees:birch_branch",
    ],
    "twilightforest:twilight_forest:twilightforest:snowy_forest": [
        "dynamictrees:spruce_branch",
    ],
    "twilightforest:twilight_forest:twilightforest:swamp": [
        "dttwilightforest:mangrove_branch",
        "dynamictrees:oak_branch",
    ],
    "blue_skies:everbright:blue_skies:brumble_forest": ["btmdimtrees:starlit_branch"],
    "blue_skies:everbright:blue_skies:frostbitten_forest": [
        "btmdimtrees:frostbright_branch",
        "btmdimtrees:bluebright_branch",
    ],
    "blue_skies:everdawn:blue_skies:shaded_woodlands": ["btmdimtrees:dusk_branch"],
    "blue_skies:everdawn:blue_skies:sunset_maple_forest": ["btmdimtrees:maple_branch"],
    "undergarden:undergarden:undergarden:dense_forest": [
        "btmdimtrees:smogstem_branch",
        "btmdimtrees:wigglewood_branch",
    ],
    "undergarden:undergarden:undergarden:smogstem_forest": ["btmdimtrees:smogstem_branch"],
    "undergarden:undergarden:undergarden:wigglewood_forest": ["btmdimtrees:wigglewood_branch"],
    "the_finley_dimension_remastered:finley_dimension:the_finley_dimension_remastered:finley_forest": [
        "btmdimtrees:finley_wood_branch"
    ],
    "the_finley_dimension_remastered:finley_dimension:the_finley_dimension_remastered:living_forest": [
        "btmdimtrees:living_wood_branch"
    ],
    "callfromthedepth_:depth:callfromthedepth_:deepforest": ["btmdimtrees:silent_tree_branch"],
    "callfromthedepth_:depth:callfromthedepth_:forgottenforest": ["btmdimtrees:silent_tree_branch"],
}
EXPECTED_DT_BRANCHES_BY_BIOME = {
    target.rsplit(":", 2)[1] + ":" + target.rsplit(":", 2)[2]: branches
    for target, branches in EXPECTED_DT_BRANCHES_BY_TARGET.items()
}
LOG_BLOCKS = [
    "minecraft:oak_log",
    "minecraft:oak_wood",
    "minecraft:stripped_oak_log",
    "minecraft:stripped_oak_wood",
    "minecraft:birch_log",
    "minecraft:birch_wood",
    "minecraft:stripped_birch_log",
    "minecraft:stripped_birch_wood",
    "minecraft:spruce_log",
    "minecraft:spruce_wood",
    "minecraft:stripped_spruce_log",
    "minecraft:stripped_spruce_wood",
    "minecraft:jungle_log",
    "minecraft:jungle_wood",
    "minecraft:stripped_jungle_log",
    "minecraft:stripped_jungle_wood",
    "minecraft:dark_oak_log",
    "minecraft:dark_oak_wood",
    "minecraft:stripped_dark_oak_log",
    "minecraft:stripped_dark_oak_wood",
    "minecraft:acacia_log",
    "minecraft:acacia_wood",
    "minecraft:stripped_acacia_log",
    "minecraft:stripped_acacia_wood",
    "minecraft:cherry_log",
    "minecraft:cherry_wood",
    "minecraft:stripped_cherry_log",
    "minecraft:stripped_cherry_wood",
    "minecraft:mangrove_log",
    "minecraft:mangrove_wood",
    "minecraft:stripped_mangrove_log",
    "minecraft:stripped_mangrove_wood",
    "minecraft:crimson_stem",
    "minecraft:crimson_hyphae",
    "minecraft:stripped_crimson_stem",
    "minecraft:stripped_crimson_hyphae",
    "minecraft:warped_stem",
    "minecraft:warped_hyphae",
    "minecraft:stripped_warped_stem",
    "minecraft:stripped_warped_hyphae",
    "forbidden_arcanus:carved_edelwood_log",
    "forbidden_arcanus:edelwood_log",
    "natures_spirit:redwood_log",
    "natures_spirit:frosty_redwood_log",
]
RBP_WOOD_DEFINITION = REPO / "config/rbp/block_definitions/generated_modded_wood.toml"
LOG_BLOCK_CACHE: list[str] | None = None
TAG_CACHE: dict[Path, dict[str, dict]] = {}
LOG_TAG_CACHE: dict[Path, list[str]] = {}
DYNAMIC_LOG_CACHE: dict[Path, list[str]] = {}
DYNAMIC_TREE_LOG_NAMESPACES = {
    "dynamictrees",
    "dynamictreesplus",
    "dtarsnouveau",
    "dthexerei",
    "dtmalum",
    "dtnatures_spirit",
    "dtquark",
    "dtaether",
    "dt_aether",
    "dttwilightforest",
    "dt_tfc",
    "btmdimtrees",
}


class NbtReader:
    def __init__(self, data: bytes):
        self.data = data
        self.pos = 0

    def read(self, size: int) -> bytes:
        chunk = self.data[self.pos : self.pos + size]
        if len(chunk) != size:
            raise ValueError("truncated NBT payload")
        self.pos += size
        return chunk

    def ubyte(self) -> int:
        return self.read(1)[0]

    def byte(self) -> int:
        return struct.unpack(">b", self.read(1))[0]

    def short(self) -> int:
        return struct.unpack(">h", self.read(2))[0]

    def int(self) -> int:
        return struct.unpack(">i", self.read(4))[0]

    def long(self) -> int:
        return struct.unpack(">q", self.read(8))[0]

    def string(self) -> str:
        length = struct.unpack(">H", self.read(2))[0]
        return self.read(length).decode("utf-8")

    def payload(self, tag_type: int):
        if tag_type == 0:
            return None
        if tag_type == 1:
            return self.byte()
        if tag_type == 2:
            return self.short()
        if tag_type == 3:
            return self.int()
        if tag_type == 4:
            return self.long()
        if tag_type == 5:
            return struct.unpack(">f", self.read(4))[0]
        if tag_type == 6:
            return struct.unpack(">d", self.read(8))[0]
        if tag_type == 7:
            return self.read(self.int())
        if tag_type == 8:
            return self.string()
        if tag_type == 9:
            item_type = self.ubyte()
            length = self.int()
            return [self.payload(item_type) for _ in range(length)]
        if tag_type == 10:
            value = {}
            while True:
                child_type = self.ubyte()
                if child_type == 0:
                    return value
                name = self.string()
                value[name] = self.payload(child_type)
        if tag_type == 11:
            return [self.int() for _ in range(self.int())]
        if tag_type == 12:
            return [self.long() for _ in range(self.int())]
        raise ValueError(f"unsupported NBT tag type {tag_type}")

    def root(self):
        tag_type = self.ubyte()
        if tag_type != 10:
            raise ValueError(f"expected NBT root compound, found {tag_type}")
        _name = self.string()
        return self.payload(tag_type)


def run_checked(cmd: list[str], *, cwd: Path = REPO, timeout: int | None = None) -> None:
    print("+", " ".join(cmd), flush=True)
    subprocess.run(cmd, cwd=cwd, check=True, timeout=timeout)


def should_echo_server_line(line: str) -> bool:
    return (
        "The nearest " in line
        or "Could not find" in line
        or "Expected" in line
        or "]: Done (" in line
        or "Preparing spawn area:" in line
    )


def wait_for_line(proc: subprocess.Popen[str], pattern: re.Pattern[str], timeout: int) -> list[str]:
    deadline = time.time() + timeout
    lines: list[str] = []
    while time.time() < deadline:
        line = proc.stdout.readline() if proc.stdout else ""
        if not line:
            if proc.poll() is not None:
                raise RuntimeError(f"server exited while waiting for {pattern.pattern}")
            time.sleep(0.1)
            continue
        line = line.rstrip("\n")
        if should_echo_server_line(line):
            print(line)
        lines.append(line)
        if pattern.search(line):
            return lines
    raise TimeoutError(f"timed out waiting for {pattern.pattern}")


class Server:
    def __init__(self, server_dir: Path):
        self.server_dir = server_dir
        self.proc: subprocess.Popen[str] | None = None
        self.marker_index = 0

    def start(self) -> None:
        cmd = [str(REPO / "tools/launch_server_direct.sh"), "--server-dir", str(self.server_dir), "--", "nogui"]
        self.proc = subprocess.Popen(
            cmd,
            cwd=REPO,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )
        wait_for_line(self.proc, re.compile(r"\]: Done \("), 180)

    def stop(self) -> None:
        if not self.proc:
            return
        if self.proc.poll() is None:
            try:
                self.send_raw("stop")
                self.proc.wait(timeout=45)
            except Exception:
                self.proc.terminate()
                try:
                    self.proc.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    self.proc.kill()
        self.proc = None

    def send_raw(self, command: str) -> None:
        assert self.proc and self.proc.stdin
        self.proc.stdin.write(command + "\n")
        self.proc.stdin.flush()

    def command(self, command: str, timeout: int = 60) -> list[str]:
        assert self.proc
        self.marker_index += 1
        marker = f"BTM_FOREST_AUDIT_DONE_{self.marker_index}"
        self.send_raw(command)
        self.send_raw(f"say {marker}")
        lines = wait_for_line(self.proc, re.compile(re.escape(marker)), timeout)
        return [line for line in lines if marker not in line]


def parse_locate(lines: list[str], biome: str) -> tuple[int, int] | None:
    coord_re = re.compile(r"\[(-?\d+),\s*(?:~|-?\d+),\s*(-?\d+)\]")
    not_found_re = re.compile(r"Could not find|not found|No biome", re.I)
    for line in lines:
        match = coord_re.search(line)
        if match:
            return int(match.group(1)), int(match.group(2))
    if any(not_found_re.search(line) for line in lines):
        return None
    print(f"warning: could not parse locate output for {biome}: {lines[-4:]}", file=sys.stderr)
    return None


def chunk_floor(block_coord: int) -> int:
    return math.floor(block_coord / 16)


def parse_target(target: str) -> tuple[str, str]:
    parts = target.split(":")
    if len(parts) != 4:
        raise ValueError(f"target must be dimension:biome, got {target!r}")
    return f"{parts[0]}:{parts[1]}", f"{parts[2]}:{parts[3]}"


def dimension_world_path(server_dir: Path, dimension: str) -> Path:
    if dimension == "minecraft:overworld":
        return server_dir / "world"
    if dimension == "minecraft:the_nether":
        return server_dir / "world" / "DIM-1"
    if dimension == "minecraft:the_end":
        return server_dir / "world" / "DIM1"
    namespace, path = dimension.split(":", 1)
    return server_dir / "world" / "dimensions" / namespace / path


def chunk_region_path(server_dir: Path, dimension: str, cx: int, cz: int) -> Path:
    return dimension_world_path(server_dir, dimension) / "region" / f"r.{math.floor(cx / 32)}.{math.floor(cz / 32)}.mca"


def read_region_chunk(server_dir: Path, dimension: str, cx: int, cz: int) -> dict | None:
    region_path = chunk_region_path(server_dir, dimension, cx, cz)
    if not region_path.exists():
        return None
    local_x = cx & 31
    local_z = cz & 31
    header_index = 4 * (local_x + local_z * 32)
    with region_path.open("rb") as handle:
        handle.seek(header_index)
        location = handle.read(4)
        if len(location) != 4:
            return None
        offset = int.from_bytes(location[:3], "big")
        sectors = location[3]
        if offset == 0 or sectors == 0:
            return None
        handle.seek(offset * 4096)
        length_bytes = handle.read(4)
        if len(length_bytes) != 4:
            return None
        length = int.from_bytes(length_bytes, "big")
        compression = handle.read(1)
        payload = handle.read(length - 1)
    if not compression:
        return None
    compression_id = compression[0]
    if compression_id == 1:
        raw = gzip.decompress(payload)
    elif compression_id == 2:
        raw = zlib.decompress(payload)
    elif compression_id == 3:
        raw = payload
    else:
        raise ValueError(f"unsupported region compression {compression_id} in {region_path}")
    return NbtReader(raw).root()


def section_y_range(section: dict) -> tuple[int, int]:
    y = int(section.get("Y", section.get("y", 0)))
    return y * 16, y * 16 + 15


def y_band_key(y0: int, y1: int) -> str | None:
    for band0, band1 in LOG_Y_BANDS:
        if y0 >= band0 and y1 <= band1:
            return f"{band0}..{band1}"
    return None


def unpack_palette_counts(container: dict, entry_count: int) -> dict[str, int]:
    palette = container.get("palette") or []
    if not palette:
        return {}
    names = [entry if isinstance(entry, str) else entry.get("Name", "minecraft:air") for entry in palette]
    data = container.get("data")
    if not data:
        return {names[0]: entry_count}

    bits = max(4, (len(names) - 1).bit_length())
    mask = (1 << bits) - 1
    counts = {name: 0 for name in names}
    values_per_long = 64 // bits
    expected_non_crossing = math.ceil(entry_count / values_per_long)
    unsigned_longs = [value & ((1 << 64) - 1) for value in data]

    if len(unsigned_longs) == expected_non_crossing:
        for index in range(entry_count):
            long_index = index // values_per_long
            if long_index >= len(unsigned_longs):
                break
            bit_offset = (index % values_per_long) * bits
            palette_index = (unsigned_longs[long_index] >> bit_offset) & mask
            if palette_index < len(names):
                counts[names[palette_index]] += 1
    else:
        for index in range(entry_count):
            bit_index = index * bits
            long_index = bit_index >> 6
            if long_index >= len(unsigned_longs):
                break
            bit_offset = bit_index & 63
            value = unsigned_longs[long_index] >> bit_offset
            spill = bit_offset + bits - 64
            if spill > 0 and long_index + 1 < len(unsigned_longs):
                value |= unsigned_longs[long_index + 1] << (bits - spill)
            palette_index = value & mask
            if palette_index < len(names):
                counts[names[palette_index]] += 1
    return {name: count for name, count in counts.items() if count}


def count_chunk_blocks(server_dir: Path, dimension: str, cx: int, cz: int) -> tuple[dict[str, int], dict[str, dict[str, int]], dict[str, int]]:
    chunk = read_region_chunk(server_dir, dimension, cx, cz)
    if not chunk:
        return {}, {}, {}
    totals: dict[str, int] = {}
    by_band: dict[str, dict[str, int]] = {}
    biome_totals: dict[str, int] = {}
    for section in chunk.get("sections", []):
        block_states = section.get("block_states")
        section_counts = unpack_palette_counts(block_states, 4096) if isinstance(block_states, dict) else {}
        band = y_band_key(*section_y_range(section))
        if band:
            band_counts = by_band.setdefault(band, {})
        else:
            band_counts = None
        for block, count in section_counts.items():
            totals[block] = totals.get(block, 0) + count
            if band_counts is not None:
                band_counts[block] = band_counts.get(block, 0) + count

        biomes = section.get("biomes")
        if isinstance(biomes, dict):
            for biome, count in unpack_palette_counts(biomes, 64).items():
                biome_totals[biome] = biome_totals.get(biome, 0) + count
    return totals, by_band, biome_totals


def count_missing_chunks(server_dir: Path, dimension: str, min_cx: int, max_cx: int, min_cz: int, max_cz: int) -> int:
    missing = 0
    for cx in range(min_cx, max_cx + 1):
        for cz in range(min_cz, max_cz + 1):
            if read_region_chunk(server_dir, dimension, cx, cz) is None:
                missing += 1
    return missing


def find_generated_biome_chunk(
    server_dir: Path,
    dimension: str,
    biome: str,
    search_radius_chunks: int = 64,
) -> tuple[int, int] | None:
    best: tuple[int, int, int] | None = None
    for cx in range(-search_radius_chunks, search_radius_chunks + 1):
        for cz in range(-search_radius_chunks, search_radius_chunks + 1):
            _, _, biome_counts = count_chunk_blocks(server_dir, dimension, cx, cz)
            samples = biome_counts.get(biome, 0)
            if samples <= 0:
                continue
            distance = abs(cx) + abs(cz)
            if best is None or samples > best[0] or (samples == best[0] and distance < abs(best[1]) + abs(best[2])):
                best = (samples, cx, cz)
    if best is None:
        return None
    return best[1], best[2]


def sum_counts(counts: dict[str, int], block_ids: set[str]) -> int:
    return sum(count for block, count in counts.items() if block in block_ids)


def add_counts_by_id(target: dict[str, int], counts: dict[str, int], block_ids: set[str]) -> None:
    for block, count in counts.items():
        if block in block_ids and count:
            target[block] = target.get(block, 0) + count


def tag_id_from_path(path: str) -> str | None:
    match = re.match(r"(?:data|assets)/([^/]+)/tags/blocks/(.+)\.json$", path)
    if not match:
        return None
    return f"{match.group(1)}:{match.group(2)}"


def merge_tag(tags: dict[str, dict], tag_id: str, tag: dict) -> None:
    if tag.get("replace") or tag_id not in tags:
        tags[tag_id] = tag
        return
    existing = tags[tag_id]
    existing_values = existing.setdefault("values", [])
    existing_values.extend(tag.get("values", []))


def load_tag_files_from_zip(path: Path, tags: dict[str, dict]) -> None:
    try:
        with zipfile.ZipFile(path) as archive:
            for name in archive.namelist():
                tag_id = tag_id_from_path(name)
                if not tag_id:
                    continue
                try:
                    merge_tag(tags, tag_id, json.loads(archive.read(name).decode("utf-8")))
                except (KeyError, UnicodeDecodeError, json.JSONDecodeError):
                    continue
    except zipfile.BadZipFile:
        return


def load_tag_files_from_dir(path: Path, tags: dict[str, dict]) -> None:
    for json_path in path.rglob("*.json"):
        rel = json_path.relative_to(path).as_posix()
        tag_id = tag_id_from_path(rel)
        if not tag_id:
            continue
        try:
            merge_tag(tags, tag_id, json.loads(json_path.read_text(encoding="utf-8")))
        except json.JSONDecodeError:
            continue


def load_runtime_block_tags(server_dir: Path) -> dict[str, dict]:
    cached = TAG_CACHE.get(server_dir)
    if cached is not None:
        return cached

    tags: dict[str, dict] = {}
    for jar_path in sorted((server_dir / "mods").glob("*.jar")):
        load_tag_files_from_zip(jar_path, tags)
    datapacks_dir = server_dir / "world" / "datapacks"
    if datapacks_dir.exists():
        for datapack in sorted(datapacks_dir.iterdir()):
            if datapack.is_dir():
                load_tag_files_from_dir(datapack, tags)
            elif datapack.suffix == ".zip":
                load_tag_files_from_zip(datapack, tags)

    TAG_CACHE[server_dir] = tags
    return tags


def resolve_block_tag(server_dir: Path, tag_id: str) -> set[str]:
    tags = load_runtime_block_tags(server_dir)
    resolved: set[str] = set()
    seen: set[str] = set()

    def visit(current_tag: str) -> None:
        if current_tag in seen:
            return
        seen.add(current_tag)
        tag = tags.get(current_tag)
        if not isinstance(tag, dict):
            return
        for value in tag.get("values", []):
            if isinstance(value, dict):
                value = value.get("id")
            if not isinstance(value, str):
                continue
            if value.startswith("#"):
                visit(value[1:])
            else:
                resolved.add(value)

    visit(tag_id)
    return resolved


def is_dynamic_tree_log_id(block_id: str) -> bool:
    namespace, _, path = block_id.partition(":")
    return namespace in DYNAMIC_TREE_LOG_NAMESPACES or path.endswith("_branch") or "_branch_" in path


def is_raw_loglike_id(block_id: str) -> bool:
    namespace, _, path = block_id.partition(":")
    return namespace != "minecraft" and (
        path.endswith("_log")
        or path.endswith("_wood")
        or path.endswith("_stem")
        or path.endswith("_hyphae")
        or path.endswith("_branch")
        or path.startswith("stripped_")
        or "_log_" in path
        or "_wood_" in path
        or "_stem_" in path
        or "_branch_" in path
    )


def is_raw_leaflike_id(block_id: str) -> bool:
    namespace, _, path = block_id.partition(":")
    return namespace != "minecraft" and (
        path.endswith("_leaves")
        or path.endswith("_leaf")
        or "_leaves_" in path
        or "_leaf_" in path
    )


def load_runtime_log_blocks(server_dir: Path) -> list[str]:
    cached = LOG_TAG_CACHE.get(server_dir)
    if cached is not None:
        return cached
    blocks = set(LOG_BLOCKS)
    blocks.update(resolve_block_tag(server_dir, "minecraft:logs"))
    LOG_TAG_CACHE[server_dir] = sorted(blocks)
    return LOG_TAG_CACHE[server_dir]


def load_dynamic_tree_log_blocks(server_dir: Path) -> list[str]:
    cached = DYNAMIC_LOG_CACHE.get(server_dir)
    if cached is not None:
        return cached
    blocks = [block for block in load_runtime_log_blocks(server_dir) if is_dynamic_tree_log_id(block)]
    DYNAMIC_LOG_CACHE[server_dir] = sorted(blocks)
    return DYNAMIC_LOG_CACHE[server_dir]


def load_log_blocks(server_dir: Path | None = None) -> list[str]:
    global LOG_BLOCK_CACHE
    if server_dir is not None:
        return load_runtime_log_blocks(server_dir)
    if LOG_BLOCK_CACHE is not None:
        return LOG_BLOCK_CACHE
    blocks = set(LOG_BLOCKS)
    if RBP_WOOD_DEFINITION.exists():
        for block in re.findall(r'"([a-z0-9_.-]+:[a-z0-9_/.-]+)"', RBP_WOOD_DEFINITION.read_text(encoding="utf-8")):
            path = block.split(":", 1)[1]
            if any(part in path for part in ["log", "stem", "wood", "hyphae"]):
                blocks.add(block)
    LOG_BLOCK_CACHE = sorted(blocks)
    return LOG_BLOCK_CACHE


def audit_target(server: Server, target: str, radius_chunks: int, count_log_ids: bool, all_loglike_ids: bool) -> dict:
    dimension, biome = parse_target(target)
    locate_lines = server.command(f"execute in {dimension} run locate biome {biome}", timeout=120)
    located = parse_locate(locate_lines, biome)
    if not located:
        generated_chunk = find_generated_biome_chunk(server.server_dir, dimension, biome)
        if not generated_chunk:
            return {
                "target": target,
                "dimension": dimension,
                "biome": biome,
                "status": "not_found",
                "branchBlocks": 0,
                "rootyBlocks": 0,
                "logBlocks": 0,
            }
        located = generated_chunk[0] * 16 + 8, generated_chunk[1] * 16 + 8

    x, z = located
    center_cx = chunk_floor(x)
    center_cz = chunk_floor(z)
    min_cx = center_cx - radius_chunks
    max_cx = center_cx + radius_chunks
    min_cz = center_cz - radius_chunks
    max_cz = center_cz + radius_chunks
    server.command(
        f"execute in {dimension} run forceload add "
        f"{min_cx * 16} {min_cz * 16} {max_cx * 16 + 15} {max_cz * 16 + 15}",
        timeout=60,
    )
    for _ in range(8):
        time.sleep(8)
        server.command("save-all flush", timeout=120)
        if count_missing_chunks(server.server_dir, dimension, min_cx, max_cx, min_cz, max_cz) == 0:
            break

    expected_branch_ids = set(EXPECTED_DT_BRANCHES_BY_TARGET.get(target, []))
    expected_branch_ids.update(EXPECTED_DT_BRANCHES_BY_BIOME.get(biome, []))
    dynamic_log_ids = set(load_dynamic_tree_log_blocks(server.server_dir))
    dt_tree_ids = dynamic_log_ids | set().union(
        *(resolve_block_tag(server.server_dir, tag[1:]) for tag in DT_TREE_BLOCK_TAGS)
    )
    dt_tree_ids.update(expected_branch_ids)
    rooty_ids = resolve_block_tag(server.server_dir, "dynamictrees:rooty_soil")
    tagged_log_ids = set(load_runtime_log_blocks(server.server_dir))
    static_log_ids = tagged_log_ids - dynamic_log_ids
    log_id_filter = set(load_log_blocks(server.server_dir) if all_loglike_ids else LOG_BLOCKS)
    ground_ids = set(GROUND_BLOCKS)
    debug_blocks_by_id = {block: reason for reason, block in DT_DEBUG_BLOCKS.items()}

    branch_blocks = 0
    rooty_blocks = 0
    log_blocks = 0
    tagged_log_blocks_including_dynamic = 0
    log_blocks_by_id: dict[str, int] = {}
    expected_branch_blocks_by_id: dict[str, int] = {}
    dynamic_log_blocks_by_id: dict[str, int] = {}
    raw_loglike_blocks_by_id: dict[str, int] = {}
    raw_leaflike_blocks_by_id: dict[str, int] = {}
    log_blocks_by_y_band: dict[str, int] = {}
    tagged_log_blocks_by_y_band: dict[str, int] = {}
    ground_blocks: dict[str, int] = {}
    debug_blocks: dict[str, int] = {}
    biome_counts: dict[str, int] = {}
    chunks = 0
    missing_chunks = 0
    for cx in range(min_cx, max_cx + 1):
        for cz in range(min_cz, max_cz + 1):
            chunks += 1
            block_counts, band_counts, chunk_biome_counts = count_chunk_blocks(server.server_dir, dimension, cx, cz)
            if not block_counts:
                missing_chunks += 1
                continue
            for chunk_biome, count in chunk_biome_counts.items():
                biome_counts[chunk_biome] = biome_counts.get(chunk_biome, 0) + count

            add_counts_by_id(expected_branch_blocks_by_id, block_counts, expected_branch_ids)
            add_counts_by_id(dynamic_log_blocks_by_id, block_counts, dynamic_log_ids)
            branch_blocks += sum_counts(block_counts, dt_tree_ids)
            rooty_blocks += sum_counts(block_counts, rooty_ids)
            if count_log_ids:
                add_counts_by_id(log_blocks_by_id, block_counts, log_id_filter)
                if all_loglike_ids:
                    for block, count in block_counts.items():
                        if is_raw_loglike_id(block) and count:
                            raw_loglike_blocks_by_id[block] = raw_loglike_blocks_by_id.get(block, 0) + count
                        if is_raw_leaflike_id(block) and count:
                            raw_leaflike_blocks_by_id[block] = raw_leaflike_blocks_by_id.get(block, 0) + count
            if branch_blocks == 0 and rooty_blocks == 0:
                for block, count in block_counts.items():
                    reason = debug_blocks_by_id.get(block)
                    if reason:
                        debug_blocks[reason] = debug_blocks.get(reason, 0) + count
            if branch_blocks == 0 and rooty_blocks == 0 and log_blocks == 0:
                add_counts_by_id(ground_blocks, block_counts, ground_ids)

            for y_band, counts in band_counts.items():
                tagged_count = sum_counts(counts, tagged_log_ids)
                static_count = sum_counts(counts, static_log_ids)
                if tagged_count:
                    tagged_log_blocks_by_y_band[y_band] = tagged_log_blocks_by_y_band.get(y_band, 0) + tagged_count
                    tagged_log_blocks_including_dynamic += tagged_count
                if static_count:
                    log_blocks_by_y_band[y_band] = log_blocks_by_y_band.get(y_band, 0) + static_count
                    log_blocks += static_count

    server.command(
        f"execute in {dimension} run forceload remove "
        f"{min_cx * 16} {min_cz * 16} {max_cx * 16 + 15} {max_cz * 16 + 15}",
        timeout=60,
    )
    surface_log_blocks = sum(
        count
        for y_band, count in log_blocks_by_y_band.items()
        if int(y_band.split("..", 1)[0]) >= 48
    )
    surface_tagged_log_blocks_including_dynamic = sum(
        count
        for y_band, count in tagged_log_blocks_by_y_band.items()
        if int(y_band.split("..", 1)[0]) >= 48
    )
    return {
        "biome": biome,
        "dimension": dimension,
        "target": target,
        "status": "sampled",
        "locatedAt": {"x": x, "z": z},
        "centerChunk": {"x": center_cx, "z": center_cz},
        "chunks": chunks,
        "missingChunks": missing_chunks,
        "countMethod": "region_nbt",
        "biomeCounts": dict(sorted(biome_counts.items(), key=lambda item: item[1], reverse=True)[:12]),
        "targetBiomeSamples": biome_counts.get(biome, 0),
        "branchBlocks": branch_blocks,
        "rootyBlocks": rooty_blocks,
        "staticTaggedLogBlocks": log_blocks,
        "surfaceStaticTaggedLogBlocks": surface_log_blocks,
        "taggedLogBlocksIncludingDynamic": tagged_log_blocks_including_dynamic,
        "surfaceTaggedLogBlocksIncludingDynamic": surface_tagged_log_blocks_including_dynamic,
        "staticTaggedLogBlocksByYBand": log_blocks_by_y_band,
        "taggedLogBlocksByYBandIncludingDynamic": tagged_log_blocks_by_y_band,
        "logBlocksById": log_blocks_by_id,
        "rawLoglikeBlocksById": raw_loglike_blocks_by_id,
        "rawLeaflikeBlocksById": raw_leaflike_blocks_by_id,
        "expectedDynamicBranchBlocksById": expected_branch_blocks_by_id,
        "dynamicLogBlocksById": dynamic_log_blocks_by_id,
        "groundBlocks": ground_blocks,
        "debugBlocks": debug_blocks,
        "passes": bool(expected_branch_blocks_by_id) and missing_chunks == 0,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--server-dir", default="/tmp/btm-forest-tree-audit")
    parser.add_argument("--port", default="25565")
    parser.add_argument("--reset-runtime", action="store_true")
    parser.add_argument("--skip-bootstrap", action="store_true")
    parser.add_argument("--radius-chunks", type=int, default=1)
    parser.add_argument("--biome", action="append", dest="biomes", help="Overworld biome id; kept for compatibility.")
    parser.add_argument("--target", action="append", dest="targets", help="Dimension-aware target as dimension:biome.")
    parser.add_argument("--count-log-ids", action="store_true")
    parser.add_argument("--count-all-loglike-ids", action="store_true")
    parser.add_argument("--out", default=None)
    args = parser.parse_args()

    server_dir = Path(args.server_dir)
    if args.reset_runtime:
        shutil.rmtree(server_dir, ignore_errors=True)
    if not args.skip_bootstrap:
        run_checked(
            [
                str(REPO / "tools/bootstrap_server.sh"),
                "--server-dir",
                str(server_dir),
                "--port",
                str(args.port),
                "--reset-runtime",
            ],
            timeout=420,
        )

    server = Server(server_dir)
    results: list[dict] = []
    try:
        server.start()
        server.command("gamerule randomTickSpeed 0", timeout=30)
        targets = list(args.targets or [])
        targets.extend(f"minecraft:overworld:{biome}" for biome in args.biomes or [])
        if not targets:
            targets = DEFAULT_TARGETS
        for target in targets:
            print(f"## auditing {target}", flush=True)
            result = audit_target(
                server,
                target,
                args.radius_chunks,
                args.count_log_ids,
                args.count_all_loglike_ids,
            )
            print("## result", json.dumps(result, sort_keys=True), flush=True)
            results.append(result)
    finally:
        server.stop()

    summary = {
        "schema": "btm.forest_tree_audit.v1",
        "serverDir": str(server_dir),
        "radiusChunks": args.radius_chunks,
        "targets": targets,
        "results": results,
        "failures": [row for row in results if row.get("status") == "sampled" and not row.get("passes")],
    }
    out = Path(args.out) if args.out else server_dir / "forest_tree_audit.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {out}")
    if summary["failures"]:
        print("forest tree audit failed:", ", ".join(row["biome"] for row in summary["failures"]))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
