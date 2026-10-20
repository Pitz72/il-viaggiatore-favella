"""Il doppiaggio del Viaggiatore: dai testi dei .fav ai blocchi da dare alla voce.

Legge i sorgenti .fav (come mappa-narrativa.py: serve sapere in quale FILE, cioè in quale
zona, è scritto ogni testo), li spezza nelle PARTI che hanno una voce sola e scrive:

  doppiaggio/blocchi/<voce>[-a|-b].txt   il testo da incollare nell'editor di AI Studio:
                                         una parte per riga, `<long pause>` fra l'una e l'altra
  doppiaggio/manifest.json               per ogni parte: id, voce, testo, da dove viene;
                                         per ogni testo del gioco: da quali parti si compone;
                                         per ogni blocco: l'ordine delle parti

Le VOCI sono tre tipi: il narratore (tutto ciò che sta fuori dalle virgolette e dalle
parentesi, più le frasi scritte: il biglietto, le targhe, e le scelte di dialogo del giocatore,
che sono in prima persona e le legge lui, in un blocco a parte: «narratore-scelte»), la voce di
servizio (i suggerimenti tra parentesi e i numeri) e i personaggi (le battute tra «caporali» di
un dialogo). Il giocatore non ha una voce sua.

Il testo per la voce NON cambia il gioco: è derivato. Le parole in MAIUSCOLO (NORD, PARLA CON…)
si abbassano, perché la voce le leggerebbe come enfasi. L'id di una parte è l'impronta (SHA-1)
di voce + testo: se un testo del gioco cambia, cambia l'id e l'audio vecchio si riconosce.

I testi con numeri dentro ([acqua], [cibo]) non si possono registrare interi: si spezzano nei
pezzi «Hai sette d'acqua,» / «e tre di cibo.» (uno per ogni valore) e il gioco li ricompone.

Si lavora una voce per volta e col minor numero di generazioni (ogni generazione cambia un
poco la voce): un blocco per voce su TUTTO il gioco, diviso solo quando supera il tetto del
servizio (circa 11 minuti di audio a richiesta), e dove cambia la zona.

Uso:  python strumenti/doppiaggio.py stato                    (parti, parole e minuti per voce)
      python strumenti/doppiaggio.py blocchi --voce servizio  (scrive blocchi/servizio.txt e manifest.json)
      python strumenti/doppiaggio.py blocchi                  (tutte le voci; cancella i blocchi vecchi)
      python strumenti/doppiaggio.py blocchi --max-minuti 8
      python strumenti/doppiaggio.py da-fare                  (doppiaggio/DA-FARE/: solo ciò che manca, con le istruzioni in testa)
"""
import argparse
import hashlib
import json
import math
import os
import re
import sys
from collections import OrderedDict, defaultdict

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROTOTIPO = os.path.join(RADICE, "prototipo")
CARTELLA = os.path.join(RADICE, "doppiaggio")
ATTRIBUZIONI = os.path.join(CARTELLA, "attribuzioni.json")
GENERATI = os.path.join(CARTELLA, "generati")
TONI = os.path.join(CARTELLA, "toni.json")
INTESTAZIONE = "###"  # nei blocchi, le righe che cominciano così sono intestazioni di gruppo: non si incollano

ZONE = OrderedDict([
    ("storia", "il-viaggiatore.fav"),
    ("sistemi", "sistemi.fav"),
    ("z1", "z1-acquaviva.fav"),
    ("z2", "z2-piana.fav"),
    ("z3", "z3-invaso.fav"),
    ("z4", "z4-statale.fav"),
    ("z5", "z5-paese.fav"),
    ("z6", "z6-colline.fav"),
    ("z7", "z7-guado.fav"),
])

PAUSA = "<long pause>"
# Il ritmo vero, misurato sulle prime prove di AI Studio (20/10/2026, poche frasi: da rivedere con
# i blocchi interi): il narratore (voce Enzo) fa ~125 parole al minuto contando le pause, Nunzio
# (Riko) ~85; per la voce di servizio si stima 150. Ogni parte costa in più la sua pausa.
RITMO = {"narratore": 170, "servizio": 220}  # parole al minuto MENTRE PARLA (pause escluse)
RITMO_PERSONAGGI = 100  # una prova sola (Nunzio): da rivedere sul primo personaggio vero
# secondi di pausa per ogni parte (fra una parte e l'altra, più le pause dei segni di punteggiatura
# dentro le parti): misurati sui WAV veri; i personaggi sono una stima
SECONDI_DI_PAUSA = {"narratore": 1.4, "servizio": 0.8}
SECONDI_DI_PAUSA_PERSONAGGI = 1.2
# Il tetto del servizio è ~11 minuti a richiesta (16.384 token a 25 al secondo): si sta larghi, per
# non perdere righe. La voce di servizio, che è poca, si vuole in una generazione sola (Simone).
MAX_MINUTI = {"_": 9.0, "servizio": 10.0}

