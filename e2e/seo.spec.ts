import { test, expect } from "@playwright/test";

/** Pulls real city/listing URLs from the live sitemap.xml rather than
 *  hardcoding slugs, so this spec survives seed-data changes. Plain regex
 *  extraction — sitemap.xml's <loc> entries are simple enough that pulling
 *  in a full XML parser dependency just for this test isn't worth it. */
async function sampleUrls(request: import("@playwright/test").APIRequestContext) {
  const xml = await (await request.get("/sitemap.xml")).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const cityUrl = urls.find((u) => /\/pg\/[^/]+$/.test(u));
  const listingUrl = urls.find((u) => /\/pg\/[^/]+\/[^/]+\/[^/]+$/.test(u));
  return { cityUrl, listingUrl };
}

test.describe("SEO fundamentals", () => {
  test("robots.txt and sitemap.xml are well-formed and reachable", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap:");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    expect(xml).toContain("<urlset");
    expect(xml).toContain("<loc>");
  });

  for (const path of ["/", "/about", "/cities", "/for-owners"]) {
    test(`${path} has exactly one canonical link and a non-empty description under 165 chars`, async ({
      page,
    }) => {
      await page.goto(path);
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveCount(1);

      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(0);
      expect(description!.length).toBeLessThan(165);
    });
  }

  test("a live city page and a listing page resolve from the sitemap, have canonical + valid JSON-LD", async ({
    page,
    request,
  }) => {
    const { cityUrl, listingUrl } = await sampleUrls(request);
    expect(cityUrl, "sitemap should contain at least one city URL").toBeTruthy();
    expect(listingUrl, "sitemap should contain at least one listing URL").toBeTruthy();

    for (const url of [cityUrl!, listingUrl!]) {
      const path = new URL(url).pathname;
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);

      const ldJsonBlocks = await page.locator('script[type="application/ld+json"]').all();
      expect(ldJsonBlocks.length).toBeGreaterThan(0);
      for (const block of ldJsonBlocks) {
        const text = await block.textContent();
        const parsed = JSON.parse(text!);
        expect(parsed["@type"] || parsed["@graph"]).toBeTruthy();
      }
    }
  });
});
