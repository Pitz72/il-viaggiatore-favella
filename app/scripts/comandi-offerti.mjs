// ====================================================================
//  Che cosa offrono i pulsanti, adesso (src/gioco/azioni.ts → comandiOfferti).
// --------------------------------------------------------------------
//  Serve al collaudo collaudo/pulsanti.py, che gioca i finali solo con ciò che
//  l'interfaccia offre. Una riga JSON per domanda su stdin, {mondo, azioni};
//  una riga JSON per risposta su stdout, l'elenco dei comandi. Il processo resta
//  aperto per tutta la partita: una domanda per turno.
// ====================================================================
import readline from "node:readline";
import { caricaAzioni } from "./azioni-node.mjs";

const azioni = await caricaAzioni();
const righe = readline.createInterface({ input: process.stdin });
for await (const riga of righe) {
  if (!riga.trim()) continue;
  const { mondo, azioni: az } = JSON.parse(riga);
  process.stdout.write(JSON.stringify(azioni.comandiOfferti(mondo, az)) + "\n");
}
