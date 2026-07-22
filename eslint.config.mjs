import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored reference project — not part of the shipped app, not our code style.
    "ref/**",
    // Playwright's own generated output.
    "playwright-report/**",
    "test-results/**",
  ]),
  {
    // Plain Node CommonJS utility scripts — not bundled by Next, `require()` is correct here.
    files: ["scripts/**/*.js", "supabase/seed/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
