"""I finali si raggiungono anche solo con i pulsanti.

Gioca i sei percorsi della storia (percorsi.py) senza tastiera. Prima di ogni
comando chiede all'interfaccia vera (app/src/gioco/azioni.ts → comandiOfferti,
eseguita con Node) che cosa offrono i pulsanti in quel momento, e manda il
pulsante che dice la stessa cosa del comando del percorso: nei dialoghi il
numero della risposta, altrove il comando del pulsante, parola per parola
(«usa pastiglie su pompa» come lo compone l'interfaccia, non «usa le pastiglie su la pompa»). Se un
comando del percorso non ha un pulsante, il collaudo lo nomina, col luogo e con
i pulsanti che c'erano.

Un controllo in più, a ogni turno: una combinazione «usa X su Y» che il percorso
compie, composta coi pulsanti (la cosa, poi l'altra, senza che nessuna sia segnata
come quella giusta), non dà la risposta generica del motore («non ha alcun effetto
particolare»): è la soluzione, non un tentativo.

Il pilota cura il corpo come in finali.py, ma col pannello delle dosi. Anche
«inventario» e «stato» (i riepiloghi a parole) hanno il loro pulsante: i percorsi
li usano, e senza lo si vedrebbe qui.

Oltre ai sei finali (dodici percorsi) giocano coi soli pulsanti le tre morti e le due
partite corte al casello di trofei.py (il bluff con la pistola scarica, Vito a terra):
ciascuna deve finire dov'è finita giocata a comandi scritti (stesso esito, stessa
bisaccia, stessi contatori). Con --esplora un giocatore a caso sceglie ogni turno solo
fra ciò che i pulsanti offrono, da ogni zona, e se ne misura la copertura (luoghi, oggetti,
nodi di dialogo, finali): non deve restare indietro a quella di esploratore.py.

Uso:  python pulsanti.py                    (esce con 1 se qualcosa non va; serve `npm ci` in app/)
      python pulsanti.py --esplora [-n 6] [-t 250] [--seme 1]
"""
import argparse
import collections
import copy
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
import trofei  # noqa: E402
from finali import ATTESI  # noqa: E402

PONTE = os.path.join(RADICE, "app", "src", "lib", "ponte.py")
GIOCO = os.path.join(RADICE, "prototipo", "il-viaggiatore.fav")
NODE = os.path.join(RADICE, "app", "scripts", "comandi-offerti.mjs")
GENERICA = "non ha alcun effetto particolare"
_n = [0]


def nuovo_ponte():
    _n[0] += 1
    spec = importlib.util.spec_from_file_location(f"ponte_p{_n[0]}", PONTE)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.fav_boot(GIOCO)
    mod._mondo.rng = random.Random(1)
    return mod


class Interfaccia:
    """Il processo Node con la logica dei pulsanti: una domanda per turno."""

    def __init__(self):
        self.proc = subprocess.Popen(["node", NODE], cwd=os.path.join(RADICE, "app"), stdin=subprocess.PIPE,
                                     stdout=subprocess.PIPE, text=True, encoding="utf-8")

    def offerti(self, stato, azioni):
        self.proc.stdin.write(json.dumps({"mondo": stato, "azioni": azioni}, ensure_ascii=False) + "\n")
        self.proc.stdin.flush()
        return json.loads(self.proc.stdout.readline())

    def chiudi(self):
        self.proc.stdin.close()
        self.proc.wait(timeout=10)


# --- «usa le pastiglie su la pompa» e «usa le pastiglie sulla pompa» dicono la stessa cosa
_ARTICOLATE = {
    "su": ("sul", "sullo", "sulla", "sull'", "sui", "sugli", "sulle"),
    "a": ("al", "allo", "alla", "all'", "ai", "agli", "alle"),
    "in": ("nel", "nello", "nella", "nell'", "nei", "negli", "nelle"),
    "di": ("del", "dello", "della", "dell'", "dei", "degli", "delle"),
    "da": ("dal", "dallo", "dalla", "dall'", "dai", "dagli", "dalle"),
}
_SEMPLICE = {forma: base for base, forme in _ARTICOLATE.items() for forma in forme}
_ARTICOLI = {"il", "lo", "la", "i", "gli", "le", "un", "uno", "una"}


