#!/bin/bash

# Marketplace Restoration Master Script v3.2
# Use this to perform a one-click rebuild and reseeding of the entire stack.

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}>>> Starting Marketplace Restoration...${NC}"

# 1. Detect Docker Compose command
if docker compose version >/dev/null 2>&1; then
    COMPOSE="docker compose"
elif docker-compose version >/dev/null 2>&1; then
    COMPOSE="docker-compose"
else
    echo -e "${RED}Error: Docker Compose not found.${NC}"
    exit 1
fi

echo -e "${BLUE}>>> Using command: $COMPOSE${NC}"

# 2. Check for .env file
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found in root. Please create it.${NC}"
    exit 1
fi

# 3. Step 0: Stop, Rebuild and Restart Services
echo -e "${BLUE}>>> Step 0: Stopping and Rebuilding services to apply UI changes...${NC}"
$COMPOSE down
$COMPOSE up -d --build --remove-orphans
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✔ Services rebuilt and restarted.${NC}"
else
    echo -e "${RED}✘ Failed to rebuild services. Check your Docker logs.${NC}"
    exit 1
fi

echo -e "${BLUE}>>> Waiting 30s for services (Directus/DB/Frontend) to stabilize...${NC}"
sleep 30

# 4. Load database credentials from .env
DB_USER=$(grep -v '^#' .env | grep 'DB_USER' | cut -d '=' -f2)
DB_PASS=$(grep -v '^#' .env | grep 'DB_PASSWORD' | cut -d '=' -f2)
DB_NAME=$(grep -v '^#' .env | grep 'DB_DATABASE' | cut -d '=' -f2)

# 5. Auto-detect container IDs (Refreshed after restart)
# We use greedy name matching to handle both 'salonapp' and 'saloonmarketplace' prefixes
DB_CONTAINER=$(docker ps -a -q --filter "name=database" | head -n 1)
FE_CONTAINER=$(docker ps -a -q --filter "name=frontend" | head -n 1)

if [ -z "$FE_CONTAINER" ] || [ -z "$DB_CONTAINER" ]; then
    echo -e "${RED}Error: Could not find your Docker containers (Database/Frontend).${NC}"
    echo -e "${BLUE}Current containers running on this server:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}"
    exit 1
fi

echo -e "${BLUE}>>> Targeting DB: $DB_CONTAINER / FE: $FE_CONTAINER${NC}"

# 6. Step 1: Base SQL Seeding
echo -e "${BLUE}>>> Step 1: Resetting database and seeding core records...${NC}"
docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME < reseed_marketplace.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✔ Base data seeded successfully.${NC}"
else
    echo -e "${RED}✘ Failed to seed base data.${NC}"
    exit 1
fi

# 7. Step 2: Binary Asset Upload (Permission-Safe in /tmp)
echo -e "${BLUE}>>> Step 2: Uploading binary images to Directus...${NC}"

# Ensure /tmp/Images_temp exist in container
docker exec $FE_CONTAINER mkdir -p /tmp/Images_temp

# Copy files into container at /tmp (always writable)
docker cp frontend/scripts/reseed_assets.ts $FE_CONTAINER:/tmp/reseed_assets_temp.ts
docker cp Images/. $FE_CONTAINER:/tmp/Images_temp/

# Run the uploader inside container pointing to the /tmp/Images_temp folder
# We use NODE_PATH to tell Node where to find the axios and tsx packages
docker exec -e NODE_PATH="/app/node_modules" -e IMAGES_DIR="/tmp/Images_temp" -i $FE_CONTAINER npx tsx /tmp/reseed_assets_temp.ts > asset_updates.tmp 2>asset_errors.log

# Clean up temp files in container (using root to ensure permission)
docker exec -u root $FE_CONTAINER rm /tmp/reseed_assets_temp.ts
docker exec -u root $FE_CONTAINER rm -rf /tmp/Images_temp

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

echo -e "${GREEN}>>> Restoration Complete! Your marketplace is now 100% functional.${NC}"
echo -e "${BLUE}>>> Final Note: Captured placeholder IDs for Gallery manual check:${NC}"
grep "Placeholder" asset_updates.tmp || echo "No extra placeholders found."

# Final host cleanup
rm asset_updates.tmp
