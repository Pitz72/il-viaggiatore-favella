---
data: 2026-10-21
ora: "14:52"
titolo: "La canzone dei titoli di coda"
tipo: sessione
versione: 1.33.0
---

# La canzone dei titoli di coda

## In breve
La canzone della sequenza finale è arrivata: si chiama «La mano sa ancora la forma», è l'ottavo brano dell'album e
suona sotto la sequenza al posto del tema dell'intro, che ora dura 2:38.

## Contesto
La 1.33.0 aveva la sequenza finale pronta e il prompt per Lyria 3.5 nel piano 11 (§3), col titolo «La mano ci torna da
sola» e il testo intero. Simone l'ha generata e ha chiesto di trattarla come le altre (titolo, etichette, album) e di
metterla nella sequenza.

## Lavoro fatto
- Ascolto con whisper large-v3: **Lyria ha riscritto il testo**. Tiene la strada del prompt (le lettere, i binari, il
  catrame, l'invaso col sale, il bicchiere tenuto da parte, le colline, il foglio piegato), ma il ritornello è «Ma il
  ferro freddo lo senti nel palmo / La mano sa ancora la forma che ha», e il titolo che Lyria le aveva dato era «Il
  ferro freddo». Una riga «Grazie a tutti.» nella coda era un'allucinazione di whisper: col filtro VAD non c'è voce.
- `strumenti/colonna-sonora.py`: la canzone (`CANZONE`) come ottavo brano dell'album; `album` rietichetta dal file già
  nell'album i brani che nella cartella non ci sono (gli originali di Lyria delle zone non stanno qui); il comando
  `finale` scrive `app/public/musica/finale.opus` e la voce `finale` dell'indice, che `anelli` ora conserva.
- `app/public/colonna-sonora/`: «08 - La mano sa ancora la forma.mp3», album.json e LEGGIMI a otto brani; i sette delle
  zone da n/7 a n/8.
- `app/src/finale/crediti.ts`: la riga della canzone col titolo nuovo e «musica e testo generati con Lyria 3.5».
- `collaudo/musica.py` e l'autoverifica dei pacchetti (`autoverifica.ts`) conoscono la canzone; README, LICENSE-CONTENUTI
  e piano 11 aggiornati.

## Decisioni
- **Il titolo «La mano sa ancora la forma»** — perché: è il verso che chiude la canzone e quello che resta in testa; tiene
  la mano della soglia di casa, come il titolo del piano, che però non si canta più.
- **«Musica e testo generati con Lyria»** nei crediti, nel LEGGIMI e in LICENSE-CONTENUTI — perché: il testo cantato è
  quello di Lyria; la domanda aperta su come accreditare il mio testo non serve più.
- **−14 LUFS, non −23** — perché: nella sequenza non c'è una voce da lasciar passare; prima suonava il tema dell'intro
  (−14,1) e subito dopo il menu suona di nuovo quello, quindi la canzone sta al suo livello. Il file di Lyria era a −11,4
  LUFS col picco a +0,4 dBTP: −2,6 dB, il picco va a −2,2.
- **Via i silenzi alle estremità** (0,46 s in testa, 2,12 s in coda, soglia −50 dB, 0,1 s di margine) — perché: la
  sequenza conta a ritroso dalla fine del file, e due secondi muti spostavano i loghi fuori dalla musica.
- **Nell'album l'audio resta com'è**, come per le zone.

## Verifiche
- Audio dei sette brani rietichettati identico: impronta MD5 del flusso uguale prima e dopo, dimensioni uguali al byte.
- `collaudo/musica.py`: tutto ok (album a otto, titolo uguale in indice, album e crediti; canzone 156,27 s, 0,10 s di
  silenzio in testa e 0,11 in coda, −14,0 LUFS); `app/scripts/finale-node.mjs` 13/13; `tsc` pulito;
  `collaudo/doppiaggio.py` ok (nessun testo detto cambia).
- Foto della sequenza a 1920×1080 in Electron fuori schermo, sulla canzone vera: durata 157,8 s; la voce entra a 22 s,
  dopo la frase (6–20 s); nero a 143,4 s e loghi fino a 156,8 s, dentro la coda strumentale (l'ultima parola cantata è
  a 127,5 s); la riga della canzone c'è fra i titoli.

## Questioni aperte
- I titoli ora salgono per 106 s, a circa 20 px/s sulla superficie di 1080 (col tema dell'intro erano 39 s, circa 55
  px/s): da giudicare con Simone guardando la sequenza.
