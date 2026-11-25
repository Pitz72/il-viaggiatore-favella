// ====================================================================
//  La prospettiva delle tavole dipinte: dove sta e quanto è alta una figura.
// --------------------------------------------------------------------
//  Ogni tavola è un paesaggio fermo visto da una macchina da presa: ha un
//  punto di fuga, un orizzonte, un'altezza da terra e una focale. Da queste
//  quattro misure, e non a occhio, si ricava dove cadono sullo schermo i
//  piedi di chi sta a X metri di lato e a Z metri di distanza, e quanti pixel
//  vale lì un metro. Chi cammina fa un tanto di metri a ogni passo
//  (figura.ts: FALCATA): se si allontana, sale verso l'orizzonte e
//  rimpicciolisce come vuole la tavola; se attraversa il quadro, resta sulla
//  sua riga e avanza della lunghezza dei suoi passi. È ciò che tiene i piedi
//  fermi a terra: prima la figura scivolava su un tragitto disegnato a mano.
// ====================================================================

export interface Macchina {
  /** il punto di fuga delle linee che vanno in profondità (px, sul quadro 1920×1080) */
  fugaX: number;
  /** la riga dell'orizzonte (px) */
  orizzonte: number;
  /** quanto sta alta da terra la macchina (metri) */
  alta: number;
  /** la focale (px): quanti pixel vale un metro a un metro di distanza */
  focale: number;
}

/** La statura del viandante (metri). */
export const STATURA = 1.78;

export interface Posto {
  /** dove toccano terra i piedi (px) */
  x: number;
  y: number;
  /** pixel per metro a quella distanza */
  scala: number;
  /** la statura in pixel */
  alto: number;
  /** quanto un metro in profondità sale sullo schermo rispetto a un metro di lato: la tangente dell'angolo con cui la
   *  macchina guarda il suolo in quel punto. Serve alla figura di spalle, per i piedi che vanno avanti e indietro. */
  scorcio: number;
}

/** Dove sta sullo schermo chi è a `X` metri di lato dall'asse della macchina e a `Z` metri di distanza. */
export function aTerra(m: Macchina, X: number, Z: number): Posto {
  const scala = m.focale / Z;
  return { x: m.fugaX + X * scala, y: m.orizzonte + m.alta * scala, scala, alto: STATURA * scala, scorcio: m.alta / Z };
}

/** A quanti metri sta il suolo che si vede alla riga `y` dello schermo. */
export const distanzaDi = (m: Macchina, y: number) => (m.focale * m.alta) / (y - m.orizzonte);

/** L'integrale di `f` fra `a` e `b` (regola dei trapezi): la strada fatta da chi rallenta e si ferma. */
export function integra(f: (t: number) => number, a: number, b: number, passi = 48): number {
  if (b <= a) return 0;
  const h = (b - a) / passi;
  let s = (f(a) + f(b)) / 2;
  for (let i = 1; i < passi; i++) s += f(a + i * h);
  return s * h;
}
