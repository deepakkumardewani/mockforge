import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/tests/setup.ts"],
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      // threshold enforced once coverage is meaningful (Task 4+)
    },
  },
});
