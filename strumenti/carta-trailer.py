"""La carta del gioco per il trailer: app/src/trailer/carta.json.

Il trailer mostra la «Carta fisica della provincia», la stessa mappa che si apre in partita. In partita la carta (i
luoghi col loro posto sulla griglia, e le strade) la dà il motore (fav_mappa, in app/src/lib/ponte.py); il trailer gira
prima che il motore sia avviato, e ne tiene una copia. Questo strumento la riscrive dal motore vero; il collaudo
(collaudo/mappa.py) pretende che la copia sia uguale, così se l'avventura cambia la carta il trailer non resta indietro.

Uso:  python strumenti/carta-trailer.py             riscrive la copia
      python strumenti/carta-trailer.py controlla   esce con 1 se la copia non è quella del motore
"""
import importlib.util
import json
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RADICE, "motore"))
PONTE = os.path.join(RADICE, "app", "src", "lib", "ponte.py")
GIOCO = os.path.join(RADICE, "prototipo", "il-viaggiatore.fav")
COPIA = os.path.join(RADICE, "app", "src", "trailer", "carta.json")


def carta_del_motore():
    spec = importlib.util.spec_from_file_location("ponte_carta", PONTE)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.fav_boot(GIOCO)
    return json.loads(mod.fav_mappa())


def come_testo(carta):
    """Un luogo e una strada per riga: le differenze si leggono in un diff."""
    luoghi = ",\n".join("    " + json.dumps(l, ensure_ascii=False) for l in carta["luoghi"])
    strade = ",\n".join("    " + json.dumps(s, ensure_ascii=False) for s in carta["strade"])
    return '{\n  "luoghi": [\n' + luoghi + '\n  ],\n  "strade": [\n' + strade + "\n  ]\n}\n"


def main():
    carta = carta_del_motore()
    if "controlla" in sys.argv[1:]:
        try:
            with open(COPIA, encoding="utf-8") as f:
                copia = json.load(f)
        except (OSError, ValueError) as e:
            print(f"KO la copia della carta non si legge: {e}")
            return 1
        if copia != carta:
            print("KO la carta del trailer non è quella del gioco: python strumenti/carta-trailer.py")
            return 1
        print(f"ok la carta del trailer è quella del gioco ({len(carta['luoghi'])} luoghi, {len(carta['strade'])} strade)")
        return 0
    with open(COPIA, "wb") as f:                      # LF anche su Windows (.gitattributes)
        f.write(come_testo(carta).encode("utf-8"))
    print(f"scritta {os.path.relpath(COPIA, RADICE)}: {len(carta['luoghi'])} luoghi, {len(carta['strade'])} strade")
    return 0


if __name__ == "__main__":
    sys.exit(main())
