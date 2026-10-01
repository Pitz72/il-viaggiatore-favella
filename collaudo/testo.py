"""Il testo del motore e della storia, come l'interfaccia lo distingue (app/src/gioco/testo.ts).

Il motore parla da sé in certi momenti: rifiuti, domande, servizio («Il tempo passa.»,
«Non senti nulla di particolare.», «Cosa vuoi esaminare?», «Vuoi davvero chiudere la
partita? (sì/no)»). L'interfaccia li mostra nello stile di sistema, non in quello della
prosa. Tre prove:

  1. ogni risposta del motore a una batteria di comandi incompleti, sbagliati o
     inutili (ogni verbo per ogni genere di bersaglio) è un blocco di sistema; ciò che
     non lo è e non viene dalla storia fa fallire la prova, perché è un messaggio nuovo;
  2. nessuna riga scritta nei .fav somiglia a un messaggio del motore (se una battuta
     finisse nello stile di sistema, sparirebbe dalla storia);
  3. ogni personaggio dichiarato nei .fav è fra quelli che l'interfaccia riconosce
     (altrimenti le sue battute finiscono nella prosa: è successo a Imma, nella 1.7.0);
  4. ogni «voce» (quello che si dice di te) dichiarata nei .fav ha la sua riga a lato
     dello schermo, e l'interfaccia non ne ha di troppo;
  5. ogni messaggio dei demoni («Ogni turno se …: dire "…"»: la sete, la fame, il cane, il
     sole, il vento) è di corpo, cioè va in margine come una sensazione: se si riscrive una
     riga in `.fav` e non in `testo.ts`, la riga passa nella prosa del narratore;
  6. l'avviso d'apertura dice, parola per parola, quello che l'autore ha scritto.

Uso:  python testo.py      (esce con 1 se una prova fallisce; serve `npm ci --prefix app`)
"""
import glob
import io
import json
import os
import re
import subprocess
import sys

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
sys.path.insert(0, QUI)

from partita import Partita, mondo_nuovo   # noqa: E402  (per primo: mette ../motore in testa al percorso)
from libreria_azioni import LIBRERIA_AZIONI  # noqa: E402

NODE = os.path.join(RADICE, "app", "scripts", "analizza-testo.mjs")
FAV = "\n".join(io.open(f, encoding="utf-8").read() for f in sorted(glob.glob(os.path.join(RADICE, "prototipo", "*.fav"))))
esiti = []


def prova(nome, ok, dettaglio=""):
    esiti.append(ok)
    print(f"{'OK ' if ok else 'KO '}{nome}" + (f"  → {dettaglio}" if dettaglio and not ok else ""))


def analizza(testi):
    proc = subprocess.run(["node", NODE], input=json.dumps(testi), capture_output=True, text=True, encoding="utf-8")
    if proc.returncode != 0:
        print(proc.stderr)
        sys.exit(2)
    return json.loads(proc.stdout)


def della_storia(riga):
    """Una riga che viene dai .fav: una sua frase intera (almeno 20 caratteri) vi compare."""
    frasi = [f.strip() for f in re.split(r"(?<=[.!?»])\s+", riga) if len(f.strip()) >= 20]
    return any(f in FAV for f in frasi)


# ---------------------------------------------------------------------------
# 1. la batteria: ogni verbo con ogni genere di bersaglio
# ---------------------------------------------------------------------------
VERBI = sorted({n for a in LIBRERIA_AZIONI.values() for n in a.nomi})
BERSAGLI = ["", "mappa", "tanica", "xyz", "Nunzio", "mappa con tanica", "su"]
SERVIZIO = ["aspetta", "ascolta", "annusa", "aiuto", "inventario", "i", "stato", "esci", "ricomincia", "annulla",
            "ancora", "carica", "prendi tutto", "prendi mappa", "lascia tanica", "lascia xyz",
            "parla con", "parla con xyz", "chiedi a Nunzio", "nord", "sud", "ovest", "su", "giù"]
righe = {}                                           # riga → comando che l'ha prodotta


def raccogli(p, cmd):
    try:
        out = p.esegui(cmd)
    except Exception:                                # un guasto del motore non è affare del testo
        return
    for r in out.splitlines():
        t = r.strip()
        if t and not t.startswith("---") and not t.startswith(("Uscite:", "Puoi vedere")):
            righe.setdefault(r.rstrip(), cmd)


def scena():
    p = Partita(seme=1)
    p.m.posizione_giocatore = "casa"
    for c in ("mappa", "biglietto"):
        p.m.inventario.add(c)
        p.m.oggetti[c].posizione = "inventario"
    return p


for v in VERBI:
    for b in BERSAGLI:
        raccogli(scena(), f"{v} {b}".strip())
for c in SERVIZIO:
    p = scena()
    raccogli(p, c)
    if p.m.dialogo_attivo or getattr(p.m, "_in_conferma", None):
        raccogli(p, "no")
p = scena()
raccogli(p, "esci")
raccogli(p, "sì")

