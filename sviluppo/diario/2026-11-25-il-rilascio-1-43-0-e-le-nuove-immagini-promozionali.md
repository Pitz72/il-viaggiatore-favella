---
data: 2026-11-25
ora: "10:11"
titolo: "Il rilascio 1.43.0 e le nuove immagini promozionali"
tipo: sessione
versione: 1.43.0
---

# Il rilascio 1.43.0 e le nuove immagini promozionali

## In breve
Rilasciata su GitHub Releases e su GitHub Pages la versione **1.43.0** (`ab65891`, workflow «Rilascio» run `45579422485`) e rifatta interamente la serie delle immagini pubbliche promozionali nel nuovo stile pittorico a gouache e china del gioco, con la firma «un gioco in FAVELLA1 di Simone Pizzi».

## Contesto
Con la 1.43.0 verificata in locale, Simone ha ordinato il commit, l'invio su `main`, la verifica di sincronia e l'avvio del workflow di rilascio, chiedendo in parallelo di rifare il materiale d'immagine pubblico — locandina cinematografica, copertine 16:9 e 21:9 e immagine quadrata — in piena continuità visiva con la nuova veste pittorica, sostituendo la vecchia dicitura «un esperimento in FAVELLA 1» con «un gioco in FAVELLA1 di Simone Pizzi».

## Lavoro fatto
- **Commit, push e rilascio della 1.43.0**: registrato il commit `ab65891` su `main`, spinto su `origin/main` e verificata l'identità tra `HEAD` locale e remoto; avviato `rilascio.yml` (run `45579422485`), concluso con tutti i sette job verdi (`Verifica della versione`, `Collaudo`, `Pacchetti Linux`, `Pacchetti Windows`, `Release v1.43.0`, `Pagine / Presentazione e gioco`, `Pagine / Pubblica`), sette file allegati alla release `v1.43.0` e pubblicazione automatica della presentazione e di `gioca/` su GitHub Pages.
- **Tre tavole pittoriche maestre al guado di Acquamorta** (`grafica/branding/tavole/{locandina,panoramica,quadrata}.webp`, fuori da `app/public/` per non aggiungere un solo byte al pacchetto del gioco): il Viaggiatore col cappello a tesa larga, la coperta arrotolata e la tanica metallica di fronte al fratello a capo scoperto sull'altra sponda del fiume ramato, sotto il borgo in rovina e il campanile mozzato di Acquamorta.
- **Impaginazione ad alta risoluzione e generatore autonomo** (`app/src/locandine/{formati,scena,main}.ts`, `strumenti/locandine.cjs`, `grafica/branding/LEGGIMI.md`, `strumenti/LEGGIMI.md`):
  - rimossa la riga «UN ESPERIMENTO IN FAVELLA 1» e composta la firma «un gioco in FAVELLA1 di Simone Pizzi» armonizzando Lora corsivo e Sora 700;
  - aggiornato `strumenti/locandine.cjs` con un protocollo interno `locandina://` e compilazione TypeScript al volo in memoria, così da dipingere tutti i formati in Electron fuori schermo senza mai avviare un server di sviluppo;
  - rigenerati in JPEG 4:4:4 `il-viaggiatore-locandina-27x40.jpg` (`2700×4000`), `il-viaggiatore-16x9.jpg` (`3840×2160`), `il-viaggiatore-21x9.jpg` (`5040×2160`), `il-viaggiatore-1x1.jpg` (`2160×2160`), `il-viaggiatore-4x3.jpg` (`2880×2160`), `il-viaggiatore-github-1280x640.jpg` (`1280×640`), più `grafica/banner.jpg` (`2520×1080`) e i due derivati per itch.io (`grafica/itch/banner-960x411.jpg` e `copertina-630x500.jpg`).

## Decisioni
- **Tavole maestre custodite in `grafica/branding/tavole/` anziché in `app/public/`** — perché: le immagini promozionali servono alla diffusione esterna, al README, a GitHub Pages e a itch.io; tenerle in `grafica/branding/` evita di gonfiare `app/dist/` e gli eseguibili distribuiti.
- **`strumenti/locandine.cjs` autonomo su protocollo interno** — perché: permette di rigenerare qualsiasi formato a freddo in pochi decimi di secondo senza aprire porte locali né avviare il server di sviluppo.

## Verifiche
- GitHub Actions run `45579422485`: 7 job su 7 verdi; `gh release view v1.43.0` conferma release pubblicata (non bozza, non pre-release) su `ab65891` con i 7 asset completi di digest SHA-256; tag `v1.43.0` allineato in locale; `https://pitz72.github.io/il-viaggiatore-favella/` e `gioca/` rispondono `HTTP 200`.
- `tsc --noEmit` ed `eslint src/locandine` in `app/`: 0 errori e 0 avvisi.
- `electron strumenti/locandine.cjs`: generati tutti e 9 i file JPEG 4:4:4; controllati visivamente uno per uno per verificare margini, leggibilità dei testi, integrità del campanile e delle figure e assenza di cornici spurie.
- `node strumenti/diario.mjs verifica` e `node strumenti/diario.mjs registro`: verdi.

## Questioni aperte
- Attesa della conferma di Simone sulle nuove immagini promozionali per inviarle su `main` (ed eventualmente rilanciare il workflow «Pagine» così che il nuovo `banner.jpg` e `anteprima.jpg` vadano subito anche sulla pagina pubblica).
