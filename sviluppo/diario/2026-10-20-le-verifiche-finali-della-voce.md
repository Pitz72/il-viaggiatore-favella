---
data: 2026-10-20
ora: "19:10"
titolo: "Le verifiche finali della voce"
tipo: sessione
versione: 1.22.1
---

# Le verifiche finali della voce

## In breve
Fase 5 del piano 08: l'autoverifica dei pacchetti ora prova anche la voce, il pacchetto Windows costruito come in CI pesa 14,5 MB in più, e una partita intera ha circa mezz'ora di voce. Tutto verde.

## Contesto
Dopo le fasi 1–4 (banco, voce nel gioco, numeri e fili, trailer con Enzo; voci di diario della stessa sera) restavano le verifiche del piano (3.5): l'autoverifica che carica l'indice e una parte per voce, il peso del pacchetto e la CI, una partita intera con la voce.

## Lavoro fatto
- `app/src/autoverifica.ts`: dopo l'avvio del motore, `provaLaVoce` scarica `voce/indice.json`, decodifica davvero una parte per ogni voce del pacchetto (la durata dev'essere quella dell'indice), ritrova dal testo d'avvio le sue parti con `parti.ts` (ognuna deve esistere o essere dichiarata muta) e decodifica la traccia del trailer (88,5 s). La CI la esegue sui pacchetti Windows e Linux appena costruiti.
- Il peso: il pacchetto Windows (NSIS) costruito in locale come in CI, cioè senza `voce/locale/`.
- Una partita intera «ascoltata» coi numeri: il percorso A e il percorso E di `collaudo/finali.py`, giocati col pilota, e per ogni turno la voce che `voce.ts` direbbe (parti e pause).

## Decisioni
- **Versione 1.22.1** — l'autoverifica cambia il pacchetto ma non ciò che il giocatore vede o sente: PATCH.

## Verifiche
- `electron desktop --autoverifica`: SUPERATA; «ok voce: 809 parti, 12 voci, una per voce decodificata (69 parti mute)», «il testo d'avvio ritrova le sue 4 parti», «voce del trailer: 28 frasi, 88.5 s».
- Installatore Windows 1.22.0 senza le voci solo locali: 134.714.967 byte, 128,5 MB; la 1.18.2 pubblicata pesa 114 MB: +14,5 MB (13,7 di parti, 0,4 del trailer; l'Opus non si comprime oltre).
- La CI di ogni fase (cce9da0, ccf336f, cf3815a, b10e565, 34308db): verde, compreso il collaudo della voce.
- Percorso A: 151 turni, circa 30,5 minuti di voce, 11,7 s per turno in mediana, il turno più lungo 61 s (l'arrivo a casa, con il paragrafo dei fili), 32 turni senza voce (risposte del motore); percorso E: 153 turni, 29,2 minuti.
- Gli undici collaudi (finali, mirate, salvataggi, scorte, interfaccia, fili, giocate, testo, conferme, pulsanti, doppiaggio): TUTTO OK; `npx tsc --noEmit` pulito; `npm run build` riuscito.

## Questioni aperte
- Fase 6: i documenti (README con le voci e i diritti).
- Rifare Imma, Rosaria, Tore e Vito prima del rilascio (piano 08, decisione 6).