# Le parole scritte in maiuscolo nei testi sono comandi e direzioni: la voce le leggerebbe
# come enfasi, quindi si abbassano. I nomi dei personaggi tornano con l'iniziale maiuscola.
NOMI = {"NUNZIO", "SAVERIO", "IOLE", "ROCCO", "VITO", "IMMA", "ROSARIA", "PEPPE", "CIRO",
        "PASQUALE", "CONCETTA", "TORE", "ONOFRIO", "COSIMO"}

# I numeri che il gioco può scrivere al posto dei segnaposto (da verificare con le partite).
VALORI = {"acqua": range(0, 21), "cibo": range(0, 13)}
NUMERI = ["zero", "uno", "due", "tre", "quattro", "cinque", "sei", "sette", "otto", "nove",
          "dieci", "undici", "dodici", "tredici", "quattordici", "quindici", "sedici",
          "diciassette", "diciotto", "diciannove", "venti"]

LETTERA = "A-Za-zÀ-ÖØ-öø-ÿ"
STR = re.compile(r'"((?:[^"\\]|\\.)*)"')


def slug(nome):
    return re.sub(r"[^a-z0-9]+", "-", nome.lower()).strip("-")


def parole(t):
    return len(re.findall(r"\w[\w']*", t))


def minuti_di(voce, n_parole):
    """Quanto dura (stima) una parte detta da questa voce, pausa compresa."""
    ritmo = RITMO.get(voce, RITMO_PERSONAGGI)
    return n_parole / ritmo + SECONDI_DI_PAUSA.get(voce, SECONDI_DI_PAUSA_PERSONAGGI) / 60


# ---------------------------------------------------------------------------------------
# 1. I testi dei .fav: quali stringhe si dicono, e di che tipo
# ---------------------------------------------------------------------------------------

def classifica(riga, prefisso):
    """Il tipo di una stringa dal testo che la precede sulla riga, o None se non si dice."""
    p = prefisso.rstrip()
    if p.endswith("l'opzione"):
        return "opzione"
    if re.search(r"\bdice$", p):
        return "dialogo"
    if re.search(r"\bdire$", p):
        return "messaggio"
    if re.search(r"\b(termina|vinci|perdi)$", p):
        return "finale"
    if re.match(r"La descrizione\b", riga) and p.endswith(" è"):
        return "descrizione"
    if re.match(r"Il posto\b", riga) and p.endswith(" è"):
        return "posto"
    if re.match(r"Il testo \"", riga) and p.endswith(" è"):
        return "testo"
    return None


def stringhe_del_file(nome_file):
    """(riga, tipo, parlante, testo) per ogni stringa che si dice, e per ogni stringa
    scartata (tipo None) il suo prefisso, per controllare che non si perda niente."""
    ok, scartate = [], []
    with open(os.path.join(PROTOTIPO, nome_file), encoding="utf-8") as f:
        for n, riga in enumerate(f, 1):
            r = riga.strip()
            if not r or r.startswith("#"):
                continue
            for m in STR.finditer(r):
                tipo = classifica(r, r[:m.start()])
                if tipo is None:
                    scartate.append((n, r[:m.start()].rstrip()[-30:], m.group(1)[:40]))
                    continue
                parlante = None
                if tipo == "dialogo":
                    pm = re.match(r'(.+?) al nodo "', r)
                    parlante = pm.group(1).strip() if pm else None
                ok.append((n, tipo, parlante, m.group(1)))
    return ok, scartate


# ---------------------------------------------------------------------------------------
# 2. Una stringa → le sue parti (voce, testo)
# ---------------------------------------------------------------------------------------

