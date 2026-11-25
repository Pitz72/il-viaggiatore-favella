// ====================================================================
//  Il panorama del gioco: una striscia di paesaggio viva in cima allo
//  schermo, dipinta a gouache e china come i ritratti e il trailer
//  (immagini/scene/panorama/*.webp) con luci vive, fumo, pulviscolo,
//  riflessi d'acqua e il Viandante che cammina ad ogni spostamento.
//  Se una tavola sta ancora caricando, il fondo procedurale ne tiene il
//  posto senza scatti. In pausa o a movimento ridotto fermo l'anello di
//  requestAnimationFrame si spegne davvero a zero CPU/GPU (B19).
// ====================================================================
import { useEffect, useLayoutEffect, useRef } from "react";
import { crinale, rng, mix, rgba, clamp } from "../trailer/tempo";
import { disegnaViandante } from "../trailer/viandante";
import { ascoltaOpzioni, opzioni } from "../lib/opzioni";
import { movimentoRidotto } from "../lib/accessibilita";
import type { ZoneKey } from "../data/viaggiatore";

export type Clima = ZoneKey | "vinta" | "terminata" | "persa";

const PW = 1280, PH = 200;
const ORIZ = 132;

// --- Caricamento pigro con cache delle 15 tavole panoramiche -----------
const tavoleCache = new Map<string, HTMLImageElement | "carica" | "errore">();
const ascoltatoriTavole = new Set<() => void>();

function tavolaPanorama(id: string | null): HTMLImageElement | null {
  if (!id || typeof Image === "undefined") return null;
  const gia = tavoleCache.get(id);
  if (gia instanceof HTMLImageElement) return gia;
  if (gia === "carica" || gia === "errore") return null;
  tavoleCache.set(id, "carica");
  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    tavoleCache.set(id, img);
    for (const fn of ascoltatoriTavole) fn();
  };
  img.onerror = () => {
    tavoleCache.set(id, "errore");
  };
  img.src = `${import.meta.env.BASE_URL}immagini/scene/panorama/${id}.webp`;
  return null;
}

function idTavolaDi(clima: Clima, dentro: Interno | undefined): string | null {
  if (dentro) {
    if (dentro.tipo === "stanza") return dentro.arredo ?? "casotto";
    if (dentro.tipo === "galleria") return "condotta";
    return dentro.tipo; // serra, grotta, torre
  }
  if (clima === "z0") return null;
  if (clima === "vinta" || clima === "terminata") return "z7";
  if (clima === "persa") return null;
  return clima; // z1..z7
}

interface Tavolozza {
  cielo: [number, string][];
  sole?: { x: number; y: number; r: number; col: string; alone: string; forza: number };
  strati: [string, number, number, number][];
  suolo: string;
  figura: string;
  bordo: string;
  polvere: string;
  latoSole: 1 | -1;
  segni: (ctx: CanvasRenderingContext2D, off: number, t: number) => void;
}

const casette = (ctx: CanvasRenderingContext2D, x0: number, x1: number, base: number, seme: number, col: string, finestre?: string, t = 0) => {
  const r = rng(seme);
  let x = x0;
  while (x < x1) {
    const w = 22 + r() * 30, h = 16 + r() * 26;
    ctx.fillStyle = col;
    ctx.fillRect(x, base - h, w, h + 4);
    ctx.beginPath(); ctx.moveTo(x - 2, base - h); ctx.lineTo(x + w / 2, base - h - 9 - r() * 5); ctx.lineTo(x + w + 2, base - h); ctx.fill();
    if (finestre && r() < 0.7) {
      const acc = 0.55 + 0.45 * Math.sin(t * (0.8 + r()) + x);
      ctx.fillStyle = rgba(finestre, 0.55 + 0.35 * acc);
      ctx.fillRect(x + w * 0.3, base - h * 0.6, 3.5, 4.5);
    } else r();
    x += w + r() * 10;
  }
};

