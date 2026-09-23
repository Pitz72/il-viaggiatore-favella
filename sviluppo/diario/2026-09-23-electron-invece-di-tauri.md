---
data: 2026-09-23
ora: "06:00"
titolo: "Desktop: Electron invece di Tauri"
tipo: decisione
versione: 1.0.0
---

# Desktop: Electron invece di Tauri

## In breve
Versione desktop per Windows e Linux con Electron, repository pubblico, CI su GitHub.

## Contesto
Si voleva un'applicazione desktop a schermo intero per Windows e Linux, costruita dalla CI di GitHub.

## Lavoro fatto
- guscio Electron con protocollo interno `app://` (con richieste a intervalli, per il salto nell'audio);
- Pyodide e Lark inclusi nel progetto: il gioco non usa la rete;
- `--autoverifica`: il pacchetto costruito avvia il gioco vero e ne controlla le risposte;
- icona del gioco; repository pubblico `Pitz72/il-viaggiatore-favella`; licenze MIT (codice) e CC BY-SA 4.0 (contenuti).

## Decisioni
- **Electron** — perché: porta lo stesso Chromium su cui il gioco è verificato; con Tauri su Linux WebKitGTK renderebbe mp3 e WebAssembly dipendenti dalla distribuzione.
- **Autoverifica sul pacchetto, non sul codice** — perché: è il pacchetto che arriva al giocatore.

## Verifiche
CI verde al primo push: collaudo, pacchetti Windows e Linux, autoverifica su entrambi (motore avviato in ~2,7 s).

## Questioni aperte
- eseguibili non firmati: SmartScreen chiede conferma.