def segmenti_condizionali(testo):
    """I testi con nome scritti «[se …]frase [fine]» sono frasi indipendenti: ognuna col suo
    controllo. Il resto è un testo solo."""
    if "[se " not in testo:
        return [(None, testo)]
    out = []
    for m in re.finditer(r"\[se ([^\]]*)\](.*?)\[fine\]", testo, re.S):
        out.append((m.group(1).strip(), m.group(2)))
    return out


def tipo_di_voce(tipo, parlante, attribuzione):
    """Chi dice le parole tra «caporali» di questa stringa."""
    if tipo == "dialogo":
        return parlante
    if tipo in ("descrizione", "posto", "testo"):
        return "narratore"  # una scritta, un biglietto: la legge il narratore
    return attribuzione  # messaggi e finali: a chi parla lo dice una tabella, o resta da decidere


def per_la_voce(t, suggerimento=False):
    """Il testo derivato per la voce: maiuscole abbassate, iniziali a posto."""
    t = t.replace("\\n", " ").replace("\n", " ")

    def basso(m):
        w = m.group(0)
        return w.title() if w in NOMI else w.lower()

    t = re.sub(r"\b[A-ZÀ-ÖØ-Þ]{2,}\b", basso, t)
    t = re.sub(r"\s+", " ", t).strip()
    if suggerimento:
        t = t[:1].upper() + t[1:]
        if not re.search(r"[.!?…]$", t):
            t += "."
    t = re.sub(r"(^|[.!?…]\s+)([a-zà-ÿ])", lambda m: m.group(1) + m.group(2).upper(), t)
    return t[:1].upper() + t[1:] if t else t


def parti_di_una_stringa(tipo, parlante, testo, attribuzione=None):
    """Lista di (voce, testo_grezzo, testo_per_la_voce). Controlla di non perdere niente."""
    voce_citazioni = tipo_di_voce(tipo, parlante, attribuzione)
    # una lista di voci (doppiaggio/attribuzioni.json) assegna le frasi tra «» una per una, nell'ordine
    elenco = iter(voce_citazioni) if isinstance(voce_citazioni, list) else None
    # Se le parole tra «» le dice il narratore (il biglietto, una targa) non si staccano dalla frase:
    # «…e dice una cosa sola: «Non è il caso di tornare.»» si legge d'un fiato.
    stacco = r"(\([^)]*\))" if voce_citazioni == "narratore" else r"(\([^)]*\)|«[^»]*»)"
    parti = []
    for _, seg in segmenti_condizionali(testo):
        for blocco in re.split(r"\\n|\n", seg):
            for pezzo in re.split(stacco, blocco):
                grezzo = pezzo.strip()
                if not grezzo:
                    continue
                if grezzo.startswith("("):
                    voce, t, sugg = "servizio", grezzo[1:-1].strip(), True
                elif grezzo.startswith("«"):
                    voce = next(elenco, "?") if elenco is not None else (voce_citazioni or "?")
                    t, sugg = grezzo[1:-1].strip(), False
                else:
                    voce, t, sugg = "narratore", grezzo.replace("«", "").replace("»", ""), False
                if not re.search(r"[A-Za-zÀ-ÿ0-9]", t):
                    continue
                parti.append((voce, grezzo, per_la_voce(t, sugg)))
    # niente deve andare perso: le parti, contando solo lettere e cifre (una scelta muta come «…»
    # non ha niente da dire), rifanno la stringa
    togli = lambda s: re.sub(r"[\W_]+", "", re.sub(r"\[se [^\]]*\]|\[fine\]|\\n", "", s))
    if togli("".join(g for _, g, _ in parti)) != togli(testo):
        raise SystemExit("le parti non rifanno il testo:\n  %s" % testo)
    return parti


def scomponi_dinamico(t):
    """«Hai [acqua] d'acqua e [cibo] di cibo.» → i pezzi con un solo segnaposto ciascuno."""
    m = re.match(r"^(.*?\[\w+\][^\[\]]*?) e (\[\w+\].*)$", t)
    return [m.group(1) + ",", "e " + m.group(2)] if m else [t]


def riempi(pezzo):
    """Un pezzo con un segnaposto → i suoi testi parlati, uno per valore."""
    m = re.search(r"\[(\w+)\]", pezzo)
    if not m or m.group(1) not in VALORI:
        return None
    return [(v, pezzo.replace(m.group(0), NUMERI[v])) for v in VALORI[m.group(1)]], m.group(1)


