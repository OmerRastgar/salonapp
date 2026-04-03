#!/bin/bash

# Marketplace Unified Reseeding Script (Linux Server Edition)
# This script restoration data and binary assets in a single run.

# 1. Detect Docker Compose Command
if docker compose version >/dev/null 2>&1; then
    COMPOSE="docker compose"
elif docker-compose version >/dev/null 2>&1; then
    COMPOSE="docker-compose"
else
    echo -e "${RED}Error: Neither 'docker compose' nor 'docker-compose' found.${NC}"
    exit 1
fi

echo -e "${BLUE}>>> Starting Marketplace Restoration...${NC}"

# 2. Check for .env file
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found in root. Please create it.${NC}"
    exit 1
fi

# 3. Load database credentials from .env
DB_USER=$(grep -v '^#' .env | grep 'DB_USER' | cut -d '=' -f2)
DB_PASS=$(grep -v '^#' .env | grep 'DB_PASSWORD' | cut -d '=' -f2)
DB_NAME=$(grep -v '^#' .env | grep 'DB_DATABASE' | cut -d '=' -f2)

# 4. Auto-detect container IDs
DB_CONTAINER=$($COMPOSE ps -q database 2>/dev/null)
FE_CONTAINER=$($COMPOSE ps -q frontend 2>/dev/null)

# Fallback discovery if compose ps -q fails (common on some setups)
if [ -z "$FE_CONTAINER" ]; then
    FE_CONTAINER=$(docker ps -q --filter "name=frontend")
fi
if [ -z "$DB_CONTAINER" ]; then
    DB_CONTAINER=$(docker ps -q --filter "name=database")
fi

if [ -z "$FE_CONTAINER" ] || [ -z "$DB_CONTAINER" ]; then
    echo -e "${RED}Error: Could not find your Docker containers (Database/Frontend).${NC}"
    echo -e "${BLUE}Please ensure your containers are running with 'docker compose up -d'${NC}"
    exit 1
fi

echo -e "${BLUE}>>> Targeting DB: $DB_CONTAINER / FE: $FE_CONTAINER${NC}"

# 5. Step 1: Base SQL Seeding
echo -e "${BLUE}>>> Step 1: Resetting database and seeding core records...${NC}"
cat reseed_marketplace.sql | docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✔ Base data seeded successfully.${NC}"
else
    echo -e "${RED}✘ Failed to seed base data.${NC}"
    exit 1
fi

# 6. Step 2: Binary Asset Upload (Self-Contained)
echo -e "${BLUE}>>> Step 2: Uploading binary images to Directus...${NC}"

# Ensure /tmp/scripts and /tmp/Images exist in container
docker exec $FE_CONTAINER mkdir -p /tmp/scripts /tmp/Images

# Copy files into container
docker cp frontend/scripts/reseed_assets.ts $FE_CONTAINER:/tmp/reseed_assets.ts
docker cp Images/. $FE_CONTAINER:/tmp/Images/

# Run the uploader inside container pointing to the /tmp/Images folder
docker exec -e IMAGES_DIR="/tmp/Images" -i $FE_CONTAINER npx tsx /tmp/reseed_assets.ts > asset_updates.tmp 2>asset_errors.log

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✔ Assets uploaded successfully.${NC}"
else
    echo -e "${RED}✘ Failed to upload assets. Check asset_errors.log for details.${NC}"
    exit 1
fi

# 7. Step 3: Dynamic Image Linkage
echo -e "${BLUE}>>> Step 3: Synchronizing image IDs...${NC}"
grep "UPDATE" asset_updates.tmp | docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✔ Image links synchronized.${NC}"
    rm asset_updates.tmp
else
    echo -e "${RED}✘ Failed to synchronize image links.${NC}"
    exit 1
fi

echo -e "${GREEN}>>> Restoration Complete! Your marketplace is now 100% functional.${NC}"
echo -e "${BLUE}>>> Final Note: Captured placeholder IDs for Gallery manual check:${NC}"
grep "Placeholder" asset_updates.tmp || echo "No extra placeholders found."
