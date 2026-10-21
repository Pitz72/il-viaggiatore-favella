"""La colonna sonora: l'album da scaricare e le musiche delle zone nel gioco.

Sette brani di The Runtimers (generati con Lyria 3.5), uno per zona, in `app/public/colonna-sonora/`:
MP3 con titolo, numero, album «Il Viaggiatore Official Soundtrack», autore e copertina (il logo del gioco),
più `copertina.jpg`, `LEGGIMI.txt` e `album.json` (l'elenco dei file, che il menu Extra copia o impacchetta).
Da quelli, per il gioco, `app/public/musica/z1.opus … z7.opus` e `indice.json` coi punti di ripetizione.

Uso:
  python strumenti/colonna-sonora.py album <cartella con gli MP3 di Lyria>
        rinomina ed etichetta i sette brani (l'audio si copia così com'è) e ci mette la copertina
        (grafica/copertina-album.jpg)
  python strumenti/colonna-sonora.py anelli [--prova]
        sceglie in ogni brano il tratto da ripetere e scrive le versioni per il gioco; --prova stampa
        soltanto le scelte

IL TRATTO DA RIPETERE. Il gioco suona il brano una volta dall'inizio e poi ripete in tondo [A, B]:
  1. il corpo del brano: dove il volume (media su 3 s) sta entro 7 dB dal suo valore tipico; la dissolvenza
     finale e l'attacco lento restano fuori da B (l'attacco si sente solo la prima volta);
  2. A e B si cercano dove la musica si somiglia di più nei F secondi che li precedono (timbro su 32 bande e
     volume), preferendo il tratto più lungo, perché il giro non stanchi;
  3. B si sposta di qualche decimo perché le note cadano insieme (correlazione degli attacchi), poi di
     qualche campione perché le onde combacino;
  4. gli F secondi prima di B si sfumano (a potenza costante) dentro gli F secondi prima di A, e la sfumatura
     resta nel file: arrivati a B si torna ad A e la musica continua come se niente fosse. Il gioco salta al
     campione esatto (AudioBufferSourceNode, loopStart / loopEnd).
Il file finisce mezzo secondo dopo B (la continuazione da A), che non si suona: c'è solo perché nessun
decodificatore accorci il giro. Il volume di ogni versione va a −23 LUFS, come le voci, con il picco sotto
−1 dBTP; quanto debba stare sotto la voce lo decide il gioco.

Serve ffmpeg (con libopus e libmp3lame), numpy.
"""
import json
import os
import subprocess
import sys

import numpy as np

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
ALBUM = os.path.join(RADICE, "app", "public", "colonna-sonora")
MUSICA = os.path.join(RADICE, "app", "public", "musica")
COPERTINA = os.path.join(RADICE, "grafica", "copertina-album.jpg")

AUTORE = "The Runtimers"
TITOLO_ALBUM = "Il Viaggiatore Official Soundtrack"
ANNO = "2026"

# Nell'ordine in cui sono stati generati (dal più vecchio): è l'ordine delle zone.
BRANI = [
    ("z1", "Warm Stillness", "Dove finiscono i binari", "Acquaviva, il capolinea"),
    ("z2", "Heat Haze", "Il catrame che ondeggia", "La piana, il sole"),
    ("z3", "Brittle Salt", "Acqua ovunque, niente da bere", "L'invaso morto, il sale"),
    ("z4", "Latent Strain", "Il silenzio delle cose costruite", "La statale, il casello"),
    ("z5", "Olive Grove", "Il bicchiere tenuto da parte", "Il paese, i vivi"),
    ("z6", "Ancient Moor", "Il vento che non smette", "Le colline, la pietra"),
    ("z7", "Deep Stillness", "Cosa sei tornato a trovare", "Il guado, il fratello"),
]

SR = 48000
PASSO = 1024                # campioni fra due misure (21 ms)
FINESTRA = 4096
SFUMA = 4.0                 # secondi della sfumatura incisa prima di B
CODA = 0.5                  # secondi dopo B, mai suonati
BERSAGLIO_LUFS = -23.0
PICCO_MAX = -1.0            # dBTP
BITRATE = "96k"


