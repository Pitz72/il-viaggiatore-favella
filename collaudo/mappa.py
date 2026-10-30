"""La mappa (app/src/gioco/foglio.ts, il pannello Mappa.tsx) alla prova.

Il ponte vero (app/src/lib/ponte.py) dà la carta e i luoghi visitati; che cosa va sul foglio e dove vanno i nomi lo
decide la logica vera dell'interfaccia (foglio.ts, eseguita con Node da app/scripts/foglio-node.mjs). Le carte
del ponte e le sue strade si provano in interfaccia.py; qui si prova ciò che si vede.

Che cosa si pretende, a ogni passo di un viaggio intero (il percorso A, quello di Peppe, una morte per sete):
  · le TAPPE ci sono sempre, dal primo giorno e senza strade fra loro: le sette zone e Acquamorta, ciascuna nel luogo centrale
    della sua zona (e Acquamorta sulla soglia, l'ultimo luogo), coi nomi delle zone (ZONE_THEME in data/viaggiatore.ts);
  · sul foglio, oltre alle tappe, ci sono i luoghi visitati e soltanto quelli che da lì si vedono: nessun luogo lontano,
    nessuno mancante;
  · il luogo dove sei è uno solo, ed è quello del motore;
  · la mappa non sa meno dei pulsanti: ogni uscita che la plancia nomina sta sul foglio, col suo nome;
  · le strade battute vanno fra due luoghi visitati, quelle accennate fra uno visitato e uno no, nessuna fra due ignoti
    (né fra due tappe lontane: le strade si fanno camminando);
  · nessun nome tocca un altro nome o il segno di un altro luogo, e tutto sta nel foglio;
  · ogni nome sta dal suo lato di sempre, scelto una volta sul foglio pieno: da un'apertura all'altra non salta.
E, con tutti i trentanove luoghi visitati, che il foglio intero regga, anche con «sei qui» su ciascun luogo.

Prima del viaggio, la DISPOSIZIONE irregolare (verifica_disposizione), con le regole rifatte qui in Python: ogni strada
entro 12 gradi dal verso della sua uscita e, appena fuori dal segno, entro 20; l'ordine da ovest a est e da nord a sud;
nessun tracciato che ne incrocia un altro; la stessa disposizione in un altro processo; la statale e la provinciale dove
le dicono i .fav; e le regole sanno fallire. Poi la STAMPA fisica (verifica_terreno, app/src/gioco/terreno.ts): sotto
l'acqua del lago soltanto il fondo dell'invaso, il torrente che taglia soltanto la strada del guado, il mare lontano, la
salita dal paese al valico.

Uso:  python mappa.py      (esce con 1 se una prova fallisce; serve `npm ci` in app/)
"""
import importlib.util
import json
import math
import os
import random
import re
import subprocess
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
sys.path.insert(0, os.path.join(RADICE, "motore"))
sys.path.insert(0, QUI)

import percorsi  # noqa: E402

PONTE = os.path.join(RADICE, "app", "src", "lib", "ponte.py")
DATI = os.path.join(RADICE, "app", "src", "data", "viaggiatore.ts")
# le tappe, come le dice foglio.ts: la zona e il luogo centrale
TAPPE_ATTESE = [("z1", "piazza"), ("z2", "masseria"), ("z3", "conca"), ("z4", "casello"),
                ("z5", "piazzetta"), ("z6", "pianoro"), ("z7", "guado"), ("acquamorta", "soglia")]
GIOCO = os.path.join(RADICE, "prototipo", "il-viaggiatore.fav")
FOGLIO = os.path.join(RADICE, "app", "scripts", "foglio-node.mjs")
_n = [0]


def nuovo_ponte():
    _n[0] += 1
    spec = importlib.util.spec_from_file_location(f"ponte_m{_n[0]}", PONTE)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.fav_boot(GIOCO)
    mod._mondo.rng = random.Random(1)
    return mod


