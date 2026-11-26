import { randomBytes } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import type { AdminData } from "../src/features/admin/types";
import type { StaffCourse, StudentLearning } from "../src/features/learning/types";

const headers = { "X-LMS-Request": "1" };
const courseName = "INTRODUCTION TO DATABASE SYSTEMS";
const activityName = "DATABASE DESIGN ACTIVITY";

async function signIn(page: Page, email: string, password: string) {
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

test("an administrator, instructor, and student complete a live academic workflow", async ({
  page: admin,
  browser,
}, info) => {
  test.skip(
    process.env.LMS_LIVE_DEMO !== "1" || info.project.name !== "desktop",
    "Requires a running LMS and a Supabase administrator.",
  );
  test.setTimeout(240000);
  const adminEmail = process.env.LMS_ADMIN_EMAIL;
  const adminPassword = process.env.LMS_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) throw new Error("Set LMS_ADMIN_EMAIL and LMS_ADMIN_PASSWORD.");
  const suffix = randomBytes(4).toString("hex");
  const code = `FLOW-${suffix.toUpperCase()}`;
  const password = randomBytes(18).toString("base64url");
  const account = (label: string) => ({
    name: `Workflow ${label} ${suffix}`,
    email: `workflow-${label.toLowerCase()}-${suffix}@example.test`,
  });
  const teacher = account("Instructor");
  const rejected = account("Rejected");
  const otherTeacher = account("Observer");
  const pupil = account("Student");
  const peer = account("Peer");
  const answer = "A primary key identifies a record. An enrollment links a student to a course.";
  const feedback = "Good use of keys. Explain how the enrollment constraint prevents duplicates.";
  const screenshot = (page: Page, name: string) =>
    page.screenshot({ path: info.outputPath(`${name}.png`), fullPage: true });
  const contexts = [];
  const snapshot = async (): Promise<AdminData> => {
    const response = await admin.request.get("/api/admin/dashboard");
    expect(response.ok()).toBe(true);
    return response.json();
  };
  async function newWorkspace() {
    const context = await browser.newContext({ baseURL: info.project.use.baseURL });
    contexts.push(context);
    const page = await context.newPage();
    await page.goto("/");
    return page;
  }
  async function applyForInstructor(page: Page, user: typeof teacher) {
    await page.getByRole("button", { name: "Request instructor access" }).click();
    await page.getByLabel("Name", { exact: true }).fill(user.name);
    await page.getByLabel("Email", { exact: true }).fill(user.email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Send registration request" }).click();
    await expect(page.getByRole("status")).toContainText("administrator review");
  }

  await admin.goto("/");
  await signIn(admin, adminEmail, adminPassword);
  await expect(admin.getByRole("heading", { name: "Platform administration" })).toBeVisible();
  try {
    const instructor = await newWorkspace();
    await applyForInstructor(instructor, teacher);
    const denied = await newWorkspace();
    await applyForInstructor(denied, rejected);
    await signIn(instructor, teacher.email, password);
    await expect(instructor.getByRole("alert")).toContainText("inactive");

    await admin.getByRole("button", { name: "User Management", exact: true }).click();
    await expect(
      admin.getByRole("button", { name: `Approve instructor ${teacher.name}` }),
    ).toBeVisible({ timeout: 30000 });
    await admin.getByRole("button", { name: `Approve instructor ${teacher.name}` }).click();
    await expect(
      admin.getByText("Instructor registration approved.", { exact: true }),
    ).toBeVisible();
    admin.once("dialog", (dialog) => dialog.accept());
    await admin.getByRole("button", { name: `Reject instructor ${rejected.name}` }).click();
    await expect(
      admin.getByText("Instructor registration rejected.", { exact: true }),
    ).toBeVisible();
    await signIn(denied, rejected.email, password);
    await expect(denied.getByRole("alert")).toContainText("inactive");

    for (const [user, role] of [
      [pupil, "Student"],
      [peer, "Student"],
      [otherTeacher, "Instructor"],
    ] as const) {
      const response = await admin.request.post("/api/admin/accounts", {
        headers,
        data: { ...user, role, status: "Active", password },
      });
      expect(response.status()).toBe(201);
    }
    const student = await newWorkspace();
    await signIn(student, pupil.email, password);
    await expect(student.getByText("You have no active course enrollments.")).toBeVisible();
    await signIn(instructor, teacher.email, password);
    await expect(instructor.getByText("Assigned courses will appear here.")).toBeVisible();

    await admin.getByRole("button", { name: "Course Management", exact: true }).click();
    await admin.getByRole("button", { name: "Add course" }).click();
    const courseDialog = admin.getByRole("dialog");
    await courseDialog.getByLabel("Course code").fill(code);
    await courseDialog.getByLabel("Course name").fill(courseName);
    await courseDialog
      .getByLabel("Description")
      .fill("Live workflow verification using illustrative coursework.");
    await courseDialog
      .getByLabel("Instructor", { exact: true })
      .selectOption({ label: teacher.name });
    await courseDialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect(admin.getByRole("button", { name: `Edit course ${code}` })).toBeEnabled();
    const course = (await snapshot()).courses.find((row) => row.course_code === code)!;
    const coursePath = `/api/learning/courses/${course.id}`;
    await expect(instructor.getByRole("heading", { name: courseName })).toBeVisible({
      timeout: 30000,
    });
    await expect(student.getByText(courseName, { exact: true })).toHaveCount(0);

    await admin.getByRole("button", { name: "Enrollments", exact: true }).click();
    await admin.getByRole("button", { name: "Enroll student", exact: true }).click();
    const enrollmentDialog = admin.getByRole("dialog");
    await enrollmentDialog
      .getByLabel("Student", { exact: true })
      .selectOption({ label: `${pupil.name} · ${pupil.email}` });
    await enrollmentDialog.getByLabel("Course", { exact: true }).selectOption(course.id);
    await enrollmentDialog.getByRole("button", { name: "Enroll", exact: true }).click();
    await expect(admin.getByText("Student enrolled.", { exact: true })).toBeVisible();
    await expect(instructor.getByText(pupil.name, { exact: true })).toBeVisible({ timeout: 30000 });
    await expect(student.getByRole("heading", { name: courseName })).toBeVisible({
      timeout: 30000,
    });
    await student.getByRole("button", { name: "View course" }).click();
    await expect(student.getByText(teacher.name, { exact: true })).toBeVisible();
    await student.getByRole("button", { name: "Activities", exact: true }).click();

    await instructor.getByRole("button", { name: "Create activity" }).click();
    const activityDialog = instructor.getByRole("dialog");
    const due = new Date(Date.now() + 86400000 + 8 * 3600000).toISOString().slice(0, 16);
    await activityDialog.getByLabel("Activity title").fill(activityName);
    await activityDialog
      .getByLabel("Instructions")
      .fill("Describe the relationships between a student, course, and enrollment.");
    await activityDialog.getByLabel("Due date (Manila time)").fill(due);
    await activityDialog.getByLabel("Maximum points").fill("100");
    await activityDialog.getByRole("button", { name: "Save activity" }).click();
    await expect(instructor.getByText("Activity created.", { exact: true })).toBeVisible();
    await expect(
      instructor.getByText("1 active students awaiting submission", { exact: false }),
    ).toBeVisible();
    await expect(student.getByText(activityName, { exact: true })).toBeVisible({ timeout: 30000 });
    await student.getByRole("button", { name: "Open activity" }).click();
    await expect(
      student.getByText("Describe the relationships between a student, course, and enrollment.", {
        exact: true,
      }),
    ).toBeVisible();
    const readCourse = async (): Promise<StaffCourse> =>
      (await instructor.request.get(coursePath)).json();
    const activity = (await readCourse()).activities.find((row) => row.title === activityName)!;
    const activityPath = `${coursePath}/activities/${activity.id}`;
    const studentId = (await snapshot()).accounts.find((user) => user.email === pupil.email)!.id;
    const outsider = await newWorkspace();
    await signIn(outsider, otherTeacher.email, password);
    await expect(outsider.getByText("Assigned courses will appear here.")).toBeVisible();
    expect((await outsider.request.get(coursePath)).status()).toBe(404);
    expect(
      (
        await outsider.request.patch(activityPath, { headers, data: { status: "Inactive" } })
      ).status(),
    ).toBe(404);
    expect((await student.request.get(coursePath)).status()).toBe(403);
    const otherStudent = await newWorkspace();
    await signIn(otherStudent, peer.email, password);
    await expect(otherStudent.getByText("You have no active course enrollments.")).toBeVisible();
    expect(
      (
        await otherStudent.request.post(`${activityPath}/submit`, {
          headers,
          data: { response: "Unauthorized response" },
        })
      ).status(),
    ).toBe(404);

    await student.getByLabel("Response", { exact: true }).fill(answer);
    student.once("dialog", (dialog) => dialog.accept());
    await student.getByRole("button", { name: "Submit response" }).click();
    await expect(student.getByText("Response submitted.", { exact: true })).toBeVisible();
    expect(
      (
        await student.request.post(`${activityPath}/submit`, {
          headers,
          data: { response: "Duplicate response" },
        })
      ).status(),
    ).toBe(409);
    await expect(
      instructor.getByText("1 submitted · 0 active students awaiting submission"),
    ).toBeVisible({ timeout: 30000 });
    const submission = (await readCourse()).submissions.find(
      (row) => row.activity_id === activity.id,
    )!;
    expect(submission.student_id).toBe(studentId);
    const gradePath = `${activityPath}/submissions/${submission.submission_id}/grade`;
    expect(
      (
        await student.request.put(gradePath, {
          headers,
          data: { score: 100, feedback: "Unauthorized grade" },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await instructor.request.put(gradePath, { headers, data: { score: 101, feedback } })
      ).status(),
    ).toBe(422);
    const review = instructor.locator("summary").filter({ hasText: pupil.name });
    await review.click();
    await expect(instructor.getByText(answer, { exact: true })).toBeVisible();
    await instructor.getByLabel("Score out of 100").fill("85");
    await instructor.getByLabel("Instructor feedback").fill(feedback);
    await instructor.getByRole("button", { name: "Save grade" }).click();
    await expect(review).toContainText("85/100");
    await instructor.getByLabel("Score out of 100").fill("90");
    await instructor.getByRole("button", { name: "Save grade" }).click();
    await expect(review).toContainText("90/100");
    await screenshot(instructor, "02-instructor-review");

    await student.getByRole("button", { name: "My Grades", exact: true }).click();
    await expect(student.getByText("90/100", { exact: true })).toBeVisible({ timeout: 30000 });
    await expect(student.getByText(feedback, { exact: true })).toBeVisible();
    await screenshot(student, "03-student-grade");

    const peerId = (await snapshot()).accounts.find((user) => user.email === peer.email)!.id;
    const enrolledPeer = await admin.request.post("/api/admin/enrollments", {
      headers,
      data: { student_id: peerId, course_id: course.id },
    });
    expect(enrolledPeer.status()).toBe(201);
    const peerLearning: StudentLearning = await (
      await otherStudent.request.get("/api/learning/")
    ).json();
    const peerActivity = peerLearning.activities.find((row) => row.id === activity.id)!;
    expect(peerActivity.submission_id).toBeNull();
    expect(peerActivity.score).toBeNull();
    expect(peerActivity.feedback).toBeNull();
    const expiredActivity = await instructor.request.post(`${coursePath}/activities`, {
      headers,
      data: {
        title: "DEMO CLOSED DEADLINE",
        description: "Deadline enforcement sample.",
        max_points: 10,
        due_date: new Date(Date.now() - 60000).toISOString(),
      },
    });
    expect(expiredActivity.status()).toBe(201);
    const { id: expiredId } = await expiredActivity.json();
    expect(
      (
        await otherStudent.request.post(`${coursePath}/activities/${expiredId}/submit`, {
          headers,
          data: { response: "Late response" },
        })
      ).status(),
    ).toBe(422);
    expect(
      (
        await instructor.request.patch(`${coursePath}/activities/${expiredId}`, {
          headers,
          data: { status: "Inactive" },
        })
      ).status(),
    ).toBe(204);

    await admin.getByRole("button", { name: "Academic Progress", exact: true }).click();
    await admin.getByLabel("Choose course for academic progress").selectOption(course.id);
    await expect(admin.getByRole("heading", { name: courseName })).toBeVisible();
    await admin.getByLabel("Select activity", { exact: true }).selectOption(activity.id);
    await admin.locator("summary").filter({ hasText: pupil.name }).click();
    await expect(admin.getByText(answer, { exact: true })).toBeVisible();
    await expect(admin.getByText("90/100", { exact: false })).toBeVisible();
    await expect(admin.getByText(teacher.name, { exact: false }).first()).toBeVisible();
    await expect(admin.getByRole("button", { name: "Save grade" })).toHaveCount(0);
    await screenshot(admin, "01-admin-academic-progress");
  } finally {
    for (const context of contexts) await context.close();
    const records = await snapshot();
    const course = records.courses.find((item) => item.course_code === code);
    if (course) {
      for (const enrollment of records.enrollments.filter(
        (item) => item.course_id === course.id && item.status === "Active",
      )) {
        expect(
          (
            await admin.request.patch(`/api/admin/enrollments/${enrollment.id}`, {
              headers,
              data: { status: "Inactive" },
            })
          ).ok(),
        ).toBe(true);
      }
      expect(
        (
          await admin.request.put(`/api/admin/courses/${course.id}`, {
            headers,
            data: { ...course, status: "Inactive" },
          })
        ).ok(),
      ).toBe(true);
    }
    const testEmails = [teacher, rejected, otherTeacher, pupil, peer].map((user) => user.email);
    for (const user of records.accounts.filter((user) => testEmails.includes(user.email))) {
      if (user.instructor_approval === "Pending") {
        expect(
          (
            await admin.request.patch(`/api/admin/accounts/${user.id}/instructor-approval`, {
              headers,
              data: { decision: "Rejected" },
            })
          ).ok(),
        ).toBe(true);
      } else if (user.status === "Active") {
        expect(
          (
            await admin.request.put(`/api/admin/accounts/${user.id}`, {
              headers,
              data: { ...user, status: "Inactive" },
            })
          ).ok(),
        ).toBe(true);
      }
    }
  }
});