elenco = list(righe)
blocchi = analizza(elenco)["blocchi"]
da_vedere, di_sistema = [], 0
for riga, bl in zip(elenco, blocchi):
    tipi = {b["tipo"] for b in bl}
    if tipi == {"sistema"}:
        di_sistema += 1
    elif not della_storia(riga) and "prosa" in tipi:
        da_vedere.append(f"«{righe[riga]}» → {riga.strip()[:90]}")
prova(f"le risposte del motore sono nello stile di sistema ({di_sistema} messaggi diversi, "
      f"{len(VERBI) * len(BERSAGLI) + len(SERVIZIO)} comandi)", not da_vedere, "\n    ".join([""] + da_vedere[:40]))

# i messaggi che l'autore del progetto ha segnalato a mano
for msg in ["Il tempo passa.", "Non senti nulla di particolare.", "Cosa vuoi esaminare?", "Attacca che cosa?",
            "Vuoi davvero chiudere la partita? (sì/no) ", "Vuoi davvero ricominciare da capo? (sì/no)"]:
    prova(f"«{msg.strip()}» è di sistema", {b["tipo"] for b in analizza([msg])["blocchi"][0]} == {"sistema"})

# ---------------------------------------------------------------------------
# 2. la storia non somiglia al motore
# ---------------------------------------------------------------------------
frasi = []
for m in re.finditer(r'"((?:[^"\\]|\\.)+)"', FAV):
    t = m.group(1)
    if len(t) >= 8 and " " in t:
        frasi.append(t)
risposte = analizza(frasi)["blocchi"]
scambiate = [f[:80] for f, bl in zip(frasi, risposte) if bl and bl[0]["tipo"] == "sistema"]
prova(f"nessuna delle {len(frasi)} frasi della storia finisce nello stile di sistema", not scambiate,
      "\n    ".join([""] + scambiate[:12]))

# ---------------------------------------------------------------------------
# 3. i personaggi parlano come tali
# ---------------------------------------------------------------------------
m = mondo_nuovo()
persone = sorted(o.nome_visualizzato for o in m.oggetti.values() if o.is_personaggio)
note = set(analizza([])["personaggi"])
mancano = [n for n in persone if n not in note]
prova(f"tutti i {len(persone)} personaggi sono noti all'interfaccia", not mancano, ", ".join(mancano))
battute = analizza([f"{n}: «Una battuta.»" for n in persone])["blocchi"]
prova("…e le loro battute sono battute", all(bl and bl[0]["tipo"] == "battuta" for bl in battute))

# ---------------------------------------------------------------------------
# 4. le voci che corrono su di te
# ---------------------------------------------------------------------------
dichiarate = set(re.findall(r"^Lo stato della voce (.+) è uno stato\.$", FAV, re.M))
righe_voci = set(analizza([])["voci"])
prova(f"ogni voce dichiarata nei .fav ({len(dichiarate)}) ha la sua riga a lato dello schermo",
      dichiarate == righe_voci, f"nei .fav: {sorted(dichiarate)}; nell'interfaccia: {sorted(righe_voci)}")

# ---------------------------------------------------------------------------
# 5. le sensazioni del corpo vanno in margine
# ---------------------------------------------------------------------------
demoni = []
for riga in FAV.splitlines():
    if riga.startswith("Ogni turno"):
        m = re.search(r'dire "((?:[^"\\]|\\.)+)"', riga)
        if m:
            demoni.append(m.group(1))
tipi = [bl[0]["tipo"] if bl else None for bl in analizza(demoni)["blocchi"]]
fuori = [d[:70] for d, t in zip(demoni, tipi) if t != "corpo"]
prova(f"i {len(demoni)} messaggi dei demoni «Ogni turno» sono di corpo", not fuori, "\n    ".join([""] + fuori))

# ---------------------------------------------------------------------------
# 6. l'avviso d'apertura (app/src/components/Avviso.tsx) è quello dell'autore
# ---------------------------------------------------------------------------
AVVISO = ("Questo gioco, nato come demo del linguaggio di programmazione e motore di narrativa interattiva "
          "Favella1, è stato generato con un importante ausilio dei modelli LLM della famiglia Claude. "
          "Lo scopo di questo progetto è quello di mostrare in che modo, tramite design e programmazione, "
          "uno script narrativo Favella1 possa diventare un gioco distribuibile. Buon divertimento.")
sorgente = io.open(os.path.join(RADICE, "app", "src", "components", "Avviso.tsx"), encoding="utf-8").read()
blocco = re.search(r"TESTO_AVVISO\s*=(.*?);", sorgente, re.S).group(1)
prova("l'avviso d'apertura dice quello che l'autore ha scritto, senza una parola di più né di meno",
      "".join(re.findall(r'"((?:[^"\\]|\\.)*)"', blocco)) == AVVISO, blocco[:120])
prova("…e sta fra i loghi e il trailer", re.search(r'fase === "loghi" && <Loghi onFine=\{\(\) => setFase\("avviso"\)\}',
      io.open(os.path.join(RADICE, "app", "src", "App.tsx"), encoding="utf-8").read()) is not None)

print("TUTTO OK" if all(esiti) else "CI SONO FALLIMENTI")
sys.exit(0 if all(esiti) else 1)
