---
data: 2026-10-21
ora: "09:38"
titolo: "La colonna sonora: la musica delle zone e il menu Extra"
tipo: sessione
versione: 1.31.0
---

# La colonna sonora: la musica delle zone e il menu Extra

## In breve
Il gioco ha una musica per ogni zona, dai sette brani che Simone ha generato con Lyria 3.5: un giro senza cuciture per brano, dissolvenze fra le zone, gli interni filtrati, la musica sotto la voce. L'album «Il Viaggiatore Official Soundtrack» di The Runtimers si scarica dal nuovo menu Extra.

## Contesto
Dopo il piano 09 Simone ha chiesto per prima cosa le musiche degli ambienti; i prompt li avevo scritti in `pre-produzione/10-musiche.md` (sette zone, un filo comune, sotto la voce, niente flauti). Ha generato i brani con Lyria 3.5 e ha chiesto: assegnarli dalla data di generazione (il più vecchio alla zona 1), titoli evocativi presi dal gioco, il logo come copertina, autore The Runtimers, album «Il Viaggiatore Official Sountrack» (scritto così: corretto in «Soundtrack»), inserirli nel gioco con un giro che si agganci in modo intelligente, e una voce di menu «Extra» con «scarica la colonna sonora ufficiale». Col questionario: i brani viaggiano dentro il gioco (non in una release), e la musica sta fuori dalla CC BY-SA, come le voci ElevenLabs.

## Lavoro fatto
- **L'ordine.** Le date dei file (08:30 → 08:55) danno Warm Stillness, Heat Haze, Brittle Salt, Latent Strain, Olive Grove, Ancient Moor, Deep Stillness: combaciano coi nomi di Lyria e coi prompt delle zone 1–7.
- **I titoli**, dalle parole del gioco: Dove finiscono i binari · Il catrame che ondeggia · Acqua ovunque, niente da bere · Il silenzio delle cose costruite · Il bicchiere tenuto da parte · Il vento che non smette · Cosa sei tornato a trovare.
- **La copertina**: `grafica/icona.svg` senza gli angoli arrotondati, 1400×1400, resa da Electron su una tela (`grafica/rendi-copertina-album.cjs`: una finestra fuori schermo viene tagliata all'altezza dello schermo, una tela no), poi JPEG.
- **`strumenti/colonna-sonora.py`**: `album` copia l'audio di Lyria senza ricodificarlo e scrive le etichette ID3v2.3 (titolo, The Runtimers, album, numero, anno, genere, commento con la zona, copertina), più `copertina.jpg`, `LEGGIMI.txt` e `album.json`; `anelli` sceglie il giro e scrive le versioni per il gioco.
- **Il giro.** Il corpo del brano (volume entro 7 dB dal tipico) esclude l'attacco lento e la dissolvenza finale; A e B si cercano dove i 4 s che li precedono si somigliano di più (32 bande e volume), preferendo i giri lunghi; B si sposta di qualche decimo perché gli attacchi cadano insieme e di qualche campione perché le onde combacino; i 4 s prima di B si sfumano a potenza costante in quelli prima di A, e la sfumatura resta nel file, con mezzo secondo di coda mai suonato. Giri da 112 a 152 s; volume a −23 LUFS; Opus 96 kbit/s.
- **`gioco/musica.ts`**: un contesto sul canale «musica» del bus; il brano decodificato quando serve (in memoria solo quello che suona e quello che sfuma), `loopStart`/`loopEnd` al campione; dissolvenza di 3,5 s fra zone, ripresa dal punto lasciato; interni dalla tabella del panorama (`tipoInterno`, ora esportata) con taglio degli acuti e livello per tipo; −6 dB mentre la voce parla (`voce.ascolta`), risalita dopo 0,8 s; −8 dB di base sotto la voce; spenta a viaggio finito; `chiudi` lasciando la partita o ripartendo dalla stazione.
- **Extra**: in `Trailer.tsx` una seconda colonna (Scarica la colonna sonora ufficiale · Indietro), Esc per tornare, l'esito sotto. `lib/colonnaSonora.ts`: sul desktop `colonna:salva` (`desktop/colonna-sonora.cjs`: cartella a scelta, «Il Viaggiatore - Official Soundtrack», file solo dall'elenco e con nomi semplici, poi la apre); nel browser uno ZIP memorizzato (`lib/zip.ts`, scritto qui, nomi UTF-8).
- Crediti e `LICENSE-CONTENUTI.md` (musica dell'intro CC BY-SA, musiche delle zone fuori), la riga «Musica» delle opzioni, README, `strumenti/LEGGIMI.md`, `collaudo/LEGGIMI.md`, il §0 di `10-musiche.md`, CHANGELOG.

## Decisioni
- **Il giro inciso nel file, non due sorgenti che si incrociano a ogni giro** — perché: il salto di Web Audio è esatto e non costa niente; la sfumatura la decide lo strumento, una volta, e si può misurare.
- **«Soundtrack» e non «Sountrack»** — un refuso evidente nella richiesta; lo dico a Simone.
- **Copertina a tutto quadrato** — il JPEG che c'era (`copertina-colonna-sonora.jpg`) ha gli angoli arrotondati dell'icona su nero; per un album serve il quadrato pieno.
- **Interni dalla stessa tabella del panorama** — musica e immagine dicono sempre la stessa cosa.
- **Versione 1.31.0** — funzioni nuove: MINOR.

## Verifiche
- Giunture, misurate sul file Opus decodificato: gli istanti prima del salto ricalcano quelli prima dell'inizio (correlazione 0,997–0,998); il timbro al salto è quello del brano che scorre (una prima misura in scala logaritmica contava anche le frequenze che Opus azzera e dava un falso allarme). In Web Audio, con una resa offline attorno a `fine`: dopo il salto escono i campioni dell'inizio (errore relativo ≤ 5·10⁻⁶) e il gradino al salto è sotto i gradini normali dei 2 s attorno, in tutte e sette le zone.
- Nel browser: la musica parte alla stazione dall'inizio; nel bar il filtro va verso 1100 Hz e il livello a 0,65; fuori torna aperto; mentre il narratore parla sta a 0,5; lasciando Acquaviva a 57,8 s parte la piana da capo, tornando Acquaviva riprende da 63,6; dopo una morte tace. Extra: le due voci, Esc torna al menu; lo ZIP (intercettato, nessuno scaricamento vero) ha nove file con le dimensioni giuste. Ha trovato un difetto: la virgola codificata di «Acqua ovunque, niente da bere» faceva rispondere il server con la pagina del gioco (2125 byte): ora `encodeURI` e una risposta HTML è un errore.
- `collaudo/musica.py` tutto ok; `desktop/prove.cjs` 18 (la copia dell'album e il rifiuto di un elenco con percorsi); autoverifica in Electron superata con «ok musica: 7 zone… album di 9 file»; tutti gli altri collaudi (`finali`, `mirate`, `salvataggi`, `interfaccia`, `pulsanti`, `testo`, `doppiaggio`, `trofei`, `scorte`, `fili`, `giocate`, `conferme`; `opzioni-node` 9, `posti-node` 6, `trofei-prove` 10) ok; build ok.

## Questioni aperte
- Da sentire nel desktop con Simone: il livello della musica sotto la voce, le dissolvenze, gli interni, e i sette giri.
- Il peso: la versione web passa da 33 a 64 MB (13 MB di Opus per il gioco, 19,5 MB di MP3 per l'album, che si scaricano solo dal menu Extra).
- Extra potrà avere altro (il sito di FAVELLA 1).