def canonico(cmd):
    s = cmd.lower().replace("’", "'").strip()
    s = re.sub(r"\b(l'|un'|sull'|all'|nell'|dell'|dall')", lambda m: (_SEMPLICE.get(m.group(1), "") + " "), s)
    parole = [_SEMPLICE.get(w, w) for w in s.split()]
    return " ".join(w for w in parole if w not in _ARTICOLI)


def pulsante_per(cmd, stato, offerti):
    """Il pulsante che manda la stessa cosa del comando del percorso, o None."""
    dialogo = stato.get("dialog")
    if dialogo:
        if cmd.isdigit():
            return cmd if cmd in offerti else None
        cerca = canonico(cmd)
        for i, testo in enumerate(dialogo["opzioni"]):
            if cerca in canonico(testo):
                return str(i + 1) if str(i + 1) in offerti else None
        return None
    per_canonico = {canonico(o): o for o in offerti}
    return per_canonico.get(canonico(cmd))


def gioca(nome, ui, problemi, *, comandi=None, giro=None, limite=None, bevi=True, mangia=True, a_pulsanti=True):
    """Una partita pilotata: coi pulsanti (`a_pulsanti`) o, come termine di paragone, a comandi scritti."""
    p = nuovo_ponte()
    m = p._mondo
    mancanti = 0
    ultimo = [None]

    def turno(cmd, *, cura=False):
        nonlocal mancanti
        precedente, ultimo[0] = ultimo[0], cmd
        if not a_pulsanti:
            return json.loads(p.fav_step(cmd))
        stato = json.loads(p.fav_stato())
        azioni = json.loads(p.fav_azioni())
        offerti = ui.offerti(stato, azioni)
        tasto = pulsante_per(cmd, stato, offerti)
        if tasto is None and cmd == precedente and not stato.get("dialog"):
            return None                        # ripetere lo stesso gesto quando il pulsante è sparito (Vito è già a terra): niente da premere
        if tasto is None:
            mancanti += 1
            lista = ", ".join(sorted(offerti))
            problemi.append(f"{nome}: a «{stato['room']}» nessun pulsante per «{cmd}»" + ("" if cura else f"\n      c'erano: {lista}"))
            tasto = cmd                        # si va avanti col comando scritto, per vedere il resto
        r = json.loads(p.fav_step(tasto))
        if tasto.startswith("usa ") and GENERICA in r["text"]:
            problemi.append(f"{nome}: «{tasto}» ha dato la risposta generica del motore")
        return r

    comandi = percorsi.comandi(nome) if comandi is None else comandi
    limite = limite or len(comandi)
    i = 0
    while m.stato_partita == "in_corso" and i < limite:
        if i < len(comandi):
            cmd = comandi[i]
        elif giro:
            cmd = giro[(i - len(comandi)) % len(giro)]
        else:
            break
        if not m.dialogo_attivo:
            v = m.variabili
            if bevi and v.get("sete", 0) >= 5 and v.get("acqua", 0) >= 1:
                turno("bevi", cura=True)
            if mangia and v.get("fame", 0) >= 6 and v.get("cibo", 0) >= 1:
                turno("mangia qualcosa", cura=True)
            if m.stato_partita != "in_corso":
                break
        turno(cmd)
        i += 1
    finale = getattr(m, "messaggio_esito", "") or ""
    ok = (ATTESI[nome] in finale and m.stato_partita != "in_corso") if nome in ATTESI else True
    return ok, mancanti, m.turno_corrente, finale, m


def impronta(m):
    """Com'è finita una partita: l'esito, la bisaccia, i contatori, il luogo."""
    return (m.stato_partita, sorted(str(o) for o in m.inventario),
            sorted((k, v) for k, v in m.variabili.items() if isinstance(v, (int, str, bool))), m.posizione_giocatore)


