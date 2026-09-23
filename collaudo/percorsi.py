"""I percorsi scritti a mano: una partita per ciascuno dei sei finali della storia.

Le opzioni di dialogo si scelgono per TESTO PARZIALE (il motore lo accetta), così
i menu condizionali non spostano la numerazione. Bere e mangiare NON sono nei
percorsi: li decide il pilota (finali.py) come farebbe un giocatore attento.
Se cambi l'avventura e un percorso si rompe, il collaudo dei finali te lo dice
indicando il comando che non ha avuto effetto.
"""

Z1_Z4 = [
    'esamina biglietto', 'nord', 'nord', 'prendi mappa', 'prendi orologio', 'prendi coltello',
    'sud', 'est', 'parla con Nunzio', 'orologio', 'torno', 'mangiare', 'basta',
    'ovest', 'ovest', 'ovest', 'ovest', 'nord', 'parla con Saverio', 'cibo', 'grazie', 'attingi',
    'sud', 'sud', 'getta cibo', 'nord', 'ovest', 'ovest', 'ovest',
    'lascia mappa', 'prendi filtro', 'prendi occhiali', 'prendi batteria',
    'est', 'nord', 'parla con Iole', "dell'acqua", 'grazie', 'niente',
    'nord', 'prendi pastiglie', 'sud', 'usa le pastiglie su la pompa', 'stato',
    'ovest', 'ovest', 'ovest', 'sud', 'prendi medicine', 'nord',
    'parla con Vito', "tre d'acqua", 'grazie', 'prendi lasciapassare', 'stato',
    'ovest', 'ovest', 'ovest',
]

def z5(peppe, giocattolo, anello):
    c = []
    c += ['lascia coltello', 'lascia occhiali', 'parla con Peppe', 'vieni' if peppe else 'resta', '1']
    c += ['ovest', 'usa le medicine su Pasquale', 'est']
    c += ['est', 'parla con Ciro', 'batteria', 'altro', 'carta', 'basta', 'ovest']
    c += ['nord', 'esamina registro', 'parla con Rosaria', "dell'acqua", '1', 'colline', 'scrivile', 'grazie']
    c += ['est']
    if giocattolo: c += ['prendi giocattolo']
    if anello: c += ['prendi anello']
    c += ['parla con Concetta', 'erano', 'disgrazia', '1', 'riposare', 'ovest', 'inventario', 'stato']
    return c

def z6(arma, giocattolo):
    c = ['nord', 'nord', 'est', 'esamina santino', 'prendi santino', 'prendi coperta', 'ovest', 'nord',
         'parla con Tore', 'formaggio', '1', 'guado', '1', 'tiro avanti',
         'est', 'attingi', 'ovest', 'ovest', 'parla con Onofrio', 'successo', 'biglietto', '1']
    c += ['cavallo' if giocattolo else 'santino', 'cosa mi dai', arma, '1', 'prendi ' + arma, 'esamina ' + arma]
    c += ['est', 'est', 'attingi', 'ovest', 'nord', 'stato', 'inventario']
    return c

def z7(arma):
    c = ['nord', 'parla con Cosimo', 'sapevo', '1', '…', 'usa il biglietto su Cosimo']
    c += ['usa la lettera su Cosimo'] if arma == 'lettera' else ['attacca Cosimo']
    c += ['parla con Cosimo', '1', 'esamina Cosimo', 'guarda', 'nord', 'nord']
    return c

PERCORSI = {
    'A_peppe':      dict(peppe=True,  giocattolo=True,  anello=False, arma='lettera'),
    'B_cavallo':    dict(peppe=False, giocattolo=True,  anello=False, arma='lettera'),
    'C_fede':       dict(peppe=False, giocattolo=False, anello=True,  arma='lettera'),
    'D_vuoto':      dict(peppe=False, giocattolo=False, anello=False, arma='lettera'),
    'E_fucile':     dict(peppe=False, giocattolo=True,  anello=False, arma='fucile'),
    'F_fucile_pep': dict(peppe=True,  giocattolo=True,  anello=False, arma='fucile'),
}


def comandi(nome):
    """La sequenza completa di comandi di un percorso."""
    p = PERCORSI[nome]
    return Z1_Z4 + z5(p['peppe'], p['giocattolo'], p['anello']) + z6(p['arma'], p['giocattolo']) + z7(p['arma'])