def nome_file(i, titolo):
    return f"{i + 1:02d} - {titolo}.mp3"


# ── l'album ──────────────────────────────────────────────────────────────────
def album(cartella):
    if not os.path.exists(COPERTINA):
        sys.exit(f"Manca la copertina: {COPERTINA}")
    os.makedirs(ALBUM, exist_ok=True)
    for i, (zona, originale, titolo, luogo) in enumerate(BRANI):
        sorgente = os.path.join(cartella, originale + ".mp3")
        if not os.path.exists(sorgente):
            sys.exit(f"Manca {sorgente}")
        uscita = os.path.join(ALBUM, nome_file(i, titolo))
        subprocess.run([
            "ffmpeg", "-v", "error", "-y", "-i", sorgente, "-i", COPERTINA,
            "-map", "0:a", "-map", "1:v", "-c", "copy", "-map_metadata", "-1",
            "-id3v2_version", "3", "-write_id3v1", "1",
            "-metadata", f"title={titolo}", "-metadata", f"artist={AUTORE}", "-metadata", f"album_artist={AUTORE}",
            "-metadata", f"album={TITOLO_ALBUM}", "-metadata", f"track={i + 1}/{len(BRANI)}",
            "-metadata", f"date={ANNO}", "-metadata", "genre=Soundtrack",
            "-metadata", f"comment=Il Viaggiatore, zona {i + 1}: {luogo}",
            "-metadata:s:v", "title=Album cover", "-metadata:s:v", "comment=Cover (front)", "-disposition:v", "attached_pic",
            uscita,
        ], check=True)
        print(f"album: {nome_file(i, titolo)}  ← {originale}")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", COPERTINA, "-c", "copy", os.path.join(ALBUM, "copertina.jpg")], check=True)
    scaletta = "\n".join(f"  {i + 1}. {titolo} ({luogo})" for i, (_, _, titolo, luogo) in enumerate(BRANI))
    leggimi = f"""{TITOLO_ALBUM}
{AUTORE} · {ANNO}

La colonna sonora di «Il Viaggiatore», un gioco di Simone Pizzi: un brano per ciascuna delle sette
zone del viaggio, da Acquaviva ad Acquamorta.

{scaletta}

Musica: {AUTORE}, generata con Lyria 3.5 (Google).
Copertina: il logo del gioco (CC BY-SA 4.0).

I brani non sono coperti dalla licenza CC BY-SA 4.0 del gioco: per il loro uso valgono i termini di
Google per i contenuti generati con Lyria. Si ridistribuiscono come parte del gioco.

Il gioco: https://github.com/Pitz72/il-viaggiatore-favella
"""
    # a capo di Windows: il LEGGIMI si apre anche col Blocco note di una volta
    with open(os.path.join(ALBUM, "LEGGIMI.txt"), "w", encoding="utf-8", newline="\r\n") as fh:
        fh.write(leggimi)
    elenco = {"titolo": TITOLO_ALBUM, "autore": AUTORE, "anno": ANNO,
              "brani": [{"numero": i + 1, "titolo": t, "zona": z, "luogo": l, "file": nome_file(i, t)} for i, (z, _, t, l) in enumerate(BRANI)],
              "file": [nome_file(i, t) for i, (_, _, t, _) in enumerate(BRANI)] + ["copertina.jpg", "LEGGIMI.txt"]}
    with open(os.path.join(ALBUM, "album.json"), "w", encoding="utf-8", newline="\n") as fh:
        json.dump(elenco, fh, ensure_ascii=False, indent=1)
        fh.write("\n")


# ── i tratti da ripetere ─────────────────────────────────────────────────────
def leggi(percorso):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", percorso, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).reshape(-1, 2).copy()


