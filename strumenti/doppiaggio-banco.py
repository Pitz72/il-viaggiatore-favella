"""Il banco della voce: dalle parti tagliate ai file che il gioco suona.

Prende le parti tagliate da doppiaggio-taglia.py (doppiaggio/master/clip/<blocco>/<id>.wav, fuori
da git) e scrive in app/public/voce/ un file Opus per parte, con un indice. Per ogni blocco del
manifest (una generazione: una voce, un tono di fondo, un livello):

  1. prende SOLO le parti del blocco: non le cartelle archiviate (tore-gemini, vito-gemini, la
     vecchia servizio-kira) né le parti «fuori_uso» (le 81 scelte di riserva nell'audio di Kira);
  2. toglie il silenzio in testa e in coda (lascia TESTA e CODA secondi attorno al parlato);
  3. pareggia il volume: misura la loudness integrata del blocco (EBU R128, con ffmpeg) e porta
     tutte le sue parti a BERSAGLIO LUFS con lo stesso guadagno, così dentro un blocco un sussurro
     resta più piano di un grido; una parte che col guadagno supererebbe PICCO_MAX dBFS si alza
     di meno (non si comprime niente);
  4. codifica in Opus mono BITRATE (Ogg, deterministico: lo stesso ingresso dà gli stessi byte);
     una parte che decodificata supera PICCO_DOPO dBFS si ricodifica un poco più piano;
  5. scrive l'indice (id → durata in millisecondi; il testo e la voce di ogni parte, per ritrovarla
     dal testo stampato) e misura di nuovo i file codificati.

I blocchi di A_PARTE (Imma, Rosaria, Tore e Vito, fatti con ElevenLabs sul piano gratuito) vanno in
app/public/voce/elevenlabs/, con un indice loro: sono distribuiti col gioco ma ESCLUSI dalla licenza
CC BY-SA (solo uso non commerciale, «elevenlabs.io»: LICENSE-CONTENUTI.md). Scelta di Simone del
20/10/2026, sera, accettando il rischio (piano 08, decisione 6). L'indice principale nomina le cartelle
a parte («cartelle»), così l'app e i collaudi sanno dove cercare. In inglese (--lingua en) è lo stesso: i
quattro personaggi inglesi (chiave «personaggi» del manifest inglese) vanno in app/public/voce/en/elevenlabs/,
con l'indice e la licenza loro, e l'indice inglese li nomina.

Uso:  python strumenti/doppiaggio-banco.py            (tutto: scrive app/public/voce/ e doppiaggio/banco.json)
      python strumenti/doppiaggio-banco.py --misura   (solo la loudness di ogni blocco, non scrive niente)

Serve ffmpeg con libopus. Non scarica niente.
"""
import argparse
import concurrent.futures
import json
import os
import re
import subprocess
import sys
import tempfile
import wave

import numpy as np

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOPPIAGGIO = os.path.join(RADICE, "doppiaggio")
CLIP = os.path.join(DOPPIAGGIO, "master", "clip")
USCITA = os.path.join(RADICE, "app", "public", "voce")
A_PARTE_DIR = "elevenlabs"
A_PARTE_CARTELLA = os.path.join(USCITA, A_PARTE_DIR)
RESOCONTO = os.path.join(DOPPIAGGIO, "banco.json")

# LUFS integrati per blocco: EBU R128. Le voci escono con picchi alti rispetto alla loudness (il
# narratore ha i picchi a -1 dBFS e sta a -23 LUFS): a -18 quasi ogni sua parte avrebbe toccato il
# tetto dei picchi (594 su 878), a -23 sono 30, quasi tutte di meno di 1 dB (misurato il 20/10/2026).
BERSAGLIO = -23.0
PICCO_MAX = -1.5       # dBFS di picco dopo il guadagno, prima della codifica
PICCO_DOPO = -0.5      # dBFS di picco del file codificato, come lo suona il gioco
SILENZIO = -45.0       # dBFS (RMS su 10 ms): sotto è silenzio (il fondo delle clip sta fra -70 e -82)
TESTA = 0.04           # secondi lasciati prima del parlato
CODA = 0.08            # secondi lasciati dopo: le code delle vocali si spengono piano
DISSOLVENZA = 0.005    # secondi di dissolvenza ai bordi, contro i «clic»
BITRATE = "32k"
ESTENSIONE = ".opus"
# in italiano: i quattro del 20/10/2026, e dal 1/11/2026 tutti gli altri, rifatti con ElevenLabs al posto di Gemini: tutti e quattordici i personaggi
A_PARTE = ("imma", "rosaria", "tore", "vito", "nunzio", "saverio", "iole", "rocco", "peppe", "ciro", "pasquale", "onofrio", "cosimo", "concetta")
LICENZA_A_PARTE = ("Voci generate con ElevenLabs (elevenlabs.io), in parte sul piano gratuito e in parte con un abbonamento: "
                   "escluse dalla licenza CC BY-SA del gioco, solo uso non commerciale, finché i diritti dell'abbonamento non "
                   "sono verificati; chi fa un'opera derivata o un uso commerciale le toglie o le sostituisce (LICENSE-CONTENUTI.md).")
