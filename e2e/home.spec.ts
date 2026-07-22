import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("hero, search form, nav and footer all render with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      // Generic network-failure boilerplate — the more precise `response`
      // listener below tracks actual failed requests (with URLs) instead.
      if (msg.text().startsWith("Failed to load resource")) return;
      errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("response", (res) => {
      // @vercel/speed-insights probes a Vercel-platform-only endpoint that
      // genuinely doesn't exist outside actual Vercel hosting (local dev,
      // CI, this test run) — expected 404, not a real bug. Console message
      // text for failed-resource errors doesn't include the URL, so this
      // has to be filtered at the network-response level instead.
      if (res.status() === 404 && res.url().includes("_vercel/speed-insights")) return;
      if (res.status() >= 400) errors.push(`${res.status()} ${res.url()}`);
    });

    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Your next room is"
    );

    // Search card
    await expect(page.getByPlaceholder(/Bengaluru, Pune, Vadodara/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Search listings" })).toBeVisible();

    // Header nav
    const mainNav = page.getByLabel("Main");
    await expect(mainNav.getByRole("link", { name: "Cities", exact: true })).toBeVisible();

    // Footer
    const footer = page.locator("footer");
    await expect(footer).toContainText("Zero brokerage");
    await expect(footer.getByRole("link", { name: "Privacy" })).toBeVisible();

    expect(errors, `console/page errors: ${errors.join("; ")}`).toEqual([]);
  });

  test("PG-type toggle group updates the search state", async ({ page }) => {
    await page.goto("/");
    const girlsToggle = page.getByRole("radio", { name: "Girls" });
    await girlsToggle.click();
    await expect(girlsToggle).toHaveAttribute("data-state", "on");
  });
});
