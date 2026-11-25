---
data: 2026-11-25
ora: "19:03"
titolo: "Gli effetti sonori generati con ElevenLabs"
tipo: sessione
versione: 1.43.1
---

# Gli effetti sonori generati con ElevenLabs

## In breve
Su richiesta di Simone («inizia a generare sti suoni») ho generato con il connettore ElevenLabs i rumori del
[censimento](../../pre-produzione/12-suoni.md): 87 prese per 28 suoni, circa 555 crediti. Sono scaricate in `effetti/master/`, fuori
da git, con una pagina per ascoltarle. **Nel gioco non è ancora cambiato niente.**

## Contesto
Il censimento proponeva di rifare con ElevenLabs solo i rumori e di tenere sintetizzate le parti intonate. Simone aveva 116.031
crediti col piano da 22 dollari al mese, e ha detto di partire.

## Lavoro fatto
- Un flusso sul conto ElevenLabs, «Il Viaggiatore — effetti sonori», con un nodo Sound Effects v3 per ogni rumore: 28 nodi, coi prompt
  del censimento (passi e tasti come sequenze di qualche secondo, da tagliare dopo; il ronzio del tubo in giro continuo).
- Il preventivo del connettore: 2.354 crediti per quattro varianti a nodo. Il costo vero è stato molto più basso, 3,33 crediti per
  secondo generato.
- La prima serie (20 nodi × 4) si è fermata al limite di ElevenLabs sulle generazioni in coda: ne sono partite 63, e la quarta presa di
  17 nodi è stata rifiutata. La seconda serie (8 nodi) è stata rifiutata intera, e rilanciata appena la coda si è svuotata, con tre prese
  a nodo: 24. In tutto 87 prese, nessuna fallita.
- Letti i link firmati di ogni presa (scadono in giornata) e scaricati gli 87 MP3 in `effetti/master/` (4,3 MB); aggiunta la cartella
  a `.gitignore`; scritti [`effetti/LEGGIMI.md`](../../effetti/LEGGIMI.md) (l'indice coi prompt) e `effetti/master/ascolta.html` (una
  sezione per suono, un lettore per presa). Aperta la cartella a Simone.

## Decisioni
- **Tre prese per suono, quattro dove sono arrivate** — perché: il limite di coda aveva tagliato la quarta, e tre bastano per scegliere.
- **I master fuori da git**, come quelli del doppiaggio — perché: la licenza non è decisa, e nel gioco andranno i file tagliati e
  livellati, non questi.
- **Non generati, di proposito**: le parti intonate (bip, campane, arpa, accordi) e i suoni che il trailer fa solo senza il brano.

## Verifiche
- 87 file su 87 scaricati; ffprobe su ognuno: MP3, 44,1 kHz, stereo, durate uguali a quelle chieste.
- I picchi (`volumedetect`): da −1,3 dB a −44 dB. Molto bassi L01 (il televisore, −36 ÷ −44) e L02 (il ronzio, −33 ÷ −40).
- `diario.mjs verifica` e `registro` in ordine.

## Questioni aperte
- **Simone ascolta e sceglie le prese**, una per suono (più d'una per passi, tasti e carta).
- Poi: tagliare le sequenze in colpi singoli, livellare, convertire in Opus e agganciare al codice (vedi «Che cosa cambierebbe nel
  codice» nel censimento), con un collaudo che controlli livelli e file.
- I master hanno **una sola copia** sul computer, più il conto ElevenLabs: una copia su `F:` la decide Simone.
- La licenza degli effetti col piano di Simone.
