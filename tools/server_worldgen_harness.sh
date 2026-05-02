#!/usr/bin/env bash
set -euo pipefail

SERVER_DIR="${1:-/home/gerald/obelisks/server-instance}"
CYCLES="${2:-100}"
TIMEOUT_SEC="${3:-420}"
BASE_PORT="${4:-25565}"
cd "$SERVER_DIR"

mkdir -p harness-logs
SUMMARY="harness-logs/summary-$(date +%Y%m%d-%H%M%S).csv"
ln -sfn "$(basename "$SUMMARY")" harness-logs/latest-summary.csv
: > harness-logs/progress.log

echo "cycle,start_ts,end_ts,status,done_seconds,server_port,java_pid,log_file" > "$SUMMARY"

level_name=$(awk -F'=' '/^level-name=/{print $2}' server.properties | tr -d '\r' || true)
[[ -z "${level_name:-}" ]] && level_name="world"
orig_port=$(awk -F'=' '/^server-port=/{print $2}' server.properties | tr -d '\r' || true)
[[ -z "${orig_port:-}" ]] && orig_port="$BASE_PORT"

find_java_pid() {
  local parent_pid="$1"
  ps -o pid= --ppid "$parent_pid" | awk 'NR==1{print $1}'
}

port_in_use() {
  local port="$1"
  ss -ltn 2>/dev/null | awk '{print $4}' | grep -qE "[:.]${port}$"
}

cleanup_lingering_server_pids() {
  local pids
  pids=$(pgrep -f "/home/gerald/obelisks/server-instance/.*unix_args.txt nogui" || true)
  if [[ -n "${pids:-}" ]]; then
    echo "Cleaning lingering server java pids: $pids"
    kill -TERM $pids 2>/dev/null || true
    sleep 2
    pids=$(pgrep -f "/home/gerald/obelisks/server-instance/.*unix_args.txt nogui" || true)
    [[ -n "${pids:-}" ]] && kill -KILL $pids 2>/dev/null || true
  fi
}

for ((i=1; i<=CYCLES; i++)); do
  start_ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  tag=$(printf "%03d" "$i")
  log_file="harness-logs/cycle-${tag}.log"
  runtime_log="logs/latest.log"
  server_port=$((BASE_PORT + i))
  cleanup_lingering_server_pids
  while port_in_use "$server_port"; do
    echo "Port $server_port busy, incrementing."
    server_port=$((server_port + 1))
  done

  if grep -q '^server-port=' server.properties; then
    sed -i "s/^server-port=.*/server-port=${server_port}/" server.properties
  else
    printf '\nserver-port=%s\n' "$server_port" >> server.properties
  fi

  rm -rf "$level_name" "${level_name}_nether" "${level_name}_the_end"
  rm -f "$runtime_log"

  echo "===== CYCLE ${i} START (port=${server_port}) ====="
  # Stream directly to tmux pane; parse Forge's canonical runtime log for state.
  ./run.sh nogui &
  launcher_pid=$!

  java_pid=""
  for _ in {1..30}; do
    java_pid=$(find_java_pid "$launcher_pid")
    [[ -n "$java_pid" ]] && break
    sleep 1
  done

  status="TIMEOUT"
  done_seconds=""

  for ((t=1; t<=TIMEOUT_SEC; t++)); do
    if [[ -f "$runtime_log" ]] && grep -q 'Done (' "$runtime_log"; then
      status="OK"
      done_seconds=$(sed -nE 's/.*Done \(([0-9.]+)s\).*/\1/p' "$runtime_log" | tail -n 1)
      break
    fi
    if [[ -f "$runtime_log" ]] && grep -qE 'Missing or unsupported mandatory dependencies|Failed to complete lifecycle event|Mod Loading has failed|\[main/FATAL\]|FAILED TO BIND TO PORT' "$runtime_log"; then
      status="CRASH"
      break
    fi
    if [[ -n "$java_pid" ]] && ! kill -0 "$java_pid" 2>/dev/null; then
      status="CRASH"
      break
    fi
    sleep 1
  done

  if [[ -n "$java_pid" ]] && kill -0 "$java_pid" 2>/dev/null; then
    kill -INT "$java_pid" 2>/dev/null || true
    for _ in {1..40}; do
      kill -0 "$java_pid" 2>/dev/null || break
      sleep 1
    done
  fi
  if [[ -n "$java_pid" ]] && kill -0 "$java_pid" 2>/dev/null; then kill -TERM "$java_pid" 2>/dev/null || true; sleep 2; fi
  if [[ -n "$java_pid" ]] && kill -0 "$java_pid" 2>/dev/null; then kill -KILL "$java_pid" 2>/dev/null || true; fi

  kill -TERM "$launcher_pid" 2>/dev/null || true
  wait "$launcher_pid" 2>/dev/null || true
  [[ -f "$runtime_log" ]] && cp "$runtime_log" "$log_file" || true
  end_ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "$i,$start_ts,$end_ts,$status,$done_seconds,$server_port,${java_pid:-},$log_file" >> "$SUMMARY"
  echo "[$(date +%H:%M:%S)] cycle=$i status=$status port=$server_port done_s=${done_seconds:-}" | tee -a harness-logs/progress.log
  echo "===== CYCLE ${i} END status=${status} done_s=${done_seconds:-} ====="
done

if grep -q '^server-port=' server.properties; then
  sed -i "s/^server-port=.*/server-port=${orig_port}/" server.properties
else
  printf '\nserver-port=%s\n' "$orig_port" >> server.properties
fi

echo "Completed $CYCLES cycles. Summary: $SUMMARY"