class Foglio:
    """Il processo Node con la logica del foglio: una domanda per volta."""

    def __init__(self):
        self.proc = subprocess.Popen(["node", FOGLIO], cwd=os.path.join(RADICE, "app"), stdin=subprocess.PIPE,
                                     stdout=subprocess.PIPE, text=True, encoding="utf-8")

    def chiedi(self, carta, visitate, qui):
        self.proc.stdin.write(json.dumps({"carta": carta, "visitate": visitate, "qui": qui, "zone": ZONE_DEI_LUOGHI}, ensure_ascii=False) + "\n")
        self.proc.stdin.flush()
        return json.loads(self.proc.stdout.readline())

    def disposizione(self, carta):
        self.proc.stdin.write(json.dumps({"carta": carta, "zone": ZONE_DEI_LUOGHI, "disposizione": True}, ensure_ascii=False) + "\n")
        self.proc.stdin.flush()
        return json.loads(self.proc.stdout.readline())

    def terreno(self, carta):
        self.proc.stdin.write(json.dumps({"carta": carta, "zone": ZONE_DEI_LUOGHI, "terreno": True}, ensure_ascii=False) + "\n")
        self.proc.stdin.flush()
        return json.loads(self.proc.stdout.readline())

    def chiudi(self):
        self.proc.stdin.close()
        self.proc.wait(timeout=10)


problemi = []
controlli = [0]


def controlla(nome, ok, dettaglio=""):
    controlli[0] += 1
    if not ok:
        problemi.append(f"{nome}: {dettaglio}")
    return ok


def zone_dei_luoghi():
    """La zona di ogni luogo, letta dai .fav (z1-acquaviva.fav → z1): «La piazza è una stanza.»"""
    zone = {}
    cartella = os.path.join(RADICE, "prototipo")
    for nome in sorted(os.listdir(cartella)):
        if re.match(r"z[1-7]-.*\.fav$", nome):
            for riga in open(os.path.join(cartella, nome), encoding="utf-8"):
                m = re.match(r"^(.+?) è una stanza\.\s*$", riga)
                if m:
                    zone[re.sub(r"^(il|lo|la|l'|i|gli|le)\s*", "", m.group(1).strip().lower())] = nome.split("-")[0]
    return zone


ZONE_DEI_LUOGHI = zone_dei_luoghi()


def vicini_di(carta):
    v = {l["id"]: set() for l in carta["luoghi"]}
    for a, b in carta["strade"]:
        v[a].add(b)
        v[b].add(a)
    return v


