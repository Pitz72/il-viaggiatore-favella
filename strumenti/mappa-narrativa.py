"""La mappa narrativa del Viaggiatore, ricavata dai sorgenti .fav.

Non disegna i luoghi (quelli stanno in pre-produzione/03-mappa.md): disegna la
MEMORIA della storia. Per ogni variabile di stato dice in quale zona si scrive e
in quale si legge; per ogni cosa che si porta, dove nasce e dove conta; per ogni
finale, da che cosa dipende. È lo strumento per vedere se una scelta fatta in una
zona torna più avanti (una conseguenza a distanza) o si spegne dove è nata.

Si legge il testo dei .fav, non il mondo compilato: serve sapere in quale FILE
(cioè in quale zona) una cosa è scritta, e il mondo compilato non lo ricorda. Il
parsing è quello della prosa di FAVELLA: dichiarazioni «X è uno stato.»,
condizioni dopo «se» e nei «Quando …», effetti dopo «adesso».

Uso:  python strumenti/mappa-narrativa.py            (scrive sviluppo/mappa-narrativa.md)
      python strumenti/mappa-narrativa.py --stampa   (anche a schermo)
"""
import os
import re
import sys
from collections import defaultdict

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROTOTIPO = os.path.join(RADICE, "prototipo")
USCITA = os.path.join(RADICE, "sviluppo", "mappa-narrativa.md")

ZONE = [
    ("storia", "il-viaggiatore.fav", "l'avventura (file principale)"),
    ("sistemi", "sistemi.fav", "il corpo e le scorte"),
    ("Z1", "z1-acquaviva.fav", "Acquaviva"),
    ("Z2", "z2-piana.fav", "la piana"),
    ("Z3", "z3-invaso.fav", "l'invaso"),
    ("Z4", "z4-statale.fav", "la statale"),
    ("Z5", "z5-paese.fav", "il paese"),
    ("Z6", "z6-colline.fav", "le colline"),
    ("Z7", "z7-guado.fav", "il guado"),
]
ORDINE = {z: i for i, (z, _, _) in enumerate(ZONE)}
ARTICOLO = r"(?:il|lo|la|i|gli|le|l'|un|uno|una)\s*"
SCORTE = {"vita", "sete", "fame", "acqua", "cibo"}


def righe(zona_file):
    with open(os.path.join(PROTOTIPO, zona_file), encoding="utf-8") as f:
        for n, r in enumerate(f, 1):
            r = r.strip()
            if r and not r.startswith("#"):
                yield n, r


def senza_virgolette(r):
    return re.sub(r'"[^"]*"', '""', r)


def spezza(r):
    """(condizioni, effetti) di una riga. Nelle regole, negli eventi e nei demoni gli
    effetti stanno dopo i due punti («Quando …: aumenta la generosità di 1.», «…: dire
    "…" e adesso …»); nelle opzioni di dialogo, che non hanno i due punti, dopo «adesso»."""
    s = senza_virgolette(r).lower()
    if ":" in s:
        cond, resto = s.split(":", 1)
        return cond, [e for e in re.split(r"\b(?:e\s+)?adesso\s+", resto) if e.strip(" .")]
    pezzi = re.split(r"\b(?:e\s+)?adesso\s+", s)
    return pezzi[0], pezzi[1:]


