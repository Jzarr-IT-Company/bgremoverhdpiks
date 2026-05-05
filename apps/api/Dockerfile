FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends libglib2.0-0 libgl1 libgomp1 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

ARG REMBG_MODEL=u2netp
ARG REMBG_MODELS=u2netp,u2net
ARG PRELOAD_REMBG_MODELS=false
ENV REMBG_MODEL=$REMBG_MODEL
ENV REMBG_MODELS=$REMBG_MODELS
RUN if [ "$PRELOAD_REMBG_MODELS" = "true" ]; then \
      python -c "import os; from rembg import new_session; [new_session(model.strip()) for model in os.environ.get('REMBG_MODELS', 'u2netp').split(',') if model.strip()]"; \
    else \
      echo "Skipping rembg model preload during Docker build"; \
    fi

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
