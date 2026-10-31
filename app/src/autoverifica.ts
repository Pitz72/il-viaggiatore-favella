// ====================================================================
//  Autoverifica: avvia il gioco vero (Pyodide + motore + avventura),
//  gioca qualche comando e controlla le risposte; prova anche la voce del
//  doppiaggio (indice, una parte per voce, il trailer) e il bus sonoro (i
//  canali nascono coi volumi delle opzioni, senza cambiarle). Si apre con
//  ?autoverifica; nella versione desktop la lancia `--autoverifica`, e la
//  CI la esegue sul pacchetto appena costruito prima di pubblicarlo.
// ====================================================================
import { avviaGioco } from "./lib/favellaRuntime";
import { VIAGGIATORE_GAME } from "./data/viaggiatore";
import { riferisciAutoverifica } from "./lib/desktop";
import branoIntro from "./assets/intro.mp3";
import { analizza } from "./gioco/testo";
import { tabella, partiDelBlocco, type Testi } from "./gioco/parti";
import { canale, uscita, TARATURA, type Canale } from "./lib/suono";
import { opzioni } from "./lib/opzioni";
import { sfideNuove, trofeiDelTurno } from "./gioco/trofei";

/** Il bus sonoro: ogni canale nasce al volume delle opzioni di chi gioca (lette, mai cambiate), e il contesto ha
 *  la sua uscita (volume generale e fusore). */
async function provaIlSuono(nota: (r: string) => void): Promise<boolean> {
  const o = opzioni();
  const ac = new AudioContext();
  try {
    const voluti: Record<Canale, number> = { musica: o.volumeMusica, voce: o.volumeVoce, effetti: o.volumeEffetti };
    const storti = (Object.keys(voluti) as Canale[]).filter((c) => Math.abs(canale(ac, c).gain.value - voluti[c] * TARATURA[c]) > 1e-6);
    const u = uscita(ac) as GainNode;
    if (storti.length || Math.abs(u.gain.value - o.volume) > 1e-6) { nota(`KO bus sonoro: canali fuori misura ${JSON.stringify(storti)}, generale ${u.gain.value}`); return false; }
    nota(`ok bus sonoro: musica, voce ed effetti ai volumi delle opzioni (generale ${Math.round(o.volume * 100)}%${o.mono ? ", mono" : ""})`);
    return true;
  } finally {
    await ac.close().catch(() => {});
  }
}

/** La voce del doppiaggio: l'indice, una parte decodificata per ogni voce che il pacchetto contiene, la
 *  traccia del trailer, e le parti del testo d'avvio ritrovate dal testo stampato. */
