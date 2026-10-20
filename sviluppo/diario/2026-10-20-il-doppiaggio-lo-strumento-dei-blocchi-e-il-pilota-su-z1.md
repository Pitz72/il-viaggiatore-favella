---
data: 2026-10-20
ora: "12:08"
titolo: "Il doppiaggio: lo strumento dei blocchi e il pilota su Z1"
tipo: sessione
versione: 1.18.2
---

# Il doppiaggio: lo strumento dei blocchi e il pilota su Z1

## In breve
Simone ha ordinato di organizzare i testi del doppiaggio per Google AI Studio. Ho verificato come funziona oggi Gemini 3.8 Flash TTS, ho scritto `strumenti/doppiaggio.py`, che ricava dai `.fav` i testi da incollare nell'editor, e ho preparato il pilota su Z1 (stazione e Nunzio) con materiale che, se funziona, resta definitivo. Nessun audio è stato prodotto e il gioco non è cambiato: niente versione nuova.

## Contesto
Dopo la discussione del mattino (voce di diario «Il doppiaggio con sintesi vocale: che cosa ha deciso Simone») Simone ha chiesto i testi suddivisi in blocchi per zona, da generare con meno richieste possibile, e per i dialoghi la descrizione della voce e il tono. Usa Google AI Studio con il piano Pro di Google, senza chiave API: la strada è manuale, dall'editor, e i WAV me li passa lui.