# ---------------------------------------------------------------------------------------
# 3. Tutto il gioco → parti, blocchi per voce, manifest
# ---------------------------------------------------------------------------------------

def impronta(voce, testo):
    return hashlib.sha1((voce + "\n" + testo).encode("utf-8")).hexdigest()[:8]


def carica_attribuzioni():
    if os.path.exists(ATTRIBUZIONI):
        with open(ATTRIBUZIONI, encoding="utf-8") as f:
            return json.load(f)
    return {}


def costruisci(zona):
    nome_file = ZONE[zona]
    attrib = carica_attribuzioni()
    ok, scartate = stringhe_del_file(nome_file)
    unita = OrderedDict()   # id -> {voce, testo, fonti, ...}
    stringhe = []           # i testi del gioco con le parti che li compongono
    da_attribuire = []
    dinamici = OrderedDict()

    def aggiungi(voce, testo, fonte, extra=None):
        i = impronta(voce, testo)
        u = unita.setdefault(i, {"voce": voce, "zona": zona, "testo": testo,
                                 "parole": parole(testo), "fonti": []})
        if extra:
            u.update(extra)
        if fonte not in u["fonti"]:
            u["fonti"].append(fonte)
        return i

    for riga, tipo, parlante, testo in ok:
        chiave = "%s:%d" % (nome_file, riga)
        parti = parti_di_una_stringa(tipo, parlante, testo, attrib.get(chiave))
        ids = []
        for k, (voce, grezzo, t) in enumerate(parti):
            if voce == "?":
                da_attribuire.append((chiave, t))
            if tipo == "opzione":
                voce = "narratore"  # le scelte del giocatore (in prima persona) le legge il narratore
            fonte = {"file": nome_file, "riga": riga, "tipo": tipo, "parte": k}
            if "[" in t:
                sotto = []
                for pz in scomponi_dinamico(t):
                    esito = riempi(pz)
                    if esito is None:
                        dinamici[pz] = chiave
                        sotto.append({"modello": pz, "valori": None})
                        continue
                    valori, nome = esito
                    ids_v = {v: aggiungi(voce, parlato, fonte, {"numero": nome}) for v, parlato in valori}
                    sotto.append({"modello": pz, "segnaposto": nome, "id_per_valore": ids_v})
                ids.append({"dinamico": sotto})
            else:
                ids.append(aggiungi(voce, t, fonte))
        stringhe.append({"file": nome_file, "riga": riga, "tipo": tipo, "parlante": parlante,
                         "origine": testo, "parti": ids})
    return {"zona": zona, "file": nome_file, "unita": unita, "stringhe": stringhe,
            "da_attribuire": da_attribuire, "dinamici": dinamici, "scartate": scartate}


def costruisci_tutto():
    """Le nove zone insieme: una parte con lo stesso testo e la stessa voce è una sola, anche
    se compare in zone diverse («Basta così.», «Torno a vedere cos'hai.»)."""
    tutto = {"unita": OrderedDict(), "stringhe": [], "da_attribuire": [], "dinamici": OrderedDict()}
    for zona in ZONE:
        z = costruisci(zona)
        for i, u in z["unita"].items():
            if i in tutto["unita"]:
                for f in u["fonti"]:
                    if f not in tutto["unita"][i]["fonti"]:
                        tutto["unita"][i]["fonti"].append(f)
            else:
                tutto["unita"][i] = u
        tutto["stringhe"] += z["stringhe"]
        tutto["da_attribuire"] += z["da_attribuire"]
        tutto["dinamici"].update(z["dinamici"])
    stili, toni = carica_toni()
    tutto["stili"] = stili
    for u in tutto["unita"].values():
        u["categoria"] = categoria_di(u)
        tono = toni.get(u["voce"], {}).get(u["testo"])
        if tono:
            u["tono"] = tono
    return tutto


def carica_toni():
    """(stili, {personaggio: {testo: tono}}) da doppiaggio/toni.json: il tono di ogni battuta, ricavato
    dal contesto in cui si dice (chi parla, a chi, che cosa è appena successo)."""
    if not os.path.exists(TONI):
        return {}, {}
    with open(TONI, encoding="utf-8") as f:
        d = json.load(f)
    return d["stili"], {v: {x: tono for tono, x in righe} for v, righe in d["personaggi"].items()}


