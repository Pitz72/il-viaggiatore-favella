"""verosimili.py — tante partite da principiante verosimili: quanto è difficile, oggi, Il Viaggiatore.

Il metodo di Il Relitto Silente (documento 33, §12, 5 novembre 2026), portato qui il 7 novembre
2026. Tre partite scritte a mano sono tre esempi: tarare i numeri su di loro li cucirebbe addosso
a tre percorsi. Simone, sul Relitto: «non dobbiamo trovare la combinazione per far vincere i
giocatori ma la combinazione che rende più verosimile il fatto che ce la possano fare. Si tratta
di bilanciamento». E poi: «se così vincono sempre tutti, dove sta la sfida?».

Così da ogni percorso d'intenzione (collaudo/principiante-*.txt, o un percorso di percorsi.py) si
ricavano N partite diverse per ogni carattere: ogni curiosità, ogni oggetto facoltativo e ogni
errore si fa oppure no, con le probabilità del carattere; ogni tanto si perde un passo (si guarda
intorno, entra dove non serve e torna); la giocatrice (cammino.py) beve e mangia alla sua soglia
e rimedia da sé ai passaggi chiusi, a volte dopo aver girato a vuoto. Il conto dice quanto è
verosimile farcela: quante arrivano al lago (l'invaso), quante a un finale, dove e di che cosa
muoiono le altre, con quanta vita e quante scorte.

Le probabilità dei caratteri sono una scelta a tavolino, scritta qui sotto (e spiegata in
sviluppo/bilanciamento.md): «curiosita» esaminare e guardarsi intorno; «raccolta» prendere gli
oggetti facoltativi; «errore» gli sbagli del percorso (bere al fondale salmastro, restare dove il
cane morde…); «spreco» un «guarda» in più prima di un passo (nel tratto al sole costa due di
sete); «deviazione» qualche passo a caso prima di un passo del percorso; «ingegno» trovare subito
il rimedio davanti a un passaggio chiuso invece di perdersi; «presto» bere e mangiare appena il
numero sale, finché non si arriva al lago; «sete» e «fame» le soglie a cui beve e mangia (una a
caso per partita); «dono» dare da mangiare a Imma; «peppe» portarlo con sé; «violenza» il cane e
Vito a colpi.

Uso (dalla radice del progetto):
    python collaudo/verosimili.py                       # 200 partite per carattere, il gioco di oggi
    python collaudo/verosimili.py -n 400 --seme 7
    python collaudo/verosimili.py --carattere inesperta --dettaglio
    python collaudo/verosimili.py --variante acqua-4    # una variante (vedi VARIANTI), senza toccare i .fav
    python collaudo/verosimili.py --confronta           # il gioco di oggi e ogni variante, fianco a fianco
    python collaudo/verosimili.py --controlla           # il controllo rapido (CI): percorsi validi, niente eccezioni
"""
import argparse
import contextlib
import io
import os
import random
import shutil
import statistics
import sys
import tempfile
from multiprocessing import Pool

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
sys.path.insert(0, QUI)

import cammino  # noqa: E402

