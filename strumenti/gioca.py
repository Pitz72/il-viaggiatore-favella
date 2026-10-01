"""Il banco di gioco: giocare il Viaggiatore leggendo le risposte come un giocatore.

Pilota il ponte VERO dell'app (app/src/lib/ponte.py: gli stessi «mangia» e «bere»
soli, le stesse azioni offerte ai pulsanti), non il motore nudo come fa
collaudo/partita.py. Serve a due cose che i collaudi non fanno:

  1. GIOCARE A MANO. Si scrive un file di comandi (uno per riga) e lo si rigioca
     ogni volta da capo, aggiungendo righe in fondo man mano che si capisce dove si
     è. Si vedono gli ultimi N turni come li vede il giocatore, con sotto ogni
     risposta la riga delle scorte; in fondo la scena (uscite, presenze, bisaccia,
     azioni che i pulsanti offrirebbero). Il diario della partita intera va su file.

  2. MISURARE L'EQUILIBRIO. Un pilota «a soglie» rigioca un percorso su più semi,
     bevendo e mangiando solo quando sete e fame arrivano alle soglie date, e
     riassume: quante partite arrivano in fondo, vita minima, scorte minime.

COMANDI.TXT. Un comando per riga, come lo si scriverebbe al gioco (le risposte di
un dialogo si scrivono per intero o per un pezzo del testo, o col numero). Le righe
vuote e quelle che cominciano con # si saltano. In più:
    @B_cavallo     i comandi di un percorso di collaudo/percorsi.py (A_peppe … H_veglia)
    :scena         mostra a quel punto uscite, presenze, bisaccia e azioni offerte
    :breve         come :scena, senza le azioni offerte
    (Le righe che cominciano con : non arrivano al motore.)

USO
    python strumenti/gioca.py partita.txt                  # ultimi 6 turni + scena
    python strumenti/gioca.py partita.txt -n 15            # gli ultimi 15
    python strumenti/gioca.py partita.txt --tutto          # tutta la partita
    python strumenti/gioca.py partita.txt --seme 3         # un altro caso (riproducibile)
    python strumenti/gioca.py partita.txt --diario d.md    # dove scrivere il diario
    python strumenti/gioca.py --pilota                     # equilibrio: B_cavallo, 4 modi, 12 semi
    python strumenti/gioca.py --pilota -p H_veglia -s 6,7 -s 9,11 --semi 20
    python strumenti/gioca.py --pilota -p partita.txt      # anche un file di comandi

Il diario (default collaudo/esiti/gioca-diario.md, cartella non versionata) ha tutta
la partita: ogni comando, la risposta e la riga delle scorte, più il riepilogo.
"""
import argparse
import contextlib
import importlib.util
import io
import json
import os
import random
import sys

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
COLLAUDO = os.path.join(RADICE, "collaudo")
sys.path.insert(0, os.path.join(RADICE, "motore"))
sys.path.insert(0, COLLAUDO)

PONTE = os.path.join(RADICE, "app", "src", "lib", "ponte.py")
GIOCO = os.path.join(RADICE, "prototipo", "il-viaggiatore.fav")
DIARIO = os.path.join(COLLAUDO, "esiti", "gioca-diario.md")

# Le soglie di sete e fame dei quattro modi di giocare misurati nel diario del 1° ottobre.
MODI = [
    ("agli avvisi", 6, 7),
    ("un poco dopo gli avvisi", 8, 10),
    ("mangia solo quando è debole", 6, 11),
    ("beve solo quando fa male", 9, 11),
]
SCORTE = ("vita", "sete", "fame", "acqua", "cibo", "sangue", "generosità")


# ---------------------------------------------------------------------------
# la partita: il ponte vero, con il caso scelto da noi
# ---------------------------------------------------------------------------
_numero = [0]
_mondo_base = [None]


