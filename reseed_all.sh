#!/bin/bash

# Marketplace Restoration Master Script v5.0 (Pure Seeder)
# Use this to perform a one-click reseeding of the data and binary assets.
# This version skips building and focuses entirely on the data pipeline.

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}>>> Starting Data & Asset Seeder (v5.0)...${NC}"

# 1. Detect Docker Compose command and correct YAML file
if docker compose version >/dev/null 2>&1; then
    BASE_COMPOSE="docker compose"
elif docker-compose version >/dev/null 2>&1; then
    BASE_COMPOSE="docker-compose"
else
    echo -e "${RED}Error: Docker Compose not found.${NC}"
    exit 1
fi

# 1.1 Fix Permissions (Directus needs write access to its volumes)
echo -e "${BLUE}>>> Ensuring data folder permissions...${NC}"
mkdir -p ./data/uploads ./data/database
chmod -R 777 ./data/uploads ./data/database 2>/dev/null || sudo chmod -R 777 ./data/uploads ./data/database

# 2. Check for .env file
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found in root. Please create it.${NC}"
    exit 1
fi

# 3. Load database credentials from .env
DB_USER=$(grep -E "^DB_USER=" .env | cut -d'=' -f2)
DB_PASS=$(grep -E "^DB_PASSWORD=" .env | cut -d'=' -f2)
DB_NAME=$(grep -E "^DB_DATABASE=" .env | cut -d'=' -f2)

# 4. Target Seeding (Assuming services are already running)
# Auto-detect Database container ID
echo -e "${BLUE}>>> Identifying target containers...${NC}"
DB_CONTAINER=$(docker ps -q --filter "name=database" | head -n 1)

if [ -z "$DB_CONTAINER" ]; then
    echo -e "${RED}Error: Could not find Database container.${NC}"
    exit 1
fi

echo -e "${BLUE}>>> Targeting DB Container: $DB_CONTAINER${NC}"

# 5. Step 1: Base SQL Seeding
echo -e "${BLUE}>>> Step 1: Resetting database and seeding core records...${NC}"
# Use PGPASSWORD to avoid interactive prompt
docker exec -e PGPASSWORD="$DB_PASS" -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME < reseed_marketplace.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✔ Base data seeded successfully.${NC}"
else
    echo -e "${RED}✘ Failed to seed base data.${NC}"
    exit 1
fi

# 6. Step 2: Binary Asset Sync (FAST DIRECT COPY)
# Instead of slow API uploads, we copy directly to the mapped volume
echo -e "${BLUE}>>> Step 2: Syncing binary assets to storage volume...${NC}"

# Clear current uploads and copy fresh ones from Images/
# We use -u to only update newer files, or just copy all
cp -v Images/* data/uploads/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✔ Assets sync successfully.${NC}"
else
    echo -e "${RED}✘ Failed to sync assets.${NC}"
    exit 1
fi

# 7. SUCCESS
echo -e "${GREEN}>>> SUCCESS! Data and Binary Assets have been restored.${NC}"
echo -e "${BLUE}>>> IMPORTANT: Run 'docker compose restart directus' to refresh the cache.${NC}"
