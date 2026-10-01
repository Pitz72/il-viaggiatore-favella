"""Le partite giocate a mano (1.6.0): quello che hanno trovato, perché non torni.

Tre partite intere, giocate leggendo il testo come un giocatore: una attenta, una
violenta (il cane, Vito, il fucile posato con la veglia), una di chi beve e mangia
solo quando il corpo fa male. Hanno trovato cose che i collaudi non vedevano:

  · l'equilibrio: chi risponde agli avvisi non è mai in pericolo; chi aspetta il
    dolore perde una tacca di vita a ogni crisi; le ferite non guarivano quasi mai
    (la ripresa chiedeva sete e fame al massimo 3, cioè mangiare prima della fame);
  · la porta del paese non si ritrovava più dalla piazzetta (il mercato le aveva
    preso l'uscita);
  · il cane mordeva prima che si potesse fare qualunque cosa;
  · al guado «spara a Cosimo», «uccidi Cosimo», «usa il fucile su Cosimo» non
    venivano capiti, e «minaccia Cosimo» rispondeva «Nessuno qui ti ha fatto niente»;
  · Peppe beveva dalla tua tanica nel mezzo della scena del guado;
  · chi tornava a parlare con Cosimo, Tore, Onofrio, Rosaria, Ciro, Nunzio si
    sentiva ripetere il benvenuto intero (Cosimo l'accusa, subito dopo la verità);
  · e minuzie: la pompa che fa bere senza dissetare, «l'uomo» del pozzo che non
    risponde, la foto storta da raddrizzare che non si poteva toccare, sete -1 e
    vita 11 a fine turno.

Uso:  python giocate.py      (esce con 1 se una prova fallisce)
"""
import sys

import percorsi
from finali import pilota
from partita import Partita

esiti = []


def prova(nome, ok, dettaglio=""):
    esiti.append(ok)
    print(f"{'OK ' if ok else 'KO '}{nome}" + (f"  → {dettaglio}" if dettaglio and not ok else ""))


def partita(luogo, cose=(), seme=1, **contatori):
    p = Partita(seme=seme)
    p.m.posizione_giocatore = luogo
    for c in cose:
        p.m.inventario.add(c)
        p.m.oggetti[c].posizione = "inventario"
    p.m.variabili.update(contatori)
    return p


def fai(p, *comandi):
    return "".join(p.esegui(c) for c in comandi)


# ---------------------------------------------------------------------------
# 1. l'equilibrio di sete, fame e vita (dodici semi per ogni modo di giocare)
# ---------------------------------------------------------------------------
SEMI = range(12)


def gioca(nome, soglia_sete, soglia_fame, seme):
    """Il pilota di finali.py, con un seme diverso: beve e mangia alle soglie date."""
    import finali
    vecchio = finali.Partita
    finali.Partita = lambda seme=None, _seme=seme: Partita(seme=_seme)
    try:
        p, vita_min = pilota(percorsi.comandi(nome), soglia_sete=soglia_sete, soglia_fame=soglia_fame)
    finally:
        finali.Partita = vecchio
    return p, vita_min


def riassunto(nome, ss, sf):
    partite = [gioca(nome, ss, sf, s) for s in SEMI]
    vinte = sum(1 for p, _ in partite if not p.in_corso and p.m.stato_partita in ("vinta", "terminata"))
    minimo = min(v for _, v in partite)
    riprese = sum(p.trascrizione().count("Ti senti un poco più in forze") for p, _ in partite)
    return vinte, minimo, riprese, partite


vinte, minimo, riprese, _ = riassunto("B_cavallo", 6, 7)
prova(f"chi beve e mangia agli avvisi (sete 6, fame 7) arriva sempre, mai sotto 8 di vita ({vinte}/12, minimo {minimo})",
      vinte == 12 and minimo >= 8)
vinte, minimo, riprese, _ = riassunto("B_cavallo", 8, 10)
prova(f"chi aspetta un poco oltre gli avvisi (sete 8, fame 10) arriva sempre ({vinte}/12, minimo {minimo})", vinte == 12)
vinte, minimo, riprese, partite = riassunto("H_veglia", 6, 7)
finali_vita = [p.v("vita") for p, _ in partite]
prova(f"col sangue del cane le forze tornano camminando ({riprese} riprese in 12 partite, vita finale "
      f"{min(finali_vita)}–{max(finali_vita)})", vinte == 12 and riprese >= 12 and min(finali_vita) >= 8)

