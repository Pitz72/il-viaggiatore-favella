#!/usr/bin/env python3
"""Scansione meccanica di una traduzione inglese: igiene e schemi da modello (LLM).

Non giudica lo stile e non trova da sola i calchi: mette in fila i sospetti che una macchina vede bene
(trattini, parole da elenco dei modelli, contrasti «non X ma Y», americanismi in un testo britannico,
falsi amici, caratteri invisibili, formule che tornano), così che la lettura integrale di chi verifica
possa concentrarsi sul resto. Ogni segnalazione è un'IPOTESI da leggere nel contesto.

Uso:
  python scansione.py FILE [FILE ...] [--campo en] [--varieta br|am|nessuna] [--max 8]
                      [--ignora REGEX] [--soglia-ngram 5]

FILE può essere:
  - un JSON con una lista di oggetti (si legge il campo --campo, di solito "en"; l'id è NOME.n, n da 1);
  - un JSON con un oggetto chiave→testo (l'id è la chiave);
  - un file di testo o Markdown (l'id è NOME:riga).
Con --ignora si toglie dal testo, prima della scansione, ciò che combacia con la REGEX (per esempio
i segnaposto del gioco: '\\[[^\\]]*\\]').
"""
import argparse
import collections
import json
import re
import sys
import unicodedata
from pathlib import Path

# ── elenchi ────────────────────────────────────────────────────────────────────────────────────────

# parole e formule che i modelli usano molto più delle persone (Wikipedia, «Signs of AI writing»; skill humanizer)
PAROLE_MODELLO = [
    "actually", "additionally", "align with", "bolstered", "crucial", "deep dive", "delve", "enduring", "enhance",
    "garner", "highlighting", "interplay", "intricate", "intricacies", "landscape", "meticulous", "meticulously",
    "pivotal", "quietly", "robust", "showcase", "showcasing", "tapestry", "testament", "underscore", "underscores",
    "vibrant", "stands as", "serves as", "plays a key role", "it's worth noting", "in conclusion", "moreover",
    "furthermore", "a testament to", "rich tapestry", "nestled", "breathtaking",
]

# formule da «sceneggiatura» del discorso
STAGING = [
    r"let'?s dive", r"let'?s explore", r"here'?s the thing", r"here'?s what", r"let that sink in", r"read that again",
    r"real talk", r"to be clear", r"don'?t get me wrong", r"i hope this helps", r"great question", r"certainly!",
    r"the real question is", r"at its core", r"it'?s worth noting", r"the key takeaway",
]

# contrasti «non X ma Y» e simili
CONTRASTI = [
    r"\bnot (?:just|only|merely|simply)\b",
    r"\bisn'?t (?:just|merely|about)\b",
    r"\bit'?s not\b[^.;:!?]{0,70}[,;]\s*it'?s\b",
    r"\bnot (?:a|an|the)\b[^.;:!?]{1,40},\s*but\b",
    r"\bthis does not mean\b.{0,60}\bit means\b",
    r"\bno guessing\b",
]

# (britannico, americano): parole la cui forma tradisce la varietà
COPPIE_BR_AM = [
    ("colour", "color"), ("favour", "favor"), ("honour", "honor"), ("neighbour", "neighbor"), ("grey", "gray"),
    ("tyre", "tire"), ("centre", "center"), ("metre", "meter"), ("litre", "liter"), ("theatre", "theater"),
    ("defence", "defense"), ("organise", "organize"), ("realise", "realize"), ("recognise", "recognize"),
    ("apologise", "apologize"), ("travelled", "traveled"), ("travelling", "traveling"), ("jewellery", "jewelry"),
    ("plough", "plow"), ("kerb", "curb"), ("aluminium", "aluminum"), ("programme", "program"), ("mum", "mom"),
    ("pyjamas", "pajamas"), ("mould", "mold"), ("sceptic", "skeptic"), ("lorry", "truck"), ("petrol", "gas"),
    ("pavement", "sidewalk"), ("torch", "flashlight"), ("rubbish", "garbage"), ("lift", "elevator"),
    ("motorway", "highway"), ("tap", "faucet"), ("nappy", "diaper"), ("trousers", "pants"), ("jumper", "sweater"),
    ("tarmac", "asphalt"), ("spanner", "wrench"), ("bonnet", "hood"), ("autumn", "fall"), ("biscuit", "cookie"),
    ("whilst", "while"), ("amongst", "among"), ("learnt", "learned"), ("spelt", "spelled"), ("burnt", "burned"),
    ("dreamt", "dreamed"), ("towards", "toward"), ("afterwards", "afterward"),
]
# da non segnalare mai (omografi o ambigui)
AMBIGUE = {"lift", "tap", "fall", "gas", "program", "mold", "truck", "hood", "toward", "while", "among"}

