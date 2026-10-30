"""I ritratti dei personaggi e gli oggetti della memoria, dagli originali alle immagini del gioco.

Gli originali (generati con Nano Banana Pro 2.1 in Google Flow, 2000x2000 per gli oggetti e 896x1200 per i ritratti)
stanno fuori da git, come i master della voce e della musica. Questo strumento li porta a ciò che il gioco mostra:

  · i RITRATTI: un ritaglio quadrato sul volto, alla stessa scala per tutti (la testa riempie circa due terzi del
    tondo), 384x384, per i medaglioni dei dialoghi e di «chi hai incontrato»;
  · gli OGGETTI: un ritaglio quadrato attorno all'oggetto, col suo margine, 512x512, per le tavole del diario;
  · per tutti, lo sfondo scuro riportato al nero-inchiostro del gioco (#0b0a0e), così un'immagine non si distingue
    dall'altra per una dominante viola o calda; WebP, perché pesano poco.

Al biglietto si aggiunge il punto finale della frase («Non è il caso di tornare.»), che il generatore aveva dimenticato.

Uso:  python strumenti/immagini.py <cartella dei ritratti> <cartella degli oggetti>
      (i file si chiamano ritratto-<nome>.jpg e oggetto-<nome>.jpg; scrive app/public/immagini/)
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USCITA = os.path.join(RADICE, "app", "public", "immagini")
FONDO = np.array([11, 10, 14], dtype=np.float64)

# Il ritaglio di ogni ritratto, nel riquadro 896x1200: il centro (fra il naso e il mento, un poco sotto, per prendere il
# collo) e il lato. Misurati a occhio su un foglio a griglia, perché la testa riempia il tondo allo stesso modo in tutti.
RITRATTI = {
    "nunzio": (462, 530, 760), "saverio": (445, 512, 770), "iole": (452, 536, 600), "rocco": (475, 570, 700),
    "vito": (462, 402, 740), "imma": (450, 355, 540), "imma-sfamata": (450, 355, 540), "rosaria": (452, 467, 610),
    "peppe": (462, 480, 640), "ciro": (450, 467, 790), "pasquale": (420, 555, 820), "pasquale-guarito": (420, 555, 820),
    "concetta": (405, 458, 760), "tore": (440, 461, 800), "onofrio": (430, 480, 820), "cosimo": (455, 498, 840),
}
OGGETTI = ["foto", "biglietto", "tanica", "diario", "anello", "giocattolo", "santino", "lettera"]


def fondo_al_nero(a):
    """Lo sfondo scuro, qualunque dominante abbia, portato a #0b0a0e: solo i pixel scuri, tanto più quanto più sono scuri."""
    lum = a @ [0.299, 0.587, 0.114]
    peso = np.clip(1 - lum / 46, 0, 1)[..., None] ** 1.5
    return a * (1 - peso) + FONDO * peso


def scrivi(a, dove, lato, qualita):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).resize((lato, lato), Image.LANCZOS)
    os.makedirs(os.path.dirname(dove), exist_ok=True)
    im.save(dove, "WEBP", quality=qualita, method=6)
    return os.path.getsize(dove)


def ritratto(cartella, nome):
    im = Image.open(os.path.join(cartella, f"ritratto-{nome}.jpg")).convert("RGB")
    if im.size != (896, 1200):
        im = im.resize((896, 1200), Image.LANCZOS)
    cx, cy, lato = RITRATTI[nome]
    a = np.asarray(im.crop((cx - lato // 2, cy - lato // 2, cx + lato // 2, cy + lato // 2))).astype(np.float64)
    if nome == "imma-sfamata":
        # il colore di chi ha mangiato, che in piccolo deve leggersi: la pelle appena più calda
        mx, mn = a.max(axis=2), a.min(axis=2)
        pelle = ((a[..., 0] > a[..., 1]) & (a[..., 1] > a[..., 2]) & (mx > 90) & ((mx - mn) / np.maximum(mx, 1) > 0.18))[..., None]
        a = np.where(pelle, a * [1.07, 1.0, 0.95], a)
    return scrivi(fondo_al_nero(a), os.path.join(USCITA, "ritratti", f"{nome}.webp"), 384, 82)


def punto_al_biglietto(im):
    """Il punto dopo «TORNARE», nell'inchiostro e nella pendenza della scritta (disegnato grande e rimpicciolito: liscio)."""
    k = 4
    x, y, rx, ry = 1399, 1266, 7.5, 6.5
    inchiostro = tuple(int(v) for v in np.asarray(im)[1268:1273, 1356:1362].reshape(-1, 3).mean(axis=0))
    toppa = im.crop((x - 20, y - 20, x + 20, y + 20)).resize((40 * k, 40 * k), Image.LANCZOS)
    ImageDraw.Draw(toppa).ellipse(((20 - rx) * k, (20 - ry) * k, (20 + rx) * k, (20 + ry) * k), fill=inchiostro)
    im.paste(toppa.resize((40, 40), Image.LANCZOS), (x - 20, y - 20))
    return im


def oggetto(cartella, nome):
    im = Image.open(os.path.join(cartella, f"oggetto-{nome}.jpg")).convert("RGB")
    if nome == "biglietto":
        im = punto_al_biglietto(im.resize((2000, 2000), Image.LANCZOS) if im.size != (2000, 2000) else im)
    a = np.asarray(im).astype(np.float64)
    h, w, _ = a.shape
    bordo = np.concatenate([a[:20].reshape(-1, 3), a[-20:].reshape(-1, 3), a[:, :20].reshape(-1, 3), a[:, -20:].reshape(-1, 3)])
    fondo = np.median(bordo, axis=0)
    diverso = np.abs(a - fondo).sum(axis=2) > 60
    ys, xs = np.nonzero(diverso)
    # l'ingombro dell'oggetto (scartando i pochi pixel sparsi), poi un quadrato centrato con il suo margine
    x0, x1 = np.percentile(xs, [0.5, 99.5]); y0, y1 = np.percentile(ys, [0.5, 99.5])
    lato = int(max(x1 - x0, y1 - y0) * 1.16)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    lato = min(lato, w, h)
    l, t = int(min(max(cx - lato / 2, 0), w - lato)), int(min(max(cy - lato / 2, 0), h - lato))
    return scrivi(fondo_al_nero(a[t:t + lato, l:l + lato]), os.path.join(USCITA, "oggetti", f"{nome}.webp"), 512, 84)


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        return 2
    ritratti, oggetti = sys.argv[1], sys.argv[2]
    totale = 0
    for n in RITRATTI:
        totale += ritratto(ritratti, n)
    for n in OGGETTI:
        totale += oggetto(oggetti, n)
    print(f"{len(RITRATTI)} ritratti e {len(OGGETTI)} oggetti in {os.path.relpath(USCITA, RADICE)}: {totale / 1024:.0f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
