---
data: 2026-10-20
ora: "20:01"
titolo: "Le voci di ElevenLabs nel gioco, e il cartello delle licenze e dei crediti"
tipo: sessione
versione: 1.23.0
---

# Le voci di ElevenLabs nel gioco, e il cartello delle licenze e dei crediti

## In breve
Simone ha deciso di distribuire anche le voci di Imma, Rosaria, Tore e Vito, fatte sul piano gratuito di ElevenLabs, escluse dalla licenza libera e solo per uso non commerciale, accettando il rischio. Ha chiesto anche un cartello di licenze e crediti dopo i loghi e prima dell'avviso, e una revisione del README. Adesso ogni battuta del gioco ha la sua voce, ovunque.

## Contesto
Dopo il piano 08 (voci di diario della sera) le quattro voci ElevenLabs suonavano solo sul PC di Simone. Simone ha chiesto perché non si potessero distribuire; la risposta: il piano gratuito vieta l'uso commerciale, la licenza CC BY-SA del gioco lo permette a chiunque, e pagare dopo non cambia ciò che è stato generato prima. Nella prima risposta avevo aggiunto che la «condivisione allo stesso modo» obbligava a dare all'audio la stessa licenza dei testi: era sbagliato, perché i testi sono di Simone e la clausola vincola gli altri, non l'autore; l'ho corretto subito. Le strade: rifarli con Gemini, rifarli con ElevenLabs a pagamento, o distribuirli esclusi dalla licenza libera, come i loghi. Simone: «Accettiamo un rischio. È un gioco sperimentale… andiamo di via 3».

## Lavoro fatto
- `strumenti/doppiaggio-banco.py`: i blocchi di `A_PARTE` (Imma, Rosaria, Tore, Vito) vanno in `app/public/voce/elevenlabs/`, nel repository, con un indice loro che dice la licenza; l'indice principale nomina le cartelle a parte (`cartelle`) e non ha più parti mute. `.gitignore` non esclude più niente della voce; la vecchia `voce/locale/` è sparita.
- **Un difetto mio, trovato rifacendo il banco:** la pulizia dei file «che non sono di nessuna parte» cancellava anche `trailer.opus`. Ora toglie solo i file col nome di una parte (otto cifre esadecimali).
- `app/src/gioco/voce.ts` carica le cartelle che l'indice nomina; `app/src/autoverifica.ts` decodifica una parte per ognuna delle 16 voci (anche quelle a parte); `collaudo/doppiaggio.py` controlla ogni cartella col suo indice, e che ogni cartella a parte dica la sua licenza.
- `app/src/components/Crediti.tsx` (nuovo): il cartello delle licenze e dei crediti, con lo stesso aspetto e lo stesso comportamento dell'avviso (compare in dissolvenza, prosegue da solo dopo 15 s, o con Invio, Spazio, Esc, un clic, o «continua»): il gioco e l'autore; storia, testi, musica e grafica CC BY-SA 4.0; le voci Gemini; le voci ElevenLabs di Imma, Rosaria, Tore e Vito («elevenlabs.io · solo uso non commerciale, fuori dalla licenza libera»: qui sta l'attribuzione); il codice e il motore MIT; i componenti; i marchi; dove stanno i testi delle licenze. `App.tsx`: loghi → crediti → avviso → trailer. `collaudo/testo.py` verifica il nuovo ordine (l'avviso resta parola per parola).
- `LICENSE-CONTENUTI.md`: «Cosa NON copre: le voci di ElevenLabs». `README.md` rivisto da cima a fondo: l'apertura con il cartello, Esc che lo chiude, la nota sul progetto concluso (dalla 1.19.0 alla 1.23.0 il doppiaggio), le licenze con l'eccezione delle quattro voci, la tabella delle voci, i comandi del doppiaggio fra quelli di sviluppo, l'autoverifica che prova la voce. Le guide di `doppiaggio/`, `strumenti/` e `collaudo/` allineate; il piano 08 con la decisione aggiornata e le fasi 7 e 8.

## Decisioni
- **Le quattro voci ElevenLabs si distribuiscono, escluse dalla licenza libera** — scelta di Simone, che ne accetta il rischio: i termini di ElevenLabs chiedono «elevenlabs.io» nel titolo e vietano l'uso commerciale del piano gratuito; il gioco è gratuito, e l'esclusione impedisce che la CC BY-SA del resto ne permetta la vendita ad altri. L'attribuzione sta nel cartello, nel README e nella licenza. Non è una consulenza legale.
- **Una cartella a parte, non un elenco di file** — una licenza diversa si dice meglio per cartella, come i loghi stanno in un file solo; l'indice la nomina, così l'app e i collaudi non hanno nomi scritti dentro.
- **Il cartello si comporta come l'avviso** — è una comunicazione, come l'avviso: stessa durata massima in proporzione (15 s), stessi tasti, nessun invito «salta». Il cambio dell'ordine d'apertura l'ha chiesto Simone.
- **Versione 1.23.0** — contenuti nuovi nei pacchetti (le quattro voci) e un cartello nuovo: MINOR.

## Verifiche
- `collaudo/doppiaggio.py`: TUTTO OK; «ogni parte che il gioco dice ha la sua voce (878 parti, 809 in voce/, 69 in elevenlabs)», «ogni cartella a parte dice la sua licenza».
- `collaudo/testo.py`: l'avviso è quello dell'autore, e sta fra i loghi (col cartello in mezzo) e il trailer.
- Nel browser integrato a 1280×720: dopo i loghi il cartello, leggibile su una pagina; Esc porta all'avviso.
- Gli altri dieci collaudi: TUTTO OK; `npx tsc --noEmit` pulito; la build riuscita; l'autoverifica del desktop SUPERATA: «878 parti, 16 voci, una per voce decodificata», la voce del trailer 28 frasi, 88,5 s.

## Questioni aperte
- Il rilascio pubblico, solo su ordine di Simone.
