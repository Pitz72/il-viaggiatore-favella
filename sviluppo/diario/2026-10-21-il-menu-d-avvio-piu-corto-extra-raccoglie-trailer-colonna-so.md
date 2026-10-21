---
data: 2026-10-21
ora: "11:01"
titolo: "Il menu d'avvio più corto: Extra raccoglie trailer, colonna sonora e siti"
tipo: decisione
versione: 1.31.0
---

# Il menu d'avvio più corto: Extra raccoglie trailer, colonna sonora e siti

## In breve
Con la voce «Extra» il menu d'avvio era arrivato a nove voci e «Esci» toccava il bordo dello schermo: «Rivedi il
trailer» passa in Extra, che prende anche i link a favella.eu ed ecosystem.runtimeradio.com, e il blocco titolo + menu
sale di 40 px.

## Contesto
Simone ha provato la 1.31.0 nel desktop (prima i cinque commit della colonna sonora erano stati pushati uno per volta,
dopo i 408 della mattina) e ha trovato il menu troppo pieno, con «Esci» a ridosso del bordo. Ha proposto due strade:
togliere Extra e mettere colonna sonora e siti nelle Opzioni, oppure alzare titolo, sottotitolo e menu.

Misurato a 1920×1080 (Electron fuori schermo sul server di sviluppo, `getBoundingClientRect`): la colonna partiva a
564 px, una voce occupa 54 px (62 col testo grande), una voce principale col dettaglio 91 px (104). Nel caso del
desktop con un salvataggio (Continua + otto voci) «Esci» finiva a ~1086 px su 1080, col testo grande a ~1160.

## Lavoro fatto
- `app/src/components/Trailer.tsx`: «Rivedi il trailer» lascia il menu d'avvio (otto voci sul desktop, sette nel
  browser) e va in Extra, dopo la colonna sonora; seguono **favella.eu** ed **ecosystem.runtimeradio.com**
  (`window.open`; sul desktop `setWindowOpenHandler` in `desktop/main.cjs` li manda già al browser di sistema, nessun
  canale nuovo) e «Indietro». Rivedere il trailer chiude Extra, così alla fine si torna al menu d'avvio. La riga sotto
  Extra dice «Aperto nel browser: …».
- Sul menu d'avvio il titolo sta a `TITOLO_SU_MENU` = 136 (era 176) e la colonna a `MENU_TOP` = 452 (era 492): il
  distacco fra «un gioco di Simone Pizzi» e «Si parte a piedi.» resta di 38 px. Nell'inquadratura J del trailer il
  titolo resta a 262.
- `app/src/accessibilita.css`: col testo grande le voci del menu d'avvio (`.mv-avvio`) hanno meno spazio sopra e sotto
  (0,08 em invece di 0,2), il testo resta grande; i fili d'accento risalgono (0,70 / 0,66 em) per restare a metà voce.
  La pausa non cambia.
- README (le voci del menu e che cosa c'è in Extra), CHANGELOG.

## Decisioni
- **Extra rinforzato, non le Opzioni** — perché: le Opzioni sono impostazioni e si aprono anche dalla pausa, a partita
  in corso; uno scaricamento e due siti lì non li cerca nessuno. Scelta di Simone col questionario, sul mio consiglio.
- **Si alza anche il titolo (40 px), non solo il menu** — perché: alzare solo il menu avrebbe incollato «Si parte a
  piedi.» a «un gioco di Simone Pizzi» (stesso corsivo, 38 → ~0 px). Nel consiglio avevo scritto «senza toccare il
  titolo»: misurando non si poteva, ed è detto a Simone.
- **Col testo grande si stringono gli spazi, non il testo** — perché: come per la guida (fase 8), il testo grande deve
  restare grande; senza, l'ultima voce finiva a ~1062 px.
- **Le etichette dei siti sono gli indirizzi** («favella.eu», «ecosystem.runtimeradio.com»), come nell'anteprima
  approvata; testo d'interfaccia, non detto dal doppiaggio.

## Verifiche
- Rimisurato a 1920×1080: titolo 136–304, «un gioco di Simone Pizzi» 381–414, «Si parte a piedi.» 452–494, voci da 524.
  Caso peggiore del desktop (Continua col dettaglio + Nuovo … Esci), dalle misure: «Esci» finisce a ~994 px (86 dal
  bordo); col testo grande ~1003 px (77). Extra (cinque voci): finisce a 867 / 874 px.
- Fotografie del menu e di Extra, normale e testo grande, coi fili d'accento accesi: allineati a metà voce.
- Build (`tsc && vite build`, via `desktop/prepara.mjs`) pulita; `collaudo/doppiaggio.py` TUTTO OK (nessun testo
  detto toccato: le voci del menu sono interfaccia); `collaudo/musica.py` TUTTO OK; `diario.mjs verifica` ok.

## Questioni aperte
- Simone sta provando il gioco nel desktop e si segna le altre cose da fare.
