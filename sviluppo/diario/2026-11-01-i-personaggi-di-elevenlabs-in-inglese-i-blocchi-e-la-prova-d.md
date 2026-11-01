---
data: 2026-11-01
ora: "07:28"
titolo: "I personaggi di ElevenLabs in inglese: i blocchi e la prova di accento"
tipo: sessione
versione: 1.40.1
---

# I personaggi di ElevenLabs in inglese: i blocchi e la prova di accento

## In breve
Simone ha dato il via ai quattordici personaggi in inglese e ha chiesto di cominciare da quelli fatti con ElevenLabs, di cui si
conoscono le voci, documentandosi prima su come si dirige Eleven v4. Sono pronti i blocchi inglesi di Imma, Rosaria, Tore e Vito
(69 parti) e una prova per scegliere l'accento italiano da chiedere a voci italiane che parlano inglese. Non è stato registrato niente.

## Contesto
Kira inglese era chiusa (diario «Kira in inglese: taglio, banco e gioco»). Simone: «partiamo dai blocchi dei personaggi, ma parti dai 3 che
abbiamo fatto in Eleven Labs perché conosciamo i nomi. Tra l'altro sono voci italiane, potrebbe anche succedere che gli dia un accento
genericamente italiano che li renderebbe tutto più realistico. Useremo la versione 4 di Eleven Labs quindi prima documentati su come si
indirizzano le recitazioni e la sintassi. Partiamo da questi tre poi vediamo come procedere.» I documenti (`voci-scelte.md`, diario del 20
ottobre) dicono che i personaggi fatti con Eleven v4 sono **quattro**: Imma (voce Victoria), Rosaria (Valeria), Tore (Criss) e Vito (Luigi).
Ho preparato tutti e quattro: a Simone costa un file in più, e se ne intendeva tre, il quarto si lascia da parte.

## Lavoro fatto
- **Documentazione** di Eleven v4 letta sulle pagine ufficiali (modelli, tag, accenti, punteggiatura, cursori) e scritta in
  `doppiaggio/en/eleven-v4.md`, con ciò che il servizio non dice segnato «da provare».
- **`strumenti/doppiaggio-inglese.py`**: i personaggi di `PERSONAGGI` (Imma, Rosaria, Tore, Vito) sono derivati dall'italiano, parte per parte,
  nello stesso ordine e con gli stessi toni (`raccogli_personaggi`), con sei verifiche (una traduzione sola per parte italiana, nessun
  doppione, stesso numero di parti, niente parentesi né maiuscole, ogni tono ha il suo stile, il tono è quello dell'italiano). Scrive
  `doppiaggio/en/blocchi/imma.txt` … `vito.txt` nel formato di Eleven v4 (`testo_eleven`: una battuta per paragrafo, `[accento][tono]` davanti),
  la chiave `personaggi` del manifest (come `servizio` per Kira: blocchi, parti, corrispondenze italiano → inglese, `accento`), una sezione di
  `controllo.md` e la cartella `prove/`. Nuove opzioni: `--accento "…"` (o `nessuno`) e il comando `prove`.
- **`doppiaggio/en/prove/accento-A-nessuno.txt` … `-D-strong.txt`**: le stesse sei battute di Vito (toni diversi), un tag d'accento diverso per
  file (nessuno, `light Italian accent`, `Italian accent`, `strong Italian accent`); circa 2.100 caratteri in tutto.
- Guide aggiornate: `doppiaggio/en/LEGGIMI.md`, `strumenti/LEGGIMI.md`, `sviluppo/PROSSIMI-PASSI.md`.

## Decisioni
- **Quattro personaggi e non tre** — i documenti ne contano quattro e la loro registrazione è identica; se Simone ne intendeva tre, il quarto
  resta pronto.
- **Gli stessi toni dell'italiano, in inglese come già erano** — i tag di tono dell'italiano erano già inglesi (`dry, curt`, `grave, slow, weighing
  each word`…) e non sono mai stati pronunciati; cambiarli cambierebbe la recitazione.
- **L'accento è un tag impilato davanti al tono, ripetuto su ogni battuta** — perché la documentazione dice che un tono dura finché non ne arriva un
  altro e che l'accento chiesto con un tag è sperimentale; ripeterlo è la scelta prudente, e la prova dice se serve.
- **Un blocco per personaggio, intero** — come in italiano: la voce cambierebbe a metà. I blocchi stanno sotto i 1.400 caratteri.
- **Predefinito `Italian accent`** — è il tag che ElevenLabs elenca fra gli accenti continentali; la prova dice se basta o se serve `strong`. È una scelta
  mia, provvisoria, che Simone conferma o cambia dopo l'ascolto.

## Verifiche
- `python strumenti/doppiaggio-inglese.py stato`: 34 verifiche OK (le 9 nuove dei personaggi comprese); i blocchi del narratore, di Kira e le
  scelte sono identici a prima (`git status`: nessuna differenza nei loro file).
- `python collaudo/doppiaggio.py`: TUTTO OK (652 parti inglesi, 25,6 MB con l'italiano).
- Non verificato, perché non ancora fatto: che v4 pronunci l'accento, che il tag non venga letto ad alta voce, che l'accento regga da una battuta
  all'altra, che la voce inglese somigli a quella italiana. Lo dice la prova.

## Questioni aperte
- Simone genera le quattro prove (Luigi, Stability 50 e Similarity 75), le ascolta, dice quale accento tiene.
- Poi i quattro blocchi, il taglio (`doppiaggio-taglia.py en-imma` … da collegare alla chiave `personaggi`), il banco (cartella inglese a parte,
  con la licenza ElevenLabs di sempre), i collaudi, l'integrazione nel gioco.
- Gli altri dieci personaggi (Gemini): voci di libreria e prompt da decidere.
