# IL VIAGGIATORE — Schede personaggio

> Pre-produzione · Strato 5 di 6 · **v1.0, allineato al gioco (23/09/2026)**
> **14 personaggi**: 5 maggiori (con un contatore di fiducia), 8 minori, e Cosimo (Imma dalla 1.7.0).
> In più il cane della serra, che non parla ma pesa.
> Principio: ogni personaggio ha un **desiderio proprio**, indipendente dal
> protagonista. Nessun **oracolo**: le informazioni sono parziali, interessate, e la
> verità sulla famiglia si compone da più voci, mai da una sola.

---

## 1. Il tema fatto persone

I cinque maggiori sono cinque risposte alla stessa domanda: *restare o andarsene, e a quale prezzo*.

| Maggiore | Zona | Risposta al tema |
|---|---|---|
| Saverio | Z2 | **CUSTODIRE**: resta per difendere ciò che è suo |
| Iole | Z3 | **ASPETTARE**: resta accanto a una macchina morta, per qualcosa che non torna |
| Vito | Z4 | **PREDARE**: vive di chi passa |
| Rosaria | Z5 | **RESTARE**: tiene acceso un focolare perché il paese non si spenga |
| Onofrio | Z6 | **RINUNCIARE**: si è ritirato da tutti, ha smesso di scendere a valle |

**Cosimo** (Z7) è la risposta più dolorosa, ed è di famiglia: è rimasto a chiudere gli occhi a tutti. **Peppe** (Z5) è il rovescio del protagonista: il **PARTIRE**.

---

## 2. Schede

### — MAGGIORI —

#### SAVERIO — il pozzo · Z2
- **Voce:** poche parole, sentenze. Diffida di tutto ciò che cammina.
- **Vuole:** che il pozzo non muoia. «Questo pozzo non è una fontana.» Non se n'è andato perché il pozzo è suo padre e suo figlio.
- **Meccanica:** fiducia 1. Un dono di cibo (+2) gli fa abbassare la guardia e apre `attingi`: +5 d'acqua la prima volta, poi solo fango.
- **Il costo:** il cibo che gli dai è il cibo che non avrai sulla sterrata.

#### IOLE — la diga · Z3
- **Voce:** lenta, precisa, parla alle cose più che a te. Tiene una mano sul volano della pompa come si tiene la mano a chi sta male.
- **Vuole:** che l'acqua torni a scorrere dalla diga. Aspetta, un'acqua o una persona: non è chiaro nemmeno a lei.
- **Meccanica:** fiducia 1. Spiega come si fa («Si filtra, poi si tratta»), ma finché non le hai dato acqua o cibo (+2) non ti lascia entrare nel casotto, dove ci sono le pastiglie e la damigiana: «in casa mia non entra chi non conosco».
- **Anti-oracolo:** sa molto del meccanismo, quasi niente di casa tua.

