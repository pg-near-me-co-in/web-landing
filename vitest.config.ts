import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  // "server-only" (imported by db.ts/theme.ts/queries.ts/audit.ts) uses a
  // conditional export: Next's bundler sets the "react-server" condition
  // and gets a no-op; Vitest executes test files through Vite's SSR
  // pipeline, which resolves conditions via `ssr.resolve` (not the
  // top-level `resolve`), and falls through to a version that
  // unconditionally throws without this. Matching Next's condition here
  // lets these modules load in tests without stubbing.
  ssr: {
    resolve: {
      conditions: ["react-server"],
    },
  },
  test: {
    environment: "node",
    globals: false,
    include: ["src/**/__tests__/**/*.test.ts"],
  },
});
