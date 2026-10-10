#!/usr/bin/env bash
set -Eeuo pipefail

LOCK_FILE=/var/lock/accessory-as-deploy.lock
exec 200>"$LOCK_FILE"
if ! flock -n 200; then
  printf 'another deploy is currently running\n' >&2
  exit 1
fi

APP_DIR=/opt/accessory-as
APP_CONTAINER=accessory_as_app
APP_IMAGE=accessory-as-app
HEALTH_URL=http://127.0.0.1:3002/api/health
SHA=${1:-}

if [[ ! "$SHA" =~ ^[0-9a-f]{40}$ ]]; then
  printf 'invalid commit SHA\n' >&2
  exit 2
fi

cd "$APP_DIR"
if [[ -z "${ACCESSORY_AS_REEXEC:-}" ]]; then
  previous_revision=$(git rev-parse HEAD)
  previous_image=$(docker inspect --format '{{.Image}}' "$APP_CONTAINER")
  git fetch --no-tags origin "$SHA"
  git cat-file -e "$SHA^{commit}"
  if [[ "$previous_revision" != "$SHA" ]]; then
    git checkout --detach --force "$SHA"
    ACCESSORY_AS_REEXEC=1 \
    ACCESSORY_AS_PREVIOUS_REVISION="$previous_revision" \
    ACCESSORY_AS_PREVIOUS_IMAGE="$previous_image" \
    exec /usr/bin/env bash "$APP_DIR/ops/deploy/accessory-as-deploy.sh" "$SHA"
  fi
else
  previous_revision="${ACCESSORY_AS_PREVIOUS_REVISION:?missing previous revision}"
  previous_image="${ACCESSORY_AS_PREVIOUS_IMAGE:?missing previous image}"
fi
rollback_tag="${APP_IMAGE}:rollback-${previous_revision}"

rollback() {
  local status=$?
  trap - ERR
  set +e
  printf 'deploy failed; rolling back to %s\n' "$previous_revision" >&2
  git checkout --detach --force "$previous_revision"
  docker image tag "$previous_image" "$APP_IMAGE"
  docker compose up -d --no-deps app
  docker compose ps
  exit "$status"
}
trap rollback ERR

docker image inspect "$previous_image" >/dev/null
docker image tag "$previous_image" "$rollback_tag"
git checkout --detach --force "$SHA"
docker compose build app
docker compose up -d --no-deps app

for attempt in $(seq 1 30); do
  response=$(curl --fail --silent --show-error "$HEALTH_URL" 2>/dev/null || true)
  if [[ "$response" == *'"ok":true'* && "$response" == *'"db":"connected"'* ]]; then
    docker image rm "$rollback_tag" >/dev/null 2>&1 || true
    trap - ERR
    printf 'deployed %s\n' "$SHA"
    exit 0
  fi
  sleep 2
done

docker compose logs --tail=80 app >&2
false