# ---------------------------------------------------------------------------
# i caratteri (le probabilità sono una scelta a tavolino: vedi la testa del file)
# ---------------------------------------------------------------------------
CARATTERI = {
    # Il riferimento: il percorso B del collaudo, giocato da chi sa la strada e beve e mangia
    # agli avvisi. Non varia (cambia solo il caso del motore): deve arrivare sempre.
    "attenta": dict(base="@B_cavallo", sete=[6], fame=[7], presto=0, ingegno=1, curiosita=1,
                    raccolta=1, errore=0, spreco=0, deviazione=0),
    # Il cane e Vito a colpi, il fucile al guado; per il resto gioca come la curiosa.
    "violenta": dict(base="principiante-curiosa.txt", sete=[6, 7], fame=[7, 8], presto=0, ingegno=.9,
                     curiosita=.6, raccolta=.8, errore=.3, spreco=.05, deviazione=.05, violenza=1,
                     dono=0, peppe=.3),
    # Beve e mangia tardi, quando il corpo fa già male.
    "distratta": dict(base="principiante-curiosa.txt", sete=[8, 9], fame=[10, 11], presto=0, ingegno=.8,
                      curiosita=.7, raccolta=.7, errore=.4, spreco=.1, deviazione=.1, dono=.5, peppe=.3),
    # Michela: non conosce il gioco e all'inizio si perde un po'. Parte dalla partita sperduta.
    "inesperta": dict(base="principiante-sperduta.txt", sete=[5, 6, 7, 8, 9], fame=[7, 8, 9, 10, 11],
                      presto=.25, ingegno=.6, curiosita=.8, raccolta=.6, errore=.6, spreco=.15,
                      deviazione=.12, dono=.5, peppe=.3),
    # Apre, esamina e ascolta tutto, prende quasi tutto, parla con tutti.
    "curiosa": dict(base="principiante-curiosa.txt", sete=[6, 7], fame=[7, 8, 9], presto=.1, ingegno=.8,
                    curiosita=.9, raccolta=.9, errore=.4, spreco=.1, deviazione=.1, dono=.7, peppe=.4),
    # Va dritta, prende poco, parla poco.
    "frettolosa": dict(base="principiante-frettolosa.txt", sete=[6, 7, 8], fame=[7, 8, 9, 10], presto=.1,
                       ingegno=.7, curiosita=.3, raccolta=.4, errore=.3, spreco=.03, deviazione=.05,
                       dono=.2, peppe=.1),
}

# Il carattere che gioca un percorso, se non lo si dice.
PER_FILE = {"principiante-curiosa.txt": "curiosa", "principiante-frettolosa.txt": "frettolosa",
            "principiante-sperduta.txt": "inesperta"}
# Come finisce ogni percorso giocato «diritto» (senza sbagli né smarrimenti, bevendo e mangiando agli
# avvisi): il controllo rapido lo pretende. La sperduta torna ad Acquaviva a tanica vuota, come
# Michela: fino alla 1.41 ci moriva anche così (al turno 66); dalla 1.42 (il lavoro da Nunzio a 1 di
# fame) arriva a un finale, e deve continuare ad arrivarci.
ATTESO_DIRITTO = {"principiante-curiosa.txt": {"finale"}, "principiante-frettolosa.txt": {"finale"},
                  "principiante-sperduta.txt": {"finale"}}


def carattere_del_file(percorso):
    return PER_FILE.get(os.path.basename(percorso), "attenta")


# Che cosa si prende sempre: apre una strada (la mappa, il filtro, le pastiglie, la lettera, il
# fucile) o paga un passaggio. Il resto è facoltativo, e lo si prende con la «raccolta».
ESSENZIALI = ("mappa", "filtro", "pastiglie", "lettera", "fucile", "lasciapassare", "medicine")
CURIOSITA = ("esamina", "guarda", "raddrizza", "leggi", "inventario", "stato")
ERRORI = ("bevi salmastra", "aspetta", "esamina il cane", "esamina rocco")


def _base(c):
    b = c["base"]
    return b if b.startswith("@") else os.path.join(QUI, b)


def varia(comandi, c, rng):
    """Una partita: il percorso con le cose facoltative fatte oppure no."""
    out = []
    for cmd in comandi:
        low = cmd.lower()
        if low.startswith(CURIOSITA):
            if rng.random() < c["curiosita"]:
                out.append(cmd)
            continue
        if low.startswith("prendi ") and not any(e in low for e in ESSENZIALI):
            if rng.random() < c["raccolta"]:
                out.append(cmd)
            continue
        if low.startswith(ERRORI):
            if rng.random() < c["errore"]:
                out.append(cmd)
            continue
        if c.get("violenza"):
            if low == "parla con peppe":            # col sangue addosso, Peppe chiede prima
                out += [cmd, "È vero. Non l'ho voluto.", "…"]
                continue
            if low == "getta cibo":
                out += ["attacca il cane"] * 3
                continue
            if low.startswith(("ti do la stecca", "ti lascio tre d'acqua")):
                out += ["esci", "attacca Vito", "attacca Vito", "attacca Vito"]
                continue
        if low.startswith("tieni, mangia") and rng.random() >= c.get("dono", 1):
            out.append("Non posso. Mi dispiace.")
            continue
        if low.startswith(("è troppo dura", "vieni con me")):
            out.append("Vieni con me, allora." if rng.random() < c.get("peppe", 0) else "È troppo dura, dove vado. Resta.")
            continue
        if low in cammino.DIREZIONI and rng.random() < c["spreco"]:
            out.append("guarda")
        out.append(cmd)
    return out


