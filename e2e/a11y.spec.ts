import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Directly supports the Lighthouse-100 goal — accessibility and SEO audits
 *  overlap (link-name, image-alt, meta-viewport, color-contrast, etc.). */
test.describe("Accessibility (axe)", () => {
  for (const path of ["/", "/about", "/cities", "/for-owners"]) {
    test(`${path} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? "")
      );
      if (serious.length > 0) {
        console.log(JSON.stringify(serious, null, 2));
      }
      expect(serious).toEqual([]);
    });
  }

  test("a live city page has no serious or critical axe violations", async ({ page, request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const cityUrl = urls.find((u) => /\/pg\/[^/]+$/.test(u));
    expect(cityUrl).toBeTruthy();
    await page.goto(new URL(cityUrl!).pathname);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? "")
    );
    if (serious.length > 0) {
      console.log(JSON.stringify(serious, null, 2));
    }
    expect(serious).toEqual([]);
  });

  test("a listing detail page has no serious or critical axe violations", async ({
    page,
    request,
  }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const listingUrl = urls.find((u) => /\/pg\/[^/]+\/[^/]+\/[^/]+$/.test(u));
    expect(listingUrl).toBeTruthy();
    await page.goto(new URL(listingUrl!).pathname);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? "")
    );
    if (serious.length > 0) {
      console.log(JSON.stringify(serious, null, 2));
    }
    expect(serious).toEqual([]);
  });
});