# Le partite di trofei.py che non sono i dodici percorsi: le tre morti, il bluff, Vito a terra.
EXTRA = {"sete": "morte", "fame": "morte", "ferite": "morte", "bluff": "come scritta", "a_terra": "come scritta"}


def partite_dei_trofei(ui, problemi):
    """Ognuna col solo pulsante dev'essere finita dove finisce a comandi scritti."""
    tutto_ok = True
    for nome, dati in trofei.PARTITE.items():
        if nome not in EXTRA:
            continue
        parametri = {k: dati[k] for k in ("giro", "limite", "bevi", "mangia") if k in dati}
        prima = len(problemi)
        ok, mancanti, turni, finale, m = gioca(nome, ui, problemi, comandi=dati["comandi"], **parametri)
        _, _, _, _, scritta = gioca(nome, ui, [], comandi=dati["comandi"], a_pulsanti=False, **parametri)
        if impronta(m) != impronta(scritta):
            problemi.append(f"{nome}: coi pulsanti la partita finisce altrove che a comandi scritti: {impronta(m)} contro {impronta(scritta)}")
        if EXTRA[nome] == "morte" and m.stato_partita == "in_corso":
            problemi.append(f"{nome}: la partita avrebbe dovuto finire male e non è finita")
        ok = len(problemi) == prima
        tutto_ok &= ok
        print(f"{'OK ' if ok else 'KO '}{nome:13s} {turni:4d} turni  {m.stato_partita}"
              + (f"  ({mancanti} comandi senza pulsante)" if mancanti else ""))
    return tutto_ok


# --- il giocatore a caso che ha solo i pulsanti ------------------------------------
# Il peso di una CATEGORIA di pulsanti, non di ogni pulsante: le coppie «usa X su Y» sono decine e,
# pesate una per una, sommergerebbero tutto il resto.
_CATEGORIE = (("prendi ", 1.6), ("parla con ", 1.6), ("esamina ", 1.0), ("lascia ", 0.3), ("usa ", 1.0),
              ("attacca ", 0.3), ("minaccia ", 0.3), ("bevi", 0.05), ("mangia", 0.05))
_SERVIZIO = {"guarda": 0.15, "inventario": 0.1, "stato": 0.1, "aspetta": 0.15, "annulla": 0.05}
_DIREZIONI = {"nord", "sud", "est", "ovest", "su", "giù", "giu"}


def _categoria(c):
    if c in _DIREZIONI:
        return "uscita"
    if c in _SERVIZIO:
        return c
    if c in ("sì", "no"):
        return "conferma"
    return next((pre for pre, _ in _CATEGORIE if c.startswith(pre)), c)      # il resto sono i gesti: attingi, curati, getta…


def scegli(rng, stato, offerti, visti, carattere):
    """Un pulsante fra quelli offerti; ciò che non si è mai premuto in questo luogo pesa di più."""
    if stato.get("dialog"):
        return rng.choice(sorted(offerti))
    v = stato["counters"]
    if rng.random() < carattere["cura"]:
        if v.get("sete", 0) >= 5 and v.get("acqua", 0) >= 1 and "bevi" in offerti:
            return "bevi"
        if v.get("fame", 0) >= 6 and v.get("cibo", 0) >= 1 and "mangia qualcosa" in offerti:
            return "mangia qualcosa"
    per_categoria = collections.Counter(_categoria(c) for c in offerti)
    peso_categoria = dict(_CATEGORIE)
    scelte = []
    for c in sorted(offerti):
        cat = _categoria(c)
        if cat == "uscita":
            peso = 2.0
        elif cat in _SERVIZIO:
            peso = _SERVIZIO[cat]
        elif cat == "conferma":
            peso = 1.0
        else:
            peso = peso_categoria.get(cat, 1.0) / per_categoria[cat] * min(per_categoria[cat], 3)
            if cat == "parla con ":
                peso *= carattere["lingua"]
            elif cat in ("attacca ", "minaccia "):
                peso *= carattere["violenza"]
        scelte.append((c, peso * (1 + carattere["novita"] / (1 + visti[(stato["roomId"], c)]))))
    x = rng.random() * sum(w for _, w in scelte)
    for c, w in scelte:
        x -= w
        if x <= 0:
            return c
    return scelte[-1][0]


