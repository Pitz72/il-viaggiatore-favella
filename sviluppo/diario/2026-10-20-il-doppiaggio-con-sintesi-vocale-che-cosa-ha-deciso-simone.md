---
data: 2026-10-20
ora: "11:17"
titolo: "Il doppiaggio con sintesi vocale: che cosa ha deciso Simone"
tipo: decisione
versione: 1.18.2
---

# Il doppiaggio con sintesi vocale: che cosa ha deciso Simone

## In breve
Simone vuole un doppiaggio totale del Viaggiatore con sintesi vocale: un audiogioco recitato e accessibile, narrazione e dialoghi con voci diverse, con i file audio prodotti da lui con un servizio TTS e distribuiti dentro il pacchetto. Si è solo discusso, come chiedeva il prompt: nessun codice, nessun audio prodotto, nessuna installazione; il piano (`pre-produzione/08-doppiaggio-tts.md`) non è scritto e parte solo su suo ordine.

## Contesto
Il punto 5 del prompt della sessione di chiusura: ascoltare, fare domande, e per arrivare preparati misurare in sola lettura quanto testo c'è. La misura (un controllo sulle stringhe tra virgolette dei nove `.fav`, senza scrivere niente nel progetto): **1.009 testi, circa 11.400 parole, 64.400 caratteri**, cioè 76 minuti di voce a 150 parole al minuto se si leggesse tutto. Per tipo: 766 messaggi, esiti e risposte (3.900 parole, 32 segnaposto `[…]`), 135 battute e dialoghi (4.200 parole, 15 segnaposto), 108 descrizioni (3.300 parole). Il conto conta anche le varianti che una sola partita non incontra (testi condizionali, il paragrafo dei fili con le sue 512 combinazioni) e non conta l'interfaccia, la guida, l'avviso e il trailer.

## Lavoro fatto
Due giri di domande a Simone, con le sue risposte:
- **Perché:** accessibilità e, insieme, l'audiogioco interattivo recitato («una sorta di audiolibro interattivo, o versione talkie del gioco»).
- **Che cosa si doppia:** narrazione e dialoghi (i 14 personaggi con voci diverse).
- **Come si produce:** «definiremo i testi da doppiare, io li passerò al TTS e produrrò file wave»: sintesi in anticipo con Google Gemini TTS, con impostazioni narrative e di recitazione, file WAV; il giocatore li ascolta senza internet. Nel primo giro aveva scelto «locali e offline» e nominato Gemini: le due cose stanno insieme solo così (audio generato in anticipo e distribuito), e il secondo giro lo ha confermato.
- **Dove stanno i file:** dentro il pacchetto.
- **Il doppio audio:** due modalità a scelta nelle impostazioni, «voce recitata» o «lettore di schermo»: quando la voce è attiva il diario non è più una regione viva letta dallo screen reader; chi usa lo screen reader tiene quello.
- **Le interruzioni:** la voce si ferma al primo tasto premuto, come in un talkie; il testo resta sullo schermo e si può riascoltare.

## Decisioni
- **L'audio si genera in anticipo e si distribuisce** — perché il gioco deve restare offline e senza chiavi; costo e dipendenza dal servizio ricadono su chi produce, non su chi gioca.
- **Due modalità, non due voci insieme** — perché il diario è già una regione viva per i lettori di schermo (1.15.0) e una voce recitata sopra una voce del sistema sarebbe un disturbo, non un aiuto.
- **Niente piano, niente codice, finché non lo ordina** — come dice il prompt.

## Verifiche
- Nessuna: è una discussione. La misura del testo è una stima (conta tutte le varianti, non solo quelle di una partita).

## Questioni aperte
- **L'elenco dei testi da doppiare:** quali stringhe (solo i testi fissi, o tutte le varianti), con il personaggio che le dice e l'eventuale emozione, e come si tratta una battuta con segnaposto (`[acqua]`, `[cibo]`, `[i fili del viaggio]`, 512 combinazioni): sintetizzare i frammenti e ricomporli, o tutte le combinazioni, o lasciare muto il dinamico.
- **I termini d'uso del servizio:** costi, diritti d'uso dell'audio generato in rapporto alla licenza CC BY-SA dei contenuti e alla distribuzione su GitHub, eventuale filigrana sull'audio; da leggere nei termini ufficiali, non verificati qui (nemmeno il nome esatto del modello).
- **Il peso:** 76 minuti sono tra 20 e 40 MB in Opus o MP3 vocale (stima), contro i 107–135 MB di oggi, e la CI e l'autoverifica li caricano.
- **Le impostazioni:** volume, velocità di riproduzione, silenzio; il rispetto di «riduci movimento» nelle animazioni che accompagnano la voce.
- **Il formato:** i WAV di Simone sono la sorgente; nel pacchetto andrebbero compressi.
