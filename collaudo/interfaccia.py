"""Il ponte dell'interfaccia (app/src/lib/ponte.py) alla prova.

Tre cose che i pulsanti danno per certe:
  · «mangia» e «bere» soli si completano nel comando che il gioco conosce, e nella
    sequenza salvata entra quello;
  · l'anteprima di un comando dice la verità e non tocca il mondo: la stessa cosa,
    fatta davvero su una copia, cambia le stesse scorte e le stesse cose;
  · le azioni di contesto compaiono dove il testo del luogo le suggerisce
    (ATTINGI al pozzo, GETTA CIBO alla serra, CURATI con le medicine, ATTACCA il cane)
    e spariscono quando non servono più, o quando direbbero soltanto di no («Giù le
    mani», «Stai abbastanza in forze», «La sbarra è già su»); lo stesso per le
    due gesti che farebbero la stessa cosa alla stessa persona sono un pulsante solo.
    Le combinazioni di due cose («usa la chiave inglese sulla grata») non si offrono:
    sarebbe dare la soluzione. Si compongono, una cosa e poi l'altra.

Uso:  python interfaccia.py      (esce con 1 se una prova fallisce)
"""
import importlib.util
import json
import os
import sys

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
sys.path.insert(0, os.path.join(RADICE, "motore"))
sys.path.insert(0, QUI)

import percorsi  # noqa: E402

PONTE = os.path.join(RADICE, "app", "src", "lib", "ponte.py")
GIOCO = os.path.join(RADICE, "prototipo", "il-viaggiatore.fav")
_n = [0]


def nuovo_ponte():
    _n[0] += 1
    spec = importlib.util.spec_from_file_location(f"ponte_i{_n[0]}", PONTE)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.fav_boot(GIOCO)
    return mod


def passi(p, comandi):
    for c in comandi:
        json.loads(p.fav_step(c))


esiti = []


def prova(nome, ok, dettaglio=""):
    esiti.append(ok)
    print(f"{'OK ' if ok else 'KO '}{nome}" + (f"  → {dettaglio}" if dettaglio and not ok else ""))


def contatori(p):
    return dict(p._mondo.variabili)


# ---------------------------------------------------------------------------
# 1. parole sole
# ---------------------------------------------------------------------------
p = nuovo_ponte()
p._mondo.variabili.update(fame=9, cibo=2)
r = json.loads(p.fav_step("mangia"))
prova("«mangia» solo mangia una porzione", contatori(p)["cibo"] == 1 and contatori(p)["fame"] == 6, r["text"][:80])
prova("nella sequenza salvata entra il comando vero", p._registro[-1] == "mangia qualcosa", str(p._registro))
p._mondo.variabili.update(sete=8, acqua=3)
json.loads(p.fav_step("bere"))
prova("«bere» solo beve un sorso", contatori(p)["acqua"] == 2 and contatori(p)["sete"] < 8 + 1)
r = json.loads(p.fav_step("mangia il biglietto"))
prova("«mangia il biglietto» non tocca il cibo", "Non si mangia" in r["text"] and contatori(p)["cibo"] == 1, r["text"][:80])
# la sequenza salvata si rigioca uguale
s = json.loads(p.fav_salva())
q = nuovo_ponte()
q._mondo.variabili.update(fame=9, cibo=2, sete=8, acqua=3)
# (le scorte di partenza cambiate a mano non stanno nella sequenza: qui si prova solo che il comando
#  registrato sia uno di quelli che il motore capisce)
r = json.loads(q.fav_step(s["comandi"][0]))
prova("il comando registrato dal ponte è capito dal motore", "Mastichi piano" in r["text"], r["text"][:80])

# ---------------------------------------------------------------------------
# 2. l'anteprima non tocca il mondo e dice la verità
# ---------------------------------------------------------------------------
p = nuovo_ponte()
passi(p, ["nord", "nord", "prendi orologio", "sud", "est", "parla con Nunzio"])
prima = p.fav_impronta_stato()
a = json.loads(p.fav_anteprima("1"))
prova("anteprima: il baratto dell'orologio", a["delta"] == {"acqua": 3} and [o["id"] for o in a["perde"]] == ["orologio"], str(a["delta"]))
a2 = json.loads(p.fav_anteprima("2"))
prova("anteprima: «Hai qualcosa da mangiare?» costa 1 d'acqua e dà 2 di cibo", a2["delta"] == {"acqua": -1, "cibo": 2}, str(a2["delta"]))
prova("le anteprime non cambiano il mondo (impronta uguale)", p.fav_impronta_stato() == prima)
prova("nemmeno l'inventario", "L'orologio" in json.loads(p.fav_stato())["inventory"])
a3 = json.loads(nuovo_ponte().fav_anteprima("blablabla"))
prova("un comando non capito lo dice (capito=False)", a3["ok"] and not a3["capito"], str(a3)[:100])
a3 = json.loads(p.fav_anteprima("blablabla"))
prova("in dialogo una risposta che non c'è non cambia niente", a3["ok"] and not a3["delta"] and not a3["perde"], str(a3)[:100])

