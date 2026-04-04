#!/bin/bash

echo "=== Current Environment Variables ==="
echo "NEXT_PUBLIC_DIRECTUS_URL: $NEXT_PUBLIC_DIRECTUS_URL"
echo "DIRECTUS_INTERNAL_URL: $DIRECTUS_INTERNAL_URL"
echo "PUBLIC_URL: $PUBLIC_URL"
echo "DIRECTUS_URL: $DIRECTUS_URL"

echo ""
echo "=== Docker Compose Build Args ==="
docker compose config | grep -A 10 -B 5 frontend