def verifica_passo(f, p, carta, vicini, dove):
    """Un passo: che cosa il foglio mostra, dato lo stato del ponte."""
    st = json.loads(p.fav_stato())
    visitate, qui = st["visitate"], st["roomId"]
    r = f.chiedi(carta, visitate, qui)
    fo = r["foglio"]
    mostrati = {l["id"]: l for l in fo["luoghi"]}
    attesi = set(visitate) | {v for i in visitate for v in vicini[i]}
    controlla(dove + " · i luoghi sul foglio", set(mostrati) == attesi,
              f"mancano {sorted(attesi - set(mostrati))}, in più {sorted(set(mostrati) - attesi)}")
    uno = [i for i, l in mostrati.items() if l["stato"] == "qui"]
    controlla(dove + " · un solo «sei qui», quello del motore", uno == [qui], f"{uno} invece di {qui}")
    controlla(dove + " · visitati e ignoti", all((mostrati[i]["stato"] != "noto") == (i in set(visitate) | {qui}) for i in mostrati),
              str({i: l["stato"] for i, l in mostrati.items()}))
    controlla(dove + " · le tappe ci sono tutte, sempre, nel luogo centrale della loro zona",
              [(t["zona"], t["id"]) for t in fo["tappe"]] == TAPPE_ATTESE, str([(t["zona"], t["id"]) for t in fo["tappe"]]))
    for t in fo["tappe"]:
        stati = set(visitate) | {qui}
        atteso = (t["id"] in stati) if t["zona"] == "acquamorta" else any(ZONE_DEI_LUOGHI.get(i) == t["zona"] for i in stati)
        controlla(dove + f" · la tappa {t['nome']} è «raggiunta» appena sei nella sua zona", t["raggiunta"] == atteso, str(t))
    nomi = {l["nome"].lower() for l in fo["luoghi"]} | {t["nome"].lower() for t in fo["tappe"]}
    mancano = [u["verso"] for u in st["exits"] if u["verso"].lower() not in nomi]
    controlla(dove + " · ogni uscita della plancia è sul foglio, col suo nome", not mancano, f"mancano {mancano}")
    for s in fo["strade"]:
        va, vb = mostrati[s["da"]]["stato"] != "noto", mostrati[s["a"]]["stato"] != "noto"
        controlla(dove + f" · la strada {s['da']}–{s['a']}", (va or vb) and s["battuta"] == (va and vb), f"{s}, visitati {va}/{vb}")
    controlla(dove + " · nomi e segni non si toccano, tutto sta nel foglio", not r["conflitti"], "; ".join(r["conflitti"][:3]))
    if LATI:
        storti = [l["id"] for l in fo["luoghi"] if not l["nomeNascosto"]
                  and {"lato": l["lato"], "scosta": l["scosta"]} != LATI["qui" if l["stato"] == "qui" else "luoghi"][l["id"]]]
        storti += [t["id"] for t in fo["tappe"] if {"lato": t["lato"], "scosta": t["scosta"]} != LATI["tappe"][t["id"]]]
        controlla(dove + " · ogni nome sta dal suo lato di sempre (non salta da un'apertura all'altra)", not storti, str(storti))
    return fo, st


def gioca_percorso(f, carta, vicini, nome, comandi, passi=1):
    p = nuovo_ponte()
    m = p._mondo
    ultimo = None
    for i, cmd in enumerate(comandi):
        if m.stato_partita != "in_corso":
            break
        if not m.dialogo_attivo:
            v = m.variabili
            if v.get("sete", 0) >= 5 and v.get("acqua", 0) >= 1:
                p.fav_step("bevi")
            if v.get("fame", 0) >= 6 and v.get("cibo", 0) >= 1:
                p.fav_step("mangia qualcosa")
        p.fav_step(cmd)
        if i % passi == 0 or m.posizione_giocatore != ultimo:      # a ogni cambio di luogo, e ogni tanto fra l'uno e l'altro
            ultimo = m.posizione_giocatore
            verifica_passo(f, p, carta, vicini, f"{nome} dopo «{cmd}» ({i})")
    return p


LATI = {}


def angolo(dx, dy, ux, uy):
    """I gradi fra un vettore e un verso cardinale."""
    return math.degrees(math.atan2(abs(-dx * uy + dy * ux), dx * ux + dy * uy))


def tagliano(p, q, r, s):
    o = lambda a, b, c: (b["cx"] - a["cx"]) * (c["cy"] - a["cy"]) - (b["cy"] - a["cy"]) * (c["cx"] - a["cx"])
    return o(r, s, p) * o(r, s, q) < 0 and o(p, q, r) * o(p, q, s) < 0


