// ====================================================================
//  La firma d'autore come nelle immagini promozionali (locandine/main.ts):
//  «un gioco in FAVELLA1 di Simone Pizzi», Lora corsivo con FAVELLA1 in
//  Sora 700, un poco più piccolo, appena spaziato e più caldo. Sta sotto il
//  titolo del trailer e della sequenza finale. Dal 25 novembre 2026 prende il
//  posto delle due righe «un esperimento in favella 1» e «un gioco di
//  Simone Pizzi» (Simone: «Il sottotitolo deve essere come nei cartelloni»).
// ====================================================================
import { FONT } from "../trailer/font";
import { useLingua } from "../lib/useOpzioni";

/** Le parole attorno al nome del motore, nelle due lingue. */
const PAROLE = {
  it: { prima: "un gioco in", dopo: "di Simone Pizzi" },
  en: { prima: "a", dopo: "game by Simone Pizzi" },
} as const;

interface Props { corpo: number; ombra?: string }

export default function FirmaAutore({ corpo, ombra }: Props) {
  const p = PAROLE[useLingua()];
  // lo stacco attorno a FAVELLA1 è quello della locandina: uno spazio della riga più 0,06 del corpo
  const stacco = `${(corpo * 0.06).toFixed(2)}px`;
  return (
    <span style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 500, fontSize: corpo, lineHeight: 1.2,
      color: "rgba(246,238,226,.95)", textShadow: ombra, whiteSpace: "nowrap" }}>
      {p.prima}{" "}
      <span style={{ fontFamily: FONT.display, fontStyle: "normal", fontWeight: 700, fontSize: Math.round(corpo * 0.78),
        letterSpacing: "0.06em", color: "#ffe3c0", marginLeft: stacco, marginRight:`calc(${stacco} - 0.06em)` }}>FAVELLA1</span>
      {" "}{p.dopo}
    </span>
  );
}
