# BG Remover

Fullstack background remover MVP built as a monorepo.

## Structure

```text
bgremover/
  apps/
    web/        # Next.js frontend
    api/        # FastAPI image processing backend
  docker-compose.yml
  README.md
```

## Local Development

### Backend

Use Python 3.11 for local backend development. The included Dockerfile already uses Python 3.11.

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend health check:

```text
http://localhost:8000/health
```

### Frontend

```bash
cd apps/web
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

## MVP Flow

1. User uploads or drags an image into the web app.
2. Next.js validates type and size.
3. The image is sent to FastAPI as `multipart/form-data`.
4. FastAPI removes the background with `rembg`.
5. The processed transparent PNG is returned to the browser.
6. User previews and downloads the result.

## Docker

Start Docker Desktop first, then run:

```bash
docker compose up --build
```

With Docker, the API container still runs on port `8000`, but it is mapped to host port `8001`:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8001/health
```

## Production

Production deployment files are included:

```text
docker-compose.prod.yml
Caddyfile
.env.production.example
DEPLOYMENT.md
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for deploying to `https://bg.hdpiks.com`.