def storture_in_python(carta, d):
    """Le regole della disposizione rifatte qui, per conto loro (non si fidano di foglio.ts): ogni strada entro 12° dal suo
    verso cardinale, e fuori dal segno (fra il raggio e il raggio + 12) entro 20°; l'ordine da ovest a est e da nord a sud;
    tutto dentro la cornice; nessun tracciato che ne incrocia un altro."""
    out = []
    griglia = {l["id"]: (l["x"], l["y"]) for l in carta["luoghi"] if l["x"] is not None}
    posti = d["posti"]
    tappe = {luogo for _, luogo in TAPPE_ATTESE}
    raggio = lambda i: d["costanti"]["RAGGIO_TAPPA"] if i in tappe else d["costanti"]["RAGGIO_QUI"]
    for a, b in carta["strade"]:
        (ax, ay), (bx, by) = griglia[a], griglia[b]
        ux, uy = (bx > ax) - (bx < ax), (by > ay) - (by < ay)
        dx, dy = posti[b]["cx"] - posti[a]["cx"], posti[b]["cy"] - posti[a]["cy"]
        if angolo(dx, dy, ux, uy) > 12.0001:
            out.append(f"la strada {a}–{b} piega di {angolo(dx, dy, ux, uy):.1f}°")
    for t in d["tracciati"]:
        c = t["campioni"]
        (ax, ay), (bx, by) = griglia[t["a"]], griglia[t["b"]]
        ux, uy = (bx > ax) - (bx < ax), (by > ay) - (by < ay)
        for capo, r, (vx, vy) in ((c[0], raggio(t["a"]), (ux, uy)), (c[-1], raggio(t["b"]), (-ux, -uy))):
            fascia = [q for q in c if r <= math.hypot(q["cx"] - capo["cx"], q["cy"] - capo["cy"]) <= r + 12]
            if len(fascia) >= 2:
                fascia.sort(key=lambda q: math.hypot(q["cx"] - capo["cx"], q["cy"] - capo["cy"]))
                g = angolo(fascia[-1]["cx"] - fascia[0]["cx"], fascia[-1]["cy"] - fascia[0]["cy"], vx, vy)
                if g > 20.0001:
                    out.append(f"la strada {t['a']}–{t['b']} esce di {g:.1f}° dal suo verso")
    ids = list(griglia)
    for s in ids:
        for t in ids:
            if griglia[s][0] < griglia[t][0] and not posti[s]["cx"] < posti[t]["cx"]:
                out.append(f"{s} non sta più a ovest di {t}")
            if griglia[s][1] < griglia[t][1] and not posti[s]["cy"] < posti[t]["cy"]:
                out.append(f"{s} non sta più a nord di {t}")
    F = d["costanti"]["FOGLIO"]
    for i, q in posti.items():
        if not (F["cornice"] <= q["cx"] <= F["larghezza"] - F["cornice"] and F["cornice"] <= q["cy"] <= F["altezza"] - F["cornice"]):
            out.append(f"{i} sta fuori dal foglio")
    ts = d["tracciati"]
    for i in range(len(ts)):
        for j in range(i + 1, len(ts)):
            t, v = ts[i], ts[j]
            comune = {t["a"], t["b"]} & {v["a"], v["b"]}
            capi = [posti[x] for x in comune]
            lontano = lambda q: all(math.hypot(q["cx"] - c["cx"], q["cy"] - c["cy"]) > 14 for c in capi)
            if any(lontano(p) and lontano(q) and lontano(r) and lontano(s) and tagliano(p, q, r, s)
                   for p, q in zip(t["campioni"], t["campioni"][1:]) for r, s in zip(v["campioni"], v["campioni"][1:])):
                out.append(f"la strada {t['a']}–{t['b']} incrocia {v['a']}–{v['b']}")
    return out


