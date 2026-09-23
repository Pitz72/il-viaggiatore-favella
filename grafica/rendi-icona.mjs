// ====================================================================
//  Rasterizza grafica/icona.svg in PNG a tutte le misure che servono
//  (app desktop, favicon, copertina dell'mp3) con Chrome senza interfaccia.
//  Uso (serve playwright-core e Chrome installato):
//    node grafica/rendi-icona.mjs
//  Il file .ico per Windows lo compone poi grafica/componi-ico.py.
// ====================================================================
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const qui = path.dirname(fileURLToPath(import.meta.url));
const svg = fs.readFileSync(path.join(qui, "icona.svg"), "utf8");
const MISURE = [1024, 512, 256, 128, 64, 48, 32, 16];

const chrome = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage({ deviceScaleFactor: 1 });
fs.mkdirSync(path.join(qui, "png"), { recursive: true });
for (const n of MISURE) {
  await page.setViewportSize({ width: n, height: n });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace("<svg ", `<svg style="display:block;width:${n}px;height:${n}px" `)}</body></html>`);
  await page.screenshot({ path: path.join(qui, "png", `icona-${n}.png`), omitBackground: true });
}
await browser.close();
console.log("icone:", MISURE.join(", "));
