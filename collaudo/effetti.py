"""Collaudo degli effetti sonori registrati (app/public/effetti/, effetti/LEGGIMI.md, pre-produzione/12-suoni.md).

Controlla che:
  - l'indice ci sia, dica la sua licenza (gli effetti sono fuori dalla licenza libera, come le voci ElevenLabs) e che
    LICENSE-CONTENUTI.md nomini la cartella;
  - ogni file dell'indice esista, sia un Ogg Opus e duri quanto dice l'indice (±30 ms), e nella cartella non ci siano file in più;
  - ogni effetto abbia il suo livello (strumenti/effetti-livelli.cjs), fra 0,005 e 10;
  - ogni effetto che il codice suona (loghi, trailer, mappa) sia nell'indice, e ogni effetto dell'indice sia suonato da qualcuno;
  - la cartella pesi poco (tetto 2 MB);
  - con ffmpeg: ogni file abbia il picco fra -6 e -0,5 dBFS (gli effetti escono tutti a -1,5: il livello lo dà il codice).

Uso:  python collaudo/effetti.py      (esce con 1 se qualcosa non va; ffmpeg è facoltativo)
"""
import json
import os
import re
import shutil
import struct
import subprocess
import sys

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARTELLA = os.path.join(RADICE, "app", "public", "effetti")
SORGENTI = ["app/src/loghi/suono.ts", "app/src/trailer/audio.ts", "app/src/gioco/suonoCarta.ts"]
falliti = []


def esito(ok, testo, dettagli=None):
    print(("OK " if ok else "NO ") + testo)
    if not ok:
        falliti.append(testo)
        for d in (dettagli or [])[:12]:
            print("     ", d)


def durata_ogg_opus(percorso):
    """Millisecondi di un Ogg Opus (ultima granule position meno il pre-skip), o un errore (come in collaudo/doppiaggio.py)."""
    with open(percorso, "rb") as f:
        dati = f.read()
    pos, primo, granule = 0, None, None
    while pos < len(dati):
        if dati[pos:pos + 4] != b"OggS":
            return None, "pagina Ogg rovinata a %d" % pos
        g = struct.unpack_from("<q", dati, pos + 6)[0]
        n = dati[pos + 26]
        corpo = sum(dati[pos + 27:pos + 27 + n])
        inizio = pos + 27 + n
        if primo is None:
            primo = dati[inizio:inizio + corpo]
        if g >= 0:
            granule = g
        pos = inizio + corpo
    if not primo or not primo.startswith(b"OpusHead"):
        return None, "non è Opus"
    if granule is None:
        return None, "senza durata"
    preskip = struct.unpack_from("<H", primo, 10)[0]
    return round(1000 * (granule - preskip) / 48000), None


def chiavi_nel_codice():
    """Gli effetti che il codice suona: le chiavi fra virgolette nelle righe che chiamano un effetto, e i passi per terreno."""
    usate = set()
    for rel in SORGENTI:
        testo = open(os.path.join(RADICE, rel), encoding="utf-8").read()
        for riga in testo.splitlines():
            if "registrato(" in riga or "suonaEffetto(" in riga or "varianti(" in riga:
                usate |= set(re.findall(r'"([a-z][a-z-]*[a-z])"', riga))
    scaletta = open(os.path.join(RADICE, "app/src/trailer/scaletta.ts"), encoding="utf-8").read()
    terreni = re.search(r"export type Terreno = ([^;]+);", scaletta)
    if "`passo-${" in open(os.path.join(RADICE, "app/src/trailer/audio.ts"), encoding="utf-8").read() and terreni:
        usate |= {"passo-" + t for t in re.findall(r'"([a-z]+)"', terreni.group(1))}
    # nelle stesse righe ci sono anche i nomi degli eventi del trailer (case "carta": …) e il terreno di ripiego: non sono effetti
    tipi = re.search(r"export type TipoSuono = ([^;]+);", scaletta)
    altro = set(re.findall(r'"([a-z]+)"', tipi.group(1))) if tipi else set()
    altro |= set(re.findall(r'"([a-z]+)"', terreni.group(1))) if terreni else set()
    # le chiavi grezze (per dire che un effetto è suonato) e quelle senza i nomi che non sono effetti (per dire che manca)
    return usate, usate - altro - {"apre", "chiude", "highpass", "lowpass", "bandpass", "triangle", "sawtooth", "sine"}