# ---------------------------------------------------------------------------
# le varianti: «e se…?», provate su una copia dei .fav, mai sui file del gioco
# ---------------------------------------------------------------------------
# Ognuna è una lista di sostituzioni (file, testo di oggi, testo della prova). Nessuna tocca un
# testo detto (narrazione, battute, risposte): solo numeri e condizioni.
VARIANTI = {
    "acqua-4": [("il-viaggiatore.fav", "L'acqua parte da 3.", "L'acqua parte da 4.")],
    "cibo-3": [("il-viaggiatore.fav", "Il cibo parte da 2.", "Il cibo parte da 3.")],
    "sole-1": [("z2-piana.fav", "La gola si secca a vista d'occhio.\" e adesso aumenta la sete di 2.",
                "La gola si secca a vista d'occhio.\" e adesso aumenta la sete di 1.")],
    "margine-2": [("z1-acquaviva.fav", "Invece di vai ovest se il giocatore è in il margine e l'acqua è meno di 3:",
                   "Invece di vai ovest se il giocatore è in il margine e l'acqua è meno di 2:")],
    "masseria-3": [("z2-piana.fav", "Invece di vai ovest se il giocatore è in la masseria e l'acqua è meno di 4:",
                    "Invece di vai ovest se il giocatore è in la masseria e l'acqua è meno di 3:")],
    # Le 3 d'acqua al margine solo la prima volta: chi torna dalla piana a chiedere aiuto a Nunzio
    # non resta chiuso nel paese. Uno stato nuovo, senza testo («Il margine» lo tiene, il tratto lo
    # cambia la prima volta che ci si entra).
    "margine-una-volta": [
        ("z1-acquaviva.fav", "Il margine collega ovest a il tratto.",
         "Lo stato del tratto è uno stato.\nLo stato del tratto è nuovo.\nIl margine collega ovest a il tratto."),
        ("z1-acquaviva.fav", "Invece di vai ovest se il giocatore è in il margine e l'acqua è meno di 3:",
         "Invece di vai ovest se il giocatore è in il margine e l'acqua è meno di 3 e lo stato del tratto è nuovo:"),
        ("z2-piana.fav", "Ogni turno se il giocatore è in il tratto: dire",
         "Quando il giocatore è in il tratto e lo stato del tratto è nuovo: lo stato del tratto è visto.\n"
         "Ogni turno se il giocatore è in il tratto: dire"),
    ],
    "lavoro-senza-fame": [("z1-acquaviva.fav", "Posso lavorare, per un po' d'acqua?\" se l'acqua è al massimo 2 conduce",
                           "Posso lavorare, per un po' d'acqua?\" se l'acqua è al massimo 2 e la fame è al massimo 8 conduce")],
    # Il gioco com'era fino alla 1.41 (prima dei tre ritocchi del 7 novembre 2026: la fame ogni 5 turni,
    # le soglie estreme a 16 e 18, il lavoro da Nunzio a 1 di fame): per rimisurarlo.
    "come-la-1-41": [("sistemi.fav", "Ogni 5 turni: aumenta la fame.", "Ogni 4 turni: aumenta la fame."),
                     ("sistemi.fav", "Quando la sete è almeno 16:", "Quando la sete è almeno 13:"),
                     ("sistemi.fav", "Quando la fame è almeno 18:", "Quando la fame è almeno 15:"),
                     ("z1-acquaviva.fav",
                      "conduce al nodo \"lavoro\" e adesso aumenta l'acqua di 1 e adesso aumenta la fame di 1.",
                      "conduce al nodo \"lavoro\" e adesso aumenta l'acqua di 1 e adesso aumenta la fame di 2.")],
    "sete-ogni-4": [("sistemi.fav", "Ogni 3 turni: aumenta la sete.", "Ogni 4 turni: aumenta la sete.")],
    "ripresa-1-su-6": [("sistemi.fav", "e il giocatore non è in il guado e càpita (1 su 8)",
                        "e il giocatore non è in il guado e càpita (1 su 6)")],
}