# falsi amici italiano→inglese: parola inglese → parola italiana che la fa scivolare in un calco
FALSI_AMICI = {
    "actually": "attualmente (= currently)", "eventually": "eventualmente (= possibly)",
    "sensible": "sensibile (= sensitive)", "practically": "in pratica (= in effect)",
    "pretend": "pretendere (= demand)", "attend": "attendere (= wait)", "assist": "assistere (= be present)",
    "argument": "argomento (= topic)", "fabric": "fabbrica (= factory)", "college": "collegio (= boarding school)",
    "lecture": "lettura (= reading)", "morbid": "morbido (= soft)", "sympathetic": "simpatico (= nice)",
    "educated": "educato (= polite)", "preservative": "preservativo (= condom)", "library": "libreria (= bookshop)",
    "parents": "parenti (= relatives)", "demand": "domandare (= ask)", "firm": "firma (= signature)",
    "magazine": "magazzino (= warehouse)", "rumor": "rumore (= noise)", "rumour": "rumore (= noise)",
    "casualty": "casuale (= chance)", "ordinary": "ordinario (= vulgar)", "commodity": "comodità (= comfort)",
    "annoy": "annoiare (= bore)", "disgrace": "disgrazia (= misfortune)", "tragedy": "disgrazia (= misfortune)",
    "luxury": "lussuria (= lust)", "caravan": "carovana (= convoy)", "agenda": "agenda (= diary)",
}

# dislocazioni all'italiana: pronome ripreso da un nome in coda («look at it yourself, the house»)
DISLOCAZIONI = [
    r"\b(?:it|him|her|them|this|that)\b[^.;:!?]{0,40},\s+(?:the|this|that|these|those|my|your|his|her|their)\s+[\w'’ -]{1,30}[.!?”’]",
    r"\babout it,\s+(?:what|why|how|who|where)\b",
]

STOP = set("the a an and or but of to in on at for with by from as is are was were be been it its this that these those i you "
           "he she we they me him her us them my your his their our not no so if then than too very just".split())

INVISIBILI = {
    0x00A0: "spazio senza interruzione", 0x00AD: "trattino morbido", 0x200B: "spazio a larghezza zero",
    0x200C: "non-joiner a larghezza zero", 0x200D: "joiner a larghezza zero", 0x200E: "segno sinistra-destra",
    0x200F: "segno destra-sinistra", 0x2028: "separatore di riga", 0x2029: "separatore di paragrafo",
    0x202F: "spazio stretto senza interruzione", 0x2060: "word joiner", 0xFEFF: "BOM a larghezza zero",
}

# ── lettura ────────────────────────────────────────────────────────────────────────────────────────

def carica(percorso, campo, ignora):
    p = Path(percorso)
    voci = []
    if p.suffix.lower() == ".json":
        dati = json.loads(p.read_text(encoding="utf-8"))
        if isinstance(dati, list):
            for n, d in enumerate(dati, 1):
                testo = d.get(campo, "") if isinstance(d, dict) else str(d)
                voci.append((f"{p.stem}.{n}", testo))
        elif isinstance(dati, dict):
            for k, v in dati.items():
                voci.append((f"{p.stem}:{k}", v if isinstance(v, str) else json.dumps(v, ensure_ascii=False)))
    else:
        for n, riga in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
            if riga.strip():
                voci.append((f"{p.stem}:{n}", riga))
    if ignora:
        rx = re.compile(ignora)
        voci = [(i, rx.sub(" ", t)) for i, t in voci]
    return [(i, t) for i, t in voci if t.strip()]


