"""Shared helpers for the announcer voice generators (Piper TTS voice model, zipping packs)."""
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "tools" / ".cache"
VOICE = "en_US-ryan-high"
VOICE_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/high/" + VOICE


def model_paths():
    CACHE.mkdir(parents=True, exist_ok=True)
    onnx = CACHE / f"{VOICE}.onnx"
    for path, suffix in ((onnx, ".onnx"), (Path(str(onnx) + ".json"), ".onnx.json")):
        if not path.exists():
            print(f"Downloading voice model {path.name} ...")
            urllib.request.urlretrieve(VOICE_URL + suffix, path)
    return onnx


def zip_dir(src, dest):
    with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED) as z:
        for path in sorted(src.rglob("*")):
            if path.is_file():
                z.write(path, path.relative_to(src).as_posix())
