import { expect, test } from "@playwright/test";

test("student can sign in and open a course", async ({ page }) => {
  const student = {
    id: "student",
    name: "Izy Basco",
    email: "student@example.test",
    role: "Student",
  };
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({
      status: 401,
      json: { error: "Sign in to continue." },
    }),
  );
  await page.route("**/api/auth/login", (route) => route.fulfill({ json: student }));
  await page.route("**/api/learning/", (route) =>
    route.fulfill({
      json: {
        courses: [
          {
            id: "science",
            course_code: "COMP 034",
            course_name: "Introduction to Data Science",
            instructor_name: "Carlo Inovero",
            description: "",
            status: "Active",
          },
        ],
        activities: [],
      },
    }),
  );
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.getByLabel("Email").fill(student.email);
  await page.getByLabel("Password", { exact: true }).fill("demo-password");
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
