"""cammino.py — una partita da principiante, passo per passo: dove vanno il corpo e le scorte.

Il metodo viene da Il Relitto Silente (documento 33, §12, la taratura dell'aria, 5 novembre
2026), adattato al Viaggiatore il 7 novembre 2026 (diario «Il metodo del Relitto per il
bilanciamento»; il metodo per intero in sviluppo/bilanciamento.md):

  1. un percorso «d'intenzione» scritto a mano (collaudo/principiante-*.txt) dice che cosa
     vuole fare chi gioca: dove va, con chi parla, che cosa prende, gli errori di chi arriva
     nuovo. NON dice quando bere e mangiare, né come rimediare a un passaggio chiuso;
  2. la giocatrice di questo file lo fa da sé, come una principiante: beve e mangia quando il
     corpo glielo dice (ognuna alla sua soglia), e quando un passaggio la ferma («Con
     quest'acqua non arrivi dall'altra parte») fa quello che il gioco le ha suggerito, se lo
     trova; a volte prima si perde e gira a vuoto. Così le partite restano vere anche quando
     i numeri del gioco cambiano;
  3. collaudo/verosimili.py ricava da ogni percorso centinaia di partite diverse.

Uso (dalla radice del progetto):
    python collaudo/cammino.py collaudo/principiante-sperduta.txt
    python collaudo/cammino.py collaudo/principiante-sperduta.txt --carattere inesperta --seme 4 --passi
    python collaudo/cammino.py @B_cavallo --carattere attenta

Il percorso ha il formato del banco di gioco (strumenti/gioca.py): un comando per riga, le
righe vuote e quelle con # si saltano, @percorso espande un percorso di collaudo/percorsi.py,
le righe che cominciano con : non arrivano al motore. Bere e mangiare non ci sono. In più,
«A | B» è una risposta di dialogo con la sua alternativa: si sceglie la prima che il dialogo
offre (a Iole l'acqua o, se l'acqua è finita, il cibo).
"""
import argparse
import os
import random
import re
import sys
from collections import deque

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
sys.path.insert(0, QUI)

import partita  # noqa: E402

PROTOTIPO = os.path.join(RADICE, "prototipo")
NOMI_ZONE = {1: "Acquaviva", 2: "la piana", 3: "l'invaso", 4: "la statale", 5: "il paese",
             6: "le colline", 7: "il guado"}
LAGO = 3                      # l'invaso: sulla carta è il lago, e Michela non ci arrivava
VICINO = 6                    # nella crisi, quanti passi al massimo per tornare a una fonte
DIREZIONI = {"nord", "sud", "est", "ovest", "su", "giù"}
# Le parole con cui comincia un comando (e non una risposta di dialogo).
VERBI = DIREZIONI | {"guarda", "esamina", "prendi", "lascia", "parla", "attingi", "usa", "bevi", "mangia",
                     "getta", "attacca", "raddrizza", "curati", "aspetta", "minaccia", "spara", "inventario",
                     "stato", "leggi", "esci"}


def zone(cartella=PROTOTIPO):
    """Ogni luogo e la sua zona, letti dai file di zona (zN-*.fav)."""
    out = {}
    for f in sorted(os.listdir(cartella)):
        z = re.match(r"z(\d)-", f)
        if not z:
            continue
        with open(os.path.join(cartella, f), encoding="utf-8") as testo:
            for riga in testo:
                r = re.match(r"^(?:(?:Il|Lo|La|I|Gli|Le) |L')(.+?) è una stanza\.\s*$", riga)
                if r:
                    out[r.group(1).lower()] = int(z.group(1))
    return out


ZONA = zone()


def leggi_percorso(percorso):
    """I comandi di un percorso (file o @nome di percorsi.py)."""
    import percorsi
    if percorso.startswith("@"):
        return percorsi.comandi(percorso[1:])
    out = []
    with open(percorso, encoding="utf-8") as f:
        for riga in f:
            riga = riga.strip()
            if not riga or riga.startswith("#") or riga.startswith(":"):
                continue
            if riga.startswith("@"):
                out += percorsi.comandi(riga[1:].strip())
            else:
                out.append(riga)
    return out


# ---------------------------------------------------------------------------
# la mappa: strade fra i luoghi
# ---------------------------------------------------------------------------
def vicini(m, luogo):
    st = m.trova_stanza(luogo)
    return dict(st.uscite) if st else {}


