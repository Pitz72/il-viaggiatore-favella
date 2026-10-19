// ====================================================================
//  Se qualcosa si rompe mentre si disegna, niente schermo nero.
// --------------------------------------------------------------------
//  Avvolge le fasi dell'app (loghi, avviso, trailer, gioco). Un errore di
//  disegno in una di esse viene scritto nel registro tecnico e sostituito da
//  un messaggio con un pulsante «torna all'intro»: chi gioca non resta davanti
//  a un nero senza uscita. (Gli errori dei gestori di eventi e dei timer non
//  passano di qui: li gestiscono i punti dove nascono, come il motore che non
//  parte, in ViaggiatorePlayer.)
// ====================================================================
import { Component, type ErrorInfo, type ReactNode } from "react";
import { annota } from "../lib/desktop";

interface Props { onTorna: () => void; children: ReactNode }
interface Stato { errore: Error | null }

export default class ConfineErrori extends Component<Props, Stato> {
  state: Stato = { errore: null };

  static getDerivedStateFromError(errore: Error): Stato { return { errore }; }

  componentDidCatch(errore: Error, info: ErrorInfo) {
    annota("error", `errore di disegno: ${errore.message}\n${info.componentStack ?? ""}`);
  }

  render() {
    const { errore } = this.state;
    if (!errore) return this.props.children;
    return (
      <div role="alert" style={{ position: "fixed", inset: 0, zIndex: 100, background: "#07070a", color: "#e9e2d6", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 14, padding: "0 8vw", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontFamily: "'Lora', Georgia, serif", fontWeight: 500, fontSize: "clamp(24px, 2.4vw, 40px)", color: "#f4ece0" }}>
          Qualcosa si è inceppato.
        </h1>
        <p style={{ margin: 0, maxWidth: "36rem", fontFamily: "'Lora', Georgia, serif", fontStyle: "italic", fontSize: "clamp(16px, 1.3vw, 22px)", lineHeight: 1.55, color: "rgba(230,223,210,.78)" }}>
          La schermata non si è potuta disegnare. Il viaggio salvato non è toccato: torna all'intro e riprendi da lì.
        </p>
        <p style={{ margin: 0, maxWidth: "44rem", fontFamily: "'Source Code Pro', ui-monospace, monospace", fontSize: 12.5, color: "rgba(200,208,220,.72)", overflowWrap: "anywhere" }}>
          {errore.message || String(errore)}
        </p>
        <button autoFocus onClick={this.props.onTorna}
          style={{ marginTop: 10, cursor: "pointer", fontFamily: "'Source Code Pro', ui-monospace, monospace", fontSize: 13, letterSpacing: ".16em", textTransform: "uppercase",
            color: "#e6e0d6", border: "1px solid rgba(255,255,255,.32)", background: "rgba(10,10,14,.5)", borderRadius: 999, padding: "10px 20px" }}>
          ← torna all'intro
        </button>
      </div>
    );
  }
}
