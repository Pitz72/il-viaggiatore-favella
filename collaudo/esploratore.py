"""L'esploratore: un collaudatore che NON va dritto per dritto.

Gioca tante partite a caso, con caratteri diversi, e fa quello che fanno i
giocatori veri: entra ovunque, esamina tutto, prende e lascia, parla con tutti e
sceglie risposte a caso, usa le cose sulle cose, attacca chi non dovrebbe,
dimentica di bere, sbaglia a scrivere, chiede oggetti che non ci sono, annulla.
Non cerca di vincere: cerca i punti in cui il gioco si rompe.

Parte dall'inizio e anche da ogni zona (i punti di partenza si ricavano giocando
il percorso A fino all'ingresso di ciascuna zona), così arriva anche al finale
del gioco senza doverci arrivare per caso.

Cosa segnala (ogni anomalia una volta, con la trascrizione della prima partita
in cui è comparsa, in collaudo/esiti/):
  ECCEZIONE   il motore solleva un'eccezione Python
  ERRORE      l'output contiene un errore interno del motore
  SEGNAPOSTO  un [nome] non sostituito nel testo
  NEGATIVO    acqua o cibo sotto zero
  CAPIENZA    più oggetti in bisaccia della capienza
  INVISIBILE  una cosa elencata tra i presenti che il parser dice di non vedere
  USCITA      un'uscita elencata che rifiuta il passaggio col messaggio generico
  DIALOGO     una conversazione senza nessuna risposta disponibile
  SILENZIO    un comando che non produce nessun testo
  STALLO      molti turni vivi senza scoprire luoghi nuovi (possibile vicolo cieco)

Il motore salva un'istantanea del mondo a ogni turno (per ANNULLA): conta circa
75 comandi al secondo, quindi il giro predefinito dura qualche minuto.

E misura la copertura: luoghi visitati, nodi di dialogo toccati, oggetti presi,
finali e morti raggiunti.

Uso:  python esploratore.py                  20 partite per carattere, 250 comandi
      python esploratore.py -n 20 -t 200      meno partite, più corte
      python esploratore.py --seme 7          altra sequenza casuale (riproducibile)
"""
import argparse
import collections
import copy
import os
import random
import re
import sys
import time

import percorsi
from partita import Partita, ESITI, RADICE, VERSIONE_MOTORE, finali_dichiarati, riga_finale

sys.path.insert(0, os.path.join(RADICE, "motore"))
from favella_utils import normalizza_nome  # noqa: E402

# --- la mappa delle zone, letta dai .fav --------------------------------------
_RE_STANZA = re.compile(r"^(.+?) è una stanza\.\s*$")


def zone_delle_stanze():
    zone = {}
    cartella = os.path.join(RADICE, "prototipo")
    for f in sorted(os.listdir(cartella)):
        if not f.startswith("z") or not f.endswith(".fav"):
            continue
        zona = f.split("-")[0]
        for riga in open(os.path.join(cartella, f), encoding="utf-8"):
            m = _RE_STANZA.match(riga)
            if m:
                zone[normalizza_nome(m.group(1))] = zona
    return zone


ZONE = zone_delle_stanze()

# --- i caratteri dei giocatori ------------------------------------------------
# errore: quanto spesso sbaglia; cura: se beve/mangia quando serve;
# novita: quanto preferisce ciò che non ha ancora provato; lingua: parlare;
# violenza: attaccare e minacciare; annulla: usare ANNULLA.
# protetto: il «turista» ha il corpo protetto (sete, fame e ferite vengono
# riportate a valori innocui dopo ogni comando). Non è un giocatore reale: serve
# a setacciare testi e logica di tutte le zone senza morire a metà strada.
CARATTERI = {
    "turista":       dict(errore=0.10, cura=1.00, novita=3.0, lingua=2.0, violenza=0.3, annulla=0.01, protetto=True),
    "curioso":       dict(errore=0.05, cura=0.95, novita=2.0, lingua=1.0, violenza=0.2, annulla=0.01),
    "maldestro":     dict(errore=0.45, cura=0.80, novita=1.0, lingua=1.0, violenza=0.3, annulla=0.05),
    "sconsiderato":  dict(errore=0.10, cura=0.15, novita=1.0, lingua=0.5, violenza=2.0, annulla=0.00),
    "chiacchierone": dict(errore=0.05, cura=0.90, novita=1.5, lingua=3.0, violenza=0.1, annulla=0.02),
}

