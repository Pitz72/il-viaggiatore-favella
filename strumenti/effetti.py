# ====================================================================
#  Gli effetti sonori del gioco, dalle prese di ElevenLabs ai file Opus.
# --------------------------------------------------------------------
#  Dalle prese scelte in effetti/master/ (fuori da git: sviluppo/REGISTRO.md, M18) agli effetti di app/public/effetti/: toglie il
#  silenzio in testa e in coda, ritaglia i colpi singoli dalle sequenze (passi, tasti, ticchettii), porta ogni effetto al picco di
#  -1,5 dBFS (i colpi di una stessa sequenza alla stessa energia), scrive gli Opus a 48 kHz mono e l'indice. Quali prese, e perché:
#  effetti/LEGGIMI.md. I livelli nel gioco (`livelli` dell'indice) li misura strumenti/effetti-livelli.cjs: qui si conservano.
#
#  Uso (dalla cartella del progetto):  python strumenti/effetti.py [--prova <cartella per i WAV d'ascolto>]
#  Servono ffmpeg, numpy e scipy.
# ====================================================================
import subprocess, sys, os, json, tempfile
import numpy as np
from scipy.signal import find_peaks
RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = os.path.join(RADICE, "effetti", "master")
USCITA = os.path.join(RADICE, "app", "public", "effetti")
PROVA = sys.argv[sys.argv.index("--prova") + 1] if "--prova" in sys.argv else tempfile.mkdtemp(prefix="effetti-")
LICENZA = ("Effetti sonori generati con ElevenLabs Sound Effects (elevenlabs.io) con l'abbonamento dell'autore: esclusi dalla licenza "
           "CC BY-SA del gioco, solo uso non commerciale, finché i diritti dell'abbonamento non sono verificati; chi fa un'opera derivata o "
           "un uso commerciale li toglie (il gioco suona allora i suoni sintetici) o li sostituisce (LICENSE-CONTENUTI.md).")
