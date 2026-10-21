---
data: 2026-10-21
ora: "07:40"
titolo: "Le verifiche finali (piano 09, fase 8)"
tipo: sessione
versione: 1.30.1
---

# Le verifiche finali (piano 09, fase 8)

## In breve
L'ultima fase del piano 09: tre partite intere, una per ciascun modo dei comandi, giocate nel gioco vero; l'alta accessibilità misurata a 1080p e 4K; un giro tutto da tastiera; l'autoverifica dentro Electron. Hanno trovato quattro cose da sistemare, sistemate; e una scelta di Simone: dopo una morte non si torna indietro, e il diario non lo suggerisce più.

## Contesto
Fasi 1–7 fatte (1.24.0 – 1.30.0, CI verde: collaudo, pacchetto Windows, pacchetto Linux). Simone ha dato il via alla fase 8 (§9 e §11 del piano). Le prove da fare con lui all'ascolto, nel desktop vero, restano sue.

## Lavoro fatto
- **Autoverifica dentro Electron** (`desktop/prepara.mjs`, poi `electron . --autoverifica`): superata, con la riga nuova dei trofei (41 stati della storia esposti, un finale riconosciuto).
- **Solo parole**, percorso I (Imma, la fede): ogni comando scritto davvero nella riga (14 conferme risposte con S); 14 trofei, esattamente quelli che `collaudo/trofei.py` prevede, «Tutto a parole» compreso; «Qualcosa di quella casa» scattato col santino. Letta come un giocatore: il diario prende lo spazio, le risposte sono testo numerato, la riga chiede il numero.
- **Solo pulsanti**, percorso G (il fucile posato): un pilota che clicca i pulsanti veri (uscite, menu delle cose, «usa su…», risposte, dosi, conferme), 218 clic, nessun ripiego; finale del cavallo di legno; nuovi «Il fucile posato», «Il cavallo di legno», «Tutto a pulsanti» (gli altri erano già vinti e non sono tornati). Un primo giro è morto di sete con 9 d'acqua: il mio pilota apriva il pannello delle dosi senza sceglierne una; corretto il pilota, non il gioco.
- **Pulsanti e parole**, una partita mista (18 comandi scritti, 17 cliccati) fino alla morte per ferite alla serra: «Il viaggio finisce qui», nessun «Tutto a…».
- **Alta accessibilità a 1080p e 4K**: opzioni (tre schede, 427 su 427), trofei, taccuino senza niente fuori dalla scatola; la guida scorreva (789 su 675, solo col testo grande): `accessibilita.css` stringe gli spazi della guida col testo grande (il testo no), e ora entra in tutti e tre i modi (675 su 675 il più lungo). Contrasto misurato sui colori calcolati: nella pagina dei trofei quattro testi erano sotto 7:1 (fino a 4,2): ora il minimo è 8,3; e i medaglioni vinti e da vincere quasi si confondevano col grigio di una fine: col contrasto alto i vinti sono dischi pieni.
- **Il giro da tastiera**: finale → pausa (Esc) → menu (Fine, Invio) → opzioni (Tab, →) → trofei (frecce) → viaggio nuovo (S) → «nord» scritto → pausa (Esc, e un secondo Esc se la voce parla: com'è stato deciso) → taccuino → trofei → menu, con l'autosalvataggio all'uscita.
- **Dopo la fine**: il motore scrive «La partita è finita. Scrivi ANNULLA… RICOMINCIA… CARICA… FINE», ma la riga non c'è e annullare non si può. Chiesto a Simone: «Sei morto, stop». `gioco/testo.ts` salta quella riga del motore (che non ha voce: il doppiaggio non cambia). Il titolo «Acquamorta» sopra una morte resta, per sua scelta.
- Il diario si riallinea anche quando cambia la dimensione del testo (un finale poteva restare mezzo fuori vista).
- CHANGELOG, piano (§10, §11: il piano è compiuto), questo diario.

## Decisioni
- **Niente annulla dopo una morte, e niente invito** — Simone: «Se immagino un diario personale o di viaggio, non ce lo vedo scritto annulla per non morire».
- **La guida col testo grande si stringe negli spazi, non nel testo** — perché: il testo grande è la ragione dell'opzione; lo scorrimento solo se inevitabile (gusto di Simone).
- **I pacchetti dalla CI** — la CI della 1.30.0 ha costruito e autoverificato Windows e Linux; qui l'autoverifica è girata in Electron sul codice di adesso. Il pacchetto locale non l'ho rifatto.
- **Versione 1.30.1** — correzioni e una riga tolta: PATCH.

## Verifiche
- Collaudi, dopo le correzioni: `finali.py`, `mirate.py`, `salvataggi.py` (40 partite, 50 salvataggi ricaricati), `interfaccia.py`, `pulsanti.py`, `testo.py`, `doppiaggio.py`, `trofei.py`, `scorte.py`, `fili.py`, `giocate.py`, `conferme.py` (95) tutti ok; `trofei-prove.mjs` 10, `opzioni-node.mjs` 9, `posti-node.mjs` 6, `desktop/prove.cjs` 16; build ok. (Su Windows, con l'uscita in un file, `fili.py` e `conferme.py` vanno lanciati con `PYTHONIOENCODING=utf-8`: la loro freccia «→» fermava la console; in CI, su Linux, non succede.)
- Nel browser integrato: le partite e le misure sopra; console senza errori.

## Questioni aperte
- Da sentire e vedere nel desktop con Simone: volumi, mono, secondo piano, il suono dei trofei e la loro fila, finestra e schermo intero attraverso i riavvii, i file in Esplora risorse.
- Una **sequenza finale**, da creare in una prossima sessione (Simone).
- Il rilascio pubblico delle versioni 1.24 – 1.30: solo su ordine.