VERBI_SEMPLICI = ["guarda", "stato", "inventario", "bevi", "mangia qualcosa", "attingi",
                  "bevi salmastra", "curati", "aspetta", "ancora", "aiuto"]
VERBI_SULLE_COSE = ["esamina", "prendi", "lascia", "attacca", "minaccia", "getta", "lancia", "apri", "leggi", "spingi"]
PAROLE_A_CASO = ["xyzzy", "vola", "salta", "piangi", "canta una canzone", "dormi", "prega",
                 "scava", "nuota", "chiama aiuto", "compra acqua", "ruba", "uccidi tutti"]
COSE_INESISTENTI = ["la luna", "un cammello", "il telefono", "la chiave d'oro", "l'acqua santa", "il treno"]


def _nome(o):
    return o.nome_visualizzato.lower()


def refuso(rng, s):
    if len(s) < 4:
        return s + s[-1]
    i = rng.randrange(1, len(s) - 1)
    op = rng.randrange(4)
    if op == 0:
        return s[:i] + s[i + 1] + s[i] + s[i + 2:]      # due lettere scambiate
    if op == 1:
        return s[:i] + s[i + 1:]                           # una lettera in meno
    if op == 2:
        return s[:i] + s[i] + s[i:]                        # una lettera doppia
    return s.upper() if rng.random() < 0.5 else s.replace("'", "’")  # maiuscole, apostrofo tipografico


class Esploratore:
    def __init__(self, carattere, rng, provati):
        self.c = CARATTERI[carattere]
        self.nome = carattere
        self.rng = rng
        self.provati = provati          # Counter globale (stanza, comando) → volte

    def candidati(self, p):
        """(comando, peso) possibili nella scena attuale."""
        rng, c = self.rng, self.c
        m = p.m
        cand = []
        if m.dialogo_attivo:
            opz = p.opzioni_dialogo()
            for i, testo in enumerate(opz, 1):
                cand.append((str(i), 3.0))
                if len(testo) > 8 and rng.random() < 0.3:
                    cand.append((testo.split()[rng.randrange(len(testo.split()))], 0.5))   # testo parziale
            cand += [("esci", 0.3), (str(len(opz) + 1), 0.2), ("non so", 0.2)]
            return cand

        stanza = m.posizione_giocatore
        presenti, inv = p.presenti(), p.inventario()
        for d in p.uscite():
            cand.append((d, 2.0))
        for o in presenti:
            n = _nome(o)
            cand.append((f"esamina {n}", 1.0))
            if o.is_personaggio:
                cand.append((f"parla con {n}", 1.5 * c["lingua"]))
                cand += [(f"attacca {n}", 0.3 * c["violenza"]), (f"minaccia {n}", 0.3 * c["violenza"])]
            else:
                cand.append((f"prendi {n}", 1.5 if o.prendibile else 0.3))
                cand.append((f"attacca {n}", 0.1 * c["violenza"]))
        for o in inv:
            n = _nome(o)
            cand += [(f"esamina {n}", 0.4), (f"lascia {n}", 0.3)]
            for bersaglio in presenti:
                cand.append((f"usa {n} su {_nome(bersaglio)}", 0.6))
            if rng.random() < 0.2:
                cand.append((f"{rng.choice(VERBI_SULLE_COSE)} {n}", 0.3))
        for v in VERBI_SEMPLICI:
            cand.append((v, 0.25))
        for v in sorted(m.verbi_personalizzati):
            bersagli = presenti + inv
            if bersagli:
                cand.append((f"{v} {_nome(rng.choice(bersagli))}", 0.3))
            else:
                cand.append((v, 0.3))
        cand.append(("annulla", c["annulla"] * 10))
        # la novità: ciò che non si è mai provato in questo luogo pesa di più
        return [(cmd, w * (1.0 + c["novita"] / (1 + self.provati[(stanza, cmd)]))) for cmd, w in cand]

    def sbaglio(self, p, buono):
        rng = self.rng
        tipo = rng.randrange(7)
        if tipo == 0:
            return refuso(rng, buono)
        if tipo == 1:
            return rng.choice(PAROLE_A_CASO)
        if tipo == 2:
            return f"{rng.choice(['prendi', 'esamina', 'usa', 'parla con'])} {rng.choice(COSE_INESISTENTI)}"
        if tipo == 3:
            altrove = [o for o in p.m.oggetti.values() if o.posizione not in (p.m.posizione_giocatore, "inventario")]
            return f"prendi {_nome(rng.choice(altrove))}" if altrove else "prendi tutto"
        if tipo == 4:
            return rng.choice(["", "   ", "?", "...", "nord!", "vai", "prendi", "usa", "1", "0", "-3"])
        if tipo == 5:
            return " ".join([buono] * rng.randrange(2, 5))
        return buono + " " + rng.choice(["subito", "per favore", "adesso", "con cura"])

    def scegli(self, p):
        rng, c = self.rng, self.c
        if not p.m.dialogo_attivo and rng.random() < c["cura"]:
            if p.v("sete") >= 5 and p.v("acqua") >= 1:
                return "bevi"
            if p.v("fame") >= 6 and p.v("cibo") >= 1:
                return "mangia qualcosa"
        cand = self.candidati(p)
        tot = sum(w for _, w in cand)
        x = rng.random() * tot
        for cmd, w in cand:
            x -= w
            if x <= 0:
                break
        if rng.random() < c["errore"]:
            return self.sbaglio(p, cmd)
        return cmd