# la stessa scelta, fatta davvero, dà lo stesso conto (le scelte di dialogo non fanno passare turni)
def conto(mondo):
    return dict(mondo.variabili), set(mondo.inventario)

v0, i0 = conto(p._mondo)
json.loads(p.fav_step("1"))
v1, i1 = conto(p._mondo)
reale = {k: v1[k] - v0.get(k, 0) for k in v1 if isinstance(v1[k], int) and v1[k] != v0.get(k, 0)}
prova("fatto davvero, il baratto cambia esattamente ciò che l'anteprima diceva",
      reale == a["delta"] and (i0 - i1) == {"orologio"}, f"{reale} vs {a['delta']}")

# cose che costano fuori dai dialoghi
p = nuovo_ponte()
p._mondo.variabili["vita"] = 5
p._mondo.inventario.add("medicine")
p._mondo.oggetti["medicine"].posizione = "inventario"
a = json.loads(p.fav_anteprima("curati"))
prova("anteprima: «curati» consuma le medicine e dà 3 di vita", a["delta"] == {"vita": 3} and [o["id"] for o in a["perde"]] == ["medicine"], str(a))
a = json.loads(p.fav_anteprima("lascia medicine"))
prova("«lascia» non è perdere: la cosa resta nel luogo", a["perde"] == [], str(a["perde"]))
p = nuovo_ponte()
p._mondo.posizione_giocatore = "fondale"
a = json.loads(p.fav_anteprima("bevi salmastra"))
prova("anteprima: l'acqua salmastra fa male (vita in meno)", a["delta"].get("vita", 0) < 0, str(a["delta"]))

# ---------------------------------------------------------------------------
# 3. le azioni di contesto
# ---------------------------------------------------------------------------
def azioni(p):
    return json.loads(p.fav_azioni())


p = nuovo_ponte()
az = azioni(p)
prova("alla stazione non c'è ATTINGI né GETTA né ATTACCA",
      not ({"attingi", "getta cibo", "getta", "curati"} & set(az["soli"])) and az["bersagli"] == [], str(az))
p._mondo.posizione_giocatore = "pozzo"
prova("al pozzo, prima della fiducia di Saverio, niente ATTINGI (direbbe «Giù le mani»)",
      "attingi" not in azioni(p)["soli"], str(azioni(p)))
p._mondo.variabili["fiducia di saverio"] = 3
prova("al pozzo, con la fiducia di Saverio, c'è ATTINGI", "attingi" in azioni(p)["soli"], str(azioni(p)))
p._mondo.variabili["stato del pozzo"] = "vuoto"
p._mondo.variabili["acqua"] = 8
prova("al pozzo vuoto, con la tanica piena, ATTINGI sparisce (solo fango)", "attingi" not in azioni(p)["soli"], str(azioni(p)))
p._mondo.variabili["acqua"] = 1
prova("al pozzo vuoto, a secco, ATTINGI torna (il fondo dà ancora un poco)", "attingi" in azioni(p)["soli"], str(azioni(p)))
p._mondo.posizione_giocatore = "sorgente"
prova("alla sorgente c'è ATTINGI", "attingi" in azioni(p)["soli"], str(azioni(p)))
p = nuovo_ponte()
p._mondo.posizione_giocatore = "serra"
az = azioni(p)
prova("alla serra, col cane minaccioso: GETTA CIBO e ATTACCA il cane",
      "getta cibo" in az["soli"] and {"verbo": "attacca", "id": "cane", "nome": "Il cane"} in az["bersagli"], str(az))
p._mondo.variabili["stato del cane"] = "sviato"
az = azioni(p)
prova("a cane sviato non c'è più né GETTA CIBO né ATTACCA il cane",
      "getta cibo" not in az["soli"] and not [b for b in az["bersagli"] if b["id"] == "cane"], str(az))
