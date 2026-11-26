import { randomBytes } from "node:crypto";
import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import type { AdminData } from "../src/features/admin/types";

const live = process.env.LMS_LIVE_DEMO === "1";
const requestHeaders = { "X-LMS-Request": "1" };

async function signIn(page: Page, email: string, password: string, remember = false) {
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  if (remember) await page.getByLabel("Remember me").check();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

async function readDashboard(request: APIRequestContext): Promise<AdminData> {
  const response = await request.get("/api/admin/dashboard");
  expect(response.ok()).toBe(true);
  return response.json();
}

test("live Supabase administration, role restrictions and logout", async ({
  page,
  browser,
}, testInfo) => {
  test.skip(
    !live || testInfo.project.name !== "desktop",
    "Requires an administrator and a running database-backed API.",
  );
  test.setTimeout(180000);
  const adminEmail = process.env.LMS_ADMIN_EMAIL;
  const adminPassword = process.env.LMS_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword)
    throw new Error("Supply LMS_ADMIN_EMAIL and LMS_ADMIN_PASSWORD.");

  const run = randomBytes(4).toString("hex");
  const student = { name: `Demo Student ${run}`, email: `demo-student-${run}@example.test` };
  const instructor = {
    name: `Demo Instructor ${run}`,
    email: `demo-instructor-${run}@example.test`,
  };
  const replacement = {
    name: `Demo Replacement ${run}`,
    email: `demo-replacement-${run}@example.test`,
  };
  const password = randomBytes(18).toString("base64url");
  const code = `DEMO-${run.toUpperCase()}`;
  const screenshot = (name: string) =>
    page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });

  const health = await page.request.get("/api/health/database");
  expect(await health.json()).toEqual({ status: "ok", ssl: true });
  expect((await page.request.get("/api/admin/dashboard")).status()).toBe(401);
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await signIn(page, adminEmail, "a-deliberately-invalid-password");
  await expect(page.getByRole("alert")).toContainText("incorrect");
  await signIn(page, adminEmail, adminPassword, true);
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText("Database connected", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Platform administration" })).toBeVisible();
  await expect(page.getByText("Database connected", { exact: true })).toBeVisible();
  const cookie = (await page.context().cookies()).find((entry) => entry.name === "pup_session");
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe("Lax");
  expect(cookie?.expires).toBeGreaterThan(Date.now() / 1000);
  const baseline = (await readDashboard(page.request)).stats;
  function cardValue(label: string, value: number) {
    return expect(
      page.locator(".stat-card").filter({ hasText: label }).locator("strong"),
    ).toHaveText(value.toLocaleString());
  }

  async function addAccount(account: typeof student, role: "Student" | "Instructor") {
    await page.getByRole("button", { name: "Add account" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Name", { exact: true }).fill(account.name);
    await dialog.getByLabel("Email", { exact: true }).fill(account.email);
    await dialog.getByLabel("Role", { exact: true }).selectOption(role);
    await dialog.getByLabel("Password", { exact: true }).fill(password);
    await dialog.getByRole("button", { name: "Save" }).click();
    return dialog;
  }

  const roleContexts = [];
  try {
    await page.getByRole("button", { name: "User Management", exact: true }).click();
    for (const [account, role] of [
      [student, "Student"],
      [instructor, "Instructor"],
      [replacement, "Instructor"],
    ] as const) {
      await expect(await addAccount(account, role)).toBeHidden();
      await expect(
        page.getByRole("button", { name: `Edit account ${account.name}` }),
      ).toBeEnabled();
    }
    const duplicateEmail = await addAccount(
      { ...student, email: student.email.toUpperCase() },
      "Student",
    );
    await expect(duplicateEmail.getByRole("alert")).toContainText("already registered");
    await duplicateEmail.getByRole("button", { name: "Cancel" }).click();
    await page.getByLabel("Search name or email").fill(student.email);
    await page.getByLabel("Filter by role").selectOption("Instructor");
    await expect(page.getByText("No matching accounts.")).toBeVisible();
    await page.getByLabel("Filter by role").selectOption("Student");
    await page.getByRole("button", { name: `Edit account ${student.name}` }).click();
    const editedStudent = `${student.name} Edited`;
    await page.getByRole("dialog").getByLabel("Name", { exact: true }).fill(editedStudent);
    await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("button", { name: `Edit account ${editedStudent}` })).toBeEnabled();
    await screenshot("02-user-management");

    for (const [account, deniedPath, home] of [
      [student, "/instructor", "/dashboard"],
      [instructor, "/dashboard", "/instructor"],
    ] as const) {
      const context = await browser.newContext({ baseURL: testInfo.project.use.baseURL });
      roleContexts.push(context);
      const rolePage = await context.newPage();
      await rolePage.goto("/admin");
      await signIn(rolePage, account.email, password);
      await expect(rolePage).toHaveURL(new RegExp(`${home}$`));
      await rolePage.goto("/admin");
      await expect(rolePage).toHaveURL(new RegExp(`${home}$`));
      await rolePage.goto(deniedPath);
      await expect(rolePage).toHaveURL(new RegExp(`${home}$`));
      expect((await context.request.get("/api/admin/dashboard")).status()).toBe(403);
      expect(
        (
          await context.request.post("/api/admin/accounts", { headers: requestHeaders, data: {} })
        ).status(),
      ).toBe(403);
    }

    await page.getByRole("button", { name: "Course Management", exact: true }).click();
    await page.getByRole("button", { name: "Add course" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByLabel("Course code").fill(code.toLowerCase());
    await dialog.getByLabel("Course name").fill("Demo Course");
    await dialog.getByLabel("Description").fill("Temporary demonstration course.");
    await dialog.getByLabel("Instructor", { exact: true }).selectOption({ label: instructor.name });
    await dialog.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("button", { name: `Edit course ${code}` })).toBeEnabled();
    const beforeEdit = await readDashboard(page.request);
    const course = beforeEdit.courses.find((entry) => entry.course_code === code)!;
    expect(course.instructor_name).toBe(instructor.name);
    const duplicateCourse = await page.request.post("/api/admin/courses", {
      headers: requestHeaders,
      data: { ...course, course_code: code.toLowerCase() },
    });
    expect(duplicateCourse.status()).toBe(409);
    await page.getByRole("button", { name: `Edit course ${code}` }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByLabel("Course name").fill("Demo Course Updated");
    await dialog
      .getByLabel("Instructor", { exact: true })
      .selectOption({ label: replacement.name });
    await dialog.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(`Instructor: ${replacement.name}`, { exact: true })).toBeVisible();
    await screenshot("03-course-management");

    await page.getByRole("button", { name: "Enrollments", exact: true }).click();
    async function enroll() {
      await page.getByRole("button", { name: "Enroll student", exact: true }).click();
      const dialog = page.getByRole("dialog");
      await dialog
        .getByLabel("Student", { exact: true })
        .selectOption({ label: `${editedStudent} · ${student.email}` });
      await dialog
        .getByLabel("Course", { exact: true })
        .selectOption({ label: `${code} · Demo Course Updated` });
      await dialog.getByRole("button", { name: "Enroll", exact: true }).click();
      return dialog;
    }
    await expect(await enroll()).toBeHidden();
    const row = page.getByRole("button", {
      name: `Manage enrollment for ${editedStudent} in ${code}`,
    });
    await expect(row).toBeEnabled();
    const duplicate = await enroll();
    await expect(duplicate.getByRole("alert")).toContainText("already exists");
    await duplicate.getByRole("button", { name: "Cancel" }).click();
    await page.getByLabel("Filter by course").selectOption(course.id);
    await page
      .getByLabel("Filter by student")
      .selectOption({ label: `${editedStudent} · ${student.email}` });
    await expect(row).toBeVisible();
    await screenshot("04-enrollments");
    await row.click();
    await page.getByRole("dialog").getByRole("button", { name: "Deactivate", exact: true }).click();
    await expect(page.getByText("Enrollment deactivated.", { exact: true })).toBeVisible();
    await expect(row).toBeEnabled();
    await row.click();
    await page.getByRole("dialog").getByRole("button", { name: "Reactivate", exact: true }).click();
    await expect(page.getByText("Enrollment reactivated.", { exact: true })).toBeVisible();
    await expect(row).toBeEnabled();

    await page.getByRole("button", { name: "Overview", exact: true }).click();
    await cardValue("Total registered users", baseline.users + 3);
    await cardValue("Total students", baseline.students + 1);
    await cardValue("Total instructors", baseline.instructors + 2);
    await cardValue("Total administrators", baseline.administrators);
    await cardValue("Total courses", baseline.courses + 1);
    await cardValue("Total student enrollments", baseline.enrollments + 1);
    await screenshot("01-dashboard");

    await page.getByRole("button", { name: "User Management", exact: true }).click();
    await page.getByRole("button", { name: `Edit account ${editedStudent}` }).click();
    await page.getByRole("dialog").getByLabel("Status").selectOption("Inactive");
    page.once("dialog", (confirmation) => confirmation.dismiss());
    await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    page.once("dialog", (confirmation) => confirmation.accept());
    await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Account updated.", { exact: true })).toBeVisible();
    expect((await roleContexts[0].request.get("/api/auth/session")).status()).toBe(401);
    const inactiveLogin = await roleContexts[0].request.post("/api/auth/login", {
      headers: requestHeaders,
      data: { email: student.email, password },
    });
    expect(inactiveLogin.status()).toBe(401);

    await page.getByRole("button", { name: "Course Management", exact: true }).click();
    await page.getByRole("button", { name: `Edit course ${code}` }).click();
    await page.getByRole("dialog").getByLabel("Status").selectOption("Inactive");
    page.once("dialog", (confirmation) => confirmation.accept());
    await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Course updated.", { exact: true })).toBeVisible();
    const deactivated = await readDashboard(page.request);
    expect(deactivated.courses.find((entry) => entry.id === course.id)?.status).toBe("Inactive");
    expect(deactivated.stats.active_enrollments).toBe(baseline.active_enrollments);
    expect(deactivated.stats.active_courses).toBe(baseline.active_courses);
    expect(deactivated.stats.active_students).toBe(baseline.active_students);
    expect(deactivated.enrollments.find((entry) => entry.course_id === course.id)).toBeDefined();

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileEdit = page.getByRole("button", { name: `Edit course ${code}` });
    await mobileEdit.scrollIntoViewIfNeeded();
    await expect(mobileEdit).toBeVisible();
    await mobileEdit.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();
  } finally {
    for (const context of roleContexts) await context.close();
    const actual = await readDashboard(page.request);
    const course = actual.courses.find((entry) => entry.course_code === code);
    for (const enrollment of actual.enrollments.filter(
      (entry) => entry.course_id === course?.id && entry.status === "Active",
    )) {
      const response = await page.request.patch(`/api/admin/enrollments/${enrollment.id}`, {
        headers: requestHeaders,
        data: { status: "Inactive" },
      });
      expect(response.ok()).toBe(true);
    }
    if (course?.status === "Active") {
      const response = await page.request.put(`/api/admin/courses/${course.id}`, {
        headers: requestHeaders,
        data: { ...course, status: "Inactive" },
      });
      expect(response.ok()).toBe(true);
    }
    for (const account of actual.accounts.filter(
      (entry) =>
        [student.email, instructor.email, replacement.email].includes(entry.email) &&
        entry.status === "Active",
    )) {
      const response = await page.request.put(`/api/admin/accounts/${account.id}`, {
        headers: requestHeaders,
        data: { ...account, status: "Inactive" },
      });
      expect(response.ok()).toBe(true);
    }
  }

  const oldSession = (await page.context().cookies()).find(
    (entry) => entry.name === "pup_session",
  )!;
  await page.locator(".profile-trigger").click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  const replay = await page.request.get("/api/admin/dashboard", {
    headers: { Cookie: `pup_session=${oldSession.value}` },
  });
  expect(replay.status()).toBe(401);
});
