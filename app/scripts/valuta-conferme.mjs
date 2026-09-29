// ====================================================================
//  Fa girare la logica delle conferme (src/gioco/azioni.ts) fuori dal browser.
// --------------------------------------------------------------------
//  Serve al collaudo (collaudo/conferme.py): legge da stdin un elenco di
//  {cmd, anteprima, mondo} e scrive per ciascuno la Conferma che
//  valutaConferma ne ricava (o null).
// ====================================================================
import fs from "node:fs";
import { caricaAzioni } from "./azioni-node.mjs";

const azioni = await caricaAzioni();
const input = JSON.parse(fs.readFileSync(0, "utf8"));
const uscita = input.map(({ cmd, anteprima, mondo }) => ({
  cmd,
  serve: azioni.serveAnteprima(cmd, mondo),
  conferma: azioni.valutaConferma(cmd, anteprima, mondo),
}));
process.stdout.write(JSON.stringify(uscita));