p = nuovo_ponte()
p._mondo.inventario.add("medicine")
prova("con le medicine e in forze, niente CURATI", "curati" not in azioni(p)["soli"])
p._mondo.variabili["vita"] = 6
prova("con le medicine e ferito c'è CURATI", "curati" in azioni(p)["soli"])
p = nuovo_ponte()
p._mondo.posizione_giocatore = "casello"
az = azioni(p)
prova("al casello c'è ATTACCA Vito (a mani nude)", any(b["verbo"] == "attacca" and b["id"] == "vito" for b in az["bersagli"]), str(az))
p._mondo.variabili["vita di vito"] = 0
prova("a Vito a terra, ATTACCA sparisce", not [b for b in azioni(p)["bersagli"] if b["id"] == "vito"], str(azioni(p)))
p = nuovo_ponte()
p._mondo.posizione_giocatore = "casello"
prendi_a_mano = lambda p, *ids: [(p._mondo.inventario.add(i), setattr(p._mondo.oggetti[i], "posizione", "inventario")) for i in ids]
prendi_a_mano(p, "pistola")
prova("con la pistola, alla sbarra chiusa, c'è MINACCIA Vito",
      any(b["verbo"] == "minaccia" and b["id"] == "vito" for b in azioni(p)["bersagli"]), str(azioni(p)))
p._mondo.variabili["stato del casello"] = "aperto"
prova("a sbarra alzata MINACCIA Vito sparisce (direbbe «La sbarra è già su»)",
      not [b for b in azioni(p)["bersagli"] if b["verbo"] == "minaccia"], str(azioni(p)))
# al guado col fucile: «attacca», «spara», «usa il fucile su» fanno la stessa cosa a Cosimo
# (si offre un gesto solo, «attacca»; «usa il fucile su Cosimo» si scrive o si compone)
p = nuovo_ponte()
p._mondo.posizione_giocatore = "guado"
prendi_a_mano(p, "fucile")
az = azioni(p)
prova("al guado col fucile un gesto solo contro Cosimo (attacca)",
      [b["verbo"] for b in az["bersagli"] if b["id"] == "cosimo"] == ["attacca"], str(az))
for cmd in ["spara a Cosimo", "usa il fucile su Cosimo", "uccidi Cosimo", "colpisci Cosimo"]:
    a = json.loads(p.fav_anteprima(cmd))
    prova(f"«{cmd}» fa quello che fa «attacca Cosimo»",
          {s["nome"]: s["dopo"] for s in a["stati"]}.get("stato di cosimo") == "abbattuto", str(a.get("stati")))
# la foto della casa si raddrizza (una volta)
p = nuovo_ponte()
p._mondo.posizione_giocatore = "casa"
prova("nella casa c'è RADDRIZZA la foto", any(b["verbo"] == "raddrizza" for b in azioni(p)["bersagli"]), str(azioni(p)))
passi(p, ["raddrizza la foto"])
prova("raddrizzata, il gesto sparisce", not [b for b in azioni(p)["bersagli"] if b["verbo"] == "raddrizza"], str(azioni(p)))
p = nuovo_ponte()
p._mondo.posizione_giocatore = "fondale"
prova("al fondale c'è «bevi salmastra»", "bevi salmastra" in azioni(p)["soli"], str(azioni(p)))
# le combinazioni di due cose NON si offrono (sarebbe la soluzione): l'interfaccia le fa
# comporre. Il ponte non le elenca, e ogni coppia composta è capita dal motore.
def prendi_a_mano(p, *ids):
    for i in ids:
        p._mondo.inventario.add(i)
        p._mondo.oggetti[i].posizione = "inventario"


p = nuovo_ponte()
p._mondo.posizione_giocatore = "area di servizio"
passi(p, ["prendi chiave inglese"])
prova("le azioni non elencano combinazioni di due cose, nemmeno con la chiave inglese davanti alla grata",
      "coppie" not in azioni(p), str(azioni(p)))
r = json.loads(p.fav_step("usa chiave inglese su grata"))
prova("…ma «usa chiave inglese su grata», composta a pezzi, è capita e apre la grata",
      p._mondo.variabili.get("stato della grata") == "aperta", r["text"][:90])
p = nuovo_ponte()
p._mondo.posizione_giocatore = "diga"
prendi_a_mano(p, "pastiglie", "filtro")
a = json.loads(p.fav_anteprima("usa pastiglie su pompa"))
prova("anteprima: «usa pastiglie su pompa» dà 8 d'acqua e consuma pastiglie e filtro",
      a["delta"].get("acqua") == 8 and {o["id"] for o in a["perde"]} == {"pastiglie", "filtro"}, str(a["delta"]))
