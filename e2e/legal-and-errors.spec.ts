import { test, expect } from "@playwright/test";

test.describe("Legal pages", () => {
  test("privacy policy renders and is in the sitemap", async ({ page, request }) => {
    const response = await page.goto("/privacy-policy");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Privacy Policy");

    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/privacy-policy");
  });

  test("terms page renders and is in the sitemap", async ({ page, request }) => {
    const response = await page.goto("/terms");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Terms of Use");

    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/terms");
  });

  test("footer links to both legal pages", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/privacy-policy"
    );
    await expect(footer.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
  });
});

test.describe("Error/not-found pages", () => {
  test("unknown route renders the styled 404", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist-xyz");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("This page moved out.")).toBeVisible();
  });
});