def _mondo_in_cache(entry):
    """Compilare costa un secondo: per il pilota, che parte decine di volte, si
    compila una volta e le partite ricevono una copia profonda (come partita.py)."""
    import copy
    from compilatore import compila_mondo
    if _mondo_base[0] is None:
        with contextlib.redirect_stdout(io.StringIO()):
            _mondo_base[0] = compila_mondo(entry)
        if _mondo_base[0] is None:
            raise SystemExit("L'avventura non compila: lancia  python motore/favella.py compila prototipo/il-viaggiatore.fav")
    return copy.deepcopy(_mondo_base[0])


class Banco:
    """Una partita giocata col ponte dell'app. `seme` cambia il caso (il ponte,
    da solo, ha il seme fisso della compilazione)."""

    def __init__(self, seme=None, veloce=False):
        _numero[0] += 1
        spec = importlib.util.spec_from_file_location(f"ponte_banco_{_numero[0]}", PONTE)
        self.ponte = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.ponte)
        if veloce:
            self.ponte.compila_mondo = _mondo_in_cache
        avvio = json.loads(self.ponte.fav_boot(GIOCO))
        if avvio.get("stato") == "errore":
            raise SystemExit(avvio["text"])
        if seme is not None:
            self.ponte._mondo.rng = random.Random(seme)
        self.turni = []        # [{cmd, testo, scorte, luogo, turno, stato}]
        self._registra("", avvio["text"], avvio.get("stato", "in_corso"))

    @property
    def m(self):
        return self.ponte._mondo

    def _registra(self, cmd, testo, stato):
        st = json.loads(self.ponte.fav_stato())
        self.turni.append({"cmd": cmd, "testo": testo.rstrip("\n"), "stato": stato,
                           "scorte": {k: self.m.variabili.get(k, 0) or 0 for k in SCORTE},
                           "luogo": st["room"], "turno": st["turn"]})

    def esegui(self, cmd):
        r = json.loads(self.ponte.fav_step(cmd))
        self._registra(cmd, r["text"], r["stato"])
        return r["text"]

    def v(self, nome, default=0):
        val = self.m.variabili.get(nome)
        return default if val is None else val

    @property
    def in_corso(self):
        return self.m.stato_partita == "in_corso"

    @property
    def in_dialogo(self):
        return bool(self.m.in_dialogo())

    # --- la scena, come la vedono i pulsanti --------------------------------
    def scena(self, azioni=True):
        st = json.loads(self.ponte.fav_stato())
        righe = [f"Luogo     {st['room']}  [{st['roomId']}]"]
        if st["dialog"]:
            righe.append(f"Dialogo   con {st['dialog']['chi']}:")
            righe += [f"            {i}. {o}" for i, o in enumerate(st["dialog"]["opzioni"], 1)]
        if st["conferma"]:
            righe.append(f"Conferma  il motore aspetta un sì/no: {st['conferma']}")
        righe.append("Uscite    " + (", ".join(f"{u['dir']} → {u['verso']}" for u in st["exits"]) or "—"))
        righe.append("Presenze  " + (", ".join(p["nome"] + (" (persona)" if p["persona"] else "")
                                                for p in st["present"]) or "—"))
        capienza = f"  (capienza {st['capacity']})" if st["capacity"] is not None else ""
        righe.append("Bisaccia  " + (", ".join(st["inventory"]) or "—") + capienza)
        if azioni:
            az = json.loads(self.ponte.fav_azioni())
            offerte = list(az["soli"])
            offerte += [f"{b['verbo']} {b['nome']}" for b in az["bersagli"]]
            righe.append("Azioni    " + (", ".join(offerte) or "— (nessun gesto d'autore offerto)"))
        return "\n".join(righe)


def riga_scorte(t):
    s = t["scorte"]
    return (f"[turno {t['turno']} · {t['luogo']} · vita {s['vita']} sete {s['sete']} fame {s['fame']}"
            f" · acqua {s['acqua']} cibo {s['cibo']} · sangue {s['sangue']} generosità {s['generosità']}]")