const TAV: Record<Clima, Tavolozza> = {
  z0: {
    cielo: [[0, "#05070d"], [0.7, "#101626"], [1, "#1b2236"]], strati: [["#0c101c", 0, 14, 260], ["#080b14", 22, 10, 180]],
    suolo: "#05070c", figura: "#06080f", bordo: "#7f96b8", polvere: "#9fb4c9", latoSole: 1, segni: () => {},
  },
  z1: {
    cielo: [[0, "#0b1a22"], [0.55, "#274650"], [0.9, "#9cc7b8"], [1, "#d8e3c8"]],
    sole: { x: 1030, y: 120, r: 16, col: "#fff4dc", alone: "#bfe6d6", forza: 0.45 },
    strati: [["#1d3a3e", 0, 12, 300], ["#132a2e", 18, 9, 200]], suolo: "#0b1719", figura: "#141819", bordo: "#e6f5ea", polvere: "#d8f0e2", latoSole: 1,
    segni: (ctx, off) => {
      const x = 760 - off * 0.4;
      casette(ctx, x - 260, x + 120, ORIZ + 2, 11, "#0f2124");
      ctx.fillStyle = "#0f2124";
      ctx.fillRect(x + 160, ORIZ - 30, 150, 5); ctx.fillRect(x + 168, ORIZ - 30, 4, 32); ctx.fillRect(x + 296, ORIZ - 30, 4, 32);
    },
  },
  z2: {
    cielo: [[0, "#6f5a3e"], [0.5, "#c89a62"], [0.85, "#f1d3a0"], [1, "#fbe9c6"]],
    sole: { x: 640, y: 18, r: 22, col: "#fffaf0", alone: "#fff0cc", forza: 0.8 },
    strati: [["#9a7650", 0, 6, 400], ["#7c5c3c", 20, 5, 260]], suolo: "#5a4029", figura: "#20150c", bordo: "#fff0cc", polvere: "#f3dcb4", latoSole: 1,
    segni: (ctx, off) => {
      const x = 820 - off * 0.45;
      ctx.fillStyle = "#6a4d33"; ctx.fillRect(x, ORIZ - 26, 110, 28);
    },
  },
  z3: {
    cielo: [[0, "#3a4a60"], [0.55, "#93a6b8"], [0.9, "#e3eae8"], [1, "#f6f8f4"]],
    sole: { x: 300, y: 50, r: 18, col: "#ffffff", alone: "#eef6f6", forza: 0.6 },
    strati: [["#8f9aa6", 0, 5, 500], ["#c9d1d0", 16, 3, 400]], suolo: "#cdd4d1", figura: "#1e232b", bordo: "#ffffff", polvere: "#ffffff", latoSole: -1,
    segni: (ctx, off) => {
      const x = 900 - off * 0.35;
      ctx.fillStyle = "#6c7584";
      ctx.beginPath(); ctx.moveTo(x, ORIZ + 4); ctx.lineTo(x + 20, ORIZ - 54); ctx.lineTo(x + 420, ORIZ - 62); ctx.lineTo(x + 420, ORIZ + 4); ctx.fill();
    },
  },
  z4: {
    cielo: [[0, "#1a1a2a"], [0.5, "#5a4454"], [0.85, "#e09a58"], [1, "#f6c27e"]],
    sole: { x: 260, y: 64, r: 20, col: "#ffe2b0", alone: "#ffa45c", forza: 0.6 },
    strati: [["#3a2a34", 0, 8, 300], ["#241b24", 20, 6, 220]], suolo: "#150f14", figura: "#140e12", bordo: "#ffc98e", polvere: "#ffd0a0", latoSole: -1,
    segni: (ctx, off) => {
      const x = 700 - off * 0.5;
      ctx.fillStyle = "#1e161d";
      ctx.fillRect(x, ORIZ - 40, 180, 7); ctx.fillRect(x + 10, ORIZ - 34, 5, 36); ctx.fillRect(x + 165, ORIZ - 34, 5, 36);
    },
  },
  z5: {
    cielo: [[0, "#1c1020"], [0.5, "#5a2c2c"], [0.85, "#d6784a"], [1, "#f0a468"]],
    sole: { x: 240, y: 92, r: 18, col: "#ffd6a0", alone: "#ff9a5c", forza: 0.55 },
    strati: [["#3a1e22", 0, 16, 240], ["#26151a", 22, 10, 200]], suolo: "#140a0d", figura: "#140a0c", bordo: "#ffba8e", polvere: "#ffc8a0", latoSole: -1,
    segni: (ctx, off, t) => {
      const x = 560 - off * 0.4;
      casette(ctx, x, x + 520, ORIZ + 4, 51, "#2a141a", "#ffc070", t);
    },
  },
  z6: {
    cielo: [[0, "#0c0e22"], [0.55, "#2c3160"], [0.9, "#8a8fc8"], [1, "#c2c4e8"]],
    sole: { x: 280, y: 44, r: 11, col: "#f4f4ff", alone: "#b8bff0", forza: 0.3 },
    strati: [["#262a4e", -30, 40, 220], ["#1a1d3a", -8, 30, 170], ["#121430", 14, 18, 140]], suolo: "#0c0d20", figura: "#101222", bordo: "#cbd0ff", polvere: "#d8dcff", latoSole: -1,
    segni: (ctx, off) => {
      const x = 880 - off * 0.35;
      ctx.fillStyle = "#1e2146"; ctx.fillRect(x, ORIZ - 50, 60, 42);
    },
  },
  z7: {
    cielo: [[0, "#12060c"], [0.45, "#4a1424"], [0.85, "#d4604a"], [1, "#f09a6a"]],
    sole: { x: 180, y: 88, r: 20, col: "#ffcaa0", alone: "#ff7a55", forza: 0.6 },
    strati: [["#2a0c16", 0, 8, 300], ["#1a0810", 18, 6, 200]], suolo: "#1e0c12", figura: "#12080b", bordo: "#ffa480", polvere: "#ffb49a", latoSole: -1,
    segni: (ctx, off) => {
      const x = 240 - off * 0.3;
      casette(ctx, x, x + 460, ORIZ + 2, 61, "#1a0810");
    },
  },
  vinta: {
    cielo: [[0, "#1a1420"], [0.5, "#6a5048"], [0.85, "#f0c070"], [1, "#fde2a8"]],
    sole: { x: 420, y: 88, r: 24, col: "#fff4d8", alone: "#ffd27a", forza: 0.75 },
    strati: [["#4a3430", 0, 10, 300], ["#2e211e", 18, 8, 200]], suolo: "#1a120e", figura: "#140c08", bordo: "#ffe4ae", polvere: "#ffe8c0", latoSole: -1,
    segni: (ctx, off) => casette(ctx, 900 - off * 0.3, 1200 - off * 0.3, ORIZ + 2, 71, "#2e211e"),
  },
  terminata: {
    cielo: [[0, "#160d14"], [0.5, "#5c2c2c"], [0.86, "#d98856"], [1, "#ebb47e"]],
    sole: { x: 260, y: 102, r: 20, col: "#ffdcb4", alone: "#e6945c", forza: 0.58 },
    strati: [["#381a1e", 0, 10, 300], ["#241114", 18, 8, 200]], suolo: "#180c0e", figura: "#12080a", bordo: "#f0b484", polvere: "#f2c29b", latoSole: -1,
    segni: (ctx, off) => casette(ctx, 900 - off * 0.3, 1200 - off * 0.3, ORIZ + 2, 71, "#241114"),
  },
  persa: {
    cielo: [[0, "#0a0b0e"], [0.6, "#2a2d34"], [1, "#4a4d54"]],
    strati: [["#1c1e24", 0, 8, 300], ["#131519", 18, 6, 200]], suolo: "#0b0c0f", figura: "#060709", bordo: "#8a90a0", polvere: "#9aa0b0", latoSole: -1,
    segni: () => {},
  },
};

