---
data: 2026-10-20
ora: "19:30"
titolo: "Il doppiaggio nel gioco: i documenti e la chiusura"
tipo: sessione
versione: 1.22.1
---

# Il doppiaggio nel gioco: i documenti e la chiusura

## In breve
Fase 6, l'ultima del piano 08: i documenti dicono che il racconto ha una voce, come la si usa, chi l'ha fatta e con quali diritti. Il doppiaggio nel gioco è finito; prima di un rilascio restano da rifare i quattro personaggi fatti sul piano gratuito di ElevenLabs.

## Contesto
In una sera, una fase per volta e col via libera di Simone dopo ciascuna: le decisioni (cce9da0), il banco della voce (1.19.0), la voce nel gioco (1.20.0), i numeri e i fili (1.21.0), il trailer con Enzo (1.22.0, «top… capolavoro» all'ascolto), le verifiche (1.22.1). Le voci di diario della sera raccontano ogni passo.

## Lavoro fatto
- `README.md`: in apertura, che il racconto è doppiato per intero; una sezione «La voce» (voce recitata, un tasto la ferma, F2, le risposte al passaggio del mouse, il pulsante «♪ voce», il lettore di schermo, il trailer); la cartella `doppiaggio/` e la voce in `app/public/voce/`; i dodici collaudi (con `doppiaggio.py`); fra le licenze, «Le voci»: chi è fatto con quale servizio e voce, e che Imma, Rosaria, Tore e Vito non sono distribuiti (piano gratuito di ElevenLabs).
- `LICENSE-CONTENUTI.md`: le voci del doppiaggio (`app/public/voce/`) fra i contenuti CC BY-SA.
- `strumenti/LEGGIMI.md`: `doppiaggio-riconosci.py`, `doppiaggio-taglia.py`, `doppiaggio-banco.py`, `doppiaggio-trailer.py`, `trailer-mix.cjs`; l'esportatore e i rumori con la voce.
- `doppiaggio/LEGGIMI.md`: come la voce arriva nel gioco e nel trailer, e che cosa fare se un testo cambia.
- `collaudo/LEGGIMI.md`: dodici collaudi; la voce del trailer nel collaudo della voce.
- `video/il-viaggiatore-intro-tempi.md`: i video hanno il suono vero dalla 1.22.0; dove stanno i tempi della voce.
- `pre-produzione/08-doppiaggio-tts.md`: eseguito; il rilascio come fase 7, con i passi per rifare i quattro.

## Decisioni
- **Le voci del doppiaggio sono contenuti CC BY-SA** — sono la lettura dei testi del gioco, che sono CC BY-SA («condividi allo stesso modo»); Google non rivendica la proprietà dell'audio generato. Le voci di ElevenLabs del piano gratuito non sono nel repository né nei pacchetti, quindi non ricadono qui. Se Simone vuole un'altra licenza per l'audio, si cambia una riga.
- **Nessuna versione nuova** — cambiano solo documenti che non stanno nel pacchetto.

## Verifiche
- `node strumenti/diario.mjs verifica` e `node strumenti/versione.mjs verifica`: a posto.
- I collaudi e la CI della 1.22.1: verdi (voce di diario «Le verifiche finali della voce»).

## Questioni aperte
- **Prima di un rilascio:** rifare Imma, Rosaria, Tore e Vito (con Gemini, o con ElevenLabs su un piano a pagamento), tagliarli, toglierli da `SOLO_LOCALE` e rifare il banco (piano 08, fase 7).
- Il rilascio pubblico (workflow «Rilascio») solo su ordine di Simone.
- Fuori dal gioco, nell'Electron di sviluppo sul server Vite l'`<audio>` di `intro.mp3` non parte (errore del demultiplexer): non tocca il gioco desktop vero né il web, ma impedisce di provare dal vivo la musica sotto la voce con le finestre di prova.