# In inglese i personaggi di ElevenLabs sono sette e non tutti dal piano gratuito (dal 1/11/2026 Simone ha un abbonamento): finché i
# diritti dell'abbonamento non sono verificati nei termini di ElevenLabs, tutti nella stessa cartella e con la stessa esclusione.
LICENZA_A_PARTE_EN = ("Voci generate con ElevenLabs (elevenlabs.io), in parte sul piano gratuito e in parte con un abbonamento: "
                      "escluse dalla licenza CC BY-SA del gioco, solo uso non commerciale, finché i diritti dell'abbonamento non "
                      "sono verificati; chi fa un'opera derivata o un uso commerciale le toglie o le sostituisce (LICENSE-CONTENUTI.md).")


def leggi_wav(percorso):
    with wave.open(percorso) as w:
        if w.getnchannels() != 1 or w.getsampwidth() != 2:
            raise SystemExit("%s: atteso mono a 16 bit" % percorso)
        x = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float64) / 32768.0
        return x, w.getframerate()


def rifila(x, sr):
    """La parte senza il silenzio in testa e in coda (più TESTA e CODA), con le dissolvenze."""
    f = int(0.01 * sr)
    n = len(x) // f
    if n == 0:
        return x
    rms = np.sqrt((x[:n * f].reshape(n, f) ** 2).mean(axis=1) + 1e-12)
    sopra = np.where(20 * np.log10(rms) > SILENZIO)[0]
    if len(sopra) == 0:
        raise ValueError("nessun parlato sopra %.0f dBFS" % SILENZIO)
    a = max(0, sopra[0] * f - int(TESTA * sr))
    b = min(len(x), (sopra[-1] + 1) * f + int(CODA * sr))
    y = x[a:b].copy()
    d = min(int(DISSOLVENZA * sr), len(y) // 2)
    rampa = np.linspace(0.0, 1.0, d, endpoint=False)
    y[:d] *= rampa
    y[len(y) - d:] *= rampa[::-1]
    return y


def pcm(x):
    return (np.clip(x, -1.0, 32767 / 32768) * 32768).round().astype("<i2").tobytes()


def ebur128(argomenti, ingresso=None):
    """(loudness integrata, picco vero) di ciò che ffmpeg legge con questi argomenti."""
    p = subprocess.run(["ffmpeg", "-hide_banner", "-nostats"] + argomenti +
                       ["-af", "ebur128=peak=true:framelog=quiet", "-f", "null", "-"],
                       input=ingresso, capture_output=True)
    err = p.stderr.decode("utf-8", "replace")
    i = re.findall(r"I:\s+(-?[\d.]+|-inf) LUFS", err)
    tp = re.findall(r"Peak:\s+(-?[\d.]+|-inf) dBFS", err)
    if p.returncode or not i:
        raise SystemExit("ffmpeg non ha misurato la loudness:\n" + err[-800:])
    return float(i[-1]), float(tp[-1]) if tp else None


def loudness_pcm(campioni, sr):
    return ebur128(["-f", "s16le", "-ar", str(sr), "-ac", "1", "-i", "pipe:"], pcm(campioni))


def loudness_file(percorsi):
    """Loudness dei file codificati messi in fila (il demuxer concat di ffmpeg)."""
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as t:
        for p in percorsi:
            t.write("file '%s'\n" % p.replace("\\", "/").replace("'", r"'\''"))
    try:
        return ebur128(["-f", "concat", "-safe", "0", "-i", t.name])
    finally:
        os.unlink(t.name)


def picco_decodificato(percorso):
    """Il picco (dBFS) del file Opus come lo suonerà il gioco."""
    p = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", percorso,
                        "-f", "f32le", "-ac", "1", "-"], capture_output=True)
    x = np.frombuffer(p.stdout, dtype="<f4")
    return 20 * np.log10(max(float(np.abs(x).max()), 1e-9)) if len(x) else -200.0


