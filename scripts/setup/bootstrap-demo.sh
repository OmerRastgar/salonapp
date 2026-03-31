#!/bin/sh
set -eu

MARKER_FILE="${BOOTSTRAP_MARKER_FILE:-/state/demo-bootstrap.done}"
FORCE_BOOTSTRAP="${FORCE_BOOTSTRAP:-false}"
DIRECTUS_INTERNAL_URL="${DIRECTUS_INTERNAL_URL:-http://directus:8055}"

mkdir -p "$(dirname "$MARKER_FILE")"

if [ "$FORCE_BOOTSTRAP" != "true" ] && [ -f "$MARKER_FILE" ]; then
  echo "Bootstrap already completed. Skipping."
  exit 0
fi

echo "Waiting for database..."
until PGPASSWORD="$DB_PASSWORD" psql -h database -U "$DB_USER" -d "$DB_DATABASE" -c "select 1" >/dev/null 2>&1; do
  sleep 2
done

echo "Waiting for Directus..."
until wget -q -O - "${DIRECTUS_INTERNAL_URL}/server/info" >/dev/null 2>&1; do
  sleep 2
done

echo "Applying database schema..."
for sql_file in \
  /workspace/rebuild_marketplace.sql \
  /workspace/register_collections.sql \
  /workspace/register_relations.sql \
  /workspace/permissions_public.sql \
  /workspace/permissions_public_system.sql
do
  echo "  -> $(basename "$sql_file")"
  PGPASSWORD="$DB_PASSWORD" psql -h database -U "$DB_USER" -d "$DB_DATABASE" -f "$sql_file"
done

echo "Running demo-data seeder..."
node /workspace/tests/scripts/seeder.js

date -u +"%Y-%m-%dT%H:%M:%SZ" > "$MARKER_FILE"
echo "Bootstrap completed."
