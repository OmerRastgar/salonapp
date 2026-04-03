#!/bin/bash

# Marketplace Restoration Master Script v4.0 (Disposable Seeder)
# Use this to perform a one-click rebuild and reseeding of the entire stack.

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}>>> Starting Master Orchestrator (v4.0)...${NC}"

# 1. Detect Docker Compose command and correct YAML file
if docker compose version >/dev/null 2>&1; then
    BASE_COMPOSE="docker compose"
elif docker-compose version >/dev/null 2>&1; then
    BASE_COMPOSE="docker-compose"
else
    echo -e "${RED}Error: Docker Compose not found.${NC}"
    exit 1
fi

COMPOSE_FILE="docker-compose.yml"
if [ -f "docker-compose-simple.yml" ] && grep -q "frontend:" "docker-compose-simple.yml"; then
    COMPOSE_FILE="docker-compose-simple.yml"
elif [ -f "docker-compose-no-health.yml" ] && grep -q "frontend:" "docker-compose-no-health.yml"; then
    COMPOSE_FILE="docker-compose-no-health.yml"
fi

COMPOSE="$BASE_COMPOSE -f $COMPOSE_FILE"
echo -e "${BLUE}>>> Using command: $COMPOSE${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found in root. Please create it.${NC}"
    exit 1
fi

# 3. Load database credentials from .env
DB_USER=$(grep -v '^#' .env | grep 'DB_USER' | cut -d '=' -f2)
DB_PASS=$(grep -v '^#' .env | grep 'DB_PASSWORD' | cut -d '=' -f2)
DB_NAME=$(grep -v '^#' .env | grep 'DB_DATABASE' | cut -d '=' -f2)

# 4. FULL REBUILD & RESTART (No Cache for UI sync)
echo -e "${BLUE}>>> Step 0: Performing Fresh Build (No-Cache) to ensure UI sync...${NC}"
$COMPOSE build --no-cache frontend
$COMPOSE down
$COMPOSE up -d --remove-orphans
echo -e "${BLUE}>>> Waiting 20s for services to be Healthy...${NC}"
sleep 20

# 5. Auto-detect Database container ID (Greedy match)
DB_CONTAINER=$(docker ps -q --filter "name=database" | head -n 1)
if [ -z "$DB_CONTAINER" ]; then
    echo -e "${RED}Error: Could not find Database container.${NC}"
    exit 1
fi

# 6. Step 1: Base SQL Seeding
echo -e "${BLUE}>>> Step 1: Resetting database and seeding core records...${NC}"
docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME < reseed_marketplace.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✔ Base data seeded successfully.${NC}"
else
    echo -e "${RED}✘ Failed to seed base data.${NC}"
    exit 1
fi

# 7. Step 2: Binary Asset Upload (via Disposable Node Container)
# This is much safer than running inside the production standalone container
echo -e "${BLUE}>>> Step 2: Running Asset Uploader (via Disposable Container)...${NC}"

# We use the official node image, mount the local volume, and run the script
# We set the network to match the compose network so it can find 'directus'
NETWORK_NAME=$(docker network ls --filter "name=marketplace-network" -q | head -n 1)

docker run --rm \
  --network "$NETWORK_NAME" \
  -v "$(pwd):/project" \
  -w /project/frontend \
  -e DIRECTUS_INTERNAL_URL="http://directus:8055" \
  -e DIRECTUS_TOKEN=$(grep 'DIRECTUS_TOKEN' .env | cut -d '=' -f2) \
  -e IMAGES_DIR="/project/Images" \
  node:20-alpine \
  sh -c "npm install axios form-data dotenv && npx tsx scripts/reseed_assets.ts" > asset_updates.tmp 2>asset_errors.log

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✔ Assets uploaded successfully.${NC}"
else
    echo -e "${RED}✘ Failed to upload assets. Check asset_errors.log for details.${NC}"
    exit 1
fi

# 8. Step 3: Dynamic Image Linkage
echo -e "${BLUE}>>> Step 3: Synchronizing image IDs...${NC}"
grep "UPDATE" asset_updates.tmp | docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✔ Image links synchronized.${NC}"
else
    echo -e "${RED}✘ Failed to synchronize image links.${NC}"
    exit 1
fi

echo -e "${GREEN}>>> SUCCESS! All UI changes are built and all data is seeded.${NC}"
echo -e "${BLUE}>>> Placeholder IDs for your Gallery check:${NC}"
grep "Placeholder" asset_updates.tmp || echo "No extra placeholders found."

# Final host cleanup
rm asset_updates.tmp
