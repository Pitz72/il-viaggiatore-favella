// ====================================================================
//  Le tavole dipinte a gouache e china del trailer (immagini/scene/trailer/).
//  Si precaricano insieme alle tele di paesaggi.ts prima dell'avvio, così
//  al secondo 0 ogni scena ha già il suo fondale pronto; se l'ambiente non
//  ha DOM (prove Node) o un file manca, il caricamento si chiude senza blocchi
//  e le scene usano il ripiego procedurale su tela.
// ====================================================================

export interface TavoleTrailer {
  lettere: HTMLImageElement | null;
  alba: HTMLImageElement | null;
  terra: HTMLImageElement | null;
  invaso: HTMLImageElement | null;
  guado: HTMLImageElement | null;
  cinque: (HTMLImageElement | null)[];
}

export const tavoleTrailer: TavoleTrailer = {
  lettere: null,
  alba: null,
  terra: null,
  invaso: null,
  guado: null,
  cinque: [null, null, null, null, null],
};

let promessa: Promise<void> | null = null;

function caricaImmagine(url: string): Promise<HTMLImageElement | null> {
  if (typeof Image === "undefined") return Promise.resolve(null);
  return new Promise((risolvi) => {
    const img = new Image();
    img.decoding = "async";
    let chiuso = false;
    const fine = (esito: HTMLImageElement | null) => {
      if (chiuso) return;
      chiuso = true;
      window.clearTimeout(scadenza);
      risolvi(esito);
    };
    const scadenza = typeof window !== "undefined" ? window.setTimeout(() => fine(null), 6000) : 0;
    img.onload = () => fine(img);
    img.onerror = () => fine(null);
    img.src = url;
  });
}

export function caricaTavoleTrailer(): Promise<void> {
  if (promessa) return promessa;
  const base = `${import.meta.env.BASE_URL}immagini/scene/trailer/`;
  promessa = Promise.all([
    caricaImmagine(`${base}lettere.webp`).then((i) => { tavoleTrailer.lettere = i; }),
    caricaImmagine(`${base}alba.webp`).then((i) => { tavoleTrailer.alba = i; }),
    caricaImmagine(`${base}terra.webp`).then((i) => { tavoleTrailer.terra = i; }),
    caricaImmagine(`${base}invaso.webp`).then((i) => { tavoleTrailer.invaso = i; }),
    caricaImmagine(`${base}guado.webp`).then((i) => { tavoleTrailer.guado = i; }),
    ...[0, 1, 2, 3, 4].map((k) =>
      caricaImmagine(`${base}cinque-${k + 1}.webp`).then((i) => { tavoleTrailer.cinque[k] = i; }),
    ),
  ]).then(() => undefined);
  return promessa;
}

/** Disegna una tavola 16:9 coprendo la superficie (w × h) con lieve movimento di macchina. */
export function disegnaTavola(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  opz: { zoom?: number; panX?: number; panY?: number; alfa?: number } = {},
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const zoom = opz.zoom ?? 1;
  const scala = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * scala;
  const dh = ih * scala;
  const dx = (w - dw) * 0.5 + (opz.panX ?? 0);
  const dy = (h - dh) * 0.5 + (opz.panY ?? 0);
  ctx.save();
  if (opz.alfa !== undefined) ctx.globalAlpha *= opz.alfa;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}
