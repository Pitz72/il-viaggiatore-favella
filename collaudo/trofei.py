"""I trofei alla prova (pre-produzione/09-opzioni-menu-pausa.md, §7 e §9).

Le partite le gioca il ponte vero dell'app (app/src/lib/ponte.py), come in
interfaccia.py e pulsanti.py, col pilota di finali.py (beve e mangia come un
giocatore attento): i dodici percorsi della storia, le tre morti, e due partite
corte al casello (il bluff con la pistola scarica, Vito lasciato a terra), che i
percorsi non fanno. I trofei li decidono le regole vere del gioco
(app/src/gioco/trofei.ts), eseguite in Node da app/scripts/trofei-node.mjs.

Che cosa si pretende:
  · ogni partita vince esattamente i trofei previsti, né uno di più né uno di meno;
  · nessun trofeo prima del suo momento: i finali, le fini, le sfide e «Mani pulite»
    all'ultimo turno; un gesto al turno del comando che lo compie;
  · ogni riga «FINALE —» e ogni «perdi» dei .fav ha il suo trofeo, e uno solo; ogni
    gesto del ponte ha il suo; ogni via del riconoscimento al guado ha il suo;
  · le sfide: tornare indietro (ANNULLA) toglie «Senza voltarti», un comando dato con
    un pulsante toglie «Tutto a parole», uno scritto toglie «Tutto a pulsanti»; in inglese,
    una strada nominata dal testo presa dalla rosa toglie «Parola per parola», e giocare in
    italiano anche (le partite scritte sono in italiano);
  · tutte le partite di fila, coi trofei che si accumulano: ogni trofeo è vinto da
    almeno una partita, «Tutte le strade» arriva col sesto finale diverso e «Il
    viaggiatore» con l'ultimo trofeo che mancava, una volta sola.

Uso:  python trofei.py      (esce con 1 se qualcosa non va; serve `npm ci` in app/)
"""
import importlib.util
import json
import os
import random
import re
import subprocess
import sys

# su Windows, con l'uscita in un file, la console non sa scrivere «→»: un fallimento si fermerebbe lì
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
sys.path.insert(0, os.path.join(RADICE, "motore"))
sys.path.insert(0, QUI)

import percorsi  # noqa: E402
from partita import finali_dichiarati  # noqa: E402

PONTE = os.path.join(RADICE, "app", "src", "lib", "ponte.py")
GIOCO = os.path.join(RADICE, "prototipo", "il-viaggiatore.fav")
REGOLE = os.path.join(RADICE, "app", "scripts", "trofei-node.mjs")
_n = [0]


def nuovo_ponte():
    _n[0] += 1
    spec = importlib.util.spec_from_file_location(f"ponte_t{_n[0]}", PONTE)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.fav_boot(GIOCO)
    mod._mondo.rng = random.Random(1)
    return mod


class Regole:
    """Le regole dei trofei in Node: una partita per domanda."""

    def __init__(self):
        self.proc = subprocess.Popen(["node", REGOLE], stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                     text=True, encoding="utf-8", cwd=RADICE)

    def chiedi(self, domanda):
        self.proc.stdin.write(json.dumps(domanda, ensure_ascii=False) + "\n")
        self.proc.stdin.flush()
        return json.loads(self.proc.stdout.readline())

    def chiudi(self):
        self.proc.stdin.close()
        self.proc.wait(timeout=10)


# le partite scritte sono in italiano: «Parola per parola», la sfida dell'inglese, vi cade
SCRITTE = dict(scritto=True, toccato=False, indietro=False, italiano=True, fuoriTesto=False)


