import { test, expect } from "@playwright/test";

/**
 * Full flow needs both web (3000) and API (4000). playwright.config starts both via webServer.
 * Skip when API health is unreachable (e.g. local run without `bun run dev --filter @mockforge/api`).
 * Exclude in CI when API is not provisioned: `playwright test --grep-invert @requires-api`
 */
test.describe("Playground happy path", { tag: "@requires-api" }, () => {
  test.beforeAll(async ({ request }) => {
    const res = await request.get("http://localhost:4000/health").catch(() => null);
    test.skip(!res?.ok(), "MockForge API not reachable at http://localhost:4000");
  });

  test("loads tabs and REST GET /api/users returns 200 in the viewer", async ({ page }) => {
    await page.goto("/playground");
    await expect(page.getByRole("heading", { name: "Playground", level: 1 })).toBeVisible();

    await page.getByRole("tab", { name: "GraphQL" }).click();
    await page.getByRole("tab", { name: "WebSocket" }).click();
    await page.getByRole("tab", { name: "Socket.IO" }).click();
    await page.getByRole("tab", { name: "REST" }).click();

    const panel = page.locator('[role="tabpanel"][data-state="active"]');
    await panel.getByRole("button", { name: "List users" }).click();
    await panel.getByRole("button", { name: "Send" }).click();

    await expect(panel.getByText("200", { exact: true })).toBeVisible({ timeout: 20_000 });
  });
});
