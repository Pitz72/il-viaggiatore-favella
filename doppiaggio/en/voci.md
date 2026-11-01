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

## Kira (la voce di servizio)

> Scelta mia del 1° novembre 2026, da confermare: **Kira, inglese britannico neutro**, come Enzo (il registro dei cataloghi è
> britannico). La voce di libreria è la stessa dell'italiano. Il campo di stile resta **vuoto**.

Kira dice **soltanto** i suggerimenti tra parentesi e i pezzi con i numeri delle scorte (120 parti); niente narrazione, niente battute,
niente scelte del giocatore. Tre blocchi: `kira-suggerimenti`, `kira-numeri-a`, `kira-numeri-b` (i pezzi con numeri vengono a famiglie
che si somigliano, e due famiglie che differiscono solo per la virgola o il punto finale sono in blocchi diversi).

```
A woman in her thirties with a neutral, clear, light mid-pitched voice, speaking neutral British English with no regional accent. She speaks briskly and evenly, friendly but flat, like a well-made audio guide or a game menu voice, with crisp consonants and no drama.
```

La versione lunga di riserva (la descrizione dell'italiano, riscritta per l'inglese):

```
A woman in her thirties speaking in English. Neutral, clear and light, mid-pitch, brisk and even pacing. Friendly but flat, like a well-made audio guide or a game menu voice. Crisp consonants, no drama, no emotion, neutral British English diction, no regional accent.
```

## La versione lunga (di riserva)

La descrizione dell'italiano (`../voci.md`) riscritta per l'inglese. Google sconsiglia i profili lunghi, ma questa è la voce con cui
Enzo è rimasto coerente in italiano: se la breve non basta, si prova questa.

```
A man in his early fifties narrating in English. Calm, low-pitched and dry, with a worn, slightly husky warmth. Unhurried pace, with short natural pauses at the end of sentences. Neutral British English diction, no regional accent. Sober and understated: he tells you what you are seeing without performing it, never theatrical, never sentimental. A quiet documentary voice walking beside you at dusk.
```
