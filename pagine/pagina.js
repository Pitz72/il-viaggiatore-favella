// ====================================================================
//  La pagina di presentazione: la lingua, il download del proprio sistema, la lente.
// --------------------------------------------------------------------
//  Senza questo file la pagina si legge lo stesso (in italiano), e ogni
//  download e la schermata grande sono link normali.
// ====================================================================
(function () {
  var radice = document.documentElement;
  var CHIAVE = "viaggiatore.pagina.lingua";

  // ── la lingua ──────────────────────────────────────────────────────
  var bottoni = document.querySelectorAll("[data-scegli]");
  function lingua(l) {
    radice.setAttribute("data-lingua", l);
    radice.lang = l;
    for (var i = 0; i < bottoni.length; i++) bottoni[i].setAttribute("aria-pressed", String(bottoni[i].getAttribute("data-scegli") === l));
  }
  for (var i = 0; i < bottoni.length; i++) {
    bottoni[i].addEventListener("click", function (e) {
      var l = e.currentTarget.getAttribute("data-scegli");
      lingua(l);
      try { localStorage.setItem(CHIAVE, l); } catch (err) { /* niente memoria: vale fino alla chiusura */ }
    });
  }
  lingua(radice.getAttribute("data-lingua") === "en" ? "en" : "it");

  // ── il download del sistema di chi guarda ─────────────────────────
  // Windows: l'installer, che si aggiorna da solo; Linux: l'AppImage. Altrove (macOS, telefoni) resta l'elenco.
  var piattaforma = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || "").toLowerCase();
  var telefono = /android|iphone|ipad|mobile/.test((navigator.userAgent || "").toLowerCase());
  var sistema = telefono ? null : /win/.test(piattaforma) ? "windows" : /linux|x11/.test(piattaforma) ? "linux" : null;
  if (sistema) {
    var file = document.querySelector('.file[data-sistema="' + sistema + '"][data-primo]');
    var apri = document.querySelector("[data-scarica-tuo]");
    var tutti = document.querySelectorAll('.file[data-sistema="' + sistema + '"]');
    for (var j = 0; j < tutti.length; j++) tutti[j].classList.add("tuo");
    if (file && apri) {
      apri.setAttribute("href", file.getAttribute("href"));
      apri.innerHTML = sistema === "windows"
        ? '<span lang="it">Scarica per Windows</span><span lang="en">Download for Windows</span> <small>' + file.getAttribute("data-peso") + "</small>"
        : '<span lang="it">Scarica per Linux</span><span lang="en">Download for Linux</span> <small>' + file.getAttribute("data-peso") + "</small>";
    }
  }

  // ── la lente: la schermata grande, senza lasciare la pagina ────────
  var lente = document.querySelector(".lente");
  if (lente && typeof lente.showModal === "function") {
    var img = lente.querySelector("img");
    document.querySelectorAll("[data-ingrandisci]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var dentro = a.querySelector("img");
        img.src = a.getAttribute("href");
        img.alt = dentro ? dentro.alt : "";
        lente.showModal();
      });
    });
    lente.querySelector(".chiudi").addEventListener("click", function () { lente.close(); });
    lente.addEventListener("click", function (e) { if (e.target === lente) lente.close(); });
  }
})();
