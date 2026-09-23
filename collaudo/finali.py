"""Collaudo dei finali: una partita per OGNI finale dichiarato nell'avventura.

Nove finali: i sei della storia (percorsi.py) e le tre morti (sete, fame, ferite).
Il collaudo prima elenca i finali scritti nei .fav (finali_dichiarati), poi gioca
le partite e controlla che ognuno sia raggiunto dalla partita prevista. Se si
aggiunge un finale all'avventura senza una partita che lo raggiunga, il collaudo
fallisce e lo nomina.

Il pilota gioca come un giocatore attento: prima di ogni comando fuori dai
dialoghi beve se ha sete e mangia se ha fame (e se ha di che). Le morti si
provocano spegnendo la parte di cura che serve.

Uso:  python finali.py            (esce con 1 se qualcosa non va)
      python finali.py -v         (stampa anche le trascrizioni dei fallimenti)
Le trascrizioni complete finiscono in collaudo/esiti/finale-*.txt
"""
import sys

import percorsi
from partita import Partita, finali_dichiarati, riga_finale, VERSIONE_MOTORE


def pilota(cmds, bevi=True, mangia=True, soglia_sete=5, soglia_fame=6, limite=None, giro=None):
    """Gioca i comandi curando il corpo. Se i comandi finiscono e la partita è
    ancora in corso, ripete in tondo i comandi di «giro» fino al limite di
    comandi (serve alle morti: si resta a girare sul posto)."""
    p = Partita(seme=1)
    vita_min = p.v("vita", 10)
    i = 0
    limite = limite or len(cmds)
    while p.in_corso and i < limite:
        if i < len(cmds):
            c = cmds[i]
        elif giro:
            c = giro[(i - len(cmds)) % len(giro)]
        else:
            break
        if not p.m.dialogo_attivo:
            if bevi and p.v("sete") >= soglia_sete and p.v("acqua") >= 1:
                p.esegui("bevi")
            if mangia and p.v("fame") >= soglia_fame and p.v("cibo") >= 1:
                p.esegui("mangia qualcosa")
        if not p.in_corso:
            break
        p.esegui(c)
        vita_min = min(vita_min, p.v("vita", 10))
        i += 1
    return p, vita_min


# Le tre morti: che cosa si toglie al pilota e dove lo si lascia.
_FINO_SERRA = percorsi.Z1_Z4[:percorsi.Z1_Z4.index("getta cibo")]
MORTI = {
    # nessuno beve: si va e viene dalla stazione alla piazza finché la sete vince
    "sete": dict(cmds=[], giro=["nord", "sud"], bevi=False, mangia=True, limite=200),
    # si beve ma non si mangia: il percorso fino al casello, poi avanti e indietro
    "fame": dict(cmds=percorsi.Z1_Z4, giro=["est", "ovest"], bevi=True, mangia=False, limite=400),
    # nella serra col cane che morde, senza reagire
    "ferite": dict(cmds=_FINO_SERRA, giro=["esamina il cane"], bevi=True, mangia=True, limite=len(_FINO_SERRA) + 60),
}

# Che finale aspettarsi da ciascuna partita (una frase che lo identifica).
ATTESI = {
    "A_peppe": "lo porti via vivo",
    "B_cavallo": "l'ultima cosa che restava da riportare",
    "C_fede": "le hai riportato quello che era suo",
    "D_vuoto": "con le mani vuote",
    "E_fucile": "sopra il corpo di tuo fratello",
    "F_fucile_pep": "Il ragazzo che ti seguiva",
    "sete": "La sete ti ha avuto",
    "fame": "La fame ti ha fermato",
    "ferite": "Il viaggio finisce qui",
}


def main():
    verboso = "-v" in sys.argv
    print(f"Collaudo dei finali — motore FAVELLA {VERSIONE_MOTORE}")
    dichiarati = finali_dichiarati()
    print(f"Finali dichiarati nell'avventura: {len(dichiarati)}\n")

    partite = {n: pilota(percorsi.comandi(n)) for n in percorsi.PERCORSI}
    for nome, cfg in MORTI.items():
        partite[nome] = pilota(**cfg)

    tutto_ok = True
    raggiunti = set()
    print(f"{'partita':14s} {'turni':>5s} {'vita min':>8s}  esito")
    for nome, (p, vita_min) in partite.items():
        testo = p.trascrizione()
        finale = riga_finale(testo) or (p.m.messaggio_esito or "")
        atteso = ATTESI[nome]
        doppio = testo.count("FINALE —") > 1
        ok = atteso in testo and not p.in_corso and not p.eccezioni and not doppio
        tutto_ok &= ok
        for esito, msg in dichiarati:
            if msg and msg in testo:
                raggiunti.add(msg)
        stato = "OK " if ok else "KO "
        print(f"{stato}{nome:11s} {p.m.turno_corrente:5d} {vita_min:8d}  {p.m.stato_partita:9s} {finale[:78]}")
        if not ok:
            percorso = p.salva(f"finale-{nome}.txt")
            motivo = "eccezione del motore" if p.eccezioni else (
                "partita ancora in corso" if p.in_corso else
                "più di un finale nella stessa partita" if doppio else f"finale diverso da «{atteso}»")
            print(f"     → {motivo}; trascrizione: {percorso}")
            if verboso:
                print(testo[-3000:])
        else:
            p.salva(f"finale-{nome}.txt")

    mancanti = [m for _, m in dichiarati if m and m not in raggiunti]
    print(f"\nCopertura: {len(dichiarati) - len(mancanti)}/{len(dichiarati)} finali dichiarati raggiunti.")
    for m in mancanti:
        tutto_ok = False
        print(f"  MANCA una partita che raggiunga: {m}")
    print("\nTUTTO OK" if tutto_ok else "\nCI SONO FALLIMENTI")
    return 0 if tutto_ok else 1


if __name__ == "__main__":
    sys.exit(main())
