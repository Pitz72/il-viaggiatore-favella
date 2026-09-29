"""I finali si raggiungono anche solo con i pulsanti.

Gioca i sei percorsi della storia (percorsi.py) senza tastiera. Prima di ogni
comando chiede all'interfaccia vera (app/src/gioco/azioni.ts → comandiOfferti,
eseguita con Node) che cosa offrono i pulsanti in quel momento, e manda il
pulsante che dice la stessa cosa del comando del percorso: nei dialoghi il
numero della risposta, altrove il comando del pulsante, parola per parola
(«usa le pastiglie sulla pompa», non «usa le pastiglie su la pompa»). Se un
comando del percorso non ha un pulsante, il collaudo lo nomina, col luogo e con
i pulsanti che c'erano.

Due controlli in più, a ogni turno:
  · ogni combinazione «usa X su Y» offerta dice qualcosa di questo momento: mai
    la risposta generica del motore («non ha alcun effetto particolare»);
  · una combinazione offerta, anteprima alla mano, è capita dal motore.

Il pilota cura il corpo come in finali.py, ma col pannello delle dosi. Non
servono pulsanti per «inventario» e «stato»: la bisaccia e il corpo stanno
sempre a lato dello schermo.

Uso:  python pulsanti.py      (esce con 1 se qualcosa non va; serve `npm ci` in app/)
"""
import importlib.util
import json
import os
import re
import subprocess
import sys

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
sys.path.insert(0, os.path.join(RADICE, "motore"))
sys.path.insert(0, QUI)

import percorsi  # noqa: E402
from finali import ATTESI  # noqa: E402

PONTE = os.path.join(RADICE, "app", "src", "lib", "ponte.py")
GIOCO = os.path.join(RADICE, "prototipo", "il-viaggiatore.fav")
NODE = os.path.join(RADICE, "app", "scripts", "comandi-offerti.mjs")
INFORMATIVI = {"inventario", "stato"}
GENERICA = "non ha alcun effetto particolare"
_n = [0]


def nuovo_ponte():
    _n[0] += 1
    spec = importlib.util.spec_from_file_location(f"ponte_p{_n[0]}", PONTE)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.fav_boot(GIOCO)
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


def gioca(nome, ui, problemi):
    p = nuovo_ponte()
    m = p._mondo
    mancanti = 0

    def turno(cmd, *, cura=False):
        nonlocal mancanti
        stato = json.loads(p.fav_stato())
        azioni = json.loads(p.fav_azioni())
        offerti = ui.offerti(stato, azioni)
        for c in azioni["coppie"]:
            a = json.loads(p.fav_anteprima(c["cmd"]))
            if not a["ok"] or not a["capito"] or GENERICA in a["testo"]:
                problemi.append(f"{nome}: a «{stato['room']}» il pulsante «{c['cmd']}» non dice niente di adesso: {a['testo'].strip()[:90]}")
        tasto = pulsante_per(cmd, stato, offerti)
        if tasto is None:
            mancanti += 1
            lista = ", ".join(sorted(offerti))
            problemi.append(f"{nome}: a «{stato['room']}» nessun pulsante per «{cmd}»" + ("" if cura else f"\n      c'erano: {lista}"))
            tasto = cmd                        # si va avanti col comando scritto, per vedere il resto
        r = json.loads(p.fav_step(tasto))
        if tasto.startswith("usa ") and GENERICA in r["text"]:
            problemi.append(f"{nome}: «{tasto}» ha dato la risposta generica del motore")
        return r

    for cmd in percorsi.comandi(nome):
        if m.stato_partita != "in_corso":
            break
        if cmd in INFORMATIVI:
            continue
        if not m.dialogo_attivo:
            v = m.variabili
            if v.get("sete", 0) >= 5 and v.get("acqua", 0) >= 1:
                turno("bevi", cura=True)
            if v.get("fame", 0) >= 6 and v.get("cibo", 0) >= 1:
                turno("mangia qualcosa", cura=True)
            if m.stato_partita != "in_corso":
                break
        turno(cmd)
    finale = getattr(m, "messaggio_esito", "") or ""
    ok = ATTESI[nome] in finale and m.stato_partita != "in_corso"
    return ok, mancanti, m.turno_corrente, finale


def main():
    ui = Interfaccia()
    problemi, tutto_ok = [], True
    try:
        for nome in percorsi.PERCORSI:
            prima = len(problemi)
            ok, mancanti, turni, finale = gioca(nome, ui, problemi)
            ok = ok and len(problemi) == prima
            tutto_ok &= ok
            print(f"{'OK ' if ok else 'KO '}{nome:13s} {turni:4d} turni  {finale[:70]}"
                  + (f"  ({mancanti} comandi senza pulsante)" if mancanti else ""))
    finally:
        ui.chiudi()
    for pr in problemi:
        print("   · " + pr)
    print("TUTTO OK" if tutto_ok else "CI SONO FALLIMENTI")
    return 0 if tutto_ok else 1


if __name__ == "__main__":
    sys.exit(main())
