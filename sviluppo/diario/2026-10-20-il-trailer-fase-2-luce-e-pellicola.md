---
data: 2026-10-20
ora: "10:30"
titolo: "Il trailer, fase 2: luce e pellicola"
tipo: sessione
versione: 1.17.0
---

# Il trailer, fase 2: luce e pellicola

## In breve
Seconda fase del piano 07 (voci 9–12): il sole dorato invece che giallo limone, raggi di luce dai bordi morbidi, una grana di pellicola uguale a ogni risoluzione e la notte dell'invaso con la materia della diga e la luna. Il comportamento, la durata, i tempi, i testi e la musica non cambiano; Simone ha dato il via libera sulle coppie prima/dopo, sulla grana 1:1 e sui clip con la musica.

## Contesto
Dopo la fase 1 (1.16.2) restava ciò che cambia l'aspetto di molte inquadrature: la luce e la pellicola. Il «prima» è lo stato di fine fase 1 (catture deterministiche `dopo-fase1`).

## Lavoro fatto
- **9. Gli aloni** (`scene/alba.ts`). I grandi aloni del sole (tre per l'alba e il titolo, più quello che scalda le nuvole) si compongono in `screen` e non in `lighter`; il disco, il suo alone stretto e i raggi restano in somma, perché sono i soli a dare al sole la luce viva. I due aloni vicini al sole sono un poco più caldi (`#ffc486`, `#ffe9c6`). Misura (tinta media dei pixel luminosi in una corona intorno al sole, 90–260 px): all'alba, 16,5 s, **47,8° → 38,6°**; al titolo, 87 s, **55,0° → 44,1°** (84,5 s: 58,7° → 47,0°). Un primo tentativo con tutto in `screen` (raggi compresi) dava 42° ma spegneva il sole: scartato. La luminosità del quadro intorno al sole scende di poco; l'obiettivo «≤ 42°» è raggiunto all'alba e sfiorato al titolo, dove il cielo di base dell'orizzonte (#ffe0a4) ha già 40°.
- **10. I raggi** (`trailer/pittura.ts`, `scene/alba.ts`, `scene/guado.ts`). Nuova `raggioMorbido()`: uno spicchio dall'apice, dissolto verso la fine e sfocato ai lati, dipinto una volta a mezza risoluzione (sette aperture diverse, condivise), e `disegnaRaggio()` che lo copia a ogni fotogramma con l'opacità che respira (×1,3: i bordi morbidi tolgono contrasto). Prima ogni fotogramma tracciava nove (alba) e otto (guado) spicchi con un gradiente radiale ciascuno e i lati netti. Il primo valore della sfocatura (7 px) cancellava i raggi; con 2,5 px a mezza risoluzione restano raggi, ma morbidi.
- **11. La grana** (`components/Trailer.tsx`). Misurata prima: la grana (con meno senza, lo stesso istante) aveva σ = 5,7 / 4,0 / 3,8 livelli a 1080p / 1440p / 4K e correlazione a 1 px = 0,08 / 0,56 / 0,79: rumore bianco a 1080p, blob di 2×2 pixel a 4K. E, scoperta: la vecchia grana stava dentro la superficie scalata, che per il CSS è un gruppo isolato, perciò `mix-blend-mode: overlay` non si fondeva col disegno ma si sommava come grigio al 7,5 % (la stessa σ nelle ombre e nelle luci, e un velo grigio sui neri). Ora: una tessera di 256 px di rumore gaussiano sfumato con il nucleo [0,12 0,76 0,12] (grano di 1–1,4 pixel), con un filo di colore, generata dal seme fisso e dimensionata sui pixel veri (`devicePixelRatio`); due strati dalla stessa tessera, `soft-light` (0,30) e `overlay` (0,035), **fuori** dalla superficie scalata (la vignetta con loro) così si fondono davvero; cambia a 24 fotogrammi al secondo con uno scostamento che è un hash del numero di fotogramma, dal tempo del trailer (sul menu, fermo, dal tempo vero). Il preload del banco nasconde i due strati (`data-grana`). Dopo: σ = **4,04 / 4,04 / 4,05** e correlazione 0,29–0,30 a 1080p / 1440p / 4K; nelle ombre la grana è più bassa (σ 1,4 a luminanza 12), ed è giusto, ma il banding resta coperto: un gradiente scuro con i livelli stirati ×12 mostra senza grana il suo gradino, con la grana nuova no.
- **12. La notte dell'invaso** (`scene/invaso.ts`). La diga non è più un poligono nero: il velo scuro lascia il 15–20 % del cemento (0,05 + 0,80·notte), con un velo freddo della luna più forte in alto, il ciglio più luminoso e freddo, e un bordo di luna sulla torre (a sinistra e in cima). Sul sale, un velo di trattini freddi (110, deterministici) che si allungano e si spengono con la distanza dall'orizzonte e si infittiscono sotto la luna. Luminosità media del quadro quasi invariata: 58,4 → 60,1 a 31 s, 18,2 → 18,7 a 33 s.
- **Per chi sviluppa:** `strumenti/trailer-clip.cjs`, un breve video con la musica per i confronti in movimento (i quattro clip della fase stanno in `video/`, non versionati).

## Decisioni
- **I grandi aloni in `screen`, il resto in somma** — perché il difetto è la somma dei grandi aloni (R e G si saturano insieme, B no); il disco e i raggi non ne hanno la colpa e danno al sole la luce.
- **La grana fuori dalla superficie scalata** — perché dentro non si fonde: la scoperta dell'isolamento spiega anche perché «overlay» non cambiava con la luminosità. Come effetto collaterale i neri sono più profondi di prima: è il comportamento giusto di una grana a fusione, e il «prima» era un velo grigio.
- **Due strati con la stessa tessera, non due tessere** — perché basta lo stesso rumore con due formule di fusione; una tessera costa 256×256 pixel.
- **1.17.0, minor** — perché è una ridipintura di luce e pellicola come il «trailer ridipinto» del 1.2.0 (`sviluppo/VERSIONI.md`, §2): nel dubbio il livello più alto.

## Verifiche
- `tsc` pulito, `npm run build` ok, `collaudo/testo.py` ok (l'avviso è intatto), autoverifica del desktop superata (15 prove); `intro.mp3` sha256 `6081499c…` invariato; `git diff` solo in `app/src/trailer/**`, `Trailer.tsx` e `strumenti/`.
- Prima/dopo (catture deterministiche, grana nascosta) su 40 istanti: **19 identici e 21 diversi, nelle zone attese**: l'alba (11 · 13,5 · 16,5 · 17,5 s, il 12–23 % dei pixel: gli aloni), l'invaso (28,5 · 31 · 33: la diga e la notte), il guado (64,5 · 66,8: i raggi, il 17 %), il titolo (82,8 · 84,5 · 87 · 88,5 s, l'8–9 %). Differenze sotto 2 livelli (PSNR > 80 dB) a 54,8 · 57,5 · 59,4 · 79,6 · 81,2 · 81,6 s.
- Costo di un fotogramma, prima e dopo nella stessa seduta: a 1920 da −1,8 a +1,4 ms, a 2560 da −2,8 a +1,4 ms (nel rumore: la scena dell'alba, la più toccata, 13 s: −0,1 e −0,2). La grana, che sta nel DOM e non nella tela, non entra in questa misura.
- I clip in `video/` (10 s della notte, 11,9 s fino al titolo, prima e dopo): i video «dopo» pesano 25 e 20 MB, i «prima» 77 e 88 (la vecchia grana, bianca e diversa a ogni fotogramma, non si comprimeva).

## Questioni aperte
- Le immagini prima/dopo e la grana 1:1 sono in `collaudo/esiti/confronto-fase2/` (locale).
- Prossima: fase 3 (suono: la latenza d'uscita, 14, e i passi, 15; il compressore, 13, è caduto).
