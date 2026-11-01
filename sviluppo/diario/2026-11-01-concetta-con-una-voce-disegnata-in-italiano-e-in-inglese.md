---
data: 2026-11-01
ora: "11:44"
titolo: "Concetta con una voce disegnata, in italiano e in inglese"
tipo: sessione
versione: 1.40.1
---

# Concetta con una voce disegnata, in italiano e in inglese

## In breve
Concetta, l'anziana del cortile, non parla più con Tosca ma con una voce disegnata apposta con il Voice Design di ElevenLabs («America Marchetti»), la stessa in italiano e in inglese. Simone ha scelto e salvato la voce; io ho generato le due lingue e le ho messe nel gioco.

## Contesto
Dopo aver chiarito che «Tosca old&deep» (connettore) e «Tosca - Mature, Whispery and Seductive» (Libreria) sono la stessa voce, Simone ha chiesto se Tosca dovesse essere una donna anziana, e poi: «costruiscila tu la voce come hai fatto per altri personaggi». Tosca è una voce matura e profonda, ma non una vecchia di 85 anni come la descrive `doppiaggio/voci.md`.

## Lavoro fatto
- **Voice Design** (`creative_design_voice`, `eleven_ttv_v3`, lingua inglese): la descrizione di Concetta in `doppiaggio/voci.md` («A very old woman, as if time had sat down on her. A thin, cracked, wandering voice… Slow. A strong southern Italian regional flavour.») e, come battuta di prova, le sue prime battute inglesi senza tag (284 caratteri). Tre anteprime da 33 s; Simone ha ascoltato e salvato la sua scelta: «America Marchetti» (nello spazio ElevenLabs).
- **Generazione** (`creative_generate_speech`, `eleven_v4`, una ripresa per lingua, impostazioni predefinite): l'inglese con il blocco `doppiaggio/en/blocchi/concetta.txt` (`[strong Italian accent][tono]`, 1.062 crediti, 57,9 s), l'italiano con `doppiaggio/generati/concetta.txt` (tag di tono, 827 crediti, 55,8 s). In tutto **1.889 crediti** (più il Voice Design, che il connettore non dice).
- **Taglio italiano**: 8 parti su 8 al primo colpo, tutte sopra l'85% e senza parole in più.
- **Taglio inglese**: il primo giro dava le battute sfasate di una (e una coda inventata dal riconoscimento con filtro delle pause): la voce, lenta, dice le battute quasi di fila (a un confine non c'è nessuna pausa) e tiene pause lunghe dentro la battuta. Ho trascritto la ripresa senza filtro (`faster-whisper` con i tempi delle parole): l'audio è pulito, nessuna parola ripetuta in coda. Con un piccolo programma (`separa.py`, nello scratchpad, non è nel repository) ho tagliato il WAV nei punti di minima energia vicino ai sette confini fra le battute e rimesso 0,8 s di silenzio fra l'una e l'altra; ho tolto anche il primo «You.» (la voce dice «You. You. But you're…» e il testo ha un «You…» solo). Poi il solito `doppiaggio-taglia.py en-concetta … --controlla`: **8 su 8**, 140 parole attese e 140 riconosciute. **L'audio parlato non è toccato: sono stati aggiunti o tolti solo silenzi e un «You.» ripetuto.**
- **Archivio di Tosca** (non cancellata): `doppiaggio/master/clip/concetta` → `concetta-toscaoldeep`, `clip/en-concetta` → `en-concetta-tosca`, `en-grezzi/elevenlabs/concetta.wav` → `concetta-tosca.wav`; gli MP3 di Tosca restano nei master e su `F:`.
- **Banco e gioco**: `doppiaggio-banco.py` (italiano e inglese): cambiano solo i file di Concetta (16 Opus, i due `indice.json` di `elevenlabs/`, `doppiaggio/banco.json` e `doppiaggio/en/banco.json`). Pesi: l'italiano 14,85 MB, l'inglese 13,97 MB (le parti di ElevenLabs, 3,07 MB per lingua).
- **Copie di sicurezza**: i due MP3 nuovi su `F:` (`…\master\elevenlabs\concetta-americamarchetti.mp3` e `…\en-grezzi\elevenlabs\ElevenLabs_2026-11-01_AmericaMarchetti_concetta_v4.mp3`), con `SHA256.txt` aggiornati e verificati (2 su 2).
- **Documenti**: `CHANGELOG.md`, `LICENSE-CONTENUTI.md`, `doppiaggio/voci-scelte.md`, `doppiaggio/en/LEGGIMI.md`, `sviluppo/PROSSIMI-PASSI.md`, `sviluppo/REGISTRO.md`.

## Decisioni
- **Voce disegnata, in inglese, per tutte e due le lingue** — come per Nunzio, Saverio, Rocco e Pasquale: la stessa voce in italiano e in inglese; la descrizione è quella di `voci.md`, senza inventare niente. Il Voice Design ha una lingua sola nella battuta di prova: l'inglese, come le altre.
- **Nessun profilo d'età nel tag** (`very old woman…`) — la voce è già vecchia e costerebbe circa 290 crediti in più per lingua; se all'ascolto suona troppo giovane si aggiunge in `doppiaggio/en/stati.json` e si rifà.
- **Una ripresa per lingua** — come per gli altri personaggi.
- **Fuori piano**: il costo è 1.889 crediti, circa 190 più di quanto avevo detto a Simone (la stima era dell'italiano per tutte e due le lingue; l'inglese ha più caratteri per i tag di accento).

## Verifiche
- `doppiaggio/master/clip/concetta/rapporto.txt` e `clip/en-concetta/rapporto.txt`: 8/8 e 8/8, «0 da riascoltare».
- `python collaudo/doppiaggio.py`: TUTTO OK (878 parti italiane, 193 in `elevenlabs/`; 845 inglesi; «la voce, italiana e inglese insieme, pesa 28.4 MB»).
- Autoverifica del gioco desktop: SUPERATA («voce: 878 parti, 16 voci», «voce inglese: 845 parti»).
- Non verificato: l'ascolto (non posso) e la CI dell'ultimo commit.

## Questioni aperte
- Simone ascolta Concetta nel gioco desktop (`node prepara.mjs`, poi `npm run avvia` in `desktop/`), in italiano e in inglese, e dice se la voce va.
- Nello spazio ElevenLabs restano due anteprime non scelte e le riprese con Tosca (in italiano con le impostazioni del connettore, in inglese con quelle a mano di Simone): non servono più.
- La licenza delle voci a pagamento e il rilascio (1.41.0), solo quando lo dice Simone.