def strada(m, da, a):
    """I comandi di direzione da un luogo all'altro (le uscite di oggi), o None."""
    visti, coda = {da: []}, deque([da])
    while coda:
        qui = coda.popleft()
        if qui == a:
            return visti[qui]
        for direzione, dove in vicini(m, qui).items():
            if dove not in visti:
                visti[dove] = visti[qui] + [direzione]
                coda.append(dove)
    return None


# Gli oggetti che, con le mani piene, si posano per primi: prima quel che non serve più.
# Quelli che non ci sono non si posano mai (la tanica, il biglietto, ciò che apre una strada).
DA_POSARE = ["diario", "mappa", "cartucce", "pistola", "chiave inglese", "occhiali", "benzina",
             "batteria", "cristalli", "borsa", "coltello", "stecca", "giubbotto", "coperta",
             "orologio", "anello", "lasciapassare", "damigiana"]


class Principiante:
    """Chi gioca per la prima volta: il carattere `c` (un dizionario di verosimili.py) dice le
    soglie a cui beve e mangia, se all'inizio beve troppo presto e quanto spesso, davanti a
    un passaggio chiuso, trova subito il rimedio («ingegno») invece di girare a vuoto."""

    def __init__(self, c, rng):
        self.c, self.rng = c, rng
        self.sete = rng.choice(c["sete"])
        self.fame = rng.choice(c["fame"])
        self.presto = rng.random() < c.get("presto", 0)
        self.ingegno = c.get("ingegno", 1.0)
        self.visti = set()
        self.tentativi = {}            # (luogo, motivo) → quante volte ci ha provato
        self.calma = 0                 # comandi prima di poter cercare di nuovo acqua o cibo
        self.smarrimenti = 0
        self.rimedi = 0
        self.vicolo = False            # ha cercato un rimedio e non ne ha trovato nessuno
        self.riserva = 0               # l'acqua da tenere per un passaggio che l'ha respinta
        self.passo_riserva = None      # (luogo, direzione) di quel passaggio
        self.saverio_sa = False        # Saverio le ha detto che senza un dono il pozzo non si tocca

    # --- il corpo ---------------------------------------------------------
    def cura(self, p):
        """Bere e mangiare prima di un comando, fuori dai dialoghi. Chi beve «presto» lo fa
        prima degli avvisi (sete 4, fame 5), finché non ha visto il lago: spreca acqua, come chi
        non sa ancora quanto dura. Sopra le righe del danno («(BEVI.)», «(MANGIA.)») bevono
        e mangiano tutte."""
        if p.m.dialogo_attivo:
            return []
        out = []
        inizio = self.presto and ZONA.get(p.m.posizione_giocatore, 9) < LAGO
        soglia_sete = 4 if inizio else self.sete
        soglia_fame = 5 if inizio else self.fame
        # Dopo un «Con quest'acqua non arrivi», l'acqua del passaggio si tiene da parte: si
        # beve sotto quella soglia solo quando la sete fa già male.
        tiene = p.v("acqua") - 1 < self.riserva and p.v("sete") < 9
        if (p.v("sete") >= min(soglia_sete, 9)) and p.v("acqua") >= 1 and not tiene:
            out.append("bevi")
        # Dopo che Saverio l'ha mandata via («Portami un motivo per fidarmi»), una porzione la
        # tiene per lui: la mangia solo quando la fame fa già male.
        per_saverio = (self.saverio_sa and p.v("fiducia di saverio") < 2 and p.v("cibo") <= 1
                       and p.v("fame") < 11)
        if (p.v("fame") >= min(soglia_fame, 11)) and p.v("cibo") >= 1 and not per_saverio:
            out.append("mangia qualcosa")
        if p.v("vita") <= 4 and "medicine" in p.m.inventario and self.rng.random() < self.ingegno:
            out.append("curati")
        return out

    def crisi(self, p):
        """Sete o fame alla riga del danno e niente da bere o da mangiare: cerca una fonte
        che conosce. Una volta ogni tanto, non a ogni comando."""
        if p.m.dialogo_attivo or self.calma > 0:
            self.calma = max(0, self.calma - 1)
            return []
        # Solo le fonti a pochi passi: lontano, con il corpo che fa male, si va avanti (il paese di
        # cui le hanno parlato) invece di tornare indietro per mezza mappa.
        if p.v("sete") >= 9 and p.v("acqua") == 0:
            self.calma = 12
            return self._cerca(p, "acqua", vicino=VICINO)
        if p.v("fame") >= 11 and p.v("cibo") == 0:
            self.calma = 12
            return self._cerca(p, "cibo", vicino=VICINO)
        return []

    # --- dopo un comando ----------------------------------------------------
    def reazione(self, p, cmd, origine, out, prima):
        """Quello che una principiante fa da sé dopo un comando: esce da un dialogo in cui ha
        sbagliato risposta, posa qualcosa se ha le mani piene, e davanti a un passaggio
        chiuso cerca il rimedio (o prima si perde)."""
        self.visti.add(p.m.posizione_giocatore)
        if "Portami un motivo per fidarmi" in out or "Questo pozzo non è una fontana" in out:
            self.saverio_sa = True
        if "Non è una scelta valida" in out:
            # Un comando detto a dialogo aperto: esce e lo ridice. Una risposta che non c'è
            # (il cibo da dare quando il cibo è finito): la salta e resta nel dialogo.
            if cmd.split()[0].lower() in VERBI:
                return [("esci", "rimedio"), (cmd, origine)]
            return []
        if "Non hai niente da lanciargli" in out and self.rng.random() < self.ingegno:
            # nella serra senza cibo: il gioco dice «Oppure ATTACCA il cane»
            colpi = 2 if "coltello" in p.m.inventario else 5
            return [("attacca il cane", "rimedio")] * colpi
        if "mani troppo piene" in out:
            posa = next((o for o in DA_POSARE if o in p.m.inventario), None)
            return [(f"lascia {posa}", "rimedio"), (cmd, origine)] if posa else []
        if (cmd.lower() in DIREZIONI and (origine in ("percorso", "rimedio") or origine.startswith("strada:"))
                and p.m.posizione_giocatore == prima and "Non puoi andare" not in out
                and not p.m.dialogo_attivo):
            return self._passaggio(p, cmd, prima)
        return []

    # --- i rimedi -----------------------------------------------------------
    # Un piano è una lista di (comando, origine). «@vai LUOGO» è una tappa: la strada si calcola
    # quando ci si arriva, dal punto in cui si è davvero (un passo a caso può essere stato
    # respinto da un passaggio, e la giocatrice non è dove si pensava).
    @staticmethod
    def _vai(luogo, origine="rimedio"):
        return [(f"@vai {luogo}", origine)]

    def _smarrisciti(self, p):
        """Si perde: qualche passo a caso fra le uscite che vede, poi ci ripensa e torna."""
        self.smarrimenti += 1
        passi, qui = [], p.m.posizione_giocatore
        for _ in range(self.rng.randint(2, 5)):
            uscite = vicini(p.m, qui)
            if not uscite:
                break
            d = self.rng.choice(sorted(uscite))
            passi.append((d, "smarrita"))
            qui = uscite[d]
        return passi + self._vai(p.m.posizione_giocatore, "smarrita")

    def _forse_smarrita(self, p):
        return [] if self.rng.random() < self.ingegno else self._smarrisciti(p)

    def _conosce(self, p, luogo):
        """Un luogo che ha visto, o che vede da un luogo visto (le uscite che le descrizioni
        nominano)."""
        if luogo in self.visti:
            return True
        return any(luogo in vicini(p.m, v).values() for v in self.visti)

    def _fonti(self, p, che):
        """Le fonti d'acqua o di cibo che funzionano adesso: [(luogo, comandi)]."""
        inv, v = p.m.inventario, p.v
        f = []
        if che == "acqua":
            if v("fiducia di saverio") >= 2 and (v("stato del pozzo") == "pieno" or v("acqua") <= 3):
                f.append(("pozzo", ["attingi"]))
            elif v("fiducia di saverio") < 2 and v("cibo") >= 1:
                f.append(("pozzo", ["parla con Saverio", "Ti lascio del cibo", "Grazie.", "attingi"]))
            elif v("fiducia di saverio") < 2 and self.rng.random() < self.ingegno:
                # Saverio vuole cibo e il cibo è finito: prima il cibo (le conserve della serra,
                # o Nunzio che lo cambia con l'acqua), poi il pozzo. Due passi: li vede chi ha ingegno.
                saverio = ["@vai pozzo", "parla con Saverio", "Ti lascio del cibo", "Grazie.", "attingi"]
                if v("stato del cane") == "minaccioso":
                    f.append(("serra", ["attacca il cane"] * (2 if "coltello" in inv else 5) + saverio))
                if v("acqua") >= 1:
                    f.append(("bar", ["parla con Nunzio", "Hai qualcosa da mangiare?", "Basta così."] + saverio))
            if v("stato della pompa") == "attiva" and v("acqua") <= 5:
                f.append(("diga", ["attingi"]))
            f.append(("sorgente", ["attingi"]))
            if "orologio" in inv or v("acqua") <= 2:
                f.append(("bar", self._da_nunzio(p)))
            for cosa, scelta in (("orologio", "Ti do l'orologio per dell'acqua."),
                                 ("batteria", "Ti do la batteria."), ("stecca", "Ti do la stecca"),
                                 ("anello", "Vendo l'anello."), ("benzina", "Ti do la tanica di benzina.")):
                if cosa in inv:
                    f.append(("mercato", ["parla con Ciro", scelta, "Basta così."]))
                    break
        else:
            if v("acqua") >= 1 and v("cibo") <= 3:
                f.append(("bar", ["parla con Nunzio", "Hai qualcosa da mangiare?", "Basta così."]))
            elif v("cibo") <= 3:
                # senz'acqua: prima fatica (un'acqua, due di fame), poi la cambia col cibo
                f.append(("bar", ["parla con Nunzio", "Posso lavorare", "Torno a vedere",
                                  "Hai qualcosa da mangiare?", "Basta così."]))
            if v("stato del cane") == "minaccioso" and ("coltello" in inv or v("vita") >= 7):
                # a mani nude, col cane che morde, solo chi ha ancora forze
                colpi = 2 if "coltello" in inv else 5
                f.append(("serra", ["attacca il cane"] * colpi))
            for cosa, scelta in (("cristalli", "Ti do i cristalli"), ("borsa", "Ti do la borsa"),
                                 ("giubbotto", "Ti do il giubbotto."), ("lasciapassare", "Ho la carta di Vito."),
                                 ("anello", "Vendo l'anello.")):
                if cosa in inv:
                    f.append(("mercato", ["parla con Ciro", scelta, "Basta così."]))
                    break
            else:
                if v("acqua") >= 3:
                    f.append(("mercato", ["parla con Ciro", "Ti do tre d'acqua", "Basta così."]))
            if v("acqua") >= 2:
                f.append(("pianoro", ["parla con Tore", "Ti do un po' d'acqua", "…", "Tiro avanti."]))
        return [(luogo, cmds) for luogo, cmds in f if self._conosce(p, luogo)]

    def _da_nunzio(self, p):
        """Una visita al bar per l'acqua: l'orologio, se c'è; se ha fame e il cibo è poco, anche
        il cibo (prima un lavoro, se l'acqua è finita); poi «chi non ha niente da dare può
        sempre faticare», finché la tanica arriva a 3 (oltre, Nunzio non fa più lavorare). Le
        risposte sono tutte sullo schermo e non costano turni."""
        v, inv = p.v, p.m.inventario
        acqua, cibo = v("acqua"), v("cibo")
        dire = ["parla con Nunzio"]
        if "orologio" in inv:
            dire += ["Ti do l'orologio", "Torno a vedere"]
            acqua += 3
        lavori = max(0, 3 - acqua)                 # la fame che le darà la fatica (1 a lavoro dalla 1.42)
        if (v("fame") + lavori >= min(self.fame, 7) or cibo == 0) and cibo <= 3:
            if acqua == 0:
                dire += ["Posso lavorare", "Torno a vedere"]
                acqua += 1
            dire += ["Hai qualcosa da mangiare?", "Torno a vedere"]
            acqua -= 1
        while acqua <= 2:
            dire += ["Posso lavorare", "Torno a vedere"]
            acqua += 1
        return dire + ["Niente, per ora."]

    def _cerca(self, p, che, ritorno=True, solo=None, vicino=None):
        """La fonte conosciuta più vicina: andarci, usarla e (se `ritorno`) tornare dov'era.
        Se non ne conosce nessuna, gira a vuoto: è un vicolo cieco. Con `vicino`, solo le fonti
        entro quei passi: se non ce n'è, va avanti per la sua strada."""
        qui = p.m.posizione_giocatore
        scelte = []
        for luogo, cmds in self._fonti(p, che):
            if solo and luogo not in solo:
                continue
            andata = strada(p.m, qui, luogo)
            if andata is not None:
                scelte.append((len(andata), luogo, cmds))
        if (che == "acqua" and p.v("stato della pompa") == "secca" and self._conosce(p, "diga")
                and not solo):
            # la pompa da far andare è la fonte più ricca: chi è all'invaso finisce il lavoro
            pompa = self._pompa(p)
            andata = strada(p.m, qui, "diga")
            if pompa and andata is not None:
                scelte.append((len(andata), "diga", pompa))
        if vicino is not None:
            scelte = [s for s in scelte if s[0] <= vicino]
            if not scelte:
                return []
        if not scelte:
            self.vicolo = True
            return self._smarrisciti(p)
        self.rimedi += 1
        _, luogo, cmds = min(scelte, key=lambda s: (s[0], s[1]))
        piano = self._forse_smarrita(p) + self._vai(luogo) + [c if isinstance(c, tuple) else (c, "rimedio")
                                                              for c in cmds]
        return piano + (self._vai(qui) if ritorno else [])

    def _passaggio(self, p, cmd, luogo):
        """Un passaggio chiuso: il rimedio che il gioco ha suggerito, se lo trova, e poi di
        nuovo verso il passaggio. Dopo tre tentativi allo stesso passaggio lascia perdere."""
        v, inv = p.v, p.m.inventario
        motivo = self._motivo(p, luogo, cmd)
        chiave = (luogo, motivo)
        self.tentativi[chiave] = self.tentativi.get(chiave, 0) + 1
        if motivo is None or self.tentativi[chiave] > 3:
            self.vicolo = True
            return self._smarrisciti(p)
        piano = []
        if motivo == "mappa":
            piano = self._vai("casa") + [("prendi la mappa", "rimedio")]
        elif motivo == "acqua":
            self.riserva = {"margine": 3, "masseria": 4, "diga": 6}[luogo]
            self.passo_riserva = (luogo, cmd)
            solo = {"margine": {"bar"}, "masseria": {"pozzo", "bar"}, "diga": {"diga"}}.get(luogo)
            return self._cerca(p, "acqua", ritorno=False, solo=solo) + self._vai(luogo) + [(cmd, "rimedio")]
        elif motivo == "pompa":
            piano = self._pompa(p)
        elif motivo == "iole":
            piano = self._dono_iole(p)
        elif motivo == "pedaggio":
            if "stecca" in inv:
                scelta = "Ti do la stecca di sigarette."
            elif "benzina" in inv:
                scelta = "Ti do la tanica di benzina."
            elif v("acqua") >= 3:
                scelta = "Ti lascio tre d'acqua."
            else:
                return self._cerca(p, "acqua", ritorno=False) + self._vai(luogo) + [(cmd, "rimedio")]
            piano = [("parla con Vito", "rimedio"), (scelta, "rimedio"), ("Grazie.", "rimedio")]
        elif motivo == "permesso":
            piano = self._permesso(p)
        elif motivo == "onofrio":
            piano = self._onofrio(p)
        elif motivo == "cosimo":
            if "lettera" in inv:
                piano = [("usa la lettera su Cosimo", "rimedio")]
            elif "fucile" in inv:
                piano = ([("lascia il fucile", "rimedio")] + [("aspetta", "rimedio")] * 5
                         + [("prendi il fucile", "rimedio"), ("attacca Cosimo", "rimedio")])
        elif motivo == "grata":
            return []          # il sottopasso è facoltativo: si passa dal casello
        if not piano:
            self.vicolo = True
            return self._smarrisciti(p)
        self.rimedi += 1
        return self._forse_smarrita(p) + piano + self._vai(luogo) + [(cmd, "rimedio")]

    def _motivo(self, p, luogo, cmd):
        v, inv = p.v, p.m.inventario
        if luogo == "margine":
            return "mappa" if "mappa" not in inv else ("acqua" if v("acqua") < 3 else None)
        if luogo == "masseria":
            return "acqua" if v("acqua") < 4 else None
        if luogo == "diga" and cmd == "ovest":
            return "pompa" if v("stato della pompa") == "secca" else ("acqua" if v("acqua") < 6 else None)
        if luogo == "diga" and cmd == "nord":
            return "iole"
        return {"casello": "pedaggio", "osteria": "permesso", "valico": "onofrio", "guado": "cosimo",
                "area di servizio": "grata"}.get(luogo)

    def _dono_iole(self, p):
        if p.v("fiducia di iole") >= 2:
            return []
        if p.v("acqua") >= 1:
            scelta = "Ti lascio dell'acqua"
        elif p.v("cibo") >= 1:
            scelta = "Ti lascio del cibo."
        else:
            return []
        return self._vai("diga") + [("parla con Iole", "rimedio"), (scelta, "rimedio"), ("Grazie.", "rimedio"),
                                    ("Niente, per ora.", "rimedio")]

    def _pompa(self, p):
        """Il puzzle dell'acqua all'invaso: il filtro dalla carcassa, il dono a Iole, le
        pastiglie (e la damigiana) dal casotto, poi la pompa."""
        inv = p.m.inventario
        piano = []
        if "filtro" not in inv:
            piano += self._vai("relitto") + [("prendi il filtro", "rimedio")]
        if "pastiglie" not in inv:
            dono = self._dono_iole(p)
            if p.v("fiducia di iole") < 2 and not dono:
                return []
            piano += dono + self._vai("casotto") + [("prendi le pastiglie", "rimedio")]
            if self.rng.random() < self.c.get("raccolta", 1):
                piano.append(("prendi la damigiana", "rimedio"))
        return piano + self._vai("diga") + [("usa le pastiglie su la pompa", "rimedio")]

    def _permesso(self, p):
        """Rosaria: la fiducia a 3 (le medicine a Pasquale, il dono dell'acqua), poi la parola."""
        v, inv = p.v, p.m.inventario
        fiducia = v("fiducia di rosaria")
        piano = []
        if fiducia < 3 and "medicine" in inv and v("stato di pasquale") == "malato":
            piano += self._vai("vicolo") + [("usa le medicine su Pasquale", "rimedio")]
            fiducia += 2
        piano += self._vai("osteria") + [("parla con Rosaria", "rimedio")]
        acqua = v("acqua")
        while fiducia < 3 and acqua >= 1:
            piano += [("Ti lascio dell'acqua", "rimedio"), ("…", "rimedio")]
            fiducia, acqua = fiducia + 1, acqua - 1
        if fiducia < 3:
            return []
        return piano + [("Mi serve salire", "rimedio"), ("Scrivile", "rimedio"), ("Grazie.", "rimedio")]

    def _onofrio(self, p):
        """Onofrio vuole un ricordo (il cavallo di legno o il santino), poi dà la lettera."""
        inv = p.m.inventario
        piano = []
        if "giocattolo" in inv:
            mostra = "Ti mostro questo cavallo"
        elif "santino" in inv:
            mostra = "Ti mostro questo santino"
        else:
            if not self._conosce(p, "cappella"):
                return []
            piano += self._vai("cappella") + [("prendi il santino", "rimedio")]
            mostra = "Ti mostro questo santino"
        piano += self._vai("grotta") + [("parla con Onofrio", "rimedio")]
        if p.v("fiducia di onofrio") >= 3:
            piano += [("Devo passare il guado.", "rimedio")]
        else:
            piano += [(mostra, "rimedio"), ("Cosa mi dai?", "rimedio")]
        return piano + [("Dammi la lettera.", "rimedio"), ("…", "rimedio"), ("prendi la lettera", "rimedio")]


