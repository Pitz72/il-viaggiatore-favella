---
data: 2026-09-23
ora: "04:00"
titolo: "Le morti per sete e fame non dicevano la causa"
tipo: problema
versione: 1.0.0
---

# Le morti per sete e fame non dicevano la causa

## In breve
Trovato dal collaudo dei finali: si moriva sempre con la frase generica.

## Contesto
Il nuovo collaudo `finali.py` gioca una partita per ogni finale dichiarato nei .fav e fallisce se uno non viene raggiunto.

## Lavoro fatto
- causa: la sete sale di 1 ogni 3 turni, da 9 a 13 servono 12 turni, ma la vita (10) finisce in 10; stesso schema per la fame;
- correzione in `sistemi.fav`: la morte a vita 0 legge la causa, con tre condizioni che si escludono.

## Decisioni
- **Correggere il gioco, non la soglia** — perché: la soglia a 13 resta una rete per i salti bruschi (`bevi salmastra`); il difetto era nella frase, non nel ritmo.

## Verifiche
`finali.py` 9/9 finali raggiunti; una sola frase di fine per partita.

## Questioni aperte
- l'equilibrio di fame e sete con partite vere (l'esploratore muore nell'80% dei casi, ma gioca a caso).