def verifica_disposizione(f, carta):
    """La disposizione irregolare: regge da sola (rifatta in Python), è la stessa a ogni chiamata e in un altro processo,
    ogni strada ha la sua classe, e le regole sanno fallire."""
    d = f.disposizione(carta)
    LATI.update(d["lati"])
    gravi = [s["testo"] for s in d["storture"] if not s.get("lieve")]
    lievi = [s["testo"] for s in d["storture"] if s.get("lieve")]
    controlla("disposizione · nessuna stortura per foglio.ts, e niente ritorno alla griglia", not gravi and not d["griglia"], "; ".join(gravi[:4]))
    py = storture_in_python(carta, d)
    controlla("disposizione · le regole rifatte in Python reggono (verso, uscite, ordine, cornice, incroci)", not py, "; ".join(py[:4]))
    k = sorted(d["k"].values())
    liberi = sum(1 for v in k if v == 1)
    controlla("disposizione · la carta resta irregolare: almeno tre luoghi su quattro liberi di scostarsi", liberi >= 0.75 * len(k), f"{liberi} su {len(k)}")
    # lo scarto dalla griglia piegata, non da quella uniforme: il ritmo delle colonne da solo darebbe già qualche unità
    scarti = [math.hypot(d["posti"][i]["cx"] - p["cx"], d["posti"][i]["cy"] - p["cy"]) for i, p in d["piegata"].items()]
    controlla("disposizione · non è la griglia: in media un luogo si scosta di almeno 5 unità dalla griglia piegata", sum(scarti) / len(scarti) >= 5, f"{sum(scarti) / len(scarti):.1f}")
    controlla("disposizione · si calcola in meno di mezzo secondo", d["ms"] < 500, f"{d['ms']:.0f} ms")
    altro = Foglio()
    try:
        d2 = altro.disposizione(carta)
    finally:
        altro.chiudi()
    controlla("disposizione · deterministica: un altro processo dà gli stessi posti, tracciati e lati",
              d2["posti"] == d["posti"] and [t["d"] for t in d2["tracciati"]] == [t["d"] for t in d["tracciati"]] and d2["lati"] == d["lati"], "")
    classi = {f"{t['a']}|{t['b']}": t["classe"] for t in d["tracciati"]}
    controlla("disposizione · ogni strada ha un tracciato e una classe", len(classi) == len(carta["strade"]), f"{len(classi)} su {len(carta['strade'])}")
    controlla("disposizione · la statale è rampa–casello–discesa–porta; la provinciale margine–tratto–masseria",
              sorted(k for k, v in classi.items() if v == "statale") == ["casello|discesa", "casello|rampa", "discesa|porta"]
              and sorted(k for k, v in classi.items() if v == "provinciale") == ["margine|tratto", "masseria|tratto"], str(classi))
    # le regole sanno fallire: una piazza spostata in su, una strada spinta a incrociarne un'altra
    guasta = json.loads(json.dumps(d))
    guasta["posti"]["piazza"]["cy"] -= 30
    controlla("disposizione · il controllo del verso sa fallire", any("piega" in x for x in storture_in_python(carta, guasta)), "")
    guasta = json.loads(json.dumps(d))
    guasta["posti"]["margine"]["cx"] = guasta["posti"]["piazza"]["cx"] + 5
    controlla("disposizione · il controllo dell'ordine sa fallire", any("ovest" in x for x in storture_in_python(carta, guasta)), "")
    print(f"disposizione: {d['ms']:.0f} ms, {d['ritiri']} ritiri, {liberi}/{len(k)} luoghi liberi, scarto medio {sum(scarti) / len(scarti):.1f}, "
          f"{len(lievi)} nomi sopra una strada" + (f" ({'; '.join(lievi)})" if lievi else ""))
    return d


