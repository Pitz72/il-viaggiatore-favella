// ====================================================================
//  La sequenza finale: dopo i sei finali della storia, poi il menu d'avvio.
// --------------------------------------------------------------------
//  Piano: pre-produzione/11-sequenza-finale.md. Acquamorta al tramonto dalla
//  riva del guado, senza figure (la chiusura non racconta: vale per tutti e
//  sei i finali); le bande nere che si richiudono, il gesto opposto
//  all'apertura del trailer; la frase del finale, grande, in silenzio di
//  parole; la notte che scende; i titoli di coda (finale/crediti.ts); il nero
//  e i due loghi d'apertura che si ricompongono, muti, sulla coda della
//  canzone. I tempi sono in finale/scaletta.ts e seguono la durata della
//  canzone (public/musica/finale.opus; finché non c'è, intro.mp3).
//  Senza frase (Extra → Titoli di coda) è la stessa sequenza, senza la frase.
//  Esc salta, come per i loghi e il trailer.
//  Il paesaggio è quello del trailer (trailer/scene/guado.ts, con le tele già
//  dipinte all'avvio); i testi stanno su una superficie di 1920×1080 scalata,
//  come nel trailer; i loghi sono quelli dell'avvio (loghi/), guidati da qui.
//  In inglese cambiano le scritte (i crediti hanno la loro traduzione accanto,
//  finale/crediti.ts); la frase del finale arriva già nella lingua di chi gioca.
//  Solo in sviluppo: window.__finale.vai(t) ferma l'orologio a quel secondo.
// ====================================================================
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { W, H, BANDA } from "../trailer/scaletta";
import { avviaPreparazione, cacheTrailer, FONT } from "../trailer/paesaggi";
import { disegnaGuado } from "../trailer/scene/guado";
import { camera } from "../trailer/pittura";
import { easeInOut, rng, seg } from "../trailer/tempo";
import { canale } from "../lib/suono";
import { voce } from "../gioco/voce";
import branoIntro from "../assets/intro.mp3";
import LogoRuntime, { type Animabile } from "../loghi/LogoRuntime";
import LogoFavella from "../loghi/LogoFavella";
import { ATTACCO, presenza, tempi, type Tempi } from "../finale/scaletta";
import { GRAZIE, GRAZIE_EN, LICENZE, LICENZE_EN, righeDeiTitoli } from "../finale/crediti";
import { useLingua } from "../lib/useOpzioni";
import { tr } from "../lib/lingua";

const CANZONE = `${import.meta.env.BASE_URL}musica/finale.opus`;
const TETTO_TELA = 2560;      // px: la tela non va oltre (la scena è dipinta per il trailer, che a questa misura è nitido)
const ATTESA_MUSICA = 5000;   // ms: se la musica non si carica, si parte senza
const USCITA = 0.6;           // s: la dissolvenza quando si salta

/** Un brano dal server: le risposte HTML (il server di sviluppo risponde index.html ai file che non ci sono) non valgono. */
async function caricaBrano(ac: AudioContext, url: string): Promise<AudioBuffer> {
  const r = await fetch(url);
  if (!r.ok || (r.headers.get("content-type") ?? "").includes("text/html")) throw new Error(`${url}: ${r.status}`);
  return ac.decodeAudioData(await r.arrayBuffer());
}

/** La notte che scende sulla riva: un velo blu più fitto in alto, e le stelle sopra le colline. */
function notte(ctx: CanvasRenderingContext2D, n: number, t: number) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgba(3,5,16,${0.88 * n})`);
  g.addColorStop(0.6, `rgba(6,8,22,${0.76 * n})`);
  g.addColorStop(1, `rgba(2,3,8,${0.82 * n})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const r = rng(29);
  for (let i = 0; i < 150; i++) {
    const x = r() * W, y = BANDA + r() * 300, base = 0.25 + r() * 0.75, ritmo = 0.9 + r() * 1.8, lato = r() < 0.12 ? 2.2 : 1.5;
    const brilla = 0.6 + 0.4 * Math.sin(t * ritmo + i);
    ctx.fillStyle = `rgba(226,232,255,${base * brilla * n * 0.9})`;
    ctx.fillRect(x, y, lato, lato);
  }
}

