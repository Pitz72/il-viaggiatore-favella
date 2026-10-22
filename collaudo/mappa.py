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
  · nessun nome tocca un altro nome o il segno di un altro luogo, e tutto sta nel foglio.
E, con tutti i trentanove luoghi visitati, che il foglio intero regga: nomi senza toccarsi, nessuno fuori.

Uso:  python mappa.py      (esce con 1 se una prova fallisce; serve `npm ci` in app/)
"""
import importlib.util
import json
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


def main():
    f = Foglio()
    try:
        p0 = nuovo_ponte()
        carta = json.loads(p0.fav_mappa())
        vicini = vicini_di(carta)
        tutti = [l["id"] for l in carta["luoghi"]]

        # all'inizio: la stazione, e la piazza che si vede; e le otto tappe, senza una strada fra loro
        fo, _ = verifica_passo(f, p0, carta, vicini, "all'inizio")
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
