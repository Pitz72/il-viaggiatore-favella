---
data: 2026-10-31
ora: "00:26"
titolo: "Parola per parola, il nome che resta, e il gioco solo da scaricare"
tipo: sessione
versione: 1.40.0
---

# Parola per parola, il nome che resta, e il gioco solo da scaricare

## In breve
Uscita la 1.40.0, il gioco anche in inglese, con un trofeo che c'è solo in inglese, «Parola per parola», al posto di
«Tutto a parole». Il nome resta «Il Viaggiatore», senza sottotitoli. Da questa versione il gioco si scarica e basta:
favella.eu ed Ecosystem non offrono più la versione nel browser, e il sito personale ha lo strumento per aggiungere
all'articolo programmato la sezione sull'inglese, come lavoro in corso.

## Contesto
Dopo la consulenza sul nome (diario del 30/10, «La lingua inglese…»), Simone ha deciso: l'applicazione resta col nome
di oggi, niente cambio di nome e niente sottotitoli inglesi. Poi ha chiesto:
- un trofeo solo della versione inglese, che copra il vuoto lasciato da «scrivendo ogni comando»;
- l'inglese come lavoro in corso nell'articolo su simonepizzi.runtimeradio.it e su Ecosystem;
- via la versione web dal sito di FAVELLA 1, perché la gente scarichi il gioco e basta, e le notizie aggiornate;
- la versione nuova, e il rilascio.

## Lavoro fatto
- **«Parola per parola»** (*Word by Word*, `gioco/trofei.ts`): un finale raggiunto giocando tutto in inglese e prendendo
  dal testo, cioè toccando la sua parola (NORTH, BAR…), ogni strada che il testo nomina. Le sfide hanno due righe in
  più: `italiano` (un comando dato giocando in italiano) e `fuoriTesto` (una strada nominata presa dalla rosa dei venti).
  Il gioco le aggiorna a ogni comando (`ViaggiatorePlayer`, `stradaFuoriTesto`): una strada presa dal testo arriva con
  `daTesto`. Se viene dalla rosa, si chiede al ponte che cosa ridirebbe «guarda»; se il testo nomina quella strada
  (`nominaLaStrada`, `gioco/traduci.ts`), la sfida cade. Ogni lingua mostra i suoi trenta trofei (`trofeiDellaLingua`,
  `SOLO_IN`); il catalogo ne ha trentuno, e per la collezione l'una sfida vale l'altra.
- **Il nome**: `TITOLO` resta uno solo e senza sottotitoli; anche il trofeo della collezione si chiama «Il viaggiatore»
  in inglese (era «The traveller»). «traveller» resta nel racconto, dove traduce «viandante».
- **Il README** porta al download: via «Gioca ora nel browser».
- **Il rilascio 1.40.0**: `main` portato avanti fino al ramo (fast-forward, col sì di Simone), data del CHANGELOG al
  31 ottobre, workflow «Rilascio» (run 41150193765, sei minuti e mezzo, riuscito): release «Latest» con i sette file
  (installer, portatile, AppImage, .deb, blockmap, latest.yml, latest-linux.yml).
- **favella.eu** (FAVELLA1, `landingpage/`, sito 2.14.0, commit `6e53f2c`): via la scheda «Nel browser» dal banner della
  Galleria, soltanto il download per Windows e Linux alla 1.40.0, in italiano e in inglese. La notizia in evidenza è
  «Il Viaggiatore 1.40: anche in inglese, e solo da scaricare»; quella della 1.35 torna normale, e quella della 1.23
  porta al download invece che al browser. La privacy non nomina più il gioco fra gli strumenti nel browser. Build e
  pre-render riusciti (13 pagine), banner fotografato.
- **Ecosystem** (Ecosystem-Runtime, sito 0.32.0, commit `3d8c034` su `master`): la scheda alla 1.40.0, il capitolo
  nuovo «In inglese · in lavorazione» e la riga «Lingue» nella scheda tecnica. Il gioco si scarica e basta: via
  `links.play`, la piattaforma Browser, la riga Browser e le tre schermate della versione web (anche i file). Download
  alla v1.40.0, il biglietto in inglese come lo dice il gioco, una notizia, `docs/changelog/0.32.0.md`. Build riuscita
  (38 pagine), pagina fotografata.
- **simonepizzi.runtimeradio.it** (SimonePizziWebSite, commit `65d9260`): l'articolo del Viaggiatore è nel database ed è
  programmato fra i prossimi in uscita. Da qui il sito non si raggiunge (la rete della sessione lo rifiuta) e le
  credenziali SFTP stanno sul computer di Simone. C'è allora lo script una-tantum
  `scripts/server-tools/aggiorna_articolo_viaggiatore_inglese.php`, per `esegui.py`, che aggiunge in fondo la sezione
  «In corso: Il Viaggiatore in inglese». Cerca da sé l'unico articolo programmato col Viaggiatore nel titolo; lavora in
  anteprima, non raddoppia la sezione, restituisce il corpo di prima e segnala i rimandi alla versione nel browser.

## Decisioni
- **La regola della sfida inglese: «ogni strada che il testo nomina», non «ogni strada»** — perché tre luoghi di
  passaggio (la discesa, la salita, la sterrata) non nominano le uscite nemmeno in italiano. Così il trofeo resta fedele
  al testo e si vince su tutti e dodici i percorsi.
- **«Parola per parola» si vince solo giocando tutto in inglese** — è la sfida dell'inglese; un viaggio cominciato in
  italiano la perde, e così un salvataggio di prima della 1.40, di cui non si sa com'è andato.
- **Anche su Ecosystem via la versione nel browser** — non era nella richiesta per Ecosystem, ma sì nel suo scopo («che la
  gente scarichi la versione desktop e basta»). Il pulsante «Gioca nel browser» era il primo della scheda.
- **La copia su GitHub Pages resta** dov'è (la 1.23.0): non si offre più da nessuna parte, ma spegnerla romperebbe
  link esterni, e Simone non l'ha chiesto.

## Verifiche
- `trofei-prove.mjs` 11 prove; `collaudo/trofei.py` tutto verde, con due partite nuove in inglese: una «parola per
  parola», una con una strada presa dalla rosa.
- `collaudo/traduzione.py`: su 588 spostamenti dei percorsi, ogni strada che il testo italiano nomina la nomina anche
  l'inglese, con una parola che porta lì.
- Nel browser, in inglese: due spostamenti dalle parole del testo lasciano `fuoriTesto` a false; la rosa usata dove il
  testo nomina la strada lo porta a true (letto dai salvataggi automatici).
- La release: «Latest», sette file, i nomi uguali ai link di favella.eu ed Ecosystem.
- Lo script dell'articolo, su un SQLite di prova: sceglie il programmato e non quello uscito; l'anteprima non scrive;
  `--applica` scrive una volta; rilanciato non raddoppia; segnala testo e pulsante che portano al browser.

## Questioni aperte
- **Da caricare a mano** (le credenziali stanno sul computer di Simone):
  - favella.eu: `npm run deploy` in `landingpage/`;
  - Ecosystem: `python _SEGRETI/deploy.py upload`, poi `audit` e `rm` dei tre file tolti;
  - l'articolo: `esegui.py` con lo script, prima in anteprima e poi con `--applica`.
- **Ecosystem-Runtime ha un ramo `main` di troppo**, creato per sbaglio da questa sessione (il ramo principale è
  `master`). Punta allo stesso commit di `master`; cancellarlo da qui non è stato permesso. Va tolto a mano.
- La voce inglese, e la rilettura di un madrelingua (dal diario del 30/10).