def misure(mono):
    """Per ogni passo: energia in 32 bande (log, 60 Hz – 12 kHz), volume in dB, flusso degli attacchi."""
    n = 1 + (len(mono) - FINESTRA) // PASSO
    finestra = np.hanning(FINESTRA).astype(np.float32)
    frq = np.fft.rfftfreq(FINESTRA, 1 / SR)
    bordi = np.geomspace(60, 12000, 33)
    bande = [(frq >= bordi[k]) & (frq < bordi[k + 1]) for k in range(32)]
    spettro = np.empty((n, 32), dtype=np.float32)
    volume = np.empty(n, dtype=np.float32)
    for i in range(n):
        f = mono[i * PASSO: i * PASSO + FINESTRA]
        volume[i] = 10 * np.log10(np.mean(f * f) + 1e-12)
        m = np.abs(np.fft.rfft(f * finestra)) ** 2
        spettro[i] = [np.log10(m[b].sum() + 1e-10) for b in bande]
    attacchi = np.maximum(np.diff(spettro, axis=0, prepend=spettro[:1]), 0).sum(axis=1)
    return spettro, volume, attacchi


def liscia(v, secondi):
    k = max(1, int(secondi * SR / PASSO))
    return np.convolve(v, np.ones(k) / k, mode="same")


def scegli(x):
    """I punti A e B (in campioni) e quanto si somigliano."""
    mono = x.mean(axis=1)
    spettro, volume, attacchi = misure(mono)
    vol3 = liscia(volume, 3.0)
    tipico = np.median(vol3[int(len(vol3) * 0.2): int(len(vol3) * 0.8)])
    corpo = np.where(vol3 >= tipico - 7)[0]
    primo, ultimo = corpo[0], corpo[-1]
    f = int(SFUMA * SR / PASSO)
    passo_s = SR / PASSO
    a_min = max(primo, f + int(1 * passo_s))
    b_max = ultimo - int(1 * passo_s)
    durata_corpo = b_max - a_min
    norme = np.linalg.norm(spettro - spettro.mean(axis=1, keepdims=True), axis=1) + 1e-9
    centrato = (spettro - spettro.mean(axis=1, keepdims=True)) / norme[:, None]

    def somiglianza(a, b):
        sa, sb = centrato[a - f:a], centrato[b - f:b]
        timbro = float(np.mean(np.sum(sa * sb, axis=1)))
        livello = abs(float(np.mean(volume[a - f:a]) - np.mean(volume[b - f:b])))
        return timbro - 0.04 * livello

    migliore = None
    for a in range(a_min, a_min + min(int(40 * passo_s), durata_corpo // 3), 4):
        for b in range(b_max, max(a + int(0.55 * durata_corpo), b_max - int(40 * passo_s)), -4):
            s = somiglianza(a, b) + 0.15 * (b - a) / durata_corpo
            if migliore is None or s > migliore[0]:
                migliore = (s, a, b)
    _, a, b = migliore
    # le note insieme: B si sposta di ±0,5 s dove gli attacchi prima di B ricalcano quelli prima di A
    oa = attacchi[a - f:a] - attacchi[a - f:a].mean()
    meglio, scarto = -1e9, 0
    for d in range(-int(0.5 * passo_s), int(0.5 * passo_s) + 1):
        ob = attacchi[b + d - f:b + d]
        if b + d > b_max + int(0.5 * passo_s) or len(ob) != len(oa):
            continue
        c = float(np.dot(oa, ob - ob.mean()))
        if c > meglio:
            meglio, scarto = c, d
    a_s, b_s = a * PASSO, (b + scarto) * PASSO
    # le onde insieme: qualche campione, sulla parte grave (dove un salto si sentirebbe)
    w = int(0.05 * SR)
    ref = mono[a_s - w:a_s]
    migliore_c, sposta = -1e9, 0
    for d in range(-PASSO, PASSO + 1):
        seg = mono[b_s + d - w:b_s + d]
        c = float(np.dot(ref, seg))
        if c > migliore_c:
            migliore_c, sposta = c, d
    b_s += sposta
    return a_s, b_s, somiglianza(a, b + scarto), (primo * PASSO / SR, ultimo * PASSO / SR)


def incidi(x, a, b):
    """Il brano fino a B, con gli ultimi SFUMA secondi sfumati dentro quelli prima di A; più la coda."""
    f = int(SFUMA * SR)
    y = x[:b].copy()
    t = np.linspace(0, np.pi / 2, f, endpoint=False, dtype=np.float32)[:, None]
    y[b - f:b] = x[b - f:b] * np.cos(t) + x[a - f:a] * np.sin(t)
    coda = x[a:a + int(CODA * SR)]
    return np.concatenate([y, coda])


def misura_lufs(y, da, a):
    """Il volume integrato (LUFS) e il picco vero (dBTP) del tratto che si ripete, con ffmpeg."""
    seg = y[da:a].astype(np.float32).tobytes()
    r = subprocess.run(["ffmpeg", "-hide_banner", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                        "-af", "ebur128=peak=true", "-f", "null", "-"], input=seg, capture_output=True)
    testo = r.stderr.decode("utf-8", "replace")
    riassunto = testo[testo.rfind("Summary:"):]
    integrato = float(riassunto.split("I:")[1].split("LUFS")[0])
    picco = float(riassunto.split("Peak:")[1].split("dBFS")[0])
    return integrato, picco


def scrivi_opus(y, percorso):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    "-c:a", "libopus", "-b:a", BITRATE, "-vbr", "on", "-compression_level", "10", "-application", "audio",
                    "-map_metadata", "-1", percorso], input=y.astype(np.float32).tobytes(), check=True)


