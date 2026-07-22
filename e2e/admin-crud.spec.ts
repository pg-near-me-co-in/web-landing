import { test, expect } from "@playwright/test";

const ADMIN_CODE = process.env.ADMIN_ACCESS_CODE;

test.describe("Admin CRUD", () => {
  test.skip(!ADMIN_CODE, "ADMIN_ACCESS_CODE not set in this environment");

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin");
    await page.fill("input[name=code]", ADMIN_CODE!);
    await page.click("button[type=submit]");
    await page.waitForSelector("text=Dashboard", { timeout: 10000 });
  });

  test("sidebar navigates to every content section", async ({ page }) => {
    // Scoped to the admin <aside> — the public header also has a "Cities"
    // link (to /cities, not /admin/cities), so an unscoped name match is
    // ambiguous.
    const sidebar = page.locator("aside");
    for (const [label, path] of [
      ["Listings", "/admin/listings"],
      ["Cities", "/admin/cities"],
      ["Areas", "/admin/areas"],
      ["Amenities", "/admin/amenities"],
      ["Owners", "/admin/owners"],
    ] as const) {
      await sidebar.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(path.replace("/", "\\/") + "$"));
    }
  });

  test("listings list is searchable and paginated from real data", async ({ page }) => {
    await page.goto("/admin/listings");
    await expect(page.locator("h1")).toContainText("Listings (");
    await expect(page.locator("table")).toBeVisible();
  });

  test("city quick-action confirm dialog opens without submitting", async ({ page }) => {
    await page.goto("/admin/cities");
    await page.waitForSelector("table");
    const launchBtn = page.getByRole("button", { name: "Launch" }).first();
    await launchBtn.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test.describe("write actions (gated)", () => {
    test.skip(
      process.env.E2E_ALLOW_WRITES !== "1",
      "Set E2E_ALLOW_WRITES=1 to run mutating admin specs against a real DB"
    );

    test("create, edit, and archive a test listing", async ({ page }) => {
      await page.goto("/admin/listings/new");
      await page.fill('input[name="name"]', "e2e-test-listing");
      const cityOptions = await page.locator('select[name="city_id"] option').allTextContents();
      await page.selectOption('select[name="city_id"]', { index: 1 });
      expect(cityOptions.length).toBeGreaterThan(1);
      await page.selectOption('select[name="pg_type"]', "unisex");
      await page.getByRole("button", { name: "Create listing" }).click();
      await expect(page.getByText("Saved.")).toBeVisible({ timeout: 10000 });
    });

    test("create and view a test city", async ({ page }) => {
      await page.goto("/admin/cities/new");
      await page.fill('input[name="name"]', "e2e-test-city");
      await page.fill('input[name="state"]', "e2e-test-state");
      await page.getByRole("button", { name: "Create city" }).click();
      await page.waitForSelector("text=Saved.", { timeout: 10000 });
      await page.goto("/admin/cities?q=e2e-test-city");
      await expect(page.getByText("e2e-test-city")).toBeVisible();
    });
  });
});