# --- controlli dopo ogni comando ------------------------------------------------
_RE_SEGNAPOSTO = re.compile(r"\[[a-zà-ù_ ']{2,}\]", re.IGNORECASE)
_NEUTRO_USCITA = "Non puoi andare in quella direzione."


class Registro:
    def __init__(self):
        self.anomalie = collections.OrderedDict()   # firma → dict(tipo, descrizione, volte, file)

    def segnala(self, tipo, descrizione, p, firma=None):
        firma = firma or (tipo, descrizione)
        a = self.anomalie.get(firma)
        if a:
            a["volte"] += 1
            return
        n = len(self.anomalie) + 1
        nome = f"anomalia-{n:02d}-{tipo.lower()}.txt"
        p.salva(nome)
        self.anomalie[firma] = dict(tipo=tipo, descrizione=descrizione, volte=1, file=nome)


def controlla(p, cmd, out, reg, prima):
    m = p.m
    if p.eccezioni and p.eccezioni[-1][0] == cmd and len(p.eccezioni) > prima["eccezioni"]:
        ultima = p.eccezioni[-1][1].strip().splitlines()[-1]
        reg.segnala("ECCEZIONE", f"«{cmd}» → {ultima}", p, ("ECCEZIONE", ultima))
    if "[ERRORE" in out:
        reg.segnala("ERRORE", f"«{cmd}» → {out.strip()[:160]}", p, ("ERRORE", out.strip()[:80]))
    for s in _RE_SEGNAPOSTO.findall(out):
        reg.segnala("SEGNAPOSTO", f"{s} nel testo dopo «{cmd}»", p, ("SEGNAPOSTO", s.lower()))
    for k in ("acqua", "cibo"):
        if p.v(k) < 0:
            reg.segnala("NEGATIVO", f"{k} = {p.v(k)} dopo «{cmd}»", p, ("NEGATIVO", k))
    try:
        cap = m.capacita_attuale()
    except Exception:
        cap = None
    if cap is not None and len(m.inventario) > cap:
        reg.segnala("CAPIENZA", f"{len(m.inventario)} oggetti su {cap} posti dopo «{cmd}»", p, ("CAPIENZA", cmd.split()[0] if cmd else ""))
    if cmd.startswith("esamina ") and prima["presenti"] and cmd[8:] in prima["presenti"] and out.startswith("Non vedo"):
        reg.segnala("INVISIBILE", f"«{cmd[8:]}» è tra i presenti ma il parser non lo vede", p, ("INVISIBILE", cmd[8:]))
    if cmd in prima["uscite"] and out.strip().startswith(_NEUTRO_USCITA):
        reg.segnala("USCITA", f"uscita «{cmd}» da {prima['stanza']} elencata ma rifiutata", p, ("USCITA", prima["stanza"], cmd))
    if m.dialogo_attivo and not p.opzioni_dialogo():
        reg.segnala("DIALOGO", f"conversazione con {m.dialogo_attivo} al nodo «{m.nodo_dialogo}» senza risposte", p,
                    ("DIALOGO", m.dialogo_attivo, m.nodo_dialogo))
    if cmd.strip() and not out.strip() and p.in_corso:
        reg.segnala("SILENZIO", f"«{cmd}» non produce testo (in {m.posizione_giocatore})", p, ("SILENZIO", cmd.split()[0]))


