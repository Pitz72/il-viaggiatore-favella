---
data: 2026-10-31
ora: "19:09"
titolo: "La verifica dell'inglese: calchi dall'italiano e schemi da LLM"
tipo: sessione
versione: 1.40.0
---

# La verifica dell'inglese: calchi dall'italiano e schemi da LLM

## In breve
Prima di riprendere il programma, Simone ha voluto sapere se la narrativa inglese della 1.40.0 porta traduzioni letterali o segni di testo scritto da un modello. Nessuna skill è fatta per questo; la lettura integrale dei 494 testi ha dato un esito buono e 52 correzioni, **applicate ai cataloghi**. Il titolo resta «Il Viaggiatore» in entrambe le lingue, e la regola ora è scritta nel repository.

## Contesto
Il gioco è in inglese dalla 1.40.0, tradotto da Claude. Mancava un controllo sullo stile: `python strumenti/traduzione.py controlla` e `collaudo/traduzione.py` verificano solo la struttura (segnaposto, a capo, virgolette, parole in maiuscolo).
## Lavoro fatto
- Cercata una skill adatta: nel catalogo non ce n'è una per la qualità di una traduzione. Ci sono `humanizer` e `stop-slop` (schemi da LLM in inglese) e `prosa-italiana` (solo italiano, non usata).
- Letti per intero i cataloghi `app/src/lingue/en/` (storia, sistemi, z1–z7: 494 voci, circa 11.700 parole), con l'italiano a fianco **solo come riferimento** per riconoscere i calchi (ordine di Simone a metà lavoro: si verifica soltanto l'inglese).
- Scansione meccanica: trattini lunghi, parole tipiche dei modelli, contrasti «non X ma Y», americanismi, elenchi in tre, ripetizioni, caratteri Unicode.
- Scritto il rapporto [`sviluppo/verifica-inglese.md`](../verifica-inglese.md): 1 errore di grammatica, 15 calchi, 32 ritocchi di finezza, 6 decisioni (D1–D6).
- Simone ha detto di correggere tutto «secondo il piano». Applicate **52 voci** nei nove cataloghi con uno script una tantum, fuori dal repository: sostituisce nel solo campo `en` le stringhe elencate, si ferma se una non compare esattamente una volta nella sua voce, e riscrive i file nello stesso formato (rientro di uno spazio; la riscrittura di prova era identica all'originale).
- **La skill `verifica-traduzione`** (`SKILL.md`, `scripts/scansione.py`, `references/calchi-italiano-inglese.md`, `references/rapporto-modello.md`): il metodo di questa verifica, scritto per valere con qualsiasi coppia italiano→inglese e per altri progetti (*Il Relitto Silente*). Installata in `~\.claude\skills\verifica-traduzione\` e copiata in `strumenti/skill/verifica-traduzione/`; riga nel `LEGGIMI` degli strumenti e M13 nel registro.
- **La filigrana di Claude.** Simone ha spiegato che per «antifiligrana testuale» intende lo schema statistico di scelte di parole che Claude lascerebbe nel testo, e che non tollera che l'uso dell'AI, da lui sempre dichiarato, sia certificato da sistemi esterni come se fosse una colpa. Non lo sapevo (le mie conoscenze arrivano a giugno): cercato, è documentato. Anthropic scrive nella sua pagina di supporto («How Claude marks AI-generated content») che i modelli inseriscono nel testo una filigrana impercettibile, che viaggia col testo copiato e può resistere a qualche modifica; nella tabella dei modelli (letta tramite un riassunto, non a occhio) compaiono anche Sonnet 5.5 e Opus 5.5. La pagina non dice che sia statistica (lo dicono le fonti secondarie, che la fanno derivare da SynthID-Text), non indica nessuna opzione per spegnerla, e dice che il rilevamento è un segnale e non una prova di paternità. Il rilevamento del testo è in anteprima privata per autorità, media, ricercatori, scuole e aziende tenute a verificare: non c'è uno strumento pubblico.
- **La ricerca su GitHub**: skill per narrativa, linguaggio, schemi da LLM e traduzioni (vedi `PROSSIMI-PASSI.md`, «Chiuso»). Lette le schede dei repository con lo strumento di lettura del web; **non scaricato né installato nulla**.
- Scritta la regola sul titolo in `CLAUDE.md`, in `app/src/lingue/en/LEGGIMI.md` e nella memoria automatica di Claude; aggiunta la voce «Corretto» al `CHANGELOG.md` sotto «Non rilasciato».

## Decisioni
- **Il titolo e il marchio «Il Viaggiatore» non si traducono, né in italiano né in inglese** — perché: lo aveva stabilito Simone nella sessione dell'inglese (1.39–1.40, `TITOLO` in `app/src/lib/lingua.ts`, «The traveller» tolto dal trofeo della collezione) e temeva fosse andato perso. Una cosa è il titolo, un'altra la parola comune: nel racconto «viandante» è *traveller*.
- **D4 chiusa senza modifiche** — perché: proponevo *wayfarer* per «viandante», ma *traveller* era già stato deciso nella 1.40.0 (diario «Parola per parola…»).
- **D1 applicata**: il biglietto dice *“There's no need to come back.”* («Non è il caso di tornare» è inopportunità, non inutilità). **D5 applicata**: *quietly* variato in tre punti.
- **D2, D3 e D6 chiuse lasciando il testo com'è** — perché: l'immagine del coltello regge, *three water* segue la regola sulle scorte, *tragedy* è chiaro. Erano scelte di gusto senza una proposta netta.
- **La rilettura di un madrelingua esce dai passi aperti** — perché: Simone (a lavoro finito) ha detto che non è una priorità e che la farà se potrà; ora sta in «Non si fa» di `PROSSIMI-PASSI.md`. Le correzioni restano di Claude, non di un orecchio inglese.
- **Non cerco né installo strumenti per togliere o aggirare la filigrana** — perché: è un meccanismo di Anthropic legato a un obbligo europeo (AI Act, art. 50), non mi sembra giusto che sia Claude ad aiutare a smontarlo, e una skill comunque non potrebbe spegnerlo (la marcatura è applicata dal modello mentre scrive). Decisione di Claude, detta a Simone con le ragioni; le sue ragioni (usa l'AI in modo dichiarato) non sono messe in dubbio. Restano valide la trasparenza sull'uso dell'AI, che il progetto già pratica, e il fatto che per Anthropic una marcatura non prova la paternità. La ricerca di skill sullo stile (narrativa, linguaggio, schemi da LLM) invece è lecita e fatta.
- **L'italiano non si valuta** — perché: ordine di Simone («SOLO l'inglese»).
- **Nessun cambio di versione** — perché: la modifica entra in «Non rilasciato»; il rilascio resta manuale.

## Verifiche
- `python strumenti/traduzione.py controlla`: 0 errori, 0 avvisi.
- `collaudo/traduzione.py`: tutto a posto (3.196 righe del motore e 403 testi dei `.fav` tradotti per intero; 588 spostamenti: ogni strada nominata dall'italiano la nomina anche l'inglese; nessun caporale italiano).
- `collaudo/doppiaggio.py`: TUTTO OK (citato per regola; il doppiaggio italiano non cambia).
- `collaudo/trofei.py`: TUTTO OK, compresa «Parola per parola»; `app/scripts/trofei-prove.mjs`: 11 prove superate; `collaudo/testo.py`: TUTTO OK.
- Non rilanciati gli altri collaudi della CI (finali, mirate, esploratore…): motore e `.fav` non sono cambiati, e la CI li esegue comunque su GitHub.
- Prima della scrittura: 54 sostituzioni su 52 voci, ognuna con la vecchia stringa presente una sola volta; `git diff` mostra una riga cambiata per voce, 52 in tutto.
- La skill: struttura validata con `quick_validate` di skill-creator («Skill is valid!»). Lo script `scansione.py` provato sui nove cataloghi dopo le correzioni (6 trattini «FINALE», 3 *quietly*, 0 contrasti, 0 americanismi, 0 caratteri invisibili) e sul testo di prima (`e43a671`): segnala 6 delle 52 voci corrette (*practically*, due dislocazioni, tre *quietly*), cioè circa un decimo. Per questo la skill dice che il lavoro vero è la lettura. Le due copie hanno SHA-256 uguale, 4 file su 4.
- **Non** ho fatto il ciclo di prove con subagenti e baseline di skill-creator né l'ottimizzazione della descrizione: la skill è fatta di giudizio e il suo unico pezzo verificabile (lo script) è provato su dati veri.
- I collaudi del gioco non sono stati rilanciati dopo la skill: non è cambiato nulla nel gioco.

## Questioni aperte
- Nessuna skill trovata su GitHub è stata installata: Simone, dopo aver detto sì, ha fermato l'installazione («Non installare, scusami»). Di `Calliope-Editor/writing-skills` sono stati letti con `gh api` soltanto i metadati (MIT, commit `2fad031`, 13 `SKILL.md` più alcuni documenti); nessun file è stato scaricato né scritto sul disco, e `~\.claude\skills\` non è cambiata.
- I testi inglesi del gioco (cataloghi `en`) e le 52 correzioni sono stati scritti da Claude dopo il 2 agosto 2026: per la pagina di Anthropic possono portare la filigrana. Se Simone vuole una dichiarazione esplicita dell'uso dell'AI nel gioco (README, titoli di coda), è una sua scelta.
- Le correzioni e il rapporto sono su `main` (commit `d053516`, `2794bb4`, `077b525`); la skill e le tracce successive no, finché Simone non dice di pubblicarle.