def prepara_variante(nomi):
    """Una copia di prototipo/ con le sostituzioni delle varianti: il percorso del .fav radice."""
    cartella = tempfile.mkdtemp(prefix="viaggiatore-variante-")
    for f in os.listdir(cammino.PROTOTIPO):
        if f.endswith(".fav"):
            shutil.copy(os.path.join(cammino.PROTOTIPO, f), cartella)
    sostituzioni = []
    for nome in nomi:
        for s in VARIANTI[nome]:
            sostituzioni += ([(nome, x) for x in VARIANTI[s]] if isinstance(s, str) else [(nome, s)])
    for nome, (f, vecchio, nuovo) in sostituzioni:
        percorso = os.path.join(cartella, f)
        with open(percorso, encoding="utf-8") as h:
            testo = h.read()
        if testo.count(vecchio) != 1:
            shutil.rmtree(cartella, ignore_errors=True)
            raise SystemExit(f"variante «{nome}»: in {f} il testo da sostituire c'è {testo.count(vecchio)} volte "
                             f"(dev'esserci una volta sola): {vecchio[:60]}…")
        with open(percorso, "w", encoding="utf-8", newline="\n") as h:
            h.write(testo.replace(vecchio, nuovo))
    return cartella


# ---------------------------------------------------------------------------
# le partite
# ---------------------------------------------------------------------------
_BASI = {}


def _inizia(varianti):
    """In ogni processo: il mondo compilato una volta sola (con le varianti, se ci sono)."""
    import partita
    from compilatore import compila_mondo
    if varianti:
        cartella = prepara_variante(varianti)
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                partita._MONDO_BASE = compila_mondo(os.path.join(cartella, "il-viaggiatore.fav"))
        finally:
            shutil.rmtree(cartella, ignore_errors=True)
        if partita._MONDO_BASE is None:
            raise SystemExit(f"le varianti {varianti} non compilano")
    else:
        partita.mondo_nuovo()


def scala_smarrimento(c, quanto):
    """«Si perde un po'» o «si perde»: `quanto` moltiplica lo spreco, le deviazioni e le volte in
    cui, davanti a un passaggio chiuso, gira a vuoto prima del rimedio (1 è il carattere com'è,
    0.5 la metà, 0 mai). Come la fuga del Relitto, misurata a metà e piena."""
    c = dict(c)
    c["spreco"] = min(1.0, c["spreco"] * quanto)
    c["deviazione"] = min(1.0, c["deviazione"] * quanto)
    c["ingegno"] = 1 - min(1.0, (1 - c.get("ingegno", 1)) * quanto)
    return c


def _gioca(compito):
    nome, seme, smarrimento = compito
    c = scala_smarrimento(CARATTERI[nome], smarrimento)
    if c["base"] not in _BASI:
        _BASI[c["base"]] = cammino.leggi_percorso(_base(c))
    rng = random.Random(seme)
    comandi = varia(_BASI[c["base"]], c, rng)
    p, passi, g = cammino.gioca(comandi, c, seme)
    e = cammino.esito(p, passi, g)
    e["carattere"] = nome
    return e


def simula(caratteri=None, n=200, seme=1, processi=None, varianti=(), smarrimento=1.0):
    caratteri = caratteri or list(CARATTERI)
    compiti = [(c, seme * 100003 + i, smarrimento) for c in caratteri for i in range(n)]
    with Pool(processi or max(1, (os.cpu_count() or 2) - 2), initializer=_inizia,
              initargs=(tuple(varianti),)) as pool:
        esiti = pool.map(_gioca, compiti, chunksize=4)
    return {c: [e for e in esiti if e["carattere"] == c] for c in caratteri}


