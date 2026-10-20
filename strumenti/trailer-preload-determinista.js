// Preload del banco di confronto del trailer (strumenti/trailer-cattura.cjs). NON fa parte dell'app.
// Rende deterministico ciò che è casuale, così due catture dello stesso istante sono uguali al bit:
// Math.random con un seme fisso, il div della grana nascosto (si giudica a parte, a occhio) e le
// animazioni CSS ferme. Con la grana nuova (che dipende dal tempo e non da Math.random) il div si
// riconosce ancora dal suo mix-blend-mode e si nasconde lo stesso.
(() => {
  let s = 12345;
  Math.random = () => { s = (s + 0x6d2b79f5) >>> 0; let r = Math.imul(s ^ (s >>> 15), 1 | s); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
  document.addEventListener("DOMContentLoaded", () => {
    const st = document.createElement("style");
    st.textContent = "*,*::before,*::after{animation-play-state:paused !important;animation-delay:-0.3s !important} div[style*='mix-blend-mode: overlay'],div[style*='mix-blend-mode: soft-light'],[data-grana]{display:none !important}";
    document.head.appendChild(st);
  });
})();
