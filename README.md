# Saloon Marketplace

A comprehensive salon marketplace platform built with Directus, Next.js, and Docker.

## 🚀 Production Deployment / Fresh Start

To bring up the full production-ready system (including Nginx) on a fresh server:

```bash
# 1. Start all services
docker compose up --build -d

# 2. Initialize Database Schema
# Note: replace 'salonapp' with your folder name if it differs
docker exec -i salonapp-database-1 psql -U admin -d postgres < sql/setup/rebuild_marketplace.sql

# 3. Register Collections & Relations in Directus Metadata
docker exec -i salonapp-database-1 psql -U admin -d postgres < sql/collections/register_collections.sql
docker exec -i salonapp-database-1 psql -U admin -d postgres < sql/collections/register_relations.sql

# 4. Configure Public Permissions
docker exec -i salonapp-database-1 psql -U admin -d postgres < sql/permissions/permissions_public_system.sql
docker exec -i salonapp-database-1 psql -U admin -d postgres < sql/permissions/permissions_public.sql

# 5. Restart Directus to refresh metadata
docker restart salonapp-directus-1

# 6. Run Enhanced Seeder (for images and demo data)
node tests/scripts/seeder.js
```

> [!NOTE]
> **Container Prefixes**: Docker Compose prefixes containers with your folder name (e.g., `salonapp-database-1`). If your folder name is different, adjust the commands accordingly.

## 🛠️ Key Technical Fixes (Included)

The following critical issues have been resolved in this version:

1.  **React Error #310**: Fixed hook-ordering mismatches in `VendorPage` by moving all hooks to the top level, ensuring stable hydration.
2.  **API 500 Error**: Refactored `api/live-activity` to use a multi-URL fallback logic (`directus:8055` -> `localhost:8055`), ensuring connectivity within Docker networks.
3.  **Nginx 413 Error**: Increased `client_max_body_size` to **100M** in `nginx.conf` to allow high-resolution image uploads via the seeder and CMS.
4.  **Docker Performance**: Optimized `Dockerfile` and `docker-compose.yml` to use production builds and correct network hostnames (`0.0.0.0`).

## 📁 Project Structure

```
saloonmarketplace/
├── frontend/                 # Next.js frontend application
├── sql/                     # Database scripts
│   ├── setup/               # Initial setup scripts
│   ├── collections/         # Collection definitions
│   └── permissions/         # Permission configurations
├── docs/                    # Documentation
│   ├── api/                 # API documentation
│   ├── deployment/          # Deployment guides
│   └── guides/              # User guides
├── scripts/                 # Setup and utility scripts
├── config/                  # Configuration files
├── tests/                   # Test suite and seeder
├── .agents/                 # AI agent configurations
└── Images/                  # Demo images
```

## 📚 Documentation

- **[Getting Started](docs/guides/README.md)** - Main user guide
- **[API Setup](docs/api/API Set up .md)** - Directus API configuration
- **[Deployment](docs/deployment/deployment-guide.md)** - Production deployment
- **[Vendor Dashboard](docs/guides/vendor-dashboard-install.md)** - Dashboard setup

## 🛠️ Development

### Database Setup

For a full system initialization (schema, metadata, and permissions), please follow the **[Fresh Start / Rebuild](#-fresh-start--rebuild)** guide at the top of this document.

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

```bash
# Run seeder to populate test data
cd tests/scripts
node seeder.js

# Test business lead creation
curl -X POST http://localhost/api/business-leads \
  -H "Content-Type: application/json" \
  -d '{"business_name": "Test Salon", "contact_person": "John Doe", "phone": "+92 300 1234567", "email": "test@example.com", "category": "Barber", "city": "Karachi"}'
```

## 🏗️ Architecture

- **Backend**: Directus (Headless CMS)
- **Frontend**: Next.js with TypeScript
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx

## 📝 Features

- ✅ Vendor management and profiles
- ✅ Employee scheduling and services
- ✅ Booking system
- ✅ Customer reviews
- ✅ Business lead generation
- ✅ Location-based search
- ✅ Role-based permissions
- ✅ AI agent integration (MCP)

## 🤖 AI Integration

This project includes MCP (Model Context Protocol) integration for AI agents. 

**Important**: After a fresh database rebuild, you must re-assign the API token to the admin user for the MCP server to connect:
```sql
UPDATE directus_users SET token = '9a4f7c2e8b1d5f6a3c9e0b7d4f8a2c5e9b1d6f3a7c0e4b8d2f5a9c1e7b3d6f' WHERE email = 'admin@saloonmarketplace.com';
```
See [`.agents/`](.agents/) and [`mcp-config.json`](mcp-config.json) for configuration.

## 📄 License

[Add your license information here]
