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
  · le chiusure: le sei che chiudono la storia alla soglia raccolgono il viaggio, con
    una riga per ciò che hai fatto a Saverio, a Iole, a Vito, a Imma, a Rosaria, a
    Pasquale e a Ciro (1.12.0), e solo per ciò che hai fatto davvero.

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

# ---------------------------------------------------------------------------
# 6. Imma, sulla discesa: il cibo che stringe proprio lì (1.7.0)
# ---------------------------------------------------------------------------
p = partita("discesa", cibo=4)
t = fai(p, "parla con Imma")
prova("Imma, sulla discesa, chiede da mangiare e dà tre risposte", "Mi serve da mangiare" in t and "Tieni, mangia" in t
      and "Non posso" in t and "Chi sei" in t, t[-240:])
fai(p, "Tieni", "…", "aspetta")
prova("«Tieni, mangia» costa due porzioni, vale un dono (la generosità, una volta sola) e Imma lascia la discesa",
      p.v("cibo") == 2 and p.v("generosità") == 1 and p.m.variabili["stato di imma"] == "nutrita"
      and "Imma" not in fai(p, "guarda"), f"cibo {p.v('cibo')} gen {p.v('generosità')}")
fai(p, "aspetta", "aspetta")
prova("…e non conta di nuovo", p.v("generosità") == 1)

p = partita("discesa", cibo=1)
t = fai(p, "parla con Imma")
prova("con una porzione sola, l'offerta è «l'ultimo che ho» e «Tieni, mangia» non c'è", "È l'ultimo che ho" in t and "Tieni, mangia" not in t, t[-200:])
t = fai(p, "ultimo", "…", "aspetta")
prova("…costa l'ultima, e vale un dono", p.v("cibo") == 0 and p.v("generosità") == 1 and "L'ultimo non lo dà quasi nessuno" in t, t[-200:])

p = partita("discesa", cibo=0)
t = fai(p, "parla con Imma")
prova("a mani vuote non c'è niente da dare, e lei lo vede", "Tu non ne hai" in t and "Tieni" not in t and "ultimo" not in t, t[-200:])
t = fai(p, "Non posso")
prova("«Non posso» non costa niente, e lei resta lì", "Lo dicono tutti" in t and p.m.variabili["stato di imma"] == "digiuna"
      and p.v("generosità") == 0, t[-160:])

p = partita("discesa", cibo=4, fame=8)
prova("se anche tu hai fame, lei lo vede", "Anche tu" in fai(p, "parla con Imma"))

p = partita("discesa", cibo=4)
t = fai(p, "parla con Imma", "Chi sei", "casello", "…", "Com'è il paese", "…")
prova("Imma racconta di sé, di Vito («mi ha chiamata sorella»), e del paese (Rosaria, Peppe)",
      "Sono di giù" in t and "mi ha chiamata sorella" in t and "Rosaria ti mette a sedere" in t and "ragazzo della piazzetta" in t, t[-300:])
prova("…e se torni al primo discorso non ripete il benvenuto", "Allora?" in p.storia[-1][1] and "tre giorni" not in p.storia[-1][1], p.storia[-1][1][-160:])

# in osteria la voce corre: Imma ha parlato
p = partita("discesa", cibo=4)
fai(p, "parla con Imma", "Tieni", "…", "ovest", "ovest")
t = fai(p, "nord")
prova("senza sangue: Rosaria lo sa, la scodella è piena e la fiducia sale (1 → 2)", "Mi ha detto della discesa" in t
      and p.v("fiducia di rosaria") == 2 and "Puoi vedere qui: Rosaria, Imma" in fai(p, "guarda"), f"fiducia {p.v('fiducia di rosaria')} | {t[-200:]}")
p = partita("discesa", cibo=4, sangue=1)
fai(p, "parla con Imma", "Tieni", "…", "ovest", "ovest")
t = fai(p, "nord")
prova("col sangue: Imma parla per te, Rosaria si siede e la fiducia non cala (1)", "Quello lì mi ha dato da mangiare" in t
      and "alla fine si siede" in t and p.v("fiducia di rosaria") == 1 and "ti guarda le mani" in t, f"fiducia {p.v('fiducia di rosaria')} | {t[-200:]}")
