---
data: 2026-10-01
ora: "10:12"
titolo: "La passata sui testi"
tipo: sessione
versione: 1.10.2
---

# La passata sui testi

## In breve
Prima passata dei testi con gli antipattern di prosa e la tipografia. Il risultato più onesto: i testi erano già puliti. Quindici ritocchi mirati, nessuna riscrittura, nessuna meccanica toccata.

## Contesto
L'autore ha chiesto di rifinire e umanizzare tutto il testo prima del rilascio, senza i playtest umani. Si è partiti dalla misura, non da una riscrittura: una scansione automatica di tutte le stringhe di testo dei `.fav` (441 stringhe, 10.331 parole) con i pattern delle skill (similitudini consumate, «come se», «sembra», avverbi in -mente, parallelismi negativi, trattini lunghi, «silenzio», «peso», «qualcosa di + aggettivo»), un controllo tipografico (doppi spazi, spazi prima della punteggiatura, apostrofi e virgolette curve, tre punti, parole raddoppiate), e la lettura di ogni zona per intero.

## Lavoro fatto
- **La misura.** Pochissimi hit, quasi tutti legittimi. Il trattino lungo compare solo nel prefisso funzionale «FINALE —», che l'interfaccia riconosce (`testo.ts`): resta. Tipografia: nessun errore reale (i 31 «falsi positivi» erano «ne» e «po'»). Parallelismi negativi, tricolon e simili: assenti o guadagnati.
- **Quindici ritocchi** (`prototipo/`), tutti con una ragione:
  - un'immagine da locanda («Nunzio asciuga un bicchiere che è già asciutto») → una cosa vista (bottiglie vuote, etichette in avanti);
  - «muta» detta della fontana, della diga e dell'invaso → resta la fontana; la diga è «alta come un palazzo di dieci piani», l'invaso «bianco e fermo»;
  - Iole «china come su un malato» e poi «come si tiene la mano a chi sta male»: la prima è tolta;
  - tre similitudini di maniera: «come specchi», «come bocche», «come un re senza regno» → una cosa concreta ciascuna;
  - «affonda i denti a fondo», «completamente scarica», «un cortile silenzioso», «Le colline, infine. Acquamorta è dietro le colline.»;
  - le due righe del corpo più frequenti, la sete e la fame, e il vento delle colline.
- **Dove il testo è anche codice.** Tre frasi sono riconosciute dall'interfaccia (`testo.ts`, `CORPO`): aggiornate. `giocate.py` e `02-sistemi.md` seguono la nuova riga della sete.
- **Le garanzie.** Lo script della passata conta ogni sostituzione, scrive in UTF-8 con fine riga LF, e controlla che **lo scheletro di ogni file** (tutto ciò che sta fuori dalle stringhe: condizioni, conseguenze, nomi, numeri) sia identico a prima. Non può cambiare una meccanica per sbaglio.
- **Collaudo**: `testo.py` verifica che tutti i 19 messaggi dei demoni «Ogni turno» restino di corpo.

## Decisioni
- **Poche righe, non una riscrittura** — perché riscrivere un testo che funziona è il modo più rapido per toglierli la voce; le skill stesse mettono in guardia dalla standardizzazione. Si è cambiato dove c'era una ragione dichiarabile.
- **Il refrain resta** — «Quanto basta», «Lo sapevo, che saresti tornato», le tre versioni di «Si china, raccoglie il fucile…» sono ripetizioni volute, non tic.
- **I suggerimenti tra parentesi restano** («ESAMINA IL BIGLIETTO per rileggerlo»): sono servizio, non prosa, e l'interfaccia li riconosce. Sono anche gli unici punti dove il testo parla fuori dal tempo presente della storia.
- **Il tipografico non si tocca** — perché è già conforme alla convenzione del progetto (apostrofo dritto, caporali, puntini). Il contratto tipografico delle skill è tarato su un altro volume (apostrofo curvo): qui non si applica.
- **Versione patch (1.10.2)** — perché sono ritocchi di testo, senza meccaniche nuove.

## Verifiche
Compilazione senza avvisi; `testo.py` 12 prove; `giocate.py`; tutti i collaudi verdi (vedi sotto per i numeri). Lo script ha verificato, per ogni file toccato, lo scheletro, i caporali bilanciati, l'assenza di nuovi apostrofi curvi, virgolette curve, tre punti e doppi spazi.

## Questioni aperte
- **Una lettura umana resta insostituibile**: questa passata toglie i difetti riconoscibili, non può dire se una scena commuove. Il playtest esterno resta il passo che manca.
- **Se si vuole di più**, due strade possibili: una lettura a voce alta dei dialoghi dei personaggi minori, per sentire se ciascuno ha davvero la sua voce; e le descrizioni degli oggetti da prendere, che sono funzionali e corte. Entrambe sono scelte di gusto dell'autore.