/** `fermo`: in pausa il disegno si ferma davvero (zero cicli rAF a vuoto: B19) e riprende morbido quando serve. */
export default function Panorama({ clima, luogo, camminaDa, fermo = false }: { clima: Clima; luogo: string | null; camminaDa: number; fermo?: boolean }) {
  const telaRef = useRef<HTMLCanvasElement>(null);
  const fermoRef = useRef(fermo);
  fermoRef.current = fermo;
  const svegliaRef = useRef<() => void>(() => {});
  const stato = useRef({ fase: 0, off: 0, passo: 0, ultimo: performance.now(), clima, luogo, prec: clima, precLuogo: luogo, mix: 1, camminaDa });
  stato.current.camminaDa = camminaDa;
  const prop = useRef({ clima, luogo });
  prop.current = { clima, luogo };
  const forzato = useRef<{ clima: Clima; luogo: string | null } | null>(null);

  // Precarica in anticipo la tavola della zona corrente appena cambia
  useEffect(() => {
    const id = idTavolaDi(clima, internoDi(clima, luogo));
    if (id) tavolaPanorama(id);
    svegliaRef.current();
  }, [clima, luogo, camminaDa, fermo]);

  useLayoutEffect(() => {
    const tela = telaRef.current;
    if (!tela) return;
    const misura = () => {
      const q = opzioni().qualita;
      const diSempre = tela.clientWidth * Math.min(window.devicePixelRatio || 1, 2);
      const l = Math.round(q === "alta" ? Math.min(3840, Math.max(diSempre, tela.getBoundingClientRect().width * (window.devicePixelRatio || 1)))
        : diSempre * (q === "media" ? 0.75 : q === "bassa" ? 0.5 : 1));
      const a = Math.round(l * tela.clientHeight / Math.max(1, tela.clientWidth));
      if (l > 0 && (tela.width !== l || tela.height !== a)) {
        tela.width = l; tela.height = a;
        svegliaRef.current();
      }
    };
    const ro = new ResizeObserver(misura);
    ro.observe(tela);
    window.addEventListener("resize", misura);
    const smetti = ascoltaOpzioni(() => { misura(); svegliaRef.current(); });
    return () => { ro.disconnect(); window.removeEventListener("resize", misura); smetti(); };
  }, []);

  useEffect(() => {
    let raf = 0;
    let inGiro = false;
    const buf = document.createElement("canvas");
    let firma = "";

    const disegna = (ora: number): boolean => {
      const s = stato.current, tela = telaRef.current;
      const dt = Math.min(0.1, Math.max(0, (ora - s.ultimo) / 1000));
      s.ultimo = ora;
      const { clima: c, luogo: l } = forzato.current ?? prop.current;
      const ridotto = movimentoRidotto();
      if (c !== s.clima || ambienteDi(c, l) !== ambienteDi(s.clima, s.luogo)) {
        s.prec = s.clima; s.precLuogo = s.luogo; s.clima = c; s.luogo = l; s.mix = ridotto ? 1 : 0;
      } else s.luogo = l;

      const idAttuale = idTavolaDi(s.clima, internoDi(s.clima, s.luogo));
      const statoTav = idAttuale ? (tavoleCache.get(idAttuale) instanceof HTMLImageElement ? "pronta" : "attesa") : "nessuna";

      if (ridotto) {
        const oraFirma = `${s.clima}|${s.luogo}|${tela?.width}|${tela?.height}|${statoTav}`;
        if (oraFirma === firma) return false; // già disegnato: si può dormire fino al prossimo cambio!
        firma = oraFirma;
      } else firma = "";

      if (tela && tela.width > 0) {
        const t = ridotto ? 0 : ora / 1000;
        const dopo = (ora - s.camminaDa) / 1000;
        const cammina = ridotto ? 0 : clamp(1 - (dopo - 2.0) / 0.5) * (dopo >= 0 ? 1 : 0);
        s.passo = cammina;
        s.fase += dt * 1.05 * cammina;
        s.off += dt * 52 * cammina;
        s.mix = Math.min(1, s.mix + dt / 1.1);
        const ctx = tela.getContext("2d")!;
        const k = tela.width / PW;
        if (s.mix < 1 && ambienteDi(s.prec, s.precLuogo) !== ambienteDi(s.clima, s.luogo)) {
          if (buf.width !== tela.width) { buf.width = tela.width; buf.height = tela.height; }
          const b = buf.getContext("2d")!;
          b.setTransform(k, 0, 0, k, 0, 0); scena(b, s.prec, s.precLuogo, s, t);
          ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(buf, 0, 0);
          ctx.globalAlpha = s.mix;
          b.setTransform(k, 0, 0, k, 0, 0); scena(b, s.clima, s.luogo, s, t);
          ctx.drawImage(buf, 0, 0); ctx.globalAlpha = 1;
        } else {
          ctx.setTransform(k, 0, 0, k, 0, 0);
          scena(ctx, s.clima, s.luogo, s, t);
        }
      }
      return !ridotto;
    };

    const passo = (ora: number) => {
      inGiro = false;
      if (fermoRef.current || document.hidden) {
        stato.current.ultimo = ora;
        return; // B19: in pausa o scheda nascosta non prenota altri requestAnimationFrame
      }
      const continua = disegna(ora);
      if (continua) {
        inGiro = true;
        raf = requestAnimationFrame(passo);
      }
    };

    const sveglia = () => {
      firma = "";
      if (inGiro || fermoRef.current || document.hidden) return;
      stato.current.ultimo = performance.now();
      inGiro = true;
      raf = requestAnimationFrame(passo);
    };
    svegliaRef.current = sveglia;
    ascoltatoriTavole.add(sveglia);
    const suVisibilita = () => { if (!document.hidden) sveglia(); };
    document.addEventListener("visibilitychange", suVisibilita);
    sveglia();

    let via: (() => void) | null = null;
    if (import.meta.env.DEV) {
      const w = window as unknown as { __panorama?: object };
      w.__panorama = {
        imposta: (c: Clima | null, l: string | null = null) => { forzato.current = c ? { clima: c, luogo: l } : null; sveglia(); },
        prova: (n = 60, sincro: boolean | "fine" = true) => {
          const tela = telaRef.current;
          const canvGl = document.createElement("canvas");
          const gl = canvGl.getContext("webgl");
          if (!tela || !gl) return null;
          try {
            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            const px = new Uint8Array(4);
            const ms: number[] = [];
            let ora = performance.now();
            const inizio = ora;
            for (let i = 0; i < n; i++) {
              const a = performance.now();
              ora += 16; disegna(ora);
              if (sincro === true) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tela); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); }
              ms.push(performance.now() - a);
            }
            if (sincro === "fine") {
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tela); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
              const media = +((performance.now() - inizio) / n).toFixed(2);
              stato.current.ultimo = performance.now();
              return { media };
            }
            stato.current.ultimo = performance.now();
            ms.sort((x, y) => x - y);
            return { mediana: +ms[Math.floor(n / 2)].toFixed(2), p95: +ms[Math.floor(n * 0.95)].toFixed(2), max: +ms[n - 1].toFixed(2) };
          } finally {
            gl.getExtension("WEBGL_lose_context")?.loseContext();
          }
        },
      };
      via = () => { delete w.__panorama; };
    }
    return () => {
      cancelAnimationFrame(raf);
      ascoltatoriTavole.delete(sveglia);
      document.removeEventListener("visibilitychange", suVisibilita);
      via?.();
    };
  }, []);

  return <canvas ref={telaRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />;
}

