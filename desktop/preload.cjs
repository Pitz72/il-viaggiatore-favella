// Ponte fra la pagina e il processo principale: poche funzioni, nient'altro.
// La pagina lo legge in app/src/lib/desktop.ts.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("viaggiatoreDesktop", {
  versione: ipcRenderer.sendSync("versione"),
  esci: () => ipcRenderer.send("esci"),
  schermoIntero: () => ipcRenderer.invoke("schermo"),
  commutaSchermoIntero: () => ipcRenderer.invoke("commuta-schermo"),
  esitoAutoverifica: (ok, dettagli) => ipcRenderer.send("autoverifica", !!ok, String(dettagli)),
});
