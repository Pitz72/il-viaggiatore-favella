# Prossimi passi

> **Lo stato vivo del progetto.** *Il Viaggiatore* è concluso come storia (definitiva dalla 1.12.0) e il lavoro riprende solo
> su richiesta di Simone. Ultima versione: **1.41.0**, 1° novembre 2026. Questo file tiene il conto di che cosa è aperto, di
> che cosa si è chiuso e di che cosa, di proposito, non si fa; **si aggiorna a ogni sessione** (vedi [`CLAUDE.md`](../CLAUDE.md)).
> (Com'era prima, fermo alla 1.7.0: nella storia di git.)

## Aperto

Ciò che resta aspetta Simone: sono tutte sue decisioni. I caricamenti sui siti non sono più da fare (vedi «Non si fa»).

- **Il doppiaggio è concluso** (Simone, 1° novembre 2026: «per questo lavoro del doppiaggio abbiamo finito»); i titoli di coda dicono ora tutte le voci, in italiano e in inglese (diario «Il controllo generale e i titoli di coda con tutte le voci»). **La voce recitata in inglese**: **il narratore, la voce di servizio (Kira) e tutti i quattordici personaggi sono fatti** (31 ottobre – 1° novembre 2026, diari «Il doppiaggio
  inglese: il narratore in sei blocchi», «La voce inglese del narratore: taglio, banco e integrazione nel gioco» e «Kira in inglese: taglio, banco
  e gioco», «I quattro personaggi di ElevenLabs in inglese: taglio, banco e gioco» e «Concetta, Iole e Onofrio in inglese»): 532 parti di Enzo
  (narrazione e scelte), il trailer, 120 parti di Kira (31 suggerimenti e 89 pezzi coi numeri delle scorte) e 193 dei quattordici personaggi,
  tagliati, controllati, nel banco (`app/public/voce/en/`, 845 parti, 28,7 MB con l'italiano) e nel gioco (modo di voce «inglese»: parla tutto). Restano:
  - (chiuso il 1° novembre 2026: Simone ha ascoltato le scelte inglesi, che il modello ha letto in fretta ma delle quali «si capisce tutto», il
    trailer, «The plain.» e «Il Viaggiatore»: vanno bene, **le scelte non si rigenerano**; e ha ascoltato Kira mentre generava: «perfetti»);
  - **ascoltare** il narratore e Kira inglesi sul gioco desktop (io non posso) e dire che cosa rifare;
  - **i quattordici personaggi in inglese**: **fatti tutti** (1° novembre 2026; diari «I quattro personaggi di ElevenLabs…», «Concetta, Iole e Onofrio…» e «Ciro, Peppe e Cosimo in inglese con
    il connettore ElevenLabs»). Quattro con le loro voci italiane di ElevenLabs, tre come esperimenti di Simone, tre generati da Claude con voci di libreria (Pierpaolo, Vittorio, Corrado Noventa,
    scelte da me, mai ascoltate da Simone) e quattro con voci disegnate da Simone (Voice Design). 193 parti, nel banco e nel gioco. Il resto va **ascoltato** nel gioco desktop (io non posso). **Decisione
    di Simone**, dopo l'abbonamento a ElevenLabs: se avanzano crediti, rifare con ElevenLabs anche le voci **italiane** di Gemini, con la stessa voce di ogni personaggio nelle due lingue (eseguita il 1° novembre 2026, sotto). **Stima del 1° novembre 2026** (un credito per carattere, con qualunque modello del connettore, Flash compreso): le **dieci voci italiane di Gemini** (personaggi) costano 9.883 crediti con i tag; il resto, se si rifacesse tutto con ElevenLabs, 91.655 (narratore italiano 38.836 + scelte 1.954 + trailer 709 + Kira 2.935 = 44.434; Enzo inglese 41.154 + scelte 2.251 + trailer 708 + Kira inglese 3.108 = 47.221): in tutto circa **101.500 crediti**, circa 117.000 con le riprese. **Fatto il 1° novembre 2026 per tutti i personaggi**: nove rifatti con la voce dell'inglese (9.112 crediti; Simone aveva 17.877 crediti a metà giornata) e Concetta, prima con Tosca e poi con una voce disegnata apposta, «America Marchetti», la stessa in italiano e in inglese (1.889 crediti). La voce del narratore e quella di Kira restano di Gemini, già la stessa in italiano e in inglese;
  - **la licenza delle voci ElevenLabs**: la cartella a parte e l'esclusione dalla licenza libera valgono per tutte, con la nota «in parte sul piano gratuito e in
    parte con un abbonamento»; se i diritti dell'abbonamento permettono l'uso commerciale (da leggere nei termini di ElevenLabs, non è una consulenza legale), le
    voci rifatte a pagamento potrebbero uscire dall'esclusione. Decide Simone;
  - **gli altri 39 «Generated Audio» in `Downloads`** (maggio – 30 ottobre, non nei master): che cosa sono, se vanno nel backup su F:;
  - confermare le scelte mie (Kira britannica neutra; le voci di Ciro (Pierpaolo), Peppe (Vittorio) e Cosimo (Corrado Noventa), scelte da me e mai ascoltate da Simone; il tag `Italian accent` (`strong` per Concetta e Onofrio), che non è stato confrontato con altri; la voce che segue il testo nella
    prima finestra; il tetto del peso a 40 MB) (il rilascio è fatto: **1.41.0**, 1° novembre 2026, su ordine di Simone).
- **Le skill e la filigrana di Claude: da analizzare in futuro** (Simone, 31 ottobre 2026). La ricerca di skill su GitHub e
  la questione della filigrana nel testo si riprendono più avanti; i fatti verificati e la decisione sono nel diario del
  31 ottobre («La verifica dell'inglese…») e nella memoria. Nessuna skill trovata è stata installata.
- **La copia su GitHub Pages** è ferma alla 1.23.0, solo in italiano: non si offre più da nessuna parte ma resta in linea per
  non rompere i link. Il workflow «Pagine» (manuale) la rifarebbe: se lanciato oggi pubblicherebbe di nuovo il gioco nel
  browser, contro la scelta della 1.40.0.
- **Rami remoti vecchi**: `claude/amazing-mccarthy-8bigiy`, `claude/blissful-wright-qjgutj`, `claude/vigilant-feynman-d7d9kq`
  di questo repository sono già tutti contenuti in `main` (0 commit in avanti, verificato il 31 ottobre): si possono cancellare,
  ma solo su ordine di Simone.
- **Una routine di backup per ciò che sta fuori da git**, proposta e non attuata. Oggi hanno **una sola copia**: i master del
  doppiaggio e i video (su `F:`, nello stesso computer), gli originali di Flow, la memoria vecchia e il suo transcript (sul
  disco `C:`). Una seconda copia fuori dal computer (OneDrive e Proton Drive sono già sul PC) la decide Simone.

## Chiuso

- **La verifica dell'inglese** (31 ottobre 2026, [`verifica-inglese.md`](verifica-inglese.md)): letti tutti i 494 testi inglesi
  contro calchi dall'italiano e schemi da LLM; corrette 52 voci nei cataloghi (rilasciate nella 1.40.1, workflow
  «Rilascio» riuscito). Il titolo «Il Viaggiatore» non si traduce, e la regola ora sta in `CLAUDE.md` e nel `LEGGIMI` della
  traduzione.
- **La ricerca su GitHub delle skill** per narrativa, linguaggio e schemi da LLM (31 ottobre 2026, richiesta di Simone).
  Trovate, lette solo le schede e non i `SKILL.md`: `blader/humanizer` e `hardikpandya/stop-slop` (le due che Simone ha già
  installate), `haowjy/creative-writing-skills` (Apache-2.0, molto completa, ma con un setup pesante e un agente che può
  usare un altro fornitore di modelli), `Calliope-Editor/writing-skills` (MIT, 13 skill di sola diagnosi), e due altre
  skill di schemi da LLM non aperte (`jalaalrd/anti-ai-slop-writing`, `skyzer/deslop-the-copy`). Per la qualità di una
  traduzione e per la prosa italiana non c'è niente di meglio di `verifica-traduzione` e `prosa-italiana`. **Non cercati né
  installati strumenti per togliere la filigrana di Claude**: vedi il diario del 31 ottobre. **Nessuna skill è stata
  installata**: Simone ha detto di no (31 ottobre 2026); di `Calliope-Editor/writing-skills` sono stati letti soltanto i
  metadati del repository.
- **La skill `verifica-traduzione`** (31 ottobre 2026, M13 del registro): verifica le traduzioni cercando calchi dall'italiano,
  falsi amici e schemi da LLM, valida per qualsiasi coppia italiano→inglese. Sta in `~\.claude\skills\` (la usa Claude, quindi
  anche in *Il Relitto Silente*) e in `strumenti/skill/verifica-traduzione/` (la copia su GitHub): le due cartelle restano uguali.
- **Il progetto di ramificazione** (`pre-produzione/06-ramificazione.md`, §8): la mappa delle
  ramificazioni, le conseguenze a distanza (da 2 a 13), le varianti di testo per stato, le
  chiusure che raccolgono il viaggio e «chi hai incontrato» (1.12.0).
- **L'interfaccia:** i messaggi del motore e i pulsanti «inventario» e «stato» (1.8.0); «usa X su
  Y» che si compone invece di offrire la coppia giusta (1.9.0).
- **Il motore:** `motore/` è la 1.5.0 di FAVELLA 1 (dalla 1.14.0; prima la 1.4.4): il motore è fermo.
  Se mai servisse cambiarlo, si cambia nel repository di FAVELLA 1 (con i suoi test) e si ricopia.
- **La storia:** Imma sulla discesa (1.7.0); le dichiarazioni doppie di `z2-piana.fav` ridotte a
  una con i sinonimi (1.10.0).
- **I due MP4 in `video/`** (non versionati) rigirati con la grafica nuova, fotogramma per
  fotogramma dal trailer vero (`strumenti/esporta-trailer.cjs`, 7 ottobre 2026).
- **Il tasto «esci»** nella barra di gioco e nella schermata finale, oltre che nel menu (1.13.0).
- **I loghi d'apertura** animati e sonori, di Runtime Multimedia e di FAVELLA 1, e il nome dell'autore
  nel menu d'avvio (1.14.0).
- **Le rifiniture dell'analisi del 20 ottobre 2026** (1.15.0): il diario è una regione viva per i lettori di schermo; Esc chiude «Come si gioca» e i dialoghi
  portano il fuoco dentro e lo restituiscono; un confine d'errore al posto dello schermo nero; contrasto
  e dimensioni del testo piccolo; il caricamento dei salvataggi diffida del diario guasto; il desktop
  controlla l'origine e il percorso nel modo giusto, mette in fila le scritture dei salvataggi e rilegge
  la copia di riserva; nella storia «bere due sorsi» e «mangiare una porzione» (e simili) valgono come
  le forme all'imperativo, e Saverio, a fiducia alta, non chiede più «un motivo per fidarmi».
- **I dodici residui e l'analisi di chiusura del 20 ottobre 2026** (1.16.0 – 1.16.1): il panorama d'interni,
  i contrasti a 4,5:1, il taccuino, i canali IPC, le fuse di Electron, Pyodide 0.27.8, il finale scritto una volta sola.
- **L'estetica della cinematica d'apertura** (piano `pre-produzione/07-intro-estetica-e-dettagli.md`, eseguito
  dalla 1.16.2 alla 1.18.2 e rilasciato come **v1.18.2**, 20 ottobre 2026): le rifiniture, la luce e la pellicola,
  il suono, la materia (sale, crepe, scrittura, biglietto a mano con Covered By Your Grace), la nitidezza a 4K, le
  ultime rifiniture ai tempi e alla schermata d'avvio. Il comportamento non è cambiato (solo Esc).
- **Il doppiaggio totale con sintesi vocale** (piano `pre-produzione/08-doppiaggio-tts.md`, 1.19.0 – 1.23.0): ogni testo del
  gioco, il trailer compreso, ha la sua voce (circa un'ora di parlato), a scelta fra voce recitata e lettore di schermo. Le voci
  di Imma, Rosaria, Tore e Vito (ElevenLabs, piano gratuito) sono escluse dalla licenza libera, per decisione di Simone.
  Rilasciato come v1.23.0.
- **Il gioco confezionato come un prodotto** (piano `pre-produzione/09-opzioni-menu-pausa.md`, 1.24.0 – 1.30.1): opzioni e
  volumi veri, menu d'avvio in colonna e pausa, taccuino dei salvataggi, schermo, finestra e qualità della grafica, alta
  accessibilità, i modi dei comandi, trenta trofei, le verifiche finali.
- **La musica e la chiusura** (1.31.0 – 1.34.0): un brano per zona e l'album da scaricare (menu Extra), la sequenza finale
  coi titoli di coda e la canzone, le immagini promozionali.
- **La plancia e la mappa** (1.35.0 – 1.38.0): la plancia dei pulsanti, i due soli modi dei comandi (pulsanti e avventura
  testuale), la mappa come carta fisica che si riempie camminando.
- **I volti e le tavole** (1.38.0 – 1.39.0): i ritratti dei personaggi, le tavole degli otto oggetti della memoria, il
  viandante accanto alle risposte.
- **L'inglese** (1.40.0): il gioco intero in inglese (494 testi e 85 nomi in `app/src/lingue/en/`, controllati da
  `collaudo/traduzione.py`), la prima finestra della lingua, il trofeo «Parola per parola»; e il gioco solo da scaricare.
- **Il ripristino in locale** (31 ottobre 2026, diario «Il ripristino in locale»): il progetto è di nuovo in
  `C:\Users\Utente\Documents\GitHub\IlViaggiatore`, uguale a `main`, collaudi e autoverifica del desktop verdi. Dal backup del 22
  ottobre sono tornati `doppiaggio/master/`, `video/`, `.claude/launch.json` e i due appunti di passaggio (SHA-256 verificati);
  gli originali di Flow e Lyria stanno in `Documents\SVILUPPO\VIDEOGIOCHI\IlViaggiatore-originali\` (dove sta ogni cosa e che
  copie ha: `sviluppo/REGISTRO.md`, nuovo, regola assoluta in `CLAUDE.md`). Il ramo
  `main` «di troppo» di Ecosystem-Runtime non c'è più: il 31 ottobre il remoto aveva solo `master` e un ramo `claude/…`.
- **favella.eu ed Ecosystem sono già aggiornati** (guardati online dal browser il 31 ottobre 2026; la voce «Aperto» che li dava
  da caricare era superata). favella.eu: la Galleria mostra «Windows e Linux · 1.40.0 · italiano e inglese», senza «Gioca nel
  browser», e le novità hanno «Il Viaggiatore 1.40: anche in inglese, e solo da scaricare». Ecosystem: la scheda è alla 1.40.0 col
  capitolo «In inglese · in lavorazione», «Il gioco da scaricare», i quattro download alla v1.40.0 e la notizia del 31 ottobre; i
  tre file tolti (`v123-crediti`, `v123-titolo`, `v123-voce`) rispondono 404 e quello che resta risponde 200. Non si è trovato in
  pagina il numero di versione dei due siti (2.14.0 e 0.32.0).

## Non si fa

- **La rilettura della traduzione inglese da parte di un madrelingua**: non è una priorità (Simone, 31 ottobre 2026); la
  farà lui, se potrà. Non va riproposta fra i passi aperti.
- **I caricamenti sui siti** (favella.eu, Ecosystem, l'articolo su simonepizzi.runtimeradio.it): non sono più da fare. favella.eu
  ed Ecosystem erano già aggiornati (guardati online il 31 ottobre 2026); l'articolo su simonepizzi.runtimeradio.it lo cura
  Simone, che sa dove sta e come si aggiorna. Decisione di Simone, 31 ottobre 2026.
- **Un'eco di Imma alla soglia.** Vive in paese: un'eco ad Acquamorta sarebbe forzata
  (decisione 11 di `06-ramificazione.md`).
- **Il suolo della terra e la mappa a 2× (4K).** Il suolo «cotto» ha una riga di tessera per ogni riga dello schermo
  (a 2× il costo per fotogramma salirebbe proprio dove la scena è già più pesante) e la carta della mappa a 2× sarebbe
  una tela da 66 MB: restano a 1× (diario «Il trailer, fase 5»). La scelta della tela più grande su uno schermo 4K è provata
  solo fuori schermo: non c'è uno schermo 4K vero su questo computer.
- **Il trailer su un computer davvero modesto.** Senza scheda grafica un fotogramma a 2560×1440
  costa 30–115 ms; la risoluzione adattiva lo compensa, ma non è stato provato su una macchina
  lenta. Preparare le tele in un Worker con `OffscreenCanvas` libererebbe il thread principale
  durante i loghi: idea non fatta.
- **Il tratto statale–mercato** resta silenzioso per chi non incontra Imma.
- **Nuove zone, nuovi personaggi, nuovi finali:** fuori dal perimetro di un gioco concluso.

## Se qualcuno riprende il lavoro

Si parte da `CLAUDE.md`, da `README.md`, da `sviluppo/VERSIONI.md` (le regole dei numeri), da
`collaudo/LEGGIMI.md` (i sedici collaudi: ogni modifica ai `.fav` li deve lasciare verdi) e da
`pre-produzione/06-ramificazione.md` (il perché di ogni filo). Ogni modifica ai `.fav` cambia
l'impronta dei salvataggi: è una versione minor, o major se si ristruttura una zona.