# ---------------------------------------------------------------------------
# una partita
# ---------------------------------------------------------------------------
def scegli_alternativa(p, cmd):
    """«A | B»: nel percorso, una risposta con le sue alternative (dare a Iole l'acqua o, se
    l'acqua non c'è, il cibo). Si sceglie la prima che il dialogo offre, come farebbe chi legge
    le risposte; fuori da un dialogo, la prima."""
    alternative = [a.strip() for a in cmd.split(" | ")]
    if p.m.dialogo_attivo:
        offerte = [o.strip().lower() for o in p.opzioni_dialogo()]
        for a in alternative:
            low = a.lower()
            if low in offerte or sum(1 for o in offerte if low in o) == 1:
                return a
    return alternative[0]


SCORTE = ("vita", "sete", "fame", "acqua", "cibo")


def causa(p):
    msg = p.m.messaggio_esito or ""
    if "sete" in msg:
        return "sete"
    if "fame" in msg:
        return "fame"
    return "ferite"


def gioca(comandi, c, seme=1, limite=900):
    """Gioca i comandi con una principiante del carattere `c`. Restituisce la partita, i passi
    ({n, cmd, origine, luogo, zona, turno, vita, sete, fame, acqua, cibo}) e la giocatrice."""
    rng = random.Random(seme * 7919 + 17)
    p = partita.Partita(seme=seme)
    g = Principiante(c, rng)
    g.visti.add(p.m.posizione_giocatore)
    coda = deque((x, "percorso") for x in comandi)
    passi = []

    def esegui(cmd, origine):
        prima = p.m.posizione_giocatore
        out = p.esegui(cmd)
        luogo = p.m.posizione_giocatore
        passi.append(dict(n=len(passi) + 1, cmd=cmd, origine=origine, luogo=luogo,
                          zona=ZONA.get(luogo, 0), turno=p.m.turno_corrente,
                          **{k: p.v(k) for k in SCORTE}))
        return out, prima

    while coda and p.in_corso and len(passi) < limite:
        for x in g.cura(p):
            esegui(x, "corpo")
            if not p.in_corso:
                break
        if not p.in_corso:
            break
        r = g.crisi(p)
        if r:
            coda.extendleft(reversed(r))
        cmd, origine = coda.popleft()
        if cmd.startswith("@vai "):
            # una tappa: la strada da qui, adesso (i passi portano la meta con sé)
            s = strada(p.m, p.m.posizione_giocatore, cmd[5:]) or []
            tipo = "smarrita" if origine == "smarrita" else f"strada:{cmd[5:]}"
            coda.extendleft(reversed([(d, tipo) for d in s]))
            continue
        if " | " in cmd:
            cmd = scegli_alternativa(p, cmd)
        if (origine == "percorso" and cmd.lower() in DIREZIONI and not p.m.dialogo_attivo
                and rng.random() < c.get("deviazione", 0)):
            # una deviazione: qualche passo a caso, poi di nuovo il passo del percorso
            coda.appendleft((cmd, origine))
            coda.extendleft(reversed(g._smarrisciti(p)))
            continue
        out, prima = esegui(cmd, origine)
        if p.m.posizione_giocatore != prima and (prima, cmd) == g.passo_riserva:
            g.riserva = 0              # passata: l'acqua del passaggio non serve più tenerla
        if p.in_corso:
            r = g.reazione(p, cmd, origine, out, prima)
            if r and origine.startswith("strada:"):
                # un passo della strada respinto da un passaggio: il resto di quella strada
                # non vale più; dopo il rimedio la si ricalcola
                while coda and coda[0][1] == origine:
                    coda.popleft()
                r = r + [(f"@vai {origine[7:]}", "rimedio")]
            if r:
                coda.extendleft(reversed(r))
    return p, passi, g


