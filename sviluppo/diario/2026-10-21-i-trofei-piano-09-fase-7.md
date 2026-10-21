---
data: 2026-10-21
ora: "07:17"
titolo: "I trofei (piano 09, fase 7)"
tipo: sessione
versione: 1.30.0
---

# I trofei (piano 09, fase 7)

## In breve
Il gioco ha trenta trofei: si vincono giocando, compaiono in alto con un suono lievissimo (mai sopra il finale), restano nel tempo e si guardano in una pagina loro. Un collaudo nuovo gioca diciassette partite col ponte vero e pretende per ciascuna i trofei esatti, ciascuno al suo turno.

## Contesto
Dopo la fase 5 (1.29.0) Simone ha dato il via alla fase 7. Nomi e accenni erano stati rivisti con lui in mattinata (§7.3, commit `4b977c6`). A metà lavoro ha chiesto se le scelte prese da me lo avrebbero costretto a rifare il doppiaggio: no, verificato (nessun file della storia, della voce o del loro collegamento cambiato da `ed63b91`; `doppiaggio.py` verde); il testo nuovo è d'interfaccia e non si legge a voce. Gli ho elencato le scelte fatte da solo, e le frasi dei trofei vinti (scritte da me) le ha approvate col questionario.

## Lavoro fatto
- `gioco/trofei.ts` (nuovo, puro): il catalogo (id, famiglia, nome, accenno, frase), le tabelle dei finali, delle fini e dei gesti, `trofeiDelTurno` (il testo del turno, l'esito, contatori, voci, gesti, stati e sfide → i trofei nuovi), le sfide (`sfideNuove`, `pulisciSfide`, `sfideCaricate`).
- `lib/ponte.py`: `fav_stato` espone gli `stati` della storia che hanno un valore (una quarantina).
- `lib/trofei.ts` (nuovo): il deposito, con i trofei vinti e la data, e il punto più lontano di ogni viaggio (gli ultimi quaranta); scritture in fila; `vinci`, `azzeraTrofei`, `segnaLontano`, `piuLontano`, `ascoltaTrofei`, `nuovoViaggio`.
- `desktop/salvataggi.cjs` e `preload.cjs`: i canali `trofei:leggi` e `trofei:scrivi`, su `Documenti/Il Viaggiatore/trofei.json` con la stessa scrittura atomica e la stessa riserva dei salvataggi (nei collaudi, dentro la cartella di prova).
- `gioco/suonoTrofeo.ts` (nuovo): la nota flautata, un mi a 659 Hz con due armoniche leggere, vibrato che entra dopo l'attacco, un soffio di rumore filtrato; sul canale degli effetti, −24 dB circa al picco.
- `gioco/Cartiglio.tsx`: il cartiglio del trofeo (medaglione, «Trofeo», il nome), quattro secondi; senza dati sparisce subito.
- `gioco/PaginaTrofei.tsx` + `trofei.css` (nuovi): 74 × 40 em come il taccuino; a sinistra cinque righe di medaglioni (sfide e collezione insieme), a destra il trofeo scelto; frecce su tutto il pannello. Il nome `Trofei.tsx` accanto a `trofei.ts` si confondeva su Windows (maiuscole e minuscole): da qui `PaginaTrofei`.
- `components/ViaggiatorePlayer.tsx`: dopo ogni turno `controllaTrofei`; la fila degli avvisi, uno alla volta col suono; a viaggio finito niente cartiglio e il riquadro «i trofei di questo viaggio» (compatto, nome e medaglione, la frase al passaggio del mouse) col pulsante «trofei»; le sfide aggiornate a ogni comando (scritto dalla riga, toccato da un pulsante, ANNULLA che disfa davvero); nei salvataggi il campo `sfide` e il punto più lontano nel deposito; al caricamento `sfideCaricate`; «trofei» scritto apre la pagina.
- `gioco/Pausa.tsx` e `components/Trailer.tsx`: la voce «Trofei» dopo «Carica».
- `gioco/Opzioni.tsx`: nella scheda Generale «Trofei · azzera i trofei», con la stessa domanda S/N del ripristino.
- `lib/salvataggi.ts`: il campo facoltativo `sfide` (il formato resta 1).
- `loghi/suono.ts`: una parziale oltre metà della frequenza di campionamento non si suona più (la campana a 2960 Hz chiedeva 26 432 Hz): via l'avviso dell'oscillatore nel registro.
- `autoverifica.ts`: prova che il ponte impacchettato esponga gli stati e che le regole vi riconoscano un finale, senza scrivere niente.
- Collaudi nuovi: `collaudo/trofei.py` (con `app/scripts/trofei-node.mjs`) e `app/scripts/trofei-prove.mjs`; in CI e nel rilascio.
- README (i trofei, menu e pausa, i tredici collaudi), `collaudo/LEGGIMI.md`, CHANGELOG, il piano (§7.3, §10, §11).

## Decisioni
- **«Mani pulite» chiede anche Cosimo non abbattuto** — perché: sparare al fratello non aumenta il contatore del sangue (lo fanno il cane e Vito); senza la condizione il trofeo sarebbe andato a chi lo uccide. Precisazione scritta nel §7.3.
- **Le regole leggono il testo del turno e lo stato del ponte, non il codice della storia** — perché: così i `.fav` non cambiano (né la voce), e il collaudo può pretendere che ogni riga «FINALE —» e ogni «perdi» abbia il suo trofeo.
- **«Tornare indietro» al caricamento si misura in comandi della sequenza** — perché: è il numero esatto che il salvataggio porta (`partita.comandi`), e il punto più lontano si segna a ogni salvataggio (anche automatico) e prima di ogni caricamento; uscire dal gioco e ricaricare dal menu un punto vecchio rompe la sfida lo stesso.
- **I trofei vinti in memoria anche se il disco non scrive** — perché: un trofeo non deve sparire durante la partita; l'errore va nel registro.
- **Sul finale i trofei compatti** — perché: dodici righe con la frase spingevano fuori vista il testo del finale.
- **Versione 1.30.0** — una funzione nuova: MINOR.

## Verifiche
- `collaudo/trofei.py`: 17 partite (i dodici percorsi, le tre morti, il bluff, Vito a terra), ciascuna coi trofei esatti e ciascuno al suo turno; le sei righe «FINALE —», le tre «perdi», i dieci gesti del ponte e le tre vie del guado coperti; tutte di fila, i trenta vinti, «Tutte le strade» col sesto finale e «Il viaggiatore» con l'ultimo. Rotto apposta (un trofeo in meno nelle attese, un momento sbagliato), fallisce dove deve; e ha fatto trovare che su Windows, con l'uscita in un file, la freccia «→» fermava il collaudo (ora l'uscita è in UTF-8).
- `trofei-prove.mjs` 10 prove (ha trovato che il deposito tagliava agli ultimi quaranta viaggi prima di scartare quelli guasti); `desktop/prove.cjs` 16; `opzioni-node.mjs` 9; `posti-node.mjs` 6; `finali.py`, `mirate.py`, `salvataggi.py` (40 partite, 52 salvataggi ricaricati), `interfaccia.py`, `pulsanti.py`, `testo.py`, `doppiaggio.py`, `scorte.py`, `fili.py`, `giocate.py`, `conferme.py` (95) tutti ok; `tsc` pulito; build ok.
- Nel browser integrato, sul gioco vero: la voce «Trofei» nel menu e nella pausa; la pagina vuota (0 di 30) sta in vista senza scorrere e si percorre con le frecce; una partita nuova lungo il percorso A: «Senza un grazie» al dono a Saverio (cartiglio, deposito scritto con la data e il punto del viaggio), poi gli altri in fila, uno alla volta; al finale nessun cartiglio e il riquadro coi 12 trofei del viaggio (gli stessi che il collaudo prevede per A, con «Tutto a pulsanti» perché i comandi di prova passano per la via dei pulsanti), testo del finale in vista; la pagina dal finale dice 12 di 30 col più recente scelto; «azzera i trofei» con S li toglie e lascia i viaggi.

## Questioni aperte
- Da sentire nel desktop, con Simone: il suono dei trofei (volume, timbro) e la fila degli avvisi.
- Fase 8: partite intere nei tre modi dei comandi lette come un giocatore, l'alta accessibilità a 1080p e 4K, i pacchetti.
