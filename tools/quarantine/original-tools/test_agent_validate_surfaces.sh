#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

passes=0
failures=0
last_output=""
include_static=0
surface_runtime="${BTM_AGENT_SURFACE_RUNTIME:-}"

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--include-static] [--runtime PATH]

Self-test the agent-oriented validation entry points and their evidence claims.
  --include-static  Also run the slower static tier with a poisoned BTM_INSTANCE.
  --runtime PATH    Also validate a known-good runtime through agent_validate.sh.

BTM_AGENT_SURFACE_RUNTIME can also provide the optional runtime path.
USAGE
}

while (($#)); do
  case "$1" in
    --include-static)
      include_static=1
      shift
      ;;
    --runtime)
      surface_runtime="${2:-}"
      [[ -n "$surface_runtime" ]] || {
        echo "ERROR: --runtime needs a path" >&2
        exit 2
      }
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "ERROR: unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

record_pass() {
  passes=$((passes + 1))
  echo "ok - $1"
}

record_fail() {
  failures=$((failures + 1))
  echo "FAIL - $1: $2" >&2
}

run_capture() {
  local status
  set +e
  last_output="$("$@" 2>&1)"
  status=$?
  set -e
  return "$status"
}

expect_status() {
  local name="$1" expected="$2"
  shift 2
  if run_capture "$@"; then
    status=0
  else
    status=$?
  fi
  if [[ "$status" == "$expected" ]]; then
    record_pass "$name"
  else
    record_fail "$name" "expected exit $expected, got $status"
    printf '%s\n' "$last_output" >&2
  fi
}

expect_output_contains() {
  local name="$1" needle="$2"
  if [[ "$last_output" == *"$needle"* ]]; then
    record_pass "$name"
  else
    record_fail "$name" "missing output: $needle"
    printf '%s\n' "$last_output" >&2
  fi
}

expect_output_lacks() {
  local name="$1" needle="$2"
  if [[ "$last_output" == *"$needle"* ]]; then
    record_fail "$name" "unexpected output: $needle"
    printf '%s\n' "$last_output" >&2
  else
    record_pass "$name"
  fi
}

missing_runtime="/tmp/btm-agent-surface-missing-runtime"
rm -rf "$missing_runtime"

expect_status "agent validation shell parses" 0 bash -n "$ROOT/tools/agent_validate.sh" "$ROOT/tools/server_content_smoke.sh"
expect_status "agent validation JS parses" 0 node --check "$ROOT/tools/pack_test_suite.mjs"
expect_status "autonomous validator JS parses" 0 node --check "$ROOT/tools/validate_autonomous_contracts.mjs"

expect_status "agent validate help exits cleanly" 0 "$ROOT/tools/agent_validate.sh" --help
expect_output_contains "help describes evidence strength" "Agent-oriented validation entry point with explicit evidence strength"
expect_output_contains "help names strict data dump scope" "--runtime --instance PATH [--strict-data-dumps]"
expect_output_contains "help explains strict data dump evidence" "--strict-data-dumps requires vanilla /dump output such as dump/data_raw/loot_tables"
expect_output_contains "help explains KubeJS dump separation" "separate from KubeJS audit dumps generated under kubejs/config"
expect_output_contains "help documents BTM_INSTANCE" "BTM_INSTANCE can provide --runtime's instance path"
expect_output_contains "help documents BTM_VALIDATE_JOBS" "BTM_VALIDATE_JOBS=N caps parallel JS syntax-check workers"

expect_status "choosing multiple tiers is rejected" 2 "$ROOT/tools/agent_validate.sh" --static --runtime
expect_output_contains "multiple tier error is specific" "choose exactly one tier"

expect_status "missing tier is rejected" 2 "$ROOT/tools/agent_validate.sh"
expect_output_contains "missing tier error is specific" "choose --static, --runtime, or --smoke"

expect_status "static rejects strict data dump flag" 2 "$ROOT/tools/agent_validate.sh" --static --strict-data-dumps
expect_output_contains "static strict-data-dumps error is specific" "--strict-data-dumps is only valid with --runtime"

expect_status "static rejects invalid worker count" 2 env BTM_VALIDATE_JOBS=bogus "$ROOT/tools/agent_validate.sh" --static
expect_output_contains "static invalid worker error is specific" "BTM_VALIDATE_JOBS must be a positive integer"

expect_status "runtime rejects smoke server dir flag" 2 "$ROOT/tools/agent_validate.sh" --runtime --instance "$missing_runtime" --server-dir /tmp/nope
expect_output_contains "runtime server-dir error is specific" "--server-dir is only valid with --smoke"

