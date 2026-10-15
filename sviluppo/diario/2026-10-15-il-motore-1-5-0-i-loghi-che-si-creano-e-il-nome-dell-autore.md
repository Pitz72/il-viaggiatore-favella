---
data: 2026-10-15
ora: "12:49"
titolo: "Il motore 1.5.0, i loghi che si creano e il nome dell'autore"
tipo: sessione
versione: 1.14.0
---

# Il motore 1.5.0, i loghi che si creano e il nome dell'autore

## In breve
Il gioco passa alla FAVELLA 1.5.0 senza che la storia cambi; i due loghi d'apertura si creano davanti a chi guarda, con il loro suono; il nome dell'autore entra nel gioco.

## Contesto
Simone ha chiesto di verificare se la versione desktop usasse la FAVELLA 1.5.0: non la usava (repository e release v1.13.0 col motore 1.4.4), mentre l'esperimento sul sito girava già la 1.13.2 sul motore 1.5.0. Con l'allineamento ha chiesto il logo nuovo di Runtime Multimedia (una versione a colori) con un'animazione di creazione, lo stesso per il logo di FAVELLA, il suono dei due loghi, la verifica che il gioco citi l'autore, e il rilascio.

## Lavoro fatto
- `motore/`: la 1.5.0 copiata dal tag `v1.5.0` di FAVELLA1 (otto file). La storia compilava con tre avvisi nuovi, gli stati delle voci scritti e mai letti dal `.fav`: dichiarati `(voluto)`, e adeguate le espressioni che li riconoscono in `collaudo/testo.py` e `strumenti/mappa-narrativa.py`.
- Autore: c'era nel README (sezione «Autore») e nei metadati dell'installer (autore, copyright, maintainer), ma dentro il gioco nessuno lo vedeva. Ora: «un gioco di Simone Pizzi» sotto il titolo del trailer (resta nel menu d'avvio), `Il titolo è …` e `L'autore è …` nella storia (il motore li stampa nel terminale, nella galleria del sito, in Favella Studio), `<meta name="author">` nella pagina.
- `app/src/loghi/`: `forme.ts` (i tracciati del marchio Runtime divisi per lettera; il simbolo di FAVELLA ridisegnato in vettoriale), `LogoRuntime.tsx`, `LogoFavella.tsx`, `suono.ts` (la partitura in Web Audio), `esporta.ts` (solo in sviluppo); `components/Loghi.tsx` riscritto come orologio unico. Tolti i due `.webp`.
- I video dei due loghi in 4K (3840×2160, 60 fotogrammi al secondo, con l'audio reso dalla stessa partitura) esportati per Simone dall'animazione vera.

## Decisioni
- **Lo schermo color carta per Runtime** — perché la scritta del marchio a colori è verde petrolio (#005057) e sul nero dell'intro avrebbe un contrasto di 2,3:1. Lo schermo che si accende e si spegne come un televisore tiene il nero tutto attorno e dà al marchio il suo fondo chiaro. L'alternativa era la versione monocromatica arancione (6,4:1), meno ricca.
- **Il simbolo di FAVELLA ridisegnato in vettoriale** — perché il marchio ufficiale è un'immagine raster: per animarne le parti (gemma, libro, pagine, graffe) servono le forme. Contorni estratti dall'icona ufficiale, adattati a curve di Bézier, metà sinistra specchiata; scritta e motto in Sora 700 e Inter, i caratteri del marchio, già inclusi nel gioco.
- **Il suono sintetizzato, non un file** — perché resta legato alle immagini (si programma tutto sul clock dell'audio e l'orologio delle immagini parte con lui), non pesa niente, e la stessa partitura si rende offline per i video. Il volume sta sotto la colonna del trailer (−17 e −21 LUFS contro −14), con un limitatore in uscita.
- **Le tele del trailer si preparano ancora durante i loghi** — misurato: un solo blocco del browser di 0,13 s in dodici secondi; e le animazioni sono funzioni del tempo, un fotogramma saltato non le fa uscire di sincrono.
- **1.14.0, minor** — un motore minor nuovo e funzioni nuove dell'app (`sviluppo/VERSIONI.md`, §2); il formato dei salvataggi resta 1.

## Verifiche
- Le undici suite di `collaudo/`: exit 0; esploratore 100 partite, 15.803 comandi, nessuna anomalia; la storia compila senza avvisi.
- Autoverifica nel browser (il motore vero dentro Pyodide): superata. Una partita a mano nel server di sviluppo: «usa la tanica su nord» risponde «Non vedi nulla del genere qui.», nessun errore in console.
- Loghi: fotogrammi a istanti fissi (`?loghi=t`) e un video in tempo reale (circa 46 fotogrammi al secondo in un Chrome senza scheda grafica), su schermo 16:9 e su telefono in verticale. Audio reso offline e misurato: picchi a −1,4 e −5,5 dBFS.
- L'audio dal vivo nell'app desktop non l'ha ascoltato nessuno: va sentito.

## Questioni aperte
- Ascoltare il suono dei loghi sul desktop e dire se va bilanciato.
- La versione per Mac non si costruisce (come sempre).
