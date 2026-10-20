"""Il banco della voce è completo, fresco e sano.

Il gioco suona un file Opus per parte (app/public/voce/<id>.opus, scritto da
strumenti/doppiaggio-banco.py); l'id è l'impronta di voce + testo. Questo collaudo
ricava dai .fav di OGGI le parti che devono avere una voce (lo stesso spezzamento di
strumenti/doppiaggio.py, trailer compreso) e controlla:

  1. ogni parte ha il suo audio, o è dichiarata muta col motivo (indice → «muti»): un
     testo cambiato nel gioco ha un id nuovo, e qui risulta senza audio;
  2. l'indice non ha parti che il gioco non dice più (audio scaduto);
  3. ogni file c'è, è un Ogg Opus vero, dura quanto dice l'indice, e nella cartella
     non c'è niente di più;
  4. le durate sono sensate per il testo (né una parola di trenta secondi né una
     descrizione di mezzo secondo: un file scambiato si vede qui);
  5. il volume: ogni blocco sta attorno al bersaglio e nessun picco tocca lo 0 dBFS
     (dal resoconto doppiaggio/banco.json; con ffmpeg, rimisurato sui file veri);
  6. il peso della voce nel pacchetto;
  7. con la logica vera dell'app (app/src/gioco/parti.ts, in Node): lungo i dodici percorsi e le
     tre morti di finali.py, ogni riga che il motore stampa trova le sue parti, pezzo per pezzo, e
     ogni risposta di dialogo offerta ha la voce del narratore (serve `npm ci --prefix app`).

Uso:  python doppiaggio.py      (esce con 1 se qualcosa non va; ffmpeg è facoltativo)
"""
import importlib.util
import json
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
VOCE = os.path.join(RADICE, "app", "public", "voce")
BANCO = os.path.join(RADICE, "doppiaggio", "banco.json")
MANIFEST = os.path.join(RADICE, "doppiaggio", "manifest.json")
TOLLERANZA_LU = 2.0     # quanto un blocco può stare lontano dal bersaglio (Opus perde un poco sui soffi)
PICCO_VERO_MAX = -0.2   # dBTP
PESO_MAX_MB = 25.0
TOLLERANZA_MS = 25
PARTI_NODE = os.path.join(RADICE, "app", "scripts", "parti-node.mjs")
# Ciò che il motore dice da sé (non sta nei .fav): non ha voce, lo legge il lettore di schermo.
DEL_MOTORE = ("La partita è finita.",)
# I numeri delle scorte dentro le battute («Hai 6 d'acqua e 2 di cibo.»): li compone la fase 3 del piano 08.
NUMERI_FASE_3 = re.compile(r"\b\d+ (d'acqua|di cibo)\b")


def testi_dei_percorsi():
    """Ogni testo che il motore stampa lungo i dodici percorsi e le tre morti di finali.py, e ogni
    risposta di dialogo offerta lungo la strada."""
    sys.path.insert(0, QUI)
    import finali
    from partita import Partita
    stampati, scelte = [], []
    originale = Partita.esegui

    def esegui(self, cmd):
        out = originale(self, cmd)
        stampati.append(out)
        scelte.extend(self.opzioni_dialogo())
        return out

    Partita.esegui = esegui
    try:
        stampati.append(Partita(seme=1).trascrizione())
        for nome in finali.percorsi.PERCORSI:
            finali.pilota(finali.percorsi.comandi(nome))
        for cfg in finali.MORTI.values():
            finali.pilota(**cfg)
    finally:
        Partita.esegui = originale
    return stampati, scelte


