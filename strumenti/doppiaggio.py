"""Il doppiaggio del Viaggiatore: dai testi dei .fav ai blocchi da dare alla voce.

Legge i sorgenti .fav (come mappa-narrativa.py: serve sapere in quale FILE, cioè in quale
zona, è scritto ogni testo), li spezza nelle PARTI che hanno una voce sola e scrive:

  doppiaggio/blocchi/<voce>[-a|-b].txt   il testo da incollare nell'editor di AI Studio:
                                         una parte per riga, `<long pause>` fra l'una e l'altra
  doppiaggio/manifest.json               per ogni parte: id, voce, testo, da dove viene;
                                         per ogni testo del gioco: da quali parti si compone;
                                         per ogni blocco: l'ordine delle parti

Le VOCI sono tre tipi: il narratore (tutto ciò che sta fuori dalle virgolette e dalle
parentesi, più le frasi scritte: il biglietto, le targhe), la voce di servizio (i suggerimenti
tra parentesi e le opzioni di dialogo che il giocatore sceglie) e i personaggi (le battute
tra «caporali» di un dialogo). Il giocatore non ha voce.

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
RITMO = {"narratore": 125, "servizio": 150}
RITMO_PERSONAGGI = 90
SECONDI_DI_PAUSA = 1.0  # presunti, per <long pause>: si misurano sul primo blocco vero
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
    return n_parole / ritmo + SECONDI_DI_PAUSA / 60


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
                    voce, t, sugg = voce_citazioni or "?", grezzo[1:-1].strip(), False
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
                voce = "servizio"  # le scelte del giocatore le legge la voce di servizio
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
    return tutto


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


def blocchi_per_voce(unita, massimo=None):
    """{nome_blocco: [id,…]}: una voce per volta, nell'ordine del gioco. I numeri della voce
    di servizio vengono dopo i suoi testi fissi."""
    voci = []
    for u in unita.values():
        if u["voce"] != "?" and u["voce"] not in voci:
            voci.append(u["voce"])
    voci = ([v for v in ("narratore", "servizio") if v in voci]
            + [v for v in voci if v not in ("narratore", "servizio")])
    out = OrderedDict()
    for voce in voci:
        lista = [(i, u) for i, u in unita.items() if u["voce"] == voce]
        if voce == "servizio":
            lista = ([x for x in lista if not x[1].get("numero")]
                     + [x for x in lista if x[1].get("numero")])
        tetto = massimo if massimo else MAX_MINUTI.get(voce, MAX_MINUTI["_"])
        parti = spezza_in_blocchi(lista, voce, tetto)
        for k, p in enumerate(parti):
            suff = "" if len(parti) == 1 else "-" + "abcdefghij"[k]
            out[slug(voce) + suff] = [i for i, _ in p]
    return out


def durata_blocco(unita, ids):
    return minuti_dei(unita[ids[0]]["voce"], [(i, unita[i]) for i in ids])


def scrivi(tutto, blocchi, solo_voce=None):
    cartella = os.path.join(CARTELLA, "blocchi")
    os.makedirs(cartella, exist_ok=True)
    unita = tutto["unita"]
    if solo_voce is None:
        for vecchio in os.listdir(cartella):
            if vecchio.endswith(".txt"):
                os.remove(os.path.join(cartella, vecchio))
    for nome, ids in blocchi.items():
        if solo_voce and unita[ids[0]]["voce"] != solo_voce:
            continue
        righe = [unita[i]["testo"] for i in ids]
        testo = "".join(r + ((" " + PAUSA + "\n") if k < len(righe) - 1 else "\n")
                        for k, r in enumerate(righe))
        with open(os.path.join(cartella, nome + ".txt"), "w", encoding="utf-8", newline="\n") as f:
            f.write(testo)
    manifest = {
        "blocchi": {n: {"voce": unita[ids[0]]["voce"], "minuti_stimati": round(durata_blocco(unita, ids), 1),
                        "parti": ids} for n, ids in blocchi.items()},
        "unita": unita, "stringhe": tutto["stringhe"],
        "da_attribuire": tutto["da_attribuire"],
        "dinamici_non_scomposti": tutto["dinamici"],
    }
    with open(os.path.join(CARTELLA, "manifest.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)
        f.write("\n")


def riepilogo(tutto, blocchi):
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
        print("%-12s %6d %7d %8.1f  %s" % (voce, n, p, minuti_dei(voce, lista),
              ", ".join("%s %.1f" % x for x in mie) or "(non si registra: da attribuire)"))
    for nome, ids in blocchi.items():
        m = durata_blocco(unita, ids)
        if m > 9.5:
            print("ATTENZIONE: %s dura circa %.1f minuti: il tetto del servizio è 10,9 e la stima è incerta" % (nome, m))
    if tutto["da_attribuire"]:
        print("DA ATTRIBUIRE: %d frasi tra «» di cui non si sa chi parla" % len(tutto["da_attribuire"]))
    if tutto["dinamici"]:
        print("dinamici non scomposti:", len(tutto["dinamici"]))
        for t, k in list(tutto["dinamici"].items())[:6]:
            print("   ", k, t[:70])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("comando", choices=["stato", "blocchi"])
    ap.add_argument("--voce", help="scrive solo i blocchi di questa voce (servizio, narratore, Nunzio…)")
    ap.add_argument("--max-minuti", type=float, help="tetto di un blocco, al posto di quello predefinito")
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")
    tutto = costruisci_tutto()
    blocchi = blocchi_per_voce(tutto["unita"], a.max_minuti)
    if a.comando == "blocchi":
        scrivi(tutto, blocchi, a.voce)
    riepilogo(tutto, blocchi)


if __name__ == "__main__":
    main()
