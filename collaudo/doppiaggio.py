"""Il banco della voce è completo, fresco e sano.

Il gioco suona un file Opus per parte (app/public/voce/<id>.opus, scritto da
strumenti/doppiaggio-banco.py); l'id è l'impronta di voce + testo. Questo collaudo
ricava dai .fav di OGGI le parti che devono avere una voce (lo stesso spezzamento di
strumenti/doppiaggio.py, trailer compreso) e controlla:

  1. ogni parte ha il suo audio, o è dichiarata muta col motivo (indice → «muti»): un
     testo cambiato nel gioco ha un id nuovo, e qui risulta senza audio;
  2. l'indice non ha parti che il gioco non dice più (audio scaduto);
  3. ogni file c'è, è un Ogg Opus vero, dura quanto dice l'indice, e nella cartella
     non c'è niente di più;
  4. le durate sono sensate per il testo (né una parola di trenta secondi né una
     descrizione di mezzo secondo: un file scambiato si vede qui);
  5. il volume: ogni blocco sta attorno al bersaglio e nessun picco tocca lo 0 dBFS
     (dal resoconto doppiaggio/banco.json; con ffmpeg, rimisurato sui file veri);
  6. il peso della voce nel pacchetto.

Uso:  python doppiaggio.py      (esce con 1 se qualcosa non va; ffmpeg è facoltativo)
"""
import importlib.util
import json
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
VOCE = os.path.join(RADICE, "app", "public", "voce")
BANCO = os.path.join(RADICE, "doppiaggio", "banco.json")
MANIFEST = os.path.join(RADICE, "doppiaggio", "manifest.json")
TOLLERANZA_LU = 2.0     # quanto un blocco può stare lontano dal bersaglio (Opus perde un poco sui soffi)
PICCO_VERO_MAX = -0.2   # dBTP
PESO_MAX_MB = 25.0
TOLLERANZA_MS = 25


