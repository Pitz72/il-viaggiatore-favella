"""Collaudo dei salvataggi: salvare e ricaricare deve restituire la STESSA partita.

Il ponte dell'app (app/src/lib/ponte.py) salva la sequenza effettiva dei comandi
e al caricamento la rigioca. Qui lo si mette alla prova con partite casuali che
fanno di tutto: si spostano, prendono, parlano, scelgono risposte, annullano
(anche dentro e dopo i dialoghi), ripetono con ANCORA, sbagliano comando, si fanno
fare domande dal motore («ricomincia», «esci», «usa X» da solo) e rispondono.
Dopo ogni caricamento anche la domanda in sospeso dev'essere la stessa.

Per ogni partita, a intervalli:
  1. l'istanza A salva;
  2. un'istanza B, nuova e indipendente, carica il salvataggio;
  3. l'impronta dello stato di B deve essere identica a quella di A;
  4. A e B proseguono con gli stessi comandi: ogni risposta deve coincidere
     parola per parola, e le impronte restare uguali.

In più prova che un caricamento rotto a metà non lasci il ponte con un mondo parziale (caricamento_fallito),
e le domande lasciate cadere con ANNULLA e RICOMINCIA, anche nelle sequenze fino alla 1.41.0 (domande).

Uso:  python salvataggi.py              (40 partite)
      python salvataggi.py -n 200       (più partite)
Esce con 1 al primo disallineamento, lasciando la trascrizione in esiti/.
"""
import argparse
import importlib.util
import json
import os
import random
import sys
import time

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
sys.path.insert(0, os.path.join(RADICE, "motore"))
PONTE = os.path.join(RADICE, "app", "src", "lib", "ponte.py")
GIOCO = os.path.join(RADICE, "prototipo", "il-viaggiatore.fav")
ESITI = os.path.join(QUI, "esiti")

_contatore = 0
DOPO = 12   # comandi giocati in parallelo da A e B dopo ogni caricamento


def nuovo_ponte():
    """Un'istanza indipendente del ponte (moduli distinti = stato distinto)."""
    global _contatore
    _contatore += 1
    spec = importlib.util.spec_from_file_location(f"ponte_{_contatore}", PONTE)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def scegli(p, rng):
    """Un comando plausibile (o sbagliato) per la scena corrente."""
    m = p._mondo
    if m.in_dialogo():
        nodo = m.dialogo_nodi.get(m.nodo_dialogo)
        n = len([o for o in nodo.opzioni if o.disponibile(m)]) if nodo else 0
        return str(rng.randint(1, n)) if n and rng.random() < 0.9 else rng.choice(["esci", "boh", "9"])
    x = rng.random()
    if x < 0.08:
        return "annulla"
    if x < 0.12:
        return "ancora"
    if x < 0.16:
        return rng.choice(["bevi", "mangia qualcosa", "stato", "inventario", "guarda", "attingi", "xyzzy"])
    st = m.trova_stanza(m.posizione_giocatore)
    presenti = list(st.oggetti.values()) if st else []
    inv = [m.oggetti[o] for o in m.inventario if o in m.oggetti]
    if x < 0.19:
        # le domande del motore (il sì/no di «ricomincia» ed «esci», «Con cosa vuoi usarla?») e le risposte:
        # «s» è il sì di una domanda in sospeso, altrimenti è sud
        return rng.choice(["ricomincia", "esci", "no", "s"] + [f"usa {o.nome_visualizzato.lower()}" for o in inv])
    scelte = [d for d in (st.uscite if st else {})] * 3
    for o in presenti:
        n = o.nome_visualizzato.lower()
        scelte += [f"esamina {n}"]
        scelte += [f"parla con {n}"] * 2 if o.is_personaggio else [f"prendi {n}"] * 2
    for o in inv:
        n = o.nome_visualizzato.lower()
        scelte += [f"lascia {n}"]
        scelte += [f"usa {n} su {b.nome_visualizzato.lower()}" for b in presenti]
    return rng.choice(scelte) if scelte else "guarda"