class Mappa:
    def __init__(self):
        self.variabili = {}                      # chiave → (zona, tipo)
        self.cose = {}                           # nome → (zona, luogo, tipo)
        self.stanze = defaultdict(list)          # zona → [stanze]
        self.scritture = defaultdict(lambda: defaultdict(int))   # var → zona → n
        self.letture = defaultdict(lambda: defaultdict(int))
        self.possesso = defaultdict(lambda: defaultdict(int))    # cosa → zona dove «ha …» conta
        self.consumo = defaultdict(lambda: defaultdict(int))     # cosa → zona dove sparisce
        self.nodi = defaultdict(lambda: defaultdict(int))        # zona → personaggio → nodi
        self.opzioni = defaultdict(lambda: [0, 0, 0])            # zona → [opzioni, con effetti, condizionate]
        self.finali = []                                          # (zona, esito, condizione, testo)

    # --- lettura dei sorgenti -------------------------------------------------
    def leggi(self):
        for zona, file, _ in ZONE:
            for _, r in righe(file):
                self._dichiarazioni(zona, r)
        # prima le chiavi più lunghe: «vita del cane» non deve contare come «vita»
        self._chiavi = sorted(self.variabili, key=len, reverse=True)
        self._nomi = sorted(self.cose, key=len, reverse=True)
        for zona, file, _ in ZONE:
            for _, r in righe(file):
                self._uso(zona, r)

    def _dichiarazioni(self, zona, r):
        m = re.match(rf"^{ARTICOLO}(.+?) è (uno stato|un contatore)\.$", r, re.I)
        if m:
            self.variabili[m.group(1).lower()] = (zona, "stato" if "stato" in m.group(2) else "contatore")
            return
        m = re.match(rf"^{ARTICOLO}(.+?) è (una stanza|una cosa|un personaggio)\.$", r, re.I)
        if m:
            nome = m.group(1).lower()
            if m.group(2) == "una stanza":
                self.stanze[zona].append(nome)
            else:
                self.cose[nome] = [zona, None, "persona" if "personaggio" in m.group(2) else "cosa"]
            return
        m = re.match(rf"^{ARTICOLO}(.+?) è in {ARTICOLO}(.+?)\.$", r, re.I)
        if m and m.group(1).lower() in self.cose:
            self.cose[m.group(1).lower()][1] = m.group(2).lower()
        m = re.match(r'^(\w+) al nodo "[^"]+" dice', r)
        if m:
            self.nodi[zona][m.group(1)] += 1

    def _trova(self, testo, chiavi):
        """Le chiavi citate nel testo (con l'articolo davanti), senza contare due volte lo stesso tratto."""
        trovate = []
        for k in chiavi:
            pat = rf"\b{ARTICOLO}{re.escape(k)}\b"
            if re.search(pat, testo):
                trovate.append(k)
                testo = re.sub(pat, " ", testo)
        return trovate

    def _uso(self, zona, r):
        if re.match(rf"^{ARTICOLO}.+? (è|parte da) ", r, re.I) and " se " not in r and "adesso" not in r:
            return                                   # dichiarazioni e descrizioni senza condizioni
        cond, effetti = spezza(r)
        if " se " in cond or cond.startswith(("quando", "ogni turno", "ogni ")):
            dove = cond.split(" se ", 1)[1] if " se " in cond else cond
            for k in self._trova(dove, self._chiavi):
                self.letture[k][zona] += 1
            for m in re.finditer(rf"il giocatore (?:non )?ha {ARTICOLO}([\w' ]+?)(?= e |\s*[:.,]| conduce| dice| chiude|$)", dove):
                nome = m.group(1).strip()
                if nome in self.cose:
                    self.possesso[nome][zona] += 1
        for e in effetti:
            for k in self._trova(e, self._chiavi):
                self.scritture[k][zona] += 1
            m = re.match(rf"{ARTICOLO}([\w' ]+?) è nel nulla", e)
            if m and m.group(1) in self.cose:
                self.consumo[m.group(1)][zona] += 1
            m = re.match(r'(termina|vinci|perdi)\b', e)
            if m:
                testo = re.findall(r'"([^"]*)"', r)
                self.finali.append((zona, m.group(1), cond.split(":")[0].strip(), testo[-1] if testo else ""))
        if "l'opzione" in r:
            o = self.opzioni[zona]
            o[0] += 1
            o[1] += bool(effetti)
            o[2] += " se " in cond

    # --- resoconto -----------------------------------------------------------
    def resoconto(self):
        out = ["# Mappa narrativa — la memoria della storia", "",
               "> Generata da `strumenti/mappa-narrativa.py` leggendo `prototipo/*.fav`. Non modificare",
               "> a mano: si rigenera. Il commento e il progetto stanno in",
               "> `pre-produzione/06-ramificazione.md`.", ""]
        out += ["## 1. Le zone", "", "| Zona | | Luoghi | Chi parla (nodi di dialogo) | Opzioni | con effetti | condizionate |",
                "|---|---|---:|---|---:|---:|---:|"]
        for zona, _, nome in ZONE:
            chi = ", ".join(f"{p} {n}" for p, n in self.nodi[zona].items()) or "—"
            o = self.opzioni[zona]
            out.append(f"| {zona} | {nome} | {len(self.stanze[zona])} | {chi} | {o[0]} | {o[1]} | {o[2]} |")

        out += ["", "## 2. Le variabili: dove si scrivono, dove si leggono", "",
                "Una variabile che si legge solo nella zona in cui si scrive è **memoria locale**: la",
                "scelta si spegne lì. Una che si legge più avanti è una **conseguenza a distanza**.", "",
                "| Variabile | Nasce | Si scrive in | Si legge in | Portata |", "|---|---|---|---|---|"]
        lontane, fantasmi = [], []
        for k, (zona, tipo) in sorted(self.variabili.items(), key=lambda x: (ORDINE[x[1][0]], x[0])):
            sc = self.scritture[k]
            le = self.letture[k]
            z_sc = sorted(sc, key=ORDINE.get)
            z_le = sorted(le, key=ORDINE.get)
            if k in SCORTE:
                portata = "scorta (ovunque)"
            elif not le:
                portata = "**mai letta**"
                fantasmi.append(k)
            elif any(ORDINE[z] > ORDINE[(z_sc or [zona])[0]] for z in z_le):
                # conta dove si scrive per la prima volta, non dove si dichiara (i fili
                # del viaggio si dichiarano nel file principale e si scrivono nelle zone)
                prima = (z_sc or [zona])[0]
                portata = "**a distanza**"
                lontane.append((k, ", ".join(z_sc) or zona, [z for z in z_le if ORDINE[z] > ORDINE[prima]]))
            else:
                portata = "locale"
            fmt = lambda d, zs: ", ".join(f"{z} ({d[z]})" for z in zs) or "—"
            out.append(f"| {k} | {zona} | {fmt(sc, z_sc)} | {fmt(le, z_le)} | {portata} |")

        out += ["", "## 3. Le cose che si portano da una zona all'altra", "",
                "Le cose sono l'altra memoria del viaggio: si prendono in una zona e contano in un'altra.", "",
                "| Cosa | Nasce | Conta in (possesso) | Sparisce in | |", "|---|---|---|---|---|"]
        portate = []
        for nome, (zona, luogo, tipo) in sorted(self.cose.items(), key=lambda x: (ORDINE[x[1][0]], x[0])):
            if tipo != "cosa":
                continue
            pos, con = self.possesso[nome], self.consumo[nome]
            if not pos and not con:
                continue
            z_pos = sorted(pos, key=ORDINE.get)
            z_con = sorted(con, key=ORDINE.get)
            lontano = any(ORDINE[z] > ORDINE[zona] for z in z_pos + z_con)
            if lontano:
                portate.append(nome)
            out.append(f"| {nome} | {zona} ({luogo or '—'}) | {', '.join(z_pos) or '—'} | {', '.join(z_con) or '—'} | {'**a distanza**' if lontano else ''} |")

        out += ["", "## 4. I finali", "", "| Zona | Esito | Condizione | Frase |", "|---|---|---|---|"]
        for zona, esito, cond, testo in self.finali:
            c = re.sub(r"\s+", " ", cond).replace("|", "/")
            out.append(f"| {zona} | {esito} | {c[:110]} | {testo[:90]} |")

        out += ["", "## 5. In sintesi", "",
                f"- Variabili dichiarate: {len(self.variabili)} (di cui {len(SCORTE)} scorte del corpo).",
                f"- **Conseguenze a distanza** (variabili lette in una zona successiva): {len(lontane)}."]
        for k, dove_scrive, dove in lontane:
            out.append(f"  - `{k}`: si scrive in {dove_scrive}, torna in {', '.join(dove)}.")
        out.append(f"- **Cose che contano lontano da dove nascono**: {len(portate)} — {', '.join(portate) or '—'}.")
        out.append(f"- **Variabili mai lette** (stato fantasma): {len(fantasmi)} — {', '.join(fantasmi) or '—'}.")
        return "\n".join(out) + "\n"


def main():
    m = Mappa()
    m.leggi()
    testo = m.resoconto()
    with open(USCITA, "w", encoding="utf-8", newline="\n") as f:
        f.write(testo)
    if "--stampa" in sys.argv:
        print(testo)
    print(f"Mappa scritta in {os.path.relpath(USCITA, RADICE)}")


if __name__ == "__main__":
    main()
