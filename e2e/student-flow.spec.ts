import { expect, test } from "@playwright/test";

test("student can enter the prototype and open a course", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page.getByRole("heading", { name: /Izy!/ })).toBeVisible();
  if ((page.viewportSize()?.width ?? 1200) <= 820) {
    await page.locator(".menu-button").click();
  }
  await page.getByRole("button", { name: "My Courses" }).click();
  await expect(page.getByRole("heading", { name: "My Courses", level: 1 })).toBeVisible();
  await page
    .getByRole("button", { name: /view course/i })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Introduction to Data Science", level: 1 }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
