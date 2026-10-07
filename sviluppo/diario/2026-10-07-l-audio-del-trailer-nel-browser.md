---
data: 2026-10-07
ora: "08:45"
titolo: "L'audio del trailer nel browser"
tipo: sessione
versione: 1.13.1
---

# L'audio del trailer nel browser

## In breve
Sulla versione web (GitHub Pages) la musica del trailer non si sentiva. Ora parte da sola quando la pagina ha già avuto un gesto dell'utente.

## Contesto
`Trailer.tsx` accendeva la musica al primo tasto o clic *dopo* il montaggio del trailer. Ma il clic che chiude l'avviso d'apertura avviene prima: nessun altro gesto arriva durante il filmato, e il browser non lascia partire l'audio da solo. Sul desktop (Electron) l'autoplay è permesso, per questo il difetto non si vedeva.

## Lavoro fatto
- `Trailer.tsx`: se `navigator.userActivation.hasBeenActive` è vero, la colonna sonora si attiva subito, come sul desktop. Il vecchio ascolto del primo gesto resta per i browser che non espongono l'API (Safari) o per chi arriva senza gesti.

## Decisioni
- **Patch (1.13.1)** — perché si corregge un errore senza cambiare niente per chi gioca sul desktop.
- **Nessun pulsante «audio» nuovo durante il filmato** — perché il trailer non ha comandi (solo Esc); il caso residuo è chi salta l'avviso con Esc, che non conta come gesto.

## Verifiche
- `tsc` pulito. Nel server di sviluppo: loghi con Esc, clic sull'avviso, poi `brano()` dà attivo, non fermo, tempo che avanza (3,09 s dopo 4 s).
- Non provato su Safari/Firefox.

## Questioni aperte
- Solo la versione web ne beneficia: l'app desktop 1.13.0 non è toccata; la 1.13.1 non è rilasciata come pacchetto.
