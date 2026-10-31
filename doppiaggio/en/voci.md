# La voce del narratore inglese

> Decisione di Simone, 31 ottobre 2026: **Enzo, inglese britannico neutro**, la stessa voce di libreria dell'italiano. Il campo
> accanto alla voce, in AI Studio, ha questa descrizione, **identica in ogni generazione** (sei blocchi di narrazione, le scelte
> del giocatore, il trailer). Il campo di stile resta **vuoto** per la narrazione e per le scelte.

## Il prompt (campo accanto alla voce)

```
A man in his early fifties with a calm, low-pitched, dry voice and a worn, slightly husky warmth, speaking neutral British English with no regional accent. He narrates unhurriedly and without performing, sober and understated, like a quiet documentary voice walking beside you at dusk.
```

Due frasi, come raccomanda Google per le descrizioni di una voce (`gemini-tts.md`): i tratti permanenti nella voce, niente comandi.

## Il trailer

Il trailer si genera con la stessa voce e la stessa descrizione, ma con **un blocco di parlato per tono**, e nel campo accanto alla voce
la descrizione più « Delivery: <stile>.» (quattro toni, in `trailer.json`):

| Tono | Stile |
|---|---|
| solenne | solemn, slow, weighty |
| enfatico | emphatic, dramatic, building |
| sospeso | hushed, questioning, suspended |
| secco | crisp, clipped, punchy |

## La versione lunga (di riserva)

La descrizione dell'italiano (`../voci.md`) riscritta per l'inglese. Google sconsiglia i profili lunghi, ma questa è la voce con cui
Enzo è rimasto coerente in italiano: se la breve non basta, si prova questa.

```
A man in his early fifties narrating in English. Calm, low-pitched and dry, with a worn, slightly husky warmth. Unhurried pace, with short natural pauses at the end of sentences. Neutral British English diction, no regional accent. Sober and understated: he tells you what you are seeing without performing it, never theatrical, never sentimental. A quiet documentary voice walking beside you at dusk.
```