def estratto(testo, m, raggio=45):
    a, b = max(0, m.start() - raggio), min(len(testo), m.end() + raggio)
    return ("…" if a else "") + testo[a:b].replace("\n", " ") + ("…" if b < len(testo) else "")


def cerca(voci, rx):
    return [(i, estratto(t, m)) for i, t in voci for m in rx.finditer(t)]

# ── controlli ──────────────────────────────────────────────────────────────────────────────────────

def controlli(voci, varieta, soglia_ngram):
    out = []

    out.append(("Trattini lunghi (— –) e « -- »", cerca(voci, re.compile(r"[—–]|\s--\s")),
                "In prosa sono il tic più noto dei modelli. Un'etichetta che viene dall'originale (es. «FINALE — …») non conta."))

    hit = []
    for w in PAROLE_MODELLO:
        hit += [(i, f"[{w}] {s}") for i, s in cerca(voci, re.compile(rf"\b{re.escape(w)}\b", re.I))]
    out.append(("Parole e formule da elenco dei modelli", hit,
                "Una parola sola è debole; contano i gruppi e le ripetizioni. Controlla se l'originale la chiede."))

    hit = []
    for rx in STAGING:
        hit += cerca(voci, re.compile(rx, re.I))
    out.append(("Frasi di preparazione, tono da chat", hit, "Nella narrativa sono rarissime: quasi sempre un residuo."))

    hit = []
    for rx in CONTRASTI:
        hit += cerca(voci, re.compile(rx, re.I))
    out.append(("Contrasti «non X ma Y»", hit,
                "Tieni il contrasto solo se corregge una credenza reale del lettore o se l'originale lo ha."))

    if varieta in ("br", "am"):
        hit = []
        for br, am in COPPIE_BR_AM:
            cattiva = am if varieta == "br" else br
            if cattiva in AMBIGUE:
                continue
            giusta = br if varieta == "br" else am
            hit += [(i, f"[{cattiva} → {giusta}] {s}") for i, s in cerca(voci, re.compile(rf"\b{cattiva}\b", re.I))]
        nome = "americanismi" if varieta == "br" else "britannismi"
        out.append((f"Varietà: {nome} in un testo {'britannico' if varieta == 'br' else 'americano'}", hit,
                    "Ortografia e lessico devono restare di una sola varietà."))

    hit = []
    for w, it in FALSI_AMICI.items():
        hit += [(i, f"[{w} ≈ {it}] {s}") for i, s in cerca(voci, re.compile(rf"\b{w}\b", re.I))]
    out.append(("Falsi amici possibili", hit,
                "Ipotesi: leggi la riga e controlla che la parola inglese abbia il senso che l'originale voleva."))

    hit = []
    for rx in DISLOCAZIONI:
        hit += cerca(voci, re.compile(rx, re.I))
    out.append(("Dislocazioni all'italiana", hit, "Costruzione tipica dell'italiano parlato: in inglese di solito si scioglie."))

    # elenchi in tre
    tri = re.compile(r"\b([\w'’-]+(?: [\w'’-]+)?), ([\w'’-]+(?: [\w'’-]+)?),? (?:and|or) ([\w'’-]+(?: [\w'’-]+)?)\b[.;:!?]")
    out.append(("Elenchi in tre (informativo)", cerca(voci, tri),
                "Un elenco in tre è un tic solo se i tre elementi non dicono tre cose diverse o se l'originale non lo ha."))

    # avverbi in -ly ripetuti
    avv = collections.Counter(w.lower() for _, t in voci for w in re.findall(r"\b[a-z]{4,}ly\b", t, re.I))
    ripetuti = [(f"({n}×)", w) for w, n in avv.most_common(10) if n >= 4 and w not in ("only", "family", "early", "lonely", "daily", "likely")]
    out.append(("Avverbi in -ly che tornano (≥ 4 volte)", [(a, b) for a, b in ripetuti],
                "Controlla se la ripetizione viene dall'originale; altrimenti varia."))

    # formule di tre parole che tornano
    gram = collections.Counter()
    esempio = {}
    for i, t in voci:
        parole = re.findall(r"[A-Za-z'’]+", t.lower())
        for k in range(len(parole) - 2):
            g = tuple(parole[k:k + 3])
            if all(w in STOP for w in g):
                continue
            gram[g] += 1
            esempio.setdefault(g, i)
    ricorrenti = [(esempio[g], f"«{' '.join(g)}» ×{n}") for g, n in gram.most_common(300) if n >= soglia_ngram][:12]
    out.append((f"Formule di tre parole che tornano (≥ {soglia_ngram} volte)", ricorrenti,
                "Un motivo ripetuto dell'originale è voluto; una formula che il traduttore ha scelto da solo è un tic."))

    # virgolette
    dritte = sum(t.count('"') for _, t in voci)
    curve = sum(t.count("“") + t.count("”") for _, t in voci)
    caporali = sum(t.count("«") + t.count("»") for _, t in voci)
    mix = []
    if dritte and curve:
        mix.append(("—", f"virgolette dritte ({dritte}) e curve ({curve}) mescolate"))
    if caporali:
        mix.append(("—", f"caporali italiani rimasti ({caporali})"))
    out.append(("Virgolette", mix, f"dritte {dritte}, curve {curve}, caporali {caporali}."))

    # caratteri non ASCII
    c = collections.Counter(ch for _, t in voci for ch in t if ord(ch) > 126)
    inv = [(f"U+{ord(ch):04X}", f"{INVISIBILI[ord(ch)]} ×{n}") for ch, n in c.items() if ord(ch) in INVISIBILI]
    out.append(("Caratteri invisibili o di spaziatura strana", inv, "Dovrebbero essere zero: non si vedono ma si copiano."))
    elenco = ", ".join(f"{ch} U+{ord(ch):04X} ×{n}" for ch, n in c.most_common() if ord(ch) not in INVISIBILI)
    out.append(("Caratteri fuori dall'ASCII (informativo)", [("—", elenco)] if elenco else [], ""))

    return out

