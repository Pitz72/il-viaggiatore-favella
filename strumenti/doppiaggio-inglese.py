"""Il doppiaggio inglese: dai cataloghi inglesi ai blocchi del narratore (Gemini 3.8 Flash TTS).

Stesso metodo dell'italiano (strumenti/doppiaggio.py), con una differenza che conta: in inglese le
virgolette “così” servono sia alle battute dei personaggi sia al biglietto e alle targhe che legge il
narratore, quindi la punteggiatura da sola non dice chi parla. Chi parla lo dice l'ITALIANO:

  1. per ogni testo del gioco (le 544 occorrenze dei .fav) si prende la traduzione dal catalogo
     (app/src/lingue/en/), cercata per il testo italiano;
  2. le virgolette inglesi diventano caporali e il testo passa per la STESSA funzione dell'italiano
     (`parti_di_una_stringa`), con le stesse attribuzioni di doppiaggio/attribuzioni.json;
  3. la sequenza delle voci (narratore, servizio, personaggio) delle parti inglesi deve essere
     identica a quella delle parti italiane, testo per testo: se non lo è, nessun blocco si scrive.

Scrive in doppiaggio/en/:
  blocchi/narratore-a … -f.txt   la narrazione (descrizioni, posti, messaggi, finali), una parte per
                                 riga, `<long pause>` fra l'una e l'altra, da incollare in AI Studio
  blocchi/scelte.txt             le scelte di dialogo del giocatore (in prima persona), le legge Enzo
  blocchi/trailer.txt            il trailer, a gruppi di tono (legge doppiaggio/en/trailer.json, scritto a mano
                                 dai testi inglesi sullo schermo; stessi id, toni e finestre dell'italiano)
  blocchi/kira-suggerimenti.txt  la voce di servizio (Kira): i suggerimenti tra parentesi
  blocchi/kira-numeri-a.txt,     … e i pezzi con i numeri delle scorte («You have # water,»), a famiglie, in due
         kira-numeri-b.txt       blocchi (i pezzi che differiscono solo per la punteggiatura finale non stanno insieme)
  blocchi/imma.txt, rosaria.txt, tore.txt, vito.txt
                                 i personaggi fatti con ElevenLabs in italiano (Eleven v4), in inglese: una battuta per
                                 paragrafo, con in testa l'accento e il tono come tag fra parentesi quadre
  manifest.json                 per ogni parte: id, testo inglese, testo italiano, da dove viene;
                                 per ogni testo del gioco, la voce di ogni suo pezzo; a parte (chiavi «servizio» e
                                 «personaggi») le parti di Kira e dei personaggi con blocchi e corrispondenze
                                 italiano → inglese
  controllo.md                   i conti, le verifiche, ciò che NON è di Enzo, e la tabella
                                 italiano ↔ inglese di ogni parte di Enzo (poi quelle di Kira e dei personaggi)
  prove/accento-*.txt            le prove di accento per Eleven v4 (stesse sei battute di Vito, un accento diverso)

Il testo per la voce è derivato e non cambia il gioco: le parole in MAIUSCOLO (NORTH, EXAMINE…) si
abbassano, i nomi dei personaggi tornano con l'iniziale maiuscola, gli a capo diventano spazi.

Uso:  python strumenti/doppiaggio-inglese.py stato      (conti e verifiche, non scrive)
      python strumenti/doppiaggio-inglese.py blocchi    (verifica e scrive doppiaggio/en/)
      python strumenti/doppiaggio-inglese.py blocchi --max-minuti 9.5
      python strumenti/doppiaggio-inglese.py blocchi --accento "strong Italian accent"   (o «nessuno»)
      python strumenti/doppiaggio-inglese.py prove      (scrive solo le prove di accento, doppiaggio/en/prove/accento-*.txt)
      python strumenti/doppiaggio-inglese.py personaggio --voce Concetta --accento "strong Italian accent"
                                                       (un esperimento: il blocco inglese di un personaggio non ancora fra i
                                                        PERSONAGGI, in doppiaggio/en/prove/<nome>.txt; non tocca il manifest)
"""
import argparse
import glob
import importlib.util
import json
import os
import re
import sys
from collections import OrderedDict, defaultdict

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_spec = importlib.util.spec_from_file_location("doppiaggio_it", os.path.join(RADICE, "strumenti", "doppiaggio.py"))
D = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(D)

CATALOGHI = os.path.join(RADICE, "app", "src", "lingue", "en")
USCITA = os.path.join(D.CARTELLA, "en")
VIRGOLETTE = re.compile("\u201c([^\u201d]*)\u201d")
MAX_MINUTI = 10.0   # scelto da Simone il 31/10/2026: sei blocchi sotto i 10 minuti (il tetto del servizio è circa 10,9)
VOCE = "narratore"
SERVIZIO = "servizio"   # la voce di servizio, Kira: i suggerimenti tra parentesi e i pezzi con i numeri
# I personaggi che in italiano sono stati fatti con ElevenLabs (Eleven v4): i primi a passare in inglese (Simone, 1/11/2026;
# sono voci italiane, e in inglese possono avere un accento italiano). Gli altri dieci non sono decisi.
PERSONAGGI = ("Imma", "Rosaria", "Tore", "Vito")
# L'accento che si chiede a Eleven v4: un tag davanti a ogni battuta, prima del tono. Dalla prova di accento (vedi prove/);
# None = nessun tag (la voce parla l'inglese «nativo», che è ciò che v4 fa da solo). Si cambia con --accento.
ACCENTO = "Italian accent"
# Le battute di Vito della prova di accento (posizioni nel suo blocco): stanco, minaccioso, affabile ×2, asciutto, spaventato
PROVA_VITO = (0, 6, 7, 12, 15, 17)
PROVE_ACCENTO = (("A", "nessuno", None), ("B", "light", "light Italian accent"),
                 ("C", "italian", "Italian accent"), ("D", "strong", "strong Italian accent"))
NUMERI_EN = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
             "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"]


# ---------------------------------------------------------------------------------------
# 1. I cataloghi e lo spezzamento
# ---------------------------------------------------------------------------------------

def carica_cataloghi():
    """{testo italiano: traduzione} da app/src/lingue/en/ (tranne nomi.json) e i conflitti."""
    catalogo, conflitti = {}, []
    for f in sorted(glob.glob(os.path.join(CATALOGHI, "*.json"))):
        if os.path.basename(f) == "nomi.json":
            continue
        with open(f, encoding="utf-8") as fh:
            for v in json.load(fh):
                if v["it"] in catalogo and catalogo[v["it"]] != v["en"]:
                    conflitti.append(v["it"][:60])
                catalogo[v["it"]] = v["en"]
    return catalogo, conflitti