t = fai(p, "parla con Rosaria")
prova("…e anche nel suo discorso: ha ancora la fiducia da guadagnare", "La fiducia no" in t and "ha parlato bene di te" in t, t[-200:])
p = partita("piazzetta", sangue=1)
prova("col sangue e senza Imma resta com'era (fiducia 0)", "Quello lì" not in fai(p, "nord") and p.v("fiducia di rosaria") == 0)

p = partita("piazzetta", cibo=4)
fai(p, "nord", "sud", "est", "est", "parla con Imma", "Tieni", "…", "ovest", "ovest")
t = fai(p, "nord")
prova("se ci vai dopo essere stato in osteria, la ritrovi lì lo stesso (fiducia +1)", "Al tavolo della finestra c'è Imma" in t
      and p.v("fiducia di rosaria") == 2, f"fiducia {p.v('fiducia di rosaria')} | {t[-160:]}")

p = partita("osteria", **{"stato di imma": "arrivata", "stato dell'accoglienza": "data"})
p.m.oggetti["imma"].posizione = "osteria"
p.m.trova_stanza("osteria").oggetti["imma"] = p.m.oggetti["imma"]
t = fai(p, "parla con Imma", "vicolo")
prova("in osteria Imma dice di Pasquale, se è malato", "Non l'ho mai sentito lamentarsi" in t, t[-200:])

# conta come uno dei doni: tre su quattro bastano al guado, anche senza le medicine
p = partita("guado", ["fucile"], generosità=3)
prova("la generosità arriva a 3 anche con Saverio, Rosaria e Imma (senza Pasquale)",
      "Quello che lasciava l'acqua" in fai(p, "lascia il fucile"))

# ---------------------------------------------------------------------------
# 7. Ciro non spreca la tanica: se non c'è posto, le stesse merci si cambiano in cibo
# ---------------------------------------------------------------------------
for acqua, damigiana, atteso_acqua, atteso_cibo in [(5, False, True, False), (7, False, True, False), (8, False, False, True),
                                                    (10, False, False, True), (10, True, True, False), (17, True, True, False)]:
    p = partita("mercato", ["orologio", "batteria", "stecca"] + (["damigiana"] if damigiana else []), acqua=acqua)
    fai(p, "parla con Ciro")
    opz = p.opzioni_dialogo()
    ha_acqua = any(o.startswith("Ti do l'orologio") for o in opz)
    ha_cibo = any(o.startswith("La tanica non ha posto: ti do l'orologio") for o in opz)
    prova(f"Ciro, orologio con acqua {acqua}{' e la damigiana' if damigiana else ''}: "
          f"{'per acqua' if atteso_acqua else 'per cibo'}", ha_acqua == atteso_acqua and ha_cibo == atteso_cibo, str(opz))
p = partita("mercato", ["batteria"], acqua=9, cibo=1)
fai(p, "parla con Ciro", "batteria")
prova("la batteria a tanica piena: due di cibo, e l'acqua resta com'è", p.v("cibo") == 3 and p.v("acqua") == 9, f"{p.v('cibo')} {p.v('acqua')}")
p = partita("mercato", ["cartucce"], acqua=8)
prova("le cartucce (2 d'acqua) a 8 d'acqua ci stanno ancora", any(o.startswith("Ti do le cartucce") for o in (fai(p, "parla con Ciro") and p.opzioni_dialogo())))

# ---------------------------------------------------------------------------
# 8. il bluff, che Vito racconta (1.10.0)
# ---------------------------------------------------------------------------
def voce(p, nome):
    return p.m.variabili.get(f"stato della voce {nome}")


p = partita("casello", ["pistola"])
fai(p, "minaccia Vito")
prova("il bluff è un fatto della storia, non sangue", p.m.variabili["stato del bluff"] == "fatto" and p.v("sangue") == 0)
t = fai(p, "parla con Vito")
prova("tornando da Vito: «Lo racconto, adesso, a chi passa»", "Lo racconto bene" in t, t[-200:])
p = partita("casello")
prova("Vito senza bluff non lo dice", "Lo racconto bene" not in fai(p, "parla con Vito"))

p = partita("piazzetta", **{"stato del bluff": "fatto"})
t = fai(p, "sud")
prova("Ciro, la prima volta: «Quello della pistola», e la voce arriva",
      "Quello della pistola" in t and voce(p, "del bluff") == "udita", t[-200:])