def gioca(comandi, giro=None, limite=None, bevi=True, mangia=True, sfide=None):
    """Gioca col ponte, curando il corpo come finali.py; restituisce i turni [(comando, con chi si parla, turno)]."""
    p = nuovo_ponte()
    m = p._mondo
    sf = dict(id="collaudo", **(sfide or SCRITTE))
    turni = []
    chi = [None]

    def turno(cmd):
        if cmd.lower().startswith("parla con "):
            chi[0] = cmd[len("parla con "):].strip().lower()
        prima = len(p._registro)
        in_dialogo = m.dialogo_attivo
        r = json.loads(p.fav_step(cmd))
        if cmd == "annulla" and not in_dialogo and len(p._registro) < prima:
            sf["indietro"] = True
        st = json.loads(p.fav_stato())
        turni.append((cmd, chi[0], {"testo": r["text"], "esito": r["stato"], "counters": st["counters"],
                                    "voci": st.get("voci", []), "gesti": st.get("gesti", {}),
                                    "stati": st.get("stati", {}), "sfide": dict(sf)}))

    limite = limite or len(comandi)
    i = 0
    while m.stato_partita == "in_corso" and i < limite:
        if i < len(comandi):
            c = comandi[i]
        elif giro:
            c = giro[(i - len(comandi)) % len(giro)]
        else:
            break
        if not m.dialogo_attivo:
            v = m.variabili
            if bevi and v.get("sete", 0) >= 5 and v.get("acqua", 0) >= 1:
                turno("bevi")
            if mangia and v.get("fame", 0) >= 6 and v.get("cibo", 0) >= 1:
                turno("mangia qualcosa")
            if m.stato_partita != "in_corso":
                break
        turno(c)
        i += 1
    return turni


# ── le partite ───────────────────────────────────────────────────────────────
_FINO_SERRA = percorsi.Z1_Z4[:percorsi.Z1_Z4.index("getta cibo")]
_AL_CASELLO = percorsi.Z1_Z4[:percorsi.Z1_Z4.index("parla con Vito")]

PARTITE = {n: dict(comandi=percorsi.comandi(n)) for n in percorsi.PERCORSI}
# B_cavallo come la gioca pulsanti.py, coi soli pulsanti; C_fede mescolando; D_vuoto con un passo disfatto
PARTITE["B_cavallo"]["sfide"] = dict(scritto=False, toccato=True, indietro=False, italiano=True, fuoriTesto=False)
PARTITE["C_fede"]["sfide"] = dict(scritto=True, toccato=True, indietro=False, italiano=True, fuoriTesto=False)
# G_posato in inglese, coi pulsanti, prendendo dal testo ogni strada che il testo nomina (collaudo/traduzione.py prova che
# lungo i percorsi ogni strada nominata in italiano lo è anche in inglese, e che la parola porta a quell'uscita)
PARTITE["G_parola"] = dict(comandi=percorsi.comandi("G_posato"), sfide=dict(scritto=False, toccato=True, indietro=False, italiano=False, fuoriTesto=False))
# e in inglese, ma con una strada nominata presa dalla rosa dei venti: la sfida cade
PARTITE["H_rosa"] = dict(comandi=percorsi.comandi("H_veglia"), sfide=dict(scritto=False, toccato=True, indietro=False, italiano=False, fuoriTesto=True))
PARTITE["D_vuoto"]["comandi"] = ["nord", "annulla"] + percorsi.comandi("D_vuoto")
PARTITE.update({
    "sete": dict(comandi=[], giro=["nord", "sud"], bevi=False, limite=200),
    "fame": dict(comandi=percorsi.Z1_Z4, giro=["est", "ovest"], mangia=False, limite=400),
    "ferite": dict(comandi=_FINO_SERRA, giro=["esamina il cane"], limite=len(_FINO_SERRA) + 60),
    # al casello, invece di pagare: la pistola presa nella piazzola e puntata; oppure il coltello
    "bluff": dict(comandi=_AL_CASELLO + ["nord", "prendi pistola", "sud", "minaccia Vito"]),
    "a_terra": dict(comandi=_AL_CASELLO + ["attacca Vito"] * 4),
})

