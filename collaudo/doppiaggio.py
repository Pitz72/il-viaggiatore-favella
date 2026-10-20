"""Il banco della voce è completo, fresco e sano.

Il gioco suona un file Opus per parte (app/public/voce/<id>.opus, scritto da
strumenti/doppiaggio-banco.py); l'id è l'impronta di voce + testo. Questo collaudo
ricava dai .fav di OGGI le parti che devono avere una voce (lo stesso spezzamento di
strumenti/doppiaggio.py, trailer compreso) e controlla:

  1. ogni parte ha il suo audio, nella cartella principale o in una di quelle che l'indice
     nomina («cartelle»: elevenlabs/, le voci fuori dalla licenza libera, con la loro licenza);
     un testo cambiato nel gioco ha un id nuovo, e qui risulta senza audio;
  2. l'indice non ha parti che il gioco non dice più (audio scaduto);
  3. ogni file c'è, è un Ogg Opus vero, dura quanto dice l'indice, e nelle cartelle
     non c'è niente di più;
  4. le durate sono sensate per il testo (né una parola di trenta secondi né una
     descrizione di mezzo secondo: un file scambiato si vede qui);
  5. il volume: ogni blocco sta attorno al bersaglio e nessun picco tocca lo 0 dBFS
     (dal resoconto doppiaggio/banco.json; con ffmpeg, rimisurato sui file veri);
  6. il peso della voce nel pacchetto;
  7. con la logica vera dell'app (app/src/gioco/parti.ts, in Node): lungo i dodici percorsi e le
     tre morti di finali.py, ogni riga che il motore stampa trova le sue parti, pezzo per pezzo; così
     ogni testo dei .fav stampato come lo stampa il motore (i numeri delle scorte con ogni valore
     registrato, i fili del viaggio uno per uno e tutti insieme) e ogni risposta di dialogo; e ogni
     parte del gioco (non del trailer) si ritrova da almeno un testo (serve `npm ci --prefix app`).
  8. la voce del trailer (app/public/voce/trailer.opus e trailer.json, strumenti/doppiaggio-trailer.py):
     le frasi non si sovrappongono, cominciano vicino al loro testo, «tuo FRATELLO.» e il titolo sono
     agganciati al colpo grave e al titolo, ogni frase è detta o dichiarata solo scritta, nessuna è
     scaduta, e la traccia dura quanto il trailer.

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
    est = indice["estensione"]
    # ogni parte e la sua cartella: la principale e quelle che l'indice nomina, ognuna col suo indice
    cartelle = {"": indice}
    for c in indice.get("cartelle", []):
        with open(os.path.join(VOCE, c, "indice.json"), encoding="utf-8") as f:
            cartelle[c] = json.load(f)
    parti, cartella_di = {}, {}
    for c, ix in cartelle.items():
        for i, ms in ix["parti"].items():
            parti[i] = ms
            cartella_di[i] = c
    file_di = lambda i: os.path.join(VOCE, cartella_di[i], i + est)
    senza_licenza = [c for c, ix in cartelle.items() if c and not ix.get("licenza")]
    esito(not senza_licenza, "ogni cartella a parte dice la sua licenza (%s)" % ", ".join(c for c in cartelle if c), senza_licenza)

    # 1-2. le parti che il gioco di oggi dice, contro l'indice
    S = strumento_doppiaggio()
    unita = S.costruisci_tutto()["unita"]
    serve = set(unita)
    mancano = sorted(serve - set(parti))
    esito(not mancano, "ogni parte che il gioco dice ha la sua voce (%d parti, %s)" % (
        len(serve), ", ".join("%d in %s" % (sum(1 for i in parti if cartella_di[i] == c), c or "voce/") for c in cartelle)),
        ["%s %s: «%s»" % (i, unita[i]["voce"], unita[i]["testo"][:70]) for i in mancano])
    scadute = sorted(set(parti) - serve)
    esito(not scadute, "nessun audio scaduto (parti che il gioco non dice più)", scadute)
    doppie = sorted(i for c, ix in cartelle.items() if c for i in ix["parti"] if i in indice["parti"])
    esito(not doppie, "nessuna parte sta in due cartelle", doppie)

    # 3. i file
    storti, presenti = [], set()
    for c in cartelle:
        dentro = {f[:-len(est)] for f in os.listdir(os.path.join(VOCE, c)) if f.endswith(est)} - {"trailer"}
        attesi = {i for i in parti if cartella_di[i] == c}
        altri = sorted(f for f in os.listdir(os.path.join(VOCE, c)) if os.path.isfile(os.path.join(VOCE, c, f))
                       and not f.endswith(est) and f not in ("indice.json", "trailer.json"))
        storti += ["manca %s%s%s" % (c and c + "/", i, est) for i in sorted(attesi - dentro)]
        storti += ["di troppo %s%s%s" % (c and c + "/", i, est) for i in sorted(dentro - attesi)]
        storti += ["di troppo %s%s" % (c and c + "/", f) for f in altri]
        presenti |= dentro & attesi
    esito(not storti, "le cartelle della voce sono i loro indici: %d file" % len(presenti), storti)
    storti = []
    for i, ms in sorted(parti.items()):
        if i not in presenti:
            continue
        d, errore = durata_ogg_opus(file_di(i))
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
            file = [file_di(i) for i in v["parti"] if i in parti]
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
    mb = sum(os.path.getsize(file_di(i)) for i in presenti) / 1048576
    esito(mb <= PESO_MAX_MB, "la voce pesa %.1f MB nel pacchetto (tetto %.0f)" % (mb, PESO_MAX_MB))
    for c, ix in cartelle.items():
        if c:
            print("-- %s/: %d parti. %s" % (c, len(ix["parti"]), ix["licenza"]))

    # 7. dal testo stampato alle parti, con la logica vera dell'app (parti.ts, in Node)
    testi_indice = indice.get("testi", {})
    esito(set(testi_indice) == set(parti),
          "l'indice ha il testo di ogni parte (l'app ritrova le parti dal testo)",
          sorted(set(testi_indice) ^ set(parti)))
    stampati, scelte = testi_dei_percorsi()
    # in più, ogni testo dei .fav come lo stamperebbe il motore (anche quelli che i percorsi non toccano):
    # i numeri delle scorte con ogni valore registrato, i fili del viaggio uno per uno e tutti insieme
    stringhe = S.costruisci_tutto()["stringhe"]
    fili = [re.findall(r"\[se [^\]]*\](.*?)\[fine\]", x["origine"], re.S) for x in stringhe if "[se " in x["origine"]]
    fili = [f for gruppo in fili for f in gruppo]
    tutti_i_fili = "".join(fili).strip()
    statici, scelte_fav, combinazioni = [], [], 0
    for x in stringhe:
        t = x["origine"].replace("\\n", "\n")   # nei .fav l'a capo è scritto «\n»
        if "[se " in t:
            statici += [f.strip() for f in fili] + [tutti_i_fili]
            continue
        varianti = [t.replace("[i fili del viaggio]", tutti_i_fili)]
        for nome, valori in S.VALORI.items():   # i valori che la voce di servizio ha registrato
            if "[%s]" % nome in t:
                varianti = [v.replace("[%s]" % nome, str(n)) for v in varianti for n in valori]
        combinazioni += len(varianti) - 1
        for v in varianti:
            if re.search(r"\[\w", v):
                continue   # la riga di STATO («Vita [vita]/10 …») resta muta: piano 08, decisione 2
            if x["tipo"] == "opzione":
                scelte_fav.append(v)
            elif x["tipo"] == "dialogo":
                statici.append("\n".join("%s: %s" % (x["parlante"], r) for r in v.split("\n")))
            else:
                statici.append(v)
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
        senza = []
        for x in righe:
            for m in x["mancano"]:
                if any(m["testo"].startswith(p) for p in DEL_MOTORE):
                    continue
                senza.append("%s «%s» (nella riga «%s»)" % (m["voce"], m["testo"][:70], x["blocco"].get("testo", "")[:50]))
        esito(not senza, "lungo i percorsi %d righe stampate dal motore, più %d testi dei .fav (%d combinazioni di numeri, "
              "%d fili): ogni pezzo ha la sua parte" % (len(righe_percorsi), len(statici), combinazioni, len(fili)),
              sorted(set(senza)))
        viste = {i for x in righe_percorsi for i in x["ids"]} | {i for x in r["scelte"][:n_scelte] for i in x["ids"]}
        tutte = {i for x in righe for i in x["ids"]} | {i for x in r["scelte"] for i in x["ids"]}
        del_gioco = {i for i in serve if unita[i].get("categoria") != "trailer"}
        esito(del_gioco <= tutte, "ogni parte del gioco si ritrova da un testo stampato (%d lungo i percorsi, %d in tutto; "
              "le %d del trailer suonano nella sua traccia)" % (len(viste), len(tutte & del_gioco), len(serve - del_gioco)),
              ["%s «%s»" % (i, unita[i]["testo"][:70]) for i in sorted(del_gioco - tutte)])
        scelte_senza = sorted({o for o, x in zip(scelte, r["scelte"]) if x["mancano"]})
        esito(not scelte_senza, "ogni risposta di dialogo (%d incontrate, %d nei .fav) ha la voce del narratore" % (
            len(set(scelte[:n_scelte])), len(scelte_fav)),
              scelte_senza)

    # 8. la voce del trailer: una traccia sola, sul tempo del trailer (strumenti/doppiaggio-trailer.py)
    with open(os.path.join(VOCE, "trailer.json"), encoding="utf-8") as f:
        tr = json.load(f)
    attese = {x["id"]: x for x in S.costruisci_tutto()["trailer"]}
    frasi = tr["frasi"]
    storte = []
    for x in frasi:
        p = attese.get(x["id"])
        if not p:
            storte.append("%s: non è una frase del trailer" % x["id"])
            continue
        if x["unita"] != p["unita"]:
            storte.append("%s: il testo è cambiato (rifare strumenti/doppiaggio-trailer.py)" % x["id"])
        if p.get("aggancia") and abs(x["da"] - p["aggancia"]) > 0.005:
            storte.append("%s: comincia a %.2f s, deve a %.2f" % (x["id"], x["da"], p["aggancia"]))
        if x["da"] < p["da"] - 0.3 or x["da"] > p["da"] + 5:
            storte.append("%s: comincia a %.2f s, il suo testo compare a %.2f" % (x["id"], x["da"], p["da"]))
    for x, y in zip(frasi, frasi[1:]):
        if x["a"] > y["da"]:
            storte.append("%s e %s si sovrappongono" % (x["id"], y["id"]))
    if set(attese) != {x["id"] for x in frasi} | set(tr["escluse"]):
        storte.append("frasi né dette né escluse: %s" % sorted(set(attese) - {x["id"] for x in frasi} - set(tr["escluse"])))
    d, errore = durata_ogg_opus(os.path.join(VOCE, "trailer.opus"))
    if errore or abs(d - 1000 * tr["durata"]) > 50:
        storte.append("trailer.opus: %s" % (errore or "dura %d ms invece di %d" % (d, 1000 * tr["durata"])))
    if frasi and frasi[-1]["a"] > tr["durata"]:
        storte.append("la voce va oltre la fine del trailer")
    esito(not storte, "la voce del trailer: %d frasi al loro posto (%s solo scritte), «tuo FRATELLO.» e il titolo agganciati, "
          "nessuna sovrapposizione" % (len(frasi), len(tr["escluse"])), storte)

    tutto_ok = all(esiti)
    print("TUTTO OK" if tutto_ok else "CI SONO FALLIMENTI")
    return 0 if tutto_ok else 1


if __name__ == "__main__":
    sys.exit(main())
