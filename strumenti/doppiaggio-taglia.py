"""Dal WAV di AI Studio alle singole parti del doppiaggio.

Una generazione dà un WAV lungo con tutte le parti di un blocco (doppiaggio/blocchi/<blocco>.txt)
una dopo l'altra. Questo programma:

  1. legge la trascrizione di whisper con i tempi di ogni parola (la lancia lui, se manca);
  2. allinea le parole riconosciute con quelle attese dal manifest (un allineamento globale, che
     tollera parole storpiate, saltate o inventate: whisper scrive «acqua viva» per «Acquaviva»);
  3. taglia ogni parte nel silenzio fra lei e la vicina e la scrive in un WAV a sé;
  4. controlla ogni parte contro il testo e dice quali ascoltare.

Se una generazione è stata divisa in più WAV, si danno nell'ordine: le parti proseguono dall'uno
all'altro.

Uso:  python strumenti/doppiaggio-taglia.py servizio doppiaggio/master/a.wav doppiaggio/master/b.wav
      python strumenti/doppiaggio-taglia.py servizio a.wav b.wav --solo-verifica

Scrive in doppiaggio/master/clip/<blocco>/: <id>.wav per ogni parte, indice.json, rapporto.txt
(la cartella master non è nel repository).
"""
import argparse
import array
import difflib
import hashlib
import json
import os
import re
import statistics
import subprocess
import sys
import wave
from functools import lru_cache

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARTELLA = os.path.join(RADICE, "doppiaggio")
NUMERI = ["zero", "uno", "due", "tre", "quattro", "cinque", "sei", "sette", "otto", "nove", "dieci",
          "undici", "dodici", "tredici", "quattordici", "quindici", "sedici", "diciassette",
          "diciotto", "diciannove", "venti"]
MARGINE = 0.15      # secondi di silenzio che si lasciano attorno a ogni parte
DISSOLVENZA = 0.006  # secondi: per non fare «clic» ai bordi del taglio
BANDA = 150         # quanto può scostarsi l'allineamento dalla diagonale, in parole
SOGLIA = 0.80       # somiglianza sotto cui una parte va riascoltata


def impronta(voce, testo):
    """Lo stesso id di strumenti/doppiaggio.py: l'impronta di voce + testo."""
    return hashlib.sha1((voce + "\n" + testo).encode("utf-8")).hexdigest()[:8]


def gettoni(testo):
    """Le parole di un testo, in minuscolo, senza punteggiatura né apostrofi (d'acqua → d, acqua);
    le cifre diventano parole."""
    out = []
    for g in re.findall(r"[a-zà-ÿ0-9]+", testo.lower()):
        out.append(NUMERI[int(g)] if g.isdigit() and int(g) < len(NUMERI) else g)
    return out


@lru_cache(maxsize=None)
def costo(a, b):
    if a == b:
        return 0.0
    if a[0] != b[0] and abs(len(a) - len(b)) > 2:
        return 2.0
    return 2.0 * (1.0 - difflib.SequenceMatcher(None, a, b).ratio())


def allinea(E, R):
    """Allineamento globale a banda: per ogni parola attesa, l'indice della parola riconosciuta
    che le corrisponde, o None. Parola saltata o inventata costa 1; sostituzione fino a 2."""
    n, m = len(E), len(R)
    INF = float("inf")
    prec = [j * 1.0 for j in range(m + 1)]
    ind = [bytearray(m + 1) for _ in range(n + 1)]  # 0 = parola uguale/simile, 1 = attesa saltata, 2 = riconosciuta in più
    for j in range(1, m + 1):
        ind[0][j] = 2
    for i in range(1, n + 1):
        cur = [INF] * (m + 1)
        c = round(i * m / max(n, 1))
        lo, hi = max(1, c - BANDA), min(m, c + BANDA)
        if lo == 1:
            cur[0] = float(i)
        ind[i][0] = 1
        for j in range(lo, hi + 1):
            sost = prec[j - 1] + costo(E[i - 1], R[j - 1])
            salt = prec[j] + 1.0
            piu = cur[j - 1] + 1.0
            if sost <= salt and sost <= piu:
                cur[j], ind[i][j] = sost, 0
            elif salt <= piu:
                cur[j], ind[i][j] = salt, 1
            else:
                cur[j], ind[i][j] = piu, 2
        prec = cur
    abbina = [None] * n
    i, j = n, m
    while i > 0 or j > 0:
        mossa = ind[i][j] if i > 0 and j > 0 else (1 if i > 0 else 2)
        if mossa == 0:
            abbina[i - 1] = j - 1
            i, j = i - 1, j - 1
        elif mossa == 1:
            i -= 1
        else:
            j -= 1
    return abbina