# I gesti dei primi due tratti, che quasi tutti i percorsi compiono
STRADA = {"senza-un-grazie", "qualcosa-del-tuo", "si-beve-non-si-ama", "affare-fatto"}
PAESE = {"la-febbre-rotta", "per-chi-passera-dopo"}
COLLINE = {"qualcosa-di-quella-casa"}
TUTTA = STRADA | PAESE | COLLINE
PULITE = {"mani-pulite"}
SCRITTA = {"senza-voltarti", "tutto-a-parole"}

ATTESI = {
    "A_peppe": TUTTA | PULITE | SCRITTA | {"qualcuno-lo-porti-via", "la-lettera"},
    "B_cavallo": TUTTA | PULITE | {"senza-voltarti", "tutto-a-pulsanti", "il-cavallo-di-legno", "la-lettera"},
    "C_fede": TUTTA | PULITE | {"senza-voltarti", "quello-che-era-suo", "la-lettera"},
    "D_vuoto": TUTTA | PULITE | {"tutto-a-parole", "le-mani-vuote", "la-lettera"},
    "E_fucile": TUTTA | SCRITTA | {"sopra-il-corpo"},
    "F_fucile_pep": TUTTA | SCRITTA | {"nessuno-da-chiamare"},
    "G_posato": TUTTA | PULITE | SCRITTA | {"il-cavallo-di-legno", "il-fucile-posato"},
    "G_parola": TUTTA | PULITE | {"senza-voltarti", "tutto-a-pulsanti", "parola-per-parola", "il-cavallo-di-legno", "il-fucile-posato"},
    "H_rosa": TUTTA | {"senza-voltarti", "tutto-a-pulsanti", "il-cavallo-di-legno", "chi-arrivava-di-la"},
    "H_veglia": TUTTA | SCRITTA | {"il-cavallo-di-legno", "chi-arrivava-di-la"},
    "I_imma": TUTTA | PULITE | SCRITTA | {"quello-che-era-suo", "la-lettera", "la-scarpa-allacciata", "quello-che-lasciava-l-acqua"},
    "J_imma_sangue": TUTTA | SCRITTA | {"il-cavallo-di-legno", "chi-arrivava-di-la", "la-scarpa-allacciata", "quello-che-lasciava-l-acqua"},
    "K_peppe_vero": TUTTA | SCRITTA | {"qualcuno-lo-porti-via", "la-lettera", "detto-il-vero"},
    "L_peppe_bugia": TUTTA | SCRITTA | {"nessuno-da-chiamare"},
    "sete": {"i-sassi-che-scottano"},
    "fame": STRADA | {"senza-la-forza"},
    "ferite": {"senza-un-grazie", "il-viaggio-finisce-qui"},
    "bluff": {"senza-un-grazie", "qualcosa-del-tuo", "si-beve-non-si-ama", "la-pistola-scarica"},
    "a_terra": {"senza-un-grazie", "qualcosa-del-tuo", "si-beve-non-si-ama", "contro-la-sbarra"},
}

# Il momento di ciascun trofeo: all'ultimo turno, oppure al turno di un comando (con chi si parla, se conta).
ALLA_FINE = {"mani-pulite", "senza-voltarti", "tutto-a-parole", "tutto-a-pulsanti", "parola-per-parola", "tutte-le-strade", "il-viaggiatore"}
MOMENTO = {
    "senza-un-grazie": lambda c, chi: chi == "saverio" and c == "cibo",
    "qualcosa-del-tuo": lambda c, chi: chi == "iole" and c == "dell'acqua",
    "si-beve-non-si-ama": lambda c, chi: c.startswith("usa le pastiglie"),
    "affare-fatto": lambda c, chi: chi == "vito" and c == "tre d'acqua",
    "la-pistola-scarica": lambda c, chi: c == "minaccia Vito",
    "contro-la-sbarra": lambda c, chi: c == "attacca Vito",
    "per-chi-passera-dopo": lambda c, chi: chi == "rosaria" and c == "dell'acqua",
    "qualcosa-di-quella-casa": lambda c, chi: chi == "onofrio" and c in ("cavallo", "santino"),
    "la-scarpa-allacciata": lambda c, chi: chi == "imma" and c == "tieni",
    "la-febbre-rotta": lambda c, chi: c.startswith("usa le medicine"),
    "la-lettera": lambda c, chi: c == "usa la lettera su Cosimo",
    "il-fucile-posato": lambda c, chi: c == "lascia il fucile",
    "chi-arrivava-di-la": lambda c, chi: c == "aspetta",
    "detto-il-vero": lambda c, chi: chi == "peppe" and c == "È vero",
    # la voce della generosità: entrando in osteria, quando Imma è già lì
    "quello-che-lasciava-l-acqua": lambda c, chi: c == "nord",
}

