import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    environment: "node",
    // fake-indexeddb должен встать в глобальный scope до импорта Dexie.
    setupFiles: ["./vitest.setup.ts"],
    include: ["lib/**/*.test.ts"],
  },
});