def categoria_di(u):
    """Che cosa è una parte, a prescindere da chi la dice: serve a decidere come il gioco la usa.
    «scelta» = una frase che il giocatore può dire (un'opzione di dialogo), in prima persona;
    «suggerimento» = ciò che il gioco gli dice tra parentesi; «numeri» = un pezzo con un numero."""
    if u.get("numero"):
        return "numeri"
    tipi = {f["tipo"] for f in u["fonti"]}
    if tipi == {"opzione"}:
        return "scelta"
    if u["voce"] == "servizio":
        return "suggerimento"
    return "testo"


def minuti_dei(voce, lista):
    return sum(minuti_di(voce, u["parole"]) for _, u in lista)


def dividi_in_parti_uguali(lista, voce, massimo):
    """Divide una lista di (id, parte) in blocchi di circa lo stesso peso, sotto il massimo."""
    totale = minuti_dei(voce, lista)
    n = max(1, math.ceil(totale / massimo))
    bersaglio = totale / n
    blocchi, corrente, peso = [], [], 0.0
    for i, u in lista:
        m = minuti_di(voce, u["parole"])
        if corrente and peso + m > bersaglio * 1.15 and len(blocchi) < n - 1:
            blocchi.append(corrente)
            corrente, peso = [], 0.0
        corrente.append((i, u))
        peso += m
    blocchi.append(corrente)
    return blocchi


def spezza_in_blocchi(lista, voce, massimo):
    """Il minor numero di blocchi sotto il massimo, tagliati dove cambia la zona (un taglio
    fra due generazioni si sente meno al confine di una zona); una zona più lunga del
    massimo si taglia dentro, in parti uguali."""
    if minuti_dei(voce, lista) <= massimo:
        return [lista]
    per_zona = OrderedDict()
    for i, u in lista:
        per_zona.setdefault(u["zona"], []).append((i, u))
    blocchi, corrente = [], []
    for g in per_zona.values():
        m = minuti_dei(voce, g)
        if m > massimo:
            if corrente:
                blocchi.append(corrente)
                corrente = []
            blocchi += dividi_in_parti_uguali(g, voce, massimo)
        elif corrente and minuti_dei(voce, corrente) + m > massimo:
            blocchi.append(corrente)
            corrente = list(g)
        else:
            corrente += g
    if corrente:
        blocchi.append(corrente)
    return blocchi


def blocchi_generati(unita):
    """{nome: (gruppo, voce, [id,…])} dai file di doppiaggio/generati/: i blocchi com'erano quando
    sono stati incollati in AI Studio. Sono l'audio che esiste: non si riorganizzano mai, anche se
    cambiano le stime; un testo che cambia nel gioco si riconosce perché il suo id non c'è più."""
    voci = {slug(u["voce"]): u["voce"] for u in unita.values()}
    out = OrderedDict()
    if not os.path.isdir(GENERATI):
        return out
    for f in sorted(os.listdir(GENERATI)):
        if not f.endswith(".txt"):
            continue
        nome = f[:-4]
        gruppo = re.sub(r"-[a-z]$", "", nome)
        voce = voci.get(gruppo.removesuffix("-scelte"))
        if voce is None:
            continue
        with open(os.path.join(GENERATI, f), encoding="utf-8") as fh:
            testi = [r.rstrip("\n").removesuffix(" " + PAUSA) for r in fh
                     if r.strip() and not r.startswith(INTESTAZIONE)]
        out[nome] = (gruppo, voce, [impronta(voce, x) for x in testi])
    return out