# ---------------------------------------------------------------------------
# 2. il paese: la porta si ritrova
# ---------------------------------------------------------------------------
p = partita("porta")
t = fai(p, "ovest", "est")
prova("dalla piazzetta, a est, si torna alla porta", p.m.posizione_giocatore == "porta", t[-120:])
p = partita("piazzetta")
fai(p, "sud")
prova("il mercato è a sud della piazzetta, e da lì si risale a nord", p.m.posizione_giocatore == "mercato"
      and (fai(p, "nord") or True) and p.m.posizione_giocatore == "piazzetta")

# ---------------------------------------------------------------------------
# 3. il cane avverte, la pompa disseta, l'uomo del pozzo risponde
# ---------------------------------------------------------------------------
p = partita("masseria")
t = fai(p, "sud")
prova("entrando nella serra il cane ringhia e non morde", "Un passo ancora, e morde" in t and "azzanna" not in t
      and p.v("vita") == 10, t[-160:])
t = fai(p, "esamina il cane")
prova("…al turno dopo morde", "azzanna" in t and p.v("vita") < 10, t[-120:])
fai(p, "nord")
t = fai(p, "sud")
prova("…e chi torna non è più avvertito", "Un passo ancora" not in t and "azzanna" in t, t[-120:])

p = partita("serra", cibo=2)
t = fai(p, "getta cibo")
prova("col cibo gettato le conserve si prendono, e il testo lo dice", "prendi le conserve" in t and p.v("cibo") == 4, t[-160:])

p = partita("diga", ["filtro", "pastiglie"], sete=7, acqua=1)
fai(p, "usa le pastiglie sulla pompa")
prova("alla pompa si beve davvero (sete 0)", p.v("sete") == 0 and p.v("acqua") == 9, f"sete {p.v('sete')} acqua {p.v('acqua')}")

p = partita("pozzo")
prova("«parla con l'uomo», al pozzo, è Saverio", "Cosa vuoi" in fai(p, "parla con l'uomo"))

p = partita("casa")
t = fai(p, "esamina la foto", "raddrizza la foto", "guarda", "prendi la foto")
prova("la foto storta si esamina, si raddrizza, resta dritta e non si porta via",
      "fontana della piazza" in t and "soltanto chiusa" in t and "adesso dritta" in t and "Ti viene da raddrizzarla" not in t.split("adesso dritta")[1]
      and "al suo chiodo" in t, t[-200:])

# ---------------------------------------------------------------------------
# 4. i tetti e i pavimenti valgono nello stesso turno
# ---------------------------------------------------------------------------
p = partita("piazzetta", sete=2, fame=2, vita=9)
fai(p, "nord")
prova("dopo l'accoglienza di Rosaria: sete e fame a 0, vita al massimo 10, già in questo turno",
      p.v("sete") == 0 and p.v("fame") == 0 and p.v("vita") == 10, f"{p.v('sete')} {p.v('fame')} {p.v('vita')}")
p = partita("tratto", sete=9)
t = fai(p, "aspetta")
prova("la sete che fa male dice anche che cosa fare (BEVI.)", "La testa martella, le mani tremano. (BEVI.)" in t, t[-120:])

# ---------------------------------------------------------------------------
# 5. il guado: le parole della violenza, e Peppe che non beve in mezzo alla scena
# ---------------------------------------------------------------------------
for cmd in ["spara a Cosimo", "uccidi Cosimo", "colpisci Cosimo", "ammazza Cosimo", "usa il fucile su Cosimo"]:
    p = partita("guado", ["fucile"])
    t = fai(p, cmd)
    prova(f"«{cmd}», col fucile, fa quello che fa «attacca Cosimo»", p.v("stato di cosimo") == "abbattuto", t[-120:])
p = partita("guado", ["fucile"])
t = fai(p, "minaccia Cosimo")
prova("«minaccia Cosimo» col fucile: o spari o lo posi", "O spari, o lo posi" in t and p.v("stato di cosimo") == "fermo", t[-120:])
p = partita("guado", ["fucile", "pistola"])
fai(p, "lascia il fucile", "aspetta")
t = fai(p, "minaccia Cosimo")
prova("durante la veglia, minacciarlo con la pistola la rompe", "Scarica" in t and p.v("stato della veglia") == "spenta", t[-120:])
p = partita("guado")
t = fai(p, "minaccia Cosimo")
prova("a mani vuote la minaccia è sua, non «Nessuno qui ti ha fatto niente»",
      "Le stesse parole le dicevo io" in t and "Nessuno qui" not in t, t[-120:])
