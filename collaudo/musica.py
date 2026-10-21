"""La musica delle zone e la colonna sonora da scaricare (pre-produzione/10-musiche.md).

Che cosa si pretende:
  · ogni zona del gioco (quelle di app/src/data/viaggiatore.ts, ROOM_ZONE) ha il suo brano nell'indice
    (app/public/musica/indice.json), col titolo del brano dell'album;
  · il giro di ogni brano sta dentro il file: 0 < inizio < fine < durata, lungo almeno un minuto, con la coda
    di mezzo secondo dopo la fine (strumenti/colonna-sonora.py);
  · l'album (app/public/colonna-sonora/album.json) elenca i sette brani nell'ordine delle zone, la copertina e
    il LEGGIMI; ogni file c'è e ha un nome semplice (il desktop li copia per nome);
  · lo ZIP che la versione web compone (app/src/lib/zip.ts, in Node con app/scripts/zip-node.mjs) si apre
    con zipfile, coi nomi in UTF-8 e i contenuti identici;
  · con ffmpeg: gli MP3 hanno titolo, numero, album «Il Viaggiatore Official Soundtrack», autore The Runtimers
    e la copertina; ogni versione per il gioco dura quanto dice l'indice; alla giuntura (da «fine» a «inizio»)
    gli ultimi istanti prima del salto ricalcano quelli prima dell'inizio, e il cambio di timbro al salto non
    supera quello normale del brano; il giro sta a −23 LUFS (±1), come le voci.

Uso:  python musica.py      (esce con 1 se qualcosa non va; ffmpeg è facoltativo, serve `npm ci` in app/)
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
MUSICA = os.path.join(RADICE, "app", "public", "musica")
ALBUM = os.path.join(RADICE, "app", "public", "colonna-sonora")
SR = 48000

esiti = []


def prova(nome, ok, dettaglio=""):
    esiti.append(bool(ok))
    print(f"{'OK ' if ok else 'KO '}{nome}" + (f"\n     → {dettaglio}" if dettaglio and not ok else ""))


def zone_del_gioco():
    testo = open(os.path.join(RADICE, "app", "src", "data", "viaggiatore.ts"), encoding="utf-8").read()
    blocco = testo[testo.index("export const ROOM_ZONE"):]
    blocco = blocco[:blocco.index("};")]
    return sorted(set(re.findall(r'"(z\d)"', blocco)))


def main():
    indice = json.load(open(os.path.join(MUSICA, "indice.json"), encoding="utf-8"))
    album = json.load(open(os.path.join(ALBUM, "album.json"), encoding="utf-8"))
    zone = zone_del_gioco()

    # ── l'indice e l'album ──────────────────────────────────────────────────
    prova(f"ogni zona del gioco ({len(zone)}) ha il suo brano, e nessun brano è di una zona che non c'è",
          sorted(indice["zone"]) == zone, f"zone {zone}, indice {sorted(indice['zone'])}")
    brani = {b["zona"]: b for b in album["brani"]}
    prova("l'album ha sette brani, nell'ordine delle zone, numerati da 1",
          [b["zona"] for b in album["brani"]] == zone and [b["numero"] for b in album["brani"]] == list(range(1, 8)))
    prova("il titolo di ogni brano nel gioco è quello dell'album",
          all(indice["zone"][z]["titolo"] == brani[z]["titolo"] for z in zone if z in brani))
    storti = [z for z, v in indice["zone"].items()
              if not (0 < v["inizio"] < v["fine"] < v["durata"]) or v["fine"] - v["inizio"] < 60 or not (0.45 <= v["durata"] - v["fine"] <= 0.6)]
    prova("ogni giro sta dentro il suo file, dura almeno un minuto e ha la coda di mezzo secondo", not storti, str(storti))
    prova("i file delle zone ci sono", all(os.path.exists(os.path.join(MUSICA, v["file"])) for v in indice["zone"].values()))
    nome_buono = re.compile(r'^[^\\/:*?"<>|]+\.(mp3|jpg|txt)$')
    prova("l'album elenca i sette MP3, la copertina e il LEGGIMI, con nomi semplici, e ci sono tutti",
          album["file"] == [b["file"] for b in album["brani"]] + ["copertina.jpg", "LEGGIMI.txt"]
          and all(nome_buono.match(f) and os.path.exists(os.path.join(ALBUM, f)) for f in album["file"]))
    leggimi = open(os.path.join(ALBUM, "LEGGIMI.txt"), encoding="utf-8").read()
    prova("il LEGGIMI nomina autore, Lyria e la licenza, e ogni titolo",
          "The Runtimers" in leggimi and "Lyria" in leggimi and "CC BY-SA" in leggimi and all(b["titolo"] in leggimi for b in album["brani"]))

    # ── lo ZIP della versione web ───────────────────────────────────────────
    with tempfile.TemporaryDirectory() as tmp:
        prova_utf8 = os.path.join(tmp, "Acqua ovunque, niente da bere — città.txt")
        with open(prova_utf8, "w", encoding="utf-8") as fh:
            fh.write("una prova\n" * 50)
        file = [os.path.join(ALBUM, "copertina.jpg"), os.path.join(ALBUM, "LEGGIMI.txt"), prova_utf8]
        uscita = os.path.join(tmp, "prova.zip")
        r = subprocess.run(["node", os.path.join(RADICE, "app", "scripts", "zip-node.mjs"), uscita, *file], capture_output=True, text=True)
        ok, dett = r.returncode == 0, r.stderr[-300:]
        if ok:
            with zipfile.ZipFile(uscita) as z:
                ok = z.testzip() is None and len(z.namelist()) == 3
                for f in file:
                    nome = "Il Viaggiatore - Official Soundtrack/" + os.path.basename(f)
                    ok &= nome in z.namelist() and z.read(nome) == open(f, "rb").read()
                dett = str(z.namelist())
        prova("lo ZIP della versione web si apre, coi nomi in UTF-8 (virgole e accenti) e i contenuti identici", ok, dett)

    if not shutil.which("ffmpeg"):
        print("-- senza ffmpeg: etichette, durate, giunture e volume non si misurano")
        return finisci()

    # ── gli MP3 dell'album ─────────────────────────────────────────────────
    sbagliati = []
    for b in album["brani"]:
        p = os.path.join(ALBUM, b["file"])
        info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format_tags:stream=codec_name,width,height",
                                          "-of", "json", p], capture_output=True, text=True).stdout)
        t = {k.lower(): v for k, v in info.get("format", {}).get("tags", {}).items()}
        copertina = [s for s in info.get("streams", []) if s.get("codec_name") == "mjpeg"]
        attese = {"title": b["titolo"], "artist": "The Runtimers", "album_artist": "The Runtimers",
                  "album": "Il Viaggiatore Official Soundtrack", "track": f"{b['numero']}/7"}
        diversi = {k: t.get(k) for k, v in attese.items() if t.get(k) != v}
        if diversi or not copertina or copertina[0].get("width") != 1400:
            sbagliati.append((b["file"], diversi, copertina[:1]))
    prova("ogni MP3 ha titolo, numero, album, autore e la copertina (1400×1400)", not sbagliati, str(sbagliati))

    # ── le versioni per il gioco: durate, giunture, volume ─────────────────
    import numpy as np
    frq = np.fft.rfftfreq(2048, 1 / SR)
    bordi = np.geomspace(60, 12000, 33)
    bande = [(frq >= bordi[k]) & (frq < bordi[k + 1]) for k in range(32)]

    def flusso(m):
        n = (len(m) - 2048) // 512
        w = np.hanning(2048)
        s = np.array([[10 * np.log10((np.abs(np.fft.rfft(m[i * 512:i * 512 + 2048] * w)) ** 2)[bb].sum() + 1e-9) for bb in bande]
                      for i in range(n)])
        return np.maximum(np.diff(s, axis=0), 0).sum(axis=1)

    for zona, v in indice["zone"].items():
        p = os.path.join(MUSICA, v["file"])
        durata = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                                      capture_output=True, text=True).stdout)
        pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True).stdout
        y = np.frombuffer(pcm, dtype=np.float32).reshape(-1, 2)
        m = y.mean(axis=1)
        a, b = int(round(v["inizio"] * SR)), int(round(v["fine"] * SR))
        w = int(0.1 * SR)
        somiglia = float(np.corrcoef(m[b - w:b], m[a - w:a])[0, 1])
        j = 3 * SR
        k = (j - 1024) // 512
        al_salto = flusso(np.concatenate([m[b - 3 * SR:b], m[a:a + 3 * SR]]))[k - 3:k + 3].max()
        normale = np.percentile(flusso(m[a:a + 20 * SR]), 99)
        e = subprocess.run(["ffmpeg", "-hide_banner", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-af", "ebur128", "-f", "null", "-"],
                           input=y[a:b].tobytes(), capture_output=True).stderr.decode("utf-8", "replace")
        lufs = float(e[e.rfind("Summary:"):].split("I:")[1].split("LUFS")[0])
        prova(f"{zona} «{v['titolo']}»: durata {durata:.2f} s, giro {v['inizio']:.1f}→{v['fine']:.1f} s, "
              f"giuntura {somiglia:.3f}, timbro al salto {al_salto:.0f} (normale fino a {normale:.0f}), {lufs:.1f} LUFS",
              abs(durata - v["durata"]) < 0.06 and somiglia > 0.98 and al_salto <= normale and abs(lufs + 23) <= 1,
              f"durata file {durata}, indice {v['durata']}")
    return finisci()


def finisci():
    tutto = all(esiti)
    print("\nTUTTO OK" if tutto else "\nCI SONO FALLIMENTI")
    return 0 if tutto else 1


if __name__ == "__main__":
    sys.exit(main())