# ── uscita ─────────────────────────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("file", nargs="+")
    ap.add_argument("--campo", default="en", help="campo da leggere nei JSON a lista (default: en)")
    ap.add_argument("--varieta", default="nessuna", choices=["br", "am", "nessuna"], help="varietà dell'inglese attesa")
    ap.add_argument("--max", type=int, default=8, help="esempi mostrati per controllo")
    ap.add_argument("--ignora", default="", help="REGEX da togliere dal testo prima della scansione")
    ap.add_argument("--soglia-ngram", type=int, default=5)
    a = ap.parse_args()

    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    voci = []
    for f in a.file:
        voci += carica(f, a.campo, a.ignora)
    parole = sum(len(t.split()) for _, t in voci)
    print(f"# Scansione: {len(voci)} testi, circa {parole} parole\n")

    riepilogo = []
    for titolo, hit, nota in controlli(voci, a.varieta, a.soglia_ngram):
        riepilogo.append((titolo, len(hit)))
        print(f"## {titolo}: {len(hit)}")
        if nota:
            print(f"_{nota}_")
        for i, s in hit[:a.max]:
            print(f"- {i}: {s}")
        if len(hit) > a.max:
            print(f"- … altri {len(hit) - a.max}")
        print()
    print("## Riepilogo")
    for titolo, n in riepilogo:
        print(f"- {n:4d}  {titolo}")


if __name__ == "__main__":
    main()
