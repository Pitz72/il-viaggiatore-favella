---
data: 2026-11-01
ora: "18:08"
titolo: "La pagina su itch.io: decisioni e materiali (in pausa)"
tipo: sessione
versione: 1.41.1
---

# La pagina su itch.io: decisioni e materiali (in pausa)

## In breve
Decise con Simone le linee della pagina su itch.io e preparati i materiali (copertina, banner, descrizione nelle due lingue,
scheda dei campi) in `grafica/itch/`; la pagina sul sito non è ancora creata: Simone ha messo in pausa per la linea che va male.

## Contesto
Simone: «Devi aiutarmi a fare una mia pagina su Itch per cortesia. Se apri il browser io faccio l'accesso». Era il primo punto di
`PROSSIMI-PASSI.md` («guidare Simone a creare la pagina del gioco su itch.io»).

## Lavoro fatto
- Aperta itch.io nel browser integrato: prima dell'accesso itch.io mostra una verifica di sicurezza contro i bot, che Claude non
  può fare. Simone: «credo che devo fare con il mio browser e ti mando le schermate». Il suo Chrome non ha l'estensione Claude
  collegata (nessun browser connesso), quindi si procede così: lui lavora sul sito, manda le schermate, Claude guida. Il browser
  integrato è stato chiuso.
- **Trovato un limite che cambia il piano:** itch.io accetta giochi HTML5 con al massimo **1.000 file** nello zip (500 MB estratti,
  200 MB per file; dalla loro documentazione, <https://itch.io/docs/creators/html5>). Il gioco costruito ne ha **1.839** (89 MB),
  di cui 1.731 parti doppiate: lo zip `Il-Viaggiatore-web.zip` del workflow «Pagine» non passa. I pacchetti desktop (170–195 MB)
  stanno sotto il limite di 1 GB per file.
- Preparati in **`grafica/itch/`** (nuova cartella, nel repository):
  - `copertina-630x500.jpg`, dal 4:3 della key art (taglio al centro, la misura consigliata da itch.io); titolo e marchi interi;
  - `banner-960x411.jpg`, dal 21:9 della key art, per il banner del tema;
  - `descrizione.html`, la descrizione in italiano e inglese da aprire nel browser, copiare e incollare in itch.io: i testi della
    presentazione di `pagine/index.html`, l'avviso dell'autore (`Avviso.tsx`) e i crediti (`crediti.ts`), con il collegamento al
    gioco nel browser su GitHub Pages;
  - `LEGGIMI.md`, la scheda: le decisioni, il perché del limite, ogni campo della pagina con il suo valore, i quattro pacchetti, i
    metadati, i colori del tema (da `pagine/stile.css`).

## Decisioni
- **Su itch.io i pacchetti da scaricare, e nella descrizione il collegamento al gioco nel browser su GitHub Pages** (Simone, a
  questionario) — perché: il gioco nel browser supera il limite dei file, e così non si cambia niente nel gioco. Le altre strade
  (chiedere a itch.io di alzare il limite, riunire le voci in pochi archivi) restano annotate nella scheda.
- **Nessun pagamento** (Simone) — perché: le voci ElevenLabs dei personaggi sono «solo uso non commerciale», e donazioni o prezzo
  potrebbero contare come uso commerciale (non è una consulenza legale).
- **Pagina in italiano e inglese** (Simone), una descrizione in due parti.
- **Si lascia in bozza, la pubblica Simone** (Simone).
- Scelte mie, da confermare: i generi e i dieci tag, la dichiarazione dei contenuti generati (sì, come dicono i crediti), i colori
  del tema; i testi nuovi della descrizione (la riga sotto l'incipit, l'introduzione ai pacchetti) sono **d'interfaccia**, non
  detti: non toccano il doppiaggio.

## Verifiche
- Copertina e banner guardati a occhio: niente tagliato di titolo, frase e marchi.
- Conteggio dei file del gioco: `app/public` 1.834 file (86 MB), `app/dist` 1.839 (89 MB).
- Nessun collaudo eseguito: il gioco non è cambiato (solo materiali in `grafica/itch/` e documenti).

## Questioni aperte
- **Si riprende dalla domanda lasciata senza risposta** (Simone: «Ci ritorniamo presto da questa domanda»): i pacchetti li scarica
  Claude dalla release in `C:\Users\Utente\Downloads\Il-Viaggiatore-itch` (circa 760 MB, consigliato) o Simone; quali schermate
  (le quattro inglesi, consigliato; le quattro italiane; tutte e otto); la frase breve (nelle due lingue, consigliato; solo inglese;
  solo italiano). Poi la guida passo per passo sul sito, con le schermate di Simone.
