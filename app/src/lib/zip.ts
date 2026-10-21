// ====================================================================
//  Uno ZIP «memorizzato» (metodo 0, senza compressione), nomi in UTF-8.
// --------------------------------------------------------------------
//  Lo usa «Scarica la colonna sonora ufficiale» nel browser (lib/colonnaSonora.ts):
//  gli MP3 sono già compressi. Niente import: collaudo/musica.py lo prova in Node
//  (app/scripts/zip-node.mjs) e apre il risultato col modulo zipfile di Python.
// ====================================================================

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
export function crc32(d: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < d.length; i++) c = CRC[(c ^ d[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** I file in uno ZIP senza compressione: intestazioni locali, poi la directory centrale. */
export function componiZip(file: { nome: string; dati: Uint8Array }[]): Uint8Array {
  const enc = new TextEncoder();
  const ora = new Date();
  const dosOra = (ora.getHours() << 11) | (ora.getMinutes() << 5) | (ora.getSeconds() >> 1);
  const dosData = ((ora.getFullYear() - 1980) << 9) | ((ora.getMonth() + 1) << 5) | ora.getDate();
  const parti: Uint8Array[] = [];
  const centrale: Uint8Array[] = [];
  let posizione = 0;
  for (const f of file) {
    const nome = enc.encode(f.nome);
    const crc = crc32(f.dati);
    const locale = new DataView(new ArrayBuffer(30));
    locale.setUint32(0, 0x04034b50, true);
    locale.setUint16(4, 20, true);              // versione necessaria
    locale.setUint16(6, 0x0800, true);          // nomi in UTF-8
    locale.setUint16(8, 0, true);               // memorizzato
    locale.setUint16(10, dosOra, true);
    locale.setUint16(12, dosData, true);
    locale.setUint32(14, crc, true);
    locale.setUint32(18, f.dati.length, true);
    locale.setUint32(22, f.dati.length, true);
    locale.setUint16(26, nome.length, true);
    locale.setUint16(28, 0, true);
    parti.push(new Uint8Array(locale.buffer), nome, f.dati);
    const voce = new DataView(new ArrayBuffer(46));
    voce.setUint32(0, 0x02014b50, true);
    voce.setUint16(4, 20, true);
    voce.setUint16(6, 20, true);
    voce.setUint16(8, 0x0800, true);
    voce.setUint16(10, 0, true);
    voce.setUint16(12, dosOra, true);
    voce.setUint16(14, dosData, true);
    voce.setUint32(16, crc, true);
    voce.setUint32(20, f.dati.length, true);
    voce.setUint32(24, f.dati.length, true);
    voce.setUint16(28, nome.length, true);
    voce.setUint32(42, posizione, true);       // dove comincia l'intestazione locale
    centrale.push(new Uint8Array(voce.buffer), nome);
    posizione += 30 + nome.length + f.dati.length;
  }
  const lunghezzaCentrale = centrale.reduce((n, p) => n + p.length, 0);
  const fine = new DataView(new ArrayBuffer(22));
  fine.setUint32(0, 0x06054b50, true);
  fine.setUint16(8, file.length, true);
  fine.setUint16(10, file.length, true);
  fine.setUint32(12, lunghezzaCentrale, true);
  fine.setUint32(16, posizione, true);
  const tutto = [...parti, ...centrale, new Uint8Array(fine.buffer)];
  const out = new Uint8Array(tutto.reduce((n, p) => n + p.length, 0));
  let i = 0;
  for (const p of tutto) { out.set(p, i); i += p.length; }
  return out;
}
