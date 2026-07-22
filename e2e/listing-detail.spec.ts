import { test, expect } from "@playwright/test";

async function liveListingPath(request: import("@playwright/test").APIRequestContext) {
  const xml = await (await request.get("/sitemap.xml")).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const listingUrl = urls.find((u) => /\/pg\/[^/]+\/[^/]+\/[^/]+$/.test(u));
  if (!listingUrl) throw new Error("No listing URL found in sitemap.xml");
  return new URL(listingUrl).pathname;
}

test.describe("Listing detail page", () => {
  test("renders facts, JSON-LD, and the contact-reveal CTA (read-only, no submission)", async ({
    page,
    request,
  }) => {
    const path = await liveListingPath(request);
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Overview")).toBeVisible();

    const ldJsonBlocks = await page.locator('script[type="application/ld+json"]').all();
    expect(ldJsonBlocks.length).toBeGreaterThan(0);

    // Contact-reveal button is present but not clicked — it captures a real
    // lead on submission, which is covered separately by the write-gated
    // contact-reveal.spec.ts.
    await expect(
      page.getByRole("button", { name: /Show contact number/i })
    ).toBeVisible();
  });

  test("clicking through from a city listing card lands on a real detail page", async ({
    page,
    request,
  }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const cityUrl = urls.find((u) => /\/pg\/[^/]+$/.test(u));
    expect(cityUrl).toBeTruthy();

    await page.goto(new URL(cityUrl!).pathname);

    // The PG-type filter chips on this same page are also /pg/... links
    // (e.g. ?type=female) but only 1 path segment deep — find a real
    // listing-card link (3 segments: /pg/city/area/slug) by inspecting
    // hrefs directly rather than guessing a CSS selector for it.
    const hrefs = await page.locator("main a[href^='/pg/']").evaluateAll((els) =>
      els.map((el) => el.getAttribute("href") ?? "")
    );
    const listingHref = hrefs.find((h) => /^\/pg\/[^/]+\/[^/]+\/[^/]+$/.test(h));
    expect(listingHref, `no listing-card link found on ${new URL(cityUrl!).pathname}`).toBeTruthy();

    await page.locator(`main a[href="${listingHref}"]`).first().click();
    await expect(page).toHaveURL(/\/pg\/[^/]+\/[^/]+\/[^/]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
