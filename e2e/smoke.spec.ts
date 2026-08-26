import { test, expect } from "@playwright/test";

test("homepage renders the map hero and nav", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("one map");
  await expect(page.getByRole("banner").getByRole("link", { name: "PG Near Me — home" })).toBeVisible();
});

test("city page renders listings and filters", async ({ page }) => {
  await page.goto("/pg/vadodara");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Vadodara");
  await expect(page.getByLabel("Filter listings by city")).toBeVisible();
});

test("gender filter narrows results via URL", async ({ page }) => {
  await page.goto("/pg/vadodara");
  await page.getByRole("button", { name: "Female", exact: true }).click();
  await expect(page).toHaveURL(/gender=female/);
});

test("listing detail page reveals contact instantly, no gate", async ({ page }) => {
  await page.goto("/pg/vadodara/stanza-living-auckland-house-pg-in-waghodia-road-vadodara");
  await expect(page.getByRole("heading", { name: /Stanza Living Auckland House/ })).toBeVisible();
  await page.getByRole("button", { name: "Reveal owner number" }).click();
  await expect(page.getByRole("link", { name: /\+91/ })).toBeVisible();
});

test("cities directory lists both live and upcoming cities", async ({ page }) => {
  await page.goto("/cities");
  await expect(page.getByText("Live", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Soon", { exact: true }).first()).toBeVisible();
});

test("List your PG CTA points to the external owner form, not a dead page", async ({ page }) => {
  await page.goto("/for-owners");
  const link = page.getByRole("link", { name: /List your PG/ });
  await expect(link).toHaveAttribute("href", /^https:\/\//);
  await expect(link).toHaveAttribute("target", "_blank");
});