def blocchi_per_voce(unita, massimo=None):
    """(da_generare, generati): i blocchi nuovi, per le parti che non hanno ancora un audio, e
    quelli già generati. Una voce per volta, nell'ordine del gioco; i numeri della voce di
    servizio vengono dopo i suoi testi fissi."""
    # le scelte del giocatore, anche se le dice il narratore, sono un blocco a parte: parlano in
    # prima persona e si possono provare e rifare senza toccare la narrazione
    def gruppo(u):
        return u["voce"] + ("-scelte" if u["categoria"] == "scelta" else "")

    gruppi = []
    for u in unita.values():
        if u["voce"] != "?" and gruppo(u) not in gruppi:
            gruppi.append(gruppo(u))
    prime = [g for g in ("narratore", "narratore-scelte", "servizio") if g in gruppi]
    gruppi = prime + [g for g in gruppi if g not in prime]
    generati = blocchi_generati(unita)
    coperte = {i for _, _, ids in generati.values() for i in ids}
    for nome, (_, _, ids) in generati.items():
        for i in ids:
            if i in unita:
                unita[i]["blocco"] = nome
    out = OrderedDict()
    for g in gruppi:
        lista = [(i, u) for i, u in unita.items()
                 if u["voce"] != "?" and gruppo(u) == g and i not in coperte]
        if not lista:
            continue
        voce = lista[0][1]["voce"]
        if voce == "servizio":
            lista = ([x for x in lista if not x[1].get("numero")]
                     + [x for x in lista if x[1].get("numero")])
        if any(u.get("tono") for _, u in lista):
            ordine = []
            for _, u in lista:
                if u.get("tono") not in ordine:
                    ordine.append(u.get("tono"))
            lista = sorted(lista, key=lambda x: ordine.index(x[1].get("tono")))
        tetto = massimo if massimo else MAX_MINUTI.get(g, MAX_MINUTI.get(voce, MAX_MINUTI["_"]))
        parti = spezza_in_blocchi(lista, voce, tetto)
        gia = sum(1 for gg, _, _ in generati.values() if gg == slug(g))
        for k, p in enumerate(parti):
            suff = "" if (len(parti) == 1 and not gia) else "-" + "abcdefghijklmnopqrstuvwxyz"[gia + k]
            out[slug(g) + suff] = [i for i, _ in p]
            for i, _ in p:
                unita[i]["blocco"] = slug(g) + suff
    return out, generati


def durata_blocco(unita, ids):
    return minuti_dei(unita[ids[0]]["voce"], [(i, unita[i]) for i in ids])


def testo_del_blocco(unita, ids, stili):
    """Il file di un blocco. Una parte per riga, con <long pause> fra l'una e l'altra. Se le parti hanno
    un tono, stanno in gruppi, ognuno sotto un'intestazione «### tono — style: …»: in AI Studio ogni
    gruppo è un blocco di parlato, col suo stile; l'intestazione non si incolla."""
    righe = []
    gruppi = []
    for i in ids:
        tono = unita[i].get("tono")
        if not gruppi or gruppi[-1][0] != tono:
            gruppi.append((tono, []))
        gruppi[-1][1].append(unita[i]["testo"])
    for g, (tono, testi) in enumerate(gruppi):
        if tono:
            righe.append("%s %s — style: %s" % (INTESTAZIONE, tono, stili.get(tono, "")))
        ultimo_gruppo = g == len(gruppi) - 1
        for k, x in enumerate(testi):
            ultima = k == len(testi) - 1
            righe.append(x + ("" if ultima and (ultimo_gruppo or tono) else " " + PAUSA))
        if tono and not ultimo_gruppo:
            righe.append("")
    return "\n".join(righe) + "\n"


