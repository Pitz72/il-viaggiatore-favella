---
data: 2026-10-30
ora: "11:05"
titolo: "Le risposte sono nostre: il viandante accanto alle risposte, i volti più grandi"
tipo: sessione
versione: 1.39.0
---

# Le risposte sono nostre: il viandante accanto alle risposte, i volti più grandi

## In breve
Simone ha guardato i ritratti della 1.38.0 e ha posto due note: «nelle scelte di dialogo non ha senso che ci sia il
ritratto della persona CON CUI stiamo parlando, semmai dovrebbe esserci la nostra»; e «nel testo il ritratto della persona
con cui stiamo parlando dovrebbe essere più grande». Ora accanto alle risposte c'è il viandante, e il volto di chi parla è
cresciuto da 46 a 78 unità.

## Contesto
Nella 1.38.0 il volto dell'interlocutore compariva due volte: piccolo accanto alla sua battuta, grande accanto alle
risposte. Ma le risposte le dice il protagonista, e il protagonista non ha volto (decisione della 1.38.0: è chi gioca).

## Lavoro fatto
- **`gioco/RitrattoNostro.tsx`** (nuovo): il nostro ritratto è la figura dei panorami (`trailer/viandante.ts`), intera e
  ferma sull'orizzonte, rivolta verso le risposte: il cielo della zona, le colline, il suolo, la luce di contorno e l'ombra
  corta, come una miniatura del panorama. Si ridipinge solo quando cambia la zona. Prima ho provato un mezzo busto, ma la
  figura è disegnata per stare piccola nel paesaggio e ingrandita veniva grossolana.
- **`Panorama.tsx`**: `luceDi(clima)` dà il cielo, il sole, le quinte, il suolo e i colori della figura di una zona, le
  stesse tinte del panorama.
- **`ViaggiatorePlayer.tsx`, `gioco.css`**: accanto alle risposte, sempre, il nostro ritratto (la variabile `--volto` e il
  suo url() non servono più); il volto nella battuta a 78 unità, col nome allineato.

## Decisioni
- **Il protagonista resta senza volto** — perché: «semmai la nostra» lascia la scelta aperta, e la figura dei panorami è
  già il protagonista per chi gioca; un ritratto vero si può ancora generare, se Simone lo vorrà.

## Verifiche
- In una partita vera, a 1440×810: Nunzio al bar, il volto grande nella battuta, il viandante nella luce di Acquaviva
  accanto alle risposte. Il ritratto, provato da solo, in tutte e sette le zone.
- `npx tsc`, `collaudo/testo.py`, la build: verdi.

## Questioni aperte
- Da sentire dal tester se il viandante accanto alle risposte si capisce come «tu».
