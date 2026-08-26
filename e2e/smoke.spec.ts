import { test, expect } from "@playwright/test";

test("homepage renders hero and nav", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("banner").getByRole("link", { name: "PG Near Me — home" })).toBeVisible();
});

test("city page renders listings", async ({ page }) => {
  await page.goto("/pg/vadodara");
  await expect(page.getByRole("heading", { level: 1, name: "PGs in Vadodara" })).toBeVisible();
});

test("listing detail page renders and reveals contact on submit", async ({ page }) => {
  await page.goto("/pg/vadodara/sunrise-ladies-pg-alkapuri");
  await expect(page.getByRole("heading", { name: "Sunrise Ladies PG" })).toBeVisible();
  await page.getByRole("button", { name: "Show contact number" }).click();
  await page.getByPlaceholder("Your mobile number *").fill("9876543210");
  await page.getByRole("button", { name: "Reveal number" }).click();
  await expect(page.getByText("Owner contact", { exact: true })).toBeVisible();
});

test("cities directory lists both live and upcoming cities", async ({ page }) => {
  await page.goto("/cities");
  await expect(page.getByText("LIVE", { exact: true })).toBeVisible();
  await expect(page.getByText("SOON", { exact: true }).first()).toBeVisible();
});

test("add-your-pg form is present", async ({ page }) => {
  await page.goto("/add-your-pg");
  await expect(page.getByRole("button", { name: "Submit listing →" })).toBeVisible();
});
