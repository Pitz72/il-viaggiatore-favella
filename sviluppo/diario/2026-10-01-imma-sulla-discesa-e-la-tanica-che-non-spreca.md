---
data: 2026-10-01
ora: "07:16"
titolo: "Imma sulla discesa e la tanica che non spreca"
tipo: sessione
versione: 1.7.0
---

# Imma sulla discesa e la tanica che non spreca

## In breve
Il banco di gioco ha misurato due cose che i collaudi non vedevano: il giocatore attento non sceglie mai niente fra la statale e il mercato, e un baratto d'acqua con la tanica quasi piena la spreca senza dirlo. Ora c'è Imma, sulla discesa, che chiede da mangiare; l'anteprima dice il tetto della tanica; Ciro non paga in acqua quando non c'è posto.

## Contesto
Dopo la 1.6.1 (il banco nel repo) restavano aperte due domande dalla voce di diario «Tre partite giocate a mano»: l'acqua oltre la tanica, e la paura del giocatore attento. L'autore ha chiesto la strada A più la strada B per l'acqua, e di scegliere io la migliore per la paura, «non pigra, in favore di una storia ricca».

Misure del pilota (`strumenti/gioca.py --pilota`, dodici semi, B_cavallo, agli avvisi):

| | al casello | alla piazzetta | al mercato | pasti | cibo avanzato a fine partita |
|---|---|---|---|---|---|
| attento (sete 6, fame 7) | 4 | 2 | 2 | 5 | 5 |
| beve e mangia tardi (9, 11) | 5 | 4 | 4 | 4 | 6 |

Cinque porzioni inutilizzate a fine partita, vita sempre 10, cibo mai sotto 2. Il margine nel tratto statale–mercato è di due porzioni, ma nessuno lo sa e nessuno lo spende. E lo spreco d'acqua vero, sui quattro percorsi, cade nei rifornimenti gratuiti (la pompa, la sorgente); negli scambi di Ciro solo se si arriva con la tanica piena.

## Lavoro fatto
- **L'anteprima applica i tetti** (`app/src/lib/ponte.py`, `_applica_i_limiti`). Riconosce dalla forma i demoni «Ogni turno se … X diventa N» (la tanica a 10, la sete non sotto 0) e li applica sulla copia del mondo. L'anteprima restituisce `dopo` già limitato e `sprecato` (`{acqua: 3}`). Nessun numero ripetuto a mano in TypeScript.
- **La conferma lo dice** (`azioni.ts`, `Conferma.tsx`): «4 d'acqua (ne entra 1)», «La tanica tiene 10: 3 d'acqua andrebbero persi», «La tanica è già piena (10): quest'acqua andrebbe persa».
- **Ciro** (`z5-paese.fav`): le opzioni che danno solo acqua (orologio, batteria, stecca, cartucce) compaiono se l'acqua lascia posto o se hai la damigiana; altrimenti la stessa merce vale cibo («La tanica non ha posto: ti do l'orologio per del cibo»). Nunzio non serve: al bar la tanica non supera 6.
- **Imma** (`z4-statale.fav`, `z5-paese.fav`): donna del vicolo dietro la piazzetta, tornata dal casello dopo aver lasciato a Vito l'ultimo pane. Siede sulla discesa, ultimo luogo prima del paese, e chiede da mangiare. Due porzioni (o l'ultima) valgono un dono, una volta sola. Si può rifiutare e ripensarci. Parla di sé, di Vito («mi ha chiamata sorella»), del paese. Se hai fame anche tu lo vede.
- **La voce corre in due sensi**: sfamata, la ritrovi in osteria. Senza sangue: la fiducia di Rosaria sale di uno. Col sangue: Imma parla per te davanti ai due uomini scesi dalla statale, la fiducia non cala, Rosaria si siede. Se la sfami dopo essere stato in osteria, la ritrovi lì lo stesso.
- Due percorsi in `percorsi.py` (`I_imma`, `J_imma_sangue`), con i loro finali attesi in `finali.py`. `fili.py`: 25 prove nuove. `interfaccia.py` e `conferme.py`: il tetto nella conferma.
- Documenti: `03-mappa.md`, `04-oggetti.md`, `05-personaggi.md` (la scheda di Imma), `06-ramificazione.md` (§3.5), `02-sistemi.md`, la mappa narrativa rigenerata, `collaudo/LEGGIMI.md`. Il numero dei personaggi è 14 (README, trailer, presentazione).