def strumento_doppiaggio():
    spec = importlib.util.spec_from_file_location("doppiaggio_strumento",
                                                  os.path.join(RADICE, "strumenti", "doppiaggio.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def durata_ogg_opus(percorso):
    """Millisecondi di un Ogg Opus (ultima granule position meno il pre-skip), o un errore."""
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


def loudness(percorsi):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as t:
        for p in percorsi:
            t.write("file '%s'\n" % p.replace("\\", "/"))
    try:
        e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-f", "concat", "-safe", "0", "-i", t.name,
                            "-af", "ebur128=peak=true:framelog=quiet", "-f", "null", "-"],
                           capture_output=True).stderr.decode("utf-8", "replace")
    finally:
        os.unlink(t.name)
    i = re.findall(r"I:\s+(-?[\d.]+) LUFS", e)
    p = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", e)
    return (float(i[-1]), float(p[-1])) if i and p else (None, None)


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    esiti = []

    def esito(ok, testo, dettagli=()):
        esiti.append(ok)
        print(("OK " if ok else "KO ") + testo)
        for d in list(dettagli)[:12]:
            print("     " + d)
        if len(dettagli) > 12:
            print("     … e altre %d" % (len(dettagli) - 12))

    with open(os.path.join(VOCE, "indice.json"), encoding="utf-8") as f:
        indice = json.load(f)
    parti = indice["parti"]
    est = indice["estensione"]
    muti = {i: motivo for motivo, ids in indice.get("muti", {}).items() for i in ids}

    # 1-2. le parti che il gioco di oggi dice, contro l'indice
    S = strumento_doppiaggio()
    unita = S.costruisci_tutto()["unita"]
    serve = set(unita)
    mancano = sorted(serve - set(parti) - set(muti))
    esito(not mancano, "ogni parte che il gioco dice ha la sua voce o è dichiarata muta (%d parti, %d mute)" % (
        len(serve), len(muti)),
        ["%s %s: «%s»" % (i, unita[i]["voce"], unita[i]["testo"][:70]) for i in mancano])
    scadute = sorted((set(parti) | set(muti)) - serve)
    esito(not scadute, "nessun audio scaduto (parti che il gioco non dice più)", scadute)
    doppie = sorted(set(parti) & set(muti))
    esito(not doppie, "nessuna parte è insieme suonata e muta", doppie)

    # 3. i file
    presenti = {f[:-len(est)] for f in os.listdir(VOCE) if f.endswith(est)}
    altri = sorted(f for f in os.listdir(VOCE)
                   if os.path.isfile(os.path.join(VOCE, f)) and not f.endswith(est) and f != "indice.json")
    esito(set(parti) <= presenti and not (presenti - set(parti)) and not altri,
          "la cartella della voce è l'indice: %d file" % len(presenti),
          ["manca %s%s" % (i, est) for i in sorted(set(parti) - presenti)] +
          ["di troppo %s%s" % (i, est) for i in sorted(presenti - set(parti))] + ["di troppo %s" % f for f in altri])
    storti = []
    for i, ms in sorted(parti.items()):
        if i not in presenti:
            continue
        d, errore = durata_ogg_opus(os.path.join(VOCE, i + est))
        if errore:
            storti.append("%s: %s" % (i, errore))
        elif abs(d - ms) > TOLLERANZA_MS:
            storti.append("%s: dura %d ms, l'indice dice %d" % (i, d, ms))
    esito(not storti, "ogni file è un Ogg Opus e dura quanto dice l'indice (±%d ms)" % TOLLERANZA_MS, storti)

    # 4. durate sensate per il testo
    strane = []
    for i, ms in sorted(parti.items()):
        if i not in unita:
            continue
        n, s = unita[i]["parole"], ms / 1000
        if s < 0.25 or s > 40 or not (0.3 <= n / s <= 7.0) or (n >= 5 and not (1.0 <= n / s <= 6.5)):
            strane.append("%s: %d parole in %.2f s «%s»" % (i, n, s, unita[i]["testo"][:60]))
    esito(not strane, "le durate tornano col testo (fra 0,3 e 7 parole al secondo)", strane)

    # 5. il volume
    with open(BANCO, encoding="utf-8") as f:
        banco = json.load(f)
    bersaglio = banco["parametri"]["bersaglio_lufs"]
    fuori = ["%s: %.1f LUFS, picco vero %.1f dBTP" % (b, r["lufs_dopo"], r["picco_vero_dbtp"])
             for b, r in banco["blocchi"].items()
             if abs(r["lufs_dopo"] - bersaglio) > TOLLERANZA_LU or r["picco_vero_dbtp"] > PICCO_VERO_MAX]
    esito(not fuori, "il resoconto del banco: ogni blocco a %.0f ±%.0f LUFS, picchi sotto %.1f dBTP" % (
        bersaglio, TOLLERANZA_LU, PICCO_VERO_MAX), fuori)
    if shutil.which("ffmpeg"):
        with open(MANIFEST, encoding="utf-8") as f:
            blocchi = json.load(f)["blocchi"]
        fuori = []
        for b, v in blocchi.items():
            file = [os.path.join(VOCE, i + est) for i in v["parti"] if i in parti]
            if not file:
                continue
            lufs, picco = loudness(file)
            if lufs is None or abs(lufs - bersaglio) > TOLLERANZA_LU or picco > PICCO_VERO_MAX:
                fuori.append("%s: %s LUFS, picco vero %s dBTP" % (b, lufs, picco))
        esito(not fuori, "rimisurati sui file veri: ogni blocco a %.0f ±%.0f LUFS, picchi sotto %.1f dBTP" % (
            bersaglio, TOLLERANZA_LU, PICCO_VERO_MAX), fuori)
    else:
        print("-- senza ffmpeg: il volume non si rimisura sui file (resta il controllo del resoconto)")

    # 6. il peso
    mb = sum(os.path.getsize(os.path.join(VOCE, i + est)) for i in presenti) / 1048576
    esito(mb <= PESO_MAX_MB, "la voce pesa %.1f MB nel pacchetto (tetto %.0f)" % (mb, PESO_MAX_MB))
    for motivo, ids in indice.get("muti", {}).items():
        print("-- %d parti mute: %s" % (len(ids), motivo))

    # 7. dal testo stampato alle parti, con la logica vera dell'app (parti.ts, in Node)
    testi_indice = indice.get("testi", {})
    esito(set(testi_indice) == set(parti) | set(muti),
          "l'indice ha il testo di ogni parte (l'app ritrova le parti dal testo)",
          sorted(set(testi_indice) ^ (set(parti) | set(muti))))
    stampati, scelte = testi_dei_percorsi()
    # in più, ogni testo dei .fav come lo stamperebbe il motore (anche quelli che i percorsi non toccano);
    # quelli con i segnaposto ([acqua], [i fili del viaggio]) li compone la fase 3
    statici, scelte_fav = [], []
    for x in S.costruisci_tutto()["stringhe"]:
        t = x["origine"].replace("\\n", "\n")   # nei .fav l'a capo è scritto «\n»
        if "[" in t:
            continue
        if x["tipo"] == "opzione":
            scelte_fav.append(t)
        elif x["tipo"] == "dialogo":
            statici.append("\n".join("%s: %s" % (x["parlante"], r) for r in t.split("\n")))
        else:
            statici.append(t)
    n_percorsi, n_scelte = len(stampati), len(scelte)
    stampati += statici
    scelte += scelte_fav
    risposta = subprocess.run(["node", PARTI_NODE], input=json.dumps({"testi": stampati, "scelte": scelte}),
                              capture_output=True, text=True, encoding="utf-8")
    if risposta.returncode:
        esito(False, "parti.ts gira in Node (serve `npm ci --prefix app`)", [risposta.stderr[-500:]])
    else:
        r = json.loads(risposta.stdout)
        righe = [x for t in r["testi"] for x in t if x["blocco"]["tipo"] not in ("sistema", "stanza", "comando")]
        righe_percorsi = [x for t in r["testi"][:n_percorsi] for x in t if x["blocco"]["tipo"] not in ("sistema", "stanza", "comando")]
        senza, da_fare = [], 0
        for x in righe:
            for m in x["mancano"]:
                if any(m["testo"].startswith(p) for p in DEL_MOTORE):
                    continue
                if NUMERI_FASE_3.search(m["testo"]):
                    da_fare += 1
                    continue
                senza.append("%s «%s» (nella riga «%s»)" % (m["voce"], m["testo"][:70], x["blocco"].get("testo", "")[:50]))
        esito(not senza, "lungo i percorsi %d righe stampate dal motore, più %d testi dei .fav: ogni pezzo ha la sua parte" % (
            len(righe_percorsi), len(statici)),
              sorted(set(senza)))
        if da_fare:
            print("-- %d pezzi con i numeri delle scorte: si compongono nella fase 3" % da_fare)
        viste = {i for x in righe_percorsi for i in x["ids"]} | {i for x in r["scelte"][:n_scelte] for i in x["ids"]}
        tutte = {i for x in righe for i in x["ids"]} | {i for x in r["scelte"] for i in x["ids"]}
        print("-- parti ritrovate: %d lungo i percorsi, %d con i testi dei .fav, su %d (le altre: numeri, fili, trailer)" % (
            len(viste), len(tutte), len(serve)))
        scelte_senza = sorted({o for o, x in zip(scelte, r["scelte"]) if x["mancano"]})
        esito(not scelte_senza, "ogni risposta di dialogo (%d incontrate, %d nei .fav) ha la voce del narratore" % (
            len(set(scelte[:n_scelte])), len(scelte_fav)),
              scelte_senza)

    tutto_ok = all(esiti)
    print("TUTTO OK" if tutto_ok else "CI SONO FALLIMENTI")
    return 0 if tutto_ok else 1


if __name__ == "__main__":
    sys.exit(main())
