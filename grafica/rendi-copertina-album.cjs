// ====================================================================
//  La copertina dell'album «Il Viaggiatore Official Soundtrack»: il logo del gioco
//  (grafica/icona.svg) a tutto quadrato, senza gli angoli arrotondati dell'icona,
//  in PNG 1400×1400. Con Electron fuori schermo, lo stesso motore che disegna il
//  gioco; l'SVG si disegna su una tela (una finestra non può essere più alta dello
//  schermo, una tela sì). Poi in JPEG con ImageMagick, e la usa
//  strumenti/colonna-sonora.py.
//  Uso (da desktop/, dove c'è Electron):
//    npx electron ../grafica/rendi-copertina-album.cjs ../grafica/icona.svg copertina.png
//    magick copertina.png -quality 92 ../grafica/copertina-album.jpg
// ====================================================================
const { app, BrowserWindow } = require("electron");
const fs = require("node:fs");

const [ingresso, uscita] = process.argv.slice(-2);
const LATO = 1400;
app.on("window-all-closed", () => {});
app.whenReady().then(async () => {
  const svg = fs.readFileSync(ingresso, "utf8").replace('rx="200"', 'rx="0"');
  const w = new BrowserWindow({ show: false, width: 400, height: 300, webPreferences: { offscreen: true } });
  await w.loadURL("data:text/html;charset=utf-8,<html><body></body></html>");
  const dati = await w.webContents.executeJavaScript(`new Promise((ok, ko) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas"); c.width = ${LATO}; c.height = ${LATO};
      c.getContext("2d").drawImage(img, 0, 0, ${LATO}, ${LATO});
      ok(c.toDataURL("image/png"));
    };
    img.onerror = () => ko(new Error("svg non disegnato"));
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(${JSON.stringify(svg)});
  })`);
  fs.writeFileSync(uscita, Buffer.from(dati.split(",")[1], "base64"));
  console.log("copertina scritta");
  app.exit(0);
}).catch((e) => { console.error("errore:", e); app.exit(1); });
