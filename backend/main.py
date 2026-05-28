from functools import lru_cache
import configparser
import os
from pathlib import Path
import shutil
import tempfile

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from nudenet import NudeDetector

app = FastAPI(title="Gentleman Mosaic NSFW API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_RESOLUTION = {
    "320n": 320,
    "640m": 640,
}

ROOT_DIR = Path(__file__).resolve().parent.parent
LAUNCH_INI = ROOT_DIR / "config" / "launch.ini"


class UISettings(BaseModel):
    language: str = "zh"
    theme: str = "light"


@lru_cache(maxsize=2)
def get_detector(model: str) -> NudeDetector:
    resolution = MODEL_RESOLUTION[model]
    return NudeDetector(inference_resolution=resolution)


def normalize_language(value: str) -> str:
    return "en" if str(value).strip().lower() == "en" else "zh"


def normalize_theme(value: str) -> str:
    return "dark" if str(value).strip().lower() == "dark" else "light"


def read_launch_config() -> configparser.ConfigParser:
    cfg = configparser.ConfigParser()
    if not LAUNCH_INI.exists():
        return cfg

    # Use utf-8-sig to transparently handle BOM-prefixed INI files on Windows.
    try:
        raw = LAUNCH_INI.read_text(encoding="utf-8-sig")
    except UnicodeDecodeError:
        raw = LAUNCH_INI.read_text(encoding="utf-8", errors="ignore")

    cfg.read_string(raw)
    return cfg


def write_launch_config(cfg: configparser.ConfigParser) -> None:
    with LAUNCH_INI.open("w", encoding="utf-8") as f:
        cfg.write(f)


def get_ui_settings_from_ini() -> dict:
    cfg = read_launch_config()
    language = "zh"
    theme = "light"
    if cfg.has_section("ui"):
        language = normalize_language(cfg.get("ui", "language", fallback="zh"))
        theme = normalize_theme(cfg.get("ui", "theme", fallback="light"))
    return {"language": language, "theme": theme}


def save_ui_settings_to_ini(language: str, theme: str) -> dict:
    cfg = read_launch_config()
    if not cfg.has_section("ui"):
        cfg.add_section("ui")
    cfg.set("ui", "language", normalize_language(language))
    cfg.set("ui", "theme", normalize_theme(theme))
    write_launch_config(cfg)
    return get_ui_settings_from_ini()


@app.get("/health")
def health():
    return {"ok": True, "models": list(MODEL_RESOLUTION.keys())}


@app.get("/ui-settings")
def get_ui_settings():
    return get_ui_settings_from_ini()


@app.post("/ui-settings")
def set_ui_settings(settings: UISettings):
    saved = save_ui_settings_to_ini(settings.language, settings.theme)
    return {"ok": True, **saved}


@app.post("/detect-nsfw")
async def detect_nsfw(
    file: UploadFile = File(...),
    threshold: float = Query(0.45, ge=0.01, le=0.99),
    model: str = Query("320n"),
):
    if model not in MODEL_RESOLUTION:
        raise HTTPException(status_code=400, detail="Unsupported model. Use 320n or 640m.")

    suffix = os.path.splitext(file.filename or "image.png")[1] or ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        detector = get_detector(model)
        preds = detector.detect(tmp_path) or []
        out = []
        for p in preds:
            score = float(p.get("score", 0))
            if score < threshold:
                continue

            box = p.get("box") or [0, 0, 0, 0]
            if len(box) != 4:
                continue

            x, y, w, h = box
            out.append(
                {
                    "class": p.get("class", "unknown"),
                    "score": score,
                    "box": [int(x), int(y), int(w), int(h)],
                    "model": model,
                }
            )

        return {"detections": out, "model": model}
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass
