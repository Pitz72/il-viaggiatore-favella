"""La traduzione inglese è completa e regge il testo vero del motore.

Il gioco in inglese fa girare il motore in italiano e traduce ciò che stampa, al momento di
mostrarlo (app/src/gioco/traduci.ts), coi cataloghi di app/src/lingue/en/ (strumenti/traduzione.py).
Questo collaudo controlla:

  1. i cataloghi sono quelli dei .fav di oggi: ogni testo che il giocatore legge ha la sua voce,
     nessuna voce è di troppo, e ognuna ha la traduzione;
  2. ogni traduzione rispetta le regole (segnaposto e testi condizionali intatti, gli stessi a capo,
     niente caporali, parentesi a posto): strumenti/traduzione.py controlla, senza errori;
  3. ogni luogo, cosa e persona del mondo ha il suo nome inglese;
  4. con la logica vera dell'app (traduci.ts in Node): lungo i dodici percorsi e le tre morti di
     finali.py ogni riga che il motore stampa si traduce intera (prosa, battute, sensazioni, finali,
     risposte del motore, titoli dei luoghi), e così ogni risposta di dialogo offerta; e ogni testo
     dei .fav stampato come lo stampa il motore (i numeri delle scorte con dei valori veri, le
     battute riga per riga);
  5. le righe a lato dello schermo (testo.ts, GESTI e VOCI) hanno la loro traduzione (traduci.ts);
  6. come gioca chi sceglie l'inglese, coi soli pulsanti: il giocatore a caso di pulsanti.py (--esplora), da ogni zona,
     e ogni riga che il motore gli stampa (anche le risposte del motore che i percorsi non toccano) si traduce.

Uso:  python traduzione.py      (esce con 1 se qualcosa non va; serve `npm ci --prefix app`)
"""
import importlib.util
import json
import os
import re
import subprocess
import sys

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
TRADUCI_NODE = os.path.join(RADICE, "app", "scripts", "traduci-node.mjs")
sys.path.insert(0, QUI)

falliti = 0


def esito(ok, nome, dettagli=()):
    global falliti
    print(("ok   " if ok else "NO   ") + nome)
    if not ok:
        falliti += 1
        for d in list(dettagli)[:25]:
            print("       " + d)
        if len(dettagli) > 25:
            print("       … e altri %d" % (len(dettagli) - 25))


