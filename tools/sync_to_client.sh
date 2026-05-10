#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=tools/_runtime_common.sh
source "$ROOT/tools/_runtime_common.sh"

mode=""
client_dir="${CLIENT_DIR:-}"

usage() {
  cat <<USAGE
Usage: $(basename "$0") --dry-run|--apply --client-dir PATH

Syncs repo-managed pack source into a client game directory.
Preserves saves, logs, screenshots, account/cache files, options.txt, and launcher state.
USAGE
}

while (($#)); do
  case "$1" in
    --dry-run|--apply) mode="$1"; shift ;;
    --client-dir) client_dir="${2:-}"; [[ -n "$client_dir" ]] || btm_usage_error "--client-dir needs a path"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) btm_usage_error "unknown argument: $1" ;;
  esac
done

[[ -n "$mode" ]] || btm_usage_error "choose --dry-run or --apply"
[[ -n "$client_dir" ]] || btm_usage_error "--client-dir is required"
btm_need rsync

mkdir -p "$client_dir"
mapfile -t excludes < <(btm_rsync_excludes)
rsync_flags=(-a --delete --prune-empty-dirs)
[[ "$mode" == "--dry-run" ]] && rsync_flags+=(--dry-run --itemize-changes)

for path in "${btm_managed_paths[@]}"; do
  [[ -e "$ROOT/$path" ]] || continue
  if [[ -d "$ROOT/$path" ]]; then
    mkdir -p "$client_dir/$path"
    rsync "${rsync_flags[@]}" "${excludes[@]}" "$ROOT/$path/" "$client_dir/$path/"
  else
    mkdir -p "$client_dir/$(dirname "$path")"
    rsync "${rsync_flags[@]}" "${excludes[@]}" "$ROOT/$path" "$client_dir/$path"
  fi
done

if [[ "$mode" == "--dry-run" ]]; then
  echo "Dry run complete for client target: $client_dir"
else
  echo "Synced client target: $client_dir"
fi
