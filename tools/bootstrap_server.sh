#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=tools/_runtime_common.sh
source "$ROOT/tools/_runtime_common.sh"

server_dir="${SERVER_DIR:-$BTM_DEFAULT_SERVER_DIR}"
port="$BTM_SERVER_PORT"
reset=0

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--server-dir PATH] [--port PORT] [--reset-runtime]

Bootstraps a portable Forge dedicated server root for local agent testing.
Installs Forge ${BTM_FORGE_COORD} when run.sh/libraries are missing, syncs managed pack
source, accepts the EULA for local testing, and writes local offline server.properties.

Runtime/world state is preserved unless --reset-runtime is passed.
USAGE
}

while (($#)); do
  case "$1" in
    --server-dir) server_dir="${2:-}"; [[ -n "$server_dir" ]] || btm_usage_error "--server-dir needs a path"; shift 2 ;;
    --port) port="${2:-}"; [[ "$port" =~ ^[0-9]+$ ]] || btm_usage_error "--port needs a number"; shift 2 ;;
    --reset-runtime) reset=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) btm_usage_error "unknown argument: $1" ;;
  esac
done

java_bin="$(btm_java17)"
installer="$(btm_find_forge_installer "$ROOT")"
[[ -n "$installer" && -f "$installer" ]] || {
  echo "ERROR: forge-${BTM_FORGE_COORD}-installer.jar not found under repo/server roots" >&2
  exit 1
}

mkdir -p "$server_dir"
mkdir -p "$server_dir/generated/runtime-dumps"
if [[ "$reset" == "1" ]]; then
  rm -rf "$server_dir/world" "$server_dir/logs" "$server_dir/crash-reports"
fi

"$ROOT/tools/sync_to_server.sh" --apply --server-dir "$server_dir"
cp "$installer" "$server_dir/forge-${BTM_FORGE_COORD}-installer.jar"

if [[ "${BTM_SKIP_PACKWIZ_DOWNLOADS:-0}" != "1" ]]; then
  "$ROOT/tools/resolve_packwiz_downloads.mjs" --apply --pack-root "$ROOT" --target-dir "$server_dir" --side server
fi

for jar_cache in "$ROOT/server-template/mods" "$ROOT/server-instance/mods"; do
  [[ -d "$jar_cache" ]] || continue
  [[ "$(cd "$jar_cache" && pwd)" == "$(cd "$server_dir/mods" 2>/dev/null && pwd)" ]] && continue
  mapfile -t server_excludes < <(btm_rsync_server_excludes)
  rsync -a --ignore-existing "${server_excludes[@]}" --include='*/' --include='*.jar' --include='*.so' --exclude='*' "$jar_cache/" "$server_dir/mods/"
done

for library_cache in \
  "$ROOT/server-template/libraries" \
  "$ROOT/server-instance/libraries" \
  "${BTM_PRISM_ROOT:-$HOME/.local/share/PrismLauncher}/libraries"; do
  [[ -d "$library_cache" ]] || continue
  mkdir -p "$server_dir/libraries"
  [[ "$(cd "$library_cache" && pwd)" == "$(cd "$server_dir/libraries" && pwd)" ]] && continue
  rsync -a --ignore-existing --include='*/' --include='*.jar' --include='*.pom' --exclude='*' "$library_cache/" "$server_dir/libraries/"
done

if [[ ! -f "$server_dir/run.sh" || ! -d "$server_dir/libraries/net/minecraftforge/forge/${BTM_FORGE_COORD}" ]]; then
  (cd "$server_dir" && "$java_bin" -jar "forge-${BTM_FORGE_COORD}-installer.jar" --installServer)
fi

printf 'eula=true\n' > "$server_dir/eula.txt"
btm_write_local_server_properties "$server_dir/server.properties" "$port"

if [[ ! -f "$server_dir/user_jvm_args.txt" ]]; then
  cat > "$server_dir/user_jvm_args.txt" <<'EOF'
-Xms2G
-Xmx6G
-XX:+UseG1GC
-Dfile.encoding=UTF-8
EOF
fi

echo "Bootstrapped server runtime: $server_dir"
echo "Launch with: (cd '$server_dir' && ./run.sh nogui)"