def scrivi_toni(tutto):
    """doppiaggio/toni-personaggi.md: il tono di ogni battuta, da rileggere e correggere."""
    unita = tutto["unita"]
    stili = tutto.get("stili", {})
    per = OrderedDict()
    for u in unita.values():
        if u.get("tono"):
            per.setdefault(u["voce"], []).append(u)
    righe = ["# I toni dei personaggi", "",
             "> Il tono di ogni battuta è ricavato dal contesto in cui si dice (chi parla, a chi, che cosa è",
             "> appena successo). Si corregge in `toni.json`, poi `python strumenti/doppiaggio.py blocchi`",
             "> riscrive i blocchi. In AI Studio ogni tono è un blocco di parlato con il suo stile.", "",
             "| Tono | Stile (da incollare in inglese) |", "|---|---|"]
    righe += ["| %s | %s |" % (k, v) for k, v in stili.items()]
    for voce, us in per.items():
        toni = []
        for u in us:
            if u["tono"] not in toni:
                toni.append(u["tono"])
        righe += ["", "## %s — %d battute, %d toni" % (voce, len(us), len(toni)), "",
                  "| # | Tono | Battuta |", "|---|---|---|"]
        for k, u in enumerate(us, 1):
            righe.append("| %d | %s | %s |" % (k, u["tono"], u["testo"].replace("|", "/")))
    with open(os.path.join(CARTELLA, "toni-personaggi.md"), "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(righe) + "\n")


def scrivi(tutto, blocchi, generati, solo_voce=None):
    cartella = os.path.join(CARTELLA, "blocchi")
    os.makedirs(cartella, exist_ok=True)
    unita = tutto["unita"]
    if solo_voce is None:
        for vecchio in os.listdir(cartella):
            if vecchio.endswith(".txt"):
                os.remove(os.path.join(cartella, vecchio))
    for nome, ids in blocchi.items():
        if solo_voce and not (nome == slug(solo_voce) or nome.startswith(slug(solo_voce) + "-")):
            continue
        with open(os.path.join(cartella, nome + ".txt"), "w", encoding="utf-8", newline="\n") as f:
            f.write(testo_del_blocco(unita, ids, tutto.get("stili", {})))
    scrivi_toni(tutto)
    manifest = {
        "blocchi": {**{n: {"voce": v, "generato": True,
                           "minuti_stimati": round(minuti_dei(v, [(i, unita[i]) for i in ids if i in unita]), 1),
                           "parti": [i for i in ids if i in unita],
                           "fuori_uso": [i for i in ids if i not in unita]}
                       for n, (_, v, ids) in generati.items()},
                    **{n: {"voce": unita[ids[0]]["voce"], "generato": False,
                           "minuti_stimati": round(durata_blocco(unita, ids), 1), "parti": ids}
                       for n, ids in blocchi.items()}},
        "unita": unita, "stringhe": tutto["stringhe"],
        "da_attribuire": tutto["da_attribuire"],
        "dinamici_non_scomposti": tutto["dinamici"],
    }
    with open(os.path.join(CARTELLA, "manifest.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)
        f.write("\n")


def descrizioni_delle_voci():
    """{nome minuscolo: (titolo, descrizione)} da doppiaggio/voci.md: i paragrafi «> …» sotto ogni «### Nome …»."""
    voci = OrderedDict()
    corrente = None
    with open(os.path.join(CARTELLA, "voci.md"), encoding="utf-8") as f:
        for r in f:
            r = r.rstrip("\n")
            if r.startswith("## "):
                corrente = None
            elif r.startswith("### "):
                corrente = slug(r[4:].split()[0])
                voci[corrente] = [r[4:], []]
            elif r.startswith("> ") and corrente:
                voci[corrente][1].append(r[2:])
    return {k: (v[0], " ".join(v[1])) for k, v in voci.items()}


def scrivi_da_fare(tutto, blocchi, generati):
    """doppiaggio/DA-FARE/: una copia di ogni blocco ancora da generare, con un nome che non si confonde
    con gli altri file e, in testa, tutto ciò che serve per farlo (voce, descrizione). Le righe «###»
    non si incollano. La cartella si rifà da zero a ogni comando."""
    cartella = os.path.join(CARTELLA, "DA-FARE")
    os.makedirs(cartella, exist_ok=True)
    for vecchio in os.listdir(cartella):
        os.remove(os.path.join(cartella, vecchio))
    unita = tutto["unita"]
    voci = descrizioni_delle_voci()
    for n, (nome, ids) in enumerate(blocchi.items(), 1):
        voce = unita[ids[0]]["voce"]
        gia = [g for g, (_, v, _) in generati.items() if v == voce]
        titolo, descr = voci.get(slug(voce), (voce, ""))
        ritocco = bool(gia)
        testo = [
            "%s ============================================================" % INTESTAZIONE,
            "%s DA FARE %d di %d — %s%s" % (INTESTAZIONE, n, len(blocchi), voce.upper(),
                                            (" — SOLO %d %s DA RIFARE" % (len(ids), "RIGA" if len(ids) == 1 else "RIGHE"))
                                            if ritocco else ""),
            "%s %d %s, %s. Le righe che cominciano con %s non si incollano." % (
                INTESTAZIONE, len(ids), "riga" if len(ids) == 1 else "righe",
                "meno di un minuto" if durata_blocco(unita, ids) < 1 else "circa %.0f minuti" % durata_blocco(unita, ids),
                INTESTAZIONE),
        ]
        if ritocco:
            testo.append("%s USA LA STESSA voce di libreria e la STESSA descrizione del blocco già fatto (%s)." % (
                INTESTAZIONE, ", ".join(gia)))
        else:
            testo.append("%s Voce di libreria: scegline una adatta al personaggio (%s)." % (INTESTAZIONE, titolo))
        testo += [
            "%s Descrizione (campo accanto alla voce): %s" % (INTESTAZIONE, descr),
            "%s Se sotto ci sono gruppi «### tono — style: …»: un blocco di parlato per gruppo, e nel campo "
            "descrizione + « Delivery: <style>.» (il tono «calmo» è quello di base)." % INTESTAZIONE,
            "%s ============================================================" % INTESTAZIONE, ""]
        corpo = testo_del_blocco(unita, ids, tutto.get("stili", {}))
        nome_file = "DA-FARE-%d-%s%s.txt" % (n, slug(voce).upper(), "-RITOCCO" if ritocco else "")
        with open(os.path.join(cartella, nome_file), "w", encoding="utf-8", newline="\n") as f:
            f.write("\n".join(testo) + corpo)
        print("DA-FARE/%s" % nome_file)


def riepilogo(tutto, blocchi, generati):
    unita = tutto["unita"]
    per = OrderedDict()
    for u in unita.values():
        r = per.setdefault(u["voce"], [0, 0])
        r[0] += 1
        r[1] += u["parole"]
    print("%-12s %6s %7s %8s  blocchi (minuti stimati)" % ("voce", "parti", "parole", "minuti"))
    for voce, (n, p) in per.items():
        lista = [(i, u) for i, u in unita.items() if u["voce"] == voce]
        mie = [(nome, durata_blocco(unita, ids)) for nome, ids in blocchi.items()
               if unita[ids[0]]["voce"] == voce]
        gia = [nome for nome, (_, v, _) in generati.items() if v == voce]
        con_audio = sum(1 for i, u in lista if u.get("blocco") in gia)
        stato = ("GENERATO (%s)" % ", ".join(gia)) if gia and not mie else ""
        da_fare = ("da generare: " + ", ".join("%s %.1f min" % x for x in mie)) if mie else ""
        print("%-12s %6d %7d %8.1f  %s" % (voce, n, p, minuti_dei(voce, lista),
              " ".join(x for x in (stato, da_fare) if x) or "(non si registra: da attribuire)"))
        if gia and mie:
            print("%-12s %6s %7s %8s  (già generate: %d parti su %d, nei blocchi %s)" % (
                "", "", "", "", con_audio, n, ", ".join(gia)))
    for nome, ids in blocchi.items():
        m = durata_blocco(unita, ids)
        if m > 9.5:
            print("ATTENZIONE: %s dura circa %.1f minuti: il tetto del servizio è 10,9 e la stima è incerta" % (nome, m))
    senza = [u for u in unita.values() if u["voce"] not in ("narratore", "servizio", "?")
             and tutto.get("stili") and not u.get("tono")]
    if senza:
        print("PERSONAGGI SENZA TONO: %d battute (aggiungile a doppiaggio/toni.json)" % len(senza))
    if tutto["da_attribuire"]:
        print("DA ATTRIBUIRE: %d frasi tra «» di cui non si sa chi parla" % len(tutto["da_attribuire"]))
    if tutto["dinamici"]:
        print("dinamici non scomposti:", len(tutto["dinamici"]))
        for t, k in list(tutto["dinamici"].items())[:6]:
            print("   ", k, t[:70])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("comando", choices=["stato", "blocchi", "da-fare"])
    ap.add_argument("--voce", help="scrive solo i blocchi di questa voce o di questo blocco "
                                   "(servizio, narratore, narratore-scelte, Nunzio…)")
    ap.add_argument("--max-minuti", type=float, help="tetto di un blocco, al posto di quello predefinito")
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")
    tutto = costruisci_tutto()
    blocchi, generati = blocchi_per_voce(tutto["unita"], a.max_minuti)
    if a.comando == "blocchi":
        scrivi(tutto, blocchi, generati, a.voce)
    if a.comando == "da-fare":
        scrivi_da_fare(tutto, blocchi, generati)
    riepilogo(tutto, blocchi, generati)
    riserva = [(n, len([i for i in ids if i not in tutto["unita"]])) for n, (_, _, ids) in generati.items()]
    riserva = [(n, k) for n, k in riserva if k]
    if riserva:
        print("audio generato ma non più nel gioco (di riserva, o da rifare se il testo è cambiato): " +
              ", ".join("%s %d parti" % x for x in riserva))


if __name__ == "__main__":
    main()