## Decisioni
- **Imma, e non meno cibo o la fame che si vede** — perché le altre due proposte non danno una scelta: tagliare il cibo prima del tratto sposta l'economia di tutta la prima metà per ottenere un disagio che nessuno decide; la fame che si vede dà atmosfera, non paura. Imma chiede una scelta con un costo, nel punto in cui le scorte stringono, e la risposta torna in osteria e al guado.
- **Sulla discesa, non sulla statale a monte** — perché è l'ultimo luogo di Z4 e tutti ci passano, per il casello come per il sottopasso. Una persona su una piazzola si poteva evitare senza accorgersene.
- **Due porzioni, o l'ultima** — perché chi ha una porzione sola non deve sentirsi escluso: dà tutto quello che ha, e vale come dono. Il costo relativo è lo stesso.
- **Il dono conta per la generosità, soglia ancora tre** — perché con quattro doni nessuno è gratis né obbligato (Saverio costa cibo, Rosaria acqua, Pasquale le medicine, Imma due porzioni). Il problema della 1.6.0 era un dono gratuito per tutti (Iole); qui non c'è. Chi tiene le medicine per sé può arrivare a tre con Imma.
- **Rifiutare non ha conseguenze, ma lei resta lì** — perché «scelte che fanno male» non vuol dire punire: la risposta di Imma («Lo dicono tutti, e quasi tutti hanno ragione») basta, e chi torna con il cibo di Ciro la trova.
- **Imma non dice che cosa fare, ma che cosa succede** — perché i personaggi non sono oracoli. Dice come Rosaria accoglie chi arriva con qualcosa addosso, e che il ragazzo della piazzetta chiederà di essere portato via: dà il sospetto, non la regola.
- **Ciro in cibo solo per le merci che danno solo acqua** — perché la benzina (acqua e cibo) e l'anello (il prezzo più alto) lasciano comunque il resto a chi lo vuole; per loro basta l'anteprima.

## Verifiche
Compilazione riuscita con un avviso (quello voluto di «colpisci»). `finali.py` 13/13 (10 percorsi, 3 morti), copertura 9/9; `pulsanti.py` 10/10 (i due percorsi nuovi giocati senza tastiera); `mirate.py` tutte; `fili.py` 60; `giocate.py` 34; `interfaccia.py` 59; `scorte.py`; `conferme.py` 92 scelte; `salvataggi.py` 16 partite, 20 ricaricamenti identici; `esploratore.py` 100 partite, nessuna anomalia, 51/60 nodi di dialogo (fra i mancati `imma_mangia` e `imma_vicolo`, rami che il caso raggiunge di rado, come l'anello di Ciro).

Equilibrio col pilota, dodici semi, percorso `I_imma` (con Imma sfamata) contro `B_cavallo`:

| Chi gioca | B_cavallo | I_imma |
|---|---|---|
| agli avvisi (6, 7) | 12/12, vita min 10, cibo min 2 al mercato | 12/12, vita min 10, **0 di cibo dalla piazzetta**, 6 turni a cibo 0 |
| un poco dopo (8, 10) | 12/12, vita min 10 | 12/12, vita min 10 |
| mangia solo quando è debole (6, 11) | 12/12, vita min 7 | 12/12, vita min 7 |
| beve solo quando fa male (9, 11) | 12/12, vita min 5 | 12/12, vita min 5 |

Letta a mano (la partita attenta, con Imma): al turno 45 cibo 3 e fame 5; dopo Imma cibo 1; al vicolo mangia l'ultima porzione, cibo 0, fame 4; al mercato tratta con Ciro a mani vuote («Hai 6 d'acqua e 0 di cibo») e ottiene due di cibo con la carta di Vito; in osteria Rosaria lo sfama comunque, e Imma è già al tavolo.

## Questioni aperte
- Strada B solo per quattro merci: l'anello e la benzina restano affidati all'anteprima. Se giocando sembra poco, la regola è la stessa (acqua al massimo 10 − N).
- La fame che si vede è rimasta una sola frase (Imma). Il resto del tratto è ancora silenzioso se non si incontra lei.
- Il pulsante «Tieni, mangia» chiede conferma come ogni dono («Vuoi davvero rinunciarci?»); la formula è quella dei doni e non dice «dai da mangiare». Si può rifinire insieme al resto dei messaggi.
- Imma non compare nel finale. Un'eco alla soglia (il vicolo, la scarpa allacciata) si può valutare con gli altri fili (§8).
