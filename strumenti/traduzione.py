"""La traduzione inglese del Viaggiatore: dai testi dei .fav ai cataloghi da tradurre.

Il motore e i .fav restano in italiano: il gioco li fa girare come sempre e traduce il testo
che il motore stampa, al momento di mostrarlo (app/src/gioco/traduci.ts). Per farlo gli serve
un CATALOGO: per ogni testo dei .fav che il giocatore legge, la sua versione inglese. Le stringhe
sono le stesse che dice la voce (strumenti/doppiaggio.py, stringhe_del_file: descrizioni, posti,
messaggi, battute, risposte, finali, testi con nome), più le parole di servizio dei .fav.

Scrive, in app/src/lingue/en/:

  <zona>.json   un elenco di voci {tipo, chi, dove, it, en}: «it» è il testo del .fav com'è
                scritto (segnaposto [acqua] e testi condizionali [se …] compresi), «en» la sua
                traduzione ("" finché manca). Rifare il catalogo tiene le traduzioni dei testi
                che non sono cambiati; quelle dei testi spariti si elencano e si tolgono.
  nomi.json     i nomi delle cose, dei luoghi e delle persone ({nome: name}, senza articolo):
                servono ai pulsanti, alla mappa, ai segnaposto e alle parole che si toccano.

Le regole della traduzione (per chi traduce): ciò che sta fra parentesi quadre non si tocca
([acqua], [se lo stato della foto è dritta], [altrimenti], [fine]); gli a capo (\\n) restano
lo stesso numero; le parole in MAIUSCOLO sono quelle che si toccano (cose, uscite, comandi
suggeriti) e in inglese restano in maiuscolo, col nome inglese della cosa (nomi.json); le
battute vanno fra virgolette inglesi “…”; i suggerimenti fra parentesi restano fra parentesi.

Uso:  python strumenti/traduzione.py            (rifà i cataloghi e dice che cosa manca)
      python strumenti/traduzione.py stato      (solo il conto)
      python strumenti/traduzione.py controlla [zona…]
                                                (le regole su ogni traduzione scritta: esce con 1 se una non va)
"""
import importlib.util
import json
import os
import re
import sys
from collections import OrderedDict

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARTELLA = os.path.join(RADICE, "app", "src", "lingue", "en")
NOMI = os.path.join(CARTELLA, "nomi.json")


