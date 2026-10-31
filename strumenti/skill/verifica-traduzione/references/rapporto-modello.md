# Modello di rapporto

Scrivilo in italiano se l'utente parla italiano. Una tabella per priorità; niente testo che l'utente non possa usare per decidere.

```markdown
# Verifica dell'inglese: calchi e schemi da LLM

> Data e versione. Quante voci, quante parole. Che cosa si è verificato (solo la lingua di arrivo) e con quali criteri.
> Se nulla è stato modificato, dillo qui.

## Esito in breve
- Giudizio in due righe, coi numeri: quanti testi hanno una proposta, divisi per priorità.
- Che tipo di difetti prevale (es. «italianismi di costruzione, non di vocabolario»).
- Chi ha scritto le proposte e che cosa non sostituiscono (una rilettura umana).

## Come è stato fatto
1. Lettura integrale con l'originale a fianco (solo riferimento).
2. Criteri: regole del progetto, skill di supporto usate come elenco di sintomi.
3. Scansione meccanica (quali controlli).
4. Vincoli tecnici rispettati dalle proposte.

## Che cosa è a posto (controllato)
Tabella Controllo / Esito. I risultati negativi (0 trattini, 0 americanismi, 0 caratteri invisibili…) dicono quanto si è guardato.

## Priorità 1: errori (N)
| Voce | Dove | Attuale | Proposta | Perché |

## Priorità 2: calchi che si notano (N)
| Voce | Dove | Attuale | Proposta | Perché |

## Priorità 3: ritocchi di finezza (N)
| Voce | Dove | Attuale | Proposta | Perché |

## Decisioni
D1…Dn: frasi cardine e scelte di gusto, ciascuna con proposta e alternativa. Quelle già sciolte in passato: «chiusa, nessuna modifica» e il perché.

## Come applicarle
Script a stringhe esatte con controllo di unicità, controlli del progetto da rilanciare.
```

Consigli:

- Nelle tabelle non usare il carattere `|` dentro le celle.
- «Dove» è il riferimento che permette di ritrovare la voce (file e riga dell'originale, o numero d'ordine nel catalogo).
- Se una proposta cambia il significato rispetto all'originale, non è una proposta di stile: mettila in SENSO e dillo.
