---
data: 2026-09-29
ora: "19:52"
titolo: "Il trailer ridipinto"
tipo: sessione
versione: 1.2.0
---

# Il trailer ridipinto

## In breve
Il trailer d'apertura è ridipinto da cima a fondo (stessi tempi, stessi testi, stessa musica): ogni inquadratura ha la sua materia, il viandante ha un passo vero, e tutto si prepara mentre girano i loghi.

## Contesto
La regia andava bene; la grafica no: forme piatte disegnate a ogni fotogramma, poco riconoscibili. Si chiedeva un livello superiore, più accurato, più realistico, più riconoscibile.

## Lavoro fatto
- **Gli strumenti della materia.** `texture.ts` (rumore di Perlin e di Voronoi che si ripetono, riempimento per pixel che cede il passo al browser), `pittura.ts` (cielo, aloni, nuvole con luce dal lato del sole, catene di monti con luce radente e nebbia), `scritta.ts` (scrittura corsiva, carta), `font.ts`, `zone.ts`, `cache.ts`.
- **Le scene** (`trailer/scene/`): le lettere sul tavolo di noce; l'alba con raggi, quattro piani di monti, pali del telegrafo coi fili; il fango screpolato visto da vicino con stivali, pantaloni e tanica; l'invaso di sale con la diga, la torre e la barca, e la notte con la Via Lattea; la mappa a curve di livello; il guado a controluce; le cinque regole; i numeri.
- **Il viandante** (`viandante.ts`): figura articolata sulle curve di una camminata umana; il bacino si posa dove il piede d'appoggio tocca terra; `velocitaSuolo` dà la velocità a cui deve scorrere il suolo perché i piedi non scivolino.
- **`Trailer.tsx`**: le cinque icone di chi è rimasto, il velo scuro dietro il titolo, «Preparo il viaggio» con la barra se le tele non sono pronte, la risoluzione che cala da sola se i fotogrammi restano lenti; `window.__trailer.prova(t)` (solo in sviluppo) misura quanto costa un fotogramma.

## Decisioni
- **Tempi, testi e musica non cambiano** (`scaletta.ts`) — perché il brano `intro.mp3` fa da orologio e il montaggio era già approvato: si cambia solo ciò che si vede.
- **Tutto procedurale, nessuna immagine incorporata** — perché il pacchetto resta leggero (il bundle dell'app è di 396 kB) e il trailer è nitido a qualsiasi risoluzione.
- **La materia si dipinge una volta, in tele fuori schermo, durante i loghi** — perché a ogni fotogramma restino copie e qualche bagliore. In sviluppo la preparazione dura circa 5 secondi, a pezzi (il browser non si blocca).
- **Il suolo in prospettiva è «cotto»** — perché la prima versione trasformava una texture enorme per ciascuna delle 500 righe a ogni fotogramma: senza GPU costava 1,2 secondi a fotogramma. Ora per ogni riga dello schermo si cuoce una volta la tessera già ridotta alla sua scala (con media dei pixel coperti), e a ogni fotogramma si copia la riga spostata di quanto ha corso: circa 24 volte più veloce, e senza sfarfallio.
- **La misura dei tempi passa da WebGL, non da `getImageData`** — perché leggere i pixel dal canvas 2D fa passare Chrome al disegno su CPU e falsa tutto.
- **Se il computer non regge, cala la risoluzione (1 → 0,75 → 0,5)** — perché è meglio un trailer un po' meno nitido che a scatti. Scatta dopo due secondi, se i fotogrammi oltre i 36 ms superano di 50 quelli veloci.

## Verifiche
Ispezione di ogni scena a 2560×1440 e del titolo e dell'avvio anche sul telefono in verticale (375×812). Tempo di un fotogramma su 16 istanti del filmato, misurato con la sincronia della GPU (RTX 2070, canvas 2560×1440): mediana da 1,6 a 10 ms, massimo 30 ms in un solo istante. `tsc` senza errori, `npm run build` riuscito, autoverifica superata; `finali.py`, `mirate.py`, `salvataggi.py`, `scorte.py`, `interfaccia.py`, `conferme.py` tutti verdi.

## Questioni aperte
- Senza GPU (disegno su CPU) un fotogramma a 2560×1440 costa da 30 a 115 ms: la risoluzione adattiva lo compensa, ma non è stato provato su un computer davvero modesto.
- I due MP4 in `video/` (non versionati) sono stati esportati con la grafica vecchia; non sono rigenerati.
- Le tele si potrebbero preparare in un Worker con `OffscreenCanvas`, per liberare del tutto il thread principale durante i loghi.
