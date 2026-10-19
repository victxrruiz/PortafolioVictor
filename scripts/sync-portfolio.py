"""Actualiza imágenes, orden y títulos desde las carpetas originales (requiere macOS)."""

import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile
import unicodedata


ROOT = Path(__file__).resolve().parents[1]
CATEGORIES = {
    "social-media": "SOCIAL MEDIA",
    "editorial": "EDITORIAL",
    "branding": "MARCA",
    "escenografia": "ESCENOGRAFÍA Y STANDS",
    "fotografia": "FOTOGRAFÍA",
}

# Mantener los originales descartados en su carpeta, sin publicarlos en la galería.
EXCLUDED_FILES = {
    "fotografia": {"INTERUVP_FURBO-4.jpg", "INTERUVP_FURBO-6.jpg", "INTERUVP_FURBO-20.jpg"},
}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def resize(source, output, size, thumbnail=False):
    options = ["-s", "format", "png"]
    if output.suffix == ".jpg":
        options = ["-s", "format", "jpeg", "-s", "formatOptions", "80" if thumbnail else "85"]
    subprocess.run(
        ["sips", *options, "-Z", str(size), str(source), "--out", str(output)],
        check=True, stdout=subprocess.DEVNULL,
    )


def filename_details(path):
    name = unicodedata.normalize("NFC", path.stem)
    match = re.fullmatch(r"(.*?)\s*[-_ ]\s*(\d+)", name)
    if match:
        return match[1].strip(), int(match[2])
    return name, None


def synchronize():
    manifest = {}
    plans = []
    with tempfile.TemporaryDirectory(prefix="portfolio-sync-") as temporary:
        # Resolve all ordering before replacing any generated files.
        for category, folder_name in CATEGORIES.items():
            folder = next(
                p for p in ROOT.iterdir()
                if p.is_dir() and unicodedata.normalize("NFC", p.name) == folder_name
            )
            target = ROOT / "img" / "portfolio" / category
            target.mkdir(parents=True, exist_ok=True)
            existing_order = {
                digest(p): int(p.stem.split("-")[0])
                for p in target.glob("*-thumb.*")
                if p.stem.split("-")[0].isdigit()
            }
            projects = []
            sources = sorted(
                (p for p in folder.iterdir()
                 if p.suffix.lower() in {".jpg", ".jpeg", ".png"}
                 and p.name not in EXCLUDED_FILES.get(category, set())),
                key=lambda p: unicodedata.normalize("NFC", p.name).casefold(),
            )
            reserved_orders = {
                filename_details(p)[1] for p in sources if filename_details(p)[1] is not None
            }
            next_order = max([*existing_order.values(), *reserved_orders], default=0) + 1
            for position, source in enumerate(sources, 1):
                title, order = filename_details(source)
                extension = ".png" if source.suffix.lower() == ".png" else ".jpg"
                if order is None:
                    candidate = Path(temporary) / ("candidate" + extension)
                    resize(source, candidate, 900, thumbnail=True)
                    order = existing_order.get(digest(candidate))
                    if order is None and not existing_order:
                        order = position if position not in reserved_orders else next_order
                    if order is None:
                        order = next_order
                    next_order = max(next_order, order + 1)
                if not title:
                    raise ValueError(f"Falta la descripción: {source}")
                projects.append((order, title, source, extension))
            orders = [project[0] for project in projects]
            if len(orders) != len(set(orders)):
                raise ValueError(f"Hay números repetidos en {folder.name}")
            plans.append((category, target, sorted(projects)))

        for category, target, projects in plans:
            data = {"images": [], "thumbnails": [], "titles": []}
            for order, title, source, extension in projects:
                image = target / f"{order:02d}{extension}"
                thumbnail = target / f"{order:02d}-thumb{extension}"
                resize(source, image, 2400)
                resize(source, thumbnail, 900, thumbnail=True)
                data["images"].append(image.relative_to(ROOT).as_posix() + "?v=" + digest(image)[:10])
                data["thumbnails"].append(thumbnail.relative_to(ROOT).as_posix() + "?v=" + digest(thumbnail)[:10])
                data["titles"].append(title)
                print(f"{category}: {order:02d} — {title}")
            manifest[category] = data

    output = ROOT / "js" / "portfolio-data.js"
    output.write_text(
        "// Generado por scripts/sync-portfolio.py; no editar manualmente.\n"
        + "window.portfolioData = " + json.dumps(manifest, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    synchronize()