# --- punti di partenza: l'inizio e l'ingresso di ogni zona -------------------------
def punti_di_partenza():
    p = Partita(seme=1)
    punti = {"inizio": copy.deepcopy(p)}
    zona = ZONE.get(p.m.posizione_giocatore)
    for cmd in percorsi.comandi("A_peppe"):
        if not p.in_corso:
            break
        if not p.m.dialogo_attivo:
            if p.v("sete") >= 5 and p.v("acqua") >= 1:
                p.esegui("bevi")
            if p.v("fame") >= 6 and p.v("cibo") >= 1:
                p.esegui("mangia qualcosa")
        p.esegui(cmd)
        z = ZONE.get(p.m.posizione_giocatore)
        if z and z != zona and z not in punti:
            punti[z] = copy.deepcopy(p)
        zona = z or zona
    return punti


def gioca(partenza, carattere, seme, turni, provati, reg, cop):
    rng = random.Random(seme)
    p = copy.deepcopy(partenza)
    p.m.rng = random.Random(seme)
    es = Esploratore(carattere, rng, provati)
    visitati_qui = set()
    ultimo_nuovo = 0
    stallo_segnalato = False
    for n in range(turni):
        if not p.in_corso:
            break
        prima = dict(eccezioni=len(p.eccezioni), presenti={_nome(o) for o in p.presenti()},
                     uscite=set(p.uscite()), stanza=p.m.posizione_giocatore)
        cmd = es.scegli(p)
        provati[(p.m.posizione_giocatore, cmd)] += 1
        out = p.esegui(cmd)
        controlla(p, cmd, out, reg, prima)
        if es.c.get("protetto") and p.in_corso:
            v = p.m.variabili
            if isinstance(v.get("sete"), int) and v["sete"] > 4: v["sete"] = 2
            if isinstance(v.get("fame"), int) and v["fame"] > 5: v["fame"] = 2
            if isinstance(v.get("vita"), int) and v["vita"] < 4: v["vita"] = 10
        s = p.m.posizione_giocatore
        cop["luoghi"].add(s)
        if s not in visitati_qui:
            visitati_qui.add(s)
            ultimo_nuovo = n
        if p.m.nodo_dialogo:
            cop["nodi"].add(p.m.nodo_dialogo)
        cop["presi"].update(p.m.inventario)
        if (not stallo_segnalato and p.in_corso and not p.m.dialogo_attivo and n - ultimo_nuovo > 150):
            stallo_segnalato = True
            cop["stalli"].append((carattere, seme, s, ZONE.get(s, "?")))
    esito = p.m.stato_partita
    finale = riga_finale(p.trascrizione()) or (p.m.messaggio_esito or "")
    return p, esito, finale


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("-n", type=int, default=20, help="partite per carattere (default 20)")
    ap.add_argument("-t", type=int, default=250, help="comandi massimi per partita (default 250)")
    ap.add_argument("--seme", type=int, default=1, help="seme della sequenza casuale")
    args = ap.parse_args()

    for f in os.listdir(ESITI) if os.path.isdir(ESITI) else []:
        if f.startswith("anomalia-"):
            os.remove(os.path.join(ESITI, f))

    t0 = time.time()
    punti = punti_di_partenza()
    reg = Registro()
    provati = collections.Counter()
    cop = dict(luoghi=set(), nodi=set(), presi=set(), stalli=[])
    esiti = collections.Counter()
    finali = collections.Counter()
    comandi = 0
    nomi_punti = list(punti)
    for ci, carattere in enumerate(CARATTERI):
        for i in range(args.n):
            seme = args.seme * 100000 + ci * 1000 + i
            partenza = punti[nomi_punti[i % len(nomi_punti)]]
            p, esito, finale = gioca(partenza, carattere, seme, args.t, provati, reg, cop)
            comandi += len(p.storia)
            esiti[esito] += 1
            if esito != "in_corso":
                finali[finale.replace("FINALE — ", "")[:70]] += 1

    m0 = Partita().m
    luoghi_tot = set(m0.stanze)
    nodi_tot = set(m0.dialogo_nodi)
    prendibili = {o.nome for o in m0.oggetti.values() if o.prendibile}
    dichiarati = [msg for _, msg in finali_dichiarati()]

    righe = []
    w = righe.append
    w(f"# Esploratore — motore FAVELLA {VERSIONE_MOTORE}")
    w("")
    w(f"{sum(esiti.values())} partite ({args.n} per carattere: {', '.join(CARATTERI)}), "
      f"{comandi} comandi, seme {args.seme}, {time.time() - t0:.0f} s.")
    w(f"Partenze: {', '.join(nomi_punti)}.")
    w("")
    w("## Copertura")
    w(f"- Luoghi visitati: {len(cop['luoghi'] & luoghi_tot)}/{len(luoghi_tot)}"
      + (f" — mai: {', '.join(sorted(luoghi_tot - cop['luoghi']))}" if luoghi_tot - cop['luoghi'] else ""))
    w(f"- Nodi di dialogo toccati: {len(cop['nodi'] & nodi_tot)}/{len(nodi_tot)}"
      + (f" — mai: {', '.join(sorted(nodi_tot - cop['nodi']))}" if nodi_tot - cop['nodi'] else ""))
    w(f"- Oggetti presi almeno una volta: {len(cop['presi'] & prendibili)}/{len(prendibili)}"
      + (f" — mai: {', '.join(sorted(prendibili - cop['presi']))}" if prendibili - cop['presi'] else ""))
    w(f"- Esiti: " + ", ".join(f"{k} {v}" for k, v in esiti.most_common()))
    for fin, v in finali.most_common():
        w(f"  - {v:3d} × {fin}")
    mai = [d for d in dichiarati if not any(d.replace('FINALE — ', '')[:70] == f for f in finali)]
    if mai:
        w(f"- Finali mai raggiunti per caso ({len(mai)}; li copre finali.py): "
          + "; ".join(d.replace('FINALE — ', '')[:50] + "…" for d in mai))
    w("")
    w(f"## Anomalie ({len(reg.anomalie)})")
    if not reg.anomalie:
        w("Nessuna.")
    for a in reg.anomalie.values():
        w(f"- **{a['tipo']}** ×{a['volte']}: {a['descrizione']}  (esiti/{a['file']})")
    w("")
    w(f"## Stalli ({len(cop['stalli'])})")
    w("Partite rimaste vive per oltre 150 comandi senza scoprire luoghi nuovi: di solito un "
      "giocatore che gira a vuoto, a volte un vicolo cieco. Vanno guardate a mano.")
    per_luogo = collections.Counter((z, s) for _, _, s, z in cop["stalli"])
    for (z, s), v in per_luogo.most_common(12):
        w(f"- {v:3d} × {z} · {s}")
    testo = "\n".join(righe) + "\n"
    os.makedirs(ESITI, exist_ok=True)
    with open(os.path.join(ESITI, "esploratore-rapporto.md"), "w", encoding="utf-8") as f:
        f.write(testo)
    print(testo)
    gravi = [a for a in reg.anomalie.values() if a["tipo"] in ("ECCEZIONE", "ERRORE", "SEGNAPOSTO", "NEGATIVO", "INVISIBILE", "USCITA")]
    return 1 if gravi else 0


if __name__ == "__main__":
    sys.exit(main())