def verifica_terreno(f, carta):
    """La stampa fisica dà ragione al racconto: sotto l'acqua del lago (stampato pieno, prima della secca) c'è soltanto il
    fondo dell'invaso; la diga è all'asciutto; il torrente taglia una sola strada, quella del guado; né l'emissario né la
    ferrovia tagliano strade; il mare sta lontano da ogni luogo e da ogni strada; si sale dal paese al valico, il punto più
    alto del cammino, e la sterrata è un crinale fra la piana e l'invaso."""
    t = f.terreno(carta)
    L = t["luoghi"]
    fondo = {"conca", "fondale", "torre di presa", "relitto"}
    controlla("stampa · sotto l'acqua del lago c'è soltanto il fondo dell'invaso", {i for i, v in L.items() if v["lago"]} == fondo,
              str(sorted(i for i, v in L.items() if v["lago"])))
    controlla("stampa · nessun luogo sta in mare", not [i for i, v in L.items() if v["mare"]], "")
    controlla("stampa · il torrente taglia una sola strada, quella del guado (guado–strada)", t["fiume"] == ["guado|strada"], str(t["fiume"]))
    controlla("stampa · l'emissario e la ferrovia non tagliano strade", not t["emissario"] and not t["ferrovia"], f"{t['emissario']} {t['ferrovia']}")
    controlla("stampa · il mare sta ad almeno 40 unità da ogni luogo e da ogni strada",
              min(v["costa"] for v in L.values()) >= 40 and t["costaStrade"] >= 40, f"{min(v['costa'] for v in L.values())} {t['costaStrade']:.0f}")
    q = {i: v["quota"] for i, v in L.items()}
    salita = ["osteria", "salita", "sentiero", "pianoro", "valico"]
    controlla("stampa · dal paese si sale fino al valico", all(q[a] < q[b] for a, b in zip(salita, salita[1:])), str([q[i] for i in salita]))
    cammino = [l["id"] for l in carta["luoghi"] if l["id"] not in {"grotta", "sorgente", "cappella"}]
    controlla("stampa · il valico è il punto più alto del cammino (fuori dai vicoli ciechi delle colline)", max(cammino, key=lambda i: q[i]) == "valico",
              max(cammino, key=lambda i: q[i]))
    controlla("stampa · la sterrata è un crinale: più alta della piana e dell'invaso", q["sterrata"] > q["masseria"] and q["sterrata"] > q["conca"],
              f"{q['sterrata']} {q['masseria']} {q['conca']}")
    controlla("stampa · Acquaviva è in basso, verso il mare (sotto i 60 m)", q["piazza"] < 60, str(q["piazza"]))
    controlla("stampa · il terreno si calcola in meno di 300 ms", t["ms"] < 300, f"{t['ms']:.0f} ms")
    print(f"stampa: terreno in {t['ms']:.0f} ms; valico {q['valico']} m, guado {q['guado']} m, Acquaviva {q['piazza']} m")