async function provaLaVoce(testoAvvio: string, nota: (r: string) => void): Promise<boolean> {
  const base = `${import.meta.env.BASE_URL}voce/`;
  const r = await fetch(`${base}indice.json`);
  if (!r.ok) { nota(`KO voce: indice HTTP ${r.status}`); return false; }
  type Indice = { estensione: string; parti: Record<string, number>; cartelle?: string[]; testi: Testi };
  const indice = await r.json() as Indice;
  let ok = true;
  // dove sta ogni parte: la cartella principale e quelle che l'indice nomina (le voci fuori dalla licenza libera)
  const dove = new Map<string, { url: string; ms: number }>();
  for (const [id, ms] of Object.entries(indice.parti)) dove.set(id, { url: `${base}${id}${indice.estensione}`, ms });
  for (const c of indice.cartelle ?? []) {
    const rc = await fetch(`${base}${c}/indice.json`);
    if (!rc.ok) { ok = false; nota(`KO voce: manca ${c}/indice.json (HTTP ${rc.status})`); continue; }
    const altro = await rc.json() as Indice;
    for (const [id, ms] of Object.entries(altro.parti)) dove.set(id, { url: `${base}${c}/${id}${altro.estensione}`, ms });
  }
  // una parte per voce, decodificata davvero: la durata deve essere quella dell'indice
  const perVoce = new Map<string, string>();
  for (const id of dove.keys()) {
    const v = indice.testi[id]?.[0];
    if (v && !perVoce.has(v)) perVoce.set(v, id);
  }
  const ctx = new OfflineAudioContext(1, 1, 48000);
  for (const [v, id] of perVoce) {
    const d = dove.get(id)!;
    try {
      const b = await ctx.decodeAudioData(await (await fetch(d.url)).arrayBuffer());
      if (Math.abs(b.duration * 1000 - d.ms) > 60) { ok = false; nota(`KO voce ${v}: ${id} dura ${Math.round(b.duration * 1000)} ms, l'indice ${d.ms}`); }
    } catch (e) {
      ok = false; nota(`KO voce ${v}: ${id} non si decodifica (${e instanceof Error ? e.message : e})`);
    }
  }
  if (ok) nota(`ok voce: ${dove.size} parti, ${perVoce.size} voci, una per voce decodificata`);
  // il testo d'avvio: ogni sua parte si ritrova ed esiste
  const tab = tabella(indice.testi);
  const blocchi = analizza(testoAvvio).map((b) => partiDelBlocco(b, tab));
  const senza = blocchi.flatMap((x) => x.mancano.map((m) => m.testo)).concat(blocchi.flatMap((x) => x.ids).filter((id) => !dove.has(id)));
  const trovate = blocchi.reduce((n, x) => n + x.ids.length, 0);
  if (senza.length || !trovate) { ok = false; nota(`KO voce: il testo d'avvio non ritrova le parti: ${JSON.stringify(senza).slice(0, 200)}`); }
  else nota(`ok voce: il testo d'avvio ritrova le sue ${trovate} parti`);
  // la traccia del trailer
  try {
    const sc = await (await fetch(`${base}trailer.json`)).json() as { durata: number; file: string; frasi: unknown[] };
    const b = await ctx.decodeAudioData(await (await fetch(`${base}${sc.file}`)).arrayBuffer());
    if (Math.abs(b.duration - sc.durata) > 0.1) { ok = false; nota(`KO voce del trailer: dura ${b.duration.toFixed(2)} s invece di ${sc.durata}`); }
    else nota(`ok voce del trailer: ${sc.frasi.length} frasi, ${b.duration.toFixed(1)} s`);
  } catch (e) {
    ok = false; nota(`KO voce del trailer: ${e instanceof Error ? e.message : e}`);
  }
  // la voce inglese (per ora il solo narratore): l'indice con le corrispondenze, una parte decodificata davvero,
  // la traccia del trailer inglese
  try {
    const re = await fetch(`${base}en/indice.json`);
    if (!re.ok) { ok = false; nota(`KO voce inglese: indice HTTP ${re.status}`); return ok; }
    const en = await re.json() as { estensione: string; parti: Record<string, number>; corrispondenze: Record<string, string> };
    const [id, ms] = Object.entries(en.parti)[0];
    const b = await ctx.decodeAudioData(await (await fetch(`${base}en/${id}${en.estensione}`)).arrayBuffer());
    const orfane = Object.values(en.corrispondenze).filter((e) => en.parti[e] === undefined).length;
    const senzaItaliano = Object.keys(en.corrispondenze).filter((i) => !dove.has(i)).length;
    if (Math.abs(b.duration * 1000 - ms) > 60) { ok = false; nota(`KO voce inglese: ${id} dura ${Math.round(b.duration * 1000)} ms, l'indice ${ms}`); }
    else if (orfane || senzaItaliano) { ok = false; nota(`KO voce inglese: ${orfane} corrispondenze senza registrazione, ${senzaItaliano} senza parte italiana`); }
    else {
      const sc = await (await fetch(`${base}en/trailer.json`)).json() as { durata: number; file: string; frasi: unknown[] };
      const t = await ctx.decodeAudioData(await (await fetch(`${base}en/${sc.file}`)).arrayBuffer());
      if (Math.abs(t.duration - sc.durata) > 0.1) { ok = false; nota(`KO voce inglese del trailer: dura ${t.duration.toFixed(2)} s invece di ${sc.durata}`); }
      else nota(`ok voce inglese: ${Object.keys(en.parti).length} parti per ${Object.keys(en.corrispondenze).length} parti italiane del narratore, trailer di ${sc.frasi.length} frasi`);
    }
  } catch (e) {
    ok = false; nota(`KO voce inglese: ${e instanceof Error ? e.message : e}`);
  }
  return ok;
}

/** La musica delle zone, la canzone dei titoli e l'album (pre-produzione/10-musiche.md, 11-sequenza-finale.md):
 *  l'indice con le sette zone, un brano decodificato col giro dentro il file, la canzone decodificata, l'elenco
 *  dell'album con i suoi dieci file. */
