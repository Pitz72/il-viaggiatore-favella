---
data: 2026-10-20
ora: "23:46"
titolo: "Il menu d'avvio in colonna e la pausa (piano 09, fase 2)"
tipo: sessione
versione: 1.25.0
---

# Il menu d'avvio in colonna e la pausa (piano 09, fase 2)

## In breve
Il menu d'avvio è diventato una colonna di voci, come nel Relitto, e la partita ha una pausa con Esc; la testata è scesa a tre tasti. È la seconda fase del piano 09.

## Contesto
Simone ha detto che il menu d'avvio «si aggancia all'ultimo frame dell'intro ma non ne fa parte» e va riorganizzato, e ha scelto (questionario, D3–D6) la testata «salva · carica · ☰ pausa», una conferma su «Nuovo viaggio», solo «Si parte a piedi.» come frase, e via il tasto dello schermo intero dal palco. Prima: una frase d'invito lunga, una fila Continua / Nuovo viaggio e una fila di cinque pulsantini; in partita sei tasti in testata e nessuna pausa.

## Lavoro fatto
- `app/src/gioco/VociMenu.tsx` e `menu.css` (nuovi): la colonna di voci per il menu e la pausa. Una sola voce «di adesso», il fuoco, che il mouse sposta passandoci sopra; ha il testo pieno e un filo d'accento ai due lati; le altre restano tenui. ↑ ↓, Inizio, Fine; Invio sceglie. Il fuoco parte sulla prima voce, dopo i dialoghi che lo prendono all'apertura, e segue «Continua» quando arriva in cima (i salvataggi si leggono dopo), se chi gioca non l'ha già spostato.
- `Trailer.tsx`: la schermata d'avvio è la colonna (Continua il viaggio con luogo e turno, Nuovo viaggio o Inizia il viaggio, Carica un viaggio, Opzioni, Come si gioca, Rivedi il trailer, Esci sul desktop) sotto «Si parte a piedi.»; in basso a sinistra «↑↓ scegli · Invio conferma». Comportamento del trailer, durata, Esc: invariati.
- `app/src/gioco/Domanda.tsx` (nuovo): una domanda sì/no a parte, S / N / Esc. Il fuoco va su «sì» un attimo dopo l'apertura e non con `autoFocus`: con `autoFocus` il dialogo ricordava come «chi l'ha aperto» il suo stesso pulsante e, chiuso, rimandava il fuoco in cima al menu invece che su «Nuovo viaggio». Trovato provando con la tastiera.
- `app/src/gioco/Pausa.tsx` (nuovo): la pausa sopra la partita velata, con la stessa colonna. Opzioni, taccuino e guida le stanno sopra: `useDialogo` ha un parametro `sospeso` che lascia Esc e Tab al dialogo di sopra, così un Esc chiude solo le opzioni e si torna alla pausa col fuoco su «Opzioni».
- `ViaggiatorePlayer.tsx`: Esc, nell'ordine, chiude un menu o un pannello della partita; se la voce parlava la zittisce soltanto (il tasto che ferma la voce ricorda se stava parlando); con la riga vuota apre la pausa; con la riga piena non fa niente. Testata: salva, carica, ☰ pausa. `Panorama.tsx`: `fermo`, in pausa il disegno si ferma senza salti alla ripresa. `GameShell.tsx`: via il tasto dello schermo intero.
- La guida dice che Esc mette in pausa; il README descrive il menu e la pausa.

## Decisioni
- **Una voce «di adesso» sola, anche col mouse** — perché: è come si comportano i menu dei giochi; due voci accese (una dal mouse, una dalla tastiera) confondono.
- **La voce «Trofei» arriva con la fase 7** — perché: oggi aprirebbe una pagina vuota.
- **Con la riga piena Esc non cancella** — perché: il piano lo chiede («niente di distruttivo»); per svuotarla basta cancellare.
- **«Torna al menu» ed «Esci» senza conferma** — perché: scrivono prima il posto automatico, come «← intro» e «✕ esci» di prima; non si perde niente.
- **Versione 1.25.0** — menu e pausa nuovi: MINOR.

## Verifiche
- I collaudi: `finali.py`, `mirate.py`, `salvataggi.py -n 16`, `scorte.py`, `interfaccia.py`, `fili.py`, `giocate.py`, `conferme.py` (95 scelte), `testo.py`, `pulsanti.py`, `doppiaggio.py` tutti ok; `desktop/prove.cjs` 7, `opzioni-node.mjs` 7; `tsc` pulito; build ok.
- Nel browser integrato, solo da tastiera: il menu ha sei voci (sette sul desktop), il fuoco su «Continua», l'ultima voce finisce all'86% del quadro; ↓ e Invio su «Nuovo viaggio» aprono la domanda col fuoco su «sì»; N ed Esc la chiudono e il fuoco torna su «Nuovo viaggio». In partita: con la voce che parla il primo Esc la zittisce e basta, il secondo apre la pausa col fuoco su «Riprendi»; le opzioni aperte dalla pausa tengono Tab dentro di sé, Esc le chiude e si resta in pausa col fuoco su «Opzioni», un altro Esc riprende col fuoco sulla riga; Esc con «esamina» scritto non apre niente; Esc col menu di Nunzio aperto lo chiude e basta; «Torna al menu d'avvio» (con Fine e Invio) riporta al menu con «Continua» al turno appena lasciato. La guida col testo nuovo non trabocca. Console senza errori.
- La CI della fase 1 sull'ultimo commit (`5a599c6`) è verde, pacchetti e autoverifica compresi.

## Questioni aperte
- «Ripreso dal automatico» (il diario dopo un caricamento dal posto automatico) è italiano storto: lo si rifà nella fase 3, quando i posti cambiano nome.
- L'«Esci» del menu e della pausa si vede solo sul desktop: da provare lì, con Simone.
