"""Quale blocco è ogni WAV scaricato da AI Studio?

I WAV hanno il nome dell'ora (Generated Audio …1_04PM.wav), non del blocco. Questo programma
trascrive ogni WAV (con faster-whisper, come doppiaggio-taglia.py: la trascrizione si tiene
in <cartella>/trascrizioni/), confronta l'inizio e la fine del parlato con quelli di ogni
blocco di doppiaggio/blocchi/ e dice a quale somiglia di più. Dice anche quali blocchi non
hanno nessun WAV (mancano) e quali ne hanno più d'uno (doppioni, o un blocco diviso in due).

Uso:  python strumenti/doppiaggio-riconosci.py doppiaggio/master/enzo-grezzi/*.wav
      python strumenti/doppiaggio-riconosci.py a.wav b.wav --voce narratore
"""
import argparse
import difflib
import importlib.util
import json
import os
import sys
import wave

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARTELLA = os.path.join(RADICE, "doppiaggio")
N = 40  # quante parole dell'inizio e della fine si confrontano


def carica_taglia():
    spec = importlib.util.spec_from_file_location("taglia", os.path.join(RADICE, "strumenti", "doppiaggio-taglia.py"))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def somiglianza(a, b):
    return difflib.SequenceMatcher(None, " ".join(a), " ".join(b)).ratio()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("wav", nargs="+")
    ap.add_argument("--voce", help="confronta solo con i blocchi di questa voce (narratore, servizio…)")
    ap.add_argument("--lingua", choices=["it", "en"], default="it",
                    help="en: i blocchi inglesi di doppiaggio/en/manifest.json (il trailer, dove ogni tono ha il suo WAV, "
                         "si confronta tono per tono: trailer-solenne, trailer-enfatico…)")
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")
    tg = carica_taglia()
    en = a.lingua == "en"
    if en:
        tg.LINGUA = "en"
    with open(os.path.join(CARTELLA, "en" if en else "", "manifest.json"), encoding="utf-8") as f:
        man = json.load(f)
    blocchi = {}
    tutti = dict(man["blocchi"])
    if en and "servizio" in man:   # Kira in inglese sta a parte nel manifest (chiave «servizio»): blocchi kira-*
        tutti.update(man["servizio"]["blocchi"])
        man["unita"] = {**man["unita"], **man["servizio"]["unita"]}
    if en and "personaggi" in man:   # i personaggi di ElevenLabs in inglese stanno a parte (chiave «personaggi»): blocchi imma, rosaria, tore, vito
        tutti.update(man["personaggi"]["blocchi"])
        man["unita"] = {**man["unita"], **man["personaggi"]["unita"]}
    for nome, b in tutti.items():
        if a.voce and not (nome == a.voce or nome.startswith(a.voce + "-") or b.get("voce", "narratore") == a.voce):
            continue
        if en and nome == "trailer":   # un WAV per tono: si riconosce ogni gruppo da sé
            toni = list(dict.fromkeys(man["unita"][i]["tono"] for i in b["parti"]))
            for tono in toni:
                toks = [g for i in b["parti"] if man["unita"][i]["tono"] == tono for g in tg.gettoni(man["unita"][i]["testo"])]
                blocchi["trailer-" + tono] = (toks, 0.0)
            continue
        toks = [g for i in b["parti"] for g in tg.gettoni(man["unita"][i]["testo"])]
        blocchi[nome] = (toks, b["minuti_stimati"])

    esiti = {}
    for w in sorted(a.wav):
        w = os.path.abspath(w)
        toks = [g for p, _, _ in tg.trascrivi(w) for g in tg.gettoni(p)]
        with wave.open(w) as wv:
            minuti = wv.getnframes() / wv.getframerate() / 60
        punti = []
        for nome, (bt, stim) in blocchi.items():
            s = (somiglianza(toks[:N], bt[:N]) + somiglianza(toks[-N:], bt[-N:])) / 2
            punti.append((s, nome, stim, len(toks) / max(len(bt), 1)))
        punti.sort(reverse=True)
        s1, n1, stim, rapporto = punti[0]
        s2, n2 = punti[1][0], punti[1][1]
        esiti[w] = n1
        print("%-26s %5.1f min  →  %-18s (inizio+fine %3d%%, stimati %.1f min, parole %3d%% del testo)  [2° %s %d%%]" % (
            os.path.basename(w), minuti, n1, round(100 * s1), stim, round(100 * rapporto), n2, round(100 * s2)))
    per_blocco = {}
    for w, n in esiti.items():
        per_blocco.setdefault(n, []).append(os.path.basename(w))
    mancano = [n for n in blocchi if n not in per_blocco]
    doppi = {n: ws for n, ws in per_blocco.items() if len(ws) > 1}
    print()
    print("blocchi senza WAV:", ", ".join(mancano) if mancano else "nessuno")
    print("blocchi con più WAV:", "; ".join("%s: %s" % (n, ", ".join(ws)) for n, ws in doppi.items()) if doppi else "nessuno")


if __name__ == "__main__":
    main()
