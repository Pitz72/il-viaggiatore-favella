"""Le scelte che costano chiedono conferma: quali sì, quali no.

Passa in rassegna ogni risposta di dialogo del gioco (tutte, non solo quelle che
un percorso incontra) e i comandi che consumano cose o alzano le mani; per
ciascuno chiede al ponte l'anteprima (ciò che il motore farebbe) e fa decidere
alla logica vera dell'interfaccia (app/src/gioco/azioni.ts, eseguita con Node)
se serve una conferma. Poi confronta con ciò che ci si aspetta:

  · baratti, doni, pagamenti: conferma, con il conto di ciò che si dà e si riceve;
  · le svolte della storia (Peppe, il lascito di Onofrio) e la violenza: conferma;
  · parlare, chiedere, rispondere senza spendere niente: mai.

Uso:  python conferme.py      (esce con 1 se una prova fallisce)
"""
import copy
import importlib.util
import json
import os
import subprocess
import sys

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
sys.path.insert(0, os.path.join(RADICE, "motore"))

PONTE = os.path.join(RADICE, "app", "src", "lib", "ponte.py")
GIOCO = os.path.join(RADICE, "prototipo", "il-viaggiatore.fav")
NODE = os.path.join(RADICE, "app", "scripts", "valuta-conferme.mjs")


def nuovo_ponte():
    spec = importlib.util.spec_from_file_location("ponte_conferme", PONTE)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.fav_boot(GIOCO)
    return mod


def mondo_visto(p):
    """Ciò che l'interfaccia sa del mondo mentre decide (StatoMondo, per quel che serve)."""
    return json.loads(p.fav_stato())


# ---------------------------------------------------------------------------
# 1. tutte le risposte di dialogo
# ---------------------------------------------------------------------------
p = nuovo_ponte()
base = p._mondo
proprietari = {}                                    # nodo → personaggio (dal nodo d'ingresso, in profondità)
for npc in (o for o in base.oggetti.values() if o.is_personaggio and o.dialogo_iniziale):
    da_vedere = [npc.dialogo_iniziale]
    while da_vedere:
        n = da_vedere.pop()
        if n in proprietari or n not in base.dialogo_nodi:
            continue
        proprietari[n] = npc.nome
        da_vedere += [o.destinazione for o in base.dialogo_nodi[n].opzioni if o.destinazione]

scenari, etichette = [], []
for nid, nodo in base.dialogo_nodi.items():
    for k, opz in enumerate(nodo.opzioni):
        if not opz.conseguenze:
            continue
        c0 = p._copia_del_mondo()
        c0.variabili.update(acqua=5, cibo=5)
        # ciò che l'opzione toglie dalla bisaccia dev'esserci, perché il conto sia vero
        for cons in opz.conseguenze:
            i = getattr(cons, "id_oggetto", None)
            if i in c0.oggetti and not c0.oggetti[i].is_personaggio and getattr(cons, "destinazione", None) == "nulla":
                c0.inventario.add(i)
                c0.oggetti[i].posizione = "inventario"
        nodo0 = c0.dialogo_nodi[nid]
        opz0 = nodo0.opzioni[k]
        opz0.condizione = None
        nodo0.opzioni = [opz0]                       # l'unica: è la «1»
        c0.dialogo_attivo = proprietari.get(nid, "nunzio")
        c0.nodo_dialogo = nid
        c1 = copy.deepcopy(c0)
        c1.cattura_stato = lambda: None
        antep = p._anteprima_di(c0, c1, "1")
        p._mondo, tenuto = c0, p._mondo                # fav_stato legge il mondo vero: lo si presta un attimo
        try:
            stato = mondo_visto(p)
        finally:
            p._mondo = tenuto
        scenari.append({"cmd": "1", "anteprima": antep, "mondo": stato})
        etichette.append(f"{proprietari.get(nid, '?'):9s} {opz.testo}")

# ---------------------------------------------------------------------------
# 2. comandi fuori dai dialoghi
# ---------------------------------------------------------------------------
def scena(luogo, cmd, cose=(), **variabili):
    q = nuovo_ponte()
    q._mondo.posizione_giocatore = luogo
    for i in cose:
        q._mondo.inventario.add(i)
        q._mondo.oggetti[i].posizione = "inventario"
    q._mondo.variabili.update(variabili)
    scenari.append({"cmd": cmd, "anteprima": json.loads(q.fav_anteprima(cmd)), "mondo": mondo_visto(q)})
    etichette.append(f"comando   {cmd}   [{luogo}]")


scena("serra", "getta cibo")
scena("serra", "attacca cane")
scena("serra", "attacca cane", cose=["coltello"])
scena("casello", "attacca vito")
scena("casello", "minaccia vito", cose=["pistola"])
scena("casello", "minaccia vito")
scena("guado", "attacca cosimo", cose=["fucile"])
scena("guado", "usa lettera su cosimo", cose=["lettera"])
scena("guado", "usa biglietto su cosimo")
scena("diga", "usa pastiglie su pompa", cose=["pastiglie", "filtro", "damigiana"])
scena("vicolo", "usa medicine su pasquale", cose=["medicine"], **{"stato di pasquale": "malato"})
scena("piazza", "curati", cose=["medicine"], vita=5)
scena("fondale", "bevi salmastra")
scena("stazione", "esamina biglietto")
scena("stazione", "lascia biglietto")
scena("stazione", "aspetta")

