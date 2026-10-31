---
name: verifica-traduzione
description: Verifica lo stile di una traduzione (pensata per italiano→inglese, adattabile ad altre coppie) cercando le traduzioni letterali, i calchi, i falsi amici, le costruzioni dell'italiano ricalcate in inglese e gli schemi di un testo scritto da un modello (LLM). Usala SEMPRE quando l'utente chiede di controllare, rivedere, rileggere, "far suonare naturale" o "verificare lo stile" di una traduzione o di una versione inglese (narrativa, giochi, sottotitoli, siti, documenti), quando dice che un testo "sa di tradotto", "sa di LLM" o "sa di ChatGPT", e prima di consegnare una traduzione scritta da Claude. Non serve per tradurre da zero né per correggere il testo originale.
---

# Verifica di una traduzione

Una traduzione può fallire in due modi diversi, e conviene cercarli separatamente:

- **Sa di tradotta** (calchi): la frase è grammaticale ma un madrelingua non l'avrebbe scritta così, perché ricalca l'ordine,
  le ellissi, le preposizioni o i modi di dire della lingua d'origine.
- **Sa di modello** (tic da LLM): trattini ovunque, «non X ma Y», elenchi in tre, chiuse a effetto, parole che i modelli usano
  molto più delle persone.

Il secondo difetto lo trovano in gran parte le macchine. Il primo lo trova quasi solo la lettura: nel progetto da cui nasce
questa skill (494 testi inglesi, circa 11.700 parole) lo script, sul testo prima delle correzioni, segnalava circa un decimo
dei problemi veri (6 voci su 52). Per questo
**la lettura integrale, voce per voce, è il lavoro; la scansione meccanica è l'aiuto**.

## Prima di cominciare

1. **Cerca le regole del progetto**: un LEGGIMI della traduzione, un glossario, una guida di stile. Servono: varietà dell'inglese
   (britannico o americano), persona e tempo, registro, nomi propri che restano, **titoli e marchi che non si traducono**, e i
   vincoli tecnici del testo (segnaposto fra parentesi quadre, `\n`, virgolette, parole in maiuscolo). Se non ci sono, scrivi le
   assunzioni all'inizio del rapporto invece di indovinare in silenzio.
2. **Valuta solo la lingua di arrivo.** L'originale serve da riferimento per capire se una frase è un calco o se ha cambiato
   senso; non si giudica e non si propone di modificarlo. Se l'utente ha detto «solo l'inglese», vale per tutto il lavoro.
3. **Distingui il motivo dell'originale dal tic del traduttore.** Ripetizioni, formule e manierismi che stanno già nel testo di
   partenza («una volta sola», «quanto basta», «come si dice…») sono scelte dell'autore: tradotte uguali non sono difetti.

## Metodo

1. **Scansione meccanica.** `python scripts/scansione.py FILE... --campo en --varieta br|am --ignora '<regex dei segnaposto>'`
   (legge JSON a lista con un campo, JSON chiave→testo, testo o Markdown). Dà: trattini lunghi, parole da elenco dei modelli,
   frasi da chat, contrasti «non X ma Y», americanismi/britannismi, falsi amici, dislocazioni, elenchi in tre, avverbi in -ly
   e formule di tre parole che tornano, virgolette, caratteri invisibili. Ogni voce è un'**ipotesi**: leggila nel contesto.
2. **Lettura integrale**, una zona alla volta, con l'originale a fianco. Non campionare: i calchi stanno nei casi piccoli
   (un avverbio, una preposizione, una virgola). Per ogni frase chiediti: *un inglese l'avrebbe scritta così?* e *se non vedessi
   l'originale, la capirei subito?* Il catalogo dei calchi tipici, con esempi veri prima/dopo, è in
   [`references/calchi-italiano-inglese.md`](references/calchi-italiano-inglese.md): leggilo prima di cominciare.
3. **Segnala, non riscrivere.** Se sono installate, usa `humanizer` e `stop-slop` come **elenco di sintomi**. Nella narrativa
   asciutta danno falsi positivi (un punto e virgola, una triade, una frase breve possono essere già nell'originale) e, applicate
   alla lettera, abbelliscono: una correzione deve togliere o raddrizzare, mai aggiungere enfasi che l'originale non ha.
4. **Classifica** ogni problema.

   | Tipo | Che cosa |
   |---|---|
   | SENSO | l'inglese dice altro dall'originale, o lo dice ambiguo |
   | GRAMMATICA | errore vero (tempo, preposizione mancante, accordo) |
   | CALCO | grammaticale ma ricalcato: ordine, ellissi, dislocazioni, idiomi alla lettera, falsi amici |
   | TIC | schema da modello, o formula che il traduttore ha introdotto da solo |
   | REGISTRO | troppo letterario, troppo colloquiale, americanismo in un testo britannico, dialetto finto |
   | COERENZA | la stessa cosa tradotta in due modi, glossario non rispettato |

   | Priorità | Quando |
   |---|---|
   | 1 | errore di grammatica o di senso |
   | 2 | calco che un lettore inglese nota |
   | 3 | ritocco di finezza |

5. **Proposte minime.** Cambia il meno possibile: una parola, una preposizione, l'ordine di due membri. Mantieni segnaposto,
   tag, a capo, maiuscole e virgolette secondo le regole del progetto. Non aggiungere fatti. Ogni proposta ha: dove sta, il
   testo attuale, la proposta, **il perché in una frase**.
6. **Le frasi cardine e le scelte di gusto non si decidono da soli.** La riga da cui parte la storia, un'immagine voluta, un
   termine di glossario discutibile: mettile in una sezione «Decisioni» con la tua proposta e l'alternativa. Un dubbio che
   l'utente ha già sciolto in passato (controlla diario e registro del progetto) si chiude, non si ripropone.
7. **Un titolo o un marchio non è una parola comune.** Se il progetto lascia il titolo nella lingua d'origine, non «correggerlo»,
   e non confonderlo con la stessa parola usata nel racconto.

## Rapporto

Segui [`references/rapporto-modello.md`](references/rapporto-modello.md): esito in breve con i numeri, metodo, **che cosa è a
posto (i risultati negativi contano: dicono quanto hai guardato)**, le tabelle per priorità, le decisioni, come applicare.
Metti il rapporto nel progetto (non solo in chat) se serve alla prossima sessione.

## Applicare le correzioni

Solo quando l'utente lo chiede. Fallo con uno script che sostituisce **stringhe esatte**, ciascuna in una voce precisa, e si
ferma se la stringa non compare esattamente una volta; prima di scrivere controlla che la riscrittura dei file, senza
modifiche, sia identica all'originale (stesso rientro, stessa codifica), così il `git diff` mostra una riga per voce. Poi lancia i
controlli del progetto (struttura delle traduzioni, collaudi) e riporta l'esito vero, non quello sperato.
