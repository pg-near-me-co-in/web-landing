import { test, expect } from "@playwright/test";

/** Submits the full 4-step owner wizard, which writes real `owners` +
 *  `pg_listings` rows (status='pending_review', never publicly visible,
 *  but real rows). Gated off by default — there's no separate test/staging
 *  Supabase project today. Run manually with E2E_ALLOW_WRITES=1 against a
 *  throwaway/dev DB; the test-created listing name is prefixed
 *  "e2e-test-" for easy manual cleanup. */
test.describe("Add your PG wizard (write-gated)", () => {
  test.skip(
    process.env.E2E_ALLOW_WRITES !== "1",
    "Set E2E_ALLOW_WRITES=1 to run — writes real owners/pg_listings rows"
  );

  test("completes the 4-step wizard and shows the success state", async ({ page }) => {
    await page.goto("/add-your-pg");

    // Step 1 — Basics
    await page.getByLabel(/Your name/).fill("e2e-test-owner");
    await page.getByLabel(/Contact number/).fill("+919876543210");
    await page.getByLabel(/Property name/).fill("e2e-test-pg-listing");
    await page.getByRole("button", { name: "Continue →" }).click();

    // Step 2 — Location
    const citySelect = page.locator("#city_id");
    await citySelect.selectOption({ index: 1 });
    await page.getByRole("button", { name: "Continue →" }).click();

    // Step 3 — Pricing & amenities
    await page.getByText("Co-living", { exact: true }).click();
    await page.getByRole("button", { name: "Continue →" }).click();

    // Step 4 — Photos & review (photos optional, skip upload)
    await page
      .getByLabel(/Tell seekers about your PG/)
      .fill("Created by an automated end-to-end test — safe to delete.");
    await page.getByRole("button", { name: /Submit for review/ }).click();

    await expect(page.getByText(/Submission received/)).toBeVisible({ timeout: 15000 });
  });

  test("shows a native validation error when required fields are empty", async ({ page }) => {
    await page.goto("/add-your-pg");
    await page.getByRole("button", { name: "Continue →" }).click();
    // Native HTML validation blocks navigation past step 1 without the
    // required fields — still on the Basics step.
    await expect(page.getByLabel(/Your name/)).toBeVisible();
  });
});