def mostra_turno(t):
    righe = []
    if t["cmd"]:
        righe.append("> " + t["cmd"])
    righe.append(t["testo"])
    righe.append(riga_scorte(t))
    return "\n".join(righe)


# ---------------------------------------------------------------------------
# i comandi
# ---------------------------------------------------------------------------
def leggi_comandi(percorso):
    """Il file di comandi, con le @percorso espanse. Restituisce [(riga, cmd)]."""
    import percorsi
    out = []
    with open(percorso, encoding="utf-8") as f:
        for n, riga in enumerate(f, 1):
            riga = riga.strip()
            if not riga or riga.startswith("#"):
                continue
            if riga.startswith("@"):
                nome = riga[1:].strip()
                if nome not in percorsi.PERCORSI:
                    raise SystemExit(f"{percorso}:{n}: percorso «{nome}» sconosciuto "
                                     f"(sono {', '.join(percorsi.PERCORSI)})")
                out += [(n, c) for c in percorsi.comandi(nome)]
            else:
                out.append((n, riga))
    return out


def comandi_di(origine):
    """Un nome di percorso (B_cavallo) o un file di comandi: la lista dei comandi."""
    import percorsi
    if origine in percorsi.PERCORSI:
        return percorsi.comandi(origine)
    if os.path.isfile(origine):
        return [c for _, c in leggi_comandi(origine) if not c.startswith(":")]
    raise SystemExit(f"«{origine}» non è né un percorso ({', '.join(percorsi.PERCORSI)}) né un file")


def gioca_file(args):
    banco = Banco(seme=args.seme)
    scene = []                     # (dopo quanti turni, testo): le righe :scena
    for _, cmd in leggi_comandi(args.comandi):
        if cmd.startswith(":"):
            if cmd in (":scena", ":breve"):
                scene.append((len(banco.turni) - 1, banco.scena(azioni=cmd == ":scena")))
            continue
        if not banco.in_corso:
            print(f"(la partita è finita: «{cmd}» e i comandi che seguono non sono stati giocati)\n")
            break
        banco.esegui(cmd)
    t = banco.turni
    primo = 0 if args.tutto else max(1, len(t) - args.n)
    if primo > 1:
        print(f"… {primo - 1} turni prima, nel diario ({os.path.relpath(args.diario, RADICE)})\n")
    elif primo == 0:
        pass
    for i in range(primo, len(t)):
        print(mostra_turno(t[i]) + "\n")
        for dopo, testo in scene:
            if dopo == i:
                print("  ┌ scena\n" + "\n".join("  │ " + r for r in testo.splitlines()) + "\n")
    print("═" * 60)
    print(banco.scena())
    print("═" * 60)
    print(riassunto(banco))
    scrivi_diario(banco, args.diario, scene)
    return 0


def riassunto(banco):
    t = banco.turni
    vita_min = min(x["scorte"]["vita"] for x in t)
    cibo_min = min(x["scorte"]["cibo"] for x in t)
    esito = banco.m.stato_partita
    riga = (f"{len(t) - 1} comandi · turno {banco.m.turno_corrente} · esito: {esito}"
            f" · vita minima {vita_min} · cibo minimo {cibo_min}")
    for x in t:
        for r in x["testo"].splitlines():
            if r.startswith("FINALE"):
                return riga + "\n" + r
    return riga


def scrivi_diario(banco, percorso, scene):
    os.makedirs(os.path.dirname(percorso), exist_ok=True)
    with open(percorso, "w", encoding="utf-8", newline="\n") as f:
        f.write("# Diario della partita\n\n" + riassunto(banco) + "\n\n")
        for i, t in enumerate(banco.turni):
            f.write(mostra_turno(t) + "\n\n")
            for dopo, testo in scene:
                if dopo == i:
                    f.write("```\n" + testo + "\n```\n\n")
        f.write("## Alla fine\n\n```\n" + banco.scena() + "\n```\n")


