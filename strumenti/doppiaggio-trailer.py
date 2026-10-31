"""La voce del trailer: una traccia sola, sul tempo del trailer.

Enzo ha letto le frasi del trailer una per una (doppiaggio/trailer.json, blocco narratore-trailer). Il
trailer (88,5 s) non cambia: durate, testi, musica e ordine restano quelli. Questo programma mette ogni
frase dentro la sua finestra (il tempo in cui sta sullo schermo) e scrive UNA traccia di voce lunga
quanto il trailer, che il gioco suona sull'orologio della musica:

  1. prende le parti tagliate (doppiaggio/master/clip/narratore-trailer/), senza il silenzio ai bordi;
  2. accorcia le pause dentro una frase oltre PAUSA_MAX (le pause lunghe di Enzo dopo il punto);
  3. se una frase è più lunga della sua finestra, la rende più svelta senza cambiarne l'altezza
     (ffmpeg atempo), al massimo di VELOCITA_MAX;
  4. la fa cominciare quando compare il suo testo, o appena finisce la precedente (con SPAZIO in mezzo);
     «tuo FRATELLO.» e il titolo cominciano esattamente al loro aggancio (64,0 e 82,3 s): la frase prima
     di un aggancio, se serve, si fa più svelta e poi comincia un poco prima;
  5. porta la voce a VOCE_LUFS (sopra la musica, che sotto la voce si abbassa: app/src/trailer/audio.ts)
     con un limitatore sui picchi, e codifica in Opus.

Le frasi di ESCLUSE restano solo scritte (decisione di Simone del 20/10/2026: nel finale non c'è tempo
per tutto; Enzo legge le cinque regole, non i numeri né «Un'avventura testuale…»).

Scrive app/public/voce/trailer.opus e app/public/voce/trailer.json (dove parla, frase per frase).

Uso:  python strumenti/doppiaggio-trailer.py           (scrive)
      python strumenti/doppiaggio-trailer.py --prova   (stampa la scaletta, non scrive)
"""
import argparse
import hashlib
import importlib.util
import json
import os
import re
import subprocess
import sys

import numpy as np

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_spec = importlib.util.spec_from_file_location("banco", os.path.join(RADICE, "strumenti", "doppiaggio-banco.py"))
B = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(B)

BLOCCO = "narratore-trailer"
DURATA = 88.5
SR = 48000
ESCLUSE = {"numeri1", "numeri2", "numeri3", "numeri4", "tagline"}
PAUSA_MAX = 0.25       # secondi: le pause più lunghe dentro una frase si accorciano a tanto
VELOCITA_MAX = 1.10    # al massimo il 10% più svelta
TUTTE_SVELTE = ("regola",)   # le frasi di questi gruppi vanno tutte alla velocità massima, per non cambiare passo
SPAZIO = 0.15          # secondi fra la fine di una frase e l'inizio della seguente
VOCE_LUFS = -18.0      # la voce del trailer, frasi messe in fila (la musica è a -14 e sotto la voce scende)
BITRATE = "48k"
USCITA = os.path.join(B.USCITA, "trailer.opus")
SCALETTA = os.path.join(B.USCITA, "trailer.json")


def ricampiona(x, sr):
    if sr == SR:
        return x
    p = subprocess.run(["ffmpeg", "-loglevel", "error", "-f", "f64le", "-ar", str(sr), "-ac", "1", "-i", "pipe:",
                        "-af", "aresample=%d:resampler=soxr" % SR, "-f", "f64le", "-"], input=x.astype("<f8").tobytes(),
                       capture_output=True)
    return np.frombuffer(p.stdout, dtype="<f8").copy()


