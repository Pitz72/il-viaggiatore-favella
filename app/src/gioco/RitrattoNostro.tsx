// ====================================================================
//  Il nostro ritratto: il viandante senza volto, in cammeo dipinto.
// --------------------------------------------------------------------
//  Accanto alle risposte di un dialogo parla il protagonista, che un volto
//  frontale non ce l'ha (è chi gioca, immagini.ts:9). Il suo ritratto usa
//  il cammeo dipinto a gouache e china di tre quarti di spalle
//  (immagini/scene/viandante.webp, su fondo #0b0a0e come i quattordici
//  personaggi), velato sulla spalla e sul collo dalla luce viva della zona
//  in cui si trova. Finché l'immagine carica (o in assenza di rete), cade
//  morbido sulla miniatura procedurale del panorama.
// ====================================================================
import { useEffect, useRef } from "react";
import { rgba } from "../trailer/tempo";
import { disegnaViandante } from "../trailer/viandante";
import { luceDi, type Clima, type Luce } from "./Panorama";

let cammeoImg: HTMLImageElement | null = null;
let cammeoStato: "vuoto" | "carica" | "pronto" | "errore" = "vuoto";
const inAttesa = new Set<() => void>();

function avviaCammeo() {
  if (cammeoStato !== "vuoto" || typeof Image === "undefined") return;
  cammeoStato = "carica";
  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    cammeoImg = img;
    cammeoStato = "pronto";
    for (const fn of inAttesa) fn();
    inAttesa.clear();
  };
  img.onerror = () => {
    cammeoStato = "errore";
    inAttesa.clear();
  };
  img.src = `${import.meta.env.BASE_URL}immagini/scene/viandante.webp`;
}

/** Dipinge il ritratto su una tela quadrata di `lato` pixel. */
export function dipingiNostro(ctx: CanvasRenderingContext2D, lato: number, luce: Luce) {
  const L = lato;
  avviaCammeo();

  if (cammeoStato === "pronto" && cammeoImg) {
    ctx.save();
    ctx.fillStyle = "#0b0a0e";
    ctx.fillRect(0, 0, L, L);
    ctx.drawImage(cammeoImg, 0, 0, L, L);

    // Velatura atmosferica della zona corrente sul lato illuminato (sinistra/alto), preservando i neri #0b0a0e
    const tinta = luce.sole?.alone ?? luce.bordo;
    ctx.globalCompositeOperation = "soft-light";
    const gt = ctx.createRadialGradient(L * 0.24, L * 0.34, L * 0.04, L * 0.35, L * 0.45, L * 0.72);
    gt.addColorStop(0, rgba(tinta, 0.62));
    gt.addColorStop(0.55, rgba(tinta, 0.24));
    gt.addColorStop(1, rgba(tinta, 0));
    ctx.fillStyle = gt;
    ctx.fillRect(0, 0, L, L);

    // Leggero alone di controluce radente nell'angolo della zona, senza schiarire il bordo nero
    ctx.globalCompositeOperation = "screen";
    const gr = ctx.createRadialGradient(L * 0.26, L * 0.28, 2, L * 0.26, L * 0.28, L * 0.44);
    gr.addColorStop(0, rgba(tinta, 0.14));
    gr.addColorStop(1, rgba(tinta, 0));
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, L, L);

    // Anello scuro sul margine del medaglione per raccordarsi a #0b0a0e
    ctx.globalCompositeOperation = "source-over";
    const gv = ctx.createRadialGradient(L * 0.5, L * 0.5, L * 0.36, L * 0.5, L * 0.5, L * 0.51);
    gv.addColorStop(0, "rgba(11,10,14,0)");
    gv.addColorStop(1, "rgba(11,10,14,0.92)");
    ctx.fillStyle = gv;
    ctx.fillRect(0, 0, L, L);
    ctx.restore();
    return;
  }

  // Ripiego procedurale immediato finché il WebP non è pronto
  const oriz = L * 0.78;
  const g = ctx.createLinearGradient(0, 0, 0, oriz);
  luce.cielo.forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, L, L);
  const alone = luce.sole?.alone ?? luce.bordo;
  const a = ctx.createRadialGradient(L * 0.56, oriz, 0, L * 0.56, oriz, L * 0.62);
  a.addColorStop(0, rgba(alone, 0.5)); a.addColorStop(1, rgba(alone, 0));
  ctx.fillStyle = a;
  ctx.fillRect(0, 0, L, L);
  luce.strati.forEach(([col], i) => {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(0, L);
    for (let x = 0; x <= L; x += L / 24) {
      const y = oriz - L * (0.1 - i * 0.045) * (0.55 + 0.45 * Math.sin((x / L) * (3.1 + i * 2.3) + 1.7 + i));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(L, L); ctx.closePath(); ctx.fill();
  });
  ctx.fillStyle = luce.suolo;
  ctx.fillRect(0, oriz, L, L - oriz);
  const piedi = oriz + L * 0.1, alto = L * 0.7, x = L * 0.47;
  ctx.fillStyle = "rgba(0,0,0,.35)";
  ctx.beginPath(); ctx.ellipse(x, piedi + 1, L * 0.16, L * 0.022, 0, 0, Math.PI * 2); ctx.fill();
  disegnaViandante(ctx, x, piedi, alto, 0, {
    colore: luce.figura, bordo: luce.bordo, latoLuce: 1, verso: 1, fermo: 1, respiro: 0,
    cappello: true, fagotto: true, tanica: true, dettaglio: 1,
  });
}

/** Il ritratto come tela: si ridipinge solo quando cambia la zona o arriva il cammeo. */
export default function RitrattoNostro({ clima, className }: { clima: Clima; className?: string }) {
  const tela = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ridisegna = () => {
      const c = tela.current, ctx = c?.getContext("2d");
      if (!c || !ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);
      dipingiNostro(ctx, c.width, luceDi(clima));
    };
    ridisegna();
    if (cammeoStato === "carica") {
      inAttesa.add(ridisegna);
      return () => { inAttesa.delete(ridisegna); };
    }
  }, [clima]);
  return <canvas ref={tela} width={200} height={200} className={className} aria-hidden="true" />;
}
