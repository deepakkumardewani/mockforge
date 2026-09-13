import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      include: [
        "src/components/**/*.{ts,tsx}",
        "src/hooks/**/*.{ts,tsx}",
        "src/lib/**/*.{ts,tsx}",
        "src/store/**/*.{ts,tsx}",
      ],
      exclude: [
        "src/**/*.test.*",
        "src/tests/**",
        "src/app/**",
        "src/lib/source.ts",
        "src/components/builder/types.ts",
        "src/components/Providers.tsx",
        "src/components/playground/shared/CodeEditor.tsx",
        "src/components/landing/entity-icons.tsx",
        "src/components/landing/depth/**",
      ],
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 80 },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