# ---------------------------------------------------------------------------
# il pilota a soglie
# ---------------------------------------------------------------------------
def gioca_a_soglie(comandi, soglia_sete, soglia_fame, seme):
    """Gioca i comandi curando il corpo come fa collaudo/finali.py: beve se la sete
    è alla soglia e c'è acqua, mangia se la fame è alla soglia e c'è cibo, mai nel
    mezzo di un dialogo. Restituisce il banco e le sue misure."""
    banco = Banco(seme=seme, veloce=True)
    for c in comandi:
        if not banco.in_corso:
            break
        if not banco.in_dialogo:
            if banco.v("sete") >= soglia_sete and banco.v("acqua") >= 1:
                banco.esegui("bevi")
            if banco.in_corso and banco.v("fame") >= soglia_fame and banco.v("cibo") >= 1:
                banco.esegui("mangia")
        if banco.in_corso:
            banco.esegui(c)
    return banco


def misure(banco):
    t = banco.turni
    s = lambda k: [x["scorte"][k] for x in t]            # noqa: E731
    profilo = {}                                    # luogo → scorte più basse e bisogni più alti lì
    for x in t[1:]:
        c = x["scorte"]
        d = profilo.setdefault(x["luogo"], dict(cibo=c["cibo"], acqua=c["acqua"], vita=c["vita"],
                                                fame=c["fame"], sete=c["sete"]))
        d["cibo"], d["acqua"], d["vita"] = min(d["cibo"], c["cibo"]), min(d["acqua"], c["acqua"]), min(d["vita"], c["vita"])
        d["fame"], d["sete"] = max(d["fame"], c["fame"]), max(d["sete"], c["sete"])
    return {
        "esito": banco.m.stato_partita,
        "turni": banco.m.turno_corrente,
        "vita_min": min(s("vita")), "vita_fine": s("vita")[-1],
        "sete_max": max(s("sete")), "fame_max": max(s("fame")),
        "acqua_min": min(s("acqua")), "cibo_min": min(s("cibo")),
        "profilo": profilo,
        "senza_cibo": sum(1 for x in t if x["scorte"]["cibo"] == 0),     # turni a cibo 0
        "fame_alta_senza_cibo": sum(1 for x in t if x["scorte"]["cibo"] == 0 and x["scorte"]["fame"] >= 6),
        "turni_feriti": sum(1 for x in t if x["scorte"]["vita"] < 10),
        "generosita": s("generosità")[-1], "sangue": s("sangue")[-1],
    }


def media(xs):
    return sum(xs) / len(xs) if xs else 0


def profilo_medio(risultati):
    """Dove sta la tensione: per ogni luogo, nell'ordine in cui lo si incontra, le
    scorte più basse e i bisogni più alti (media sui semi) e quante partite ci
    passano. Un luogo a cibo basso e fame alta è dove si ha paura."""
    ordine, per_luogo = [], {}
    for r in risultati:
        for luogo, d in r["profilo"].items():
            if luogo not in per_luogo:
                ordine.append(luogo)
            per_luogo.setdefault(luogo, []).append(d)
    print(f"      {'luogo':26} {'partite':>7} {'cibo min':>8} {'acqua min':>9} {'fame max':>8} {'sete max':>8} {'vita min':>8}")
    for luogo in ordine:
        ds = per_luogo[luogo]
        print(f"      {luogo[:26]:26} {len(ds):>7} {media([d['cibo'] for d in ds]):>8.1f} {media([d['acqua'] for d in ds]):>9.1f} "
              f"{media([d['fame'] for d in ds]):>8.1f} {media([d['sete'] for d in ds]):>8.1f} {media([d['vita'] for d in ds]):>8.1f}")