def parti_inglesi(tipo, parlante, en, attribuzione):
    """Le parti (voce, grezzo, testo per la voce) di un testo inglese: virgolette → caporali,
    poi la funzione dell'italiano."""
    convertito = VIRGOLETTE.sub(lambda m: "«%s»" % m.group(1), en)
    return D.parti_di_una_stringa(tipo, parlante, convertito, attribuzione)


def scomponi_dinamico_en(t):
    """«You have [acqua] water and [cibo] food.» → i pezzi con un solo segnaposto ciascuno (come l'italiano, con «and»)."""
    m = re.match(r"^(.*?\[\w+\][^\[\]]*?) and (\[\w+\].*)$", t)
    return [m.group(1) + ",", "and " + m.group(2)] if m else [t]


def riempi_en(pezzo):
    """Un pezzo con un segnaposto → i suoi testi parlati in inglese, uno per valore (i valori dell'italiano)."""
    m = re.search(r"\[(\w+)\]", pezzo)
    if not m or m.group(1) not in D.VALORI:
        return None
    return [(v, pezzo.replace(m.group(0), NUMERI_EN[v])) for v in D.VALORI[m.group(1)]], m.group(1)


def raccogli_kira(r, s, zona, ti, te):
    """Le parti inglesi della voce di servizio, ciascuna con la sua parte italiana: un suggerimento tra
    parentesi, o un pezzo con un numero (uno per valore, come in italiano). Entrano in r["kira"]."""
    chiave = "%s:%d" % (s["file"], s["riga"])
    if "[" in ti or "[" in te:
        pi, pe = D.scomponi_dinamico(ti), scomponi_dinamico_en(te)
        if len(pi) != len(pe):
            r["problemi"].append("Kira: i pezzi con numeri non coincidono in %s: it %s, en %s" % (chiave, pi, pe))
            return
        coppie = list(zip(pi, pe))
    else:
        coppie = [(ti, te)]
    fonte = {"file": s["file"], "riga": s["riga"], "tipo": s["tipo"]}
    for xi, xe in coppie:
        if "[" in xi or "[" in xe:
            ri, re_ = D.riempi(xi), riempi_en(xe)
            if ri is None or re_ is None or ri[1] != re_[1] or len(ri[0]) != len(re_[0]):
                r["problemi"].append("Kira: segnaposto diversi in %s: «%s» / «%s»" % (chiave, xi, xe))
                continue
            if [v for v, _ in ri[0]] != [v for v, _ in re_[0]]:
                r["problemi"].append("Kira: valori diversi in %s: «%s» / «%s»" % (chiave, xi, xe))
                continue
            voci = [(ei, ee, ri[1], v) for (v, ei), (_, ee) in zip(ri[0], re_[0])]
        else:
            voci = [(xi, xe, None, None)]
        for ei, ee, nome, valore in voci:
            i = D.impronta("en-" + SERVIZIO, ee)
            u = r["kira"].setdefault(i, {"voce": SERVIZIO, "zona": zona, "testo": ee, "parole": D.parole(ee),
                                         "fonti": [], "italiano": [], "tipi": set(), "numero": nome, "valore": valore})
            u["tipi"].add(s["tipo"])
            if ei not in u["italiano"]:
                u["italiano"].append(ei)
            if fonte not in u["fonti"]:
                u["fonti"].append(fonte)
            u["categoria"] = "numeri" if nome else "suggerimento"


def voci_di(tipo, parti):
    """Le voci di una lista di parti; le scelte del giocatore le legge il narratore."""
    return [VOCE if tipo == "opzione" else v for v, _, _ in parti]


def costruisci():
    tutto = D.costruisci_tutto()
    attrib = D.carica_attribuzioni()
    catalogo, conflitti = carica_cataloghi()
    zona_di = {nome: z for z, nome in D.ZONE.items()}
    r = {"unita": OrderedDict(), "altre": OrderedDict(), "stringhe": [], "problemi": [],
         "conflitti": conflitti, "italiani": defaultdict(set), "dinamici": [], "kira": OrderedDict(),
         "personaggi": defaultdict(lambda: defaultdict(set)),   # voce → testo italiano → le traduzioni che ha nei cataloghi
         "n_stringhe": len(tutto["stringhe"]), "caporali": [0, 0], "parentesi": [0, 0]}
    for s in tutto["stringhe"]:
        chiave = "%s:%d" % (s["file"], s["riga"])
        it = s["origine"]
        en = catalogo.get(it)
        if en is None:
            r["problemi"].append("senza traduzione: %s %s" % (chiave, it[:60]))
            continue
        a = attrib.get(chiave)
        p_it = D.parti_di_una_stringa(s["tipo"], s["parlante"], it, a)
        try:
            p_en = parti_inglesi(s["tipo"], s["parlante"], en, a)
        except SystemExit as e:
            r["problemi"].append("le parti inglesi non rifanno il testo: %s %s" % (chiave, e))
            continue
        r["caporali"][0] += len(re.findall(r"«[^»]*»", it))
        r["caporali"][1] += len(VIRGOLETTE.findall(en))
        r["parentesi"][0] += len(re.findall(r"\([^)]*\)", it))
        r["parentesi"][1] += len(re.findall(r"\([^)]*\)", en))
        v_it, v_en = voci_di(s["tipo"], p_it), voci_di(s["tipo"], p_en)
        if v_it != v_en:
            r["problemi"].append("voci diverse in %s: it %s, en %s" % (chiave, v_it, v_en))
            continue
        pezzi = []
        for voce, (_, _, ti), (_, _, te) in zip(v_en, p_it, p_en):
            if voce == SERVIZIO:
                raccogli_kira(r, s, zona_di[s["file"]], ti, te)   # in più: Kira resta anche fra le «altre» voci qui sotto
            if voce == VOCE and "[" in te:
                # come in italiano: un segnaposto che non si scompone in valori (la riga di STATO, i fili
                # del viaggio) non è una parte: la compone il gioco
                r["dinamici"].append((chiave, ti))
                pezzi.append({"voce": voce, "dinamico": te})
            elif voce == VOCE:
                i = D.impronta("en-" + VOCE, te)
                u = r["unita"].setdefault(i, {"voce": VOCE, "zona": zona_di[s["file"]], "testo": te,
                                              "parole": D.parole(te), "fonti": [], "italiano": [], "tipi": set()})
                u["tipi"].add(s["tipo"])
                if ti not in u["italiano"]:
                    u["italiano"].append(ti)
                f = {"file": s["file"], "riga": s["riga"], "tipo": s["tipo"]}
                if f not in u["fonti"]:
                    u["fonti"].append(f)
                r["italiani"][ti].add(te)
                pezzi.append({"voce": voce, "id": i})
            else:
                if voce != SERVIZIO:
                    r["personaggi"][voce][ti].add(te)
                k = (voce, te)
                x = r["altre"].setdefault(k, {"voce": voce, "testo": te, "italiano": ti, "fonti": []})
                if chiave not in x["fonti"]:
                    x["fonti"].append(chiave)
                pezzi.append({"voce": voce, "testo": te})
        r["stringhe"].append({"file": s["file"], "riga": s["riga"], "tipo": s["tipo"], "it": it, "en": en, "parti": pezzi})
    for u in r["unita"].values():
        u["categoria"] = "scelta" if u["tipi"] == {"opzione"} else "testo"
    return r, tutto


