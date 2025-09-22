import { expect, test } from "@playwright/test";

test("health check endpoint responds correctly", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body).toHaveProperty("status", "ok");
  expect(body).toHaveProperty("timestamp");
  expect(body).toHaveProperty("version");
  expect(body).toHaveProperty("checks");
});

test("home page loads successfully", async ({ page }) => {
  await page.goto("/");

  // Check if the page loaded without error
  await expect(page).toHaveTitle(/Mirael/i);

  // Check for basic content presence
  await expect(page.locator("body")).toBeVisible(); // Ensures page isn't blank
});