#### VITO — il casello · Z4
- **Voce:** affabile e minaccioso insieme. Ti chiama «amico» prima ancora di sapere il tuo nome.
- **Vuole:** tenere il suo pezzo di strada. Non è crudele: ha trovato una rendita e la difende.
- **Meccanica:** vita 7, fiducia 1. Si paga (stecca, benzina, 3 d'acqua: +1 fiducia, e lascia il lasciapassare sul bancone), si bluffa con la pistola scarica, si batte (col suo tubo di ferro risponde a ogni turno), o si aggira dal sottopasso.
- **Funzione:** la prova generale del guado. Qui il giocatore impara che la via violenta esiste e costa.
- **Il bluff lo ferisce nell'orgoglio** (1.10.0): se gli punti la pistola scarica e se ne accorge dopo, lo racconta a chi passa («lo racconto bene»). Chi torna al casello lo sente; la voce arriva a Ciro, a Tore e a Cosimo (`06-ramificazione.md` §3.7).

#### ROSARIA — l'osteria · Z5
- **Voce:** calda ma stanca. L'ospitalità come ultima economia: la prima volta ti mette davanti acqua e legumi prima che tu apra bocca.
- **Vuole:** che il paese non si spenga. Sa il nome di chi è partito, e a qualcuno tiene ancora il posto.
- **Meccanica:** fiducia 1; +1 per un dono d'acqua, +2 se curi Pasquale; −1 se arrivi col sangue addosso (la voce della statale arriva prima di te: ti accoglie lo stesso, ma non si siede). A 3 scrive il **permesso** per le colline. Se hai sfamato Imma sulla discesa, in osteria c'è già lei: senza sangue la fiducia sale di 1, col sangue non cala e Rosaria si siede. Dà **la notizia**: Acquamorta è vuota «tranne uno», che non lascia entrare nessuno.
- **Anti-oracolo:** ti dice che c'è qualcuno, non chi è: «Chiedi a Concetta.»

#### ONOFRIO — la grotta · Z6
- **Voce:** asciutta, a scatti; intaglia anche al buio. Conobbe la tua famiglia.
- **Vuole:** essere lasciato in pace. «Io non do niente a chi non so chi è.»
- **Meccanica:** fiducia 1. Il giocattolo o il santino (+2 ciascuno) gli aprono la bocca: racconta dei soldi che non si bevono, della febbre, del piccolo e poi di lei, e di Cosimo che li ha messi sotto terra. Poi offre il **lascito**, una cosa sola: la lettera che Cosimo non spedì **oppure** il fucile.
- **Anti-oracolo:** non ti dice cosa fare al guado. Ti mette in mano la scelta.

### — IL FRATELLO —

#### COSIMO — il guado · Z7
- **Chi è:** tuo fratello, quello che è rimasto. Ha scritto lui il biglietto in stampatello: «Non è il caso di tornare.»
- **Perché tiene il guado:** «Io sono rimasto a chiudere gli occhi a tutti, qui. Tu eri al sicuro, lontano.» Tratta il tuo ritorno come un tradimento.
- **Meccanica:** nessun contatore di vita. Tre stati: *fermo*, *riconosciuto*, *abbattuto*.
  - **Via umana:** `usa la lettera su Cosimo`. Riconosce la sua grafia; si fa da parte.
  - **Via violenta:** `attacca Cosimo` col fucile. Non scappa, non implora.
  - **Terza via** (dal gioco 1.5.0): col fucile, `lascia il fucile`. Se per strada non c'è stato sangue e hai lasciato qualcosa ad almeno tre di quelli che sono rimasti, riconosce il gesto e si sposta; altrimenti bisogna restare disarmati (la veglia: tre turni, cinque se c'è stato sangue). Vedi `06-ramificazione.md`.
  - Mostrargli il biglietto o attaccarlo a mani nude non sposta niente (e a mani nude, durante la veglia, la rompe).
  - **Sa come sei arrivato**: la voce corre dalla strada al greto (Rosaria, i pastori). La sua prima battuta cambia col sangue e con la generosità.
- **Scrittura:** la via umana va *guadagnata* lungo tutto il viaggio (Concetta o la cappella, poi Onofrio). Non è un'opzione di menu.

### — MINORI —

#### NUNZIO — il bar · Z1
Tiene aperto per testardaggine, la camicia stirata anche adesso che non viene più nessuno. Baratta l'orologio per acqua, acqua per cibo, un sorso per un'ora di fatica. Indica la strada: «Ma serve una mappa, e acqua.»

#### ROCCO — il fondale · Z3
Raccoglie sale a mani nude, le labbra spaccate. Beve salmastro di nascosto: è il monito vivente di `bevi salmastra`. Il sale che raccoglie è moneta, e i cristalli si possono prendere.