def main():
    percorso = os.path.join(CARTELLA, "indice.json")
    if not os.path.exists(percorso):
        esito(False, "c'è l'indice degli effetti (%s)" % os.path.relpath(percorso, RADICE))
        return
    ix = json.load(open(percorso, encoding="utf-8"))
    effetti, livelli = ix.get("effetti", {}), ix.get("livelli", {})
    esito(ix.get("formato") == 1 and ix.get("frequenza") == 48000, "l'indice è nel formato 1, a 48 kHz")
    esito(bool(ix.get("licenza")), "l'indice dice la licenza degli effetti")
    licenza = open(os.path.join(RADICE, "LICENSE-CONTENUTI.md"), encoding="utf-8").read()
    esito("app/public/effetti/" in licenza, "LICENSE-CONTENUTI.md nomina app/public/effetti/ (fuori dalla licenza libera)")

    elencati, rotti = set(), []
    for chiave, file in effetti.items():
        if not file:
            rotti.append("%s: nessun file" % chiave)
        for f in file:
            elencati.add(f["file"])
            p = os.path.join(CARTELLA, f["file"])
            if not os.path.exists(p):
                rotti.append("%s: manca %s" % (chiave, f["file"]))
                continue
            ms, errore = durata_ogg_opus(p)
            if errore:
                rotti.append("%s: %s" % (f["file"], errore))
            elif abs(ms - 1000 * f["durata"]) > 30:
                rotti.append("%s: dura %d ms, l'indice dice %d" % (f["file"], ms, round(1000 * f["durata"])))
    n_file = sum(len(v) for v in effetti.values())
    esito(not rotti, "ogni file dell'indice c'è, è un Ogg Opus e dura quanto dice l'indice (%d effetti, %d file)" % (len(effetti), n_file), rotti)
    in_piu = sorted(f for f in os.listdir(CARTELLA) if f != "indice.json" and f not in elencati)
    esito(not in_piu, "nella cartella non ci sono file fuori dall'indice", in_piu)

    senza = sorted(k for k in effetti if not (0.005 < float(livelli.get(k, 0)) < 10))
    esito(not senza, "ogni effetto ha il suo livello, fra 0,005 e 10 (strumenti/effetti-livelli.cjs)", senza)

    grezze, usate = chiavi_nel_codice()
    mancano = sorted(usate - set(effetti))
    esito(not mancano, "ogni effetto che il codice suona è nell'indice (%d)" % len(usate), mancano)
    orfani = sorted(set(effetti) - grezze)
    esito(not orfani, "ogni effetto dell'indice è suonato dal codice", orfani)

    peso = sum(os.path.getsize(os.path.join(CARTELLA, f)) for f in os.listdir(CARTELLA))
    esito(peso < 2 * 1024 * 1024, "gli effetti pesano %.0f KB (tetto 2 MB)" % (peso / 1024))

    if shutil.which("ffmpeg"):
        def picco(f):
            r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", os.path.join(CARTELLA, f), "-af", "volumedetect", "-f", "null", "-"],
                               capture_output=True, text=True)
            m = re.search(r"max_volume: (-?[0-9.]+) dB", r.stderr)
            return float(m.group(1)) if m else None
        fuori = []
        for chiave, file in effetti.items():
            picchi = [picco(f["file"]) for f in file]
            if None in picchi:
                fuori.append("%s: non si misura" % chiave)
                continue
            # i colpi di una sequenza hanno la stessa energia, non lo stesso picco: conta il più alto, e nessuno sparisce
            if not (-6 <= max(picchi) <= -0.5) or min(picchi) < -15:
                fuori.append("%s: picchi da %.1f a %.1f dB" % (chiave, min(picchi), max(picchi)))
        esito(not fuori, "ogni effetto ha il picco più alto fra -6 e -0,5 dBFS, e nessuna variante sotto -15", fuori)
    else:
        print("-- senza ffmpeg: i picchi non si misurano")

    print("\nTUTTO OK" if not falliti else "\n%d CONTROLLI FALLITI" % len(falliti))


if __name__ == "__main__":
    main()
    sys.exit(1 if falliti else 0)
