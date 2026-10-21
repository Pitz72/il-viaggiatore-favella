# Il Viaggiatore — le immagini promozionali

Una sola **key art** in tutti i formati: il guado di Acquamorta al tramonto, il sole tagliato dal campanile, i due
fratelli sul greto, uno per parte, di controluce. In alto il titolo come sul titolo del gioco (Sora 800 spaziato),
«un esperimento in FAVELLA 1» e «un gioco di Simone Pizzi»; la frase del biglietto del fratello, «Non è il caso di
tornare.», scritta a mano (Covered By Your Grace, il carattere del biglietto nel trailer); in basso i marchi di
**Runtime Multimedia** e di **FAVELLA 1** in un colore chiaro, come nei titoli di un film.

| File | Misura | Uso |
|---|---|---|
| `il-viaggiatore-16x9.jpg` | 3840 × 2160 | video, YouTube, schermi, social orizzontali |
| `il-viaggiatore-21x9.jpg` | 5040 × 2160 | copertine larghe, banner, schermi ultrawide |
| `il-viaggiatore-4x3.jpg` | 2880 × 2160 | pagine, presentazioni, schede |
| `il-viaggiatore-1x1.jpg` | 2160 × 2160 | social quadrati, copertine, avatar di pagina |
| `il-viaggiatore-locandina-27x40.jpg` | 2700 × 4000 | la locandina cinematografica (one-sheet 27 × 40 pollici) |
| `il-viaggiatore-github-1280x640.jpg` | 1280 × 640 | l'anteprima social del repository (GitHub → Settings → Social preview) |
| `marchi/RuntimeMultimedia_Bianco.svg` | vettoriale | il marchio ufficiale di Runtime Multimedia, versione «Bianco», usato nelle immagini |

La copertina del README (`../banner.jpg`, 2520 × 1080) è il 21:9 a metà misura.

## Come si rifanno

Le immagini non sono fotogrammi del trailer: sono dipinte apposta, con lo stesso pennello (le tele, la città, i sassi,
le figure di `app/src/trailer/`), alla misura esatta di ogni formato. Il sorgente è in `app/src/locandine/` (la scena,
i formati e l'impaginazione, i marchi); la pagina `app/locandine.html` esiste solo in sviluppo e non entra nella build.

```bash
npm run dev --prefix app                                  # il server di sviluppo sulla 5200
desktop\node_modules\.bin\electron strumenti\locandine.cjs # tutti i formati, qui e in grafica/banner.jpg
desktop\node_modules\.bin\electron strumenti\locandine.cjs --formati 1x1,locandina
```

Il simbolo di FAVELLA 1 viene dai tracciati vettoriali del gioco (`app/src/loghi/forme.ts`, gli stessi dei loghi
d'apertura), pieno in un colore con la gemma d'ambra; la scritta FAVELLA1 è in Sora 700 con le proporzioni del banner
ufficiale. Il marchio di Runtime Multimedia è il file ufficiale qui in `marchi/`, ricolorato in avorio.

## Licenze

Le immagini sono sotto **CC BY-SA 4.0**, come la grafica del gioco (vedi `LICENSE-CONTENUTI.md`). I **marchi** di
Runtime Multimedia e di FAVELLA 1 restano dei rispettivi titolari e non sono coperti da quella licenza: chi riusa le
immagini per altro deve toglierli. I caratteri (Sora, Lora, Source Code Pro, Covered By Your Grace) sono SIL OFL 1.1.