SR = 48000
PICCO = 10**(-1.5/20)            # ogni effetto al picco di -1,5 dBFS: il livello lo decide il codice
os.makedirs(USCITA, exist_ok=True); os.makedirs(PROVA, exist_ok=True)
def leggi(f):
    b = subprocess.run(["ffmpeg","-v","error","-i",os.path.join(M,f),"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True).stdout
    return np.frombuffer(b, dtype=np.float32).copy()
def inviluppo(x, ms=5):
    w = max(1,int(SR*ms/1000)); return np.sqrt(np.convolve(x**2, np.ones(w)/w, mode="same"))
def rifila(x, coda_db=-48, testa_db=-40, dissolvi=0.02):
    """Toglie il silenzio in testa (fino a 3 ms prima dell'attacco) e in coda (sotto coda_db dal picco), sfuma l'ultimo tratto."""
    e = inviluppo(x); p = e.max()
    sopra = np.where(e > p*10**(testa_db/20))[0]
    a = max(0, sopra[0]-int(SR*0.003))
    sopra = np.where(e > p*10**(coda_db/20))[0]
    b = min(len(x), sopra[-1]+int(SR*0.01))
    y = x[a:b].copy()
    n = min(len(y)//3, int(SR*dissolvi))
    if n > 0: y[-n:] *= np.linspace(1,0,n)**2
    y[:int(SR*0.002)] *= np.linspace(0,1,int(SR*0.002))
    return y
def colpi(x, distanza, lung, soglia_db=-14):
    """I colpi di una sequenza: dall'attacco di ciascuno per al massimo `lung` secondi, senza toccare il successivo."""
    e = inviluppo(x, 3)
    pk,_ = find_peaks(e, height=e.max()*10**(soglia_db/20), distance=int(SR*distanza))
    inizi = []
    for p in pk:
        k = p
        lim = max(0, p-int(SR*0.04))
        while k > lim and e[k] > e[p]*0.15: k -= 1
        inizi.append(k)
    out = []
    for i,a in enumerate(inizi):
        fine = min(a+int(SR*lung), (inizi[i+1]-int(SR*0.004)) if i+1 < len(inizi) else len(x))
        seg = x[a:fine].copy()
        if len(seg) < int(SR*0.02): continue
        out.append((float(np.abs(seg).max()), rifila(seg, coda_db=-40, testa_db=-30, dissolvi=0.015)))
    return out
def livella(y):
    return (y / max(np.abs(y).max(),1e-9) * PICCO).astype(np.float32)
indice = {}
def pari(clips):
    """I colpi di una sequenza alla stessa energia (la mediana del gruppo), poi tutti insieme sotto il picco: un passo non salta fuori."""
    rms = [float(np.sqrt((y**2).mean())) for y in clips]
    m = float(np.median(rms))
    clips = [y * (m / r) for y, r in zip(clips, rms)]
    p = max(float(np.abs(y).max()) for y in clips)
    return [(y / p * PICCO).astype(np.float32) for y in clips]
def scrivi(chiave, clips, gruppo=False):
    nomi = []
    if gruppo: clips = pari(clips)
    for i,y in enumerate(clips):
        if not gruppo: y = livella(y)
        nome = f"{chiave}-{i+1}.opus"
        grezzo = os.path.join(PROVA, nome.replace(".opus",".f32"))
        y.tofile(grezzo)
        subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i",grezzo,"-c:a","libopus","-b:a","64k","-application","audio",os.path.join(USCITA,nome)],check=True)
        subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i",grezzo,os.path.join(PROVA,nome.replace(".opus",".wav"))],check=True)
        os.remove(grezzo)
        nomi.append({"file": nome, "durata": round(len(y)/SR,3)})
    indice[chiave] = nomi
    print(f"{chiave:18s} {len(nomi)} file  " + " ".join(f"{n['durata']:.2f}s" for n in nomi))
def scegli(lista, n):
    """I migliori n colpi: i più forti, poi in ordine di presa (così le varianti vengono da prese diverse)."""
    lista = sorted(lista, key=lambda t: -t[0])[:n]
    return [y for _,y in lista]
singoli = {
    "tv-acceso": ["L01_3"], "schermo": ["L03_2"], "testina": ["L05_3"], "zip": ["L08_1"], "colpo": ["L09_1"],
    "riflesso": ["L13_3", "L13_2"], "spegne": ["L14_1"], "punto": ["L15_1"], "scintilla": ["L16_3"], "libro": ["L18_2"],
    "pagina": ["L19_2", "L19_3", "L19_1"], "penna": ["L21_3"], "soffio-lettera": ["L23_2", "L23_1"],
    "busta": ["T01a_1", "T01a_2", "T01a_3"], "biglietto": ["T01b_3"], "timbro": ["T03_3"], "soffio": ["T04_3", "T04_1"],
    "carta-apre": ["M01_3"], "carta-chiude": ["M02_2"],
}
for k, fonti in singoli.items():
    scrivi(k, [rifila(leggi(f + ".mp3")) for f in fonti])
# il ronzio del tubo gira in tondo: niente tagli né sfumature, solo il livello
scrivi("ronzio", [leggi("L02_1.mp3")])
sequenze = {
    "tic":          (["L07_1", "L07_2"], 0.05, 0.05, 6),
    "tasto-motto":  (["L25_1", "L25_3", "L25_2"], 0.07, 0.12, 8),
    "tasto":        (["T02_2", "T02_3", "T02_1"], 0.07, 0.12, 8),
    "passo-asfalto":(["T05a_1", "T05a_3", "T05a_2"], 0.30, 0.38, 8),
    "passo-crosta": (["T05b_1", "T05b_2", "T05b_3"], 0.30, 0.38, 8),
    "passo-sale":   (["T05c_1", "T05c_3", "T05c_2"], 0.30, 0.38, 8),
    "passo-sassi":  (["T05d_3", "T05d_1", "T05d_2"], 0.30, 0.38, 8),
}
for k,(fonti, dist, lung, n) in sequenze.items():
    tutti = []
    for f in fonti:
        c = colpi(leggi(f + ".mp3"), dist, lung)
        # i colpi di una presa si confrontano fra loro: una presa più bassa non resta fuori solo perché è più bassa
        if c:
            m = max(p for p,_ in c); tutti += [(p/m, y) for p,y in c]
    scrivi(k, scegli(tutti, n), gruppo=True)
percorso = os.path.join(USCITA, "indice.json")
prima = json.load(open(percorso, encoding="utf-8")) if os.path.exists(percorso) else {}
nuovo = {"formato": 1, "frequenza": SR, "licenza": LICENZA, "effetti": indice}
if prima.get("livelli"): nuovo["livelli"] = prima["livelli"]          # li misura strumenti/effetti-livelli.cjs: si conservano
with open(percorso, "w", encoding="utf-8", newline="\n") as f:
    json.dump(nuovo, f, ensure_ascii=False, indent=1); f.write("\n")
