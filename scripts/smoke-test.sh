#!/usr/bin/env bash
# Post-deploy smoke test against the public site. Exits non-zero if any check
# doesn't return exactly HTTP 200 (with the expected body) within the retries.
#   ./scripts/smoke-test.sh https://aiphilo.pathofbalance.io
set -uo pipefail

base=${1:?usage: $0 <base-url>}
base=${base%/}
attempts=${ATTEMPTS:-12}
delay=${DELAY:-10}
body=$(mktemp)
trap 'rm -f "$body"' EXIT

check() {
  local name=$1 path=$2 pattern=$3 code i
  for i in $(seq 1 "$attempts"); do
    code=$(curl -s -o "$body" -w '%{http_code}' --max-time 10 "$base$path" || true)
    if [ "$code" = 200 ] && grep -q "$pattern" "$body"; then
      echo "ok   $name ($base$path) after $i attempt(s)"
      return 0
    fi
    echo "wait $name: attempt $i/$attempts got HTTP ${code:-000}"
    [ "$i" -lt "$attempts" ] && sleep "$delay"
  done
  echo "FAIL $name ($base$path): no 200 with expected body after $attempts attempts" >&2
  return 1
}

rc=0
check "backend health" /api/health '"status":"ok"' || rc=1
# The SPA serves its shell for every route, so also require the React root element.
check "login page" /login 'id="root"' || rc=1
exit $rc
