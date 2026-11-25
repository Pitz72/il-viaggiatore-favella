# Il Viaggiatore — le immagini promozionali

Una sola **key art** pittorica a gouache e china in tutti i formati, coerente con la veste grafica del gioco: il guado
di Acquamorta al tramonto ramato, il campanile mozzato e le case in rovina sul poggio, i due fratelli che si fronteggiano
da una sponda all'altra (il Viaggiatore col cappello a tesa larga, la coperta arrotolata e la tanica metallica; il fratello
a capo scoperto sull'altra riva). Il titolo è composto come nel gioco (Sora 800 spaziato), accompagnato dalla firma
«un gioco in FAVELLA1 di Simone Pizzi» e dalla frase del biglietto del fratello, «Non è il caso di tornare.», scritta a
mano (Covered By Your Grace); in basso i marchi di **Runtime Multimedia** e di **FAVELLA 1** in avorio caldo, come nei
titoli di un film.

| File | Misura | Uso |
|---|---|---|
| `il-viaggiatore-locandina-27x40.jpg` | 2700 × 4000 | la locandina cinematografica (one-sheet 27 × 40 pollici) |
| `il-viaggiatore-16x9.jpg` | 3840 × 2160 | video, YouTube, schermi, social orizzontali |
| `il-viaggiatore-21x9.jpg` | 5040 × 2160 | copertine larghe, banner, schermi ultrawide |
| `il-viaggiatore-1x1.jpg` | 2160 × 2160 | social quadrati, copertine, diffusione del progetto |
| `il-viaggiatore-4x3.jpg` | 2880 × 2160 | pagine, presentazioni, schede |
| `il-viaggiatore-github-1280x640.jpg` | 1280 × 640 | l'anteprima social del repository e Open Graph (`anteprima.jpg`) |
| `tavole/{locandina,panoramica,quadrata}.webp` | alta risoluzione | le tre tavole pittoriche maestre senza testi, usate dal generatore |
| `marchi/RuntimeMultimedia_Bianco.svg` | vettoriale | il marchio ufficiale di Runtime Multimedia, versione «Bianco», usato nelle immagini |

Dal `21:9` escono anche la copertina del README e della pagina web (`../banner.jpg`, 2520 × 1080) e il banner di itch.io
(`../itch/banner-960x411.jpg`); dal `4:3` esce la copertina di itch.io (`../itch/copertina-630x500.jpg`).

## Come si rifanno

Il sorgente d'impaginazione è in `app/src/locandine/` (inquadratura delle tavole e velature, formati, tipografia e marchi).
`strumenti/locandine.cjs` compila al volo in memoria il modulo e dipinge ogni formato fuori schermo con Electron, senza
bisogno di avviare il server di sviluppo:

```bash
desktop\node_modules\.bin\electron strumenti\locandine.cjs                  # tutti i formati + banner.jpg + itch/
desktop\node_modules\.bin\electron strumenti\locandine.cjs --formati 1x1,locandina
```

Il simbolo di FAVELLA 1 viene dai tracciati vettoriali del gioco (`app/src/loghi/forme.ts`, gli stessi dei loghi
d'apertura), pieno in un colore con la gemma d'ambra; la scritta FAVELLA1 è in Sora 700 con le proporzioni del banner
ufficiale. Il marchio di Runtime Multimedia è il file ufficiale qui in `marchi/`, ricolorato in avorio.

## Licenze

Le immagini sono sotto **CC BY-SA 4.0**, come la grafica del gioco (vedi `LICENSE-CONTENUTI.md`). I **marchi** di
Runtime Multimedia e di FAVELLA 1 restano dei rispettivi titolari e non sono coperti da quella licenza: chi riusa le
immagini per altro deve toglierli. I caratteri (Sora, Lora, Source Code Pro, Covered By Your Grace) sono SIL OFL 1.1.
