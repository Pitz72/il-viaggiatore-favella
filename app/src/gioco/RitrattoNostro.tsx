// ====================================================================
//  Il nostro ritratto: il viandante, senza volto.
// --------------------------------------------------------------------
//  Accanto alle risposte di un dialogo parla il protagonista, che un volto
//  non ce l'ha (è chi gioca). Il suo ritratto è la figura dei panorami
//  (trailer/viandante.ts), intera e ferma sull'orizzonte della zona in cui
//  si trova, rivolta verso le risposte: una miniatura del panorama, con il
//  cielo, le colline, la luce di contorno e l'ombra corta di quel momento
//  del viaggio.
// ====================================================================
import { useEffect, useRef } from "react";
import { rgba } from "../trailer/tempo";
import { disegnaViandante } from "../trailer/viandante";
import { luceDi, type Clima, type Luce } from "./Panorama";

/** Dipinge il ritratto su una tela quadrata di `lato` pixel. */
export function dipingiNostro(ctx: CanvasRenderingContext2D, lato: number, luce: Luce) {
  const L = lato, oriz = L * 0.78;
  // il cielo della zona, fino all'orizzonte
  const g = ctx.createLinearGradient(0, 0, 0, oriz);
  luce.cielo.forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, L, L);
  // la luce bassa dietro la figura
  const alone = luce.sole?.alone ?? luce.bordo;
  const a = ctx.createRadialGradient(L * 0.56, oriz, 0, L * 0.56, oriz, L * 0.62);
  a.addColorStop(0, rgba(alone, 0.5)); a.addColorStop(1, rgba(alone, 0));
  ctx.fillStyle = a;
  ctx.fillRect(0, 0, L, L);
  // le colline lontane, due quinte, e il suolo
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
  // il viandante, fermo, rivolto alle risposte; l'ombra corta ai piedi
  const piedi = oriz + L * 0.1, alto = L * 0.7, x = L * 0.47;
  ctx.fillStyle = "rgba(0,0,0,.35)";
  ctx.beginPath(); ctx.ellipse(x, piedi + 1, L * 0.16, L * 0.022, 0, 0, Math.PI * 2); ctx.fill();
  disegnaViandante(ctx, x, piedi, alto, 0, {
    colore: luce.figura, bordo: luce.bordo, latoLuce: 1, verso: 1, fermo: 1, respiro: 0,
    cappello: true, fagotto: true, tanica: true,
  });
}

/** Il ritratto come tela: si ridipinge solo quando cambia la zona. Decorativo (il testo dice già «rispondi a …»). */
export default function RitrattoNostro({ clima, className }: { clima: Clima; className?: string }) {
  const tela = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = tela.current, ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    dipingiNostro(ctx, c.width, luceDi(clima));
  }, [clima]);
  return <canvas ref={tela} width={200} height={200} className={className} aria-hidden="true" />;
}
