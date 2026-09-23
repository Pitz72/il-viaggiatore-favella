---
data: 2026-09-23
ora: "02:00"
titolo: "Il trailer e la nuova interfaccia di gioco"
tipo: sessione
versione: 1.0.0
---

# Il trailer e la nuova interfaccia di gioco

## In breve
Un trailer di 88 secondi a un solo orologio e un'interfaccia che si legge come un libro.

## Contesto
La prima presentazione web era una pagina da scorrere. Si voleva un filmato d'apertura e un gioco a tutto schermo con un aspetto all'altezza della prosa.

## Lavoro fatto
- trailer in dieci inquadrature: canvas procedurale (viandante articolato, paesaggi, mappa che si disegna), tipografia animata, suono sintetizzato;
- interfaccia: panorama vivo per zona, diario impaginato come un libro, dialoghi come pulsanti, pulsanti per uscite e cose, corpo e scorte con le soglie;
- guida «come si gioca»; MP4 dell'intro e foglio dei tempi per comporre la musica.

## Decisioni
- **Un solo orologio (requestAnimationFrame) per tutto il trailer** — perché: pausa, salto e video esportato restano esatti al fotogramma.
- **Titolo senza a capo (`nowrap`)** — perché: la spaziatura iniziale lo faceva andare su due righe per un istante (il «glitch»).

## Verifiche
Partita intera giocata nel browser fino a un finale; video esportato a fotogrammi deterministici.

## Questioni aperte
- gli oggetti descritti nella prosa delle stanze restano descritti dopo essere stati presi.
