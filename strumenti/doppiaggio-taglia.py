"""Dal WAV di AI Studio alle singole parti del doppiaggio.

Una generazione dà un WAV lungo con tutte le parti di un blocco (doppiaggio/blocchi/<blocco>.txt)
una dopo l'altra. Questo programma:

  1. trascrive il WAV con faster-whisper (sul processore, modello medium, già in cache; con un
     filtro delle pause, che altrimenti sfasano i tempi) e tiene i tempi di ogni parola;
  2. allinea le parole riconosciute con quelle attese dal manifest (un allineamento globale, che
     tollera parole storpiate, saltate o inventate: whisper scrive «acqua viva» per «Acquaviva»);
  3. taglia ogni parte nel silenzio fra lei e la vicina e la scrive in un WAV a sé;
  4. controlla ogni parte contro il testo e dice quali ascoltare.

Se una generazione è stata divisa in più WAV, si danno nell'ordine: le parti proseguono dall'uno
all'altro.

Uso:  python strumenti/doppiaggio-taglia.py servizio doppiaggio/master/a.wav doppiaggio/master/b.wav
      python strumenti/doppiaggio-taglia.py servizio a.wav b.wav --solo-verifica

(Senza -I: faster-whisper sta fra i pacchetti dell'utente. Non scarica niente: se il modello
non è in cache si ferma.)

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
MODELLO = "medium"  # il modello di faster-whisper (in cache in ~/.cache/huggingface)
FINESTRA = 0.6      # quanto lontano da dove whisper mette il confine si cerca un silenzio, in secondi


def impronta(voce, testo):
    """Lo stesso id di strumenti/doppiaggio.py: l'impronta di voce + testo."""
    return hashlib.sha1((voce + "\n" + testo).encode("utf-8")).hexdigest()[:8]


def testo_della_riga(r):
    """Il testo parlato di una riga di un blocco (come in doppiaggio.py): senza il tag di pausa in coda
    (Gemini) né i tag di tono in testa «[wary, guarded] …» (ElevenLabs); None per le righe vuote e
    le intestazioni «###»."""
    r = r.rstrip("\n")
    if not r.strip() or r.startswith("###"):
        return None
    r = re.sub(r"^(\[[^\]]*\]\s*)+", "", r)
    return r.removesuffix(" <long pause>")


def gettoni(testo):
    """Le parole di un testo, in minuscolo, senza punteggiatura né apostrofi (d'acqua → d, acqua);
    le cifre diventano parole."""
    out = []
    for g in re.findall(r"[a-zà-ÿ]+|\d+", testo.lower()):
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


_MODELLO = []


def carica_modello():
    if not _MODELLO:
        from faster_whisper import WhisperModel
        _MODELLO.append(WhisperModel(MODELLO, device="cpu", compute_type="int8", local_files_only=True))
    return _MODELLO[0]


def riconosci(wav, da=0.0):
    segmenti, _ = carica_modello().transcribe(wav, language="it", word_timestamps=True,
                                              condition_on_previous_text=False, vad_filter=True,
                                              vad_parameters=dict(min_silence_duration_ms=300, speech_pad_ms=120))
    return [(w.word.strip(), round(w.start + da, 3), round(w.end + da, 3)) for s in segmenti for w in s.words]


def buchi_con_parlato(parole, sil, durata, minimo=5.0):
    """Gli intervalli di almeno `minimo` secondi senza parole riconosciute ma con voce."""
    punti = [(0.0, 0.0)] + [(a, b) for _, a, b in parole] + [(durata, durata)]
    out = []
    for (_, fine), (inizio, _) in zip(punti, punti[1:]):
        lungo = inizio - fine
        if lungo >= minimo:
            muto = sum(max(0.0, min(e, inizio) - max(s, fine)) for s, e in sil)
            if 1.0 - muto / lungo >= 0.3:
                out.append((fine, inizio))
    return out


