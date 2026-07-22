import { test, expect } from "@playwright/test";

/** Submits the contact-reveal form on a real listing, which writes a row to
 *  `leads` — there's no separate test/staging Supabase project today, so
 *  this is gated off by default. Run manually with E2E_ALLOW_WRITES=1
 *  against a throwaway/dev DB when you want to exercise the real write path. */
test.describe("Contact reveal (write-gated)", () => {
  test.skip(
    process.env.E2E_ALLOW_WRITES !== "1",
    "Set E2E_ALLOW_WRITES=1 to run — writes a real row to `leads`"
  );

  test("revealing a contact number submits a real lead", async ({ page, request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const listingUrl = urls.find((u) => /\/pg\/[^/]+\/[^/]+\/[^/]+$/.test(u));
    expect(listingUrl).toBeTruthy();

    await page.goto(new URL(listingUrl!).pathname);
    await page.getByRole("button", { name: /Show contact number/i }).click();
    await page.getByPlaceholder("Your name").fill("e2e-test-seeker");
    await page.getByPlaceholder(/mobile number/i).fill("+919876543210");
    await page.getByRole("button", { name: /Reveal number/i }).click();

    // Either the owner's number is revealed, or (if unverified) the
    // "interest noted" fallback state renders — both are valid outcomes of
    // a successful `leads` insert.
    await expect(
      page.getByText(/Owner contact|Interest noted/i)
    ).toBeVisible({ timeout: 10000 });
  });
});
