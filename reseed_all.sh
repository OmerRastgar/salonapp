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

echo -e "${BLUE}>>> Using command: $COMPOSE${NC}"

# 2. Check for .env file
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found in root. Please create it.${NC}"
    exit 1
fi

# 3. Load database credentials from .env
DB_USER=$(grep -v '^#' .env | grep 'DB_USER' | cut -d '=' -f2)
DB_PASS=$(grep -v '^#' .env | grep 'DB_PASSWORD' | cut -d '=' -f2)
DB_NAME=$(grep -v '^#' .env | grep 'DB_DATABASE' | cut -d '=' -f2)

# 4. Auto-detect database container ID
DB_CONTAINER=$($COMPOSE ps -q database 2>/dev/null)

if [ -z "$DB_CONTAINER" ]; then
    echo -e "${RED}Error: Could not find a running container for the 'database' service.${NC}"
    echo -e "${BLUE}Attempting to start services...${NC}"
    $COMPOSE up -d database
    sleep 5
    DB_CONTAINER=$($COMPOSE ps -q database)
fi

echo -e "${BLUE}>>> Targeting Database Container: $DB_CONTAINER${NC}"

# 5. Step 1: Base SQL Seeding
echo -e "${BLUE}>>> Step 1: Resetting database and seeding core records...${NC}"
cat reseed_marketplace.sql | docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✔ Base data seeded successfully.${NC}"
else
    echo -e "${RED}✘ Failed to seed base data.${NC}"
    exit 1
fi

# 5. Step 2: Binary Asset Upload
echo -e "${BLUE}>>> Step 2: Uploading binary images to Directus...${NC}"
cd frontend
# We use npx tsx to execute the script. It will output UPDATE commands to stdout.
npx tsx scripts/reseed_assets.ts > ../asset_updates.tmp 2>../asset_errors.log
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✔ Assets uploaded successfully.${NC}"
else
    echo -e "${RED}✘ Failed to upload assets. Check frontend/asset_errors.log for details.${NC}"
    cd ..
    exit 1
fi
cd ..

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
