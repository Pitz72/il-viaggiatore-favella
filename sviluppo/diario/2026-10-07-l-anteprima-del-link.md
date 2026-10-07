---
data: 2026-10-07
ora: "09:30"
titolo: "L'anteprima del link"
tipo: sessione
versione: 1.13.2
---

# L'anteprima del link

## In breve
Il link a GitHub Pages non mostrava nessuna immagine quando veniva condiviso. Ora ha l'anteprima (banner, titolo, descrizione).

## Contesto
`app/index.html` aveva solo la descrizione. I social e le chat leggono i tag Open Graph (`og:image`, `og:title`…); senza, il link resta nudo.

## Lavoro fatto
- `app/public/anteprima.jpg` (1200×630, il banner su fondo sfocato) e i tag `og:*` / `twitter:card` in `app/index.html`, con URL assoluti di GitHub Pages. La descrizione dice 14 personaggi, come il README (prima 13).
- Per l'anteprima del *repository* GitHub (diversa dal sito) l'immagine 1280×640 è in `_pubblicazione/` (non versionata): si carica a mano da Settings → Social preview, perché non esiste un'API.

## Decisioni
- **Patch (1.13.2)**, solo versione web; nessun nuovo pacchetto.

## Verifiche
- Pagina ripubblicata col workflow «Pagine»; i tag e l'immagine sono controllati sul sito dal vivo.

## Questioni aperte
- Le chat e i social tengono l'anteprima in cache: un link già condiviso può restare nudo per un po'.
