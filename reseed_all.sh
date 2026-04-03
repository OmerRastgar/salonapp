#!/bin/bash

# Marketplace Unified Reseeding Script (Linux Server Edition)
# This script restoration data and binary assets in a single run.

# 1. Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}>>> Starting Marketplace Restoration...${NC}"

# 2. Check for .env file
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found in root. Please create it.${NC}"
    exit 1
fi

# 3. Load database credentials from .env
# We use standard grep/sed to be more compatible with different Linux distros
DB_USER=$(grep -v '^#' .env | grep 'DB_USER' | cut -d '=' -f2)
DB_PASS=$(grep -v '^#' .env | grep 'DB_PASSWORD' | cut -d '=' -f2)
DB_NAME=$(grep -v '^#' .env | grep 'DB_DATABASE' | cut -d '=' -f2)

CONTAINER_NAME="saloonmarketplace-database-1"

# 4. Step 1: Base SQL Seeding
echo -e "${BLUE}>>> Step 1: Resetting database and seeding core records...${NC}"
cat reseed_marketplace.sql | docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME
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

# 6. Step 3: Dynamic Image Linkage
echo -e "${BLUE}>>> Step 3: Synchronizing image IDs...${NC}"
grep "UPDATE" asset_updates.tmp | docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME
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