CARATTERI = {
    "turista":  dict(cura=1.0, novita=3.0, lingua=2.0, violenza=0.3, protetto=True),
    "attento":  dict(cura=0.95, novita=2.0, lingua=1.0, violenza=0.2, protetto=False),
    "violento": dict(cura=0.3, novita=1.0, lingua=0.5, violenza=2.0, protetto=False),
}


def punti_di_partenza():
    """Dove far cominciare: l'inizio e l'ingresso di ogni zona (i comandi del percorso A per arrivarci)."""
    # quello del collaudo, non motore/esploratore.py (partita.py mette il motore in testa al percorso)
    spec = importlib.util.spec_from_file_location("esploratore_collaudo", os.path.join(QUI, "esploratore.py"))
    esploratore = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(esploratore)
    zone = esploratore.ZONE
    p = nuovo_ponte()
    m = p._mondo
    punti = {"inizio": []}
    fatti, zona = [], zone.get(m.posizione_giocatore)
    for cmd in percorsi.comandi("A_peppe"):
        if m.stato_partita != "in_corso":
            break
        if not m.dialogo_attivo:
            v = m.variabili
            if v.get("sete", 0) >= 5 and v.get("acqua", 0) >= 1:
                fatti.append("bevi")
                p.fav_step("bevi")
            if v.get("fame", 0) >= 6 and v.get("cibo", 0) >= 1:
                fatti.append("mangia qualcosa")
                p.fav_step("mangia qualcosa")
        fatti.append(cmd)
        p.fav_step(cmd)
        z = zone.get(m.posizione_giocatore)
        if z and z != zona and z not in punti:
            punti[z] = list(fatti)
        zona = z or zona
    return punti


