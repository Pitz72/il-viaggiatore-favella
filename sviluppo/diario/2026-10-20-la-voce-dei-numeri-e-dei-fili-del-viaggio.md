---
data: 2026-10-20
ora: "18:23"
titolo: "La voce dei numeri e dei fili del viaggio"
tipo: sessione
versione: 1.21.0
---

# La voce dei numeri e dei fili del viaggio

## In breve
Fase 3 del piano 08: i numeri delle scorte nelle battute («Hai 6 d'acqua e 2 di cibo.») ora si sentono, ricomposti dai pezzi che Kira ha registrato a lettere, e il paragrafo dei fili del viaggio nei finali si ritrova frase per frase. Ogni parte del gioco ha ora un testo stampato da cui l'app la ritrova.

## Contesto
Dopo la fase 2 (voce di diario «La voce nel gioco: il racconto si sente») restavano senza voce 104 pezzi lungo i percorsi, tutti numeri delle scorte dentro le battute dei personaggi (Nunzio, Ciro…). I fili del viaggio, che il motore compone da dieci frasi con la loro condizione, si ritrovavano già con la «fila» di parti ai confini di frase, ma nessun collaudo lo provava.

## Lavoro fatto
- `app/src/gioco/parti.ts`: un pezzo di servizio non trovato che contiene cifre si porta a lettere («6» → «sei», fino a venti) e si cerca intero; se no, si spezza a ogni « e » seguito da un numero in «…,» + «e …», lo stesso taglio di `scomponi_dinamico` in `strumenti/doppiaggio.py`. Un numero oltre quelli registrati lascia il pezzo senza voce (va al lettore di schermo).
- `collaudo/doppiaggio.py`: tolta l'eccezione dei numeri; i testi dei `.fav` con `[acqua]` e `[cibo]` si stampano con ogni valore registrato (1.976 combinazioni), il testo dei fili si prova frase per frase e tutto insieme, e i finali con `[i fili del viaggio]` con tutti i fili dentro; la riga di STATO resta fuori (muta per decisione). Nuovo controllo: ogni parte del gioco (non del trailer) si ritrova da almeno un testo stampato.

## La segnalazione di Simone: «c'era 1 acqua e 2 cibo ma lei dice 3 acqua e 2 cibo»
Simone ascoltava dal pannello del browser mentre provavo il dialogo con Nunzio. Due ipotesi: un taglio sfasato nei numeri di Kira (89 clip quasi uguali, «Hai zero/uno/due… d'acqua,»: il controllo per parte del taglio non distingue bene un numero dall'altro), oppure la voce di prima che continuava sopra una schermata nuova. **Verificato:** whisper (medium e large-v3-turbo) ha riascoltato tutte le 89 clip dei numeri: ognuna dice il numero del suo testo (un «sette» al posto di «sei» era colpa del suggerimento che avevo dato a whisper: senza, i due modelli sentono «sei»). La schermata era la **finestra di conferma dello scambio** («Dai 1 d'acqua → Ricevi 2 di cibo»), comparsa mentre Kira stava ancora dicendo le scorte di quel momento (3 d'acqua, 2 di cibo). **Corretto:** ogni comando, anche dato col mouse (una risposta, un'uscita, un pulsante), zittisce la voce; prima la fermava solo un tasto, o il testo nuovo del turno, che con la finestra di conferma non arriva.

## Decisioni
- **Nessun numero oltre i valori registrati** — il cibo non ha tetto nel gioco e al mercato, barattando molto, può passare 12; registrare altri pezzi vorrebbe una generazione di Kira in più (e la voce cambierebbe un poco): per un caso raro, il pezzo va al lettore di schermo e sullo schermo si legge.
- **Versione 1.21.0** — la voce copre testi che prima tacevano: fra PATCH e MINOR, il più alto.

## Verifiche
- `collaudo/doppiaggio.py`: TUTTO OK; lungo i percorsi 1.987 righe, più 2.123 testi dei `.fav` (1.976 combinazioni di numeri, 10 fili): ogni pezzo ha la sua parte; le 845 parti del gioco si ritrovano tutte (423 lungo i percorsi); le 33 del trailer sono della fase 4.
- Nel browser integrato: «parla con Nunzio» dà in fila «Rimette il bicchiere al suo posto.» (narratore), «Altro?» (Nunzio), «Hai tre d'acqua,» e «e due di cibo.» (Kira); all'area del lettore di schermo resta solo «(Fine della conversazione.)», che è del motore.
- Gli altri dieci collaudi: TUTTO OK; `npx tsc --noEmit` pulito; `npm run build` riuscito. Nel browser: «parla con Nunzio», poi la risposta 1 (lo scambio): compare la finestra di conferma e la voce tace.

## Questioni aperte
- Fase 4: il trailer con la voce di Enzo.
- Rifare Imma, Rosaria, Tore e Vito prima del rilascio (piano 08, decisione 6).
