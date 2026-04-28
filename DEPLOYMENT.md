# Production Deployment

This project is designed to run on a DigitalOcean Droplet with Docker Compose.

## DNS

Create an `A` record:

```text
Type: A
Host: bg
Value: YOUR_DROPLET_PUBLIC_IP
```

This points `bg.hdpiks.com` to your Droplet.

## Firewall

Allow only:

```text
22/tcp
80/tcp
443/tcp
```

Do not expose app ports `3000`, `8000`, or `8001` publicly in production.

## Server Setup

Install Docker and Docker Compose on the Droplet, then clone the repository.

Create the production env file:

```bash
cp .env.production.example .env.production
```

Edit `.env.production`:

```text
APP_DOMAIN=bg.hdpiks.com
APP_ORIGIN=https://bg.hdpiks.com
CADDY_EMAIL=admin@hdpiks.com
MAX_UPLOAD_SIZE_MB=10
REMBG_MODEL=u2netp
```

## Start Production

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
```

## Check Status

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f
```

Open:

```text
https://bg.hdpiks.com
```

## Stop Production

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml down
```

## Notes

- Caddy is the only public service and handles HTTPS automatically.
- The FastAPI container is private on the Docker network.
- The Next.js app calls FastAPI through `API_INTERNAL_URL=http://api:8000`.
- `rembg_models` persists downloaded model files across container rebuilds.
- Upload size is limited by both Caddy and FastAPI using `MAX_UPLOAD_SIZE_MB`.
