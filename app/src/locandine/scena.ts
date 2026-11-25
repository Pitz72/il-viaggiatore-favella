// ====================================================================
//  La key art pittorica per le immagini promozionali.
// --------------------------------------------------------------------
//  Carica la tavola maestra dipinta a gouache e china corrispondente al
//  formato («panoramica», «quadrata» o «locandina»), la inquadra senza
//  deformazioni alle misure esatte d'uscita e raccorda con morbidezza
//  cinematografica il cielo crepuscolare in alto e il greto scuro in basso,
//  aggiungendo un soffio di pulviscolo ambrato sul tramonto.
// ====================================================================
import { pulviscolo } from "../trailer/pittura";
import type { Formato, Tavola } from "./formati";

/** Carica un'immagine da un indirizzo (o data URL) e attende la decodifica completa. */
export function caricaImmagine(url: string): Promise<HTMLImageElement> {
  return new Promise((ok, ko) => {
    const im = new Image();
    im.decoding = "sync";
    im.onload = () => ok(im);
    im.onerror = () => ko(new Error(`Tavola non trovata: ${url}`));
    im.src = url;
  });
}

/** Indirizzo di una tavola maestra (passato da locandine.cjs o letto dal protocollo locale). */
export function urlTavola(tavola: Tavola, sorgenti?: Partial<Record<Tavola, string>>): string {
  if (sorgenti?.[tavola]) return sorgenti[tavola]!;
  return `./tavole/${tavola}.webp`;
}

/** Disegna la tavola pittorica, i raccordi tonali e le velature per i testi sul contesto d'uscita. */
export function dipingiTavola(g: CanvasRenderingContext2D, f: Formato, im: HTMLImageElement): void {
  const { w, h, scena } = f;
  g.save();
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "high";

  if (scena.modo === "locandina") {
    // Sfondo tonale continuo fra il cielo notturno in cima e l'ombra seppia-carbone in fondo
    const fondo = g.createLinearGradient(0, 0, 0, h);
    fondo.addColorStop(0, "#1c1416");
    fondo.addColorStop(0.12, "#352c2b");
    fondo.addColorStop(0.82, "#190f0a");
    fondo.addColorStop(1, "#090504");
    g.fillStyle = fondo;
    g.fillRect(0, 0, w, h);

    const y0 = scena.yTavola ?? 52;
    const hTav = Math.round(w * (im.naturalHeight / im.naturalWidth));
    g.drawImage(im, 0, y0, w, hTav);

    // Raccordo superiore invisibile sopra l'attacco della tavola
    const raccSu = g.createLinearGradient(0, Math.max(0, y0 - 16), 0, y0 + Math.round(h * 0.06));
    raccSu.addColorStop(0, "#241b1d");
    raccSu.addColorStop(0.35, "rgba(36,27,29,.88)");
    raccSu.addColorStop(1, "rgba(36,27,29,0)");
    g.fillStyle = raccSu;
    g.fillRect(0, 0, w, y0 + Math.round(h * 0.06));

    // Quinta scura cinematografica in basso per titolo, firma e marchi
    const yBasso = h * f.veloBasso.da;
    const quintaGiu = g.createLinearGradient(0, yBasso, 0, h);
    quintaGiu.addColorStop(0, "rgba(11,6,4,0)");
    quintaGiu.addColorStop(0.42, `rgba(11,6,4,${(f.veloBasso.forza * 0.80).toFixed(3)})`);
    quintaGiu.addColorStop(0.74, `rgba(9,5,4,${(f.veloBasso.forza * 0.98).toFixed(3)})`);
    quintaGiu.addColorStop(1, "#080403");
    g.fillStyle = quintaGiu;
    g.fillRect(0, yBasso, w, h - yBasso);
  } else {
    g.fillStyle = "#0e090a";
    g.fillRect(0, 0, w, h);
    const k = Math.max(w / im.naturalWidth, h / im.naturalHeight);
    const dw = im.naturalWidth * k;
    const dh = im.naturalHeight * k;
    const dx = (w - dw) / 2 + (scena.dx ?? 0);
    const dy = (h - dh) / 2 + (scena.dy ?? 0);
    g.drawImage(im, dx, dy, dw, dh);

    // Velatura morbida inferiore sotto la frase del biglietto e i marchi
    const yBasso = h * f.veloBasso.da;
    const giu = g.createLinearGradient(0, yBasso, 0, h);
    giu.addColorStop(0, "rgba(9,5,4,0)");
    giu.addColorStop(0.50, `rgba(9,5,4,${(f.veloBasso.forza * 0.68).toFixed(3)})`);
    giu.addColorStop(1, `rgba(8,4,3,${f.veloBasso.forza.toFixed(3)})`);
    g.fillStyle = giu;
    g.fillRect(0, yBasso, w, h - yBasso);
  }

  // Velatura superiore del crepuscolo per staccare con naturalezza i testi alti
  if (f.veloAlto.forza > 0) {
    const hAlto = h * f.veloAlto.finoA;
    const su = g.createLinearGradient(0, 0, 0, hAlto);
    su.addColorStop(0, `rgba(10,6,8,${f.veloAlto.forza.toFixed(3)})`);
    su.addColorStop(0.55, `rgba(10,6,8,${(f.veloAlto.forza * 0.42).toFixed(3)})`);
    su.addColorStop(1, "rgba(10,6,8,0)");
    g.fillStyle = su;
    g.fillRect(0, 0, w, hAlto);
  }

  // Caldo bagliore atmosferico sull'acqua ramata e lieve pulviscolo dorato nel controluce
  g.globalCompositeOperation = "screen";
  const bagliore = g.createRadialGradient(w * 0.52, h * 0.56, w * 0.04, w * 0.52, h * 0.56, Math.max(w, h) * 0.46);
  bagliore.addColorStop(0, "rgba(255,156,88,.10)");
  bagliore.addColorStop(0.55, "rgba(214,96,52,.04)");
  bagliore.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = bagliore;
  g.fillRect(0, 0, w, h);

  pulviscolo(
    g, 3.7, 63, Math.round(42 * (w / 2160)),
    { x: w * 0.08, y: h * 0.24, w: w * 0.84, h: h * 0.52 },
    "#ffbe92", 0.34, Math.max(1.8, w / 1100),
  );

  // Vignettatura perimetrale delicata da pellicola
  g.globalCompositeOperation = "source-over";
  const vign = g.createRadialGradient(w / 2, h * 0.52, Math.min(w, h) * 0.38, w / 2, h * 0.52, Math.hypot(w, h) * 0.64);
  vign.addColorStop(0, "rgba(0,0,0,0)");
  vign.addColorStop(1, "rgba(6,3,4,.42)");
  g.fillStyle = vign;
  g.fillRect(0, 0, w, h);

  g.restore();
}
