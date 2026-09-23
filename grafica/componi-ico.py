"""Compone grafica/icona.ico (Windows) e le favicon dell'app dai PNG di rendi-icona.mjs."""
import os
from PIL import Image

QUI = os.path.dirname(os.path.abspath(__file__))
png = lambda n: Image.open(os.path.join(QUI, "png", f"icona-{n}.png")).convert("RGBA")

png(256).save(os.path.join(QUI, "icona.ico"), sizes=[(n, n) for n in (16, 24, 32, 48, 64, 128, 256)])
pub = os.path.join(QUI, "..", "app", "public")
png(256).save(os.path.join(pub, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
png(32).save(os.path.join(pub, "favicon-32.png"))
png(256).resize((180, 180), Image.LANCZOS).save(os.path.join(pub, "favicon-180.png"))
print("icona.ico + favicon dell'app")
