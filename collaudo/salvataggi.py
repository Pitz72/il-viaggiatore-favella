"""Collaudo dei salvataggi: salvare e ricaricare deve restituire la STESSA partita.

Il ponte dell'app (app/src/lib/ponte.py) salva la sequenza effettiva dei comandi
e al caricamento la rigioca. Qui lo si mette alla prova con partite casuali che
fanno di tutto: si spostano, prendono, parlano, scelgono risposte, annullano
(anche dentro e dopo i dialoghi), ripetono con ANCORA, sbagliano comando.

Per ogni partita, a intervalli:
  1. l'istanza A salva;
  2. un'istanza B, nuova e indipendente, carica il salvataggio;
  3. l'impronta dello stato di B deve essere identica a quella di A;
  4. A e B proseguono con gli stessi comandi: ogni risposta deve coincidere
     parola per parola, e le impronte restare uguali.

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
                if a.fav_impronta_stato() != b.fav_impronta_stato():
                    return False, f"stati diversi dopo «{c}», dopo il caricamento", verifiche, massimo, t_carica
                # e anche la sequenza salvata di B deve ricaricare uguale
            sb = json.loads(b.fav_salva())
            c2 = nuovo_ponte()
            e2 = json.loads(c2.fav_carica(GIOCO, json.dumps(sb["comandi"]), sb["impronta"], sb["ultimo"]))
            if not e2["identica"]:
                return False, "il salvataggio fatto DOPO un caricamento non ricarica uguale", verifiche, massimo, t_carica
            verifiche += 1
    return True, "", verifiche, massimo, t_carica


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("-n", type=int, default=40, help="partite (default 40)")
    ap.add_argument("-c", type=int, default=160, help="comandi per partita (default 160)")
    args = ap.parse_args()
    t0 = time.time()
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
