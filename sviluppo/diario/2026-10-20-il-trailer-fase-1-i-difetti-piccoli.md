---
data: 2026-10-20
ora: "08:29"
titolo: "Il trailer, fase 1: i difetti piccoli"
tipo: sessione
versione: 1.16.2
---

# Il trailer, fase 1: i difetti piccoli

## In breve
Prima fase del piano per l'estetica del trailer (`pre-produzione/07-intro-estetica-e-dettagli.md`): la fase 0 (il banco di confronto) e le voci 2–8, sette difetti piccoli e visibili. Il comportamento, la durata, i tempi, i testi e la musica sono quelli di prima; Simone ha dato il via libera sulle coppie prima/dopo.

## Contesto
Il piano era stato scritto il 20 ottobre senza codice; dopo le risposte di Simone (diario «Le risposte di Simone sul piano dell'intro») si esegue una fase alla volta. Questa è la prima: prima di toccare qualsiasi cosa, un «prima» misurabile.

## Lavoro fatto
- **Fase 0, il banco.** `strumenti/trailer-cattura.cjs` (40 istanti canonici a 1080p, 7 a 4K, in un Electron fuori schermo e deterministico), `trailer-confronta.mjs` (PSNR, quota di pixel diversi e il rettangolo che li contiene, tavole «prima | dopo | differenza»), `trailer-misura.cjs` (costo di un fotogramma). Provato: due catture complete nello stesso ordine sono identiche al bit su 40 istanti su 40. Due scoperte: l'ordine degli istanti conta (alcune scene tengono uno stato: lo stesso istante dopo un altro cambia), e con il computer carico la risoluzione adattiva scende e le catture non si confrontano più, perciò gli strumenti mettono il trailer in pausa appena esiste e dicono se la tela è cambiata.
- **2. La cucitura nelle nuvole** (`trailer/pittura.ts`). Misurata: nelle cinque tele di nuvole la densità saltava, fra l'ultima colonna e la prima, di 12 volte il salto normale (6,8 contro 0,56 sulle alte; 4,5 contro 0,53 sulle basse). La causa è la torsione, che legge il rumore a `u·0,7` e non ha il periodo della tessera. Corretto nell'ultimo 30 % della larghezza, dove la torsione si porta con una curva dolce al valore che ha all'inizio: la tessera si salda e il resto del cielo non cambia. Dopo: cucitura = salto interno in tutte e cinque.
- **3. Il tavolo** (`scene/lettere.ts`): disegnato dentro lo stesso movimento di macchina di lettere e busta (a 1,0 copre esattamente il quadro, poi può solo ingrandire); la luce della lampada resta ferma. Lettere, busta, penna e biglietto sono identici al bit prima e dopo (a 8,3 s l'unica cosa che cambia è il legno).
- **4. I nomi della mappa** (`scene/mappa.ts`): l'ingombro di ogni segno si misura una volta sul disegno vero (`ingombroSegno`), e i nomi si dispongono fuori: sopra, il loro bordo basso sopra il bordo alto del segno; sotto, il bordo alto sotto il bordo basso. «Acquamorta» e «casa» non sono più attraversati dal cerchio, «Le colline» e «06» non toccano le punte.
- **5. «rinunciare»** (`Trailer.tsx`): colonne di 330 px con 12 di spazio, verbi a 56 px. Misurato nel DOM a 54,8 s: 29,2 px liberi a destra e 30,2 a sinistra (prima 0: il verbo era largo 299,5 px nella colonna di 300).
- **6. Le parole chiave.** «A piedi.» e «tuo fratello.» passano da 1,9:1 a 4,7:1 e da 2,1:1 a 4,2:1 contro il fondo accanto alle lettere (misura su catture con e senza testi, `--nascondi "[data-riga]"`); le due righe sopra da 7,0 a 10,6:1 e da 4,3 a 7,0:1. Un primo tentativo con ombre larghe lasciava un bordo duro: le righe del tipo «maschera» sono tagliate da un contenitore con `overflow: hidden`. Un velo per riga copriva la riga vicina. Soluzione: un velo morbido solo per l'alba e uno per il guado (`VELI`), fuori dalla maschera e **sotto tutti i testi**, con la stessa curva di entrata e uscita; le ombre delle parole sono strette e restano dentro la riga. Il colore della parola non cambia.
- **7. Tipografia.** (a) apostrofi tipografici nei testi grandi (`zone.ts`, `Trailer.tsx`: «L’invaso morto», «l’ultima salita», «L’acqua», «che l’acqua ha svuotato», «Un’avventura testuale…», «l’osteria»): cambiano i segni, non le parole; (b) `display()` a −0,01 em; (c) i numeri: colonne a misura del contenuto e cifre tabulari con la larghezza del numero finale (`minWidth` in `ch`), così non si muovono mentre si conta. Misurato: 87–101 px fra contenuto e filetto in tutte e quattro le colonne; fra le cifre 189 · 200 · 189 px (prima 175 · 127 · 171).
- **8. Il titolo** entra sul colpo: l'opacità sale in 0,35 s (82,3 → 82,65) invece di 0,9; spaziatura e sfocatura restano a 2,3 s di assestamento.

## Decisioni
- **La cucitura si cura nel punto, non rifacendo tutto il campo** — perché un primo tentativo con un rumore nuovo per la torsione cambiava il disegno delle nuvole in tutto il cielo (il 14 % dei pixel dell'alba): il piano chiedeva di togliere un difetto, non di ridipingere il cielo. Con la curva dolce nell'ultimo 30 % cambia il 4–5 % dei pixel (la zona della cucitura, che scorre).
- **Il velo per le parole chiave, non un'ombra più larga** — perché la maschera della riga taglia l'ombra con un bordo duro e un velo per riga copre la riga vicina.
- **Il confronto si legge in pixel diversi e in dove, non solo con il PSNR** — perché un testo cambiato di poco porta a 30 dB e una sfumatura diffusa lo lascia alto: la quota di pixel diversi e il loro rettangolo dicono se un cambiamento è dove doveva essere.
- **Versione 1.16.2, patch** — perché sono correzioni dell'aspetto (`sviluppo/VERSIONI.md`, §2): nessuna funzione nuova, nessuna sequenza di comandi cambia.

## Verifiche
- `tsc` pulito, `npm run build` ok (JS 478,6 kB, 160,3 kB gzip), `collaudo/testo.py` ok (il testo dell'avviso è intatto), autoverifica del desktop superata (15 prove).
- Prima/dopo su 40 istanti a 1080p: 4 identici (17,8 · 24 · 34,5 · 51 s) e 36 diversi **nelle zone attese**: cielo (4–5 % dei pixel nelle inquadrature dell'alba), il legno (a 3,4 e 5,5 s), i nomi della mappa (a destra a 41,5, a sinistra a 47,8), la fascia delle cinque colonne, i testi dell'alba e del guado, i numeri, il titolo. Il terra a 19 e 21,5 s cambia solo nel rettangolo dell'apostrofo (0,33 % dei pixel).
- Costo di un fotogramma, prima e dopo nella stessa seduta (RTX 2070, Electron fuori schermo): a 1920 la differenza va da −1,0 a +1,9 ms (a 20 s, la terra, che non ho toccato, +1,9: è il rumore della misura), a 2560 da −3,1 a +0,6 ms; nessuna scena sopra la soglia di +1,5 ms oltre il rumore.
- `intro.mp3` e `scaletta.ts` non toccati; `git diff` solo in `app/src/trailer/**`, `Trailer.tsx` e `strumenti/`.

## Questioni aperte
- Il movimento e il suono li giudica Simone nel trailer vivo; le coppie prima/dopo sono in `collaudo/esiti/confronto-fase1/` (cartella locale).
- Prossima: fase 2 (luce e pellicola: aloni, raggi, grana, notte dell'invaso).
