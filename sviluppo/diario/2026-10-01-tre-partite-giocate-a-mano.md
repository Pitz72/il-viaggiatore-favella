---
data: 2026-10-01
ora: "03:15"
titolo: "Tre partite giocate a mano"
tipo: sessione
versione: 1.6.0
---

# Tre partite giocate a mano

## In breve
Tre partite intere, giocate leggendo il testo come un giocatore, hanno trovato quello che i collaudi non vedevano: una porta che dal paese non si ritrovava, le parole del guado non capite, ferite che non guarivano mai. Corretto tutto; l'equilibrio di sete e fame non era punitivo per chi ascolta il corpo, ma ogni ferita restava per sempre.

## Contesto
L'autore ha chiesto di non fermarsi ai collaudi e alla lettura del codice: giocare, vedere se tutto torna, se la fame e la sete puniscono troppo. Le partite si sono giocate con un banco che rimanda i comandi allo stesso ponte dell'app (`app/src/lib/ponte.py`) e mostra, sotto ogni risposta, vita, sete, fame, acqua, cibo, sangue e generosità.

1. **Attenta** (finale del cavallo, 103 turni): beve e mangia agli avvisi, aiuta tutti, prende la lettera. Mai in pericolo: vita minima 9.
2. **Violenta** (il cane ucciso, Vito a terra, il fucile posato e la veglia lunga; 78 turni): vita 2 dopo la rissa con Vito, ripresa solo con le medicine e con l'accoglienza di Rosaria.
3. **Pigra**, giocata da un pilota su dodici semi, con soglie diverse: chi beve solo quando «la testa martella» moriva sempre, fra il turno 58 e l'85, con 14 d'acqua nella tanica.

## Lavoro fatto
- **La porta del paese** (`z5`): «La porta collega ovest a la piazzetta» dava alla piazzetta l'uscita est verso la porta, e subito dopo «la piazzetta collega est a il mercato» se la riprendeva. Il testo diceva «a SUD si torna alla porta», ma a sud non c'era niente. Ora il mercato è a sud e la porta a est.
- **Le parole del guado** (`z7`, `il-viaggiatore.fav`): «spara a», «usa il fucile su», «uccidi», «ammazza», «picchia», «aggredisci», «colpisci» come «attacca»; «minaccia Cosimo» ha tre risposte sue (col fucile, con la pistola scarica che rompe la veglia, a mani vuote) e una dopo.
- **La vita che risale** (`sistemi.fav`): sotto i due avvisi (sete al massimo 5, fame al massimo 6), una volta su otto. I tetti e i pavimenti spostati in fondo a `il-viaggiatore.fav`, dopo le zone. «(BEVI.)» e «(MANGIA.)» nelle righe del danno.
- **Il cane** (`z2`): la prima volta ringhia e basta. Il testo del cibo gettato dice che prendi le conserve; «conserve» in minuscolo. Saverio si chiama anche «uomo».
- **La pompa** (`z3`) disseta; **la generosità** perde Iole (un prezzo, non un dono).
- **Il ritorno nei dialoghi**: uno «stato del discorso» per Cosimo, Onofrio, Tore, Rosaria, Ciro, Nunzio, e una battuta corta quando si torna al primo nodo. Rosaria col sangue ha la sua battuta («La fiducia no: quella si guadagna»), e il suo gesto non è più quello di Nunzio.
- **Peppe** non divide le scorte al guado, sulla strada, sulla soglia. **Ciro** cambia tre d'acqua in due di cibo. **La foto** di Acquaviva si raddrizza.
- **Ponte e pulsanti**: un gesto è un pulsante solo se la regola che scatterebbe cambia il mondo, anche senza oggetto (`attingi`, `curati`); due gesti con le stesse conseguenze sulla stessa persona, o una combinazione che farebbe lo stesso, sono un pulsante solo. `azioni.ts`: i verbi della violenza nella conferma («Vuoi davvero sparare a Cosimo?»), «Raddrizza» fra i gesti con bersaglio.
- **Collaudi**: `giocate.py` nuovo (32 prove, in CI e nel rilascio); `fili.py` (Iole, il mercato, la sete a 0 nello stesso turno), `interfaccia.py` (le nuove regole dei pulsanti, 13 prove in più), `mirate.py` (la rissa con Vito senza fermarsi a mangiare), `percorsi.py` (il mercato a sud).
- Documenti: `02-sistemi.md` (la vita che risale, con le misure), `03-mappa.md`, `05-personaggi.md`, `06-ramificazione.md`, `collaudo/LEGGIMI.md`, la mappa narrativa rigenerata.

