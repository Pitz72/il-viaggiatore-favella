# Registro delle modifiche

Tutte le modifiche rilevanti al gioco, versione per versione. Formato
[Keep a Changelog](https://keepachangelog.com/it/1.1.0/); numeri di versione
[SemVer 2.0.0](https://semver.org/lang/it/) secondo le regole di
[`sviluppo/VERSIONI.md`](sviluppo/VERSIONI.md). Il *come* e il *perché* di ogni
passo stanno nel [diario di sviluppo](sviluppo/DIARIO.md).

## [Non rilasciato]

## [1.1.1] - 2026-09-23

### Corretto
- **Motore FAVELLA 1.2.1**: ANNULLA riporta indietro anche la memoria di
  ANCORA. Dopo «prendi la mappa» e «annulla», il comando «ancora» non rifà la
  presa appena disfatta ma il comando che la precedeva.

## [1.1.0] - 2026-09-23

### Cambiato
- **Motore FAVELLA 1.2.0** al posto dell'anteprima 1.1.0: è la versione
  rilasciata del motore e contiene il posto iniziale degli oggetti nato per
  questo gioco. I salvataggi della 1.0.0 si caricano ancora: vengono rigiocati
  sul motore nuovo e il gioco avvisa che la partita è stata ricostruita.
- Scrivere «salva» o «carica» nella riga dei comandi ora rimanda a F5, F9 e al
  taccuino, invece di rispondere «Non capisco questo verbo.».

## [1.0.0] - 2026-09-23

Prima versione pubblica.

### Aggiunto
- **L'avventura completa**: 7 zone, 39 luoghi, 13 personaggi, 6 finali di storia
  e 3 morti (sete, fame, ferite), scritta in FAVELLA 1 (motore 1.1.0 incluso).
- **Versione desktop per Windows e Linux** (Electron) a schermo intero, senza
  rete: installer e versione portatile per Windows, AppImage e pacchetto .deb
  per Linux.
- **Loghi d'apertura** (Runtime, FAVELLA) e **trailer** di 88 secondi con la
  colonna sonora originale; Esc salta i loghi e il trailer.
- **Salvataggi**: il taccuino con sei posti e un posto automatico (a ogni
  cambio di luogo), F5 per salvare e F9 per caricare, «Continua il viaggio»
  nel menu, esportazione e importazione di file `.viaggiatore`. Un salvataggio
  ricaricato riproduce la partita identica, ANNULLA compreso.
- **Aggiornamento automatico** dell'installer Windows e dell'AppImage Linux
  dalle release di GitHub, con avviso e «riavvia ora».
- **Registro tecnico** della versione desktop, da allegare alle segnalazioni.
- Guida «come si gioca», interfaccia con panorama per zona, diario impaginato,
  dialoghi e oggetti come pulsanti, corpo e scorte con le soglie.
- Versione e commit della build nel menu e in ogni salvataggio.

### Cambiato
- Le stanze non descrivono più nella loro prosa gli oggetti che si possono
  prendere: ogni oggetto ha il suo *posto iniziale*, che sparisce quando lo si
  prende.

### Corretto
- Le morti per sete e per fame mostrano la loro frase: prima si moriva sempre
  con quella generica, perché la vita finiva prima della soglia estrema.