# ---------------------------------------------------------------------------
# i conti
# ---------------------------------------------------------------------------
def _pct(x, tot):
    return f"{round(100 * x / tot):d}%" if tot else "—"


def _basso(xs, quota=0.1):
    """Il valore sotto cui sta il 10% più sfortunato."""
    xs = sorted(xs)
    return xs[int(len(xs) * quota)] if xs else None


def conto(esiti):
    tot = len(esiti)
    al_lago = [e for e in esiti if e["lago"]]
    morte = [e for e in esiti if e["esito"] == "morta"]
    return {
        "partite": tot,
        "lago": len(al_lago),
        "finale": sum(1 for e in esiti if e["esito"] == "finale"),
        "morte": len(morte),
        "morte_prima_lago": sum(1 for e in morte if not e["lago"]),        # senza esserci mai arrivata
        "stallo": sum(1 for e in esiti if e["esito"] == "stallo"),
        "sul_colpo": sum(1 for e in morte if e["sul_colpo"]),
        "vita_min": statistics.median(e["vita_min"] for e in esiti) if esiti else None,
        "vita_bassa": _basso([e["vita_min"] for e in esiti]),
        "turno_lago": statistics.median(e["turno_lago"] for e in al_lago) if al_lago else None,
        "turno_piana": statistics.median(e["turno_piana"] for e in esiti if e["turno_piana"] is not None)
        if any(e["turno_piana"] is not None for e in esiti) else None,
        "acqua_lago": _basso([e["al_lago"]["acqua"] for e in al_lago]),
        "cibo_lago": _basso([e["al_lago"]["cibo"] for e in al_lago]),
        "smarrimenti": statistics.mean(e["smarrimenti"] for e in esiti) if esiti else 0,
        "vicolo": sum(1 for e in esiti if e["vicolo"]),
        "eccezioni": sum(e["eccezioni"] for e in esiti),
    }


def tabella(per_carattere):
    righe = [f"  {'carattere':11s} {'al lago':>7s} {'finale':>7s} {'morte':>6s} {'prima del lago':>14s} "
             f"{'stallo':>6s} {'sul colpo':>9s} {'vita min':>8s} {'10% peggiori':>12s} {'esce da Acquaviva':>17s} "
             f"{'turno al lago':>13s} {'al lago, i più poveri':>21s} {'si perde':>8s}"]
    for c, esiti in per_carattere.items():
        k = conto(esiti)
        t = k["partite"]
        povere = (f"acqua {k['acqua_lago']} cibo {k['cibo_lago']}" if k["acqua_lago"] is not None else "—")
        uscita = f"turno {k['turno_piana']}" if k["turno_piana"] is not None else "—"
        righe.append(f"  {c:11s} {_pct(k['lago'], t):>7s} {_pct(k['finale'], t):>7s} {_pct(k['morte'], t):>6s} "
                     f"{_pct(k['morte_prima_lago'], t):>14s} {_pct(k['stallo'], t):>6s} {_pct(k['sul_colpo'], t):>9s} "
                     f"{str(k['vita_min']):>8s} {str(k['vita_bassa']):>12s} {uscita:>17s} "
                     f"{str(k['turno_lago']):>13s} {povere:>21s} {k['smarrimenti']:8.1f}"
                     + (f"  [eccezioni {k['eccezioni']}]" if k["eccezioni"] else ""))
    return "\n".join(righe)


def dove_si_muore(per_carattere):
    """Per ogni carattere: in quale zona e di che cosa muoiono (e dove si fermano)."""
    righe = []
    for c, esiti in per_carattere.items():
        tot = len(esiti)
        voci = {}
        for e in esiti:
            if e["esito"] == "morta":
                chiave = f"{cammino.NOMI_ZONE[e['zona_morte']]} ({e['causa']})"
            elif e["esito"] == "stallo":
                chiave = f"{cammino.NOMI_ZONE[e['zona_max']]} (ferma)"
            else:
                continue
            voci[chiave] = voci.get(chiave, 0) + 1
        if voci:
            righe.append(f"  {c:11s} " + ", ".join(f"{k} {_pct(v, tot)}"
                                                  for k, v in sorted(voci.items(), key=lambda kv: -kv[1])))
        else:
            righe.append(f"  {c:11s} nessuna")
    return "\n".join(righe)