async function provaLaMusica(nota: (r: string) => void): Promise<boolean> {
  const base = import.meta.env.BASE_URL;
  const ac = new OfflineAudioContext(2, 48000, 48000);
  try {
    const indice = await (await fetch(`${base}musica/indice.json`)).json() as {
      zone: Record<string, { file: string; titolo: string; inizio: number; fine: number }>; finale?: { file: string; titolo: string; durata: number } };
    const zone = Object.keys(indice.zone);
    const z = indice.zone.z4 ?? indice.zone[zone[0]];
    const buf = await ac.decodeAudioData(await (await fetch(`${base}musica/${z.file}`)).arrayBuffer());
    const canzone = indice.finale ? await ac.decodeAudioData(await (await fetch(`${base}musica/${indice.finale.file}`)).arrayBuffer()) : null;
    const album = await (await fetch(`${base}colonna-sonora/album.json`)).json() as { file: string[] };
    const copertina = await fetch(`${base}colonna-sonora/copertina.jpg`);
    if (zone.length !== 7 || !(z.inizio > 0 && z.fine > z.inizio && buf.duration >= z.fine) || !canzone
        || Math.abs(canzone.duration - indice.finale!.durata) > 0.1 || album.file.length !== 10 || !copertina.ok) {
      nota(`KO musica: ${zone.length} zone, «${z.titolo}» ${buf.duration.toFixed(2)} s con giro ${z.inizio}–${z.fine}, `
        + `canzone ${canzone ? canzone.duration.toFixed(2) + " s" : "assente"}, album di ${album.file.length} file`);
      return false;
    }
    nota(`ok musica: 7 zone, «${z.titolo}» decodificato (${buf.duration.toFixed(1)} s, giro ${z.inizio.toFixed(1)}–${z.fine.toFixed(1)}), `
      + `canzone «${indice.finale!.titolo}» (${canzone.duration.toFixed(1)} s), album di ${album.file.length} file`);
    return true;
  } catch (e) {
    nota(`KO musica: ${e instanceof Error ? e.message : e}`);
    return false;
  }
}

type Prova = { cmd: string; attese: string[] };

// Il primo tratto della partita: stazione → piazza → casa, la mappa al suo
// posto iniziale, la presa, e la stanza che non la descrive più. Poi un giro
// di salvataggio e ricaricamento dentro il motore vero.
const PROVE: Prova[] = [
  { cmd: "esamina il biglietto", attese: ["Non è il caso di tornare"] },
  { cmd: "nord", attese: ["La piazza"] },
  { cmd: "nord", attese: ["La casa", "Su un mobile, una MAPPA"] },
  { cmd: "prendi la mappa", attese: ["Preso"] },
  { cmd: "guarda", attese: ["In un cassetto rimasto aperto"] },
  { cmd: "stato", attese: ["Vita"] },
];

