---
data: 2026-10-20
ora: "10:23"
titolo: "Il trailer, fase 6: le ultime rifiniture"
tipo: sessione
versione: 1.18.2
---

# Il trailer, fase 6: le ultime rifiniture

## In breve
Ultima fase del piano 07: le quattro voci «da chiedere» che toccavano i tempi (T1, T2, T3; T4 non è stata chiesta e resta ferma) e le due finezze della schermata d'avvio (C1, C2). Cambiano pochi decimi di secondo in tre punti, per volere di Simone, che ha dato il via libera dopo le tavole prima/dopo e i clip. Durata, ordine, testi, `intro.mp3`, comportamento (solo Esc, nessun pulsante in più o in meno) sono quelli di prima.

## Contesto
Le risposte di Simone al piano (diario «Le risposte di Simone sul piano dell'intro»): T1 incrocio vero; T2 «decidi tu» (allineare «tuo fratello» al colpo del brano; lui approva a occhio e a orecchio); T3 B (il biglietto si scrive più in fretta); C1 e C2 sì, solo leggibilità.

## Lavoro fatto
- **T1. L'incrocio terra → invaso** (`trailer/scaletta.ts`, `SCENE`). La terra resta piena fino a 25,6 s (`a` 25,2 → 25,6, `esce` 0,9 → 0) e l'invaso le entra sopra da 24,8 a 25,6 s (`entra` 0,9 → 0,8); le scene si compongono nell'ordine dell'elenco, perciò l'invaso (poi) sta sopra la terra (prima) e dà un incrocio vero: `terra·(1−α) + invaso·α`. Prima ognuna si dissolveva col proprio inviluppo sopra il nero e a 25,0 s il quadro perdeva più di metà della luce.
- **T2. «tuo fratello» sul colpo** (`components/Trailer.tsx`, `scene/guado.ts`, `trailer/scaletta.ts`). `CUES.guado2.da` 63,7 → 64,0; l'arresto del viandante finisce a 64,0 (`ferma = seg(l, 3.6, 4.4)`, prima 3,8–4,6; la fase del passo si ferma a 64,0); `CAMMINATE[3].a` 64,2 → 64,0 (i passi sonori sono gli stessi: l'ultimo è a 63,77). Anche il colpo grave sintetico, che era a 63,7 per accompagnare il testo, passa a 64,0: il brano ha il suo a 63,99, e lasciandolo a 63,7 i due colpi sarebbero stati distinti, a tre decimi.
- **T3. Il biglietto** (`BIGLIETTO.perCarattere` 0,042 → 0,034): la scrittura finisce a 8,2 s e non a 8,5; i tasti battuti seguono lo stesso passo (ricalcolati da `BIGLIETTO`).
- **C1. Il paragrafo «Da qui in poi comandi tu…»** (`Trailer.tsx`): su due righe (larghezza massima 1000 px) invece di tre, colore a 0,88 invece di 0,72, ombra tinta e un velo più alto e largo (1760×820, 0,86 al centro).
- **C2. I pulsanti secondari**: «? come si gioca», «carica», «rivedi il trailer», «audio» (e «esci» nel desktop): carattere a 18 px (prima 15), fondo scuro, bordo a 0,36 (prima 0,18), «come si gioca» in ambra più chiaro. I pulsanti e i loro testi sono gli stessi.
- Il foglio dei tempi (`video/il-viaggiatore-intro-tempi.md`) dice ora 64,0 per «tuo fratello» e il colpo, e l'incrocio 24,8–25,6.

## Decisioni
- **Il colpo sintetico si sposta con il testo** — perché è il «colpo grave a 63,7» del foglio dei tempi, pensato per il testo; il brano ha il suo a 63,99. Resta l'unico evento sonoro cambiato oltre ai tasti del biglietto (T3); Simone lo ascolta nei WAV prima/dopo.
- **L'incrocio tiene la terra sotto, non la dissolve** — perché una doppia dissolvenza sul nero non ha mai opacità piena (a 25,0 s: la luminosità media era 75 su un minimo di 175): con la terra piena fino all'ultimo e l'invaso che entra sopra, la luminosità va da 175 a 209 senza scendere.
- **1.18.2, patch** — perché sono rifiniture di tempi e di leggibilità, nessuna funzione nuova (`sviluppo/VERSIONI.md`, §2).

## Verifiche
- `tsc` pulito, `npm run build` ok, `collaudo/testo.py` ok (l'avviso è intatto), autoverifica del desktop superata (cartella dei salvataggi temporanea).
- Luminosità media (area visibile) lungo l'incrocio, a 24,3 · 24,8 … 25,8 s: dopo 175 → 178 → 180 → 183 → 187 → 192 → 197 → 200 → 204 → 209 → 209; prima 175 → 79 → 75 → 77 → 82 → 92 → 116 → 139 → 162 → 186 → 209. Rapporto minimo/minore delle due scene: 1,00 (prima 0,43).
- `scaletta.ts` prima/dopo, confronto in Node (transpilato): `DURATA` 88,5 uguale; `SCENE` cambiano solo `terra` e `invaso`; `CAMMINATE` solo la `a` del guado; `EVENTI` 222 prima e dopo, diversi soltanto il tonfo (63,7 → 64,0) e 19 tasti del biglietto (da 7,284 in poi, di pochi centesimi), nessun altro.
- Costo di un fotogramma: l'incrocio disegna due scene per 0,8 s (terra e invaso), ma la terra era già in dissolvenza insieme all'invaso per 1,4 s: il fotogramma più caro dell'incrocio costa 11–13 ms a 1080p e 1440p (p95), sotto i 16,7. Il resto delle scene non cambia.
- Tavole e clip prima/dopo (con la musica) in `collaudo/esiti/confronto-fase6/` e `video/f6-*.mp4|wav` (locali).

## Questioni aperte
- T4 (gli stacchi delle cinque regole) resta ferma, come il piano la dà: priorità bassa, solo se all'ascolto il difetto si sentisse.
- Prossimi atti della sessione: gli MP4 del trailer rigirati (non versionati), il rilascio, la discussione sul doppiaggio.