#### PEPPE — la piazzetta · Z5 (con la domanda sul sangue dalla 1.10.0)
Diciassette anni, le scarpe sbagliate per camminare. Vuole venire via con te.
- **Portarlo:** ti aspetta sulla salita e diventa *compagno*. Divide con te acqua e cibo (ogni tanto un sorso, un boccone) e parla lungo le colline.
- **Lasciarlo:** resta in paese.
- **Il sangue:** se arrivi con le mani sporche, Peppe lo sa e te lo chiede una volta sola («Io voglio saperlo da te, non da loro»). Tre risposte: la verità, una bugia, o niente. Non cambia se viene né i finali; cambia come cammina con te sul valico, al guado e allo sparo (`06-ramificazione.md` §3.8).
- **Al guado:** se abbatti Cosimo, Peppe scappa senza voltarsi. Se lo riconosci, Peppe aspetta al cancello, e il finale è suo.

#### CIRO — il mercato · Z5
Svelto d'occhi e di mani. Non vuole amicizia: vuole fare affari. Compra quasi tutta la merce raccolta in Z3 e Z4, «la carta di Vito», e l'anello (il prezzo più alto del gioco). Se hai bluffato Vito lo sa già («Quello della pistola»): Vito è passato a raccontarlo. Cambia anche l'acqua in cibo, al suo prezzo (3 per 2). Se la tanica non ha posto (acqua dall'8 in su, e senza damigiana) non paga più in acqua l'orologio, la batteria, la stecca e le cartucce: le stesse merci valgono cibo (1.7.0).

#### PASQUALE — il vicolo · Z5
Un uomo giovane invecchiato dalla febbre. Non chiede: gli brucia troppo l'orgoglio. Le medicine su di lui lo salvano, e Rosaria lo viene a sapere (+2 fiducia). Tenerle per sé è legittimo: sono l'unica cura rapida del gioco.

#### CONCETTA — il cortile · Z5
Tanto vecchia che il tempo, su di lei, sembra essersi seduto. Ti riconosce e poi no. Ricorda i due fratelli da bambini; sulla disgrazia tace («Vacci, e guardala tu, la casa»). Ti spinge verso il davanzale: «Pìgliati il cavallo di legno. Era vostro.»

#### TORE — il pianoro · Z6
Conta le pecore a mezza voce anche mentre ti parla. Formaggio in cambio d'acqua (2 d'acqua per 3 di cibo). Sul guado dice quello che si dice giù al paese («Tuo fratello, dicono. Io non chiedo»), e manda da Onofrio: «se gli porti qualcosa di casa tua».