t = fai(p, "nord", "sud")
prova("…una volta sola", "Quello della pistola" not in t)
p = partita("piazzetta")
prova("senza il bluff Ciro non ne parla, e la voce non c'è", "Quello della pistola" not in fai(p, "sud") and voce(p, "del bluff") == "ignota")

p = partita("pianoro", **{"stato del bluff": "fatto"})
t = fai(p, "parla con Tore")
prova("Tore sa del ferro vuoto", "ferro vuoto" in t, t[-220:])
p = partita("pianoro", **{"stato del bluff": "fatto"}, sangue=1)
prova("…ma col sangue Tore dice quello, non il bluff", "anche il resto" in fai(p, "parla con Tore"))
p = partita("pianoro", generosità=2)
t = fai(p, "parla con Tore")
prova("Tore, con due doni, dice che lasci qualcosa a chi resta", "lasci qualcosa a chi resta" in t, t[-200:])

p = partita("guado", **{"stato del bluff": "fatto"})
t = fai(p, "parla con Cosimo")
prova("Cosimo, la prima battuta col bluff: «Hai fatto la faccia giusta»", "faccia giusta" in t, t[-240:])
p = partita("guado", **{"stato del bluff": "fatto"}, generosità=3)
prova("…ma la generosità vince sul bluff", "lasci l'acqua a chi è rimasto" in fai(p, "parla con Cosimo"))
p = partita("guado", ["pistola"], **{"stato del bluff": "fatto"})
t = fai(p, "minaccia Cosimo")
prova("minacciare Cosimo con la pistola già vista: «Quella del casello»", "Quella del casello" in t, t[-200:])
p = partita("guado", ["pistola"])
prova("senza il bluff, la pistola la riconosce lui da solo («Si vede da come la tieni»)", "da come la tieni" in fai(p, "minaccia Cosimo"))

# ---------------------------------------------------------------------------
# 9. Peppe, e il sangue: te lo chiede una volta sola (1.10.0)
# ---------------------------------------------------------------------------
p = partita("piazzetta", sangue=1)
t = fai(p, "parla con Peppe")
prova("con le mani sporche Peppe chiede, e le risposte sono tre (più quelle di sempre)",
      "voglio saperlo da te" in t and "È vero. Non l'ho voluto" in t and "Non è così" in t and "Non devo dirti niente" in t
      and "Vieni con me" in t, t[-420:])
fai(p, "È vero", "…")
prova("«È vero»: Peppe lo sa (vero), e la domanda è fatta", p.m.variabili["stato del sapere di peppe"] == "vero"
      and p.m.variabili["stato della domanda di peppe"] == "fatta")
t = p.storia[-1][1]                       # il «…» riporta al primo nodo: si è ancora nel dialogo
prova("…e tornando al primo discorso non lo chiede di nuovo", "voglio saperlo da te" not in t and "Vieni con me" in t
      and "Non è così" not in t and "Portami con te" in t, t[-300:])
p = partita("piazzetta", sangue=1)
fai(p, "parla con Peppe", "Non è così", "…")
prova("«Non è così»: bugia", p.m.variabili["stato del sapere di peppe"] == "bugia")
p = partita("piazzetta", sangue=1)
t = fai(p, "parla con Peppe", "Non devo dirti niente")
prova("«Non devo dirti niente»: Peppe non sa, e lo dice («non mi hai detto una bugia»)",
      p.m.variabili["stato del sapere di peppe"] == "nuovo" and p.m.variabili["stato della domanda di peppe"] == "fatta"
      and "non mi hai detto una bugia" in t, t[-200:])
p = partita("piazzetta")
t = fai(p, "parla con Peppe")
prova("a mani pulite Peppe non chiede niente", "voglio saperlo da te" not in t and "Portami con te" in t, t[-200:])
p = partita("piazzetta", sangue=1)
fai(p, "parla con Peppe", "È vero", "…", "Vieni con me", "…")
prova("dopo la risposta si può ancora portarlo con sé", p.m.variabili["stato di peppe"] == "preso")

