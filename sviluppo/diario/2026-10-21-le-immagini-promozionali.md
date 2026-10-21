---
data: 2026-10-21
ora: "15:58"
titolo: "Le immagini promozionali"
tipo: sessione
versione: 1.34.0
---

# Le immagini promozionali

## In breve
Una key art nuova, dipinta col pennello del trailer e impaginata per sei formati (16:9, 21:9, 4:3, quadrata, locandina
27 × 40, anteprima di GitHub), in `grafica/branding/`; diventa anche la copertina del README.

## Contesto
Simone ha chiesto immagini social «fatte come si deve», al massimo, migliori di quelle fatte fin qui (il banner del
README era il fotogramma del titolo del trailer), in 16:9, 21:9, 4:3, quadrata e locandina cinematografica, col titolo,
l'autore e i marchi di FAVELLA 1 e di Runtime Multimedia, in una cartella per il branding; poi la copertina di GitHub
cambiata (l'anteprima social la carica lui) e le immagini nei siti favella.eu ed ecosystem, con la precisazione che le
versioni web sono definitive e che il desktop ha dei plus ed è la versione più completa.

## Lavoro fatto
- `app/src/locandine/scena.ts`: la scena G del trailer ricomposta. Il sole al centro, dietro il campanile di Acquamorta
  (che lo taglia a metà); i due fratelli sul greto, uno per parte, che si guardano, con la luce di contorno dal lato del
  sole e le ombre lunghe verso di noi; la stessa città (stesso seme), la luce sulle case e sui sassi dal lato del sole,
  le nuvole alte e le prime stelle per i cieli alti, una lama di luce orizzontale dietro la città, la calura sull'acqua.
  Le tele (città, sassi, nuvole, colline, raggi) si dipingono alla risoluzione dell'uscita, larghe e alte quanto la vista.
- `app/src/locandine/formati.ts`: due impaginazioni. «Cielo» per i formati larghi e il quadrato (titolo in alto, frase e
  marchi in basso fra i due fratelli); «locandina» per il 27 × 40 (frase in alto nel buio, titolo, autore e blocco dei
  marchi in fondo, sul greto che si spegne).
- `app/src/locandine/marchi.ts`: FAVELLA 1 dai tracciati vettoriali del gioco (`loghi/forme.ts`), pieno in avorio con
  le forme separate da un filo scavato e la gemma d'ambra, e la scritta FAVELLA1 in Sora 700 con le proporzioni del
  banner ufficiale; Runtime Multimedia dal file ufficiale «Bianco» (copiato in `grafica/branding/marchi/`), in avorio.
- `app/src/locandine/main.ts` + `app/locandine.html` (solo sviluppo, non entra nella build); `strumenti/locandine.cjs`:
  Electron fuori schermo, il PNG torna dalla pagina, ffmpeg lo scrive in JPEG 4:4:4; dal 21:9 anche `grafica/banner.jpg`.
- README: la copertina, la nota su web definitivo e desktop più completo, il comando; `grafica/branding/LEGGIMI.md`.

## Decisioni
- **Una key art sola per tutti i formati, non ritagli del trailer** — perché: ogni formato ha la sua impaginazione e la
  scena si allarga o si alza quanto serve, invece di perdere i bordi.
- **Il guado, i due fratelli, il sole dietro il campanile** — approvato da Simone sulle prime prove (questionario).
- **La frase del biglietto, a mano** — approvata: è il gancio della storia.
- **I marchi in un colore chiaro** — approvato: sul buio il RUNTIME blu petrolio e il libro blu notte non si leggono.
- **Il disegno su CPU** (`disableHardwareAcceleration`) — perché: con tele da 5040 × 2160 e 2700 × 4000 una dopo l'altra
  il processo della GPU a volte cadeva; per un fotogramma solo la CPU basta (circa 2 s a formato).

## Verifiche
- Sei formati resi in circa 2 s l'uno; guardati interi e al 100 % (campanile, figure, sassi, marchi); `tsc` pulito.
- Il JPEG del 16:9 pesa 1,3 MB, il 21:9 1,6 MB, l'anteprima di GitHub 0,2 MB (sotto il limite di 1 MB di GitHub).

## Questioni aperte
- L'anteprima social del repository si carica a mano (GitHub → Settings → Social preview): la carica Simone.
- I siti favella.eu ed ecosystem li aggiornano due sessioni nelle loro cartelle (scelta di Simone), dopo il rilascio
  della versione desktop.
