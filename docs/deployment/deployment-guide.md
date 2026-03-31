# Salon Marketplace Deployment Guide

## Goal

Bring up a fresh demo environment on a server with:

- production frontend
- Directus + PostgreSQL
- automatic schema setup
- automatic demo seed data
- automatic image upload from the root `Images` folder

## 1. Prepare the server

Install:

- Git
- Docker
- Docker Compose

Then clone the repo:

```bash
git clone <your-repo-url>
cd saloonmarketplace
```

## 2. Configure environment

Copy the example env file:

```bash
cp .env-example .env
```

Update these values before first boot:

```env
DB_USER=admin
DB_PASSWORD=change-this
DB_DATABASE=postgres

KEY=change-this-long-random-key
SECRET=change-this-long-random-secret

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-admin-password

PUBLIC_URL=http://YOUR_SERVER_IP_OR_DOMAIN:8055
DIRECTUS_URL=http://YOUR_SERVER_IP_OR_DOMAIN:8055
NEXT_PUBLIC_DIRECTUS_URL=http://YOUR_SERVER_IP_OR_DOMAIN:8055

DIRECTUS_TOKEN=
FORCE_BOOTSTRAP=false
```

Notes:

- Leave `DIRECTUS_TOKEN` blank unless you already have one
- The bootstrap service can seed using the admin email/password automatically
- `PUBLIC_URL`, `DIRECTUS_URL`, and `NEXT_PUBLIC_DIRECTUS_URL` should point to the real server address, not `localhost`

## 3. Add demo images

Put your demo images into the root `Images` folder before starting Docker.

Supported formats:

- `.jpg`
- `.jpeg`
- `.png`
- `.webp`
- `.gif`

How assignment works:

- matching filenames are preferred for vendors and employees
- otherwise the seeder rotates through all available images
- if you add more files, the next fresh bootstrap will automatically use them

## 4. Start everything

```bash
docker compose up --build -d
```

This starts:

- `database`
- `directus`
- `frontend`
- `nginx`
- `bootstrap`

## 5. Wait for bootstrap to finish

```bash
docker compose logs -f bootstrap
```

When it finishes successfully, the server will have:

- database schema loaded
- Directus metadata registered
- public read permissions applied
- demo vendors, employees, schedules, reviews, and services seeded
- images uploaded into Directus

## 6. Verify

Open:

- `http://YOUR_SERVER_IP_OR_DOMAIN/`
- `http://YOUR_SERVER_IP_OR_DOMAIN:8055/admin`

Useful checks:

```bash
docker compose ps
docker compose logs --tail=100 frontend
docker compose logs --tail=100 directus
docker compose logs --tail=100 bootstrap
```

## Persistence

These paths now persist important data:

- `data/postgres` for PostgreSQL
- `data/directus/uploads` for Directus uploaded files
- `data/directus/extensions` for Directus extensions
- `data/bootstrap/demo-bootstrap.done` for one-time bootstrap state

## Re-seeding demo data

If you want to regenerate the demo dataset after adding or changing images:

1. Set `FORCE_BOOTSTRAP=true` in `.env`
2. Restart the stack:

   ```bash
   docker compose up --build -d
   ```

3. Wait for `bootstrap` to finish again
4. Set `FORCE_BOOTSTRAP=false` afterward

## Troubleshooting

### Bootstrap did not run

Check:

```bash
docker compose logs bootstrap
```

If the marker file already exists, the bootstrap service will skip by design.

### Images are missing

Check:

- files exist in `Images`
- filenames use a supported extension
- `bootstrap` completed successfully
- `data/directus/uploads` contains uploaded files

### Services start but the site is empty

That usually means bootstrap failed before seeding. Check:

```bash
docker compose logs bootstrap
docker compose logs directus
```

### You want a completely fresh demo

```bash
docker compose down
```

Then delete:

- `data/postgres`
- `data/directus/uploads`
- `data/directus/extensions`
- `data/bootstrap`

After that:

```bash
docker compose up --build -d
```
