"""Il doppiaggio del Viaggiatore: dai testi dei .fav ai blocchi da dare alla voce.

Legge i sorgenti .fav (come mappa-narrativa.py: serve sapere in quale FILE, cioè in quale
zona, è scritto ogni testo), li spezza nelle PARTI che hanno una voce sola e scrive:

  doppiaggio/blocchi/<zona>-<voce>[-a|-b].txt   il testo da incollare nell'editor di AI Studio:
                                                una parte per riga, `<long pause>` fra l'una e l'altra
  doppiaggio/manifest/<zona>.json               per ogni parte: id, voce, testo, da dove viene;
                                                per ogni testo del gioco: da quali parti si compone

Le VOCI sono tre tipi: il narratore (tutto ciò che sta fuori dalle virgolette e dalle
parentesi, più le frasi scritte: il biglietto, le targhe), la voce di servizio (i suggerimenti
tra parentesi e le opzioni di dialogo che il giocatore sceglie) e i personaggi (le battute
tra «caporali» di un dialogo). Il giocatore non ha voce.

Il testo per la voce NON cambia il gioco: è derivato. Le parole in MAIUSCOLO (NORD, PARLA CON…)
si abbassano, perché la voce le leggerebbe come enfasi. L'id di una parte è l'impronta (SHA-1)
di voce + testo: se un testo del gioco cambia, cambia l'id e l'audio vecchio si riconosce.

I testi con numeri dentro ([acqua], [cibo]) non si possono registrare interi: si spezzano nei
pezzi «Hai sette d'acqua,» / «e tre di cibo.» (uno per ogni valore) e il gioco li ricompone.

Uso:  python strumenti/doppiaggio.py stato                 (conti per zona e per voce)
      python strumenti/doppiaggio.py blocchi z1            (scrive blocchi e manifest della zona)
      python strumenti/doppiaggio.py blocchi z1 --max-minuti 5
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
MAX_MINUTI = 6.5  # il tetto del servizio è ~11 minuti a richiesta: si sta larghi, per non perdere righe

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
# 3. Una zona → parti, blocchi, manifest
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
        u = unita.setdefault(i, {"voce": voce, "testo": testo, "parole": parole(testo), "fonti": []})
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
            fonte = {"riga": riga, "tipo": tipo, "parte": k}
            if "[" in t:
                pezzi = scomponi_dinamico(t)
                sotto = []
                for pz in pezzi:
                    esito = riempi(pz)
                    if esito is None:
                        dinamici[pz] = chiave
                        sotto.append({"modello": pz, "valori": None})
                        continue
                    valori, nome = esito
                    ids_v = {}
                    for v, parlato in valori:
                        ids_v[v] = aggiungi(voce, parlato, fonte, {"numero": nome})
                    sotto.append({"modello": pz, "segnaposto": nome, "id_per_valore": ids_v})
                ids.append({"dinamico": sotto})
            else:
                ids.append(aggiungi(voce, t, fonte))
        stringhe.append({"riga": riga, "tipo": tipo, "parlante": parlante, "origine": testo, "parti": ids})
    return {"zona": zona, "file": nome_file, "unita": unita, "stringhe": stringhe,
            "da_attribuire": da_attribuire, "dinamici": dinamici, "scartate": scartate}


def dividi(lista, massimo):
    """Divide una lista di (id, minuti) in blocchi di circa lo stesso peso, sotto il massimo."""
    totale = sum(p for _, p in lista)
    n = max(1, math.ceil(totale / massimo))
    bersaglio = totale / n
    blocchi, corrente, peso = [], [], 0
    for item in lista:
        if corrente and peso + item[1] > bersaglio * 1.15 and len(blocchi) < n - 1:
            blocchi.append(corrente)
            corrente, peso = [], 0
        corrente.append(item)
        peso += item[1]
    blocchi.append(corrente)
    return blocchi


def gruppi_di_blocchi(z, massimo):
    """{nome_blocco: [id,…]}: un blocco per voce; i numeri della voce di servizio a parte."""
    per_voce = OrderedDict()
    for i, u in z["unita"].items():
        nome = u["voce"] + ("-numeri" if u.get("numero") else "")
        per_voce.setdefault(nome, []).append((i, minuti_di(u["voce"], u["parole"])))
    out = OrderedDict()
    for nome, lista in per_voce.items():
        parti = dividi(lista, massimo)
        for k, p in enumerate(parti):
            suff = "" if len(parti) == 1 else "-" + "abcdefghij"[k]
            out["%s-%s%s" % (zona_di(z), slug(nome), suff)] = [i for i, _ in p]
    return out


def zona_di(z):
    return z["zona"]


def scrivi(z, massimo):
    blocchi = gruppi_di_blocchi(z, massimo)
    os.makedirs(os.path.join(CARTELLA, "blocchi"), exist_ok=True)
    os.makedirs(os.path.join(CARTELLA, "manifest"), exist_ok=True)
    for nome, ids in blocchi.items():
        righe = [z["unita"][i]["testo"] for i in ids]
        testo = "".join(r + ((" " + PAUSA + "\n") if k < len(righe) - 1 else "\n")
                        for k, r in enumerate(righe))
        with open(os.path.join(CARTELLA, "blocchi", nome + ".txt"), "w", encoding="utf-8", newline="\n") as f:
            f.write(testo)
    manifest = {
        "zona": z["zona"], "file": z["file"],
        "blocchi": {n: {"voce": z["unita"][ids[0]]["voce"], "parti": ids} for n, ids in blocchi.items()},
        "unita": z["unita"], "stringhe": z["stringhe"],
        "da_attribuire": z["da_attribuire"],
        "dinamici_non_scomposti": z["dinamici"],
    }
    with open(os.path.join(CARTELLA, "manifest", z["zona"] + ".json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)
        f.write("\n")
    return blocchi


def riepilogo(z, blocchi):
    per = defaultdict(lambda: [0, 0, 0.0])
    for u in z["unita"].values():
        nome = u["voce"] + (" (numeri)" if u.get("numero") else "")
        per[nome][0] += 1
        per[nome][1] += u["parole"]
        per[nome][2] += minuti_di(u["voce"], u["parole"])
    print("%-8s %-22s %6s %7s %8s" % ("zona", "voce", "parti", "parole", "minuti"))
    for nome, (n, p, m) in per.items():
        print("%-8s %-22s %6d %7d %8.1f" % (z["zona"], nome, n, p, m))
    if blocchi:
        print("blocchi:", ", ".join("%s(%d)" % (n, len(i)) for n, i in blocchi.items()))
    if z["da_attribuire"]:
        print("DA ATTRIBUIRE (frasi tra «» di cui non si sa chi parla):")
        for k, t in z["da_attribuire"]:
            print("   ", k, t[:70])
    if z["dinamici"]:
        print("dinamici non scomposti:", len(z["dinamici"]))
        for t, k in list(z["dinamici"].items())[:6]:
            print("   ", k, t[:70])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("comando", choices=["stato", "blocchi"])
    ap.add_argument("zona", nargs="?", choices=list(ZONE))
    ap.add_argument("--max-minuti", type=float, default=MAX_MINUTI)
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")
    if a.comando == "stato":
        for zona in ([a.zona] if a.zona else ZONE):
            z = costruisci(zona)
            riepilogo(z, gruppi_di_blocchi(z, a.max_minuti))
    else:
        if not a.zona:
            ap.error("serve la zona (per esempio z1)")
        z = costruisci(a.zona)
        blocchi = scrivi(z, a.max_minuti)
        riepilogo(z, blocchi)


if __name__ == "__main__":
    main()