def parole_riconosciute(percorso_json, indice_wav):
    """[(gettone, inizio, fine, indice_wav)] da un JSON di whisper con i tempi delle parole."""
    with open(percorso_json, encoding="utf-8") as f:
        d = json.load(f)
    out = []
    for s in d["segments"]:
        for w in s.get("words", []):
            gs = gettoni(w["word"])
            for k, g in enumerate(gs):
                dt = (w["end"] - w["start"]) / len(gs)
                out.append((g, w["start"] + k * dt, w["start"] + (k + 1) * dt, indice_wav))
    return out


def silenzi(wav, soglia="-40dB", durata=0.15):
    p = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", wav, "-af",
                        "silencedetect=noise=%s:d=%s" % (soglia, durata), "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    ini, out = None, []
    for r in p.stderr.splitlines():
        m = re.search(r"silence_start: ([\d.]+)", r)
        if m:
            ini = float(m.group(1))
        m = re.search(r"silence_end: ([\d.]+)", r)
        if m and ini is not None:
            out.append((ini, float(m.group(1))))
            ini = None
    return out


def punto_di_taglio(fine_a, inizio_b, sil):
    """(fine della parte A, inizio della parte B) dentro il silenzio che le separa."""
    medio = (fine_a + inizio_b) / 2
    cand = [(a, b) for a, b in sil if a <= inizio_b + 0.1 and b >= fine_a - 0.1]
    if cand:
        a, b = min(cand, key=lambda s: abs((s[0] + s[1]) / 2 - medio))
        meta = (a + b) / 2
        return min(max(a + MARGINE, fine_a), meta), max(min(b - MARGINE, inizio_b), meta)
    return min(fine_a + MARGINE, medio), max(inizio_b - MARGINE, medio)