interface Interno {
  tipo: "stanza" | "serra" | "grotta" | "galleria" | "torre";
  arredo?: "bar" | "casa" | "osteria" | "casotto";
  luce?: string;
  pozza?: boolean;
}
const INTERNI = new Map<string, Interno>([
  ["bar", { tipo: "stanza", arredo: "bar", luce: "#ffc070" }],
  ["casa", { tipo: "stanza", arredo: "casa" }],
  ["osteria", { tipo: "stanza", arredo: "osteria", luce: "#ffb060" }],
  ["casotto", { tipo: "stanza", arredo: "casotto" }],
  ["serra", { tipo: "serra" }],
  ["grotta", { tipo: "grotta" }],
  ["condotta", { tipo: "galleria" }],
  ["sottopasso", { tipo: "galleria", pozza: true }],
  ["torre di presa", { tipo: "torre" }],
]);

export const luceDi = (clima: Clima) => {
  const p = TAV[clima];
  return { cielo: p.cielo, sole: p.sole, strati: p.strati, suolo: p.suolo, figura: p.figura, bordo: p.bordo };
};
export type Luce = ReturnType<typeof luceDi>;

export const tipoInterno = (luogo: string | null): string | undefined => (luogo ? INTERNI.get(luogo)?.tipo : undefined);
const internoDi = (clima: Clima, luogo: string | null) =>
  (luogo && clima !== "vinta" && clima !== "terminata" && clima !== "persa" ? INTERNI.get(luogo) : undefined);

