import { test, expect } from "@playwright/test";

test.describe("PWA", () => {
  test("manifest is valid with both any and maskable icons", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.status()).toBe(200);
    const manifest = await res.json();
    expect(manifest.name).toBe("PG Near Me");
    expect(manifest.display).toBe("standalone");
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === "maskable")).toBe(true);
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose !== "maskable")).toBe(true);
  });

  test("service worker file is served", async ({ request }) => {
    const res = await request.get("/sw.js");
    expect(res.status()).toBe(200);
  });

  test("home page links the manifest", async ({ page }) => {
    await page.goto("/");
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute("href", /manifest\.webmanifest/);
  });

  test("offline fallback page renders standalone", async ({ page }) => {
    const response = await page.goto("/offline");
    expect(response?.status()).toBe(200);
    await expect(page.getByText("You're offline")).toBeVisible();
  });

  test("every icon referenced in the manifest actually resolves", async ({ request }) => {
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    for (const icon of manifest.icons as { src: string }[]) {
      const res = await request.get(icon.src);
      expect(res.status(), `${icon.src} should be reachable`).toBe(200);
    }
  });
});