def strumento():
    spec = importlib.util.spec_from_file_location("traduzione_strumento", os.path.join(RADICE, "strumenti", "traduzione.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def testi_a_pulsanti(n=3, t=160, seme=3):
    """Ciò che il motore stampa a chi gioca coi soli pulsanti (il giocatore a caso di pulsanti.py), e le risposte offerte."""
    import contextlib
    import io
    import pulsanti
    stampati, scelte = [], []
    originale = pulsanti.nuovo_ponte

    def ponte_che_annota():
        p = originale()
        passo, stato = p.fav_step, p.fav_stato

        def fav_step(cmd):
            out = passo(cmd)
            stampati.append(json.loads(out).get("text", ""))
            return out

        def fav_stato():
            out = stato()
            d = json.loads(out).get("dialog")
            if d:
                scelte.extend(d.get("opzioni", []))
            return out
        p.fav_step, p.fav_stato = fav_step, fav_stato
        return p

    pulsanti.nuovo_ponte = ponte_che_annota
    ui = pulsanti.Interfaccia()
    try:
        with contextlib.redirect_stdout(io.StringIO()):
            pulsanti.esplora(ui, n, t, seme)
    finally:
        ui.chiudi()
        pulsanti.nuovo_ponte = originale
    return stampati, scelte


def main():
    T = strumento()
    D = T.doppiaggio()

    # 1. i cataloghi e i .fav
    mancano, di_troppo, senza = [], [], []
    for zona, nome_file in D.ZONE.items():
        voci = T.voci_della_zona(D, nome_file)
        catalogo = {v["it"]: v for v in T.leggi(os.path.join(T.CARTELLA, "%s.json" % zona), [])}
        mancano += ["%s: %s" % (zona, t[:70]) for t in voci if t not in catalogo]
        di_troppo += ["%s: %s" % (zona, t[:70]) for t in catalogo if t not in voci]
        senza += ["%s %s: %s" % (zona, v["dove"], v["it"][:60]) for v in catalogo.values() if not v.get("en")]
    esito(not mancano and not di_troppo, "i cataloghi hanno i testi dei .fav di oggi, né uno di più né uno di meno "
          "(si rifanno con strumenti/traduzione.py)", mancano + ["di troppo: " + x for x in di_troppo])
    esito(not senza, "ogni testo dei .fav ha la sua traduzione", senza)

    # 2. le regole
    nomi = T.leggi(T.NOMI, {})
    note = T.DIREZIONI | T.VERBI | {v.upper() for v in nomi.values() if v} | {k.upper() for k in nomi if k[:1].isupper()}
    note |= {p for v in nomi.values() for p in v.upper().split()}
    errori = []
    for zona in D.ZONE:
        for v in T.leggi(os.path.join(T.CARTELLA, "%s.json" % zona), []):
            e, _ = T.problemi(v, note)
            errori += ["%s %s: %s" % (zona, v["dove"], x) for x in e]
    esito(not errori, "ogni traduzione rispetta le regole: segnaposto e condizioni intatti, gli stessi a capo, niente caporali", errori)

    # 3. i nomi
    del_mondo = T.nomi_del_mondo()
    esito(all(nomi.get(n) for n in del_mondo), "ogni luogo, cosa e persona (%d) ha il suo nome inglese" % len(del_mondo),
          [n for n in del_mondo if not nomi.get(n)])

    # 4. il testo vero del motore, con la logica vera dell'app
    import doppiaggio as collaudo_voce
    stampati, scelte = collaudo_voce.testi_dei_percorsi()
    n_percorsi = len(stampati)
    statici, scelte_fav = [], []
    for zona, nome_file in D.ZONE.items():
        ok, _ = D.stringhe_del_file(nome_file)
        for _, tipo, parlante, testo in ok:
            if "[se " in testo or "[i fili del viaggio]" in testo:
                continue   # i fili e i testi condizionali si provano lungo i percorsi, come li compone il motore
            v = testo
            for nome, valore in (("acqua", 7), ("cibo", 3), ("vita", 9), ("sete", 2), ("fame", 4)):
                v = v.replace("[%s]" % nome, str(valore))
            if re.search(r"\[\w", v):
                continue
            v = v.replace("\\n", "\n")
            if tipo == "opzione":
                scelte_fav.append(v)
            elif tipo == "dialogo":
                statici.append("\n".join("%s: %s" % (parlante, r) for r in v.split("\n")))
            else:
                statici.append(v)
    risposta = subprocess.run(["node", TRADUCI_NODE], input=json.dumps({"testi": stampati + statici, "scelte": scelte + scelte_fav}),
                              capture_output=True, text=True, encoding="utf-8")
    if risposta.returncode:
        esito(False, "traduci.ts gira in Node (serve `npm ci --prefix app`)", [risposta.stderr[-800:]])
        return
    r = json.loads(risposta.stdout)
    non_tradotte = sorted({"%s «%s»" % (x["blocco"]["tipo"], (x["blocco"].get("testo") or x["blocco"].get("titolo", ""))[:110])
                           for t in r["testi"] for x in t if x["en"] is None})
    righe = sum(len(t) for t in r["testi"][:n_percorsi])
    esito(not non_tradotte, "lungo i percorsi %d righe stampate dal motore, più %d testi dei .fav: ognuna si traduce intera"
          % (righe, len(statici)), non_tradotte)
    scelte_senza = sorted({x["it"] for x in r["scelte"] if x["en"] is None})
    esito(not scelte_senza, "ogni risposta di dialogo (%d incontrate, %d nei .fav) ha la sua traduzione"
          % (len(set(scelte)), len(scelte_fav)), scelte_senza)
    lato = r["lato"]
    esito(lato["gesti"][0] == lato["gesti"][1] and lato["voci"][0] == lato["voci"][1],
          "le righe a lato (che cosa hai fatto a chi, che cosa si dice di te) hanno ognuna la sua traduzione",
          ["gesti: %s / %s" % tuple(lato["gesti"]), "voci: %s / %s" % tuple(lato["voci"])])
    # 6. coi soli pulsanti, come chi gioca in inglese
    a_pulsanti, scelte_p = testi_a_pulsanti()
    risposta = subprocess.run(["node", TRADUCI_NODE], input=json.dumps({"testi": a_pulsanti, "scelte": scelte_p}),
                              capture_output=True, text=True, encoding="utf-8")
    rp = json.loads(risposta.stdout)
    senza_p = sorted({"%s «%s»" % (x["blocco"]["tipo"], (x["blocco"].get("testo") or x["blocco"].get("titolo", ""))[:110])
                      for t in rp["testi"] for x in t if x["en"] is None}
                     | {"risposta «%s»" % x["it"] for x in rp["scelte"] if x["en"] is None})
    esito(not senza_p, "coi soli pulsanti, un giocatore a caso da ogni zona (%d righe, %d risposte): ognuna si traduce"
          % (sum(len(t) for t in rp["testi"]), len(set(scelte_p))), senza_p)
    rimaste = sorted({"%s «%s»" % (x["blocco"]["tipo"], x["mostrato"]["testo"][:90]) for t in r["testi"] for x in t
                      if x["en"] and x["blocco"]["tipo"] != "comando" and "«" in x["mostrato"].get("testo", "")})
    esito(not rimaste, "nessuna riga tradotta mostra ancora caporali italiani", rimaste)


if __name__ == "__main__":
    main()
    print("\n%s" % ("tutto a posto" if not falliti else "%d controlli falliti" % falliti))
    sys.exit(1 if falliti else 0)