def esito(p, passi, g):
    """Le misure di una partita."""
    zone_viste = [s["zona"] for s in passi if s["zona"]]
    lago = next((s for s in passi if s["zona"] >= LAGO), None)
    prima_lago = [s for s in passi if not lago or s["n"] <= lago["n"]]
    finale = next((r for _, out in p.storia for r in out.splitlines() if r.startswith("FINALE")), None)
    stato = p.m.stato_partita
    e = {
        "esito": "finale" if stato in ("vinta", "terminata") else ("morta" if stato == "persa" else "stallo"),
        "finale": finale,
        "zona_max": max(zone_viste) if zone_viste else 1,
        "lago": lago is not None,
        "turno_lago": lago["turno"] if lago else None,
        "turno_piana": next((s["turno"] for s in passi if s["zona"] >= 2), None),
        "al_lago": {k: lago[k] for k in SCORTE} if lago else None,
        "vita_min": min([s["vita"] for s in passi] or [10]),
        "vita_min_prima_lago": min([s["vita"] for s in prima_lago] or [10]),
        "pericolo": sum(1 for s in passi if s["sete"] >= 9 or s["fame"] >= 11),
        "turni": p.m.turno_corrente,
        "comandi": len(passi),
        "smarrimenti": g.smarrimenti,
        "rimedi": g.rimedi,
        "vicolo": g.vicolo,
        "eccezioni": len(p.eccezioni),
    }
    if e["esito"] == "morta":
        ultimo = passi[-1] if passi else {"zona": 1, "luogo": "stazione"}
        # «sul colpo»: la morte è venuta da una soglia estrema (sete 16, fame 18; fino alla 1.41 13 e 15) con la vita
        # ancora sopra zero, senza un turno di danno che l'annunciasse
        e.update(causa=causa(p), zona_morte=ultimo["zona"], luogo_morte=ultimo["luogo"],
                 sul_colpo=ultimo.get("vita", 0) > 0)
    return e