def esplora(ui, n, t, seme):
    punti = punti_di_partenza()
    nomi = list(punti)
    cop = dict(luoghi=set(), nodi=set(), presi=set(), verbi=collections.Counter(), finali=collections.Counter(), esiti=collections.Counter())
    visti = collections.Counter()
    anomalie = []
    comandi = 0
    for ci, (carattere, dati) in enumerate(CARATTERI.items()):
        for i in range(n):
            rng = random.Random(seme * 100000 + ci * 1000 + i)
            p = nuovo_ponte()
            p._mondo.rng = random.Random(seme * 100000 + ci * 1000 + i)
            m = p._mondo
            for cmd in punti[nomi[i % len(nomi)]]:
                p.fav_step(cmd)
            for _ in range(t):
                if m.stato_partita != "in_corso":
                    break
                stato = json.loads(p.fav_stato())
                azioni = json.loads(p.fav_azioni())
                offerti = ui.offerti(stato, azioni)
                if not offerti:
                    anomalie.append(f"{carattere} {i}: nessun pulsante a «{stato['room']}»")
                    break
                tasto = scegli(rng, stato, offerti, visti, dati)
                visti[(stato["roomId"], tasto)] += 1
                try:
                    p.fav_step(tasto)
                except Exception as e:           # un'eccezione del ponte è sempre un difetto
                    anomalie.append(f"{carattere} {i}: «{tasto}» a «{stato['room']}» solleva {type(e).__name__}: {e}")
                    break
                comandi += 1
                if not stato.get("dialog"):
                    cop["verbi"][tasto.split()[0]] += 1
                if dati["protetto"] and m.stato_partita == "in_corso":
                    v = m.variabili
                    if isinstance(v.get("sete"), int) and v["sete"] > 4:
                        v["sete"] = 2
                    if isinstance(v.get("fame"), int) and v["fame"] > 5:
                        v["fame"] = 2
                    if isinstance(v.get("vita"), int) and v["vita"] < 4:
                        v["vita"] = 10
                cop["luoghi"].add(m.posizione_giocatore)
                if m.nodo_dialogo:
                    cop["nodi"].add(m.nodo_dialogo)
                cop["presi"].update(m.inventario)
            cop["esiti"][m.stato_partita] += 1
            if m.stato_partita != "in_corso":
                cop["finali"][(getattr(m, "messaggio_esito", "") or "").replace("FINALE — ", "")[:60]] += 1
    m0 = nuovo_ponte()._mondo
    luoghi_tot, nodi_tot = set(m0.stanze), set(m0.dialogo_nodi)
    prendibili = {o.nome for o in m0.oggetti.values() if o.prendibile}
    print(f"{sum(cop['esiti'].values())} partite a pulsanti ({n} per carattere: {', '.join(CARATTERI)}), {comandi} pulsanti premuti, seme {seme}")
    print(f"- luoghi:   {len(cop['luoghi'] & luoghi_tot)}/{len(luoghi_tot)}" + (f"  mai: {', '.join(sorted(luoghi_tot - cop['luoghi']))}" if luoghi_tot - cop['luoghi'] else ""))
    print(f"- oggetti:  {len(cop['presi'] & prendibili)}/{len(prendibili)}" + (f"  mai: {', '.join(sorted(prendibili - cop['presi']))}" if prendibili - cop['presi'] else ""))
    print(f"- dialoghi: {len(cop['nodi'] & nodi_tot)}/{len(nodi_tot)}" + (f"  mai: {', '.join(sorted(nodi_tot - cop['nodi']))}" if nodi_tot - cop['nodi'] else ""))
    print(f"- esiti: {dict(cop['esiti'])}")
    for f, k in cop["finali"].most_common():
        print(f"    {k:3d} × {f}")
    print("- verbi premuti: " + ", ".join(f"{k} {v}" for k, v in cop["verbi"].most_common()))
    verbi_autore = sorted(v for v in getattr(m0, "verbi_personalizzati", []) if v not in cop["verbi"])
    if verbi_autore:
        print(f"- verbi d'autore mai premuti (non vuol dire che manchi il pulsante): {', '.join(verbi_autore)}")
    for a in anomalie:
        print("   · " + a)
    return not anomalie and luoghi_tot <= cop["luoghi"] and prendibili <= cop["presi"]


def main():
    ap = argparse.ArgumentParser(description="I finali, le morti e i gesti coi soli pulsanti.")
    ap.add_argument("--esplora", action="store_true", help="un giocatore a caso che ha solo i pulsanti")
    ap.add_argument("-n", type=int, default=6, help="partite per carattere (con --esplora)")
    ap.add_argument("-t", type=int, default=250, help="pulsanti al massimo per partita (con --esplora)")
    ap.add_argument("--seme", type=int, default=1)
    args = ap.parse_args()
    ui = Interfaccia()
    problemi, tutto_ok = [], True
    try:
        if args.esplora:
            return 0 if esplora(ui, args.n, args.t, args.seme) else 1
        for nome in percorsi.PERCORSI:
            prima = len(problemi)
            ok, mancanti, turni, finale, _ = gioca(nome, ui, problemi)
            ok = ok and len(problemi) == prima
            tutto_ok &= ok
            print(f"{'OK ' if ok else 'KO '}{nome:13s} {turni:4d} turni  {finale[:70]}"
                  + (f"  ({mancanti} comandi senza pulsante)" if mancanti else ""))
        tutto_ok &= partite_dei_trofei(ui, problemi)
    finally:
        ui.chiudi()
    for pr in problemi:
        print("   · " + pr)
    print("TUTTO OK" if tutto_ok else "CI SONO FALLIMENTI")
    return 0 if tutto_ok else 1


if __name__ == "__main__":
    sys.exit(main())