for sa, atteso_valico, atteso_guado, atteso_fuga in [
        ("nuovo", "È là, casa tua?", "Ha capito prima di te chi è quell'uomo.", "i sassi smossi di qualcuno che è corso via senza voltarsi."),
        ("vero", "Mi hai detto del male che hai fatto", "Non per paura: per sapere", "tu gliel'avevi detto"),
        ("bugia", "Io i conti li tengo", "come su una cosa che gli hanno già raccontato", "gli avevi detto di no")]:
    compagno = {"stato di peppe": "compagno", "stato del sapere di peppe": sa}
    p = partita("valico", **compagno, **{"stato della tappa di peppe": "salita"})
    t = fai(p, "aspetta")
    prova(f"sul valico, Peppe che {sa}: la sua battuta", atteso_valico in t and t.count("È là, casa tua?") == 1, t[-220:])
    p = partita("guado", **compagno, **{"stato della tappa di peppe": "valico"})
    t = fai(p, "aspetta")
    prova(f"al guado, Peppe che {sa}: lo sguardo", atteso_guado in t, t[-220:])
    p = partita("guado", ["fucile"], **compagno)
    t = fai(p, "attacca Cosimo")
    prova(f"lo sparo, Peppe che {sa}: scappa, e la riga è sua",
          p.m.variabili["stato di peppe"] == "fuggito" and atteso_fuga in t, t[-240:])

# ---------------------------------------------------------------------------
# 10. quello che si dice di te, a lato dello schermo (1.10.0)
# ---------------------------------------------------------------------------
p = partita("piazzetta", sangue=1)
fai(p, "nord")
prova("col sangue, in osteria si sente dire che alzi le mani", voce(p, "del sangue") == "udita" and voce(p, "della generosità") == "ignota")
p = partita("piazzetta")
fai(p, "nord")
prova("a mani pulite, in osteria non si sente niente", voce(p, "del sangue") == "ignota")
p = partita("discesa", cibo=4)
fai(p, "parla con Imma", "Tieni", "…", "ovest", "ovest", "nord")
prova("sfamare Imma: si sente dire che lasci qualcosa a chi resta (senza sangue)", voce(p, "della generosità") == "udita" and voce(p, "del sangue") == "ignota")
p = partita("discesa", cibo=4, sangue=1)
fai(p, "parla con Imma", "Tieni", "…", "ovest", "ovest", "nord")
prova("…col sangue, tutte e due", voce(p, "della generosità") == "udita" and voce(p, "del sangue") == "udita")
p = partita("piazzetta", **{"vita di vito": 0})
fai(p, "sud")
prova("Ciro, che sa di Vito a terra: la voce del sangue", voce(p, "del sangue") == "udita")

# ---------------------------------------------------------------------------
# 11. «getta cibo» e le sue parole sono un gesto solo (1.10.0)
# ---------------------------------------------------------------------------
for cmd in ["getta cibo", "getta il cibo", "lancia cibo", "lancia il cibo", "getta"]:
    p = partita("serra", cibo=2)
    t = fai(p, cmd)
    prova(f"alla serra «{cmd}» distrae il cane e dà le conserve", "prendi le conserve" in t and p.v("cibo") == 4, t[-120:])
    p = partita("masseria", cibo=2)
    prova(f"…e altrove «{cmd}» non fa niente", "Non c'è niente da gettare" in fai(p, cmd) and p.v("cibo") == 2)

# ---------------------------------------------------------------------------
# 12. le chiusure raccolgono il viaggio (1.12.0): una riga per ciò che hai fatto per strada
# ---------------------------------------------------------------------------
ATTACCO = "Dietro di te, la strada."
FATTI = [  # (che cosa hai fatto, le variabili che lo dicono, la riga)
    ("il cibo a Saverio", {"fiducia di saverio": 3}, "Saverio ha preso il cibo e non ha detto grazie."),
    ("il cane ucciso", {"stato del cane": "abbattuto"}, "Nella serra il cane è rimasto giù, tra le casse."),
    ("la pompa col tuo filtro", {"stato della pompa": "attiva"}, "La pompa della diga tira acqua da bere. Il filtro è il tuo."),
    ("il bluff a Vito", {"stato del bluff": "fatto"}, "Vito, al casello, ti ha fissato in faccia per ricordarsela."),
    ("Vito a terra", {"vita di vito": 0}, "Contro la sbarra del casello Vito è rimasto seduto."),
    ("Imma sfamata", {"stato di imma": "arrivata"}, "Imma, sulla discesa, ha avuto da mangiare."),
    ("l'acqua a Rosaria", {"stato della brocca": "piena"}, "Dietro il banco di Rosaria c'è una brocca piena: l'acqua è la tua."),
    ("Pasquale curato", {"stato di pasquale": "curato"}, "Pasquale, nel vicolo, ha la febbre rotta. L'orgoglio, quello no."),
]
FEDE = "La fede di lei Ciro l'ha rigirata controluce, al mercato, e non ha fatto domande."
TUTTE = [f for _, _, f in FATTI] + [FEDE]
MANI_VUOTE = {"stato di cosimo": "riconosciuto"}