a = json.loads(p.fav_anteprima("usa filtro su pastiglie"))
prova("una coppia sbagliata riceve la risposta del motore, senza finzioni e senza guasti",
      a["ok"] and "non ha alcun effetto particolare" in a["testo"] and not a["delta"] and not a["perde"], str(a))

# le azioni non consumano il caso: la partita resta identica
p = nuovo_ponte()
passi(p, ["nord", "nord"])
caso = p._mondo.rng.getstate()
azioni(p); azioni(p)
prova("chiedere le azioni non consuma il caso", p._mondo.rng.getstate() == caso)

# ---------------------------------------------------------------------------
# 4. lo stato per l'interfaccia
# ---------------------------------------------------------------------------
p = nuovo_ponte()
st = json.loads(p.fav_stato())
prova("stato: nessuna mossa da annullare all'inizio", st["undo"] == 0 and st["conferma"] is None, str(st.get("undo")))
passi(p, ["nord"])
prova("stato: dopo una mossa se ne può annullare una", json.loads(p.fav_stato())["undo"] == 1)
passi(p, ["esci"])
prova("stato: «esci» lascia una domanda (sì/no) in attesa", json.loads(p.fav_stato())["conferma"] == "esci")
passi(p, ["no"])
prova("stato: «no» la toglie", json.loads(p.fav_stato())["conferma"] is None)
# la bisaccia sta sempre nello stesso ordine (l'inventario del motore è un insieme)
ordini = set()
for _ in range(4):
    p = nuovo_ponte()
    passi(p, ["nord", "nord", "prendi mappa", "prendi orologio", "prendi coltello"])
    ordini.add(tuple(json.loads(p.fav_stato())["inventory"]))
prova("l'ordine della bisaccia è quello della storia", ordini == {("La tanica", "Il biglietto", "La mappa", "L'orologio", "Il coltello")}, str(ordini))

# ---------------------------------------------------------------------------
# l'anteprima applica i tetti di fine turno: la tanica tiene dieci litri (venti con la damigiana)
# ---------------------------------------------------------------------------
def al_mercato(acqua, cose=("anello",)):
    q = nuovo_ponte()
    q._mondo.posizione_giocatore = "mercato"
    for i in cose:
        q._mondo.inventario.add(i)
        q._mondo.oggetti[i].posizione = "inventario"
    q._mondo.variabili["acqua"] = acqua
    q.fav_step("parla con Ciro")
    return q


q = al_mercato(9)
a = json.loads(q.fav_anteprima("anello"))
prova("anteprima: l'anello a 9 d'acqua ne dà 4, ma la tanica ne tiene 10: ne entra 1 e 3 si perdono",
      a["delta"]["acqua"] == 4 and a["dopo"]["acqua"] == 10 and a["sprecato"] == {"acqua": 3}, str(a["sprecato"]))
vera = contatori(q)["acqua"]
prova("…e l'anteprima non ha toccato il mondo (l'acqua è ancora 9)", vera == 9, str(vera))
json.loads(q.fav_step("anello"))
json.loads(q.fav_step("Va bene così"))
json.loads(q.fav_step("aspetta"))
prova("…fatto davvero, la tanica finisce a 10: l'anteprima diceva il vero", contatori(q)["acqua"] == 10, str(contatori(q)["acqua"]))
a = json.loads(al_mercato(5).fav_anteprima("anello"))
prova("anteprima: a 5 d'acqua il baratto entra tutto, niente va perso", a["sprecato"] == {} and a["dopo"]["acqua"] == 9, str(a["sprecato"]))
a = json.loads(al_mercato(10, ("anello", "damigiana")).fav_anteprima("anello"))
prova("anteprima: con la damigiana il tetto è venti, niente va perso", a["sprecato"] == {} and a["dopo"]["acqua"] == 14, str(a))
q = nuovo_ponte()
q._mondo.variabili.update(sete=2, acqua=3)
a = json.loads(q.fav_anteprima("bevi due sorsi"))
prova("anteprima: il pavimento della sete a zero vale, e non è uno spreco d'acqua", a["dopo"]["sete"] == 0 and a["sprecato"] == {}, str(a))

print("TUTTO OK" if all(esiti) else "CI SONO FALLIMENTI")
sys.exit(0 if all(esiti) else 1)