function ambienteDi(clima: Clima, luogo: string | null): string { return internoDi(clima, luogo) ? `${clima}|${luogo}` : clima; }

const VX = 610;
const YF = ORIZ + 26;
const NERO = "#05060a";
type Ctx = CanvasRenderingContext2D;
type Scorrere = { fase: number; off: number; passo: number };

const ultimo = (p: Tavolozza) => p.cielo[p.cielo.length - 1][1];
const crinali = new Map<number, (x: number) => number>();
const crinaleDi = (seme: number) => { let f = crinali.get(seme); if (!f) { f = crinale(seme); crinali.set(seme, f); } return f; };

const scorri = (passo: number, par: number, f: (x: number, n: number) => void) => {
  const n0 = Math.floor(par / passo), d = par - n0 * passo;
  for (let k = -1; k * passo - d < PW; k++) f(k * passo - d, n0 + k);
};
const alone = (ctx: Ctx, x: number, y: number, r: number, col: string, a: number) => {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
};

/** Disegna la tavola dipinta con un dolce scorrimento di parallasse orizzontale durante il passo. */
function disegnaLastraDipinta(ctx: Ctx, img: HTMLImageElement, off: number) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  // 7% di margine orizzontale morbido per accompagnare il cammino senza mai scoprire i bordi
  const scala = Math.max((PW * 1.07) / iw, PH / ih);
  const dw = iw * scala;
  const dh = ih * scala;
  const maxPan = Math.max(0, (dw - PW) * 0.5);
  const panX = Math.sin(off * 0.0085) * maxPan;
  const dx = (PW - dw) * 0.5 - panX;
  const dy = (PH - dh) * 0.5;
  ctx.drawImage(img, dx, dy, dw, dh);
}