expect_status "runtime wrapper rejects missing instance before suite" 2 "$ROOT/tools/agent_validate.sh" --runtime --instance "$missing_runtime"
expect_output_contains "runtime wrapper missing instance error is specific" "runtime instance does not exist: $missing_runtime"

expect_status "runtime can use BTM_INSTANCE without instance arg" 2 env BTM_INSTANCE="$missing_runtime" "$ROOT/tools/agent_validate.sh" --runtime
expect_output_contains "runtime env instance error is specific" "runtime instance does not exist: $missing_runtime"

expect_status "direct pack suite rejects missing explicit instance" 1 env BTM_INSTANCE="$missing_runtime" BTM_STRICT_RUNTIME=1 node "$ROOT/tools/pack_test_suite.mjs"
expect_output_contains "direct pack suite missing instance error is specific" "FAIL - explicit BTM_INSTANCE exists: $missing_runtime"

expect_status "direct pack suite rejects invalid worker count" 1 env BTM_VALIDATE_JOBS=bogus node "$ROOT/tools/pack_test_suite.mjs"
expect_output_contains "direct pack suite invalid worker error is specific" "FAIL - BTM_VALIDATE_JOBS must be a positive integer"

expect_status "autonomous validator rejects missing explicit instance" 1 env BTM_INSTANCE="$missing_runtime" node "$ROOT/tools/validate_autonomous_contracts.mjs"
expect_output_contains "autonomous validator missing instance error is specific" "FAIL - explicit BTM_INSTANCE exists: $missing_runtime"
expect_output_contains "autonomous validator requires runtime food dump" "FAIL - runtime food effect dump exists: $missing_runtime/kubejs/config/food_effect_index.json"
expect_output_lacks "autonomous validator does not offer generated fallback under explicit instance" "or generated/runtime-dumps"

if [[ "$include_static" == "1" ]]; then
  expect_status "static tier ignores inherited BTM_INSTANCE" 0 env BTM_INSTANCE="$missing_runtime" "$ROOT/tools/agent_validate.sh" --static
  expect_output_contains "static tier claim remains non-runtime" "agent validate: claim=source and retained-dump evidence; no fresh runtime evidence was proven"
  expect_output_lacks "static tier does not inspect poisoned runtime" "$missing_runtime"
fi

if [[ -n "$surface_runtime" ]]; then
  if [[ -d "$surface_runtime" ]]; then
    expect_status "optional known-good runtime validates" 0 "$ROOT/tools/agent_validate.sh" --runtime --instance "$surface_runtime"
    expect_output_contains "optional known-good runtime claim is strict" "agent validate: claim=strict runtime evidence; data dumps strict=0"
    expect_status "runtime summary exposes evidence claims" 0 node -e "
const fs = require('fs')
const summary = JSON.parse(fs.readFileSync('generated/validation/automated_test_summary.json', 'utf8'))
if (summary.runtimeEvidenceClaim !== 'strict-runtime') throw new Error('runtimeEvidenceClaim=' + summary.runtimeEvidenceClaim)
if (summary.dataDumpEvidenceClaim !== 'opportunistic-vanilla-dump') throw new Error('dataDumpEvidenceClaim=' + summary.dataDumpEvidenceClaim)
if (!String(summary.dataDumpEvidenceScope || '').includes('separate from KubeJS audit dumps')) throw new Error('missing dataDumpEvidenceScope')
"
    expect_status "runtime report documents vanilla dump scope" 0 node -e "
const fs = require('fs')
const report = fs.readFileSync('generated/validation/automated_test_report.md', 'utf8')
if (!report.includes('Data dump evidence scope: vanilla')) throw new Error('missing report data dump scope prefix')
if (!report.includes('separate from KubeJS audit dumps')) throw new Error('missing report KubeJS separation')
"
    if [[ ! -d "$surface_runtime/dump/data_raw/loot_tables" ]]; then
      expect_status "optional runtime strict data dumps fail when vanilla dump is absent" 1 "$ROOT/tools/agent_validate.sh" --runtime --instance "$surface_runtime" --strict-data-dumps
      expect_output_contains "strict data dump failure is specific" "FAIL - generated loot dump tests: missing $surface_runtime/dump/data_raw/loot_tables"
      expect_output_lacks "strict data dump failure does not claim runtime pass" "agent validate: runtime passed"
    fi
  else
    expect_status "optional known-good runtime rejects missing path" 2 "$ROOT/tools/agent_validate.sh" --runtime --instance "$surface_runtime"
    expect_output_contains "optional missing runtime error is specific" "runtime instance does not exist: $surface_runtime"
  fi
fi

echo
echo "agent validation surface tests: $passes pass(es), $failures failure(s)"
if (( failures > 0 )); then
  exit 1
fi
