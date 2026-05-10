#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=tools/_runtime_common.sh
source "$ROOT/tools/_runtime_common.sh"

mode=""
client_dir="${CLIENT_DIR:-}"
server_dir="${SERVER_DIR:-$BTM_DEFAULT_SERVER_DIR}"

usage() {
  cat <<USAGE
Usage: $(basename "$0") --dry-run|--apply [--server-dir PATH] [--client-dir PATH]

Runs server sync and, when --client-dir is supplied, client sync.
USAGE
}

while (($#)); do
  case "$1" in
    --dry-run|--apply) mode="$1"; shift ;;
    --server-dir) server_dir="${2:-}"; [[ -n "$server_dir" ]] || btm_usage_error "--server-dir needs a path"; shift 2 ;;
    --client-dir) client_dir="${2:-}"; [[ -n "$client_dir" ]] || btm_usage_error "--client-dir needs a path"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) btm_usage_error "unknown argument: $1" ;;
  esac
done

[[ -n "$mode" ]] || btm_usage_error "choose --dry-run or --apply"

"$ROOT/tools/sync_to_server.sh" "$mode" --server-dir "$server_dir"
if [[ -n "$client_dir" ]]; then
  "$ROOT/tools/sync_to_client.sh" "$mode" --client-dir "$client_dir"
else
  echo "No --client-dir supplied; skipped client sync."
fi