def accorcia_pause(x):
    """Le pause interne (sotto -40 dBFS su 10 ms) oltre PAUSA_MAX si accorciano: si toglie il mezzo, con un incrocio."""
    f = int(0.01 * SR)
    n = len(x) // f
    rms = 20 * np.log10(np.sqrt((x[:n * f].reshape(n, f) ** 2).mean(axis=1)) + 1e-12)
    sotto = rms < -40
    tagli, i = [], 0
    while i < n:
        if sotto[i]:
            j = i
            while j < n and sotto[j]:
                j += 1
            if i > 0 and j < n and (j - i) * 0.01 > PAUSA_MAX:
                resta = int(PAUSA_MAX * SR)
                a, b = i * f, j * f
                tagli.append((a + resta // 2, b - resta // 2))
            i = j
        else:
            i += 1
    if not tagli:
        return x, 0.0
    k = int(0.01 * SR)
    pezzi, prec = [], 0
    for a, b in tagli:
        pezzi.append(x[prec:a])
        prec = b
    pezzi.append(x[prec:])
    out = pezzi[0]
    for p in pezzi[1:]:   # incrocio di 10 ms: sono silenzi, ma senza scalini
        r = np.linspace(0, 1, k)
        out = np.concatenate([out[:-k], out[-k:] * (1 - r) + p[:k] * r, p[k:]])
    return out, (len(x) - len(out)) / SR


def a_tempo(x, fattore):
    if fattore <= 1.0005:
        return x
    p = subprocess.run(["ffmpeg", "-loglevel", "error", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "pipe:",
                        "-af", "atempo=%.4f" % fattore, "-f", "f64le", "-"], input=x.astype("<f8").tobytes(), capture_output=True)
    return np.frombuffer(p.stdout, dtype="<f8").copy()


def parti_del_trailer_inglese():
    """Le parti del trailer inglese, come le dà il manifest italiano: id, testo, finestra, aggancio, id dell'unità
    (doppiaggio/en/trailer.json, in ordine di scaletta; l'id è quello di strumenti/doppiaggio-inglese.py)."""
    with open(os.path.join(B.DOPPIAGGIO, "en", "trailer.json"), encoding="utf-8") as f:
        tj = json.load(f)
    return [{**{k: p[k] for k in ("id", "testo", "tono", "da", "a") + (("aggancia",) if "aggancia" in p else ())},
             "unita": hashlib.sha1(("en-narratore-trailer\n" + p["testo"]).encode("utf-8")).hexdigest()[:8]}
            for p in tj["parti"]]


def main():
    global BLOCCO, USCITA, SCALETTA
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--prova", action="store_true")
    ap.add_argument("--lingua", choices=["it", "en"], default="it",
                    help="en: il trailer inglese (clip in master/clip/en-trailer/, testi da doppiaggio/en/trailer.json), "
                         "scritto in app/public/voce/en/trailer.opus e trailer.json")
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")
    en = a.lingua == "en"
    if en:
        BLOCCO = "en-trailer"
        USCITA = os.path.join(B.USCITA, "en", "trailer.opus")
        SCALETTA = os.path.join(B.USCITA, "en", "trailer.json")
        os.makedirs(os.path.dirname(USCITA), exist_ok=True)
        parti_trailer = parti_del_trailer_inglese()
    else:
        with open(os.path.join(B.DOPPIAGGIO, "manifest.json"), encoding="utf-8") as f:
            parti_trailer = json.load(f)["trailer"]

    # 1-3. le frasi, rifilate e con le pause accorciate; la velocità che serve a starci
    frasi = []
    for p in parti_trailer:
        if p["id"] in ESCLUSE:
            continue
        x, sr = B.leggi_wav(os.path.join(B.CLIP, BLOCCO, p["unita"] + ".wav"))
        y, tolte = accorcia_pause(ricampiona(B.rifila(x, sr), sr))
        frasi.append({**p, "audio": y, "pause_tolte": tolte})
    for k, fr in enumerate(frasi):
        d = len(fr["audio"]) / SR
        prossimo = next((g["aggancia"] for g in frasi[k + 1:] if g.get("aggancia")), DURATA)
        # spazio: fino alla fine della finestra, e mai oltre il prossimo aggancio
        spazio = min(fr["a"], prossimo - SPAZIO) - (fr.get("aggancia") or fr["da"])
        fr["velocita"] = round(min(VELOCITA_MAX, max(1.0, d / spazio)), 3) if spazio > 0 else VELOCITA_MAX
        if fr["id"].startswith(TUTTE_SVELTE):   # le cinque regole, tutte allo stesso passo (Simone, 20/10)
            fr["velocita"] = VELOCITA_MAX
        fr["audio"] = a_tempo(fr["audio"], fr["velocita"])

    # 4. la scaletta
    fine = 0.0
    for k, fr in enumerate(frasi):
        d = len(fr["audio"]) / SR
        if fr.get("aggancia"):
            inizio = fr["aggancia"]
            if fine + SPAZIO > inizio:   # la frase prima finisce troppo tardi: comincia prima lei
                prima = frasi[k - 1]
                prima["inizio"] = round(prima["inizio"] - (fine + SPAZIO - inizio), 3)
                prima["fine"] = round(prima["inizio"] + len(prima["audio"]) / SR, 3)
        else:
            inizio = max(fr["da"], fine + SPAZIO)
        fr["inizio"], fr["fine"] = round(inizio, 3), round(inizio + d, 3)
        fine = fr["fine"]
    for fr in frasi:
        note = []
        if fr["inizio"] < fr["da"] - 0.01:
            note.append("comincia %.2f s prima del testo" % (fr["da"] - fr["inizio"]))
        if fr["inizio"] > fr["da"] + 0.3:
            note.append("dopo il testo di %.2f s" % (fr["inizio"] - fr["da"]))
        if fr["fine"] > fr["a"] + 0.05:
            note.append("oltre la finestra di %.2f s" % (fr["fine"] - fr["a"]))
        print("%-9s %6.2f–%6.2f  (testo %6.2f–%6.2f)  velocità %.2f  pause −%.2f s  %s" % (
            fr["id"], fr["inizio"], fr["fine"], fr["da"], fr["a"], fr["velocita"], fr["pause_tolte"], "; ".join(note)))
    sovrapposte = [(x["id"], y["id"]) for x, y in zip(frasi, frasi[1:]) if x["fine"] > y["inizio"]]
    if sovrapposte:
        raise SystemExit("frasi sovrapposte: %s" % sovrapposte)
    if frasi[-1]["fine"] > DURATA:
        raise SystemExit("la voce va oltre la fine del trailer")
    if a.prova:
        return

    # 5. la traccia, il volume, la codifica
    traccia = np.zeros(int(DURATA * SR))
    for fr in frasi:
        i = int(round(fr["inizio"] * SR))
        traccia[i:i + len(fr["audio"])] += fr["audio"]
    sole = np.concatenate([z for fr in frasi for z in (fr["audio"], np.zeros(int(0.3 * SR)))])
    lufs, _ = B.ebur128(["-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "pipe:"], sole.astype("<f8").tobytes())
    guadagno = VOCE_LUFS - lufs
    p = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "pipe:",
         "-af", "volume=%.2fdB,alimiter=limit=0.79:attack=3:release=60:level=disabled" % guadagno,
         "-c:a", "libopus", "-b:a", BITRATE, "-vbr", "on", "-compression_level", "10", "-application", "audio",
         "-map_metadata", "-1", "-fflags", "+bitexact", "-flags:a", "+bitexact", USCITA],
        input=traccia.astype("<f8").tobytes(), capture_output=True)
    if p.returncode:
        raise SystemExit(p.stderr.decode("utf-8", "replace"))
    dopo, picco = B.ebur128(["-i", USCITA])
    with open(SCALETTA, "w", encoding="utf-8", newline="\n") as f:
        json.dump({"formato": 1, **({"lingua": "en"} if en else {}), "durata": DURATA, "file": os.path.basename(USCITA),
                   "frasi": [{"id": fr["id"], "unita": fr["unita"], "da": fr["inizio"], "a": fr["fine"]} for fr in frasi],
                   "escluse": sorted(ESCLUSE)},
                  f, ensure_ascii=False, indent=1)
        f.write("\n")
    print("\nvoce: %.1f LUFS prima, %+.1f dB; la traccia: %.1f LUFS (silenzi compresi), picco vero %.1f dBTP, %d KB" % (
        lufs, guadagno, dopo, picco, os.path.getsize(USCITA) // 1024))
    print("scritti %s e %s" % (os.path.relpath(USCITA, RADICE), os.path.relpath(SCALETTA, RADICE)))


if __name__ == "__main__":
    main()
