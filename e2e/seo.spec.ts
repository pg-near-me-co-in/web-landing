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

test("homepage exposes OG and Twitter image tags with the brand OG asset", async ({ page }) => {
  await page.goto("/");
  const ogImage = page.locator('meta[property="og:image"]');
  await expect(ogImage.first()).toHaveAttribute("content", /og\.(png|jpg|jpeg|webp)/i);
  const twImage = page.locator('meta[name="twitter:image"], meta[property="twitter:image"]');
  await expect(twImage.first()).toHaveAttribute("content", /og\.(png|jpg|jpeg|webp)|opengraph-image|twitter-image/i);
  await expect(page.locator('meta[property="og:title"]').first()).toHaveAttribute("content", /PG Near Me/);
  await expect(page.locator('meta[name="twitter:card"]').first()).toHaveAttribute("content", "summary_large_image");
});

test("brand logo and OG image assets are reachable", async ({ request }) => {
  for (const path of ["/logo.png", "/og.png", "/icons/icon-512.png"]) {
    const res = await request.get(path);
    expect(res.ok(), path).toBe(true);
    expect(res.headers()["content-type"] ?? "").toMatch(/image\//);
  }
});

test("city and listing pages carry valid JSON-LD", async ({ page }) => {
  await page.goto("/pg/vadodara");
  const cityLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(() => JSON.parse(cityLd!)).not.toThrow();

  await page.goto("/pg/vadodara/stanza-living-auckland-house-pg-in-waghodia-road-vadodara");
  const listingLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  const parsed = JSON.parse(listingLd!);
  expect(parsed["@type"]).toBe("LodgingBusiness");
});

test("homepage JSON-LD includes Organization with logo", async ({ page }) => {
  await page.goto("/");
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  const parsed = scripts.flatMap((t) => {
    const v = JSON.parse(t);
    return Array.isArray(v) ? v : [v];
  });
  const org = parsed.find((x) => x["@type"] === "Organization");
  expect(org?.logo).toMatch(/logo\.png/);
  expect(org?.name).toBe("PG Near Me");
});
