# Saloon Marketplace

Self-hosted salon marketplace built with Next.js, Directus, PostgreSQL, and Docker.

## What you get on a fresh server

- Production frontend container
- Directus CMS with persistent uploads
- PostgreSQL with marketplace schema
- Automatic demo bootstrap for schema, permissions, seed data, and images from `/Images`
- Nginx proxy for the frontend on port `80` and Directus on port `8055`

## Quick start

1. Copy `.env-example` to `.env` and set your real server IP or domain:

   ```bash
   cp .env-example .env
   ```

2. Make sure your `.env` values are correct:

   - `PUBLIC_URL=http://YOUR_SERVER:8055`
   - `DIRECTUS_URL=http://YOUR_SERVER:8055`
   - `NEXT_PUBLIC_DIRECTUS_URL=http://YOUR_SERVER:8055`
   - strong values for `KEY`, `SECRET`, and `ADMIN_PASSWORD`

3. Add as many demo images as you want to the root `Images` folder.

4. Start the stack:

   ```bash
   docker compose up --build -d
   ```

5. Watch the one-time bootstrap complete:

   ```bash
   docker compose logs -f bootstrap
   ```

   The bootstrap service will:

   - wait for PostgreSQL and Directus
   - apply the SQL schema
   - register Directus metadata and public permissions
   - seed demo vendors, employees, services, reviews, and schedules
   - upload every image from `Images` into Directus and attach them to the demo content

## Access points

- Marketplace: [http://localhost](http://localhost)
- Directus Admin: [http://localhost:8055](http://localhost:8055)

Use your server IP or domain instead of `localhost` after deployment.

## Demo media behavior

- The seeder uploads every supported file from `Images`
- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
- If a filename matches a vendor slug/name or employee name, it is preferred
- Otherwise images are assigned in rotation so newly added files still appear in the UI
- Uploaded files are persisted in `data/directus/uploads`, so they survive container restarts

## Re-running demo bootstrap

The bootstrap only runs once per environment and writes a marker file to `data/bootstrap/demo-bootstrap.done`.

To force a clean rebuild of the demo data:

```bash
docker compose down
```

Then either remove `data/bootstrap/demo-bootstrap.done` or set this in `.env` before starting again:

```env
FORCE_BOOTSTRAP=true
```

After the reseed finishes, set `FORCE_BOOTSTRAP=false` again.
