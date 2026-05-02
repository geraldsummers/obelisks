#!/usr/bin/env bash
set -Eeuo pipefail

# Dedicated server + Prism client A/B profiler.
# A = baseline (fake player disabled), B = fake player enabled.

ROOT="${ROOT:-/home/gerald/obelisks}"
SERVER_DIR="${SERVER_DIR:-$ROOT/server-instance}"
PRISM_ROOT="${PRISM_ROOT:-$HOME/.local/share/PrismLauncher}"
PRISM_INSTANCE="${PRISM_INSTANCE:-Bound to Matter-Playtest 3 - v1}"
OUT_DIR="${OUT_DIR:-$ROOT/docs/memory_variants}"
SAMPLE_SEC="${SAMPLE_SEC:-2}"
BOOT_TIMEOUT_SEC="${BOOT_TIMEOUT_SEC:-600}"
JOIN_TIMEOUT_SEC="${JOIN_TIMEOUT_SEC:-420}"
POST_JOIN_SETTLE_SEC="${POST_JOIN_SETTLE_SEC:-90}"
BASE_PORT="${BASE_PORT:-27200}"

mkdir -p "$OUT_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
CSV="$OUT_DIR/server_client_ab_${STAMP}.csv"
SUMMARY="$OUT_DIR/server_client_ab_${STAMP}.summary.txt"

PRISM_LAUNCH="$ROOT/tools/launch_prism_instance.sh"
[[ -x "$PRISM_LAUNCH" ]] || { echo "Missing launcher helper: $PRISM_LAUNCH"; exit 1; }

SERVER_LOG="$SERVER_DIR/logs/latest.log"
SERVER_PROPS="$SERVER_DIR/server.properties"
SERVER_MODS="$SERVER_DIR/mods"
PRISM_MODS="$PRISM_ROOT/instances/$PRISM_INSTANCE/minecraft/mods"

echo "phase,elapsed_sec,server_rss_kb,client_rss_kb,total_rss_kb,server_pid,client_pid,joined" > "$CSV"

server_launcher_pid=""
server_java_pid=""
client_root_pid=""
client_java_pid=""
disabled_files=()
orig_port=""

cleanup() {
  set +e
  if [[ -n "${client_java_pid:-}" ]]; then kill -TERM "$client_java_pid" 2>/dev/null; fi
  if [[ -n "${client_root_pid:-}" ]]; then kill -TERM "$client_root_pid" 2>/dev/null; fi
  if [[ -n "${server_java_pid:-}" ]]; then
    kill -INT "$server_java_pid" 2>/dev/null
    sleep 2
    kill -TERM "$server_java_pid" 2>/dev/null
  fi
  if [[ -n "${server_launcher_pid:-}" ]]; then kill -TERM "$server_launcher_pid" 2>/dev/null; fi
  sleep 2
  if [[ -n "${client_java_pid:-}" ]]; then kill -KILL "$client_java_pid" 2>/dev/null; fi
  if [[ -n "${client_root_pid:-}" ]]; then kill -KILL "$client_root_pid" 2>/dev/null; fi
  if [[ -n "${server_java_pid:-}" ]]; then kill -KILL "$server_java_pid" 2>/dev/null; fi
  if [[ -n "${server_launcher_pid:-}" ]]; then kill -KILL "$server_launcher_pid" 2>/dev/null; fi
  for f in "${disabled_files[@]}"; do
    [[ -f "$f" ]] && mv "$f" "${f%.disabled}"
  done
  if [[ -n "${orig_port:-}" ]]; then
    sed -i "s/^server-port=.*/server-port=${orig_port}/" "$SERVER_PROPS"
  fi
}
trap cleanup EXIT

