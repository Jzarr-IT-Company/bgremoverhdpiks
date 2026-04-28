from io import BytesIO

from PIL import Image, ImageOps

MODEL_BY_MODE = {
    "fast": "u2netp",
    "hd": "u2net",
}

_sessions = {}


def get_model_name(mode: str) -> str:
    return MODEL_BY_MODE.get(mode, MODEL_BY_MODE["fast"])


def get_rembg_session(mode: str = "fast"):
    from rembg import new_session

    model_name = get_model_name(mode)
    if model_name not in _sessions:
        _sessions[model_name] = new_session(model_name)
    return _sessions[model_name]


def remove_background(image_bytes: bytes, mode: str = "fast") -> bytes:
    from rembg import remove

    with Image.open(BytesIO(image_bytes)) as image:
        normalized = ImageOps.exif_transpose(image)
        if normalized.mode not in ("RGB", "RGBA"):
            normalized = normalized.convert("RGBA")
        else:
            normalized = normalized.copy()

    normalized_bytes = BytesIO()
    normalized.save(normalized_bytes, format="PNG")

    if mode == "hd":
        return remove(
            normalized_bytes.getvalue(),
            session=get_rembg_session(mode),
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=10,
        )

    return remove(normalized_bytes.getvalue(), session=get_rembg_session(mode))
