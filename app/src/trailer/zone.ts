// Le sette tappe e le cinque regole: i dati che la mappa, le regole e il
// testo del trailer condividono. Ogni testo ha accanto la sua versione inglese
// (`en`): la sceglie chi lo disegna, al momento di disegnarlo (lib/lingua.ts).
// I nomi propri (Acquaviva) restano; i nomi comuni seguono il glossario della
// traduzione (src/lingue/en/LEGGIMI.md: la statale → the main road, il guado → the ford).
export const ZONE = [
  { n: "Acquaviva", s: "il capolinea", a: "#7fc8bd", en: { n: "Acquaviva", s: "the end of the line" } },
  { n: "La piana", s: "il sole non perdona", a: "#e6a85a", en: { n: "The plain", s: "the sun shows no mercy" } },
  { n: "L’invaso morto", s: "acqua ovunque, niente da bere", a: "#a9dbe4", en: { n: "The dead reservoir", s: "water everywhere, not a drop to drink" } },
  { n: "La statale", s: "chi tiene la strada", a: "#f2ad45", en: { n: "The main road", s: "who holds the road" } },
  { n: "Il paese", s: "il posto dove restare", a: "#ec7d54", en: { n: "The village", s: "the place to stay" } },
  { n: "Le colline", s: "l’ultima salita", a: "#9aa6e0", en: { n: "The hills", s: "the last climb" } },
  { n: "Il guado", s: "chi ti aspetta", a: "#df5f78", en: { n: "The ford", s: "who is waiting for you" } },
];

export const REGOLE = [
  { testo: "La sete\nè la spina dorsale.", en: "Thirst\nis the backbone.", a: "#e6a85a" },
  { testo: "L’acqua\nè la moneta.", en: "Water\nis the currency.", a: "#a9dbe4" },
  { testo: "La fiducia\napre le porte.", en: "Trust\nopens doors.", a: "#7fc8bd" },
  { testo: "La violenza costa.\nEd è evitabile.", en: "Violence costs.\nAnd it’s avoidable.", a: "#df5f78" },
  { testo: "Le scelte arrivano\nfino in fondo.", en: "Choices follow you\nto the very end.", a: "#9aa6e0" },
];