def riempi_i_buchi_di_riconoscimento(wav, parole):
    """Riconosce a parte i tratti che il riconoscimento ha lasciato vuoti; restituisce le parole
    complete e quante ne ha aggiunte."""
    with wave.open(wav) as wv:
        rate, durata = wv.getframerate(), wv.getnframes() / wv.getframerate()
        tutto = array.array("h")
        tutto.frombytes(wv.readframes(wv.getnframes()))
    nuove = []
    for da, a in buchi_con_parlato(parole, silenzi(wav), durata):
        da, a = max(0.0, da - 0.3), min(durata, a + 0.3)
        temp = wav + ".buco.wav"
        with wave.open(temp, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(rate)
            w.writeframes(tutto[int(da * rate):int(a * rate)].tobytes())
        try:
            nuove += riconosci(temp, da)
        finally:
            os.remove(temp)
    if not nuove:
        return parole, 0
    return sorted(parole + nuove, key=lambda x: x[1]), len(nuove)


def trascrivi(wav):
    """[(parola, inizio, fine)] di un WAV; la trascrizione si tiene in <cartella>/trascrizioni/."""
    cart = os.path.join(os.path.dirname(wav), "trascrizioni")
    cache = os.path.join(cart, os.path.splitext(os.path.basename(wav))[0] + ".fw.json")
    if os.path.exists(cache):
        with open(cache, encoding="utf-8") as f:
            parole = json.load(f)
    else:
        parole = riconosci(wav)
        os.makedirs(cart, exist_ok=True)
    parole, aggiunte = riempi_i_buchi_di_riconoscimento(wav, parole)
    if aggiunte or not os.path.exists(cache):
        with open(cache, "w", encoding="utf-8", newline="\n") as f:
            json.dump(parole, f, ensure_ascii=False)
    return parole


def parole_riconosciute(parole, indice_wav):
    """[(gettone, inizio, fine, indice_wav)] dalle parole di whisper (una parola può dare più gettoni)."""
    out = []
    for w, ini, fin in parole:
        gs = gettoni(w)
        for k, g in enumerate(gs):
            dt = (fin - ini) / len(gs)
            out.append((g, ini + k * dt, ini + (k + 1) * dt, indice_wav))
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
    cand = [(a, b) for a, b in sil if b - a >= 0.25 and a <= inizio_b + FINESTRA and b >= fine_a - FINESTRA]
    if cand:
        a, b = min(cand, key=lambda s: abs((s[0] + s[1]) / 2 - medio))
        meta = (a + b) / 2
        return min(a + MARGINE, meta), max(b - MARGINE, meta)
    return min(fine_a + MARGINE, medio), max(inizio_b - MARGINE, medio)


def tratti_di_parlato(sil, da, a, vuoto=0.30, minimo=0.15):
    """I tratti con voce fra due istanti: il complemento dei silenzi, con i tratti separati da
    meno di `vuoto` secondi uniti (una virgola non separa due parti) e scartati quelli
    più brevi di `minimo`."""
    voce, cur = [], da
    for s, e in sorted(sil):
        if e <= da or s >= a:
            continue
        if s > cur:
            voce.append([cur, s])
        cur = max(cur, e)
    if cur < a:
        voce.append([cur, a])
    uniti = []
    for v in voce:
        if uniti and v[0] - uniti[-1][1] < vuoto:
            uniti[-1][1] = v[1]
        else:
            uniti.append(v)
    return [v for v in uniti if v[1] - v[0] >= minimo]


def riempi_i_buchi(info, sil):
    """Per ogni serie di parti MANCANTI fra due parti trovate nello stesso WAV: se la finestra
    ha tanti tratti di parlato quante sono le parti, le assegna in ordine. Restano da
    confermare con l'orecchio (o con un altro riconoscimento di quel tratto)."""
    fatte = []
    k = 0
    while k < len(info):
        if not info[k].get("mancante"):
            k += 1
            continue
        j = k
        while j < len(info) and info[j].get("mancante"):
            j += 1
        prec = info[k - 1] if k > 0 else None
        succ = info[j] if j < len(info) else None
        if prec and succ and not prec.get("mancante") and not succ.get("mancante") and prec["wav"] == succ["wav"]:
            tratti = tratti_di_parlato(sil[prec["wav"]], prec["fine"] + 0.05, succ["inizio"] - 0.05)
            if len(tratti) == j - k:
                for x, (da, a) in zip(info[k:j], tratti):
                    x.pop("mancante")
                    x.update({"wav": prec["wav"], "a_cavallo": False, "inizio": da, "fine": a,
                              "somiglianza": None, "trovate": 0, "attese": 0,
                              "riconosciuto": "", "dai_silenzi": True})
                    fatte.append(x["k"])
        k = j
    return fatte


def controlla_le_parti(uscita, ok):
    """Il controllo indipendente: ogni parte tagliata si riconosce da sola e si confronta col
    testo. Dentro deve esserci quella frase e niente delle vicine (ne verrebbe una somiglianza
    bassa, o parole in più)."""
    modello = carica_modello()
    for x in ok:
        segmenti, _ = modello.transcribe(os.path.join(uscita, x["file"]), language="it",
                                         condition_on_previous_text=False, vad_filter=False)
        sentito = " ".join(s.text.strip() for s in segmenti)
        atteso = "".join(gettoni(x["testo"]))
        trovato = "".join(gettoni(sentito))
        x["controllo"] = difflib.SequenceMatcher(None, atteso, trovato, autojunk=False).ratio()
        x["sentito"] = sentito
        x["in_piu"] = len(trovato) > len(atteso) * 1.25 + 3


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
    ap.add_argument("--controlla", action="store_true",
                    help="dopo il taglio, riconosce ogni parte da sola e la confronta col testo (qualche minuto)")
    ap.add_argument("--uscita", help="cartella delle parti (predefinita: doppiaggio/master/clip/<blocco>)")
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")

    da_file = a.da_file
    voce = a.voce
    if not da_file:
        gen = os.path.join(CARTELLA, "generati", a.blocco + ".txt")
        if os.path.exists(gen):  # un blocco già generato: le parti attese sono quelle che sono state lette
            da_file = gen
            with open(os.path.join(CARTELLA, "manifest.json"), encoding="utf-8") as f:
                voce = voce or json.load(f)["blocchi"][a.blocco]["voce"]
    if da_file:
        # un blocco già generato, com'era quando è stato incollato in AI Studio (doppiaggio/generati/);
        # le intestazioni di gruppo («### tono …») non sono parti
        with open(da_file, encoding="utf-8") as f:
            testi = [x for x in (testo_della_riga(r) for r in f) if x]
        ids = [impronta(voce or a.blocco, t) for t in testi]
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
        R += parole_riconosciute(trascrivi(w), k)
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
        sim = difflib.SequenceMatcher(None, "".join(E[e] for e in idx),
                                      "".join(r[0] for r in R[j0:j1 + 1]), autojunk=False).ratio()
        wavs = {R[j][3] for _, j in trovati}
        info.append({"k": k, "id": ids[k], "testo": t, "wav": R[j0][3], "a_cavallo": len(wavs) > 1,
                     "inizio": R[j0][1], "fine": R[j1][2], "somiglianza": sim,
                     "trovate": len(trovati), "attese": len(idx), "riconosciuto": riconosciuto})

    # 3b. i buchi del riconoscimento (whisper ogni tanto salta un tratto lungo)
    riempite = riempi_i_buchi(info, sil)

    # 4. i tagli
    ok = [x for x in info if not x.get("mancante")]
    for x, y in zip(ok, ok[1:]):
        if x["wav"] == y["wav"]:
            x["taglio_fine"], y["taglio_inizio"] = punto_di_taglio(x["fine"], y["inizio"], sil[x["wav"]])
    for x in ok:
        x.setdefault("taglio_inizio", max(0.0, x["inizio"] - MARGINE))
        x.setdefault("taglio_fine", min(durate[x["wav"]], x["fine"] + 0.25))
    for x in ok:
        if x["taglio_fine"] - x["taglio_inizio"] < 0.2:  # tempi di whisper e silenzi non tornano
            x["taglio_inizio"] = max(0.0, x["inizio"] - MARGINE)
            x["taglio_fine"] = min(durate[x["wav"]], x["fine"] + MARGINE)
            x["tagli_incerti"] = True
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

    if a.controlla and not a.solo_verifica:
        controlla_le_parti(uscita, ok)

    # 5. il rapporto
    brutti = [x for x in info if x.get("mancante") or x.get("tagli_incerti")
              or (not x.get("dai_silenzi") and (x["somiglianza"] < SOGLIA or x["a_cavallo"]))]
    righe = []
    for x in brutti:
        if x.get("mancante"):
            righe.append("%3d  MANCANTE        «%s»" % (x["k"] + 1, x["testo"]))
        elif x["somiglianza"] is None or (x.get("tagli_incerti") and x["somiglianza"] >= SOGLIA):
            righe.append("%3d  taglio incerto (tempi di whisper e silenzi non tornano)  «%s»" % (x["k"] + 1, x["testo"]))
        else:
            righe.append("%3d  somiglianza %3d%%  attesa «%s»  sentita «%s»%s" % (
                x["k"] + 1, round(100 * x["somiglianza"]), x["testo"], x["riconosciuto"],
                "  (a cavallo di due WAV)" if x["a_cavallo"] else ""))
    if a.controlla and not a.solo_verifica:
        for x in ok:
            if x["controllo"] < 0.85 or x["in_piu"]:
                righe.append("%3d  controllo %3d%%%s  attesa «%s»  nella parte tagliata si sente «%s»" % (
                    x["k"] + 1, round(100 * x["controllo"]), "  (parole in più)" if x["in_piu"] else "",
                    x["testo"], x["sentito"]))
    tag_letti = [r for r in R if r[0] in ("long", "pause")]
    parole_attese = len(E)
    tempo_parlato = sum(x["fine"] - x["inizio"] for x in ok)
    riepilogo = [
        "blocco %s: %d parti attese, %d trovate, %d da riascoltare (somiglianza sotto %d%%)" % (
            a.blocco, len(testi), len(ok), len(brutti), round(100 * SOGLIA)),
        "WAV: %s (%s s)" % (", ".join(os.path.basename(w) for w in a.wav), ", ".join("%.1f" % d for d in durate)),
        ("%d parti non riconosciute da whisper ma assegnate ai tratti di parlato (da confermare: %s)" % (
            len(riempite), ", ".join(str(k + 1) for k in riempite[:3]) + ("…" if len(riempite) > 3 else ""))) if riempite else "",
        "parole attese %d, riconosciute %d; parole «long»/«pause» sentite: %d" % (parole_attese, len(R), len(tag_letti)),
        "pausa fra una parte e l'altra (ciò che <long pause> ha fatto davvero): mediana %.2f s, minima %.2f, massima %.2f" % (
            statistics.median(pause), min(pause), max(pause)) if pause else "",
        "ritmo mentre parla (pause escluse): %.0f parole al minuto" % (parole_attese / tempo_parlato * 60) if tempo_parlato else "",
        "ritmo contando anche le pause: %.0f parole al minuto" % (parole_attese / (sum(durate) / 60)),
        ("controllo di ogni parte tagliata: %d su %d con somiglianza almeno 85%% e senza parole in più" % (
            sum(1 for x in ok if x["controllo"] >= 0.85 and not x["in_piu"]), len(ok)))
        if a.controlla and not a.solo_verifica else "",
    ]
    testo = "\n".join([r for r in riepilogo if r] + [""] + righe) + "\n"
    with open(os.path.join(uscita, "rapporto.txt"), "w", encoding="utf-8", newline="\n") as f:
        f.write(testo)
    if not a.solo_verifica:
        with open(os.path.join(uscita, "indice.json"), "w", encoding="utf-8", newline="\n") as f:
            json.dump({x["id"]: {k: x[k] for k in ("file", "wav", "inizio", "fine", "durata", "somiglianza")}
                       | ({"dai_silenzi": True} if x.get("dai_silenzi") else {}) for x in ok},
                      f, ensure_ascii=False, indent=1)
    print(testo)


if __name__ == "__main__":
    main()
