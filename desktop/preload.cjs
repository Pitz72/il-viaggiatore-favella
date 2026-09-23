// Ponte fra la pagina e il processo principale: poche funzioni, nient'altro.
// La pagina lo legge in app/src/lib/desktop.ts e app/src/lib/salvataggi.ts.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("viaggiatoreDesktop", {
  versione: ipcRenderer.sendSync("versione"),
  esci: () => ipcRenderer.send("esci"),
  schermoIntero: () => ipcRenderer.invoke("schermo"),
  commutaSchermoIntero: () => ipcRenderer.invoke("commuta-schermo"),
  esitoAutoverifica: (ok, dettagli) => ipcRenderer.send("autoverifica", !!ok, String(dettagli)),
  registro: (livello, testo) => ipcRenderer.send("registro", String(livello), String(testo)),

  salvataggi: {
    elenco: () => ipcRenderer.invoke("salvataggi:elenco"),
    scrivi: (posto, testo) => ipcRenderer.invoke("salvataggi:scrivi", String(posto), String(testo)),
    elimina: (posto) => ipcRenderer.invoke("salvataggi:elimina", String(posto)),
    esporta: (posto, nome) => ipcRenderer.invoke("salvataggi:esporta", String(posto), String(nome)),
    importa: () => ipcRenderer.invoke("salvataggi:importa"),
    cartella: () => ipcRenderer.invoke("salvataggi:cartella"),
    apriCartella: () => ipcRenderer.invoke("salvataggi:apri-cartella"),
  },

  aggiornamento: {
    stato: () => ipcRenderer.invoke("aggiornamento:stato"),
    quandoCambia: (fn) => {
      const f = (_e, s) => fn(s);
      ipcRenderer.on("aggiornamento", f);
      return () => ipcRenderer.removeListener("aggiornamento", f);
    },
    installa: () => ipcRenderer.send("aggiornamento:installa"),
  },
});
