#!/usr/bin/env bash
set -euo pipefail

out="${1:-all_loot_tables.ndjson}"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

: > "$out"

shopt -s nullglob
jars=( *.jar )

if ((${#jars[@]} == 0)); then
  echo "No .jar files found in $(pwd)" >&2
  exit 1
fi

# Output format: NDJSON-ish with metadata lines.
# Each loot table becomes:
# {"__meta":{...}}
# <raw json line(s)>
# {"__end":true}
#
# This is easy to grep and re-split later, even if the JSON spans multiple lines.

for jar in "${jars[@]}"; do
  # List only loot table JSON files inside the jar
  while IFS= read -r entry; do
    # entry like: data/modid/loot_tables/chests/foo.json
    [[ -z "$entry" ]] && continue

    # Extract this one file to stdout (no unzip-to-disk), append to output.
    modid="$(awk -F/ '{print $2}' <<<"$entry")"
    rel="${entry#data/$modid/}"
    ns="$modid"
    path="${rel%.json}"         # loot_tables/...
    rid="$ns:${path}"           # resource id-ish (includes loot_tables/ prefix)

    printf '%s\n' "{\"__meta\":{\"jar\":\"$jar\",\"entry\":\"$entry\",\"namespace\":\"$ns\",\"resource\":\"$rid\"}}"
    unzip -p "$jar" "$entry" >> "$out" 2>/dev/null || true
    printf '\n%s\n' '{"__end":true}'
  done < <(unzip -Z1 "$jar" 'data/*/loot_tables/**/*.json' 2>/dev/null || true) >> "$out"
done

echo "Wrote: $out"
echo "Tip: grep '\"__meta\"' -n $out | head"