def doppiaggio():
    spec = importlib.util.spec_from_file_location("doppiaggio_strumento", os.path.join(RADICE, "strumenti", "doppiaggio.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def leggi(percorso, vuoto):
    if not os.path.exists(percorso):
        return vuoto
    with open(percorso, encoding="utf-8") as f:
        return json.load(f)


def scrivi(percorso, dati):
    os.makedirs(os.path.dirname(percorso), exist_ok=True)
    with open(percorso, "w", encoding="utf-8") as f:
        json.dump(dati, f, ensure_ascii=False, indent=1)
        f.write("\n")


def voci_della_zona(D, nome_file):
    """Le voci del catalogo di un .fav, una per testo (il primo punto in cui compare)."""
    ok, _ = D.stringhe_del_file(nome_file)
    voci = OrderedDict()
    for riga, tipo, parlante, testo in ok:
        if testo in voci:
            continue
        v = OrderedDict([("tipo", tipo)])
        if parlante:
            v["chi"] = parlante
        v["dove"] = "%s:%d" % (nome_file, riga)
        v["it"] = testo
        v["en"] = ""
        voci[testo] = v
    return voci


def nomi_del_mondo():
    """Il nome visualizzato di ogni luogo, cosa e persona, senza articolo e in minuscolo (come lo confronta l'app)."""
    sys.path.insert(0, os.path.join(RADICE, "motore"))
    from compilatore import compila_mondo
    from favella_utils import nome_in_frase  # noqa: F401  (per controllare che il motore ci sia)
    mondo = compila_mondo(os.path.join(RADICE, "prototipo", "il-viaggiatore.fav"))
    nomi = []
    for s in mondo.stanze.values():
        nomi.append(s.nome_visualizzato)
    for o in mondo.oggetti.values():
        nomi.append(o.nome_visualizzato)
    return sorted({senza_articolo(n) for n in nomi if n})


ARTICOLI = ("il ", "lo ", "la ", "i ", "gli ", "le ", "l'", "l’", "un ", "uno ", "una ", "un'", "un’")


def senza_articolo(n):
    n = n.strip()
    basso = n.lower()
    for a in ARTICOLI:
        if basso.startswith(a):
            n = n[len(a):]
            break
    # i nomi propri restano com'erano; le cose in minuscolo, come le confronta l'app
    return n if n[:1].isupper() and not basso.startswith(ARTICOLI) else n.lower()


# ---------------------------------------------------------------------------------------
# Il controllo delle traduzioni scritte
# ---------------------------------------------------------------------------------------
QUADRE = re.compile(r"\[[^\[\]]*\]")
CONDIZIONALI = re.compile(r"^\[(se\b.*|altrimenti|fine)\]$")
MAIUSCOLE = re.compile(r"\b[A-Z][A-Z'’]{2,}(?:\s+[A-Z]{2,})*\b")
DIREZIONI = {"NORTH", "SOUTH", "EAST", "WEST", "UP", "DOWN"}
VERBI = {"EXAMINE", "LOOK", "TAKE", "DROP", "TALK", "TALK TO", "USE", "ON", "GIVE", "DRINK", "EAT", "WAIT", "STATUS",
         "INVENTORY", "ATTACK", "THREATEN", "SHOOT", "DRAW", "DRAW WATER", "TREAT", "TREAT YOURSELF", "YOURSELF",
         "THROW", "THROW FOOD", "FOOD", "STRAIGHTEN", "DRINK BRACKISH", "BRACKISH", "WATER", "THE", "TO", "AT", "WITH",
         "FINALE"}   # «FINALE —»: il segno del finale, che il diario toglie


def problemi(voce, parole_note):
    """Che cosa non va in una traduzione: errori (che rompono il gioco) e avvisi (da guardare)."""
    it, en = voce["it"], voce.get("en", "")
    errori, avvisi = [], []
    if not en:
        return errori, avvisi
    qi, qe = QUADRE.findall(it), QUADRE.findall(en)
    ci, ce = [q for q in qi if CONDIZIONALI.match(q)], [q for q in qe if CONDIZIONALI.match(q)]
    if ci != ce:
        errori.append("i testi condizionali non sono gli stessi, nello stesso ordine: %s / %s" % (ci, ce))
    pi, pe = sorted(q for q in qi if not CONDIZIONALI.match(q)), sorted(q for q in qe if not CONDIZIONALI.match(q))
    if pi != pe:
        errori.append("i segnaposto non sono gli stessi: %s / %s" % (pi, pe))
    if it.count("\\n") != en.count("\\n") or it.count("\n") != en.count("\n"):
        errori.append("gli a capo non sono quanti nell'italiano")
    if "«" in en or "»" in en:
        errori.append("caporali nella traduzione: le battute vanno fra “ ”")
    if en.count("(") != en.count(")"):
        errori.append("parentesi tonde spaiate")
    if len(re.findall(r"\([^()]*[A-ZÀ-Ý]{3,}[^()]*\)", it)) != len(re.findall(r"\([^()]*[A-Z]{3,}[^()]*\)", en)):
        avvisi.append("i suggerimenti fra parentesi non sono quanti nell'italiano")
    fuori = QUADRE.sub(" ", re.sub(r"\([^()]*\)", " ", en))   # le parole che si toccano stanno fuori dai suggerimenti
    for m in MAIUSCOLE.finditer(fuori):
        w = m.group(0)
        if w not in parole_note and not all(p in parole_note for p in w.split()):
            avvisi.append("«%s» in maiuscolo non è il nome di una cosa, di un'uscita o di una persona" % w)
    return errori, avvisi


def controlla(zone):
    D = doppiaggio()
    nomi = leggi(NOMI, {})
    note = DIREZIONI | VERBI | {v.upper() for v in nomi.values() if v} | {k.upper() for k in nomi if k[:1].isupper()}
    note |= {p for v in nomi.values() for p in v.upper().split()}
    n_err = n_avv = 0
    for zona in zone or list(D.ZONE):
        for voce in leggi(os.path.join(CARTELLA, "%s.json" % zona), []):
            errori, avvisi = problemi(voce, note)
            for e in errori:
                print("ERRORE %s %s: %s\n   %s" % (zona, voce["dove"], e, voce["it"][:90]))
            for a in avvisi:
                print("avviso %s %s: %s" % (zona, voce["dove"], a))
            n_err, n_avv = n_err + len(errori), n_avv + len(avvisi)
    print("%d errori, %d avvisi" % (n_err, n_avv))
    return n_err == 0


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "controlla":
        sys.exit(0 if controlla(sys.argv[2:]) else 1)
    solo_stato = len(sys.argv) > 1 and sys.argv[1] == "stato"
    D = doppiaggio()
    totale, tradotte, sparite = 0, 0, []
    for zona, nome_file in D.ZONE.items():
        percorso = os.path.join(CARTELLA, "%s.json" % zona)
        vecchie = {v["it"]: v for v in leggi(percorso, [])}
        voci = voci_della_zona(D, nome_file)
        for testo, v in voci.items():
            if testo in vecchie and vecchie[testo].get("en"):
                v["en"] = vecchie[testo]["en"]
        sparite += ["%s: %s" % (zona, t[:70]) for t, v in vecchie.items() if t not in voci and v.get("en")]
        n, fatte = len(voci), sum(1 for v in voci.values() if v["en"])
        totale, tradotte = totale + n, tradotte + fatte
        print("%-8s %4d testi, %4d tradotti" % (zona, n, fatte))
        if not solo_stato:
            scrivi(percorso, list(voci.values()))
    vecchi_nomi = leggi(NOMI, {})
    nomi = OrderedDict((n, vecchi_nomi.get(n, "")) for n in nomi_del_mondo())
    print("%-8s %4d nomi,  %4d tradotti" % ("nomi", len(nomi), sum(1 for x in nomi.values() if x)))
    if not solo_stato:
        scrivi(NOMI, nomi)
    print("in tutto %d testi, %d tradotti, %d da tradurre" % (totale, tradotte, totale - tradotte))
    if sparite:
        print("\ntraduzioni di testi che nei .fav non ci sono più (tolte):")
        for s in sparite:
            print("  " + s)


if __name__ == "__main__":
    main()