# ---------------------------------------------------------------------------------------
# 2. Le verifiche
# ---------------------------------------------------------------------------------------

def verifiche(r, tutto):
    """[(esito, descrizione)]: ogni verifica o è vera o dice che cosa non torna."""
    out = []
    u_en = r["unita"]
    ok = lambda cond, testo: out.append(("OK" if cond else "ERRORE", testo))

    ok(not r["problemi"], "ogni testo del gioco ha la sua traduzione, le sue parti rifanno il testo e la sequenza delle "
                          "voci è identica a quella dell'italiano (%d testi)%s" % (
                              r["n_stringhe"], "" if not r["problemi"] else ": " + "; ".join(r["problemi"][:3])))
    ok(not r["conflitti"], "ogni testo italiano ha una sola traduzione nei cataloghi")
    ok(r["caporali"][0] == r["caporali"][1], "gli spezzoni fra virgolette sono gli stessi dell'italiano: %d caporali, %d virgolette" % tuple(r["caporali"]))
    ok(r["parentesi"][0] == r["parentesi"][1], "i suggerimenti fra parentesi sono gli stessi dell'italiano: %d e %d" % tuple(r["parentesi"]))

    din_it = set(tutto["dinamici"])
    din_en = {ti for _, ti in r["dinamici"]}
    ok(din_it == din_en, "i testi con segnaposto che il gioco compone da sé (STATO, fili del viaggio) sono gli stessi dell'italiano e restano "
                         "fuori dai blocchi: %d testi (%d occorrenze)" % (len(din_en), len(r["dinamici"])))
    sporchi = [u["testo"][:50] for u in u_en.values() if re.search(r"[()\[\]<>«»“”\"]", u["testo"])]
    ok(not sporchi, "nessuna parte di Enzo contiene parentesi, segnaposto, tag o virgolette%s" % ("" if not sporchi else ": " + "; ".join(sporchi[:3])))
    maiuscole = [u["testo"][:50] for u in u_en.values() if re.search(r"\b[A-Z]{2,}\b", u["testo"])]
    ok(not maiuscole, "nessuna parola in maiuscolo rimasta nelle parti di Enzo (sarebbe letta come enfasi)%s" % ("" if not maiuscole else ": " + "; ".join(maiuscole[:3])))

    # le parti di Enzo vengono tutte da un testo dell'italiano che il manifest italiano assegna al narratore
    it_u = tutto["unita"]
    it_narr = {u["testo"] for u in it_u.values() if u["voce"] == VOCE}
    estranee = [t for u in u_en.values() for t in u["italiano"] if t not in it_narr]
    ok(not estranee, "ogni parte inglese di Enzo ha come originale una parte italiana di Enzo (manifest italiano)%s" % ("" if not estranee else ": " + "; ".join(estranee[:3])))

    # quante: parti italiane del narratore per categoria contro parti inglesi
    for cat in ("testo", "scelta"):
        n_it = sum(1 for u in it_u.values() if u["voce"] == VOCE and u.get("categoria") == cat)
        n_en = sum(1 for u in u_en.values() if u["categoria"] == cat)
        ok(n_it == n_en, "parti di Enzo, categoria «%s»: italiano %d, inglese %d" % (cat, n_it, n_en))

    # un originale italiano → una sola traduzione; una traduzione ← un solo originale
    doppie = [ti[:50] for ti, tt in r["italiani"].items() if len(tt) > 1]
    ok(not doppie, "ogni parte italiana ha in inglese una traduzione sola%s" % ("" if not doppie else ": " + "; ".join(doppie[:3])))
    ripetute = [u["testo"][:50] for u in u_en.values() if len(u["italiano"]) > 1]
    ok(not ripetute, "due parti italiane diverse non diventano la stessa parte inglese%s" % ("" if not ripetute else ": " + "; ".join(ripetute[:3])))
    return out


def aggiungi_trailer(r):
    """Il trailer inglese (doppiaggio/en/trailer.json, scritto a mano dai testi sullo schermo) accanto a
    quello italiano: stessi id, stessi toni, stesse finestre e ancore. Le sue parti entrano in
    r["unita"] con categoria «trailer». Ritorna le verifiche."""
    esiti = []
    ok = lambda cond, testo: esiti.append(("OK" if cond else "ERRORE", testo))
    with open(os.path.join(USCITA, "trailer.json"), encoding="utf-8") as f:
        en = json.load(f)
    with open(D.TRAILER, encoding="utf-8") as f:
        it = json.load(f)
    ok([p["id"] for p in en["parti"]] == [p["id"] for p in it["parti"]],
       "il trailer inglese ha le stesse %d parti dell'italiano, nello stesso ordine" % len(it["parti"]))
    diverse = []
    for pe, pi in zip(en["parti"], it["parti"]):
        for campo in ("tono", "da", "a", "aggancia"):
            if pe.get(campo) != pi.get(campo):
                diverse.append("%s.%s" % (pe["id"], campo))
    ok(not diverse, "toni, finestre e ancore del trailer inglese sono quelli dell'italiano%s" % ("" if not diverse else ": " + ", ".join(diverse[:4])))
    ok(en["toni"] == it["toni"], "i quattro toni (stili) sono gli stessi dell'italiano")
    # quanto fitto: parole al secondo nella finestra della parte (le parti che dividono la stessa finestra, insieme)
    per_finestra = defaultdict(list)
    for p in en["parti"]:
        per_finestra[(p["da"], p["a"])].append(p)
    fitti = []
    for (da, a), gruppo in per_finestra.items():
        pi = {x["id"]: x for x in it["parti"]}
        v_en = sum(D.parole(p["testo"]) for p in gruppo) / (a - da)
        v_it = sum(D.parole(pi[p["id"]]["testo"]) for p in gruppo) / (a - da)
        if v_en > 3.0 and v_en > v_it * 1.2:
            fitti.append("%s (%.1f parole/s contro %.1f dell'italiano)" % ("+".join(p["id"] for p in gruppo), v_en, v_it))
    r["trailer_fitti"] = fitti
    for p, pi in zip(en["parti"], it["parti"]):
        i = D.impronta("en-" + VOCE + "-trailer", p["testo"])
        r["unita"][i] = {"voce": VOCE, "zona": "trailer", "testo": p["testo"], "parole": D.parole(p["testo"]),
                         "fonti": [{"file": "doppiaggio/en/trailer.json", "riga": 0, "tipo": "trailer", "id": p["id"]}],
                         "italiano": [pi["testo"]], "tipi": {"trailer"}, "categoria": "trailer", "tono": p["tono"],
                         "da": p["da"], "a": p["a"]}
        if "aggancia" in p:
            r["unita"][i]["aggancia"] = p["aggancia"]
    r["stili"] = en["toni"]
    return esiti


