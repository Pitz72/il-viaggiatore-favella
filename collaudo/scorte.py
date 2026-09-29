"""Bere e mangiare: ogni forma del comando fa quello che deve, anche in più riprese.

Un sorso toglie 4 alla sete e costa 1 d'acqua; una porzione toglie 3 alla fame e
costa 1 di cibo. «bevi due sorsi» e «mangia tre porzioni» sono un turno solo.
I pulsanti dell'interfaccia (la tanica, le scorte) mandano questi comandi, e le
forme vecchie («mangia qualcosa») restano valide perché stanno nei salvataggi.

Ogni prova parte da una partita nuova (turno 0, niente logorio di mezzo) e
controlla le quattro variabili dopo il comando, il turno e la frase.

Uso:  python scorte.py      (esce con 1 se una prova fallisce)
"""
import sys

import partita

SORSO_SETE, PORZIONE_FAME = 4, 3

# (comandi equivalenti, partenza, attesi dopo, frase che deve comparire, turni)
BERE = [
    (["bevi", "bevi acqua", "bere acqua", "bevi un sorso", "bevi 1"], dict(sete=8, acqua=3),
     dict(sete=8 - SORSO_SETE, acqua=2), "Bevi a piccoli sorsi", 1),
    (["bevi due sorsi", "bevi 2", "bevi 2 sorsi"], dict(sete=11, acqua=3),
     dict(sete=11 - 2 * SORSO_SETE, acqua=1), "Bevi due sorsi lenti", 1),
    (["bevi tre sorsi", "bevi 3", "bevi 3 sorsi"], dict(sete=12, acqua=3),
     dict(sete=12 - 3 * SORSO_SETE, acqua=0), "Bevi a lungo", 1),
    # rifiuti: niente cambia
    (["bevi", "bevi due sorsi", "bevi tre sorsi"], dict(sete=1, acqua=3),
     dict(sete=1, acqua=3), "Non hai sete", 1),
    (["bevi due sorsi"], dict(sete=8, acqua=1),
     dict(sete=8, acqua=1), "un fondo solo", 1),
    (["bevi tre sorsi"], dict(sete=8, acqua=2),
     dict(sete=8, acqua=2), "non c'è acqua per tre sorsi", 1),
    (["bevi", "bevi due sorsi", "bevi tre sorsi"], dict(sete=8, acqua=0),
     dict(sete=8, acqua=0), "vuota", 1),
]

MANGIARE = [
    (["mangia qualcosa", "mangia cibo", "mangia una porzione", "mangia 1"],
     dict(fame=9, cibo=2), dict(fame=9 - PORZIONE_FAME, cibo=1), "Mastichi piano", 1),
    (["mangia due porzioni", "mangia 2", "mangia 2 porzioni"], dict(fame=10, cibo=3),
     dict(fame=10 - 2 * PORZIONE_FAME, cibo=1), "Mangi con metodo", 1),
    (["mangia tre porzioni", "mangia 3", "mangia 3 porzioni"], dict(fame=12, cibo=3),
     dict(fame=12 - 3 * PORZIONE_FAME, cibo=0), "Mangi tutto", 1),
    (["mangia qualcosa", "mangia due porzioni", "mangia tre porzioni"], dict(fame=1, cibo=3),
     dict(fame=1, cibo=3), "Non hai fame", 1),
    (["mangia due porzioni"], dict(fame=9, cibo=1),
     dict(fame=9, cibo=1), "per una porzione sola", 1),
    (["mangia tre porzioni"], dict(fame=9, cibo=2),
     dict(fame=9, cibo=2), "Non hai cibo per tre porzioni", 1),
    (["mangia qualcosa", "mangia due porzioni", "mangia tre porzioni"], dict(fame=9, cibo=0),
     dict(fame=9, cibo=0), "Non hai niente da mettere", 1),
]


def prova(cmd, partenza, attesi, frase, turni):
    p = partita.Partita(seme=1)
    for k, v in partenza.items():
        p.m.variabili[k] = v
    out = p.esegui(cmd)
    errori = []
    for k, v in attesi.items():
        if p.v(k) != v:
            errori.append(f"{k}={p.v(k)} (atteso {v})")
    if frase not in out:
        errori.append(f"manca «{frase}» in: {out.strip()[:120]!r}")
    if p.m.turno_corrente != turni:
        errori.append(f"turno {p.m.turno_corrente} (atteso {turni})")
    if p.eccezioni:
        errori.append("ECCEZIONE DEL MOTORE")
    return errori


def altre_prove():
    """Cose che non devono cambiare."""
    esiti = []
    # un oggetto non si mangia: «mangia il biglietto» resta al motore, senza toccare il cibo
    p = partita.Partita(seme=1)
    p.m.variabili.update(fame=9, cibo=2)
    out = p.esegui("mangia il biglietto")
    esiti.append(("«mangia il biglietto»: non si mangia, il cibo resta",
                  "Non si mangia" in out and p.v("cibo") == 2 and p.v("fame") == 9))
    # «bevi salmastra» resta il comando del fondale
    p = partita.Partita(seme=1)
    p.m.posizione_giocatore = "fondale"
    out = p.esegui("bevi salmastra")
    esiti.append(("«bevi salmastra» al fondale", "a mani giunte" in out and p.v("acqua") == 3))
    p = partita.Partita(seme=1)
    out = p.esegui("bevi salmastra")
    esiti.append(("«bevi salmastra» altrove", "Non c'è acqua salmastra" in out))
    # dopo una dose piena non si può bere di nuovo (la sete è a 0 e il turno passa una volta sola)
    p = partita.Partita(seme=1)
    p.m.variabili.update(sete=4, acqua=3)
    p.esegui("bevi due sorsi")
    esiti.append(("dopo aver bevuto a sazietà: sete 0", p.v("sete") == 0 and p.v("acqua") == 1))
    # ANNULLA disfa l'intera dose in un solo passo
    p = partita.Partita(seme=1)
    p.m.variabili.update(sete=11, acqua=3)
    p.esegui("bevi tre sorsi")
    p.esegui("annulla")
    esiti.append(("ANNULLA riporta indietro tutti e tre i sorsi", p.v("acqua") == 3 and p.v("sete") == 11))
    return esiti


def main():
    tutto_ok = True
    for gruppo, tabella in (("bere", BERE), ("mangiare", MANGIARE)):
        for cmds, partenza, attesi, frase, turni in tabella:
            for cmd in cmds:
                errori = prova(cmd, partenza, attesi, frase, turni)
                if errori:
                    tutto_ok = False
                    print(f"KO {gruppo:9s} «{cmd}» da {partenza}: " + "; ".join(errori))
    n = sum(len(c) for c, *_ in BERE) + sum(len(c) for c, *_ in MANGIARE)
    print(f"{'OK ' if tutto_ok else 'KO '}{n} comandi di bere e mangiare, con tutti i loro sinonimi")
    for nome, ok in altre_prove():
        tutto_ok &= ok
        print(f"{'OK ' if ok else 'KO '}{nome}")
    print("TUTTO OK" if tutto_ok else "CI SONO FALLIMENTI")
    return 0 if tutto_ok else 1


if __name__ == "__main__":
    sys.exit(main())