interface Props {
  /** la frase del finale (senza «FINALE —»); null = solo i titoli di coda */
  frase: string | null;
  onFine: () => void;
}

export default function SequenzaFinale({ frase, onFine }: Props) {
  const en = useLingua() === "en";
  const palco = useRef<HTMLDivElement>(null);
  const tela = useRef<HTMLCanvasElement>(null);
  const nero = useRef<HTMLDivElement>(null);
  const bandaSu = useRef<HTMLDivElement>(null);
  const bandaGiu = useRef<HTMLDivElement>(null);
  const testoFrase = useRef<HTMLDivElement>(null);
  const finestraTitoli = useRef<HTMLDivElement>(null);
  const colonna = useRef<HTMLDivElement>(null);
  const titolo = useRef<HTMLDivElement>(null);
  const grazie = useRef<HTMLParagraphElement>(null);
  const runtime = useRef<Animabile>(null);
  const favella = useRef<Animabile>(null);
  const [scala, setScala] = useState(1);
  const [avvio, setAvvio] = useState<{ T: Tempi; conCanzone: boolean } | null>(null);
  const fine = useRef(onFine);
  fine.current = onFine;
  const fatto = useRef(false);
  const uscita = useRef<null | (() => void)>(null);

  // il palco 16:9 più grande che entra nella finestra; la tela ai suoi pixel veri (fino al tetto)
  useLayoutEffect(() => {
    const el = palco.current, c = tela.current;
    if (!el || !c) return;
    const misura = () => {
      const w = el.clientWidth;
      setScala(w / W);
      const larga = Math.round(Math.min(TETTO_TELA, Math.max(960, w * (window.devicePixelRatio || 1))));
      if (c.width !== larga) { c.width = larga; c.height = Math.round((larga * H) / W); }
    };
    const ro = new ResizeObserver(misura);
    ro.observe(el);
    misura();
    return () => ro.disconnect();
  }, []);

  // la canzone (o, finché non c'è, il tema dell'intro) e l'orologio
  useEffect(() => {
    voce.ferma();
    let vivo = true;
    const ac = new AudioContext();
    const livello = ac.createGain();
    livello.connect(canale(ac, "musica"));
    let sorgente: AudioBufferSourceNode | null = null;
    const parti = (buf: AudioBuffer | null, conCanzone: boolean) => {
      if (!vivo || fatto.current) return;
      fatto.current = true;
      if (ac.state === "suspended") ac.resume().catch(() => {});
      if (buf) {
        sorgente = ac.createBufferSource();
        sorgente.buffer = buf;
        sorgente.connect(livello);
        sorgente.start(ac.currentTime + ATTACCO);
      }
      setAvvio({ T: tempi(buf ? buf.duration : null), conCanzone });
    };
    // le tele del paesaggio si aspettano sempre (nel gioco sono pronte dall'avvio); la musica al massimo ATTESA_MUSICA
    let scadenza = 0;
    const musica = Promise.race([
      caricaBrano(ac, CANZONE).then((b) => [b, true] as const)
        .catch(() => caricaBrano(ac, branoIntro).then((b) => [b, false] as const))
        .catch(() => [null, false] as const),
      new Promise<readonly [null, false]>((r) => { scadenza = window.setTimeout(() => r([null, false] as const), ATTESA_MUSICA); }),
    ]);
    Promise.all([avviaPreparazione(), musica]).then(([, [buf, conCanzone]]) => { window.clearTimeout(scadenza); parti(buf, conCanzone); });
    uscita.current = () => {
      livello.gain.setTargetAtTime(0, ac.currentTime, USCITA / 4);
    };
    return () => {
      vivo = false;
      window.clearTimeout(scadenza);
      try { sorgente?.stop(); } catch { /* già fermo */ }
      ac.close().catch(() => {});
    };
  }, []);

  // i loghi misurano scritta e motto sui caratteri del marchio
  useEffect(() => {
    Promise.all(["700 100px Sora", "400 40px Inter"].map((f) => document.fonts?.load(f).catch(() => null)))
      .then(() => favella.current?.prepara?.());
  }, []);

  // Esc salta: una dissolvenza breve, poi il menu
  useEffect(() => {
    const tasto = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      salta();
    };
    window.addEventListener("keydown", tasto);
    return () => window.removeEventListener("keydown", tasto);
  }, []);
  const saltato = useRef(false);
  const salta = () => {
    if (saltato.current) return;
    saltato.current = true;
    uscita.current?.();
    if (nero.current) { nero.current.style.transition = `opacity ${USCITA}s ease`; nero.current.style.opacity = "1"; }
    window.setTimeout(() => fine.current(), USCITA * 1000);
  };

  // ── il fotogramma ──────────────────────────────────────────────────
  useEffect(() => {
    if (!avvio) return;
    const { T } = avvio;
    const t0 = performance.now();
    let fermo: number | null = null;
    if (import.meta.env.DEV) (window as unknown as { __finale?: object }).__finale = { vai: (t: number) => { fermo = t; }, T };
    // la colonna dei titoli: il titolo fermo al centro della finestra, poi sale finché «Grazie» non sta al centro
    const finestra = H - 2 * BANDA;
    const centro = (el: HTMLElement | null) => (el ? el.offsetTop + el.offsetHeight / 2 : 0);
    const y0 = finestra / 2 - centro(titolo.current);
    const y1 = finestra / 2 - centro(grazie.current);
    const fineCorsa = T.titoliA - 4;
    let raf = 0;
    const passo = (ora: number) => {
      const t = fermo ?? (ora - t0) / 1000;
      const c = tela.current;
      if (c) {
        const ctx = c.getContext("2d")!;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, c.width, c.height);
        if (t < T.neroDa + 0.05) {
          const k = c.width / W;
          ctx.save();
          ctx.setTransform(k, 0, 0, k, 0, 0);
          ctx.save();
          camera(ctx, 1 + 0.07 * easeInOut(seg(t, T.scenaDa, T.neroDa)), 560, 640);
          disegnaGuado(ctx, 20 + t, cacheTrailer, false);
          ctx.restore();
          const n = easeInOut(seg(t, T.notteDa, T.notteA));
          if (n > 0) notte(ctx, n, t);
          ctx.restore();
        }
      }
      if (nero.current && !saltato.current) {
        const apre = easeInOut(seg(t, T.scenaDa, T.scenaA)), chiude = easeInOut(seg(t, T.neroDa - 1, T.neroDa));
        nero.current.style.opacity = String(Math.max(1 - apre, chiude));
      }
      const banda = `${(BANDA * easeInOut(seg(t, T.bandeDa, T.bandeA))).toFixed(1)}px`;
      if (bandaSu.current) bandaSu.current.style.height = banda;
      if (bandaGiu.current) bandaGiu.current.style.height = banda;
      if (testoFrase.current) testoFrase.current.style.opacity = String(presenza(t, T.fraseDa, T.fraseA, 1.6, 1.8));
      if (finestraTitoli.current) finestraTitoli.current.style.opacity = String(presenza(t, T.titoliDa, T.titoliA, 1.8, 1.2));
      if (colonna.current) {
        const y = y0 + (y1 - y0) * seg(t, T.titoloFermoA, fineCorsa);
        colonna.current.style.transform = `translateY(${y.toFixed(1)}px)`;
      }
      runtime.current?.aggiorna(t - T.runtimeDa);
      favella.current?.aggiorna(t - T.favellaDa);
      if (t >= T.durata && fermo === null) { if (!saltato.current) { saltato.current = true; fine.current(); } return; }
      raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => {
      cancelAnimationFrame(raf);
      if (import.meta.env.DEV) delete (window as unknown as { __finale?: object }).__finale;
    };
  }, [avvio]);

  const righe = righeDeiTitoli(avvio?.conCanzone ?? false, en);
  const ombra = "0 2px 6px rgba(8,4,10,.9), 0 0 34px rgba(8,4,10,.75)";
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "none", overflow: "hidden", userSelect: "none" }} aria-label={frase ? tr("La sequenza finale", "The closing sequence") : tr("I titoli di coda", "The closing credits")}>
      <div ref={palco} style={{ position: "relative", overflow: "hidden",
        width: "min(100vw, calc(100dvh * 16 / 9))", height: "min(100dvh, calc(100vw * 9 / 16))" }}>
        <canvas ref={tela} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
        {/* superficie di progetto 1920×1080 per i testi */}
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `scale(${scala})`, transformOrigin: "0 0" }}>
          {frase && (
            // nel cielo, fra la banda in alto e il campanile (che arriva a ~410)
            <div ref={testoFrase} style={{ position: "absolute", left: 0, right: 0, top: 160, height: 280, display: "flex",
              alignItems: "center", justifyContent: "center", opacity: 0 }}>
              <div style={{ position: "absolute", left: "50%", top: "50%", width: 1500, height: 520, transform: "translate(-50%, -50%)",
                background: "radial-gradient(50% 50% at 50% 50%, rgba(8,4,12,.55) 0%, rgba(8,4,12,.3) 55%, rgba(8,4,12,0) 100%)" }} />
              <p style={{ position: "relative", margin: 0, maxWidth: 1360, textAlign: "center", fontFamily: FONT.serif, fontStyle: "italic",
                fontWeight: 500, fontSize: 54, lineHeight: 1.3, color: "#f6ecdc", textShadow: ombra }}>{frase}</p>
            </div>
          )}
          <div ref={finestraTitoli} style={{ position: "absolute", left: 0, right: 0, top: BANDA, height: H - 2 * BANDA, overflow: "hidden", opacity: 0,
            maskImage: "linear-gradient(to bottom, transparent 0, #000 90px, #000 calc(100% - 90px), transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 90px, #000 calc(100% - 90px), transparent 100%)" }}>
            <div ref={colonna} style={{ position: "absolute", left: 0, right: 0, top: 0, textAlign: "center", willChange: "transform" }}>
              <div ref={titolo}>
                <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 112, lineHeight: 1.08, letterSpacing: "0.14em",
                  paddingLeft: "0.14em", color: "#f4ece0", textShadow: "0 0 50px rgba(255,190,130,.16)" }}>IL VIAGGIATORE</div>
                <div style={{ marginTop: 22, fontFamily: FONT.mono, fontWeight: 500, fontSize: 20, letterSpacing: "0.5em", textTransform: "uppercase",
                  color: "#ffe0bd", textShadow: ombra }}>{tr("un esperimento in favella 1", "an experiment in favella 1")}</div>
                <div style={{ marginTop: 16, fontFamily: FONT.serif, fontStyle: "italic", fontSize: 28, color: "rgba(244,236,224,.88)",
                  textShadow: ombra }}>{tr("un gioco di Simone Pizzi", "a game by Simone Pizzi")}</div>
              </div>
              {/* abbastanza sotto da non vedersi mentre il titolo sta fermo al centro */}
              <dl style={{ margin: "460px auto 0", maxWidth: 1180, display: "flex", flexDirection: "column", gap: 50 }}>
                {righe.map(([che, chi]) => (
                  <div key={che}>
                    <dt style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 15, letterSpacing: "0.3em", textTransform: "uppercase",
                      color: "rgba(240,183,126,.9)", textShadow: ombra }}>{che}</dt>
                    <dd style={{ margin: "12px 0 0", fontFamily: FONT.serif, fontSize: 27, lineHeight: 1.4, color: "#ece4d6", textShadow: ombra,
                      whiteSpace: "pre-line" }}>{chi}</dd>
                  </div>
                ))}
              </dl>
              <p style={{ margin: "90px 0 0", fontFamily: FONT.serif, fontStyle: "italic", fontSize: 21, color: "rgba(236,228,214,.72)",
                textShadow: ombra }}>{en ? LICENZE_EN : LICENZE}</p>
              <p ref={grazie} style={{ margin: "150px 0 0", fontFamily: FONT.serif, fontStyle: "italic", fontSize: 36, color: "#f4ece0",
                textShadow: ombra }}>{en ? GRAZIE_EN : GRAZIE}</p>
            </div>
          </div>
          {/* le bande nere: si richiudono sul tramonto */}
          <div ref={bandaSu} style={{ position: "absolute", left: 0, right: 0, top: 0, height: 0, background: "#000" }} />
          <div ref={bandaGiu} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 0, background: "#000" }} />
        </div>
        <div ref={nero} style={{ position: "absolute", inset: 0, background: "#000", opacity: 1, pointerEvents: "none" }} />
      </div>
      {/* i loghi dell'avvio, sulla coda della canzone: a tutta finestra, come all'avvio */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <LogoRuntime ref={runtime} />
        <LogoFavella ref={favella} />
      </div>
    </div>
  );
}
