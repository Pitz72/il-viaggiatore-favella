// ====================================================================
//  I formati delle immagini promozionali e come si impagina ciascuno.
// --------------------------------------------------------------------
//  Due famiglie d'impaginazione sopra le tre tavole pittoriche a gouache
//  e china («panoramica», «quadrata», «locandina» in grafica/branding/tavole/):
//  - «cielo» (i formati larghi e il quadrato): il titolo e la firma in alto,
//    nel cielo del crepuscolo; in basso, sul greto in ombra, la frase del
//    biglietto del fratello e i due marchi.
//  - «locandina» (il manifesto cinematografico 27×40): la frase del biglietto
//    in alto nel buio; al centro la scena intera al guado di Acquamorta;
//    in fondo, sulla quinta scura sotto gli scarponi, il titolo, la firma
//    «un gioco in FAVELLA1 di Simone Pizzi» e il blocco dei marchi.
// ====================================================================
export type Tavola = "panoramica" | "quadrata" | "locandina";

export interface Inquadratura {
  tavola: Tavola;
  /** scala e posizione (in frazione o pixel sul formato finale) */
  modo: "copri" | "locandina";
  /** spostamento orizzontale (px sull'uscita, 0 = centrato) in modo «copri» */
  dx?: number;
  /** spostamento verticale (px sull'uscita, 0 = centrato; negativo alza la scena) in modo «copri» */
  dy?: number;
  /** y superiore (px) della tavola quando modo === «locandina» */
  yTavola?: number;
}

export interface Formato {
  id: string;
  /** il file d'uscita, senza estensione */
  file: string;
  nome: string;
  w: number;
  h: number;
  impagina: "cielo" | "locandina";
  scena: Inquadratura;
  /** i testi: y della linea di base e corpo, in px */
  titolo: { y: number; corpo: number };
  autore: { y: number; corpo: number };
  frase: { y: number; corpo: number };
  marchi: { y: number; alto: number };
  /** velatura scura in cima e in fondo (frazione dell'altezza e intensità 0…1) */
  veloAlto: { finoA: number; forza: number };
  veloBasso: { da: number; forza: number };
}

export const FORMATI: Formato[] = [
  {
    id: "16x9", file: "il-viaggiatore-16x9", nome: "16:9", w: 3840, h: 2160, impagina: "cielo",
    scena: { tavola: "panoramica", modo: "copri", dx: 0, dy: 0 },
    titolo: { y: 292, corpo: 212 },
    autore: { y: 390, corpo: 60 },
    frase: { y: 1966, corpo: 94 },
    marchi: { y: 2072, alto: 84 },
    veloAlto: { finoA: 0.28, forza: 0.56 },
    veloBasso: { da: 0.76, forza: 0.80 },
  },
  {
    id: "21x9", file: "il-viaggiatore-21x9", nome: "21:9", w: 5040, h: 2160, impagina: "cielo",
    // panoramica 2736×1520 scalata a 5040 diventa alta 2800 (centrata: y = -320). Con dy = +152 parte da y = -168:
    // ampio cielo libero fra il titolo e il campanile, e scarponi del Viaggiatore interi sopra il bordo inferiore.
    scena: { tavola: "panoramica", modo: "copri", dx: 0, dy: 152 },
    titolo: { y: 226, corpo: 190 },
    autore: { y: 312, corpo: 56 },
    frase: { y: 1966, corpo: 92 },
    marchi: { y: 2072, alto: 82 },
    veloAlto: { finoA: 0.25, forza: 0.58 },
    veloBasso: { da: 0.76, forza: 0.82 },
  },
  {
    id: "4x3", file: "il-viaggiatore-4x3", nome: "4:3", w: 2880, h: 2160, impagina: "cielo",
    scena: { tavola: "panoramica", modo: "copri", dx: 44, dy: 0 },
    titolo: { y: 284, corpo: 184 },
    autore: { y: 374, corpo: 54 },
    frase: { y: 1966, corpo: 86 },
    marchi: { y: 2072, alto: 74 },
    veloAlto: { finoA: 0.27, forza: 0.56 },
    veloBasso: { da: 0.76, forza: 0.80 },
  },
  {
    id: "1x1", file: "il-viaggiatore-1x1", nome: "quadrata", w: 2160, h: 2160, impagina: "cielo",
    scena: { tavola: "quadrata", modo: "copri", dx: 0, dy: 0 },
    titolo: { y: 278, corpo: 156 },
    autore: { y: 368, corpo: 50 },
    frase: { y: 1962, corpo: 78 },
    marchi: { y: 2072, alto: 64 },
    veloAlto: { finoA: 0.26, forza: 0.50 },
    veloBasso: { da: 0.77, forza: 0.82 },
  },
  {
    id: "locandina", file: "il-viaggiatore-locandina-27x40", nome: "locandina 27×40", w: 2700, h: 4000, impagina: "locandina",
    scena: { tavola: "locandina", modo: "locandina", yTavola: 52 },
    frase: { y: 386, corpo: 132 },
    titolo: { y: 3508, corpo: 196 },
    autore: { y: 3626, corpo: 62 },
    marchi: { y: 3836, alto: 92 },
    veloAlto: { finoA: 0.18, forza: 0.60 },
    veloBasso: { da: 0.74, forza: 0.98 },
  },
  {
    // l'anteprima social del repository su GitHub e Open Graph (1280×640): si vede piccola, quindi testi ben leggibili
    id: "github", file: "il-viaggiatore-github-1280x640", nome: "anteprima GitHub", w: 1280, h: 640, impagina: "cielo",
    scena: { tavola: "panoramica", modo: "copri", dx: 0, dy: 18 },
    titolo: { y: 74, corpo: 58 },
    autore: { y: 104, corpo: 20 },
    frase: { y: 572, corpo: 34 },
    marchi: { y: 614, alto: 28 },
    veloAlto: { finoA: 0.27, forza: 0.58 },
    veloBasso: { da: 0.75, forza: 0.84 },
  },
];
