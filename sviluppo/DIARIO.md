# Diario di sviluppo

Come e perché il gioco è arrivato fin qui: una voce per sessione di lavoro,
decisione o problema. Il *cosa* fra due versioni sta in `CHANGELOG.md`; le
regole delle versioni in `sviluppo/VERSIONI.md`.

Nuova voce: `node strumenti/diario.mjs nuovo "Titolo" --tipo sessione`.
Questo indice si rigenera da sé (`node strumenti/diario.mjs indice`).

| Data | Tipo | Versione | Voce |
|---|---|---|---|
| 2026-10-01 | sessione | 1.6.1 | [Il banco di gioco nel repo](diario/2026-10-01-il-banco-di-gioco-nel-repo.md) — Il banco con cui si sono giocate le tre partite a mano stava nella cartella temporanea di una sessione ed è andato perso. Ora è `strumenti/gioca.py`: si gioca a mano da un file di comandi e si misura l'equilibrio su più semi. |
| 2026-10-01 | sessione | 1.6.0 | [Tre partite giocate a mano](diario/2026-10-01-tre-partite-giocate-a-mano.md) — Tre partite intere, giocate leggendo il testo come un giocatore, hanno trovato quello che i collaudi non vedevano: una porta che dal paese non si ritrovava, le parole del guado non capite, ferite che non guarivano mai. Corretto tutto; l'equilibrio di sete e fame non era punitivo per chi ascolta il corpo, ma ogni ferita restava per sempre. |
| 2026-09-30 | sessione | 1.4.0 | [I fili del viaggio e la terza via al guado](diario/2026-09-30-i-fili-del-viaggio-e-la-terza-via-al-guado.md) — Due fili attraversano il viaggio, il sangue e la generosità, e al guado chi ha il fucile può posarlo: allora decide com'è stato il viaggio. Le conseguenze a distanza passano da 2 a 6, i sei finali restano, ma ci si arriva per più strade. |
| 2026-09-30 | decisione | 1.4.0 | [La mappa narrativa e il progetto dei fili](diario/2026-09-30-la-mappa-narrativa-e-il-progetto-dei-fili.md) — Uno strumento nuovo misura la memoria della storia: 19 variabili su 21 si spengono nella zona in cui nascono, solo Peppe viaggia. Il progetto per ramificare davvero è in `pre-produzione/06-ramificazione.md`, in attesa di decisioni. |
| 2026-09-30 | sessione | 1.3.0 | [Usare una cosa su un'altra, con i pulsanti](diario/2026-09-30-usare-una-cosa-su-un-altra-con-i-pulsanti.md) — I pulsanti non propongono più ogni combinazione di cose: il motore dice quali «usa X su Y» la storia prevede qui e adesso, e solo quelle diventano pulsanti. Un collaudo nuovo gioca i sei finali senza tastiera. |
| 2026-09-29 | sessione | 1.2.0 | [Il trailer ridipinto](diario/2026-09-29-il-trailer-ridipinto.md) — Il trailer d'apertura è ridipinto da cima a fondo (stessi tempi, stessi testi, stessa musica): ogni inquadratura ha la sua materia, il viandante ha un passo vero, e tutto si prepara mentre girano i loghi. |
| 2026-09-29 | sessione | 1.2.0 | [Bere e mangiare a dosi, conferme e pulsanti allineati al parser](diario/2026-09-29-bere-e-mangiare-a-dosi-conferme-e-pulsanti-allineati-al-pars.md) — Bere e mangiare si scelgono da un pannello con le dosi; le scelte che costano chiedono conferma con il conto vero di ciò che si dà e si riceve; i pulsanti dicono le stesse parole del parser. |
| 2026-09-29 | sessione | 1.1.1 | [Allineamento al motore 1.4.0](diario/2026-09-29-allineamento-al-motore-1-4-0.md) — Il gioco passa dal motore FAVELLA 1.2.1 alla 1.4.0, la stessa versione che fa girare *Il Viaggiatore* sul sito di FAVELLA; la storia non cambia. |
| 2026-09-23 | sessione | 1.1.1 | [ANNULLA riporta indietro anche ANCORA](diario/2026-09-23-annulla-riporta-indietro-anche-ancora.md) — Il motore passa alla 1.2.1: ANNULLA ora disfa anche la memoria di ANCORA. Era |
| 2026-09-23 | sessione | 1.1.0 | [Il motore passa alla 1.2.0](diario/2026-09-23-il-motore-passa-alla-1-2-0.md) — Il gioco adotta FAVELLA 1.2.0, la prima versione del motore rilasciata dopo la |
| 2026-09-23 | sessione | 1.0.0 | [Primo rilascio: 1.0.0](diario/2026-09-23-primo-rilascio-1-0-0.md) — Pubblicata la 1.0.0: installer e portatile per Windows, AppImage e .deb per Linux. |
| 2026-09-23 | sessione | 1.0.0 | [Versioni, taccuino, loghi e aggiornamenti](diario/2026-09-23-versioni-loghi-aggiornamenti.md) — Versioni SemVer da un'unica fonte, diario di sviluppo, taccuino dei salvataggi, loghi d'apertura, aggiornamento automatico, rilascio manuale. |
| 2026-09-23 | decisione | 1.0.0 | [I salvataggi sono sequenze di comandi verificate](diario/2026-09-23-salvataggi-come-sequenze.md) — Salvare la sequenza effettiva dei comandi e un'impronta dello stato, e rigiocarla al caricamento. |
| 2026-09-23 | decisione | 1.0.0 | [Desktop: Electron invece di Tauri](diario/2026-09-23-electron-invece-di-tauri.md) — Versione desktop per Windows e Linux con Electron, repository pubblico, CI su GitHub. |
| 2026-09-23 | sessione | 1.0.0 | [Progetto autonomo e collaudo esplorativo](diario/2026-09-23-progetto-autonomo-e-collaudo.md) — Il Viaggiatore diventa un progetto a sé col motore dentro; tre collaudi dinamici. |
| 2026-09-23 | problema | 1.0.0 | [Le morti per sete e fame non dicevano la causa](diario/2026-09-23-le-morti-senza-causa.md) — Trovato dal collaudo dei finali: si moriva sempre con la frase generica. |
| 2026-09-23 | decisione | 1.0.0 | [Il posto iniziale degli oggetti entra nel motore](diario/2026-09-23-il-posto-iniziale-nel-motore.md) — FAVELLA 1.1.0 aggiunge `Il posto della X è "…".`: la frase sparisce quando l'oggetto viene preso. |
| 2026-09-23 | sessione | 1.0.0 | [Il trailer e la nuova interfaccia di gioco](diario/2026-09-23-trailer-e-interfaccia.md) — Un trailer di 88 secondi a un solo orologio e un'interfaccia che si legge come un libro. |
| 2026-09-23 | sessione | 1.0.0 | [Revisione narrativa e di gameplay](diario/2026-09-23-revisione-narrativa-e-gameplay.md) — La prosa ripulita dai tic da testo generato; sei finali; nessun vicolo cieco d'acqua. |
| 2026-06-20 | sessione | 1.0.0 | [Il gioco completo: sette zone in FAVELLA](diario/2026-06-20-il-gioco-completo.md) — Scritte e collegate le sette zone: il gioco si vince da capo a fondo. |