## Decisioni
- **La ripresa sotto gli avvisi, non a pancia piena** — perché «il corpo non chiede niente» vuol dire che non ci sono avvisi, e perché la condizione vecchia chiedeva di sprecare cibo. Una volta su otto, non su sei: il percorso violento deve continuare a costare.
- **Il cane avverte una volta sola** — perché chi entra la prima volta non sa del cane, chi torna sì.
- **«Colpisci» come «attacca»**, anche se il compilatore lo segnala con un avviso (è un verbo del motore): con il fucile in mano, «colpire» vuol dire sparare, e nell'app la conferma lo chiede comunque. È l'unico avviso della compilazione, voluto.
- **Il dono a Iole fuori dalla generosità** — perché la pompa è obbligata: un dono che pagano tutti non distingue nessuno. Con quattro doni contati, la partita violenta arrivava a 3.
- **I pulsanti tacciono i «no»** — perché un pulsante che risponde «La sbarra è già su» o «Giù le mani» suggerisce un'azione che non c'è. Scrivendo, le stesse frasi restano.
- **Il mercato si sposta, la porta no** — perché tutti passano dalla porta e i salvataggi la contengono; al mercato ci va solo chi baratta.

## Verifiche
Compilazione riuscita con un avviso (quello voluto di «colpisci»). `finali.py` 11/11, copertura 9/9; `mirate.py` 8/8; `fili.py` 35/35; `giocate.py` 32/32; `interfaccia.py` 53 prove; `scorte.py`; `salvataggi.py` 16 partite, 21 ricaricamenti identici; `conferme.py` 77 scelte; `pulsanti.py` 8/8; esploratore 100 partite, nessuna anomalia. Le due partite rigiocate sul mondo nuovo: l'attenta non perde mai vita e arriva con la generosità a 3; la violenta tocca 6 dopo Vito e arriva a 10.

Equilibrio, dodici semi per modo di giocare (prima → dopo):

| Chi gioca | 1.5.0 | 1.6.0 |
|---|---|---|
| beve e mangia agli avvisi | 12/12, vita minima 8,8 | 12/12, vita minima 10 |
| un poco dopo gli avvisi (8, 10) | 12/12 | 12/12 |
| il percorso violento | 11/12, minima 2,2, finale 6,9 | 12/12, minima 4,8, finale 9,8 |
| mangia solo quando è debole (6, 11) | 12/12, finale 5,6 | 12/12, finale 5 |
| beve solo quando fa male (9, 11) | 0/12 | 12/12, finale 2,3 |

## Questioni aperte
- **Il motore**: una mossa verso un'uscita che non c'è fa passare un turno (gli altri comandi non capiti no, dalla 1.2.0); posare una cosa ristampa la stanza intera. Da segnalare a FAVELLA, non da correggere qui (`motore/` è una copia).
- **L'acqua oltre la tanica**: barattare acqua con la tanica quasi piena la spreca, e la conferma mostra il conto prima del tetto («acqua 9 → 12», poi 10). Si può far dire il tetto all'anteprima, o togliere l'opzione quando non c'è posto.
- **Il giocatore attento non è mai in pericolo**: la tensione per lui è solo nel cibo, fra la statale e il mercato. Se si vuole più paura, il posto è lì, non nella sete.
- La fiducia si può ancora comprare con l'acqua da Rosaria, un dono dopo l'altro: è la rete di sicurezza contro i vicoli ciechi, e resta.
