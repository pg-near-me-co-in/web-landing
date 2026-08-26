import { test, expect } from "@playwright/test";

test("sitemap.xml is reachable and includes a listing URL", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.ok()).toBe(true);
  const body = await res.text();
  expect(body).toContain("<urlset");
  expect(body).toContain("/pg/vadodara");
});

test("robots.txt references the sitemap and disallows /admin", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.ok()).toBe(true);
  const body = await res.text();
  expect(body).toContain("Sitemap:");
  expect(body).toContain("Disallow: /admin");
});

test("manifest.webmanifest resolves with expected fields", async ({ request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.ok()).toBe(true);
  const json = await res.json();
  expect(json.name).toBe("PG Near Me");
  expect(json.display).toBe("standalone");
});

test("llms.txt is reachable", async ({ request }) => {
  const res = await request.get("/llms.txt");
  expect(res.ok()).toBe(true);
});

for (const path of ["/", "/about", "/cities", "/for-owners"]) {
  test(`${path} has exactly one canonical link and a description under 165 chars`, async ({ page }) => {
    await page.goto(path);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description).toBeTruthy();
    expect(description!.length).toBeLessThan(165);
  });
}

test("city and listing pages carry valid JSON-LD", async ({ page }) => {
  await page.goto("/pg/vadodara");
  const cityLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(() => JSON.parse(cityLd!)).not.toThrow();

  await page.goto("/pg/vadodara/sunrise-ladies-pg-alkapuri");
  const listingLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  const parsed = JSON.parse(listingLd!);
  expect(parsed["@type"]).toBe("LodgingBusiness");
});
