// La data di oggi come AAAA-MM-GG nel fuso di chi lavora, non in UTC.
// `new Date().toISOString().slice(0, 10)` è in UTC: in Italia, fra mezzanotte e le 2 (le 1 d'inverno)
// dà il giorno prima, e il CHANGELOG avrebbe una data sbagliata. (Lo usa versione.mjs; lo prova prova-data.mjs.)
export function dataLocale(quando = new Date()) {
  const due = (n) => String(n).padStart(2, "0");
  return `${quando.getFullYear()}-${due(quando.getMonth() + 1)}-${due(quando.getDate())}`;
}