export async function autoverifica(scrivi: (riga: string) => void) {
  const righe: string[] = [];
  const nota = (r: string) => { righe.push(r); scrivi(r); };
  let ok = true;
  const t0 = performance.now();
  try {
    const brano = await fetch(branoIntro);
    const byte = (await brano.arrayBuffer()).byteLength;
    if (!brano.ok || byte < 500_000) { ok = false; nota(`KO colonna sonora: HTTP ${brano.status}, ${byte} byte`); }
    else nota(`ok colonna sonora (${(byte / 1048576).toFixed(1)} MB)`);

    const s = await avviaGioco(VIAGGIATORE_GAME, (m) => nota(`… ${m}`));
    const avvio = s.boot();
    if (avvio.stato === "errore" || !avvio.text.includes("La stazione")) {
      ok = false; nota(`KO avvio: ${avvio.text.slice(0, 300)}`);
    } else nota(`ok avvio del motore (${((performance.now() - t0) / 1000).toFixed(1)} s)`);
    if (!(await provaLaVoce(avvio.text, nota))) ok = false;
    if (!(await provaLaMusica(nota))) ok = false;
    if (!(await provaIlSuono(nota))) ok = false;

    for (const p of PROVE) {
      const r = s.step(p.cmd);
      const manca = p.attese.filter((a) => !r.text.includes(a));
      const errore = r.text.includes("[ERRORE");
      if (manca.length || errore) { ok = false; nota(`KO «${p.cmd}»: manca ${JSON.stringify(manca)} → ${r.text.slice(0, 240)}`); }
      else nota(`ok «${p.cmd}»`);
    }
    // la mappa, presa, non deve più comparire nella descrizione della casa
    const guarda = s.step("guarda");
    if (guarda.text.includes("Su un mobile")) { ok = false; nota("KO il posto della mappa resta dopo la presa"); }
    else nota("ok il posto della mappa sparisce dopo la presa");
    const st = s.stato();
    if (!st.inventory.some((n) => /mappa/i.test(n))) { ok = false; nota("KO la mappa non è in bisaccia"); }

    // i pulsanti: l'anteprima di un comando (senza farlo), bere a dosi, «mangia» solo
    for (let i = 0; i < 12; i++) s.step("aspetta");
    const prima = s.stato().counters;
    const ante = s.anteprima("bevi due sorsi");
    if (!ante.ok || !ante.capito || ante.delta.acqua !== -2) { ok = false; nota(`KO anteprima di «bevi due sorsi»: ${JSON.stringify(ante.delta)}`); }
    else nota("ok l'anteprima dice cosa costa bere due sorsi");
    if (s.stato().counters.acqua !== prima.acqua) { ok = false; nota("KO l'anteprima ha toccato il mondo"); }
    else nota("ok l'anteprima non tocca il mondo");
    const beve = s.step("bevi due sorsi");
    if (!beve.text.includes("due sorsi lenti") || s.stato().counters.acqua !== prima.acqua - 2) { ok = false; nota(`KO «bevi due sorsi»: ${beve.text.slice(0, 120)}`); }
    else nota("ok si beve a dosi: due sorsi in un turno");
    const mangia = s.step("mangia");
    if (!mangia.text.includes("Mastichi piano")) { ok = false; nota(`KO «mangia» solo: ${mangia.text.slice(0, 120)}`); }
    else nota("ok «mangia» solo mangia una porzione");
    if (!Array.isArray(s.azioni().soli)) { ok = false; nota("KO le azioni di contesto"); }
    if ((s.stato().undo ?? 0) < 1) { ok = false; nota("KO lo stato non dice quanti turni si possono annullare"); }

    // i trofei (piano 09, §7): il ponte espone gli stati della storia, e le regole vere ci riconoscono un finale.
    // Il deposito non si tocca: l'autoverifica non scrive niente.
    const sm = s.stato();
    if (sm.stati?.["stato di cosimo"] !== "fermo") { ok = false; nota(`KO il ponte non espone gli stati della storia: ${JSON.stringify(sm.stati ?? null).slice(0, 120)}`); }
    else {
      const t = trofeiDelTurno({ testo: "FINALE — Sei arrivato a casa con le mani vuote, e la casa se n'è accorta.", esito: "terminata",
        counters: sm.counters, voci: sm.voci, gesti: sm.gesti, stati: { ...sm.stati, "stato di cosimo": "riconosciuto" }, sfide: sfideNuove("v-autoverifica") }, new Set());
      if (!t.includes("le-mani-vuote") || !t.includes("mani-pulite")) { ok = false; nota(`KO le regole dei trofei: ${t.join(", ")}`); }
      else nota(`ok trofei: ${Object.keys(sm.stati!).length} stati della storia esposti, un finale riconosciuto (${t.length} trofei)`);
    }

    // salvataggio e ricaricamento: la partita ricostruita dev'essere identica
    s.step("annulla");   // disfa l'ultimo turno («mangia»)…
    s.step("guarda");    // …e ne fa un altro: la sequenza salvata deve contenere i turni una volta sola
    const salvata = s.salva();
    const esito = s.carica(salvata);
    if (!esito.ok || !esito.identica) { ok = false; nota(`KO ricaricamento: ${esito.errore ?? "impronta diversa"}`); }
    else nota(`ok salvataggio ricaricato identico (${salvata.comandi.length} comandi, impronta ${salvata.impronta.slice(0, 12)}…)`);
    if (s.stato().roomId !== st.roomId) { ok = false; nota("KO dopo il ricaricamento il luogo è diverso"); }
    const disfa = s.step("annulla");
    if (/niente da annullare/i.test(disfa.text)) { ok = false; nota("KO dopo il ricaricamento ANNULLA non ha passi"); }
    else nota("ok ANNULLA funziona anche dopo il ricaricamento");
  } catch (e) {
    ok = false;
    nota(`KO eccezione: ${e instanceof Error ? e.stack ?? e.message : String(e)}`);
  }
  nota(ok ? "AUTOVERIFICA SUPERATA" : "AUTOVERIFICA FALLITA");
  riferisciAutoverifica(ok, righe.join("\n"));
  return ok;
}
