// ====================================================================
//  «Il Viaggiatore» — orchestratore.
// --------------------------------------------------------------------
//  Cinque fasi: i LOGHI (Runtime, FAVELLA; solo all'avvio), l'AVVISO (che
//  cos'è questo gioco), il TRAILER, il GIOCO (shell 16:9 col motore FAVELLA
//  reale) e la SEQUENZA FINALE (dopo i sei finali della storia: il tramonto,
//  la frase, i titoli di coda e i loghi; piano 11). Dal menu del trailer si
//  comincia un nuovo viaggio o se ne riprende uno salvato; «← intro» dal
//  gioco torna al trailer, ma DIRETTO al menu (non si rivede tutto il filmato).
//  A gioco finito si torna al menu d'avvio: dopo un finale passando per la
//  sequenza, dopo una morte subito; il gioco non riparte da solo. I trofei
//  dell'ultimo turno si annunciano sul menu. I crediti, che fino alla 1.32
//  stavano in un cartello dopo i loghi, sono i titoli di coda (anche da
//  Extra → Titoli di coda).
//  Sopra tutto, sul desktop, l'avviso dell'aggiornamento automatico. Le fasi stanno
//  dentro un confine d'errore (ConfineErrori): se una si rompe, un messaggio e
//  «torna all'intro» al posto dello schermo nero.
//  Solo in sviluppo: ?sequenza (con una frase di prova) e ?titoli aprono
//  direttamente la sequenza finale, per guardarla e fotografarla.
// ====================================================================
import { useEffect, useState } from "react";
import Loghi from "./components/Loghi";
import Avviso from "./components/Avviso";
import { avviaPreparazione } from "./trailer/paesaggi";
import Trailer from "./components/Trailer";
import GameShell from "./components/GameShell";
import SequenzaFinale from "./components/SequenzaFinale";
import AvvisoAggiornamento from "./components/AvvisoAggiornamento";
import ConfineErrori from "./components/ConfineErrori";
import type { Salvataggio } from "./lib/salvataggi";
import type { FinePartita } from "./components/ViaggiatorePlayer";

type Fase = "loghi" | "avviso" | "trailer" | "gioco" | "finale";

const PROVA = (() => {
  if (!import.meta.env.DEV) return null;
  const q = new URLSearchParams(location.search);
  if (q.has("sequenza")) return { frase: q.get("sequenza") || "Hai trovato la casa, e hai scelto di non restarci. Qualcuno, almeno, lo porti via vivo." };
  if (q.has("titoli")) return { frase: null };
  return null;
})();

export default function App() {
  const [fase, setFase] = useState<Fase>(PROVA ? "finale" : "loghi");
  // Dopo aver visto il gioco almeno una volta, il trailer riparte dal finale.
  const [giaVisto, setGiaVisto] = useState(false);
  const [carica, setCarica] = useState<Salvataggio | null>(null);
  // una partita nuova (o ricaricata) rimonta il gioco da capo
  const [partita, setPartita] = useState(0);
  // la sequenza finale: con la frase del finale, o senza (i soli titoli di coda)
  const [sequenza, setSequenza] = useState<{ frase: string | null }>(PROVA ?? { frase: null });
  // i trofei vinti nell'ultimo turno: li annuncia il menu d'avvio
  const [daAnnunciare, setDaAnnunciare] = useState<string[]>([]);

  // Le tele del trailer (cielo, monti, legno, carta, fango, sale, cemento, rilievo…) si dipingono
  // a pezzi mentre girano i loghi: quando comincia il trailer sono già pronte.
  useEffect(() => { avviaPreparazione(); }, []);

  // dopo un errore di disegno: si ricomincia dal menu d'avvio, con un confine nuovo
  const [ripartenza, setRipartenza] = useState(0);
  const tornaAllIntro = () => { setGiaVisto(true); setFase("trailer"); setRipartenza((n) => n + 1); };
  const alMenu = () => { setGiaVisto(true); setFase("trailer"); };
  const finePartita = (f: FinePartita) => {
    setDaAnnunciare(f.trofei);
    if (f.esito === "persa" || !f.frase) { alMenu(); return; }   // una morte resta asciutta: niente sequenza
    setSequenza({ frase: f.frase });
    setFase("finale");
  };

  return (
    <div className="h-full w-full bg-black">
      <ConfineErrori key={ripartenza} onTorna={tornaAllIntro}>
        {fase === "loghi" && <Loghi onFine={() => setFase("avviso")} />}
        {fase === "avviso" && <Avviso onFine={() => setFase("trailer")} />}
        {fase === "trailer" && (
          <Trailer
            key={giaVisto ? "fine" : "intero"}
            startAtEnd={giaVisto}
            onLaunch={(daCaricare) => { setCarica(daCaricare ?? null); setPartita((n) => n + 1); setGiaVisto(true); setFase("gioco"); }}
            onTitoli={() => { setSequenza({ frase: null }); setFase("finale"); }}
            annuncia={daAnnunciare}
            onAnnunciati={() => setDaAnnunciare([])}
          />
        )}
        {fase === "gioco" && <GameShell key={partita} carica={carica} onExit={() => setFase("trailer")} onFine={finePartita} />}
        {fase === "finale" && <SequenzaFinale frase={sequenza.frase} onFine={alMenu} />}
      </ConfineErrori>
      <AvvisoAggiornamento />
    </div>
  );
}