def avvia_lunga(a, rng, log):
    """Metà delle partite parte seguendo un percorso vero (bevendo e mangiando
    con comandi, come un giocatore) fino a un punto a caso: sequenze lunghe,
    zone avanzate, dialoghi decisivi."""
    import percorsi
    nome = rng.choice(list(percorsi.PERCORSI))
    rotta = percorsi.comandi(nome)
    for cmd in rotta[:rng.randint(len(rotta) // 3, len(rotta) - 5)]:
        m = a._mondo
        if m.stato_partita != "in_corso":
            break
        if not m.in_dialogo():
            v = m.variabili
            if v.get("sete", 0) >= 5 and v.get("acqua", 0) >= 1:
                a.fav_step("bevi"); log.append("A> bevi")
            if v.get("fame", 0) >= 6 and v.get("cibo", 0) >= 1:
                a.fav_step("mangia qualcosa"); log.append("A> mangia qualcosa")
        a.fav_step(cmd)
        log.append(f"A> {cmd}")


def in_sospeso(p):
    """La domanda che il motore aspetta: l'impronta dello stato non la vede (è stato di sessione), ma dopo un
    caricamento dev'essere la stessa della partita salvata."""
    m = p._mondo
    return (getattr(m, "_in_conferma", None), getattr(m, "_usa_in_sospeso", None), repr(getattr(m, "_ambiguita", None)))


def gioca(p, comandi, log=None):
    """Gioca dei comandi bevendo e mangiando quando serve, come avvia_lunga; restituisce i comandi giocati."""
    giocati = []
    for cmd in comandi:
        m = p._mondo
        if m.stato_partita != "in_corso":
            break
        if not m.in_dialogo():
            v = m.variabili
            if v.get("sete", 0) >= 5 and v.get("acqua", 0) >= 1:
                p.fav_step("bevi"); giocati.append("bevi")
            if v.get("fame", 0) >= 6 and v.get("cibo", 0) >= 1:
                p.fav_step("mangia qualcosa"); giocati.append("mangia qualcosa")
        p.fav_step(cmd)
        giocati.append(cmd)
    if log is not None:
        log += [f"A> {c}" for c in giocati]
    return giocati


def ricarica(p):
    """Un'istanza nuova che carica il salvataggio di `p`."""
    s = json.loads(p.fav_salva())
    b = nuovo_ponte()
    e = json.loads(b.fav_carica(GIOCO, json.dumps(s["comandi"]), s["impronta"], s["ultimo"]))
    return b, e, s


def domande():
    """Le domande del motore e ANNULLA (corrette dopo la 1.41.0). ANNULLA, riuscito o no, lascia cadere la domanda in sospeso
    (il sì/no di «ricomincia» o di «esci», «Con cosa vuoi usarla?»): il comando che l'aveva posta non deve
    restare in fondo alla sequenza, se no a ogni caricamento la domanda torna e un «s» per andare a sud
    diventa il «sì» che ricomincia la partita. E un «ricomincia» confermato fa ripartire anche la sequenza."""
    casi = [
        ("ANNULLA che non disfa niente", ["ricomincia", "annulla"], "s"),
        ("ANNULLA che disfa il turno dopo la domanda", ["nord", "aspetta", "ricomincia", "aspetta", "annulla"], "s"),
        ("la domanda di «usa» lasciata cadere e annullata", ["nord", "usa la tanica", "aspetta", "annulla"], "guarda"),
        ("«esci», un passo, ANNULLA", ["nord", "esci", "sud", "annulla"], "s"),
    ]
    for titolo, comandi, poi in casi:
        a = nuovo_ponte(); a.fav_boot(GIOCO)
        for c in comandi:
            a.fav_step(c)
        b, e, s = ricarica(a)
        if not e.get("ok") or not e["identica"]:
            return False, f"{titolo}: il caricamento non è identico ({s['comandi']})"
        if in_sospeso(a) != in_sospeso(b):
            return False, f"{titolo}: dopo il caricamento il motore aspetta {in_sospeso(b)}, la partita salvata {in_sospeso(a)} (sequenza {s['comandi']})"
        ra, rb = json.loads(a.fav_step(poi)), json.loads(b.fav_step(poi))
        if ra["text"] != rb["text"] or a.fav_impronta_stato() != b.fav_impronta_stato():
            return False, f"{titolo}: dopo il caricamento «{poi}» fa un'altra cosa"
    # RICOMINCIA confermato: la sequenza riparte, il ponte lo dice, e il caricamento è identico
    a = nuovo_ponte(); a.fav_boot(GIOCO)
    for c in ["nord", "aspetta", "ricomincia"]:
        a.fav_step(c)
    if not json.loads(a.fav_step("sì")).get("ricominciata"):
        return False, "il «sì» a «ricominciare da capo?» non dice «ricominciata»"
    a.fav_step("nord")
    b, e, s = ricarica(a)
    if s["comandi"] != ["nord"] or not e["identica"]:
        return False, f"dopo RICOMINCIA la sequenza doveva ripartire: è {s['comandi']}, identica {e['identica']}"
    # una sequenza fino alla 1.41.0, che contiene ancora la partita abbandonata e il «ricomincia»,
    # si ricarica uguale anche quando il «ricomincia» cade nella testa che si rigioca senza istantanee
    import percorsi
    rotta = percorsi.comandi("A_peppe")
    a = nuovo_ponte(); a.fav_boot(GIOCO)
    prima = gioca(a, rotta[:12])
    a.fav_step("ricomincia"); a.fav_step("sì")
    dopo = gioca(a, rotta[:CODA_ANNULLA_PROVA])
    vecchia = prima + ["ricomincia", "sì"] + dopo
    b = nuovo_ponte()
    e = json.loads(b.fav_carica(GIOCO, json.dumps(vecchia), a.fav_impronta_stato(), a._mondo.ultimo_comando))
    if not e.get("ok") or not e["identica"] or b._registro != a._registro:
        return False, f"una sequenza vecchia con RICOMINCIA non si ricarica uguale ({e.get('errore')})"
    for c in ("annulla", "annulla", "guarda"):
        a.fav_step(c); b.fav_step(c)
    if a.fav_impronta_stato() != b.fav_impronta_stato():
        return False, "dopo una sequenza vecchia con RICOMINCIA, ANNULLA disfa un'altra cosa"
    return True, ""


# comandi giocati dopo il «ricomincia» nella prova della sequenza vecchia: più della coda con le istantanee
CODA_ANNULLA_PROVA = 46


def partita(seme, comandi, ogni, log):
    rng = random.Random(seme)
    a = nuovo_ponte()
    a.fav_boot(GIOCO)
    if seme % 2 == 0:
        avvia_lunga(a, rng, log)
    verifiche = 0
    massimo = 0
    t_carica = 0.0
    for i in range(comandi):
        if a._mondo.stato_partita != "in_corso":
            break
        # niente aiuti fuori dai comandi: ogni cambiamento deve passare dalla
        # sequenza, altrimenti nessun salvataggio potrebbe riprodurlo
        cmd = scegli(a, rng)
        log.append(f"A> {cmd}")
        a.fav_step(cmd)
        if i % ogni == ogni - 1 and a._mondo.stato_partita == "in_corso":
            salvato = json.loads(a.fav_salva())
            massimo = max(massimo, len(salvato["comandi"]))
            b = nuovo_ponte()
            t0 = time.perf_counter()
            esito = json.loads(b.fav_carica(GIOCO, json.dumps(salvato["comandi"]), salvato["impronta"], salvato["ultimo"]))
            t_carica = max(t_carica, time.perf_counter() - t0)
            if not esito.get("ok") or not esito["identica"]:
                return False, f"caricamento diverso dopo {i + 1} comandi ({len(salvato['comandi'])} registrati)", verifiche, massimo, t_carica
            if in_sospeso(a) != in_sospeso(b):
                return False, f"dopo il caricamento il motore aspetta {in_sospeso(b)}, la partita salvata {in_sospeso(a)}", verifiche, massimo, t_carica
            # proseguono insieme
            rng_b = random.Random(seme * 7919 + i)
            for _ in range(DOPO):
                if a._mondo.stato_partita != "in_corso":
                    break
                c = scegli(a, rng_b)
                ra, rb = json.loads(a.fav_step(c)), json.loads(b.fav_step(c))
                log.append(f"AB> {c}")
                if ra["text"] != rb["text"]:
                    log.append("--- A ---\n" + ra["text"] + "\n--- B ---\n" + rb["text"])
                    return False, f"risposte diverse a «{c}» dopo il caricamento", verifiche, massimo, t_carica
                if a.fav_impronta_stato() != b.fav_impronta_stato() or in_sospeso(a) != in_sospeso(b):
                    return False, f"stati diversi dopo «{c}», dopo il caricamento", verifiche, massimo, t_carica
                # e anche la sequenza salvata di B deve ricaricare uguale
            sb = json.loads(b.fav_salva())
            c2 = nuovo_ponte()
            e2 = json.loads(c2.fav_carica(GIOCO, json.dumps(sb["comandi"]), sb["impronta"], sb["ultimo"]))
            if not e2["identica"]:
                return False, "il salvataggio fatto DOPO un caricamento non ricarica uguale", verifiche, massimo, t_carica
            verifiche += 1
    return True, "", verifiche, massimo, t_carica


def caricamento_fallito():
    """Un caricamento che si rompe a metà rigiocata lascia il ponte com'era.

    Il ponte ricompila il mondo e rigioca la sequenza: se un comando solleva un'eccezione a metà, il motore non
    deve restare con un mondo parziale mentre l'interfaccia mostra ancora quello di prima. Qui un'istanza gioca un
    pezzo di percorso (dentro un dialogo, con delle istantanee di ANNULLA), poi carica un salvataggio con
    elabora_comando guastato al quinto comando: l'esito dev'essere «non ok» e tutto ciò che il ponte ricorda
    (mondo, sequenza, posizioni di ANNULLA, dialogo in corso) identico a prima. Una gemella mai toccata, che
    gioca gli stessi comandi, deve dare le stesse risposte."""
    import percorsi
    rotta = percorsi.comandi("A_peppe")[:60]
    a, gemella = nuovo_ponte(), nuovo_ponte()
    for p in (a, gemella):
        p.fav_boot(GIOCO)
    for c in rotta:
        if a._mondo.stato_partita != "in_corso":
            break
        if not a._mondo.in_dialogo():
            v = a._mondo.variabili
            if v.get("sete", 0) >= 5 and v.get("acqua", 0) >= 1:
                a.fav_step("bevi"); gemella.fav_step("bevi")
            if v.get("fame", 0) >= 6 and v.get("cibo", 0) >= 1:
                a.fav_step("mangia qualcosa"); gemella.fav_step("mangia qualcosa")
        a.fav_step(c); gemella.fav_step(c)
    assert len(a._registro) > 20, "il percorso è troppo corto per la prova"

    def ricordi(p):
        return (p._mondo, p._entry, list(p._registro), list(p._posizioni), p._ingresso_dialogo, p._inizio_domanda,
                p.fav_impronta_stato(), p.fav_stato(), p.fav_salva())

    prima = ricordi(a)
    salvato = json.loads(a.fav_salva())
    originale, chiamate = a.elabora_comando, [0]

    def guasto(mondo, cmd):
        chiamate[0] += 1
        if chiamate[0] == 5:
            raise RuntimeError("guasto di prova a metà del caricamento")
        return originale(mondo, cmd)

    a.elabora_comando = guasto
    try:
        esito = json.loads(a.fav_carica(GIOCO, json.dumps(salvato["comandi"]), salvato["impronta"], salvato["ultimo"]))
    finally:
        a.elabora_comando = originale
    if chiamate[0] < 5:
        return False, "il guasto non è scattato: la prova non prova niente"
    if esito.get("ok") or "guasto di prova" not in esito.get("errore", ""):
        return False, f"un caricamento rotto deve dire «non ok» con la causa, ha detto {esito}"
    dopo = ricordi(a)
    nomi = ("mondo", "avventura", "sequenza", "posizioni di annulla", "dialogo in corso", "domanda in sospeso",
            "impronta", "stato", "salvataggio")
    for nome, x, y in zip(nomi, prima, dopo):
        if (x is not y) if nome == "mondo" else (x != y):
            return False, f"dopo un caricamento fallito il ponte non è com'era: {nome} è cambiato"
    # e la partita prosegue come se niente fosse (anche ANNULLA, che si regge sulle posizioni)
    for c in ("guarda", "stato", "annulla", "guarda", "inventario"):
        ra, rg = json.loads(a.fav_step(c)), json.loads(gemella.fav_step(c))
        if ra["text"] != rg["text"] or a.fav_impronta_stato() != gemella.fav_impronta_stato():
            return False, f"dopo il caricamento fallito la partita non prosegue come la gemella, a «{c}»"
    return True, ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("-n", type=int, default=40, help="partite (default 40)")
    ap.add_argument("-c", type=int, default=160, help="comandi per partita (default 160)")
    args = ap.parse_args()
    t0 = time.time()
    ok, motivo = caricamento_fallito()
    if not ok:
        print(f"KO caricamento fallito: {motivo}")
        return 1
    print("OK un caricamento rotto a metà lascia il ponte com'era (mondo, sequenza, ANNULLA, dialogo).")
    ok, motivo = domande()
    if not ok:
        print(f"KO domande del motore: {motivo}")
        return 1
    print("OK le domande del motore lasciate cadere con ANNULLA non tornano dopo un caricamento; RICOMINCIA fa ripartire la sequenza.")
    totale, massimo, peggiore = 0, 0, 0.0
    for s in range(args.n):
        log = []
        ok, motivo, verifiche, mx, tc = partita(s + 1, args.c, 20, log)
        totale += verifiche
        massimo = max(massimo, mx)
        peggiore = max(peggiore, tc)
        if not ok:
            os.makedirs(ESITI, exist_ok=True)
            percorso = os.path.join(ESITI, f"salvataggi-seme-{s + 1}.txt")
            with open(percorso, "w", encoding="utf-8") as f:
                f.write("\n".join(log))
            print(f"KO partita {s + 1}: {motivo}\n   trascrizione: {percorso}")
            return 1
    print(f"OK {args.n} partite, {totale} salvataggi ricaricati e verificati "
          f"(impronta dello stato + fino a {totale * DOPO} risposte confrontate dopo il caricamento).")
    print(f"   sequenza più lunga: {massimo} comandi; caricamento più lento: {peggiore * 1000:.0f} ms; {time.time() - t0:.0f} s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