def main():
    f = Foglio()
    try:
        p0 = nuovo_ponte()
        carta = json.loads(p0.fav_mappa())
        vicini = vicini_di(carta)
        tutti = [l["id"] for l in carta["luoghi"]]

        # all'inizio: la stazione, e la piazza che si vede; e le otto tappe, senza una strada fra loro
        verifica_disposizione(f, carta)
        verifica_terreno(f, carta)
        fo, _ = verifica_passo(f, p0, carta, vicini, "all'inizio")
        controlla("all'inizio · da qui le tappe stanno tutte a ovest, a nord o a sud (nessuna a est)",
                  all(t["verso"] is None or "est" not in t["verso"].replace("ovest", "") for t in fo["tappe"]), str([(t["nome"], t["verso"]) for t in fo["tappe"]]))
        controlla("all'inizio · solo la stazione e la piazza",
                  sorted(l["id"] for l in fo["luoghi"]) == ["piazza", "stazione"], str([l["id"] for l in fo["luoghi"]]))
        controlla("all'inizio · otto tappe, e una sola strada accennata (stazione–piazza), nessuna fra le tappe",
                  len(fo["tappe"]) == 8 and len(fo["strade"]) == 1 and not fo["strade"][0]["battuta"], str(fo["strade"]))
        controlla("all'inizio · solo Acquaviva è raggiunta", [t["nome"] for t in fo["tappe"] if t["raggiunta"]] == ["Acquaviva"],
                  str([t["nome"] for t in fo["tappe"] if t["raggiunta"]]))

        # le tappe: i nomi sono quelli delle zone, ogni luogo centrale sta nella sua zona, Acquamorta è l'ultimo luogo
        tappe = {t["zona"]: t for t in fo["tappe"]}
        dati = open(DATI, encoding="utf-8").read()
        nomi_zone = dict(re.findall(r'^\s*(z[1-7]): \{ nome: "([^"·]+?)(?: · [^"]*)?",', dati, re.M))
        controlla("tappe · i nomi sono quelli delle zone (ZONE_THEME)", len(nomi_zone) == 7 and all(tappe[z]["nome"] == n for z, n in nomi_zone.items()),
                  f"{ {z: tappe[z]['nome'] for z in nomi_zone} } contro {nomi_zone}")
        for z, luogo in TAPPE_ATTESE[:7]:
            controlla(f"tappe · {luogo} sta in {z}", ZONE_DEI_LUOGHI.get(luogo) == z, str(ZONE_DEI_LUOGHI.get(luogo)))
        controlla("tappe · Acquamorta è sull'ultimo luogo, la soglia, che ha una sola strada (si arriva e basta)",
                  len(vicini["soglia"]) == 1, str(vicini["soglia"]))

        # tutto il viaggio, passo per passo
        p = gioca_percorso(f, carta, vicini, "A_peppe", percorsi.comandi("A_peppe"))
        gioca_percorso(f, carta, vicini, "K_peppe_vero", percorsi.comandi("K_peppe_vero"))
        # una morte per sete, con la mappa che si allarga fino all'ultimo
        gioca_percorso(f, carta, vicini, "sete", ["nord", "sud"] * 60, passi=3)

        # con tutti i luoghi visitati: il foglio intero
        r = f.chiedi(carta, tutti, "guado")
        fo = r["foglio"]
        controlla("tutti i luoghi · sul foglio ci sono tutti", len(fo["luoghi"]) == len(tutti) == 39, str(len(fo["luoghi"])))
        controlla("tutti i luoghi · nessun nome tocca un altro nome o un altro segno, e tutto sta nel foglio", not r["conflitti"], "; ".join(r["conflitti"][:5]))
        controlla("tutti i luoghi · tutte le strade sono battute", len(fo["strade"]) == len(carta["strade"]) and all(s["battuta"] for s in fo["strade"]),
                  f"{len(fo['strade'])} su {len(carta['strade'])}")
        controlla("tutti i luoghi · e le otto tappe; il guado ha la stessa scritta della sua tappa, e si scrive una volta",
                  len(fo["tappe"]) == 8 and [l["id"] for l in fo["luoghi"] if l["nomeNascosto"]] == ["guado"],
                  str([l["id"] for l in fo["luoghi"] if l["nomeNascosto"]]))
        # il foglio pieno con «sei qui» su ciascun luogo: il nome di chi è qui ha il suo lato, e niente si tocca
        for i in tutti:
            r = f.chiedi(carta, tutti, i)
            controlla(f"tutti i luoghi, sei a {i} · i nomi non si toccano", not r["conflitti"], "; ".join(r["conflitti"][:3]))
        # ogni luogo, da solo, come luogo di partenza di un viaggio che lì comincia
        for i in tutti:
            r = f.chiedi(carta, [i], i)
            controlla(f"un luogo solo ({i}) · i nomi non si toccano", not r["conflitti"], "; ".join(r["conflitti"][:3]))
        # un caso storto: luoghi senza posto non si disegnano
        storta = json.loads(json.dumps(carta))
        storta["luoghi"][3]["x"] = storta["luoghi"][3]["y"] = None
        r = f.chiedi(storta, tutti, "piazza")
        controlla("un luogo senza posto sulla carta non si disegna", storta["luoghi"][3]["id"] not in {l["id"] for l in r["foglio"]["luoghi"]}
                  and len(r["foglio"]["luoghi"]) == 38, str(len(r["foglio"]["luoghi"])))
    finally:
        f.chiudi()
    for pr in problemi[:40]:
        print("KO " + pr)
    print(f"{controlli[0]} controlli, {len(problemi)} falliti")
    print("TUTTO OK" if not problemi else "CI SONO FALLIMENTI")
    return 0 if not problemi else 1


if __name__ == "__main__":
    sys.exit(main())