def rapporto(nome, p, passi, g, con_passi=False):
    e = esito(p, passi, g)
    righe = [f"== {nome}  (soglie: bere a sete {g.sete}, mangiare a fame {g.fame}"
             + (", all'inizio beve e mangia presto" if g.presto else "") + f", ingegno {g.ingegno})"]
    if con_passi:
        for s in passi:
            segno = {"corpo": "·", "rimedio": "↺", "smarrita": "?", "percorso": " "}.get(s["origine"], " ")
            righe.append(f"  {s['n']:4d} {segno} t{s['turno']:<4d} z{s['zona']} {s['luogo'][:16]:16s} "
                         f"vita {s['vita']:2d} sete {s['sete']:2d} fame {s['fame']:2d} · acqua {s['acqua']:2d} cibo {s['cibo']:2d}  "
                         f"{s['cmd'][:46]}")
    righe.append(f"  esito: {e['esito']}" + (f" ({e['causa']}, {NOMI_ZONE.get(e['zona_morte'])}, {e['luogo_morte']})"
                                              if e["esito"] == "morta" else "")
                 + f" · turni {e['turni']} · comandi {e['comandi']}")
    if e["finale"]:
        righe.append("  " + e["finale"][:110])
    if e["lago"]:
        a = e["al_lago"]
        righe.append(f"  al lago al turno {e['turno_lago']}: vita {a['vita']}, sete {a['sete']}, fame {a['fame']}, "
                     f"acqua {a['acqua']}, cibo {a['cibo']}")
    else:
        righe.append(f"  al lago: mai (la zona più lontana: {NOMI_ZONE.get(e['zona_max'])})")
    righe.append(f"  vita minima {e['vita_min']} (prima del lago {e['vita_min_prima_lago']}) · turni in pericolo "
                 f"{e['pericolo']} · si è persa {e['smarrimenti']} volte · rimedi {e['rimedi']}"
                 + (" · un vicolo cieco" if e["vicolo"] else ""))
    per_zona = {}
    for s in passi:
        z = per_zona.setdefault(s["zona"], {"comandi": 0, "bevute": 0, "mangiate": 0})
        z["comandi"] += 1
        z["bevute"] += s["cmd"] == "bevi"
        z["mangiate"] += s["cmd"] == "mangia qualcosa"
    righe.append("  per zona: " + " · ".join(
        f"{NOMI_ZONE.get(z, '?')} {d['comandi']} comandi ({d['bevute']} sorsi, {d['mangiate']} porzioni)"
        for z, d in sorted(per_zona.items()) if z))
    if p.eccezioni:
        righe.append(f"  [ECCEZIONI DEL MOTORE: {len(p.eccezioni)}]")
    return "\n".join(righe)


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    import verosimili
    ap = argparse.ArgumentParser(description="Una partita da principiante, passo per passo.")
    ap.add_argument("percorsi", nargs="+", help="file principiante-*.txt, o @percorso di percorsi.py")
    ap.add_argument("--carattere", default=None, help=f"uno di: {', '.join(verosimili.CARATTERI)} "
                    "(di norma quello del file)")
    ap.add_argument("--seme", type=int, default=1)
    ap.add_argument("--passi", action="store_true", help="stampa ogni comando")
    args = ap.parse_args()
    for percorso in args.percorsi:
        nome = args.carattere or verosimili.carattere_del_file(percorso)
        c = verosimili.CARATTERI[nome]
        comandi = leggi_percorso(percorso)
        p, passi, g = gioca(comandi, c, args.seme)
        print(rapporto(f"{os.path.basename(percorso)} · {nome} · seme {args.seme}", p, passi, g, args.passi))
        print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
