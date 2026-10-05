#!/usr/bin/env bash
#
# Smoke-test a built tornjak-frontend image.
#
# `make images` only proves the image builds. This starts it and checks that it
# actually serves the app, which catches a broken bundle, a failed
# react-inject-env step, or a bad entrypoint -- none of which fail the build.
#
# Usage: scripts/smoke-test-frontend.sh <image[:tag]> [host-port]

set -euo pipefail

IMAGE="${1:?usage: $0 <image[:tag]> [host-port]}"
PORT="${2:-3000}"
CONTAINER="tornjak-frontend-smoke-$$"
URL="http://localhost:${PORT}"
TIMEOUT_SECS=60

cleanup() {
    # Surface container logs on failure -- without them a CI failure here is
    # very hard to diagnose.
    if [ "${FAILED:-0}" != "0" ]; then
        echo "--- docker logs ${CONTAINER} ---" >&2
        docker logs "${CONTAINER}" 2>&1 | tail -50 >&2 || true
    fi
    docker rm -f "${CONTAINER}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

fail() {
    FAILED=1
    echo "SMOKE TEST FAILED: $*" >&2
    exit 1
}

echo "Starting ${IMAGE} as ${CONTAINER} on port ${PORT}"
docker run -d --name "${CONTAINER}" \
    -p "${PORT}:${PORT}" \
    -e PORT_FE="${PORT}" \
    -e REACT_APP_API_SERVER_URI="http://localhost:10000" \
    "${IMAGE}" >/dev/null

echo "Waiting up to ${TIMEOUT_SECS}s for the app to serve..."
deadline=$(( $(date +%s) + TIMEOUT_SECS ))
until curl -fsS -o /dev/null "${URL}" 2>/dev/null; do
    if [ "$(date +%s)" -ge "${deadline}" ]; then
        fail "no HTTP 200 from ${URL} within ${TIMEOUT_SECS}s"
    fi
    if ! docker ps -q --filter "name=${CONTAINER}" | grep -q .; then
        fail "container exited before serving a response"
    fi
    sleep 2
done

status=$(curl -s -o /dev/null -w '%{http_code}' "${URL}")
[ "${status}" = "200" ] || fail "expected HTTP 200 from ${URL}, got ${status}"
echo "OK: ${URL} returned 200"

body=$(curl -fsS "${URL}")

# The served page must be the built React app, not a directory listing or an
# error page from `serve`.
grep -qi '<div id="root"></div>' <<<"${body}" \
    || fail "served page has no React root element"
echo "OK: page contains the React root element"

# react-inject-env writes this at container start; index.html references it.
# If the entrypoint's inject step failed, the app loads with no runtime config.
grep -q 'tmp/env.js' <<<"${body}" \
    || fail "served page does not reference the injected env.js"
echo "OK: page references the injected env.js"

env_status=$(curl -s -o /dev/null -w '%{http_code}' "${URL}/tmp/env.js")
[ "${env_status}" = "200" ] || fail "expected HTTP 200 for /tmp/env.js, got ${env_status}"
echo "OK: ${URL}/tmp/env.js returned 200"

# The injected file should carry the env var we passed to `docker run`,
# which is what makes the image re-configurable without a rebuild.
env_js=$(curl -fsS "${URL}/tmp/env.js")
grep -q 'REACT_APP_API_SERVER_URI' <<<"${env_js}" \
    || fail "env.js does not contain REACT_APP_API_SERVER_URI"
echo "OK: env.js contains the injected REACT_APP_API_SERVER_URI"

echo "Frontend smoke test passed."