#### IMMA — la discesa · Z4 (dalla 1.7.0)
Una donna sui cinquant'anni, tutta tendini dentro una camicia da uomo. Abita nel vicolo dietro la piazzetta, di fronte a Pasquale. È andata oltre il casello a vedere se c'era ancora qualcosa («C'è la statale»), e per tornare ha lasciato a Vito l'ultimo pane: lui l'ha chiamata «sorella». Siede sul guardrail con una scarpa slacciata che non si china ad allacciare.
- **Funzione:** è l'unico incontro che chiede *cibo* e lo chiede dove le scorte del giocatore attento sono più basse (la discesa, a undici turni dal pasto che Rosaria offre). È un altro che torna a casa, come te, e non ci arriva.
- **Voce:** secca, senza scuse e senza pietà di sé. Non chiede l'acqua («in paese qualcuno ne dà sempre»). Se hai fame anche tu, lo vede; se non hai niente, lo capisce da come cammini.
- **Meccanica:** nessuna fiducia. Due scelte che costano (due porzioni, o l'ultima che hai) e una che non costa («Non posso. Mi dispiace.»: lei resta lì, e puoi ripensarci). Dare vale un dono (la generosità, una volta sola). Parla di sé, di Vito («mi ha chiamata sorella») e del paese (Rosaria ti siede o ti serve in piedi, e il ragazzo della piazzetta ti chiederà di portarlo via: «digli di sì o di no, ma subito»). Non dice che cosa fare.
- **Il ritorno:** sfamata, arriva in osteria prima di te. Se hai addosso il sangue, parla per te davanti ai due uomini scesi dalla statale: Rosaria non ti toglie la fiducia e alla fine si siede. Se no, la fiducia di Rosaria sale di uno. In osteria dice, se Pasquale è ancora malato, che non l'ha mai sentito lamentarsi, ed è questo che le fa paura.

### — L'ANIMALE —

#### IL CANE — la serra · Z2
Rimasto solo e tornato mezzo selvatico, difende le casse di conserve come fossero cuccioli. Vita 5. Lo si distrae con un boccone, lo si abbatte, o lo si lascia. Abbattuto, la descrizione non lo dimentica: «Difendeva l'unica cosa che gli era rimasta.»

---

## 3. Chi tiene cosa

| Personaggio | Dà | Chiede | Porta la verità su |
|---|---|---|---|
| Nunzio | acqua, cibo | l'orologio, acqua, fatica | la strada |
| Saverio | acqua del pozzo | cibo, fiducia | — |
| Iole | l'accesso al casotto | acqua o cibo | come si rende potabile l'acqua |
| Rocco | — | — | cosa fa la disperazione |
| Vito | il passaggio, il lasciapassare | pedaggio, bluff o botte | — |
| Imma | di Vito, del paese, di chi parla in osteria | da mangiare | come corre la voce |
| Rosaria | accoglienza, il permesso | fiducia, Pasquale curato | **la notizia su Acquamorta** |
| Peppe | compagnia | acqua e cibo, lungo la strada | il rovescio del tema |
| Ciro | acqua e cibo | merce, l'anello | — |
| Pasquale | fiducia di Rosaria | le medicine | — |
| Concetta | il giocattolo | ascolto | i due fratelli bambini |
| Tore | cibo | acqua | chi tiene il guado, e a chi chiedere |
| Onofrio | la lettera **o** il fucile | un ricordo di casa | **la famiglia: il piccolo, lei, le croci** |
| Cosimo | il passaggio | la lettera, o una fucilata | **il biglietto** |

Il registro (Z5) e il santino (Z6) sono le due fonti mute: dicono i nomi e le date senza commento.

## 4. I sei finali

Tutti si aprono sulla **soglia** di casa. In ordine di precedenza (scatta il primo vero):

| # | Condizione | Esito | Finale |
|---|---|---|---|
| F | Cosimo abbattuto, Peppe fuggito | terminata | «La casa è tua. Il ragazzo che ti seguiva ha visto cosa sei disposto a fare per averla.» |
| E | Cosimo abbattuto | terminata | «Sei entrato ad Acquamorta sopra il corpo di tuo fratello. La casa è tua, e non c'è più nessuno a cui dirlo.» |
| A | Cosimo riconosciuto, Peppe compagno | vinta | «Hai trovato la casa, e hai scelto di non restarci. Qualcuno, almeno, lo porti via vivo.» |
| B | Cosimo riconosciuto, hai il giocattolo | vinta | «Sei tornato, e hai riportato a casa l'ultima cosa che restava da riportare.» |
| C | Cosimo riconosciuto, hai l'anello | vinta | «Sei tornato, e le hai riportato quello che era suo.» |
| D | Cosimo riconosciuto, a mani vuote | terminata | «Sei arrivato a casa con le mani vuote, e la casa se n'è accorta.» |

Più le tre morti per strada (sete, fame, ferite), ciascuna con la sua frase.

- Con giocattolo **e** anello vince il giocattolo (B): l'anello resta in tasca, ed è giusto così.
- Ogni finale è raggiunto da una partita del collaudo (`collaudo/finali.py`), che fallisce se un finale scritto non viene raggiunto o se una partita ne produce due.

## 5. Cosa è cambiato rispetto alla bozza

- **Elia** è diventato **Onofrio**; **Aldo** è **Ciro**; **Sandro** è **Pasquale**.
- **Mimmo** (Z2) non è entrato: la piana regge da sola col pozzo e il cane.
- **Maruzza** (Z7) non è entrata: la «voce del ritorno» è la casa stessa, descritta sulla soglia diversamente per ogni finale.
- La fiducia è rimasta solo ai cinque maggiori; Vito la usa poco, e va bene così: con lui conta il modo in cui passi, non l'affetto.
- I finali previsti erano 3–4; sono diventati sei perché Peppe, i ricordi di casa e il lascito di Onofrio si incrociano davvero.
