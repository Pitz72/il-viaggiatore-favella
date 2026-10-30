# La traduzione inglese

Il motore e i `.fav` restano in italiano: il gioco li fa girare come sempre e traduce il testo che il
motore stampa nel momento in cui lo mostra (`app/src/gioco/traduci.ts`). Qui stanno i cataloghi:

| File | Che cosa |
|---|---|
| `storia.json`, `sistemi.json`, `z1.json` … `z7.json` | un testo dei `.fav` per voce: `it` com'è scritto nel `.fav`, `en` la traduzione (`""` se manca), `tipo` (descrizione, posto, messaggio, dialogo, opzione, finale, testo), `chi` (per le battute), `dove` (file e riga) |
| `nomi.json` | il nome inglese di ogni luogo, cosa e persona (senza articolo): pulsanti, mappa, segnaposto, parole che si toccano |

I cataloghi si rifanno con `python strumenti/traduzione.py` (tiene le traduzioni dei testi che non sono
cambiati, toglie quelle dei testi spariti) e si controllano con `python strumenti/traduzione.py controlla`.
Il collaudo `collaudo/traduzione.py` gioca i percorsi e pretende che ogni riga stampata abbia la sua
traduzione.

## Regole che il controllo fa rispettare

1. **Ciò che sta fra parentesi quadre non si tocca.** I segnaposto (`[acqua]`, `[cibo]`, `[vita]`,
   `[i fili del viaggio]`) restano gli stessi, anche se nella frase inglese cambiano posto. I testi
   condizionali (`[se lo stato della foto è dritta]` … `[altrimenti]` … `[fine]`) restano con le
   stesse condizioni, nello stesso ordine, scritte in italiano: si traduce soltanto ciò che sta fra i marcatori.
2. **Gli a capo** (`\n`) sono quanti nell'italiano: ogni riga si traduce per conto suo.
3. **Niente caporali.** Le battute vanno fra virgolette inglesi curve, “così”; una citazione dentro una
   battuta, ‘così’.
4. **I suggerimenti fra parentesi restano fra parentesi**, uno per uno: l'interfaccia li mette in margine.

## Le parole in MAIUSCOLO

Nel testo italiano le parole in maiuscolo sono quelle che si toccano: una cosa del luogo (una `FOTO`), un'uscita
(`NORD`), una persona (`NUNZIO`), un comando suggerito (`PARLA CON Nunzio`). In inglese restano in maiuscolo,
così:

- **le cose**: il nome inglese di `nomi.json`, al singolare o al plurale come lì (`MAPPA` → `MAP`, `OCCHIALI` →
  `SUNGLASSES`, `CHIAVE INGLESE` → `SPANNER`). Una cosa che in italiano non è in maiuscolo resta in minuscolo;
- **le uscite**: `NORTH`, `SOUTH`, `EAST`, `WEST`, `UP`, `DOWN`. «A NORD la piazza» → «NORTH, the square»;
- **le persone**: il nome com'è (`NUNZIO`);
- **i comandi suggeriti**, con le parole dei pulsanti inglesi: `EXAMINE`, `LOOK`, `TAKE`, `DROP`, `TALK TO`,
  `USE … ON …`, `GIVE`, `DRINK`, `EAT`, `WAIT`, `STATUS`, `INVENTORY`, `ATTACK`, `THREATEN`, `SHOOT`, `DRAW WATER`
  (attingi), `TREAT YOURSELF` (curati), `THROW FOOD` (getta cibo), `STRAIGHTEN` (raddrizza), `DRINK BRACKISH`
  (bevi salmastra). In inglese si gioca soltanto coi pulsanti: i suggerimenti dicono che cosa toccare, non che
  cosa scrivere («(ESAMINA IL BIGLIETTO per rileggerlo.)» → «(EXAMINE the NOTE to read it again.)»).

## Il registro

- **Inglese britannico** (spelling e lessico: *colour*, *grey*, *petrol*, *lay-by*, *jerrycan*).
- **Seconda persona, presente**, come l'italiano: «Torni lo stesso.» → «You go back anyway.»
- **Asciutto.** La prosa italiana è scarna, concreta, con frasi brevi e punti e virgola: niente aggettivi in più,
  niente spiegazioni, niente enfasi che l'italiano non ha. Le metafore si tengono, se reggono in inglese.
- **Le persone parlano semplice**: gente di un sud rurale, poche parole. Niente dialetto finto, niente slang,
  niente americanismi.
- **I nomi propri restano**: le persone (Nunzio, Rosaria, Cosimo…) e i luoghi (Acquaviva, Acquamorta, Serra Alta,
  Torrente Morto). «zia Concetta» → «Aunt Concetta». La Secca (la grande siccità) → «the Drought».
- **Le scorte**: «Hai [acqua] d'acqua e [cibo] di cibo.» → «You have [acqua] water and [cibo] food.»; «3 d'acqua»
  → «3 water».

## Glossario

| Italiano | Inglese |
|---|---|
| bisaccia | satchel |
| tanica | jerrycan |
| damigiana | demijohn |
| scorte | supplies |
| sete, fame, vita | thirst, hunger, life |
| fiducia | trust |
| invaso | reservoir |
| diga, sbarramento | dam |
| conca | basin |
| guado, greto | ford, riverbed |
| statale | the main road (la statale) |
| provinciale | the provincial road |
| superstrada | the dual carriageway |
| sterrata | dirt track |
| mulattiera | mule track |
| casello, sbarra | tollbooth, barrier |
| piazzola | lay-by |
| masseria | farmstead |
| osteria | tavern |
| valico | pass |
| pianoro | plateau |
| fede (l'anello) | wedding ring |
| santino | holy card |
| cavalluccio | toy horse |
| lasciapassare | permit |
| stecca (di sigarette) | carton (of cigarettes) |
| la strada (il viaggio) | the road |
