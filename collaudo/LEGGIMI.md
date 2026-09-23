# Collaudo del Viaggiatore

Quattro collaudi dinamici, tutti sul motore del progetto (`../motore`) e sull'avventura
in `../prototipo`. Ognuno esce con codice 1 se trova un problema. Le trascrizioni
finiscono in `esiti/` (si possono cancellare: si rigenerano).

| File | Cosa fa | Durata |
|---|---|---|
| `finali.py` | gioca una partita per **ogni finale dichiarato** nei .fav: i 6 di storia e le 3 morti (sete, fame, ferite). Fallisce se un finale non è raggiunto, se una partita ne produce due, se il motore solleva un'eccezione. | ~10 s |
| `mirate.py` | 8 situazioni precise: guardie di bevi/mangia/tanica, il cane (mani nude, cibo), Vito (coltello, bluff, pedaggio), Rosaria agli ingressi ripetuti, Onofrio senza ricordi. | ~5 s |
| `salvataggi.py` | partite casuali (metà lunghe, su percorsi veri) che salvano, ricaricano in un'istanza nuova e **pretendono lo stesso stato**: impronta identica, poi le due istanze proseguono con gli stessi comandi e ogni risposta deve coincidere. Mette alla prova ANNULLA, ANCORA e i dialoghi prima e dopo il caricamento. | ~1 min |
| `esploratore.py` | 100 partite a caso con cinque caratteri (turista, curioso, maldestro, sconsiderato, chiacchierone) che esplorano tutto, sbagliano a scrivere, chiedono cose che non ci sono, attaccano, annullano. Segnala eccezioni, testi rotti, scorte negative, uscite o oggetti incoerenti, conversazioni senza risposte, e misura la copertura. | ~2–3 min |

Moduli di supporto: `partita.py` (una partita pilotata da Python, con la stessa vista
della scena che ha l'interfaccia) e `percorsi.py` (i sei percorsi scritti a mano).

## Opzioni dell'esploratore

```bash
python esploratore.py -n 5 -t 150     # giro rapido: 5 partite per carattere, 150 comandi
python esploratore.py --seme 7        # un'altra sequenza casuale, riproducibile
```

Il rapporto va in `esiti/esploratore-rapporto.md`; ogni anomalia ha la trascrizione
della prima partita in cui è comparsa (`esiti/anomalia-NN-tipo.txt`).

Il «turista» ha il corpo protetto (sete, fame e ferite non lo uccidono): non è un
giocatore reale, serve ad arrivare in ogni angolo del gioco. Gli altri quattro
caratteri muoiono davvero, e la proporzione di morti è un indizio per l'equilibrio.

## Primo giro (23/09/2026)

- `finali.py` ha trovato un difetto vero: le morti per sete e per fame mostravano
  sempre la frase generica, perché la vita arrivava a 0 prima della soglia estrema.
  Corretto in `sistemi.fav`: la morte ora dice la causa.
- `esploratore.py`: 100 partite, 15.416 comandi, **nessuna anomalia**; copertura 39/39
  luoghi, 27/27 oggetti, 50/52 nodi di dialogo (mancano solo la vendita dell'anello e
  la partenza di Peppe, due rami che il caso raggiunge di rado). L'80% delle partite
  a caso muore di fame o di sete: normale per chi gioca a caso, da tenere d'occhio
  quando si tarerà l'equilibrio con partite vere.
