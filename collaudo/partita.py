"""Partita di collaudo: il motore FAVELLA del progetto (../motore) pilotato da Python.

Base comune di finali.py, mirate.py ed esploratore.py. Una Partita compila
l'avventura, esegue comandi catturandone l'output e le eccezioni, e descrive la
scena (uscite, presenze, dialogo) con le stesse informazioni che l'interfaccia
riceve dal ponte fav_stato di app/src/lib/favellaRuntime.ts.
"""
import contextlib
import copy
import io
import os
import random
import sys
import traceback

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
sys.path.insert(0, os.path.join(RADICE, "motore"))

from compilatore import compila_mondo                       # noqa: E402
from gioco import elabora_comando, mostra_stanza           # noqa: E402
from libreria_azioni import LIBRERIA_AZIONI                 # noqa: E402
from strutture import ConseguenzaFinePartita, VERSIONE_MOTORE  # noqa: E402

GIOCO = os.path.join(RADICE, "prototipo", "il-viaggiatore.fav")
ESITI = os.path.join(QUI, "esiti")


def _compila():
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        m = compila_mondo(GIOCO)
    if m is None:
        raise SystemExit("L'avventura non compila:\n" + buf.getvalue())
    return m


_MONDO_BASE = None


def mondo_nuovo():
    """Un mondo appena compilato. La compilazione si fa una volta sola: le
    partite successive ne ricevono una copia profonda (molto più veloce)."""
    global _MONDO_BASE
    if _MONDO_BASE is None:
        _MONDO_BASE = _compila()
    return copy.deepcopy(_MONDO_BASE)


class Partita:
    def __init__(self, seme=None):
        self.m = mondo_nuovo()
        self.m.carica_azioni(LIBRERIA_AZIONI)
        self.m.imposta_posizione_iniziale()
        if seme is not None:
            self.m.rng = random.Random(seme)
        self.storia = []            # [(comando, output)]
        self.eccezioni = []         # [(comando, traceback)]
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            mostra_stanza(self.m)
        self.storia.append(("", buf.getvalue()))

    # --- comandi --------------------------------------------------------
    def esegui(self, cmd):
        """Esegue un comando. Restituisce l'output; un'eccezione del motore non
        interrompe la partita ma viene registrata (è un difetto da segnalare)."""
        buf = io.StringIO()
        try:
            with contextlib.redirect_stdout(buf):
                elabora_comando(self.m, cmd)
        except Exception:
            self.eccezioni.append((cmd, traceback.format_exc()))
            buf.write("\n[ECCEZIONE DEL MOTORE]\n")
        out = buf.getvalue()
        self.storia.append((cmd, out))
        return out

    @property
    def in_corso(self):
        return self.m.stato_partita == "in_corso"

    def v(self, nome, default=0):
        val = self.m.variabili.get(nome)
        return default if val is None else val

    # --- la scena, come la vede l'interfaccia ---------------------------
    def stanza(self):
        return self.m.trova_stanza(self.m.posizione_giocatore)

    def uscite(self):
        st = self.stanza()
        return list(st.uscite.keys()) if st else []

    def presenti(self):
        st = self.stanza()
        if not st or not self.m.c_e_luce():
            return []
        return list(st.oggetti.values())

    def inventario(self):
        return [self.m.oggetti[o] for o in self.m.inventario if o in self.m.oggetti]

    def opzioni_dialogo(self):
        if not self.m.dialogo_attivo:
            return []
        nodo = self.m.dialogo_nodi.get(self.m.nodo_dialogo)
        if nodo is None:
            return []
        return [o.testo for o in nodo.opzioni if o.disponibile(self.m)]

    def trascrizione(self):
        righe = []
        for cmd, out in self.storia:
            if cmd:
                righe.append("> " + cmd)
            righe.append(out.rstrip("\n"))
        return "\n".join(righe) + "\n"

    def salva(self, nome):
        os.makedirs(ESITI, exist_ok=True)
        percorso = os.path.join(ESITI, nome)
        with open(percorso, "w", encoding="utf-8") as f:
            f.write(self.trascrizione())
            for cmd, tb in self.eccezioni:
                f.write(f"\n=== ECCEZIONE al comando «{cmd}» ===\n{tb}")
        return percorso


def finali_dichiarati():
    """Tutte le conseguenze di fine partita presenti nell'avventura (regole,
    eventi, demoni, opzioni di dialogo): [(esito, messaggio)]. Serve a verificare
    che il collaudo copra ogni finale scritto, non solo quelli che ricordiamo."""
    m = mondo_nuovo()
    liste = [r.conseguenze for r in m.regole]
    liste += [e.conseguenze for e in m.eventi]
    liste += [d.conseguenze for d in m.demoni]
    for nodo in m.dialogo_nodi.values():
        liste += [o.conseguenze for o in nodo.opzioni]
    visti, out = set(), []
    for cons in liste:
        for c in cons:
            if isinstance(c, ConseguenzaFinePartita):
                chiave = (c.esito, c.messaggio or "")
                if chiave not in visti:
                    visti.add(chiave)
                    out.append(chiave)
    return out


def riga_finale(testo):
    """La riga del finale nel testo di una partita, se c'è."""
    for r in testo.splitlines():
        if r.startswith("FINALE"):
            return r
    return None
