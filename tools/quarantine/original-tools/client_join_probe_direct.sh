#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=tools/_runtime_common.sh
source "$ROOT/tools/_runtime_common.sh"

client_dir="${CLIENT_DIR:-}"
server_host="${SERVER_HOST:-127.0.0.1}"
server_port="${SERVER_PORT:-$BTM_SERVER_PORT}"
username="${CLIENT_USERNAME:-AgentClient}"
out_dir="${OUT_DIR:-/tmp/btm-client-join-probe-direct}"
timeout_sec="${JOIN_TIMEOUT_SEC:-600}"
settle_sec="${SETTLE_SEC:-30}"
keep_client="${KEEP_CLIENT:-0}"

usage() {
  cat <<USAGE
Usage: $(basename "$0") --client-dir PATH [--server HOST:PORT] [--username NAME]

Launches the direct client and watches server/client logs for a successful join.
The server must already be listening on HOST:PORT.
USAGE
}

while (($#)); do
  case "$1" in
    --client-dir) client_dir="${2:-}"; [[ -n "$client_dir" ]] || btm_usage_error "--client-dir needs a path"; shift 2 ;;
    --server)
      server="${2:-}"; [[ "$server" == *:* ]] || btm_usage_error "--server must be HOST:PORT"
      server_host="${server%:*}"; server_port="${server##*:}"; shift 2 ;;
    --username) username="${2:-}"; [[ -n "$username" ]] || btm_usage_error "--username needs a value"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) btm_usage_error "unknown argument: $1" ;;
  esac
done

[[ -n "$client_dir" ]] || btm_usage_error "--client-dir is required"
btm_need ss

if ! ss -ltn 2>/dev/null | awk '{print $4}' | grep -qE "[:.]${server_port}$"; then
  echo "ERROR: server is not listening on $server_host:$server_port" >&2
  exit 1
fi

stamp="$(date +%Y%m%d-%H%M%S)"
run_dir="$out_dir/$stamp"
summary="$run_dir/summary.txt"
client_log="$client_dir/logs/latest.log"
server_log="${SERVER_DIR:-$BTM_DEFAULT_SERVER_DIR}/logs/latest.log"
mkdir -p "$run_dir"
: > "$summary"
: > "$run_dir/.probe-start"

join_patterns='joined the game|logged in with entity id|UUID of player|is now connected'
fatal_patterns='Crash report|Mod Loading has failed|OutOfMemoryError|Preparing crash report|This crash report has been saved|Encountered an unexpected exception'
client_before="$(stat -c %Y "$client_log" 2>/dev/null || echo 0)"
server_before_size="$(stat -c %s "$server_log" 2>/dev/null || echo 0)"

"$ROOT/tools/launch_client_direct.sh" --client-dir "$client_dir" --username "$username" --server "$server_host:$server_port" >"$run_dir/client-stdout.log" 2>&1 &
client_pid=$!

finish() {
  local status="$1" reason="$2"
  [[ -f "$client_log" ]] && cp "$client_log" "$run_dir/client-latest.log" || true
  [[ -f "$server_log" ]] && cp "$server_log" "$run_dir/server-latest.log" || true
  {
    echo "status=$status"
    echo "reason=$reason"
    echo "run_dir=$run_dir"
    echo "client_dir=$client_dir"
    echo "server=$server_host:$server_port"
    echo "client_pid=$client_pid"
  } | tee -a "$summary"
  if [[ "$keep_client" != "1" ]]; then
    kill -TERM "$client_pid" 2>/dev/null || true
    sleep 2
    kill -KILL "$client_pid" 2>/dev/null || true
  fi
  [[ "$status" == "PASS" ]]
}

trap 'finish FAIL interrupted >/dev/null || true' INT TERM

start_epoch="$(date +%s)"
while true; do
  elapsed=$(($(date +%s) - start_epoch))
  if (( elapsed > timeout_sec )); then
    finish FAIL client_join_timeout || exit 1
    exit 1
  fi
  if ! kill -0 "$client_pid" 2>/dev/null; then
    finish FAIL client_process_exited || exit 1
    exit 1
  fi
  client_mtime="$(stat -c %Y "$client_log" 2>/dev/null || echo 0)"
  if [[ "$client_mtime" -gt "$client_before" ]] && rg -q "$fatal_patterns" "$client_log"; then
    finish FAIL client_fatal_log_signature || exit 1
    exit 1
  fi
  if [[ -f "$server_log" ]] && tail -c +"$((server_before_size + 1))" "$server_log" 2>/dev/null | rg -q "$fatal_patterns"; then
    finish FAIL server_fatal_log_signature || exit 1
    exit 1
  fi
  if [[ -f "$server_log" ]] && tail -c +"$((server_before_size + 1))" "$server_log" 2>/dev/null | rg -q "$join_patterns"; then
    sleep "$settle_sec"
    finish PASS client_joined_server || exit 1
    exit 0
  fi
  sleep 1
done
