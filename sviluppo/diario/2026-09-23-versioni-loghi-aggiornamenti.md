---
data: 2026-09-23
ora: "08:00"
titolo: "Versioni, taccuino, loghi e aggiornamenti"
tipo: sessione
versione: 1.0.0
---

# Versioni, taccuino, loghi e aggiornamenti

## In breve
Versioni SemVer da un'unica fonte, diario di sviluppo, taccuino dei salvataggi, loghi d'apertura, aggiornamento automatico, rilascio manuale.

## Contesto
Richieste: versioni rigorose e un registro di sviluppo; niente controlli durante l'intro (Esc per saltare); salvataggi veri con un'interfaccia elegante; loghi Runtime e FAVELLA all'avvio; rilasci solo manuali; aggiornamento automatico.

## Lavoro fatto
- `versione.json` fonte unica; `strumenti/versione.mjs` (mostra, verifica, prepara, note); regole in `sviluppo/VERSIONI.md`; identità della build (commit, data) nel gioco e nei salvataggi;
- questo diario, con `strumenti/diario.mjs`;
- il taccuino (salva / carica, F5 / F9), «Continua il viaggio» nel menu, posto automatico a ogni cambio di luogo;
- loghi: 1 s di nero, poi per ciascuno 1 s di entrata, 3 s pieni, 1 s di uscita; Esc li salta;
- trailer senza comandi a schermo: solo Esc;
- `electron-updater` sulle release di GitHub; registro tecnico del desktop;
- CI a ogni push senza pubblicare; workflow «Rilascio» solo a mano.

## Decisioni
- **Logo Runtime «esteso-01»** — perché: la scritta bianca con l'icona petrolio è la più leggibile sul nero.
- **Banner FAVELLA con i bordi sfumati** — perché: il suo fondo blu notte disegnava un rettangolo sul nero.
- **Aggiornamento solo per installer e AppImage** — perché: la versione portatile e il .deb non hanno un posto dove aggiornarsi da soli.

## Verifiche
Collaudo end-to-end nella finestra Electron: loghi a pieno ai tempi giusti, nessun pulsante durante il trailer, salvataggio automatico al cambio di luogo, F5/F9 con conferma, «Continua» nel menu. Autoverifica del pacchetto Windows con salvataggio e ricaricamento. Strumento delle versioni: 11 passi SemVer e l'ordine delle pre-release verificati.

## Questioni aperte
- la prima release va lanciata a mano dal workflow «Rilascio».
