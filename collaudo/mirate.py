"""Prove mirate: situazioni precise da non rompere (guardie, combattimenti,
baratti, ingressi ripetuti). Ogni prova è un percorso più le frasi che DEVONO
comparire nell'output e quelle che NON devono comparire.

Uso:  python mirate.py      (esce con 1 se una prova fallisce)
"""
import sys

import percorsi as P
from finali import pilota

FINO_CASELLO = P.Z1_Z4[:P.Z1_Z4.index('parla con Vito')]
FINO_Z5 = P.Z1_Z4

PROVE = {
 'tanica e guardie': (['lascia tanica', 'bevi', 'mangia qualcosa', 'getta cibo', 'attingi', 'nord', 'est', 'attacca Nunzio', 'minaccia Nunzio'],
    ['La tanica non la molli', 'Non hai sete', 'Non hai fame', 'Non c\'è niente da gettare', 'Alzi le mani', 'Nessuno qui ti ha fatto niente', 'Qui non c\'è niente da cui attingere'], []),
 'cane a mani nude': (P.Z1_Z4[:P.Z1_Z4.index('getta cibo')] + ['attacca il cane'] * 2 + ['esamina cane', 'guarda', 'attacca il cane'],
    ['Tieni il cane a distanza', 'Il cane crolla', 'steso su un fianco', 'Il cane non è più un problema'], []),
 'cane: lancia il cibo': (P.Z1_Z4[:P.Z1_Z4.index('getta cibo')] + ['lancia il cibo', 'guarda'],
    ['Il cane scatta dietro', 'Del cane, solo le impronte'], ['azzanna il polpaccio.\n> guarda']),
 'Vito KO col coltello': (FINO_CASELLO + ['attacca Vito'] * 4 + ['parla con Vito', '1', 'esamina Vito', 'guarda', 'stato', 'ovest'],
    ['Affondi il coltello', 'Vito arretra', 'Respira storto', 'seduto a terra contro la sbarra', 'contro il palo', '--- La discesa'], ['L\'amico mio']),
 'Vito: bluff con pistola': (FINO_CASELLO + ['nord', 'prendi pistola', 'esamina pistola', 'sud', 'minaccia Vito', 'parla con Vito', '1', 'ovest'],
    ['MINACCIA chi ti sbarra', 'Vito non sa che è scarica', '«Tu.» Non si alza', '--- La discesa'], ['L\'amico mio', 'Cosa c\'è, oltre']),
 'Vito: paga, lasciapassare sul bancone': (FINO_CASELLO + ['parla con Vito', "tre d'acqua", 'grazie', 'guarda', 'parla con Vito', '1'],
    ['lo lascia sul bancone', 'un lasciapassare', 'la sbarra alzata', 'L\'amico mio'], []),
 'Rosaria: ingressi ripetuti': (FINO_Z5 + ['nord', 'sud', 'nord', 'sud', 'nord', 'nord'],
    ['Rosaria ti mette', 'Senza una mia parola'], []),
 'Onofrio: rifiuto senza ricordi': (FINO_Z5 + ['nord', 'parla con Rosaria', "dell'acqua", '1', "dell'acqua", '1', "dell'acqua", '1', 'colline', 'scrivile', 'grazie',
     'nord', 'nord', 'nord', 'ovest', 'parla con Onofrio', 'aiuto', '1', 'lasciami', 'est', 'nord', 'nord'],
    ['Portami qualcosa di quella casa', 'a mani vuote, non ci si arriva'], ['Devo passare il guado']),
}



def main():
    tutto_ok = True
    for nome, (cmds, attese, vietate) in PROVE.items():
        p, _ = pilota(cmds, soglia_sete=4, soglia_fame=5)
        testo = p.trascrizione()
        manca = [a for a in attese if a not in testo]
        trovate = [v for v in vietate if v in testo]
        ok = not manca and not trovate and not p.eccezioni
        tutto_ok &= ok
        extra = (f"manca: {manca} " if manca else "") + (f"vietate: {trovate}" if trovate else "")
        if p.eccezioni:
            extra += " ECCEZIONE DEL MOTORE"
        print(f"{'OK ' if ok else 'KO '}{nome:38s} {extra}")
        p.salva("mirata-" + nome.split(":")[0].replace(" ", "_") + ".txt")
    print("TUTTE OK" if tutto_ok else "CI SONO FALLIMENTI")
    return 0 if tutto_ok else 1


if __name__ == "__main__":
    sys.exit(main())