def verifiche_kira(r, tutto):
    """[(esito, descrizione)] per la voce di servizio: in inglese Kira dice tutto ciò che dice in italiano, e solo quello."""
    out = []
    ok = lambda cond, testo: out.append(("OK" if cond else "ERRORE", testo))
    k = r["kira"]
    it_k = {i: u for i, u in tutto["unita"].items() if u["voce"] == SERVIZIO}
    derivati = defaultdict(set)   # id italiano → id inglesi
    for i, u in k.items():
        for ti in u["italiano"]:
            derivati[D.impronta(SERVIZIO, ti)].add(i)
    ok(set(derivati) == set(it_k), "Kira: le parti inglesi risalgono, una per una, alle %d parti italiane di Kira nel manifest italiano (né una in più né una in meno)%s" % (
        len(it_k), "" if set(derivati) == set(it_k) else ": mancano %s, in più %s" % (sorted(set(it_k) - set(derivati))[:3], sorted(set(derivati) - set(it_k))[:3])))
    for cat, nome in (("suggerimento", "suggerimenti tra parentesi"), ("numeri", "pezzi con un numero")):
        n_it = sum(1 for u in it_k.values() if u.get("categoria") == cat)
        n_en = sum(1 for u in k.values() if u["categoria"] == cat)
        ok(n_it == n_en, "Kira, %s: italiano %d, inglese %d" % (nome, n_it, n_en))
    doppie = [ti[:40] for ti, tt in derivati.items() if len(tt) > 1]
    ok(not doppie, "Kira: ogni parte italiana ha in inglese una traduzione sola%s" % ("" if not doppie else ": " + "; ".join(doppie[:3])))
    ripetute = [u["testo"][:40] for u in k.values() if len(u["italiano"]) > 1]
    ok(not ripetute, "Kira: due parti italiane diverse non diventano la stessa parte inglese%s" % ("" if not ripetute else ": " + "; ".join(ripetute[:3])))
    sporchi = [u["testo"][:40] for u in k.values() if re.search(r"[()\[\]<>«»“”\"]", u["testo"])]
    ok(not sporchi, "Kira: nessuna parte contiene parentesi, segnaposto, tag o virgolette%s" % ("" if not sporchi else ": " + "; ".join(sporchi[:3])))
    maiuscole = [u["testo"][:40] for u in k.values() if re.search(r"\b[A-Z]{2,}\b", u["testo"])]
    ok(not maiuscole, "Kira: nessuna parola in maiuscolo rimasta (sarebbe letta come enfasi)%s" % ("" if not maiuscole else ": " + "; ".join(maiuscole[:3])))
    # il numero detto in inglese è lo stesso valore del numero detto in italiano
    storti = []
    for u in k.values():
        if u["numero"] is None:
            continue
        for ti in u["italiano"]:
            if D.NUMERI[u["valore"]] not in ti.lower().split() or NUMERI_EN[u["valore"]] not in u["testo"].lower().split():
                storti.append("%s / %s" % (u["testo"], ti))
    ok(not storti, "Kira: in ogni pezzo con un numero l'inglese e l'italiano dicono lo stesso valore%s" % ("" if not storti else ": " + "; ".join(storti[:3])))
    # niente che sia di Enzo o di un personaggio: nessun testo di Kira è anche un testo loro
    altrui = {u["testo"] for u in r["unita"].values()} | {x["testo"] for x in r["altre"].values() if x["voce"] != SERVIZIO}
    dentro = [u["testo"][:40] for u in k.values() if u["testo"] in altrui]
    ok(not dentro, "Kira: nessuna sua parte è anche un testo di Enzo o di un personaggio%s" % ("" if not dentro else ": " + "; ".join(dentro[:3])))
    # Kira dei cataloghi di oggi = le parti tra parentesi fuori dalle scelte: lo stesso numero di parentesi dell'italiano, contate da r
    ok(r["parentesi"][0] == r["parentesi"][1], "Kira: i suggerimenti fra parentesi sono gli stessi dell'italiano: %d e %d" % tuple(r["parentesi"]))
    return out


def blocchi_kira(r):
    """I blocchi di Kira: i suggerimenti (frasi, ciascuna diversa) e i pezzi con i numeri (le stesse sei parole che cambiano
    numero, uno dopo l'altro): separati, perché i secondi si somigliano e Gemini salta ciò che prende per una ripetizione."""
    out = OrderedDict()
    sugg = [i for i, u in r["kira"].items() if u["categoria"] == "suggerimento"]
    if sugg:
        # un suggerimento che comincia come uno dei dodici appena detti (la stessa coppia dell'italiano, «Al guado: usa la
        # lettera su Cosimo…») si rimanda in fondo: due righe vicine che si somigliano le salta, Gemini
        messi, rimandati = [], []
        for i in sugg:
            vicini = messi[-12:]
            if any(somiglianti([(a, r["kira"][a]), (i, r["kira"][i])]) for a in vicini):
                rimandati.append(i)
            else:
                messi.append(i)
        out["kira-suggerimenti"] = messi + rimandati
    # I pezzi con numeri vengono a «famiglie» (lo stesso modello, il numero che cambia: «Now you have # water.»).
    # Due famiglie che differiscono solo per la punteggiatura finale («…water.» / «…water,») stanno in blocchi diversi.
    famiglie = OrderedDict()
    for i, u in r["kira"].items():
        if u["categoria"] != "numeri":
            continue
        modello = re.sub(r"\b(%s)\b" % "|".join(NUMERI_EN), "#", u["testo"])
        famiglie.setdefault(modello, []).append(i)
    blocchi = [[], []]
    chiavi = [set(), set()]
    for modello, ids in famiglie.items():
        chiave = modello.rstrip(".,")
        libere = [b for b in (0, 1) if chiave not in chiavi[b]]
        b = min(libere, key=lambda x: (len(blocchi[x]), x))
        blocchi[b] += ids
        chiavi[b].add(chiave)
    for b, ids in zip("ab", blocchi):
        if ids:
            out["kira-numeri-" + b] = ids
    return out


