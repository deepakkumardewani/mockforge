import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    test: {
      name: "unit",
      include: ["src/**/*.unit.test.ts"],
      globals: true,
      environment: "node",
      setupFiles: ["./src/tests/setup.ts"],
    },
  },
  {
    test: {
      name: "integration",
      include: ["src/**/*.integration.test.ts"],
      globals: true,
      environment: "node",
      setupFiles: ["./src/tests/setup.ts"],
    },
  },
]);