## Lavoro fatto
- **Il modello, verificato sulla documentazione di oggi:** `gemini-3.8-flash-tts` (uscito il 23/09/2026); testo letto alla lettera, stile in un campo a parte, tag inline `<long pause>` e simili con parentesi angolari (in inglese), MAIUSCOLO = enfasi; al massimo due voci per generazione; circa 11 minuti di audio per richiesta (16.384 token a 25 al secondo); lo stile va tenuto breve, la voce si definisce una volta col Voice design. Dettagli nella memoria del progetto.
- **L'editor, dagli schermi di Simone:** Playground con «Create new dialog» e «Create new voice», voci di libreria con nome e carattere (Enzo, Riko, Sami…), un editor a «speech block» (ognuno con la sua voce, un campo di stile e un pulsante «Expression» per i tag), «Add speech block», download e «Run». «Get code» mostra la richiesta API equivalente: non serve, senza chiave.
- **`strumenti/doppiaggio.py`:** legge i `.fav` come `mappa-narrativa.py` e spezza ogni testo in PARTI che hanno una voce sola. Le voci sono il narratore (tutto ciò che sta fuori da virgolette e parentesi, più il biglietto e le targhe, che legge lui), la voce di servizio (suggerimenti tra parentesi e opzioni di dialogo) e i personaggi (le battute tra «caporali» dei dialoghi). Scrive `doppiaggio/blocchi/<zona>-<voce>.txt` (una parte per riga, `<long pause>` in mezzo, pronto da incollare) e `doppiaggio/manifest/<zona>.json` (per ogni parte: id, voce, testo, da quale riga viene; per ogni testo del gioco, le parti che lo compongono). Il testo per la voce è derivato e non cambia il gioco: le parole in maiuscolo (NORD, PARLA CON…) si abbassano. L'id è l'impronta di voce + testo: se un testo cambia, l'audio vecchio si riconosce. Un blocco non supera le 1.000 parole (circa 6-7 minuti).
- **I testi con numeri** (`[acqua]`, `[cibo]`) si spezzano in pezzi con un segnaposto solo («Hai sette d'acqua,» / «e tre di cibo.»), uno per ogni valore (acqua 0–20, cibo 0–12), da ricomporre nel gioco. Per Z1 sono 68 frasi da circa 2 minuti.
- **Il pilota:** `doppiaggio/blocchi/z1-narratore.txt` (25 parti, 455 parole), `z1-nunzio.txt` (7 parti, 89 parole), `z1-servizio.txt` (12 parti, 58 parole), `z1-servizio-numeri.txt` (68 parti). `doppiaggio/voci.md` ha le descrizioni delle tre voci da creare in AI Studio (Narratore, Servizio, Nunzio) con una frase di prova ciascuna; `doppiaggio/LEGGIMI.md` i passi. I WAV vanno in `doppiaggio/master/`, che non si versiona.

## Cambio di rotta: una voce per volta, su tutto il gioco
Dopo le prime prove Simone ha deciso: la voce cambia un poco a ogni generazione (la descrizione non basta a impedirlo), quindi i testi si accorpano **per voce su tutto il gioco** e si fa **uno speaker per volta**, con il minor numero di generazioni; si comincia da Kira, la voce di servizio, che sta in una generazione sola. Il pilota per zona (z1-*.txt, manifest/z1.json) è sostituito: `strumenti/doppiaggio.py` ora costruisce tutte le zone insieme (una parte uguale in zone diverse è una sola), scrive un blocco per voce (`doppiaggio/blocchi/servizio.txt`) e un solo `doppiaggio/manifest.json`. Un blocco si divide solo se supera il tetto (9 minuti, 10 per Kira; il servizio arriva a circa 11) e allora dove cambia la zona. Conti: Kira 201 parti, 912 parole, circa 9,4 minuti (112 testi fissi, 89 pezzi con numeri); narratore 450 parti, circa 65 minuti, 10 blocchi; ogni personaggio un blocco solo (da 0,4 a 3,3 minuti). La riga di `STATO` («Vita [vita]/10 · Sete…») non è nel blocco di Kira: spingerebbe oltre il tetto e va in una generazione a parte più avanti.

## Kira generata, e le scelte del giocatore passano al narratore
Simone ha generato Kira in due WAV (3:41 e 3:25, 7:06 in tutto contro i 9,4 minuti stimati: le pause sono più corte di quanto supposto) per non rischiare troncamenti, e la voce gli è parsa coerente. Poi ha notato che nel blocco c'erano «pezzi di dialoghi che non c'entrano con la voce di servizio»: aveva ragione. Delle 201 parti, 81 (373 parole) sono le scelte di dialogo del giocatore, in prima persona («Mi dispiace.», «Chi sei?»), mentre il servizio vero sono 31 suggerimenti e 89 pezzi con numeri. L'errore è mio: avevo preso il suo «sì, mettiamoceli» come assenso a metterle con Kira senza dirgli che erano battute del protagonista. Ha scelto che le legga **il narratore**: il giocatore non ha una voce sua e il narratore è la stessa persona. Ora le 81 scelte sono `narratore-scelte` (un blocco a parte, 4,3 minuti stimati), `servizio.txt` ha 120 parti (5,6 minuti) e ogni parte del manifest ha una `categoria` (testo, scelta, suggerimento, numeri). L'audio già generato non si butta: contiene anche le 81 scelte con la voce di Kira e il blocco com'era è conservato in `doppiaggio/generati/servizio-kira.txt`, perché il taglio lo allinei a quello che è stato davvero letto.

`strumenti/doppiaggio-taglia.py` (nuovo): trascrive i WAV con whisper, allinea le parole sentite con quelle attese, taglia ogni parte nel silenzio che la separa dalla vicina, scrive un WAV per parte e un rapporto con le parti da riascoltare.

## Decisioni
- **Anche i suggerimenti tra parentesi e le scelte del giocatore hanno voce, con una voce di servizio** — perché lo ha deciso Simone («sì, mettiamoceli»): chi gioca ascoltando altrimenti non saprebbe che cosa può scegliere. Il giocatore non ha voce.
- **Il pilota è fatto con materiale definitivo (Z1)** — per volere di Simone: se funziona, lo si usa.
- **Le parole tra «caporali» in una descrizione le legge il narratore, d'un fiato** — perché sono scritte (il biglietto, una targa), non dette: spezzarle avrebbe messo una pausa in mezzo alla frase.
- **Un testo con numeri si spezza in pezzi con un solo numero** — invece di registrare tutte le combinazioni (acqua × cibo sono più di 250) o di incollare numeri isolati, che suonerebbero a scatti.
- **Niente versione nuova** — perché il gioco non cambia; si salva solo l'attrezzatura e si rinvia al giorno in cui l'audio entra nel pacchetto.

## Verifiche
- `python strumenti/doppiaggio.py stato` gira su tutti i nove `.fav` e, per ogni stringa, controlla che le parti (contando lettere e cifre) rifacciano il testo originale: nessuna perdita.
- Conti dell'intero gioco (ogni zona deduplicata a parte): narratore 452 parti e 7.152 parole; servizio 125 parti e 598 parole; personaggi 158 parti e 1.899 parole; numeri 144 parti e 547 parole; 36 parti e 346 parole di frasi tra «» ancora da attribuire (40 frasi, nelle zone da Z2 a Z7: messaggi dove non si sa chi parla). In tutto circa 10.500 parole, cioè circa 70 minuti.
- I conti dell'analisi del mattino (373 «opzioni») contavano anche i nomi dei nodi: le scelte vere sono meno.
- **Le prime due prove di Simone in AI Studio** (12:18 e 12:20, in `doppiaggio/master/prove/`, non versionata): il narratore (voce Enzo) con la frase della stazione e la voce di servizio (Kira) con «Hai sette d'acqua, e tre di cibo.» in una sola generazione a due voci (13,9 s); Nunzio (Riko) con «Oro per acqua. Ai miei tempi avrei riso. Tieni.» (5,7 s). WAV a 24 kHz, 16 bit, mono, senza clipping (picco −1,6 e −3,2 dB). Whisper (medium) riconosce tutte le parole; due nomi li scrive diversi («acqua viva», «graminia»), quindi il controllo di ogni parte dovrà tollerare i nomi propri. Le parole si allineano ai tempi del WAV entro pochi centesimi, abbastanza per tagliare. Il narratore parla svelto (circa 170 parole al minuto mentre parla) ma con pause lunghe a ogni segno di punteggiatura (0,9 s dopo il punto, 1,2 s dopo il punto e virgola): in media circa 125 parole al minuto; Nunzio circa 85. Il ritmo vero è più lento della stima del mattino (150), quindi lo strumento ora divide i blocchi per minuti (6,5 al massimo) e non per parole. Le pause eccessive si possono accorciare dopo, senza rifare l'audio.
- Che le voci stiano bene e l'accento sia giusto lo giudica Simone all'ascolto: non si misura.

## Questioni aperte
- **Il pilota:** generare i quattro blocchi di Z1 con le voci provvisorie (Enzo, Kira, Riko) e mandare i WAV. Da vedere: che `<long pause>` non sia letto e faccia una pausa; che la voce resti la stessa da una generazione all'altra (la descrizione dev'essere incollata identica).
- **Da attribuire:** a chi parla ogni frase tra «» fuori dai dialoghi (Z2 Saverio; Z4 Vito; Z5 Rosaria o Ciro; Z6 Peppe; Z7 Cosimo): serve una tabella `doppiaggio/attribuzioni.json` e la sua revisione.
- **I numeri:** i valori massimi veri di acqua e cibo (20 e 12 sono stime) e come si ricompongono nel gioco.
- **`[i fili del viaggio]`** nei finali: richiama dieci frasi indipendenti, ancora da collegare.
- **Il taglio:** il programma che divide i WAV nelle parti e controlla ogni parte contro il testo con whisper, da scrivere sui WAV veri.
- **Lo stile per battuta:** si prova prima senza; il campo di stile dell'editor va capito sui primi ascolti.
- **Diritti, peso, impostazioni nel gioco:** come nella voce del mattino.
