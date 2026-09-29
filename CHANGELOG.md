# Registro delle modifiche

Tutte le modifiche rilevanti al gioco, versione per versione. Formato
[Keep a Changelog](https://keepachangelog.com/it/1.1.0/); numeri di versione
[SemVer 2.0.0](https://semver.org/lang/it/) secondo le regole di
[`sviluppo/VERSIONI.md`](sviluppo/VERSIONI.md). Il *come* e il *perché* di ogni
passo stanno nel [diario di sviluppo](sviluppo/DIARIO.md).

## [Non rilasciato]

### Aggiunto
- **«Vuoi bere?» «Vuoi mangiare?»**: l'acqua e il cibo fra le scorte (e la tanica
  nella bisaccia) ora si toccano, e aprono un pannello con le dosi: un sorso, due,
  tre; una porzione, due, tre. Ogni dose dice cosa farebbe (sete 8 → 0, acqua 3 → 1)
  ed è un comando del gioco, un turno solo: `bevi due sorsi`, `mangia tre porzioni`.
  Si smette di offrire dosi alla prima che toglie tutto il bisogno: niente acqua
  sprecata.
- **Scelte che costano chiedono conferma**, con il conto di ciò che si dà e di ciò
  che si riceve, come resterebbero le scorte, e «No» come pulsante di partenza:
  baratti (Nunzio, Ciro, Tore), doni (Saverio, Iole, Rosaria), pagamenti (Vito),
  le cose che si consumano (`curati`, le pastiglie sulla pompa, le medicine a
  Pasquale), l'acqua salmastra, la violenza (`attacca`, `minaccia`) e le svolte
  della storia (Peppe che viene o resta, il lascito di Onofrio). Parlare, chiedere,
  esaminare, muoversi: mai. Il motore mostra in anteprima ciò che succederebbe su
  una copia del mondo, senza farlo: il conto è quello vero.
- **Pulsanti e parser dicono le stesse parole.** Le azioni che il luogo suggerisce
  a parole (ATTINGI al pozzo e alla sorgente, GETTA CIBO alla serra, CURATI con le
  medicine, ATTACCA il cane, MINACCIA Vito) sono anche pulsanti, e compaiono solo
  dove servono. «Usa…» compone `usa X su Y` scegliendo le due cose (da una cosa
  della bisaccia, da una del luogo, o dal pulsante generale). Le parole in
  maiuscolo del testo si toccano: un'uscita ci porta là, una cosa apre il suo menu.
  Accanto agli sguardi: `guarda`, `aspetta`.
- **↶ annulla** accanto al campo dei comandi (Ctrl+Z col campo vuoto). Le domande
  di conferma del motore («Vuoi davvero chiudere la partita?») hanno i loro sì e no.

### Cambiato
- **`mangia` e `bere` soli funzionano**, e così `mangia cibo`, `mangia una
  porzione`, `bevi acqua`, `bere acqua`, `bevi un sorso`, `bevi 2`, `mangia 3`… La
  forma vecchia `mangia qualcosa` resta valida (è dentro i salvataggi già fatti). I
  suggerimenti del testo dicono MANGIA.
- La bisaccia ha sempre lo stesso ordine (quello della storia); prima cambiava a
  ogni partita.
- «esci» e «sì» digitati riportano all'intro, invece di mostrare la schermata di
  fine viaggio.

## [1.2.0] - 2026-09-29

### Cambiato
- **Motore FAVELLA 1.4.0** al posto della 1.2.1: è la stessa versione che fa
  girare *Il Viaggiatore* sul sito di FAVELLA. La storia non cambia.
- **I comandi non capiti non fanno passare il tempo.** Un refuso, un verbo
  sconosciuto o un oggetto che non c'è non consumano più un turno, e quindi
  nemmeno un sorso d'acqua o un boccone.
- **Più verbi e più direzioni**: `aspetta` (`z`), `x`, `l`, `su`, `giù`, `entra`,
  `sali`, `scendi`, `tocca`, `spingi`, `tira`, `annusa`, `ascolta`, `dai`,
  `mostra`, `indossa`, e altri. `prendi tutto`, `prendi la mappa e il coltello`.
- **Messaggi in italiano più corretto** («Preso: la mappa.»). `esci` e
  `ricomincia` chiedono conferma prima di chiudere la partita o azzerarla.
- Le regole scritte per un verbo valgono anche per i suoi sinonimi
  (`posa la tanica` rispetta la regola della tanica come `lascia la tanica`).
- I salvataggi delle versioni precedenti si caricano: vengono rigiocati sul
  motore nuovo e, se contenevano comandi non capiti, la partita ricostruita ha
  meno turni di prima. Il gioco lo dice già al caricamento.

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
