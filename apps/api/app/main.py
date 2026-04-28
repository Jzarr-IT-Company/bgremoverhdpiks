from concurrent.futures import ThreadPoolExecutor
import logging
from time import perf_counter

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from app.config import settings
from app.image_service import get_model_name, get_rembg_session, remove_background

ALLOWED_CONTENT_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
}

app = FastAPI(title=settings.app_name)
warmup_executor = ThreadPoolExecutor(max_workers=1)
logger = logging.getLogger("bgremover.api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.on_event("startup")
def warm_model_in_background() -> None:
    warmup_executor.submit(get_rembg_session, "fast")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/ready")
def ready() -> dict[str, str]:
    get_rembg_session("fast")
    return {"status": "ready", "model": get_model_name("fast")}


@app.post("/remove-background")
async def remove_background_endpoint(
    file: UploadFile = File(...),
    mode: str = Form("fast"),
) -> Response:
    started_at = perf_counter()
    normalized_mode = mode.lower().strip()
    if normalized_mode not in {"fast", "hd"}:
        raise HTTPException(status_code=400, detail="Unsupported processing mode.")

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload PNG, JPG, JPEG, or WebP.",
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(image_bytes) > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File is too large. Max size is {settings.max_upload_size_mb} MB.",
        )

    try:
        output_bytes = remove_background(image_bytes, mode=normalized_mode)
    except Exception as exc:
        logger.exception("Background removal failed for %s", file.filename)
        raise HTTPException(
            status_code=500,
            detail="Background removal failed. Please try another image.",
        ) from exc

    logger.info(
        "Processed %s in %.2fs using %s",
        file.filename,
        perf_counter() - started_at,
        get_model_name(normalized_mode),
    )

    return Response(
        content=output_bytes,
        media_type="image/png",
        headers={"Content-Disposition": 'inline; filename="bg-removed.png"'},
    )
