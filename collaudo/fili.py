"""I due fili del viaggio e la terza via al guado (pre-produzione/06-ramificazione.md).

  · il sangue: il cane ucciso, Vito colpito, Vito a terra. Il bluff con la pistola
    scarica no: non muore nessuno;
  · la generosità: il primo dono a Saverio, a Rosaria, e Pasquale curato. Una
    volta per persona: ridare non conta di nuovo. Il dono a Iole no: senza, la
    pompa non va, e lo pagano tutti (è un prezzo, non un dono);
  · chi li ricorda: Rosaria (più fredda col sangue), Ciro (creditore di Vito), Tore,
    Onofrio (la febbre di Pasquale), Cosimo (la prima battuta), la strada di
    Acquamorta (una volta sola);
  · il guado: col fucile, posarlo basta se il viaggio è stato generoso e senza
    sangue; altrimenti si resta (la veglia), tre turni senza sangue, cinque col
    sangue; riprendere il fucile, o alzare le mani su Cosimo, rompe la veglia.

Ogni prova parte da un mondo nuovo e mette il giocatore dove serve, con le cose e
i contatori che servono: così si prova la regola, non il percorso per arrivarci
(quello lo provano finali.py e pulsanti.py con i percorsi G_posato e H_veglia).

Uso:  python fili.py      (esce con 1 se una prova fallisce)
"""
import sys

from partita import Partita

esiti = []


def prova(nome, ok, dettaglio=""):
    esiti.append(ok)
    print(f"{'OK ' if ok else 'KO '}{nome}" + (f"  → {dettaglio}" if dettaglio and not ok else ""))


def partita(luogo, cose=(), **contatori):
    p = Partita(seme=1)
    p.m.posizione_giocatore = luogo
    for c in cose:
        p.m.inventario.add(c)
        p.m.oggetti[c].posizione = "inventario"
    p.m.variabili.update(contatori)
    return p


def fai(p, *comandi):
    return "".join(p.esegui(c) for c in comandi)


# ---------------------------------------------------------------------------
# 1. il sangue
# ---------------------------------------------------------------------------
p = partita("serra", ["coltello"])
fai(p, "attacca il cane", "attacca il cane")
prova("il cane ucciso è sangue (1)", p.v("sangue") == 1 and p.v("stato del cane") == "abbattuto", str(p.v("sangue")))

p = partita("casello", ["coltello"], vita=10)
fai(p, "attacca Vito")
prova("la prima volta che colpisci Vito è sangue (1)", p.v("sangue") == 1, str(p.v("sangue")))
fai(p, "attacca Vito", "attacca Vito")
prova("Vito a terra ne aggiunge uno (2), i colpi in mezzo no", p.v("sangue") == 2 and p.v("vita di vito") <= 0, f"{p.v('sangue')} {p.v('vita di vito')}")

p = partita("casello", ["pistola"])
fai(p, "minaccia Vito")
prova("il bluff con la pistola scarica non è sangue", p.v("sangue") == 0 and p.v("stato del casello") == "aperto", str(p.v("sangue")))

# ---------------------------------------------------------------------------
# 2. la generosità, una volta per persona
# ---------------------------------------------------------------------------
p = partita("pozzo", cibo=5)
fai(p, "parla con Saverio", "Ti lascio del cibo", "grazie", "parla con Saverio", "Ti lascio del cibo", "grazie", "aspetta")
prova("Saverio: due doni, la generosità conta uno", p.v("generosità") == 1 and p.v("cibo") == 3, f"{p.v('generosità')} cibo {p.v('cibo')}")

p = partita("diga", acqua=6)
fai(p, "parla con Iole", "Ti lascio dell'acqua", "grazie", "Ti lascio dell'acqua", "grazie", "niente", "aspetta")
prova("Iole: il dono apre il casotto, ma è un prezzo: la generosità non cresce",
      p.v("generosità") == 0 and p.v("fiducia di iole") >= 3, str(p.v("generosità")))

p = partita("osteria", acqua=6)
fai(p, "parla con Rosaria", "Ti lascio dell'acqua", "…", "Ti lascio dell'acqua", "…", "Niente, grazie", "aspetta")
prova("Rosaria: due doni nella brocca, la generosità conta uno", p.v("generosità") == 1 and p.v("fiducia di rosaria") == 3,
      f"{p.v('generosità')} fiducia {p.v('fiducia di rosaria')}")

p = partita("vicolo", ["medicine"])
fai(p, "usa le medicine su Pasquale", "usa le medicine su Pasquale")
prova("Pasquale curato: la generosità conta uno", p.v("generosità") == 1 and p.v("stato di pasquale") == "curato", str(p.v("generosità")))

# ---------------------------------------------------------------------------
# 3. chi ricorda
# ---------------------------------------------------------------------------
p = partita("piazzetta", sangue=1)
t = fai(p, "nord")
prova("col sangue Rosaria accoglie, ma ti guarda le mani (fiducia 0)",
      "ti guarda le mani" in t and p.v("fiducia di rosaria") == 0 and p.v("sete") == 0, t[-160:])
p = partita("piazzetta")
t = fai(p, "nord")
prova("senza sangue l'accoglienza di sempre (fiducia 1)",
      "prima ancora che tu apra bocca" in t and "ti guarda le mani" not in t and p.v("fiducia di rosaria") == 1, t[-120:])

p = partita("piazzetta", **{"vita di vito": 0})
t = fai(p, "sud", "nord", "sud")
prova("Ciro sa di Vito, e lo dice una volta sola", t.count("Quello del casello") == 1, t[-200:])
p = partita("piazzetta")
prova("con Vito in piedi Ciro non ne parla", "Quello del casello" not in fai(p, "sud"))