esiti = []


def prova(nome, ok, dettaglio=""):
    esiti.append(ok)
    print(f"{'OK ' if ok else 'KO '}{nome}" + (f"\n     → {dettaglio}" if dettaglio and not ok else ""))


def main():
    regole = Regole()
    try:
        cat = regole.chiedi({"catalogo": True})
        trofei = cat["trofei"]
        ids = [t["id"] for t in trofei]
        famiglie = {f["id"] for f in cat["famiglie"]}

        # ── il catalogo ─────────────────────────────────────────────────────
        solo_in = cat["solo_in"]
        prova("trentuno trofei (trenta per lingua: «Tutto a parole» in italiano, «Parola per parola» in inglese), id e nomi "
              "tutti diversi, ognuno in una famiglia che c'è",
              len(trofei) == 31 and len(set(ids)) == 31 and len({t["nome"] for t in trofei}) == 31
              and solo_in == {"tutto-a-parole": "it", "parola-per-parola": "en"}
              and all(t["famiglia"] in famiglie and t["accenno"] and t["frase"] and t["en"]["nome"] for t in trofei),
              f"{len(trofei)} trofei, {len(set(ids))} id, solo in {solo_in}")
        prova("ogni famiglia ha almeno un trofeo", famiglie == {t["famiglia"] for t in trofei})
        dichiarati = finali_dichiarati()
        finali = [msg for esito, msg in dichiarati if msg.startswith("FINALE")]
        fini = [msg for esito, msg in dichiarati if esito == "persa"]
        doppi = [f for f in finali if sum(fr in f for fr, _ in cat["finali"]) != 1]
        prova(f"ogni riga «FINALE —» dei .fav ({len(finali)}) ha un trofeo, e uno solo",
              len(finali) == 6 and not doppi and len({i for _, i in cat["finali"]}) == 6, str(doppi or finali))
        senza = [f for f in fini if sum(fr in f for fr, _ in cat["fini"]) != 1]
        prova(f"ogni «perdi» dei .fav ({len(set(fini))} diversi) ha un trofeo, e uno solo", not senza and len(set(fini)) == 3, str(senza))
        ponte = nuovo_ponte()
        gesti_ponte = {f"{chi}:{g}" for chi, g, _ in ponte._GESTI}
        prova("ogni gesto del ponte ha il suo trofeo, e nessun trofeo ha un gesto che non c'è",
              gesti_ponte == set(cat["gesti"]) and len(set(cat["gesti"].values())) == len(cat["gesti"]),
              f"{sorted(gesti_ponte ^ set(cat['gesti']))}")
        testo_fav = "".join(open(os.path.join(RADICE, "prototipo", f), encoding="utf-8").read()
                            for f in os.listdir(os.path.join(RADICE, "prototipo")) if f.endswith(".fav"))
        vie = set(re.findall(r"lo stato del riconoscimento è (\w+)", testo_fav))
        prova("le tre vie del riconoscimento al guado sono quelle della storia", vie == {"lettera", "fucile", "veglia"}, str(vie))

        # ── le partite, una per una ─────────────────────────────────────────
        print()
        giocate = {}
        for nome, cfg in PARTITE.items():
            turni = gioca(**cfg)
            vinti = regole.chiedi({"turni": [t for _, _, t in turni]})
            giocate[nome] = (turni, vinti)
            presi = {i for v in vinti for i in v}
            atteso = ATTESI[nome]
            dett = []
            if presi - atteso:
                dett.append(f"in più: {sorted(presi - atteso)}")
            if atteso - presi:
                dett.append(f"mancano: {sorted(atteso - presi)}")
            # il momento: ciascuno al suo turno
            ultimo = len(turni) - 1
            fuori = []
            for k, nuovi in enumerate(vinti):
                cmd, chi, t = turni[k]
                for i in nuovi:
                    famiglia = next(x["famiglia"] for x in trofei if x["id"] == i)
                    if famiglia in ("finali", "fini") or i in ALLA_FINE:
                        if k != ultimo or t["esito"] == "in_corso":
                            fuori.append(f"{i} al turno {k} («{cmd}»), non alla fine")
                    elif i in MOMENTO and not MOMENTO[i](cmd, chi):
                        fuori.append(f"{i} al turno {k} («{cmd}», con {chi})")
            if fuori:
                dett.append("fuori tempo: " + "; ".join(fuori))
            esito = turni[-1][2]["esito"] if turni else "?"
            prova(f"{nome:14s} {len(turni):4d} turni  {esito:9s} {len(presi):2d} trofei", not dett, "  ".join(dett))

        # ── tutte di fila: la collezione ────────────────────────────────────
        print()
        vinti_tutti, dove = [], {}
        for nome, (turni, _) in giocate.items():
            risposta = regole.chiedi({"turni": [t for _, _, t in turni], "vinti": vinti_tutti})
            for k, nuovi in enumerate(risposta):
                for i in nuovi:
                    dove.setdefault(i, []).append((nome, k))
                    vinti_tutti.append(i)
        mai = [i for i in ids if i not in dove]
        prova("ogni trofeo è vinto da almeno una partita (sfide comprese)", not mai, f"mai vinti: {mai}")
        prova("di fila, nessun trofeo si vince due volte", all(len(v) == 1 for v in dove.values()),
              str({i: v for i, v in dove.items() if len(v) > 1}))
        finali_ordine = []
        for nome, (turni, vinti) in giocate.items():
            for i in (i for v in vinti for i in v):
                if i in {fid for _, fid in cat["finali"]} and i not in finali_ordine:
                    finali_ordine.append(i)
                    if len(finali_ordine) == 6:
                        sesto = nome
        prova("«Tutte le strade» arriva col sesto finale diverso, all'ultimo turno di quella partita",
              dove.get("tutte-le-strade", [(None, None)])[0][0] == sesto
              and dove["tutte-le-strade"][0][1] == len(giocate[sesto][0]) - 1, str(dove.get("tutte-le-strade")))
        # per la collezione le due sfide di una lingua sola valgono l'una l'altra: conta la prima vinta delle due
        ordine = lambda nk: (list(giocate).index(nk[0]), nk[1])
        lingua = min((dove[i][0] for i in solo_in if i in dove), key=ordine)
        ultimo_mancante = max([v[0] for i, v in dove.items() if i != "il-viaggiatore" and i not in solo_in] + [lingua], key=ordine)
        prova("«Il viaggiatore» arriva con l'ultimo trofeo che mancava, una volta sola",
              dove.get("il-viaggiatore") == [ultimo_mancante], f"{dove.get('il-viaggiatore')} invece di {ultimo_mancante}")
    finally:
        regole.chiudi()

    tutto = all(esiti)
    print("\nTUTTO OK" if tutto else "\nCI SONO FALLIMENTI")
    return 0 if tutto else 1


if __name__ == "__main__":
    sys.exit(main())