def chiusura(var, cose=()):
    """Dalla strada alla soglia, con queste variabili e queste cose: il testo che esce."""
    p = partita("strada", cose, **var)
    return fai(p, "nord")


t = chiusura(MANI_VUOTE)
prova("a mani vuote e senza fatti la chiusura è quella di sempre: niente attacco, niente righe del viaggio",
      ATTACCO not in t and not any(f in t for f in TUTTE) and "FINALE — Sei arrivato a casa con le mani vuote" in t, t[-200:])
prova("…e dopo l'ultima frase della scena non resta altro che spazio vuoto",
      t.split("Nessuno dei due entra.")[1].split("FINALE")[0].strip() == "")

for nome, var, frase in FATTI:
    t = chiusura({**MANI_VUOTE, **var})
    altre = [f for f in TUTTE if f != frase and f in t]
    prova(f"{nome}: la chiusura lo dice (e con l'attacco)", frase in t and ATTACCO in t and not altre, f"altre righe: {altre}")

t = chiusura({**MANI_VUOTE, **{k: v for _, var, _ in FATTI for k, v in var.items()}})
prova("tutti i fatti insieme: tutte le righe, nell'ordine della strada, con un attacco solo",
      all(f in t for f in TUTTE[:-1]) and t.count(ATTACCO) == 1
      and [t.index(f) for f in TUTTE[:-1]] == sorted(t.index(f) for f in TUTTE[:-1]), t[-300:])

p = partita("mercato", ["anello"])
fai(p, "parla con Ciro", "Vendo l'anello", "Va bene così")
p.m.posizione_giocatore = "strada"
p.m.variabili["stato di cosimo"] = "riconosciuto"
t = fai(p, "nord")
prova("vendere la fede a Ciro: la chiusura lo dice (e con l'attacco)", FEDE in t and ATTACCO in t, t[-250:])
p = partita("strada", ["anello"], **MANI_VUOTE)
t = fai(p, "nord")
prova("…tenerla, no", FEDE not in t and "le hai riportato quello che era suo" in t, t[-250:])

FINALI = [  # (la chiusura, le variabili, le cose, un pezzo del suo FINALE)
    ("la via violenta con Peppe fuggito", {"stato di cosimo": "abbattuto", "stato di peppe": "fuggito"}, [], "La casa è tua. Il ragazzo che ti seguiva"),
    ("la via violenta", {"stato di cosimo": "abbattuto"}, [], "Sei entrato ad Acquamorta sopra il corpo di tuo fratello"),
    ("la via umana con Peppe", {"stato di cosimo": "riconosciuto", "stato di peppe": "compagno"}, [], "Hai trovato la casa, e hai scelto di non restarci"),
    ("la via umana col cavallo di legno", MANI_VUOTE, ["giocattolo"], "hai riportato a casa l'ultima cosa"),
    ("la via umana con la fede", MANI_VUOTE, ["anello"], "le hai riportato quello che era suo"),
    ("la via umana a mani vuote", MANI_VUOTE, [], "con le mani vuote"),
]
for nome, var, cose, finale in FINALI:
    senza = chiusura(var, cose)
    con = chiusura({**var, "fiducia di saverio": 3, "stato della brocca": "piena"}, cose)
    prova(f"{nome}: senza fatti niente righe, coi fatti due righe e il suo finale",
          finale in senza and ATTACCO not in senza and finale in con and ATTACCO in con
          and FATTI[0][2] in con and FATTI[6][2] in con, con[-300:])
prova("nessuna chiusura lascia parentesi quadre o doppi spazi nel testo",
      all(("[" not in chiusura({**var, **{k: v for _, vv, _ in FATTI for k, v in vv.items()}}, cose)
           and "  " not in chiusura({**var, **{k: v for _, vv, _ in FATTI for k, v in vv.items()}}, cose))
          for _, var, cose, _ in FINALI))

print("TUTTO OK" if all(esiti) else "CI SONO FALLIMENTI")
sys.exit(0 if all(esiti) else 1)