def scrivi_wav(percorso, campioni, rate):
    n = len(campioni)
    f = max(1, int(DISSOLVENZA * rate))
    for k in range(min(f, n)):
        campioni[k] = int(campioni[k] * k / f)
        campioni[n - 1 - k] = int(campioni[n - 1 - k] * k / f)
    with wave.open(percorso, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(campioni.tobytes())


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("blocco")
    ap.add_argument("wav", nargs="+")
    ap.add_argument("--da-file", help="le parti attese sono le righe di questo file (un blocco già "
                                      "generato, in doppiaggio/generati/), non quelle del manifest")
    ap.add_argument("--voce", help="con --da-file: la voce con cui si calcolano gli id (predefinita: il blocco)")
    ap.add_argument("--solo-verifica", action="store_true", help="non scrive i WAV delle parti")
    ap.add_argument("--uscita", help="cartella delle parti (predefinita: doppiaggio/master/clip/<blocco>)")
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")

    if a.da_file:
        # un blocco già generato, com'era quando è stato incollato in AI Studio (doppiaggio/generati/)
        with open(a.da_file, encoding="utf-8") as f:
            testi = [r.rstrip("\n").removesuffix(" <long pause>") for r in f if r.strip()]
        ids = [impronta(a.voce or a.blocco, t) for t in testi]
    else:
        with open(os.path.join(CARTELLA, "manifest.json"), encoding="utf-8") as f:
            man = json.load(f)
        ids = man["blocchi"][a.blocco]["parti"]
        testi = [man["unita"][i]["testo"] for i in ids]
    uscita = a.uscita or os.path.join(CARTELLA, "master", "clip", a.blocco)
    os.makedirs(uscita, exist_ok=True)

    # 1. la trascrizione di ogni WAV
    R, durate, sil = [], [], []
    for k, w in enumerate(a.wav):
        w = os.path.abspath(w)
        cart = os.path.join(os.path.dirname(w), "trascrizioni")
        js = os.path.join(cart, os.path.splitext(os.path.basename(w))[0] + ".json")
        if not os.path.exists(js):
            os.makedirs(cart, exist_ok=True)
            env = dict(os.environ, PYTHONUTF8="1")
            subprocess.run(["whisper", w, "--model", "medium", "--language", "it", "--word_timestamps", "True",
                            "--output_dir", cart, "--output_format", "json", "--fp16", "False"], check=True, env=env)
        R += parole_riconosciute(js, k)
        with wave.open(w) as wv:
            durate.append(wv.getnframes() / wv.getframerate())
        sil.append(silenzi(w))

    # 2. l'allineamento
    E, parte_di = [], []
    for k, t in enumerate(testi):
        for g in gettoni(t):
            E.append(g)
            parte_di.append(k)
    abbina = allinea(E, [r[0] for r in R])

    # 3. per ogni parte: dove comincia, dove finisce, quanto somiglia
    info = []
    for k, t in enumerate(testi):
        idx = [e for e in range(len(E)) if parte_di[e] == k]
        trovati = [(e, abbina[e]) for e in idx if abbina[e] is not None]
        if not trovati:
            info.append({"k": k, "id": ids[k], "testo": t, "mancante": True})
            continue
        j0, j1 = trovati[0][1], trovati[-1][1]
        riconosciuto = " ".join(r[0] for r in R[j0:j1 + 1])
        sim = sum(1.0 - costo(E[e], R[j][0]) / 2.0 for e, j in trovati) / len(idx)
        wavs = {R[j][3] for _, j in trovati}
        info.append({"k": k, "id": ids[k], "testo": t, "wav": R[j0][3], "a_cavallo": len(wavs) > 1,
                     "inizio": R[j0][1], "fine": R[j1][2], "somiglianza": sim,
                     "trovate": len(trovati), "attese": len(idx), "riconosciuto": riconosciuto})

    # 4. i tagli
    ok = [x for x in info if not x.get("mancante")]
    for x, y in zip(ok, ok[1:]):
        if x["wav"] == y["wav"]:
            x["taglio_fine"], y["taglio_inizio"] = punto_di_taglio(x["fine"], y["inizio"], sil[x["wav"]])
    for x in ok:
        x.setdefault("taglio_inizio", max(0.0, x["inizio"] - MARGINE))
        x.setdefault("taglio_fine", min(durate[x["wav"]], x["fine"] + 0.25))
    pause = [y["inizio"] - x["fine"] for x, y in zip(ok, ok[1:]) if x["wav"] == y["wav"]]

    if not a.solo_verifica:
        campioni, rate = [], 24000
        for w in a.wav:
            with wave.open(w) as wv:
                rate = wv.getframerate()
                s = array.array("h")
                s.frombytes(wv.readframes(wv.getnframes()))
                campioni.append(s)
        for x in ok:
            s = campioni[x["wav"]]
            parte = s[int(x["taglio_inizio"] * rate):int(x["taglio_fine"] * rate)]
            x["file"] = x["id"] + ".wav"
            x["durata"] = round(len(parte) / rate, 2)
            scrivi_wav(os.path.join(uscita, x["file"]), array.array("h", parte), rate)

    # 5. il rapporto
    brutti = [x for x in info if x.get("mancante") or x["somiglianza"] < SOGLIA or x["a_cavallo"]]
    righe = []
    for x in brutti:
        if x.get("mancante"):
            righe.append("%3d  MANCANTE        «%s»" % (x["k"] + 1, x["testo"]))
        else:
            righe.append("%3d  somiglianza %3d%%  attesa «%s»  sentita «%s»%s" % (
                x["k"] + 1, round(100 * x["somiglianza"]), x["testo"], x["riconosciuto"],
                "  (a cavallo di due WAV)" if x["a_cavallo"] else ""))
    tag_letti = [r for r in R if r[0] in ("long", "pause")]
    parole_attese = len(E)
    tempo_parlato = sum(x["fine"] - x["inizio"] for x in ok)
    riepilogo = [
        "blocco %s: %d parti attese, %d trovate, %d da riascoltare (somiglianza sotto %d%%)" % (
            a.blocco, len(testi), len(ok), len(brutti), round(100 * SOGLIA)),
        "WAV: %s (%s s)" % (", ".join(os.path.basename(w) for w in a.wav), ", ".join("%.1f" % d for d in durate)),
        "parole attese %d, riconosciute %d; parole «long»/«pause» sentite: %d" % (parole_attese, len(R), len(tag_letti)),
        "pausa fra una parte e l'altra (ciò che <long pause> ha fatto davvero): mediana %.2f s, minima %.2f, massima %.2f" % (
            statistics.median(pause), min(pause), max(pause)) if pause else "",
        "ritmo mentre parla (pause escluse): %.0f parole al minuto" % (parole_attese / tempo_parlato * 60) if tempo_parlato else "",
        "ritmo contando anche le pause: %.0f parole al minuto" % (parole_attese / (sum(durate) / 60)),
    ]
    testo = "\n".join([r for r in riepilogo if r] + [""] + righe) + "\n"
    with open(os.path.join(uscita, "rapporto.txt"), "w", encoding="utf-8", newline="\n") as f:
        f.write(testo)
    if not a.solo_verifica:
        with open(os.path.join(uscita, "indice.json"), "w", encoding="utf-8", newline="\n") as f:
            json.dump({x["id"]: {k: x[k] for k in ("file", "wav", "inizio", "fine", "durata", "somiglianza")}
                       for x in ok}, f, ensure_ascii=False, indent=1)
    print(testo)


if __name__ == "__main__":
    main()