# ---------------------------------------------------------------------------
# 3. la logica dell'interfaccia decide
# ---------------------------------------------------------------------------
proc = subprocess.run(["node", NODE], input=json.dumps(scenari), capture_output=True, text=True, encoding="utf-8")
if proc.returncode != 0:
    print(proc.stderr)
    sys.exit(2)
esiti = json.loads(proc.stdout)

print(f"{'':9s} {'risposta o comando':62s} conferma")
for e, r in zip(etichette, esiti):
    c = r["conferma"]
    if c:
        conto = f"dai {c['perdi']} → ricevi {c['ottieni']}" + (f" · pesa {c['pesa']}" if c["pesa"] else "")
        print(f"{e[:74]:74s} {c['tipo']:9s} {conto}")
    else:
        print(f"{e[:74]:74s} —")

# ---------------------------------------------------------------------------
# 4. ciò che ci si aspetta
# ---------------------------------------------------------------------------
per_testo = {}
for e, r in zip(etichette, esiti):
    per_testo.setdefault(e.split(None, 1)[1].strip() if not e.startswith("comando") else e.split("   ")[1], []).append(r["conferma"])

ATTESI = {
    # baratti: conferma con il conto
    "Ti do l'orologio per dell'acqua.": "scambio",
    "Hai qualcosa da mangiare?": "scambio",
    "Vendo l'anello.": "scambio",
    "Ti do i cristalli di sale per del cibo.": "scambio",
    "Ti do un po' d'acqua per del formaggio.": "scambio",
    # doni e pagamenti
    "Ti lascio del cibo. Ne hai più bisogno tu di me.": "perdita",
    "Ti lascio dell'acqua, ne hai bisogno anche tu.": "perdita",
    "Ti lascio dell'acqua, per l'ospitalità.": "perdita",
    "Ti lascio tre d'acqua.": "perdita",
    "Ti do la stecca di sigarette.": ("scambio", "perdita"),
    # svolte
    "Vieni con me, allora.": "svolta",
    "Dammi il fucile.": "svolta",
    "Dammi la lettera.": "svolta",
    # niente da confermare
    "Posso lavorare, per un po' d'acqua?": None,
    "Ti mostro questo santino.": None,
    "Scrivile, allora.": None,
    "esamina biglietto": None,
    "lascia biglietto": None,
    "aspetta": None,
    # fuori dai dialoghi
    "attacca cane": "violenza",
    "attacca vito": "violenza",
    "minaccia vito": ("violenza", None),      # a mani vuote il gioco lo sconsiglia e non cambia niente
    "attacca cosimo": "violenza",
    "usa pastiglie su pompa": "scambio",
    "curati": "scambio",
    "bevi salmastra": "danno",
    "usa lettera su cosimo": None,
}
ok_tutto = True
for testo, atteso in ATTESI.items():
    trovati = [t for k, t in per_testo.items() if k.startswith(testo)]
    if not trovati:
        print(f"KO manca nella rassegna: {testo}")
        ok_tutto = False
        continue
    tipi = {(c["tipo"] if c else None) for lista in trovati for c in lista}
    giusti = set(atteso) if isinstance(atteso, tuple) else {atteso}
    if not tipi <= giusti:
        print(f"KO «{testo}»: atteso {atteso}, trovato {tipi}")
        ok_tutto = False

# il conto dello scambio dell'orologio dice le cose giuste
orologio = next(r["conferma"] for e, r in zip(etichette, esiti) if e.endswith("Ti do l'orologio per dell'acqua.") and e.startswith("nunzio"))
if orologio["perdi"] != ["L'orologio"] or orologio["ottieni"] != ["3 d'acqua"]:
    print("KO il conto dell'orologio:", orologio)
    ok_tutto = False
# «Ti lascio tre d'acqua.»: tre d'acqua, e basta
vito = next(r["conferma"] for e, r in zip(etichette, esiti) if e.endswith("Ti lascio tre d'acqua."))
if vito["perdi"] != ["3 d'acqua"]:
    print("KO il conto del pedaggio di Vito:", vito)
    ok_tutto = False
# nessuna risposta di dialogo che non costa (solo parole) chiede conferma
for e, r in zip(etichette, esiti):
    if r["conferma"] and not e.startswith("comando") and r["conferma"]["tipo"] not in ("scambio", "perdita", "svolta"):
        print("KO tipo inatteso:", e, r["conferma"]["tipo"])
        ok_tutto = False

print(f"{len(scenari)} scelte passate in rassegna: " + ("TUTTO OK" if ok_tutto else "CI SONO FALLIMENTI"))
sys.exit(0 if ok_tutto else 1)