def somiglianti(lista, soglia=0.9):
    """Coppie di parti vicine nello stesso blocco in cui una comincia come l'altra: Gemini salta ciò che
    prende per una ripetizione (successe a Enzo e a Tore in italiano)."""
    import difflib
    out = []
    for a in range(len(lista)):
        for b in range(a + 1, len(lista)):
            x, y = lista[a][1]["testo"], lista[b][1]["testo"]
            corto, lungo = (x, y) if len(x) <= len(y) else (y, x)
            if len(corto) >= 25 and lungo.startswith(corto[: max(25, int(len(corto) * 0.8))]):
                out.append((x, y))
            elif min(len(x), len(y)) >= 40 and difflib.SequenceMatcher(None, x, y, autojunk=False).ratio() >= soglia:
                out.append((x, y))
    return out


# ---------------------------------------------------------------------------------------
# 3. I blocchi
# ---------------------------------------------------------------------------------------

def bilancia(lista, massimo):
    """Il minor numero di blocchi sotto il massimo, di peso quasi uguale. Si taglia solo fra un testo del
    gioco e il successivo (mai a metà di una descrizione) e, se si può, dove cambia la zona: i cambi di
    zona sono pochi e a coppie sfondano il tetto, quindi si tagliano anche dentro le zone."""
    pesi = [D.minuti_di(VOCE, u["parole"]) for _, u in lista]
    totale = sum(pesi)
    k = max(1, int(-(-totale // massimo)))
    # i punti dove si può tagliare: prima dell'unità n, se il suo testo di origine è un altro
    origine = [(u["fonti"][0]["file"], u["fonti"][0]["riga"]) for _, u in lista]
    tagli_ok = [n for n in range(1, len(lista)) if origine[n] != origine[n - 1]]
    zona_nuova = {n for n in tagli_ok if lista[n][1]["zona"] != lista[n - 1][1]["zona"]}
    cumulo = [0.0]
    for p in pesi:
        cumulo.append(cumulo[-1] + p)
    while True:
        for tol in (0.7, 0.5, 0.35, 0.2, 0.1):
            tagli, prec = [], 0
            for j in range(1, k):
                ideale = totale * j / k
                candidati = [n for n in tagli_ok if n > prec and abs(cumulo[n] - ideale) <= tol]
                if not candidati:
                    candidati = sorted((n for n in tagli_ok if n > prec), key=lambda n: abs(cumulo[n] - ideale))[:1]
                scelto = min(candidati, key=lambda n: (n not in zona_nuova, abs(cumulo[n] - ideale)))
                tagli.append(scelto)
                prec = scelto
            confini = [0] + tagli + [len(lista)]
            pezzi = [lista[confini[a]:confini[a + 1]] for a in range(len(confini) - 1)]
            if all(sum(D.minuti_di(VOCE, u["parole"]) for _, u in p) <= massimo for p in pezzi):
                return pezzi
        k += 1


def blocchi_di(r, massimo):
    testo = [(i, u) for i, u in r["unita"].items() if u["categoria"] == "testo"]
    scelte = [(i, u) for i, u in r["unita"].items() if u["categoria"] == "scelta"]
    out = OrderedDict()
    for k, p in enumerate(bilancia(testo, massimo)):
        out["narratore-" + "abcdefghij"[k]] = [i for i, _ in p]
    if scelte:
        out["scelte"] = [i for i, _ in scelte]
    trailer = [(i, u) for i, u in r["unita"].items() if u["categoria"] == "trailer"]
    if trailer:  # in gruppi per tono (come l'italiano): un blocco di parlato per tono, ognuno col suo stile
        toni = list(OrderedDict.fromkeys(u["tono"] for _, u in trailer))
        out["trailer"] = [i for i, _ in sorted(trailer, key=lambda x: toni.index(x[1]["tono"]))]
    return out


def minuti(r, ids):
    return sum(D.minuti_di(VOCE, r["unita"][i]["parole"]) for i in ids)


def minuti_kira(r, ids):
    return sum(D.minuti_di(SERVIZIO, r["kira"][i]["parole"]) for i in ids)


def manifest_kira(r, tutto, kira):
    """La voce di servizio, a parte (le parti di Enzo restano dov'erano): blocchi, parti e corrispondenze
    italiano → inglese. Il banco e il taglio la useranno quando Kira sarà registrata."""
    for nome, ids in kira.items():
        for i in ids:
            r["kira"][i]["blocco"] = nome
    unita, corrispondenze = OrderedDict(), OrderedDict()
    for i, u in r["kira"].items():
        unita[i] = {"voce": u["voce"], "categoria": u["categoria"], "zona": u["zona"], "blocco": u.get("blocco"),
                    "testo": u["testo"], "parole": u["parole"], "italiano": u["italiano"], "fonti": u["fonti"],
                    "italiano_ids": [D.impronta(SERVIZIO, ti) for ti in u["italiano"]]}
        if u["numero"]:
            unita[i]["numero"], unita[i]["valore"] = u["numero"], u["valore"]
        for ti in u["italiano"]:
            corrispondenze[D.impronta(SERVIZIO, ti)] = i
    return OrderedDict([
        ("voce", "Kira (britannica neutra)"),
        ("blocchi", OrderedDict((n, {"minuti_stimati": round(minuti_kira(r, ids), 1), "parti": ids}) for n, ids in kira.items())),
        ("unita", unita), ("corrispondenze", corrispondenze)])


def testo_controllo_kira(r, kira, esiti):
    L = ["", "# Controllo di Kira (voce di servizio) inglese", "",
         "> Stesso metodo del narratore. Kira dice **soltanto** i suggerimenti tra parentesi e i pezzi con i numeri delle scorte:",
         "> niente narrazione, niente battute di personaggi, niente scelte del giocatore.", "", "## Verifiche", ""]
    L += ["- **%s**: %s" % e for e in esiti]
    L += ["", "## I blocchi", "", "| Blocco | Parti | Parole | Minuti stimati |", "|---|---:|---:|---:|"]
    for nome, ids in kira.items():
        L.append("| %s | %d | %d | %.1f |" % (nome, len(ids), sum(r["kira"][i]["parole"] for i in ids), minuti_kira(r, ids)))
    L += ["", "I minuti usano le costanti dell'italiano per il servizio (220 parole al minuto, 0,8 s per parte)."]
    for nome, ids in kira.items():
        L += ["", "### %s" % nome, "", "| n. | Zona | Italiano | Inglese (quello che legge Kira) |", "|---:|---|---|---|"]
        for k, i in enumerate(ids, 1):
            u = r["kira"][i]
            L.append("| %d | %s | %s | %s |" % (k, u["zona"], cella(" / ".join(u["italiano"])), cella(u["testo"])))
    L.append("")
    return "\n".join(L)


# ---------------------------------------------------------------------------------------
# 4. I personaggi (Eleven v4)
# ---------------------------------------------------------------------------------------

def raccogli_personaggi(r, tutto, voci=PERSONAGGI):
    """Le parti inglesi dei PERSONAGGI, una per ogni parte italiana, nell'ordine dell'italiano (quello delle registrazioni
    ElevenLabs di oggi: l'ordine in cui compaiono nel gioco). Ritorna (unita, problemi): l'id inglese è l'impronta di
    «en-<voce>» e del testo, come per Enzo e Kira."""
    unita, problemi = OrderedDict(), []
    for voce in voci:
        mie = [(ii, u) for ii, u in tutto["unita"].items() if u["voce"] == voce]
        if not mie:
            problemi.append("%s: nessuna parte nel manifest italiano" % voce)
        for ii, ui in mie:
            ti = ui["testo"]
            if D.impronta(voce, ti) != ii:
                problemi.append("%s: l'id italiano di «%s» non è l'impronta del suo testo" % (voce, ti[:40]))
                continue
            traduzioni = r["personaggi"].get(voce, {}).get(ti, set())
            if len(traduzioni) != 1:
                problemi.append("%s: «%s» ha %d traduzioni nei cataloghi" % (voce, ti[:40], len(traduzioni)))
                continue
            te = next(iter(traduzioni))
            i = D.impronta("en-" + D.slug(voce), te)
            if i in unita:
                problemi.append("%s: due parti italiane diventano la stessa parte inglese «%s»" % (voce, te[:40]))
                continue
            unita[i] = {"voce": voce, "categoria": ui.get("categoria", "testo"), "zona": ui["zona"], "blocco": D.slug(voce),
                        "testo": te, "parole": D.parole(te), "italiano": [ti], "fonti": ui["fonti"],
                        "italiano_ids": [ii], "tono": ui.get("tono") or "calmo"}
    return unita, problemi


def verifiche_personaggi(r, tutto, pers, problemi):
    """[(esito, descrizione)] per i personaggi di ElevenLabs: in inglese ognuno dice ciò che dice in italiano, parte per parte."""
    out = []
    ok = lambda cond, testo: out.append(("OK" if cond else "ERRORE", testo))
    stili = tutto.get("stili", {})
    ok(not problemi, "Personaggi: ogni parte italiana di %s ha una traduzione sola nei cataloghi, e non ce ne sono due uguali%s" % (
        ", ".join(PERSONAGGI), "" if not problemi else ": " + "; ".join(problemi[:3])))
    for voce in PERSONAGGI:
        n_it = sum(1 for u in tutto["unita"].values() if u["voce"] == voce)
        n_en = sum(1 for u in pers.values() if u["voce"] == voce)
        ok(n_it == n_en, "%s: parti italiane %d, inglesi %d" % (voce, n_it, n_en))
    sporchi = [u["testo"][:40] for u in pers.values() if re.search(r"[()\[\]<>«»“”\"]", u["testo"])]
    ok(not sporchi, "Personaggi: nessuna parte contiene parentesi, segnaposto, tag o virgolette%s" % ("" if not sporchi else ": " + "; ".join(sporchi[:3])))
    maiuscole = [u["testo"][:40] for u in pers.values() if re.search(r"\b[A-Z]{2,}\b", u["testo"])]
    ok(not maiuscole, "Personaggi: nessuna parola in maiuscolo (Eleven la leggerebbe come enfasi)%s" % ("" if not maiuscole else ": " + "; ".join(maiuscole[:3])))
    senza_stile = sorted({u["tono"] for u in pers.values() if u["tono"] != "calmo" and u["tono"] not in stili})
    ok(not senza_stile, "Personaggi: ogni tono ha il suo stile in toni.json%s" % ("" if not senza_stile else ": " + ", ".join(senza_stile)))
    # i toni sono quelli dell'italiano: il manifest italiano li ha già, qui si controlla solo che non si siano persi
    persi = [u["testo"][:40] for u in pers.values() if u["tono"] != (tutto["unita"][u["italiano_ids"][0]].get("tono") or "calmo")]
    ok(not persi, "Personaggi: ogni parte inglese ha il tono della sua parte italiana%s" % ("" if not persi else ": " + "; ".join(persi[:3])))
    return out


def testo_eleven(unita, ids, stili, accento):
    """Il blocco di un personaggio per Eleven v4: una battuta per paragrafo (una riga vuota fra l'una e l'altra), con in testa
    l'accento e il tono come tag fra parentesi quadre («[Italian accent][dry, curt] Well?»), impilati come nelle guide di
    ElevenLabs. Il tono «calmo» è il tono di base e non ha tag. Niente SSML (v4 non lo ha) e niente intestazioni: il file si
    incolla intero."""
    righe = []
    for i in ids:
        tono = unita[i].get("tono")
        tag = ("[%s]" % accento if accento else "") + ("[%s]" % stili[tono] if tono and tono != "calmo" and tono in stili else "")
        righe.append((tag + " " if tag else "") + unita[i]["testo"])
    return "\n\n".join(righe) + "\n"


def blocchi_personaggi(pers):
    """{blocco: [id]}: un blocco per personaggio, intero (mai a metà: la voce cambierebbe)."""
    return OrderedDict((D.slug(v), [i for i, u in pers.items() if u["voce"] == v]) for v in PERSONAGGI)


def minuti_personaggio(pers, ids):
    return sum(D.minuti_di(pers[i]["voce"], pers[i]["parole"]) for i in ids)


def manifest_personaggi(pers, blocchi, accento):
    """I personaggi, a parte (come Kira): blocchi, parti e corrispondenze italiano → inglese."""
    corrispondenze = OrderedDict((u["italiano_ids"][0], i) for i, u in pers.items())
    return OrderedDict([
        ("voce", "Eleven v4: le voci italiane di %s, in inglese" % ", ".join(PERSONAGGI)),
        ("accento", accento),
        ("blocchi", OrderedDict((n, {"voce": pers[ids[0]]["voce"], "minuti_stimati": round(minuti_personaggio(pers, ids), 1),
                                     "parti": ids}) for n, ids in blocchi.items())),
        ("unita", pers), ("corrispondenze", corrispondenze)])


def testo_controllo_personaggi(tutto, pers, blocchi, esiti, accento):
    stili = tutto.get("stili", {})
    L = ["", "# Controllo dei personaggi inglesi (Eleven v4)", "",
         "> I personaggi che in italiano sono stati fatti con ElevenLabs, in inglese: stesse parti, stesso ordine, stessi toni.",
         "> Accento chiesto a Eleven: **%s**." % (accento or "nessuno"), "", "## Verifiche", ""]
    L += ["- **%s**: %s" % e for e in esiti]
    L += ["", "## I blocchi", "", "| Blocco | Parti | Parole | Caratteri | Minuti stimati |", "|---|---:|---:|---:|---:|"]
    for nome, ids in blocchi.items():
        L.append("| %s | %d | %d | %d | %.1f |" % (nome, len(ids), sum(pers[i]["parole"] for i in ids),
                                                    sum(len(pers[i]["testo"]) for i in ids), minuti_personaggio(pers, ids)))
    for nome, ids in blocchi.items():
        L += ["", "### %s" % nome, "", "| n. | Tono | Italiano | Inglese |", "|---:|---|---|---|"]
        for k, i in enumerate(ids, 1):
            u = pers[i]
            L.append("| %d | %s | %s | %s |" % (k, "(base)" if u["tono"] == "calmo" else stili.get(u["tono"], u["tono"]),
                                                cella(" / ".join(u["italiano"])), cella(u["testo"])))
    L.append("")
    return "\n".join(L)


def scrivi_prove(tutto, pers, blocchi):
    """Le prove di accento: le stesse sei battute di Vito (toni diversi), un accento diverso per file. Si generano tutte con la
    stessa voce e le stesse impostazioni; ogni generazione varia un poco, quindi si ascolta anche la differenza fra due
    riprese uguali."""
    cartella = os.path.join(USCITA, "prove")
    os.makedirs(cartella, exist_ok=True)
    for f in glob.glob(os.path.join(cartella, "accento-*.txt")):
        os.remove(f)
    vito = blocchi["vito"]
    scelte = [vito[k] for k in PROVA_VITO]
    for lettera, nome, accento in PROVE_ACCENTO:
        with open(os.path.join(cartella, "accento-%s-%s.txt" % (lettera, nome)), "w", encoding="utf-8", newline="\n") as fh:
            fh.write(testo_eleven(pers, scelte, tutto.get("stili", {}), accento))
    return sum(len(pers[i]["testo"]) for i in scelte)


def scrivi(r, tutto, blocchi, esiti, kira=None, esiti_kira=None, pers=None, esiti_pers=None, accento=None):
    os.makedirs(os.path.join(USCITA, "blocchi"), exist_ok=True)
    for f in glob.glob(os.path.join(USCITA, "blocchi", "*.txt")):
        os.remove(f)
    for nome, ids in blocchi.items():
        with open(os.path.join(USCITA, "blocchi", nome + ".txt"), "w", encoding="utf-8", newline="\n") as fh:
            fh.write(D.testo_del_blocco(r["unita"], ids, r.get("stili", {})))
    for nome, ids in (kira or {}).items():
        with open(os.path.join(USCITA, "blocchi", nome + ".txt"), "w", encoding="utf-8", newline="\n") as fh:
            fh.write(D.testo_del_blocco(r["kira"], ids, {}))
    blocchi_pers = blocchi_personaggi(pers) if pers else OrderedDict()
    for nome, ids in blocchi_pers.items():
        with open(os.path.join(USCITA, "blocchi", nome + ".txt"), "w", encoding="utf-8", newline="\n") as fh:
            fh.write(testo_eleven(pers, ids, tutto.get("stili", {}), accento))
    unita = OrderedDict()
    for nome, ids in blocchi.items():
        for i in ids:
            r["unita"][i]["blocco"] = nome
    for i, u in r["unita"].items():
        unita[i] = {"voce": u["voce"], "categoria": u["categoria"], "zona": u["zona"], "blocco": u.get("blocco"),
                    "testo": u["testo"], "parole": u["parole"], "italiano": u["italiano"], "fonti": u["fonti"]}
        for campo in ("tono", "da", "a", "aggancia"):
            if campo in u:
                unita[i][campo] = u[campo]
    # Il gioco tiene il diario in italiano e ritrova le parti dal testo italiano (parti.ts): la voce inglese si
    # aggancia agli id ITALIANI. Per ogni parte italiana del narratore, la sua registrazione inglese.
    it_unita = tutto["unita"]
    corrispondenze = OrderedDict()
    for i, u in r["unita"].items():
        if u["categoria"] == "trailer":
            continue   # il trailer ha la sua traccia
        for ti in u["italiano"]:
            ii = D.impronta(VOCE, ti)
            if ii not in it_unita or it_unita[ii]["voce"] != VOCE:
                raise SystemExit("la parte italiana «%s» non è una parte del narratore" % ti)
            corrispondenze[ii] = i
        unita[i]["italiano_ids"] = [D.impronta(VOCE, ti) for ti in u["italiano"]]
    manifest = {
        "lingua": "en", "voce": "Enzo (britannico neutro)",
        "blocchi": OrderedDict((n, {"minuti_stimati": round(minuti(r, ids), 1), "parti": ids}) for n, ids in blocchi.items()),
        "unita": unita,
        "corrispondenze": corrispondenze,
        "stringhe": r["stringhe"],
    }
    if kira:
        manifest["servizio"] = manifest_kira(r, tutto, kira)
    if pers:
        manifest["personaggi"] = manifest_personaggi(pers, blocchi_pers, accento)
    with open(os.path.join(USCITA, "manifest.json"), "w", encoding="utf-8", newline="\n") as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    with open(os.path.join(USCITA, "controllo.md"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write(testo_controllo(r, tutto, blocchi, esiti))
        if kira:
            fh.write(testo_controllo_kira(r, kira, esiti_kira or []))
        if pers:
            fh.write(testo_controllo_personaggi(tutto, pers, blocchi_pers, esiti_pers or [], accento))


def cella(t):
    return t.replace("|", "\\|").replace("\n", " ")


def testo_controllo(r, tutto, blocchi, esiti):
    u_en = r["unita"]
    L = ["# Controllo del narratore inglese", "",
         "> Generato da `strumenti/doppiaggio-inglese.py`: non si scrive a mano. Serve a vedere, senza leggere l'inglese,",
         "> che nelle parti di Enzo ci sia soltanto ciò che deve dire lui, e dove sta tutto il resto.", "",
         "## Verifiche", ""]
    L += ["- **%s**: %s" % e for e in esiti]
    L += ["", "## Conti", "",
          "| Che cosa | Parti | Parole | Minuti stimati |", "|---|---:|---:|---:|"]
    for cat, nome in (("testo", "Narrazione (descrizioni, posti, messaggi, finali, biglietto e targhe)"),
                      ("scelta", "Scelte di dialogo del giocatore (le legge Enzo)"),
                      ("trailer", "Trailer (narrativo ed enfatico, in quattro toni)")):
        ids = [i for i, u in u_en.items() if u["categoria"] == cat]
        L.append("| %s | %d | %d | %.1f |" % (nome, len(ids), sum(u_en[i]["parole"] for i in ids), minuti(r, ids)))
    L += ["", "## I blocchi", "", "| Blocco | Parti | Parole | Minuti stimati | Zone |", "|---|---:|---:|---:|---|"]
    for nome, ids in blocchi.items():
        zone = list(OrderedDict.fromkeys(u_en[i]["zona"] for i in ids))
        L.append("| %s | %d | %d | %.1f | %s |" % (nome, len(ids), sum(u_en[i]["parole"] for i in ids),
                                                  minuti(r, ids), ", ".join(zone)))
    L += ["", "I minuti usano le costanti dell'italiano (170 parole al minuto mentre parla, 1,4 s per parte): l'inglese",
          "va ritarato sulla prima generazione vera.", ""]

    L += ["## Che cosa NON è di Enzo", ""]
    per = OrderedDict()
    for x in r["altre"].values():
        per.setdefault(x["voce"], []).append(x)
    L += ["| Voce | Parti |", "|---|---:|"] + ["| %s | %d |" % (v, len(l)) for v, l in per.items()]
    L += ["", "I suggerimenti tra parentesi (**voce di servizio, Kira**) e le battute dei personaggi, ciascuno col suo italiano.", ""]
    for v, lista in per.items():
        L += ["### %s" % v, "", "| Inglese | Italiano |", "|---|---|"]
        L += ["| %s | %s |" % (cella(x["testo"]), cella(x["italiano"])) for x in lista]
        L.append("")

    L += ["## La tabella di Enzo: italiano ↔ inglese", "",
          "Una riga per parte, nell'ordine in cui Enzo la legge. Se in «Italiano» c'è qualcosa che non dovrebbe dire lui, è qui che si vede.", ""]
    for nome, ids in blocchi.items():
        L += ["### %s" % nome, ""]
        if nome == "trailer":
            L += ["Il trailer è a gruppi di tono: un blocco di parlato per gruppo, col suo stile accanto alla voce.", "",
                  "| n. | Tono | Finestra (s) | Italiano | Inglese |", "|---:|---|---|---|---|"]
            for k, i in enumerate(ids, 1):
                u = u_en[i]
                L.append("| %d | %s | %s–%s | %s | %s |" % (k, u["tono"], u["da"], u["a"], cella(" / ".join(u["italiano"])), cella(u["testo"])))
            if r.get("trailer_fitti"):
                L += ["", "Finestre in cui l'inglese è più fitto dell'italiano (la lettura potrebbe non starci): " + "; ".join(r["trailer_fitti"]) + "."]
        else:
            L += ["| n. | Zona | Italiano | Inglese (quello che legge Enzo) |", "|---:|---|---|---|"]
            for k, i in enumerate(ids, 1):
                u = u_en[i]
                L.append("| %d | %s | %s | %s |" % (k, u["zona"], cella(" / ".join(u["italiano"])), cella(u["testo"])))
        L.append("")
    return "\n".join(L)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("comando", choices=["stato", "blocchi", "prove", "personaggio"])
    ap.add_argument("--max-minuti", type=float, default=MAX_MINUTI, help="tetto di un blocco (predefinito %s)" % MAX_MINUTI)
    ap.add_argument("--voce", help="con «personaggio»: il personaggio di cui scrivere il blocco inglese (Concetta…)")
    ap.add_argument("--accento", default=ACCENTO or "nessuno",
                    help="il tag d'accento davanti a ogni battuta dei personaggi di Eleven v4 (predefinito «%s»; «nessuno» = nessun tag)" % ACCENTO)
    a = ap.parse_args()
    accento = None if a.accento.lower() in ("nessuno", "none", "") else a.accento
    sys.stdout.reconfigure(encoding="utf-8")
    r, tutto = costruisci()
    if a.comando == "personaggio":   # un esperimento: il blocco di un personaggio che non è fra i PERSONAGGI, fuori dal manifest
        voce = next((v for v in dict.fromkeys(u["voce"] for u in tutto["unita"].values())
                     if a.voce and v.lower() == a.voce.lower() and v not in ("narratore", "servizio")), None)
        if not voce:
            raise SystemExit("personaggio: serve --voce con il nome di un personaggio (Concetta, Iole, Cosimo…)")
        x, problemi = raccogli_personaggi(r, tutto, [voce])
        if problemi or not x:
            raise SystemExit("personaggio %s: " % voce + ("; ".join(problemi[:3]) or "nessuna parte"))
        ids = list(x)
        os.makedirs(os.path.join(USCITA, "prove"), exist_ok=True)
        percorso = os.path.join(USCITA, "prove", D.slug(voce) + ".txt")
        with open(percorso, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(testo_eleven(x, ids, tutto.get("stili", {}), accento))
        print("scritto %s: %d parti, %d caratteri di testo, accento: %s" % (
            os.path.relpath(percorso, RADICE), len(ids), sum(len(x[i]["testo"]) for i in ids), accento or "nessuno"))
        return
    esiti = verifiche(r, tutto)
    esiti += aggiungi_trailer(r)
    esiti_kira = verifiche_kira(r, tutto)
    pers, problemi_pers = raccogli_personaggi(r, tutto)
    esiti_pers = verifiche_personaggi(r, tutto, pers, problemi_pers)
    for e in esiti + esiti_kira + esiti_pers:
        print("%-7s %s" % e)
    blocchi = blocchi_di(r, a.max_minuti)
    for nome, ids in blocchi.items():
        print("%-18s %3d parti %5d parole  %4.1f min" % (nome, len(ids), sum(r["unita"][i]["parole"] for i in ids), minuti(r, ids)))
        sim = somiglianti([(i, r["unita"][i]) for i in ids])
        for x, y in sim:
            print("   ATTENZIONE parti che si somigliano: «%s» / «%s»" % (x[:60], y[:60]))
    kira = blocchi_kira(r)
    for nome, ids in kira.items():
        print("%-18s %3d parti %5d parole  %4.1f min" % (nome, len(ids), sum(r["kira"][i]["parole"] for i in ids), minuti_kira(r, ids)))
        for x, y in somiglianti([(i, r["kira"][i]) for i in ids]):
            print("   ATTENZIONE parti che si somigliano: «%s» / «%s»" % (x[:60], y[:60]))
    blocchi_pers = blocchi_personaggi(pers)
    for nome, ids in blocchi_pers.items():
        print("%-18s %3d parti %5d parole %5d caratteri  %4.1f min  (accento: %s)" % (
            nome, len(ids), sum(pers[i]["parole"] for i in ids), sum(len(pers[i]["testo"]) for i in ids),
            minuti_personaggio(pers, ids), accento or "nessuno"))
    if any(e[0] != "OK" for e in esiti + esiti_kira + esiti_pers):
        raise SystemExit("verifiche non superate: non scrivo niente")
    if a.comando == "blocchi":
        scrivi(r, tutto, blocchi, esiti, kira, esiti_kira, pers, esiti_pers, accento)
        print("scritto doppiaggio/en/ (blocchi/, manifest.json, controllo.md)")
    if a.comando in ("blocchi", "prove"):
        n = scrivi_prove(tutto, pers, blocchi_pers)
        print("scritto doppiaggio/en/prove/ (%d prove di %d caratteri)" % (len(PROVE_ACCENTO), n))


if __name__ == "__main__":
    main()