children_of() {
  local roots=("$@")
  local next=() p c
  while ((${#roots[@]})); do
    next=()
    for p in "${roots[@]}"; do
      [[ -n "$p" ]] || continue
      while IFS= read -r c; do
        [[ -n "$c" ]] || continue
        echo "$c"
        next+=("$c")
      done < <(pgrep -P "$p" 2>/dev/null || true)
    done
    roots=("${next[@]}")
  done
}

sum_rss_tree() {
  local root_pid="$1"
  local sum=0
  local p row rss
  [[ -n "$root_pid" ]] || { echo 0; return; }
  for p in "$root_pid" $(children_of "$root_pid" | sort -nu); do
    row="$(ps -p "$p" -o rss= 2>/dev/null || true)"
    rss="$(echo "$row" | awk '{print $1}')"
    [[ "$rss" =~ ^[0-9]+$ ]] || continue
    sum=$((sum + rss))
  done
  echo "$sum"
}

pick_java_child() {
  local root="$1"
  local p row
  for p in "$root" $(children_of "$root" | sort -nu); do
    row="$(ps -p "$p" -o args= 2>/dev/null || true)"
    if echo "$row" | rg -q 'java .*unix_args.txt|java .*org\.prismlauncher|java .*minecraft'; then
      echo "$p"
      return 0
    fi
  done
  return 1
}

set_fake_player_enabled() {
  local enabled="$1"
  local mod_paths=()
  while IFS= read -r -d '' f; do mod_paths+=("$f"); done < <(find "$SERVER_MODS" "$PRISM_MODS" -maxdepth 1 -type f \( -iname 'players-forge-*.jar' -o -iname 'fakeplayers-*.jar' \) -print0 2>/dev/null || true)

  if [[ "$enabled" == "0" ]]; then
    for f in "${mod_paths[@]}"; do
      if [[ -f "$f" ]]; then
        mv "$f" "$f.disabled"
        disabled_files+=("$f.disabled")
      fi
    done
  else
    local d
    for d in "${disabled_files[@]}"; do
      [[ -f "$d" ]] && mv "$d" "${d%.disabled}"
    done
    disabled_files=()
  fi
}

start_server() {
  local phase="$1"
  local port="$2"
  rm -f "$SERVER_LOG"
  rm -rf "$SERVER_DIR/world" "$SERVER_DIR/world_nether" "$SERVER_DIR/world_the_end"

  if [[ -z "${orig_port:-}" ]]; then
    orig_port="$(awk -F'=' '/^server-port=/{print $2}' "$SERVER_PROPS" | tr -d '\r' || true)"
    [[ -n "$orig_port" ]] || orig_port="25565"
  fi
  if grep -q '^server-port=' "$SERVER_PROPS"; then
    sed -i "s/^server-port=.*/server-port=${port}/" "$SERVER_PROPS"
  else
    printf '\nserver-port=%s\n' "$port" >> "$SERVER_PROPS"
  fi

  (
    cd "$SERVER_DIR"
    ./run.sh nogui
  ) > "$OUT_DIR/${phase}.server.log" 2>&1 &
  server_launcher_pid=$!

  local t
  for ((t=0; t<BOOT_TIMEOUT_SEC; t++)); do
    if [[ -f "$SERVER_LOG" ]] && rg -q 'Done \(' "$SERVER_LOG"; then
      server_java_pid="$(pick_java_child "$server_launcher_pid" || true)"
      return 0
    fi
    if [[ -f "$SERVER_LOG" ]] && rg -q 'Mod Loading has failed|FAILED TO BIND TO PORT|FATAL|Exception' "$SERVER_LOG"; then
      return 1
    fi
    sleep 1
  done
  return 1
}

start_client() {
  local phase="$1"
  "$PRISM_LAUNCH" "$PRISM_INSTANCE" -- --offline Dev > "$OUT_DIR/${phase}.client.log" 2>&1 &
  client_root_pid=$!
  local t
  for ((t=0; t<120; t++)); do
    client_java_pid="$(pick_java_child "$client_root_pid" || true)"
    [[ -n "$client_java_pid" ]] && return 0
    sleep 1
  done
  return 1
}

run_phase() {
  local phase="$1"       # baseline | fakeplayer
  local fake_enabled="$2" # 0|1
  local port="$3"

  echo "=== phase=$phase fake_player_enabled=$fake_enabled port=$port ===" | tee -a "$SUMMARY"
  set_fake_player_enabled "$fake_enabled"

  start_server "$phase" "$port" || { echo "Server failed in $phase" | tee -a "$SUMMARY"; return 1; }
  start_client "$phase" || { echo "Client failed in $phase" | tee -a "$SUMMARY"; return 1; }

  local start now elapsed joined=0
  local joined_at=-1
  local peak_total=0 peak_server=0 peak_client=0
  start="$(date +%s)"

  while true; do
    now="$(date +%s)"
    elapsed=$((now - start))
    local s_rss c_rss total
    s_rss="$(sum_rss_tree "$server_launcher_pid")"
    c_rss="$(sum_rss_tree "$client_root_pid")"
    total=$((s_rss + c_rss))
    (( total > peak_total )) && peak_total="$total"
    (( s_rss > peak_server )) && peak_server="$s_rss"
    (( c_rss > peak_client )) && peak_client="$c_rss"

    if [[ -f "$SERVER_LOG" ]] && rg -q 'joined the game|logged in with entity id' "$SERVER_LOG"; then
      joined=1
      if (( joined_at < 0 )); then joined_at="$elapsed"; fi
    fi

    echo "$phase,$elapsed,$s_rss,$c_rss,$total,${server_java_pid:-},${client_java_pid:-},$joined" >> "$CSV"

    if (( joined == 1 && elapsed - joined_at >= POST_JOIN_SETTLE_SEC )); then
      break
    fi
    if (( joined == 0 && elapsed >= JOIN_TIMEOUT_SEC )); then
      break
    fi
    if ! kill -0 "$server_launcher_pid" 2>/dev/null; then break; fi
    if ! kill -0 "$client_root_pid" 2>/dev/null; then break; fi
    sleep "$SAMPLE_SEC"
  done

  printf '%s peak_total_gib=%.2f peak_server_gib=%.2f peak_client_gib=%.2f joined=%s joined_at_sec=%s\n' \
    "$phase" \
    "$(awk -v k="$peak_total" 'BEGIN{print k/1024/1024}')" \
    "$(awk -v k="$peak_server" 'BEGIN{print k/1024/1024}')" \
    "$(awk -v k="$peak_client" 'BEGIN{print k/1024/1024}')" \
    "$joined" "$joined_at" | tee -a "$SUMMARY"

  # Stop processes before next phase
  if [[ -n "${client_java_pid:-}" ]]; then kill -TERM "$client_java_pid" 2>/dev/null || true; fi
  if [[ -n "${client_root_pid:-}" ]]; then kill -TERM "$client_root_pid" 2>/dev/null || true; fi
  if [[ -n "${server_java_pid:-}" ]]; then kill -INT "$server_java_pid" 2>/dev/null || true; fi
  sleep 3
  if [[ -n "${server_java_pid:-}" ]]; then kill -TERM "$server_java_pid" 2>/dev/null || true; fi
  if [[ -n "${server_launcher_pid:-}" ]]; then kill -TERM "$server_launcher_pid" 2>/dev/null || true; fi
  sleep 2
  if [[ -n "${client_root_pid:-}" ]]; then kill -KILL "$client_root_pid" 2>/dev/null || true; fi
  if [[ -n "${server_launcher_pid:-}" ]]; then kill -KILL "$server_launcher_pid" 2>/dev/null || true; fi

  client_root_pid=""
  client_java_pid=""
  server_launcher_pid=""
  server_java_pid=""
}

run_phase baseline 0 "$BASE_PORT"
run_phase fakeplayer 1 "$((BASE_PORT + 1))"

echo "CSV: $CSV" | tee -a "$SUMMARY"
echo "Summary: $SUMMARY" | tee -a "$SUMMARY"
