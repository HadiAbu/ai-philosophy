#!/usr/bin/env bash
# Deploy one service at a given image tag (a commit SHA, or "latest").
#   ./scripts/deploy.sh backend  <tag>
#   ./scripts/deploy.sh frontend <tag>
#   ./scripts/deploy.sh history            # show past deploys, newest last
# Rollback = run it again with the previous SHA from `history`.
set -euo pipefail
cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.prod.yml"
TAGS_FILE=.image-tags        # current tag per service, read by compose via --env-file
HISTORY_FILE=.deploy-history # append-only: <utc time> <service> <tag>

if [ "${1:-}" = "history" ]; then
  cat "$HISTORY_FILE" 2>/dev/null || echo "no deploys recorded"
  exit 0
fi

service=${1:-}
tag=${2:-}
case "$service" in
  backend|frontend) ;;
  *) echo "usage: $0 <backend|frontend> <tag> | history" >&2; exit 2 ;;
esac
[ -n "$tag" ] || { echo "usage: $0 $service <tag>" >&2; exit 2; }

var="$(echo "$service" | tr a-z A-Z)_TAG"
touch "$TAGS_FILE"
new_tags=$(mktemp)
trap 'rm -f "$new_tags"' EXIT
{ grep -v "^${var}=" "$TAGS_FILE" || true; echo "${var}=${tag}"; } > "$new_tags"

# Pull first: a bad tag fails here, before anything is restarted or recorded.
$COMPOSE --env-file "$new_tags" pull "$service"
$COMPOSE --env-file "$new_tags" up -d "$service" nginx

# Only record the tag once the deploy succeeded, so a failed deploy leaves
# the previously running tag as the source of truth.
previous=$(awk -v s="$service" '$2==s {t=$3} END {print t}' "$HISTORY_FILE" 2>/dev/null || true)
cp "$new_tags" "$TAGS_FILE"
echo "$(date -u +%FT%TZ) $service $tag" >> "$HISTORY_FILE"

docker image prune -f
crontab -l 2>/dev/null | grep -qF "docker system prune" || (crontab -l 2>/dev/null; echo "0 2 * * 0 docker system prune -f") | crontab -

echo "deployed $service@$tag${previous:+ (previous: $previous — rollback: $0 $service $previous)}"