def durata_file(percorso):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", percorso],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def anelli(prova=False):
    os.makedirs(MUSICA, exist_ok=True)
    indice = {"formato": 1, "nota": "Musiche delle zone: il brano una volta dall'inizio, poi in tondo [inizio, fine] (secondi). "
              "Scritto da strumenti/colonna-sonora.py.", "zone": {}}
    for i, (zona, originale, titolo, luogo) in enumerate(BRANI):
        sorgente = os.path.join(ALBUM, nome_file(i, titolo))
        x = leggi(sorgente)
        a, b, somiglia, (corpo_da, corpo_a) = scegli(x)
        y = incidi(x, a, b)
        lufs, picco = misura_lufs(y, a, b)
        guadagno = BERSAGLIO_LUFS - lufs
        guadagno = min(guadagno, PICCO_MAX - picco)
        y = y * np.float32(10 ** (guadagno / 20))
        print(f"{zona} {titolo[:30]:30s} durata {len(x)/SR:6.1f}s  corpo {corpo_da:5.1f}–{corpo_a:5.1f}  "
              f"giro {a/SR:6.2f} → {b/SR:6.2f} ({(b-a)/SR:5.1f}s)  somiglianza {somiglia:5.3f}  "
              f"{lufs:6.1f} LUFS, picco {picco:5.1f} → guadagno {guadagno:+5.1f} dB")
        if prova:
            continue
        uscita = os.path.join(MUSICA, f"{zona}.opus")
        scrivi_opus(y, uscita)
        indice["zone"][zona] = {
            "file": f"{zona}.opus", "titolo": titolo, "luogo": luogo,
            "inizio": round(a / SR, 6), "fine": round(b / SR, 6), "durata": round(durata_file(uscita), 3),
        }
    if not prova:
        with open(os.path.join(MUSICA, "indice.json"), "w", encoding="utf-8", newline="\n") as fh:
            json.dump(indice, fh, ensure_ascii=False, indent=1)
            fh.write("\n")
        print("indice:", os.path.join(MUSICA, "indice.json"))


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "album":
        album(sys.argv[2])
    elif len(sys.argv) >= 2 and sys.argv[1] == "anelli":
        anelli(prova="--prova" in sys.argv)
    else:
        print(__doc__)
        sys.exit(2)