def pilota(args):
    comandi = comandi_di(args.percorso)
    modi = [(f"sete {a}, fame {b}", a, b) for a, b in args.soglie] if args.soglie else MODI
    semi = list(range(args.semi))
    print(f"Pilota a soglie — {args.percorso}, {len(semi)} semi per modo\n")
    intest = (f"{'chi gioca':32} {'arriva':>7} {'vita min':>9} {'(peggiore)':>10} {'vita fine':>9} "
              f"{'cibo min':>8} {'a cibo 0':>8} {'feriti':>7} {'gener.':>6} {'sangue':>6}")
    print(intest)
    print("-" * len(intest))
    for nome, ss, sf in modi:
        risultati = [misure(gioca_a_soglie(comandi, ss, sf, s)) for s in semi]
        arrivano = [r for r in risultati if r["esito"] in ("vinta", "terminata")]
        morti = [r for r in risultati if r["esito"] not in ("vinta", "terminata")]
        print(f"{nome[:32]:32} {len(arrivano):>3}/{len(semi):<3} "
              f"{media([r['vita_min'] for r in risultati]):>9.1f} {min(r['vita_min'] for r in risultati):>10} "
              f"{media([r['vita_fine'] for r in arrivano]):>9.1f} "
              f"{media([r['cibo_min'] for r in risultati]):>8.1f} {media([r['senza_cibo'] for r in risultati]):>8.1f} "
              f"{media([r['turni_feriti'] for r in risultati]):>7.1f} "
              f"{media([r['generosita'] for r in risultati]):>6.1f} {media([r['sangue'] for r in risultati]):>6.1f}")
        if morti:
            quando = ", ".join(f"turno {r['turni']} ({r['esito']})" for r in morti[:4])
            print(f"{'':32}   non arrivano: {len(morti)} — {quando}")
        if args.dettaglio:
            print(f"      turni con cibo 0 e fame ≥ 6: {media([r['fame_alta_senza_cibo'] for r in risultati]):.1f} in media")
            profilo_medio(risultati)
    print("\n«arriva» = la partita arriva a un finale di storia; «vita min» è la media sui semi (peggiore a lato);")
    print("«a cibo 0» e «feriti» sono turni in media; «feriti» = turni con vita sotto 10.")
    return 0


# ---------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="Il banco di gioco del Viaggiatore",
                                 formatter_class=argparse.RawDescriptionHelpFormatter,
                                 epilog="Vedi la testa del file per il formato di COMANDI.TXT.")
    ap.add_argument("comandi", nargs="?", help="file di comandi, uno per riga")
    ap.add_argument("-n", type=int, default=6, help="quanti degli ultimi turni mostrare (default 6)")
    ap.add_argument("--tutto", action="store_true", help="mostra tutta la partita")
    ap.add_argument("--seme", type=int, default=None, help="il caso della partita (default: quello del ponte)")
    ap.add_argument("--diario", default=DIARIO, help="dove scrivere il diario della partita")
    ap.add_argument("--pilota", action="store_true", help="misura l'equilibrio su più semi, a soglie")
    ap.add_argument("-p", "--percorso", default="B_cavallo",
                    help="col pilota: un percorso (A_peppe…H_veglia) o un file di comandi")
    ap.add_argument("-s", "--soglie", action="append", metavar="SETE,FAME",
                    help="col pilota: un modo di giocare, ripetibile (default: i quattro del 1° ottobre)")
    ap.add_argument("--semi", type=int, default=12, help="col pilota: quanti semi (default 12)")
    ap.add_argument("--dettaglio", action="store_true", help="col pilota: scorte e bisogni luogo per luogo (dove sta la tensione)")
    args = ap.parse_args()
    if args.soglie:
        try:
            args.soglie = [tuple(int(x) for x in s.split(",")) for s in args.soglie]
            assert all(len(s) == 2 for s in args.soglie)
        except (ValueError, AssertionError):
            ap.error("le soglie si scrivono SETE,FAME, per esempio  -s 6,7")
    if args.pilota:
        return pilota(args)
    if not args.comandi:
        ap.error("serve un file di comandi (o --pilota)")
    return gioca_file(args)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
