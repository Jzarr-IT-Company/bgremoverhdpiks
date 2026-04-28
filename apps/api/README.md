# BG Remover API

FastAPI service for image background removal.

## Run

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Endpoints

```text
GET /health
POST /remove-background
```

`POST /remove-background` accepts a `multipart/form-data` file field named `file` and returns a transparent PNG.
