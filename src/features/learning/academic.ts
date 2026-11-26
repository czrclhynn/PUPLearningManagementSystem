import type { StudentActivity, Submission } from "./types";

export function academicDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Manila",
      }).format(new Date(value))
    : "No deadline";
}

export function activityStatus(activity: StudentActivity) {
  if (activity.score !== null) return "Graded";
  if (activity.submission_status) return activity.submission_status;
  if (activity.status === "Inactive") return "Inactive";
  return activity.due_date && Date.parse(activity.due_date) <= Date.now() ? "Overdue" : "Pending";
}

export function gradeAverage(
  entries: { submission: Pick<Submission, "score">; maxPoints: number }[],
) {
  let earned = 0;
  let possible = 0;
  for (const { submission, maxPoints } of entries) {
    if (submission.score === null) continue;
    earned += submission.score;
    possible += maxPoints;
  }
  return possible ? Math.round((1000 * earned) / possible) / 10 : null;
}
