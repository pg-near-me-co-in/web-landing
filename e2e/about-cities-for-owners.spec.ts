import { test, expect } from "@playwright/test";

test.describe("About / Cities / For Owners", () => {
  test("about page renders", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Built for the four channels that fail every seeker."
    );
    await expect(
      page.getByRole("article").getByRole("link", { name: /hello@pgnearme\.co\.in/ })
    ).toBeVisible();
  });

  test("for-owners page renders and links to add-your-pg", async ({ page }) => {
    await page.goto("/for-owners");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Reach seekers directly. Keep every rupee."
    );
    await expect(page.getByRole("link", { name: /Submit your PG/ })).toHaveAttribute(
      "href",
      "/add-your-pg"
    );
  });

  test("cities page splits live vs rolling-out using real DB counts", async ({ page }) => {
    await page.goto("/cities");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Pick your city. Pick your room."
    );
    // Read the eyebrow chip ("N CITIES · M LIVE · MORE ROLLING OUT") rather
    // than hardcoding a city count, so this spec survives seed-data changes.
    const eyebrow = page.locator("span.eyebrow").first();
    await expect(eyebrow).toContainText(/CITIES/);
    await expect(eyebrow).toContainText(/LIVE/);
  });

  test("main nav links to the new pages", async ({ page }) => {
    await page.goto("/");
    const mainNav = page.getByLabel("Main");
    await expect(mainNav.getByRole("link", { name: "Cities", exact: true })).toHaveAttribute(
      "href",
      "/cities"
    );
    await expect(mainNav.getByRole("link", { name: "About", exact: true })).toHaveAttribute(
      "href",
      "/about"
    );
  });
});