p = partita("pianoro", sangue=1)
prova("Tore: Rosaria ha mandato a dire anche il resto", "anche il resto" in fai(p, "parla con Tore"))
p = partita("pianoro")
prova("Tore, senza sangue: «sei uno a posto»", "uno a posto" in fai(p, "parla con Tore"))

p = partita("grotta", **{"stato di pasquale": "curato"})
t = fai(p, "parla con Onofrio", "Cosa è successo")
prova("Onofrio sa di Pasquale, e della febbre", "uno con la febbre" in t, t[-200:])
p = partita("grotta")
prova("Onofrio, se Pasquale è rimasto malato, no", "uno con la febbre" not in fai(p, "parla con Onofrio", "Cosa è successo"))

for nome, cont, frase in [("col sangue", {"sangue": 1, "generosità": 4}, "Guarda le tue mani"),
                          ("con la generosità", {"generosità": 3}, "Dicono che per strada"),
                          ("senza l'uno né l'altro", {"generosità": 2}, "Non alza la voce. «Io sono rimasto")]:
    p = partita("guado", **cont)
    prova(f"Cosimo, la prima battuta {nome}", frase in fai(p, "parla con Cosimo"))

# ---------------------------------------------------------------------------
# 4. il guado: il fucile posato e la veglia
# ---------------------------------------------------------------------------
p = partita("guado", ["fucile"], generosità=3)
t = fai(p, "lascia il fucile")
prova("mani pulite e generose: posato il fucile, Cosimo si sposta subito",
      p.v("stato di cosimo") == "riconosciuto" and p.v("stato del riconoscimento") == "fucile"
      and p.m.oggetti["fucile"].posizione is None and "Quello che lasciava l'acqua" in t, t[-200:])

p = partita("guado", ["fucile"], generosità=2)
t = fai(p, "lascia il fucile")
prova("senza doni posarlo non basta: la veglia comincia", p.v("stato di cosimo") == "fermo" and "Posarlo non basta" in t
      and p.v("stato della veglia") == "accesa", t[-160:])
fai(p, "aspetta")
prova("…un turno di attesa non basta", p.v("stato di cosimo") == "fermo")
t = fai(p, "aspetta")
prova("…al terzo turno Cosimo si sposta (veglia)", p.v("stato di cosimo") == "riconosciuto" and p.v("stato del riconoscimento") == "veglia"
      and "tirare sassi" in t, t[-200:])

p = partita("guado", ["fucile"], sangue=1, generosità=4, sete=0)
t = fai(p, "lascia il fucile", "aspetta", "aspetta")
prova("col sangue non basta nemmeno la generosità: «L'hai posato anche lì?»", "L'hai posato anche lì" in t and p.v("stato di cosimo") == "fermo")
fai(p, "aspetta")
sete = p.v("sete")
prova("…al quarto turno ancora fermo, e la sete sale", p.v("stato di cosimo") == "fermo" and "gola di sabbia" in p.storia[-1][1], str(sete))
t = fai(p, "aspetta")
prova("…al quinto turno si sposta", p.v("stato di cosimo") == "riconosciuto" and "stare fermo" in t, t[-200:])

p = partita("guado", ["fucile"])
fai(p, "lascia il fucile", "aspetta")
t = fai(p, "prendi il fucile")
prova("riprendere il fucile rompe la veglia", "Annuisce appena" in t and p.v("veglia") == 0 and p.v("stato della veglia") == "spenta", t[-160:])
t = fai(p, "attacca Cosimo")
prova("…e da lì si può ancora sparare", p.v("stato di cosimo") == "abbattuto", t[-120:])

p = partita("guado", ["fucile"])
fai(p, "lascia il fucile", "aspetta", "prendi il fucile", "lascia il fucile", "aspetta")
prova("posato di nuovo, la veglia ricomincia da capo", p.v("stato di cosimo") == "fermo" and p.v("veglia") == 2, str(p.v("veglia")))
t = fai(p, "attacca Cosimo")
prova("alzare le mani su Cosimo durante la veglia la rompe", "A mani nude" in t and p.v("stato di cosimo") == "fermo"
      and p.v("stato della veglia") == "spenta", t[-160:])
fai(p, "prendi il fucile", "lascia il fucile", "aspetta", "aspetta")
prova("…e bisogna ricominciare da capo", p.v("stato di cosimo") == "riconosciuto")

p = partita("guado", ["lettera"], sangue=2)
fai(p, "usa la lettera su Cosimo")
prova("la lettera basta anche col sangue", p.v("stato di cosimo") == "riconosciuto" and p.v("stato del riconoscimento") == "lettera")

# ---------------------------------------------------------------------------
# 5. la strada di Acquamorta, una volta sola
# ---------------------------------------------------------------------------
for nome, cont, frase in [("riconosciuto, col sangue", {"stato di cosimo": "riconosciuto", "sangue": 1, "generosità": 4}, "si è saputo anche qui"),
                          ("riconosciuto, con la generosità", {"stato di cosimo": "riconosciuto", "generosità": 3}, "So anche dove hai lasciato l'acqua"),
                          ("abbattuto", {"stato di cosimo": "abbattuto"}, "Sul muro della prima casa")]:
    p = partita("guado", **cont)
    t = fai(p, "nord", "sud", "nord")
    prova(f"la strada: {nome}", t.count(frase) == 1, t[-200:])

print("TUTTO OK" if all(esiti) else "CI SONO FALLIMENTI")
sys.exit(0 if all(esiti) else 1)