/** Effetti atmosferici vivi sopra le tavole dipinte (fiamme d'osteria, fumo al paese, riflessi d'acqua, luce viva). */
function atmosferaVivaSuTavola(ctx: Ctx, clima: Clima, dentro: Interno | undefined, p: Tavolozza, t: number) {
  const sfarf = 0.86 + 0.14 * Math.sin(t * 8.4) * Math.sin(t * 4.9 + 1.1);

  if (dentro) {
    if (dentro.arredo === "osteria") {
      // Il camino vivo sulla sinistra della tavola dipinta dell'osteria
      alone(ctx, 192, 148, 220, "#ff8c3a", 0.24 * sfarf);
      ctx.fillStyle = "rgba(255,192,92,0.72)";
      for (let k = 0; k < 3; k++) {
        const a = 0.5 + 0.5 * Math.sin(t * (5.8 + k * 1.9) + k), x = 166 + k * 16;
        ctx.beginPath();
        ctx.moveTo(x - 5, 166);
        ctx.quadraticCurveTo(x - 2, 154 - a * 7, x + (k - 1) * 2, 146 - a * 9);
        ctx.quadraticCurveTo(x + 3, 156, x + 5, 166);
        ctx.fill();
      }
      return { lato: -1 as const, bordo: "#ffb668" };
    }
    if (dentro.arredo === "bar") {
      alone(ctx, 180, 88, 240, "#ffc278", 0.14 * (0.9 + 0.1 * Math.sin(t * 1.6)));
      return { lato: -1 as const, bordo: "#ffc882" };
    }
    if (dentro.pozza) {
      // Sottopasso allagato: increspature vive sulla pozza
      ctx.save();
      ctx.strokeStyle = "rgba(220,230,236,0.22)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 6; i++) {
        const y = 168 + i * 4.5, ox = Math.sin(t * 2.1 + i) * 8;
        ctx.beginPath(); ctx.moveTo(160 + ox, y); ctx.lineTo(340 + ox, y); ctx.stroke();
      }
      ctx.restore();
    }
    return { lato: -1 as const, bordo: dentro.luce ?? p.bordo };
  }

  // All'aperto: gradazioni speciali per i finali (vinta = oro caldo d'arrivo; terminata = ambra cupa)
  if (clima === "vinta") {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const gv = ctx.createRadialGradient(340, 56, 10, 380, 80, 620);
    gv.addColorStop(0, "rgba(255,226,150,0.42)");
    gv.addColorStop(0.5, "rgba(245,186,96,0.18)");
    gv.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gv; ctx.fillRect(0, 0, PW, PH);
    ctx.restore();
  } else if (clima === "terminata") {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(232,188,162,0.88)";
    ctx.fillRect(0, 0, PW, PH);
    ctx.restore();
  } else if (clima === "z5") {
    // Filo di fumo vivo dai comignoli del paese al tramonto
    for (let i = 0; i < 6; i++) {
      const k = ((t * 0.22 + i / 6) % 1);
      ctx.fillStyle = `rgba(236,204,186,${0.16 * (1 - k)})`;
      ctx.beginPath();
      ctx.arc(308 + k * 28 + Math.sin(k * 6) * 5, 62 - k * 48, 4 + k * 10, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (clima === "z7") {
    // Riflessi vivi sull'acqua ramata del guado
    ctx.save();
    ctx.strokeStyle = "rgba(255,186,118,0.24)";
    ctx.lineWidth = 1.3;
    for (let i = 0; i < 8; i++) {
      const y = 148 + i * 3.8, x = 320 + i * 36 + Math.sin(t * 2.4 + i) * 7;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 28, y); ctx.stroke();
    }
    ctx.restore();
  } else if (clima === "z2") {
    // Vampa solare calda a mezzogiorno
    alone(ctx, 560, 12, 340, "#fff0c4", 0.14 * (0.9 + 0.1 * Math.sin(t * 1.8)));
  }

  return { lato: p.latoSole, bordo: p.bordo };
}

// --- Ripiego procedurale (z0, persa o prima che il WebP sia in cache) ---
const pavimento = (ctx: Ctx, col: string, s: Scorrere, passo: number, a: number) => {
  ctx.fillStyle = col; ctx.fillRect(0, YF, PW, PH - YF);
  ctx.strokeStyle = `rgba(0,0,0,${a})`; ctx.lineWidth = 1.4;
  ctx.beginPath();
  scorri(passo, s.off * 0.9, (x) => { ctx.moveTo(x, YF); ctx.lineTo(PW / 2 + (x - PW / 2) * 1.25, PH); });
  ctx.moveTo(0, YF + 12); ctx.lineTo(PW, YF + 12); ctx.moveTo(0, YF + 28); ctx.lineTo(PW, YF + 28);
  ctx.stroke();
};

function internoProcedurale(ctx: Ctx, p: Tavolozza, i: Interno, s: Scorrere) {
  const muro = mix(p.strati[0][0], NERO, 0.52);
  const g = ctx.createLinearGradient(0, 0, 0, YF);
  g.addColorStop(0, mix(muro, NERO, 0.58)); g.addColorStop(1, muro);
  ctx.fillStyle = g; ctx.fillRect(0, 0, PW, YF);
  pavimento(ctx, mix(muro, NERO, 0.32), s, 140, 0.28);
  alone(ctx, 260, 72, 280, i.luce ?? ultimo(p), 0.24);
  return { lato: -1 as const, bordo: i.luce ?? p.bordo };
}

function apertoProcedurale(ctx: Ctx, p: Tavolozza, s: Scorrere, t: number) {
  const g = ctx.createLinearGradient(0, 0, 0, ORIZ + 10);
  p.cielo.forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g; ctx.fillRect(0, 0, PW, PH);

  if (p.sole) {
    const { x, y, r, col, alone: al, forza } = p.sole;
    alone(ctx, x, y, 420, al, forza * 0.5);
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  // Per z0 (notte prima dell'arrivo), cielo trapunto di stelle discrete
  if (p === TAV.z0) {
    const rs = rng(77);
    for (let i = 0; i < 55; i++) {
      const sx = rs() * PW, sy = rs() * (ORIZ - 14);
      const tw = 0.55 + 0.45 * Math.sin(t * (1.2 + rs()) + i);
      ctx.fillStyle = `rgba(216,228,255,${0.45 * tw})`;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }
  }

  p.strati.forEach(([col, base, amp, scala], i) => {
    const f = crinaleDi(100 + i * 7);
    const par = s.off * (0.15 + i * 0.2);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(0, PH);
    for (let x = 0; x <= PW; x += 8) ctx.lineTo(x, ORIZ + base - f((x + par) / scala) * amp);
    ctx.lineTo(PW, PH); ctx.closePath(); ctx.fill();
  });

  p.segni(ctx, s.off, t);
  ctx.fillStyle = p.suolo; ctx.fillRect(0, ORIZ + 26, PW, PH);
  ctx.fillStyle = mix(p.suolo, "#ffffff", 0.06);
  ctx.fillRect(0, ORIZ + 34, PW, 3);
  return { lato: p.latoSole, bordo: p.bordo };
}

function scena(ctx: Ctx, clima: Clima, luogo: string | null, s: Scorrere, t: number) {
  const p = TAV[clima], dentro = internoDi(clima, luogo);
  const img = tavolaPanorama(idTavolaDi(clima, dentro));

  let lato: 1 | -1;
  let bordo: string;
  if (img) {
    disegnaLastraDipinta(ctx, img, s.off);
    const atm = atmosferaVivaSuTavola(ctx, clima, dentro, p, t);
    lato = atm.lato;
    bordo = atm.bordo;
  } else {
    const proc = dentro ? internoProcedurale(ctx, p, dentro, s) : apertoProcedurale(ctx, p, s, t);
    lato = proc.lato;
    bordo = proc.bordo;
  }

  // Pulviscolo sospeso nella luce
  const r = rng(9), alto = dentro ? YF - 36 : ORIZ + 12;
  for (let i = 0; i < 36; i++) {
    const x = ((r() * PW + t * (5 + r() * 10) + s.off * 0.5) % PW);
    const y = 18 + r() * alto + Math.sin(t + i) * 4;
    ctx.fillStyle = rgba(p.polvere, 0.11 + 0.14 * (0.5 + 0.5 * Math.sin(t * 1.4 + i)));
    ctx.fillRect(x, y, 1.6, 1.6);
  }

  // Ombra morbida sotto gli scarponi + il Viandante (non compare se la partita è persa)
  if (clima !== "persa") {
    const piediY = ORIZ + 42;
    ctx.fillStyle = "rgba(0,0,0,.42)";
    ctx.beginPath(); ctx.ellipse(VX, piediY + 1, 19, 3.4, 0, 0, Math.PI * 2); ctx.fill();
    disegnaViandante(ctx, VX, piediY, 64, s.fase, {
      colore: p.figura,
      lontano: "#080608",
      bordo,
      latoLuce: lato,
      verso: -1,
      fermo: 1 - s.passo,
      respiro: t,
      tanica: true,
      fagotto: true,
      cappello: true,
      dettaglio: 1,
    });
  }

  // B12: velatura protettiva nell'angolo in alto a destra per garantire contrasto pieno a SALVA / CARICA / PAUSA
  const gAngolo = ctx.createRadialGradient(PW - 120, 14, 24, PW - 120, 14, 340);
  gAngolo.addColorStop(0, "rgba(7,7,10,0.52)");
  gAngolo.addColorStop(0.65, "rgba(7,7,10,0.22)");
  gAngolo.addColorStop(1, "rgba(7,7,10,0)");
  ctx.fillStyle = gAngolo;
  ctx.fillRect(PW - 460, 0, 460, 96);
}