def luoghi_di_morte(esiti):
    voci = {}
    for e in esiti:
        if e["esito"] == "morta":
            voci[e["luogo_morte"]] = voci.get(e["luogo_morte"], 0) + 1
    return ", ".join(f"{k} {v}" for k, v in sorted(voci.items(), key=lambda kv: -kv[1])) or "—"


def stampa(per_carattere, titolo, dettaglio=False):
    print(titolo)
    print(tabella(per_carattere))
    print("\n  Dove si muore (o ci si ferma):")
    print(dove_si_muore(per_carattere))
    if dettaglio:
        for c, esiti in per_carattere.items():
            print(f"\n  {c}: i luoghi delle morti: {luoghi_di_morte(esiti)}")
            k = conto(esiti)
            print(f"  {c}: almeno una volta senza rimedio (vicolo cieco): {_pct(k['vicolo'], k['partite'])}")


# ---------------------------------------------------------------------------
# la regola (decisa da Simone il 7 novembre 2026)
# ---------------------------------------------------------------------------
# Come «il curioso alla Grande Porta sopra il 30%» del Relitto: che cosa il gioco deve garantire,
# misurato a metà smarrimento (chi «si perde un pochino», come Michela). Si rimisura a ogni ritocco
# della difficoltà: `python collaudo/verosimili.py --regola`.
REGOLA_SMARRIMENTO = 0.5
REGOLA = [
    # (carattere, misura, minimo, massimo, come si dice)
    ("inesperta", "lago", 0.40, None, "Michela arriva al lago in almeno 2 partite su 5"),
    ("attenta", "finale", 1.00, None, "l'attenta arriva sempre a un finale"),
    ("curiosa", "finale", 0.75, None, "la curiosa arriva a un finale in almeno 3 partite su 4"),
] + [(c, "sul_colpo", None, 0.01, f"nessuna morte sul colpo ({c})") for c in CARATTERI]
# «Nessuna» con la tolleranza di una partita su cento: la misura conta ogni morte con la vita sopra
# zero, anche quella che arriva a vita 1 dopo otto turni di danno (la sola trovata, su 300, con i
# ritocchi decisi). Le soglie estreme restano la rete per i salti bruschi (la pozza salmastra).


def regola(n=300, seme=1, varianti=()):
    """Misura la regola: esce con 1 se una delle sue condizioni non regge."""
    per = simula(n=n, seme=seme, varianti=varianti, smarrimento=REGOLA_SMARRIMENTO)
    print(f"La regola del 7 novembre 2026 — {n} partite per carattere, smarrimento {REGOLA_SMARRIMENTO:g}"
          + (f", varianti {' + '.join(varianti)}" if varianti else "") + "\n")
    ok = True
    for c, misura, minimo, massimo, frase in REGOLA:
        k = conto(per[c])
        x = k[misura] / k["partite"]
        bene = (minimo is None or x >= minimo) and (massimo is None or x <= massimo)
        ok &= bene
        print(f"  {'OK' if bene else 'KO'} {frase}: {round(100 * x)}%")
    print()
    print(tabella(per))
    print("\nLA REGOLA REGGE" if ok else "\nLA REGOLA NON REGGE")
    return 0 if ok else 1