p = partita("guado", ["fucile"])
t = fai(p, "lascia il fucile", "usa il fucile su Cosimo")
prova("col fucile per terra «usa il fucile su Cosimo» dice di riprenderlo", "PRENDI IL FUCILE" in t, t[-120:])
p = partita("guado", ["lettera"])
prova("«parla con il fratello» è Cosimo", "Lo sapevo, che saresti tornato" in fai(p, "parla con il fratello"))

peppe_beve = 0
for seme in SEMI:
    p = partita("guado", ["lettera"], seme=seme, acqua=10, cibo=5, **{"stato di peppe": "compagno"})
    t = fai(p, *["aspetta"] * 10, "usa la lettera su Cosimo", "nord", *["aspetta"] * 10)
    peppe_beve += t.count("Peppe beve un sorso") + t.count("Dividi un boccone")
prova("al guado e sulla strada Peppe non divide le scorte (240 turni)", peppe_beve == 0, str(peppe_beve))

# ---------------------------------------------------------------------------
# 6. chi torna a parlare non si sente ripetere il benvenuto
# ---------------------------------------------------------------------------
p = partita("guado")
t = fai(p, "parla con Cosimo", "Non sapevo", "…")
prova("Cosimo, dopo la verità, non ripete l'accusa", t.count("Lo sapevo, che saresti tornato") == 1
      and "Hai altro da dirmi" in t, t[-200:])
p = partita("pianoro", acqua=6)
t = fai(p, "parla con Tore", "formaggio", "…")
prova("Tore, dopo il baratto, ricomincia a contare", t.count("Quassù non sale più nessuno") == 1 and "Che altro?" in t, t[-160:])
p = partita("grotta")
t = fai(p, "parla con Onofrio", "Cosa è successo", "…")
prova("Onofrio non ti riconosce due volte", t.count("io ti conosco") == 1 and "finché ho voglia di rispondere" in t, t[-160:])
p = partita("osteria")
t = fai(p, "parla con Rosaria", "Cosa si dice", "…")
prova("Rosaria non ti fa sedere due volte", t.count("bianco di polvere") == 1 and "Parla pure" in t, t[-160:])
p = partita("osteria", sangue=1)
prova("Rosaria, col sangue, dà da bere ma non la fiducia", "La fiducia no" in fai(p, "parla con Rosaria"))
p = partita("mercato", acqua=6, cibo=0)
t = fai(p, "parla con Ciro", "tre d'acqua", "Altro")
prova("Ciro cambia l'acqua in cibo, e al ritorno taglia corto", p.v("acqua") == 3 and p.v("cibo") == 2
      and "anche il tempo è merce" in t, t[-160:])
p = partita("bar", ["orologio"])
t = fai(p, "parla con Nunzio", "orologio", "Torno")
prova("Nunzio, al ritorno al banco, non rifà il discorso", t.count("Acqua non ne ho da regalare") == 1 and "Altro?" in t, t[-160:])

# ---------------------------------------------------------------------------
# 7. il banco di gioco (strumenti/gioca.py) non si guasta in silenzio
# ---------------------------------------------------------------------------
import os  # noqa: E402
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "strumenti"))
import gioca  # noqa: E402

b = gioca.gioca_a_soglie(percorsi.comandi("B_cavallo"), 9, 11, 1)     # il pilota di finali.py gioca col seme 1
vecchio, vita_min_vecchio = pilota(percorsi.comandi("B_cavallo"), soglia_sete=9, soglia_fame=11)
prova("il banco (col ponte dell'app) e il pilota di finali.py, sullo stesso percorso, danno la stessa vita minima",
      gioca.misure(b)["vita_min"] == vita_min_vecchio and b.m.stato_partita == vecchio.m.stato_partita,
      f"{gioca.misure(b)['vita_min']} contro {vita_min_vecchio}")
scena = gioca.Banco().scena()
prova("la scena del banco ha uscite, presenze, bisaccia e azioni", all(x in scena for x in ("Uscite", "Presenze", "Bisaccia", "Azioni")), scena)

print("TUTTO OK" if all(esiti) else "CI SONO FALLIMENTI")
sys.exit(0 if all(esiti) else 1)
