"""Regenerate responsive WebP assets after adding card artwork (requires Pillow)."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / "card_images"
for width in (160, 320):
    output = root / str(width)
    output.mkdir(exist_ok=True)
    for source in root.glob("*.webp"):
        with Image.open(source) as image:
            height = round(image.height * width / image.width)
            image.resize((width, height), Image.Resampling.LANCZOS).save(
                output / source.name, "WEBP", quality=82, method=6
            )