# ---------------------------------------------------------------------------
# il controllo rapido (CI)
# ---------------------------------------------------------------------------
def controlla(n=8, seme=1):
    """Che il metodo regga quando i .fav cambiano: ogni percorso da principiante, giocato senza
    sbagli né smarrimenti e bevendo agli avvisi, arriva a un finale; poche partite verosimili per
    carattere non fanno sollevare eccezioni al motore e, rigiocate, danno lo stesso conto."""
    import partita
    partita.mondo_nuovo()
    ok = True
    print("I percorsi da principiante, giocati diritti (bere e mangiare agli avvisi):")
    diritta = dict(sete=[6], fame=[7], presto=0, ingegno=1, curiosita=1, raccolta=1, errore=0,
                   spreco=0, deviazione=0, dono=1, peppe=0)
    for f in sorted(PER_FILE):
        comandi = cammino.leggi_percorso(os.path.join(QUI, f))
        p, passi, g = cammino.gioca(comandi, diritta, seme)
        e = cammino.esito(p, passi, g)
        bene = e["esito"] in ATTESO_DIRITTO[f] and not e["eccezioni"]
        ok &= bene
        print(f"  {'OK' if bene else 'KO'} {f:28s} {e['esito']:7s} turni {e['turni']:4d} · "
              f"{(e['finale'] or '')[:70]}")
        if not bene:
            print("     → " + cammino.rapporto(f, p, passi, g).replace("\n", "\n     "))
    print(f"\n{n} partite verosimili per carattere, due volte con lo stesso seme:")
    a = simula(n=n, seme=seme)
    b = simula(n=n, seme=seme)
    for c in CARATTERI:
        ka, kb = conto(a[c]), conto(b[c])
        bene = ka == kb and not ka["eccezioni"]
        if c == "attenta":
            bene &= ka["finale"] == ka["partite"]
        ok &= bene
        print(f"  {'OK' if bene else 'KO'} {c:11s} lago {_pct(ka['lago'], n):>5s} · finale {_pct(ka['finale'], n):>5s}"
              + ("" if ka == kb else " · il conto cambia da una volta all'altra")
              + (f" · eccezioni {ka['eccezioni']}" if ka["eccezioni"] else ""))
    print("\nTUTTO OK" if ok else "\nCI SONO FALLIMENTI")
    return 0 if ok else 1


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description="Partite da principiante verosimili: quanto è difficile Il Viaggiatore.")
    ap.add_argument("-n", type=int, default=200, help="partite per carattere (200)")
    ap.add_argument("--seme", type=int, default=1)
    ap.add_argument("--carattere", action="append", choices=list(CARATTERI), help="solo questi caratteri (ripetibile)")
    ap.add_argument("--variante", action="append", choices=list(VARIANTI), default=[],
                    help="prova una variante dei .fav, su una copia (ripetibile: si sommano)")
    ap.add_argument("--confronta", action="store_true", help="il gioco di oggi e ogni variante da sola")
    ap.add_argument("--dettaglio", action="store_true", help="i luoghi delle morti e i vicoli ciechi")
    ap.add_argument("--smarrimento", type=float, default=1.0,
                    help="quanto si perdono: 1 come i caratteri, 0.5 la metà, 0 mai (1)")
    ap.add_argument("--solo", action="append", default=[], choices=list(VARIANTI), metavar="VARIANTE",
                    help="con --confronta: solo queste varianti (ripetibile)")
    ap.add_argument("--controlla", action="store_true", help="il controllo rapido (CI)")
    ap.add_argument("--regola", action="store_true",
                    help="misura la regola decisa da Simone (a metà smarrimento) ed esce con 1 se non regge")
    args = ap.parse_args()
    if args.controlla:
        return controlla()
    if args.regola:
        return regola(n=args.n if args.n != 200 else 300, seme=args.seme, varianti=args.variante)
    sm = args.smarrimento
    nota = "" if sm == 1 else f", smarrimento {sm:g}"
    if args.confronta:
        stampa(simula(args.carattere, args.n, args.seme, smarrimento=sm),
               f"Il gioco di oggi — {args.n} partite per carattere{nota}\n", args.dettaglio)
        for nome in (args.solo or VARIANTI):
            print()
            stampa(simula(args.carattere, args.n, args.seme, varianti=[nome], smarrimento=sm),
                   f"Variante «{nome}»{nota}\n", args.dettaglio)
        return 0
    titolo = ("Il gioco di oggi" if not args.variante else "Varianti " + " + ".join(args.variante))
    stampa(simula(args.carattere, args.n, args.seme, varianti=args.variante, smarrimento=sm),
           f"{titolo} — {args.n} partite per carattere{nota}\n", args.dettaglio)
    return 0


if __name__ == "__main__":
    sys.exit(main())