def codifica(campioni, sr, destinazione):
    """Codifica in Opus; se il file decodificato supera PICCO_DOPO (Opus, sui transitori secchi, può
    sforare il picco d'ingresso di un paio di dB) si ricodifica la parte un poco più piano.
    Restituisce i dB tolti."""
    tolti = 0.0
    for _ in range(4):
        p = subprocess.run(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
             "-f", "s16le", "-ar", str(sr), "-ac", "1", "-i", "pipe:",
             "-c:a", "libopus", "-b:a", BITRATE, "-vbr", "on", "-compression_level", "10",
             "-application", "audio", "-map_metadata", "-1",
             "-fflags", "+bitexact", "-flags:a", "+bitexact", destinazione],
            input=pcm(campioni * 10 ** (-tolti / 20)), capture_output=True)
        if p.returncode:
            raise SystemExit("ffmpeg non ha codificato %s:\n%s" % (destinazione, p.stderr.decode("utf-8", "replace")))
        sfora = picco_decodificato(destinazione) - PICCO_DOPO
        if sfora <= 0:
            return tolti
        tolti = round(tolti + sfora + 0.1, 2)
    raise SystemExit("%s: il picco resta sopra %.1f dBFS" % (destinazione, PICCO_DOPO))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--misura", action="store_true", help="misura soltanto, non scrive niente")
    ap.add_argument("--bersaglio", type=float, default=BERSAGLIO, help="LUFS per blocco (predefinito %(default)s)")
    ap.add_argument("--lingua", choices=["it", "en"], default="it",
                    help="en: il narratore e Kira in inglese (doppiaggio/en/manifest.json, parti in master/clip/en-<blocco>/, "
                         "file in app/public/voce/en/, resoconto in doppiaggio/en/banco.json); il trailer inglese ha la sua "
                         "traccia (doppiaggio-trailer.py --lingua en)")
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")
    en = a.lingua == "en"
    global USCITA, RESOCONTO, A_PARTE_CARTELLA, A_PARTE
    if en:   # in inglese: la cartella a parte (le voci ElevenLabs) sta dentro la cartella inglese
        USCITA = os.path.join(USCITA, "en")
        RESOCONTO = os.path.join(DOPPIAGGIO, "en", "banco.json")
        A_PARTE_CARTELLA = os.path.join(USCITA, A_PARTE_DIR)
        os.makedirs(USCITA, exist_ok=True)

    with open(os.path.join(DOPPIAGGIO, "en" if en else "", "manifest.json"), encoding="utf-8") as f:
        man = json.load(f)
    tutti = dict(man["blocchi"])
    if en:   # i personaggi di ElevenLabs in inglese sono quelli del manifest inglese (chiave «personaggi»)
        A_PARTE = tuple(man.get("personaggi", {}).get("blocchi", {}))
    corrispondenze = dict(man.get("corrispondenze", {}))
    if en and "servizio" in man:   # Kira in inglese sta a parte nel manifest (chiave «servizio»): blocchi kira-*
        tutti.update({nome: dict(b, voce="servizio") for nome, b in man["servizio"]["blocchi"].items()})
        corrispondenze.update(man["servizio"]["corrispondenze"])
    if en and "personaggi" in man:   # i personaggi di ElevenLabs in inglese: chiave «personaggi», blocchi imma, rosaria, tore, vito
        tutti.update(man["personaggi"]["blocchi"])
        corrispondenze.update(man["personaggi"]["corrispondenze"])

    # 1-2. le parti di ogni blocco, rifilate
    blocchi = {}
    for nome, b in tutti.items():
        if en and nome == "trailer":
            continue   # la voce del trailer inglese è una traccia sola, fatta dalle sue clip
        if not en and not b.get("generato"):
            raise SystemExit("blocco %s: non ancora generato" % nome)
        parti = []
        for i in b["parti"]:
            p = os.path.join(CLIP, ("en-" if en else "") + nome, i + ".wav")
            if not os.path.exists(p):
                raise SystemExit("manca la parte tagliata %s" % os.path.relpath(p, RADICE))
            x, sr = leggi_wav(p)
            try:
                y = rifila(x, sr)
            except ValueError as e:
                raise SystemExit("%s: %s" % (os.path.relpath(p, RADICE), e))
            parti.append((i, y, sr))
        blocchi[nome] = parti

    # 3. il guadagno di ogni blocco
    resoconto = {}
    for nome, parti in blocchi.items():
        sr = parti[0][2]
        pausa = np.zeros(int(0.3 * sr))
        tutto = np.concatenate([z for _, y, _ in parti for z in (y, pausa)])
        lufs, _ = loudness_pcm(tutto, sr)
        guadagno = a.bersaglio - lufs
        limitate = []
        for k, (i, y, sr) in enumerate(parti):
            picco = 20 * np.log10(max(np.abs(y).max(), 1e-9))
            g = min(guadagno, PICCO_MAX - picco)
            if g < guadagno - 0.05:
                limitate.append(round(guadagno - g, 1))
            parti[k] = (i, y * 10 ** (g / 20), sr)
        resoconto[nome] = {"voce": tutti[nome].get("voce", "narratore"), "parti": len(parti),
                           "lufs_prima": round(lufs, 1), "guadagno_db": round(guadagno, 1),
                           "parti_alzate_di_meno": len(limitate),
                           "al_massimo_db_in_meno": max(limitate) if limitate else 0.0,
                           "secondi": round(sum(len(y) / sr for _, y, sr in parti), 1)}
        if nome in A_PARTE:
            resoconto[nome]["cartella"] = A_PARTE_DIR
        print("%-18s %3d parti  %6.1f LUFS  %+5.1f dB  %2d alzate di meno (fino a %.1f dB)" % (
            nome, len(parti), lufs, guadagno, len(limitate), max(limitate) if limitate else 0.0))
    if a.misura:
        return

    # 4. la codifica (in parallelo: un ffmpeg per parte)
    if not en or any(n in A_PARTE for n in blocchi):
        os.makedirs(A_PARTE_CARTELLA, exist_ok=True)
    lavori, indice, indice_a_parte, blocco_di = [], {}, {}, {}
    for nome, parti in blocchi.items():
        cartella = A_PARTE_CARTELLA if nome in A_PARTE else USCITA
        for i, y, sr in parti:
            ms = round(1000 * len(y) / sr)
            if nome in A_PARTE:
                indice_a_parte[i] = ms
            else:
                indice[i] = ms
            lavori.append((y, sr, os.path.join(cartella, i + ESTENSIONE)))
            blocco_di[i] = nome
    with concurrent.futures.ThreadPoolExecutor(max_workers=os.cpu_count() or 4) as ex:
        tolti = list(ex.map(lambda t: codifica(*t), lavori))
    for (_, _, dest), t in zip(lavori, tolti):
        if t:
            r = resoconto[blocco_di[os.path.basename(dest)[:-len(ESTENSIONE)]]]
            r["ricodificate_piu_piano"] = r.get("ricodificate_piu_piano", 0) + 1
            print("ricodificata più piano di %.1f dB: %s" % (t, os.path.relpath(dest, RADICE)))

    # i file che non sono più di nessuna parte se ne vanno: la cartella è l'indice (solo i file col nome di
    # una parte, otto cifre esadecimali: trailer.opus è di strumenti/doppiaggio-trailer.py e resta)
    # (in inglese la cartella inglese e la sua cartella a parte: mai quelle dell'italiano)
    for cartella, ids in ((USCITA, indice), (A_PARTE_CARTELLA, indice_a_parte)):
        if not os.path.isdir(cartella):
            continue
        for f in os.listdir(cartella):
            if re.fullmatch(r"[0-9a-f]{8}" + re.escape(ESTENSIONE), f) and f[:-len(ESTENSIONE)] not in ids:
                os.remove(os.path.join(cartella, f))

    def scrivi(percorso, dati):
        with open(percorso, "w", encoding="utf-8", newline="\n") as f:
            json.dump(dati, f, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
            f.write("\n")

    # il testo di ogni parte (anche di quelle a parte e del trailer): l'app ritrova le parti dal testo
    # che il motore stampa, spezzato e normalizzato come in doppiaggio.py (app/src/gioco/parti.ts)
    if en:
        # le parti inglesi si ritrovano dall'id italiano della parte (il diario resta in italiano): l'indice dice,
        # per ogni parte italiana del narratore, la sua registrazione inglese
        dati = {"formato": 1, "estensione": ESTENSIONE, "lingua": "en", "parti": indice,
                "corrispondenze": {ii: ei for ii, ei in corrispondenze.items() if ei in indice or ei in indice_a_parte}}
        if indice_a_parte:   # le voci ElevenLabs inglesi: cartella a parte, con la sua licenza
            dati["cartelle"] = [A_PARTE_DIR]
            scrivi(os.path.join(A_PARTE_CARTELLA, "indice.json"),
                   {"formato": 1, "estensione": ESTENSIONE, "parti": indice_a_parte, "licenza": LICENZA_A_PARTE_EN})
        scrivi(os.path.join(USCITA, "indice.json"), dati)
    else:
        testi = {i: [man["unita"][i]["voce"], man["unita"][i]["testo"]] for i in list(indice) + list(indice_a_parte)}
        scrivi(os.path.join(USCITA, "indice.json"),
               {"formato": 1, "estensione": ESTENSIONE, "parti": indice, "cartelle": [A_PARTE_DIR], "testi": testi})
        scrivi(os.path.join(A_PARTE_CARTELLA, "indice.json"),
               {"formato": 1, "estensione": ESTENSIONE, "parti": indice_a_parte, "licenza": LICENZA_A_PARTE})

    # 5. di nuovo la loudness, sui file codificati
    for nome, parti in blocchi.items():
        cartella = A_PARTE_CARTELLA if nome in A_PARTE else USCITA
        file = [os.path.join(cartella, i + ESTENSIONE) for i, _, _ in parti]
        lufs, picco = loudness_file(file)
        resoconto[nome].update({"lufs_dopo": round(lufs, 1), "picco_vero_dbtp": picco,
                                "kb": round(sum(os.path.getsize(p) for p in file) / 1024)})
    peso = lambda c: sum(os.path.getsize(os.path.join(c, f)) for f in os.listdir(c) if f.endswith(ESTENSIONE)) if os.path.isdir(c) else 0
    # in inglese come in italiano: la cartella principale (narratore, Kira; il trailer ha la sua traccia) e quella a parte
    totale = {"parti": len(indice) + len(indice_a_parte), "parti_a_parte": len(indice_a_parte),
              "minuti": round((sum(indice.values()) + sum(indice_a_parte.values())) / 60000, 1),
              "minuti_a_parte": round(sum(indice_a_parte.values()) / 60000, 1),
              "mb": round((peso(USCITA) + peso(A_PARTE_CARTELLA)) / 1048576, 2),
              "mb_a_parte": round(peso(A_PARTE_CARTELLA) / 1048576, 2)}
    with open(RESOCONTO, "w", encoding="utf-8", newline="\n") as f:
        json.dump({"parametri": {"bersaglio_lufs": a.bersaglio, "picco_max_dbfs": PICCO_MAX,
                                 "picco_dopo_dbfs": PICCO_DOPO, "silenzio_dbfs": SILENZIO, "testa_s": TESTA, "coda_s": CODA,
                                 "opus": BITRATE + " mono, VBR"},
                   "totale": totale, "blocchi": resoconto}, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print()
    for nome, r in resoconto.items():
        print("%-18s dopo: %6.1f LUFS, picco vero %5.1f dBTP, %5d KB%s" % (
            nome, r["lufs_dopo"], r["picco_vero_dbtp"], r["kb"], "  (%s/)" % A_PARTE_DIR if nome in A_PARTE else ""))
    print("\nin tutto: %d parti, %.1f minuti, %.2f MB; di cui in %s/ (fuori dalla licenza libera): %d parti, %.1f minuti, %.2f MB" % (
        totale["parti"], totale["minuti"], totale["mb"], A_PARTE_DIR, totale["parti_a_parte"],
        totale["minuti_a_parte"], totale["mb_a_parte"]))


if __name__ == "__main__":
    main()
