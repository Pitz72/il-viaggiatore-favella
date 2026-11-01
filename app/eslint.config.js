// ====================================================================
//  ESLint: solo le regole che il codice dà già per scontate (dopo la 1.41.0).
// --------------------------------------------------------------------
//  I commenti «eslint-disable» c'erano da prima, senza un ESLint dietro: qui
//  le loro regole diventano vere. Due dei hook React (l'ordine delle chiamate e
//  le dipendenze degli effetti, dove un'eccezione voluta si dichiara con un
//  commento) e niente `any` non dichiarato. Lo stile no: lo tengono le persone.
//  Lo si lancia con  npm run controlla  (in app/); la CI lo fa a ogni push.
// ====================================================================
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["dist/", "public/", "node_modules/"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { parser: tseslint.parser },
    plugins: { "@typescript-eslint": tseslint.plugin, "react-hooks": reactHooks },
    linterOptions: { reportUnusedDisableDirectives: "error" },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];
