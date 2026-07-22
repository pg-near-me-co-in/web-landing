import { test, expect } from "@playwright/test";

/** Resolves a real launched city slug from the live sitemap rather than
 *  hardcoding one, so this spec survives seed-data changes. */
async function liveCitySlug(request: import("@playwright/test").APIRequestContext) {
  const xml = await (await request.get("/sitemap.xml")).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const cityUrl = urls.find((u) => /\/pg\/[^/]+$/.test(u));
  if (!cityUrl) throw new Error("No city URL found in sitemap.xml");
  return new URL(cityUrl).pathname;
}

test.describe("City listing page", () => {
  test("renders results and applies a budget filter via the GET form", async ({
    page,
    request,
  }) => {
    const cityPath = await liveCitySlug(request);
    const response = await page.goto(cityPath);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("PGs in");

    // Apply the "Under ₹8,000" budget filter via the desktop sidebar form —
    // a real GET submission, not client-only state, so the URL updates.
    await page.getByLabel("Budget").selectOption("8000");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page).toHaveURL(/price=8000/);
  });

  test("PG-type chips navigate to real, distinct URLs", async ({ page, request }) => {
    const cityPath = await liveCitySlug(request);
    await page.goto(cityPath);
    const girlsChip = page.getByRole("link", { name: "Girls", exact: true });
    await expect(girlsChip).toHaveAttribute("href", /type=female/);
  });
});