def strumento_doppiaggio():
    spec = importlib.util.spec_from_file_location("doppiaggio_strumento",
                                                  os.path.join(RADICE, "strumenti", "doppiaggio.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def durata_ogg_opus(percorso):
    """Millisecondi di un Ogg Opus (ultima granule position meno il pre-skip), o un errore."""
    with open(percorso, "rb") as f:
        dati = f.read()
    pos, primo, granule = 0, None, None
    while pos < len(dati):
        if dati[pos:pos + 4] != b"OggS":
            return None, "pagina Ogg rovinata a %d" % pos
        g = struct.unpack_from("<q", dati, pos + 6)[0]
        n = dati[pos + 26]
        corpo = sum(dati[pos + 27:pos + 27 + n])
        inizio = pos + 27 + n
        if primo is None:
            primo = dati[inizio:inizio + corpo]
        if g >= 0:
            granule = g
        pos = inizio + corpo
    if not primo or not primo.startswith(b"OpusHead"):
        return None, "non è Opus"
    if granule is None:
        return None, "senza durata"
    preskip = struct.unpack_from("<H", primo, 10)[0]
    return round(1000 * (granule - preskip) / 48000), None


def loudness(percorsi):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as t:
        for p in percorsi:
            t.write("file '%s'\n" % p.replace("\\", "/"))
    try:
        e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-f", "concat", "-safe", "0", "-i", t.name,
                            "-af", "ebur128=peak=true:framelog=quiet", "-f", "null", "-"],
                           capture_output=True).stderr.decode("utf-8", "replace")
    finally:
        os.unlink(t.name)
    i = re.findall(r"I:\s+(-?[\d.]+) LUFS", e)
    p = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", e)
    return (float(i[-1]), float(p[-1])) if i and p else (None, None)


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    esiti = []

    def esito(ok, testo, dettagli=()):
        esiti.append(ok)
        print(("OK " if ok else "KO ") + testo)
        for d in list(dettagli)[:12]:
            print("     " + d)
        if len(dettagli) > 12:
            print("     … e altre %d" % (len(dettagli) - 12))

    with open(os.path.join(VOCE, "indice.json"), encoding="utf-8") as f:
        indice = json.load(f)
    parti = indice["parti"]
    est = indice["estensione"]
    muti = {i: motivo for motivo, ids in indice.get("muti", {}).items() for i in ids}

    # 1-2. le parti che il gioco di oggi dice, contro l'indice
    S = strumento_doppiaggio()
    unita = S.costruisci_tutto()["unita"]
    serve = set(unita)
    mancano = sorted(serve - set(parti) - set(muti))
    esito(not mancano, "ogni parte che il gioco dice ha la sua voce o è dichiarata muta (%d parti, %d mute)" % (
        len(serve), len(muti)),
        ["%s %s: «%s»" % (i, unita[i]["voce"], unita[i]["testo"][:70]) for i in mancano])
    scadute = sorted((set(parti) | set(muti)) - serve)
    esito(not scadute, "nessun audio scaduto (parti che il gioco non dice più)", scadute)
    doppie = sorted(set(parti) & set(muti))
    esito(not doppie, "nessuna parte è insieme suonata e muta", doppie)

    # 3. i file
    presenti = {f[:-len(est)] for f in os.listdir(VOCE) if f.endswith(est)}
    altri = sorted(f for f in os.listdir(VOCE)
                   if os.path.isfile(os.path.join(VOCE, f)) and not f.endswith(est) and f != "indice.json")
    esito(set(parti) <= presenti and not (presenti - set(parti)) and not altri,
          "la cartella della voce è l'indice: %d file" % len(presenti),
          ["manca %s%s" % (i, est) for i in sorted(set(parti) - presenti)] +
          ["di troppo %s%s" % (i, est) for i in sorted(presenti - set(parti))] + ["di troppo %s" % f for f in altri])
    storti = []
    for i, ms in sorted(parti.items()):
        if i not in presenti:
            continue
        d, errore = durata_ogg_opus(os.path.join(VOCE, i + est))
        if errore:
            storti.append("%s: %s" % (i, errore))
        elif abs(d - ms) > TOLLERANZA_MS:
            storti.append("%s: dura %d ms, l'indice dice %d" % (i, d, ms))
    esito(not storti, "ogni file è un Ogg Opus e dura quanto dice l'indice (±%d ms)" % TOLLERANZA_MS, storti)

    # 4. durate sensate per il testo
    strane = []
    for i, ms in sorted(parti.items()):
        if i not in unita:
            continue
        n, s = unita[i]["parole"], ms / 1000
        if s < 0.25 or s > 40 or not (0.3 <= n / s <= 7.0) or (n >= 5 and not (1.0 <= n / s <= 6.5)):
            strane.append("%s: %d parole in %.2f s «%s»" % (i, n, s, unita[i]["testo"][:60]))
    esito(not strane, "le durate tornano col testo (fra 0,3 e 7 parole al secondo)", strane)

    # 5. il volume
    with open(BANCO, encoding="utf-8") as f:
        banco = json.load(f)
    bersaglio = banco["parametri"]["bersaglio_lufs"]
    fuori = ["%s: %.1f LUFS, picco vero %.1f dBTP" % (b, r["lufs_dopo"], r["picco_vero_dbtp"])
             for b, r in banco["blocchi"].items()
             if abs(r["lufs_dopo"] - bersaglio) > TOLLERANZA_LU or r["picco_vero_dbtp"] > PICCO_VERO_MAX]
    esito(not fuori, "il resoconto del banco: ogni blocco a %.0f ±%.0f LUFS, picchi sotto %.1f dBTP" % (
        bersaglio, TOLLERANZA_LU, PICCO_VERO_MAX), fuori)
    if shutil.which("ffmpeg"):
        with open(MANIFEST, encoding="utf-8") as f:
            blocchi = json.load(f)["blocchi"]
        fuori = []
        for b, v in blocchi.items():
            file = [os.path.join(VOCE, i + est) for i in v["parti"] if i in parti]
            if not file:
                continue
            lufs, picco = loudness(file)
            if lufs is None or abs(lufs - bersaglio) > TOLLERANZA_LU or picco > PICCO_VERO_MAX:
                fuori.append("%s: %s LUFS, picco vero %s dBTP" % (b, lufs, picco))
        esito(not fuori, "rimisurati sui file veri: ogni blocco a %.0f ±%.0f LUFS, picchi sotto %.1f dBTP" % (
            bersaglio, TOLLERANZA_LU, PICCO_VERO_MAX), fuori)
    else:
        print("-- senza ffmpeg: il volume non si rimisura sui file (resta il controllo del resoconto)")

    # 6. il peso
    mb = sum(os.path.getsize(os.path.join(VOCE, i + est)) for i in presenti) / 1048576
    esito(mb <= PESO_MAX_MB, "la voce pesa %.1f MB nel pacchetto (tetto %.0f)" % (mb, PESO_MAX_MB))
    for motivo, ids in indice.get("muti", {}).items():
        print("-- %d parti mute: %s" % (len(ids), motivo))

    tutto_ok = all(esiti)
    print("TUTTO OK" if tutto_ok else "CI SONO FALLIMENTI")
    return 0 if tutto_ok else 1


if __name__ == "__main__":
    sys.exit(main())
