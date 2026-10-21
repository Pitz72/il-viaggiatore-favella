// ====================================================================
//  I formati delle immagini promozionali e come si impagina ciascuno.
// --------------------------------------------------------------------
//  Due impaginazioni. «Cielo» (i formati larghi e il quadrato): il titolo
//  in alto, nel cielo già notte; in basso, fra i due fratelli, la frase del
//  biglietto e i due marchi. «Locandina» (il manifesto 27×40): la frase in
//  alto, nel buio; la scena; in fondo, sul greto che si spegne, il titolo,
//  l'autore e il blocco dei marchi, come nei manifesti dei film.
//  Le misure dei testi sono in pixel dell'uscita; la scena in unità di
//  progetto (scena.ts): `larghezza` dice quanta se ne vede, `alto` dov'è
//  il bordo di sopra.
// ====================================================================
export interface Formato {
  id: string;
  /** il file d'uscita, senza estensione */
  file: string;
  nome: string;
  w: number; h: number;
  impagina: "cielo" | "locandina";
  larghezza: number; alto: number;
  /** metà della distanza fra i due fratelli (unità) */
  distanza: number;
  /** i testi: y della linea di base e corpo, in px */
  titolo: { y: number; corpo: number };
  sotto: { y: number; corpo: number };
  autore: { y: number; corpo: number };
  frase: { y: number; corpo: number };
  marchi: { y: number; alto: number };
  /** da dove (frazione dell'altezza) il basso comincia a spegnersi, e quanto (0…1) */
  buio: { da: number; forza: number };
}

// i formati larghi hanno la stessa altezza di scena (1080 unità, da −40): cambia solo quanto si vede ai lati
const largo = (id: string, file: string, nome: string, w: number, h: number, titolo: number): Formato => {
  const s = h / 2160;
  return {
    id, file, nome, w, h, impagina: "cielo", larghezza: (w / h) * 1080, alto: -40, distanza: 300,
    titolo: { y: 430 * s, corpo: titolo * s },
    sotto: { y: 545 * s, corpo: 40 * s },
    autore: { y: 650 * s, corpo: 66 * s },
    frase: { y: 1972 * s, corpo: 98 * s },
    marchi: { y: 2070 * s, alto: 88 * s },
    buio: { da: 0.8, forza: 0.62 },
  };
};

export const FORMATI: Formato[] = [
  largo("16x9", "il-viaggiatore-16x9", "16:9", 3840, 2160, 250),
  largo("21x9", "il-viaggiatore-21x9", "21:9", 5040, 2160, 270),
  largo("4x3", "il-viaggiatore-4x3", "4:3", 2880, 2160, 196),
  {
    id: "1x1", file: "il-viaggiatore-1x1", nome: "quadrata", w: 2160, h: 2160, impagina: "cielo",
    larghezza: 1200, alto: -120, distanza: 270,
    titolo: { y: 420, corpo: 152 },
    sotto: { y: 508, corpo: 30 },
    autore: { y: 592, corpo: 52 },
    frase: { y: 1985, corpo: 76 },
    marchi: { y: 2078, alto: 60 },
    buio: { da: 0.8, forza: 0.62 },
  },
  {
    id: "locandina", file: "il-viaggiatore-locandina-27x40", nome: "locandina 27×40", w: 2700, h: 4000, impagina: "locandina",
    larghezza: 1150, alto: -480, distanza: 250,
    frase: { y: 420, corpo: 132 },
    titolo: { y: 3440, corpo: 196 },
    sotto: { y: 3548, corpo: 38 },
    autore: { y: 3660, corpo: 64 },
    marchi: { y: 3850, alto: 96 },
    buio: { da: 0.76, forza: 0.97 },
  },
  // l'anteprima social del repository su GitHub (Settings → Social preview): 1280×640; la si vede piccola, quindi
  // la frase e i marchi più grandi, e più in basso il titolo
  (() => {
    const f = largo("github", "il-viaggiatore-github-1280x640", "anteprima GitHub", 1280, 640, 260);
    return { ...f, sotto: { y: 166, corpo: 14 }, autore: { y: 198, corpo: 24 }, frase: { y: 580, corpo: 36 }, marchi: { y: 616, alto: 30 } };
  })(),
];
