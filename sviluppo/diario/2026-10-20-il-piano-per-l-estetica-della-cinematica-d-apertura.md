---
data: 2026-10-20
ora: "02:29"
titolo: "Il piano per l'estetica della cinematica d'apertura"
tipo: decisione
versione: 1.15.0
---

# Il piano per l'estetica della cinematica d'apertura

## In breve
Un piano scritto, non eseguito, per migliorare l'aspetto del trailer di 88,5 secondi che precede il gioco: diciannove migliorie in sei fasi, il comportamento intatto (solo Esc), quattro voci da chiedere a Simone perché toccano i tempi.

## Contesto
Simone vuole curare nel prossimo futuro l'estetica e i dettagli dell'intro, ma non cambiarne il comportamento (il 20 ottobre ha rifiutato clic e invito «salta»: commit `e60fdf4`). Durante la pianificazione ha precisato che parla solo della *cinematica prima del gioco*, cioè del trailer, non dei loghi d'apertura: loghi e avviso restano com'erano. Il piano doveva dire che cosa cambiare, con che costo e rischio, come verificarlo, e che cosa chiedere.

## Lavoro fatto
- `pre-produzione/07-intro-estetica-e-dettagli.md` (strato 7): vincoli, tabella dello stato attuale, ciò che è già eccellente, diciannove migliorie ordinate in fasi (banco, difetti puntuali, luce e pellicola, suono, materia, nitidezza a 4K), quattro voci «tocca il flusso» separate, una fascia di confine (la schermata d'avvio), protocollo di verifica comune, dieci domande, ciò che non si farà.
- L'esame: fotogrammi a 1080p di 30 istanti e 10 di dissolvenza, a 4K di 7 istanti, ritagli a 1:1, prove di banding, costo di un fotogramma a tre densità, analisi di `intro.mp3` (livello, accenti, effetto del compressore, latenza d'uscita). Il materiale sta in `collaudo/esiti/piano-intro/` (locale, non versionato), con gli strumenti di cattura.
- `sviluppo/PROSSIMI-PASSI.md`: una riga sotto «Pianificato».

## Decisioni
- **Il perimetro è il trailer, non i loghi né l'avviso** — perché Simone l'ha detto in modo esplicito; la schermata d'avvio, che sta nello stesso componente, entra solo in una fascia a parte da confermare.
- **Le voci che toccano finestre o tempi di `scaletta.ts` stanno in un paragrafo separato (T1–T4)** — perché durata, ordine, tagli e musica non si toccano senza una risposta; qui si tratta di finestre di dissolvenza, di un testo spostato di 0,3 s, del tempo di lettura del biglietto.
- **Si misura con Electron fuori schermo, non col pannello del browser** — perché da nascosto l'orologio non gira e le misure si schiacciano sul ritmo dello schermo (16,7 e 33,3 ms).
- **Il confronto prima/dopo è esatto al bit** — con un preload che fissa `Math.random`, nasconde la grana e ferma le animazioni CSS, due catture dello stesso istante hanno PSNR infinito (provato su tre istanti): ciò che cambia fuori dalle zone attese è un difetto.

## Verifiche
- Costo di un fotogramma (RTX 2070, Electron fuori schermo): mediana 1,3–6,7 ms a 1920×1080, 1,7–10,3 ms a 2560×1440, 1,7–9,0 ms a 4K con la tela ferma a 2560 (il tetto di oggi). Preparazione delle tele 5,4–6,2 s.
- Il brano: −14,1 LUFS, escursione 5,5 LU, picco −0,4 dBTP; il compressore predefinito alza i passaggi piano di +2,3…+3,8 dB e i forti di +0,1…+1,2; l'uscita audio aggiunge ≈50 ms (10 di base, 40 di uscita).
- Nessun file di codice, di storia o di configurazione è stato modificato; `intro.mp3` ha sha256 `6081499c…52a3`.

## Questioni aperte
- Le dieci domande del §7 del piano (perimetro della schermata d'avvio, dissolvenze, «tuo fratello», biglietto, calligrafia, gusto su sale e crepe, 4K, grana, compressore, versioni e video).
- Il piano non è stato guardato in riproduzione in tempo reale (il pannello del browser è nascosto): i giudizi su movimento e sincronia vanno confermati in movimento e all'ascolto.
