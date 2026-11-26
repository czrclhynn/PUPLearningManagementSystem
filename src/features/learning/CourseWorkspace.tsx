import { useEffect, useRef, useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { api, ApiError, errorMessage } from "../../app/api";
import { Badge } from "../../components/ui/Badge";
import { academicDate, gradeAverage } from "./academic";
import { FeedStatus } from "./FeedStatus";
import type { Activity, StaffCourse, StaffSubmission } from "./types";
import { useLearning } from "./useLearning";

export function CourseWorkspace({
  courseId,
  canManage,
  onChange,
  onSessionExpired,
}: {
  courseId: string;
  canManage: boolean;
  onChange?: () => void;
  onSessionExpired: () => void;
}) {
  const { data, error, refresh } = useLearning<StaffCourse>(
    `/learning/courses/${courseId}`,
    onSessionExpired,
  );
  const [selected, setSelected] = useState("");
  const [editor, setEditor] = useState<Activity | "new">();
  const [notice, setNotice] = useState("");
  const [failure, setFailure] = useState("");
  const [saving, setSaving] = useState(false);
  if (!data) return <FeedStatus error={error} refresh={refresh} />;
  const { course, roster, activities, submissions } = data;
  const isEditable = canManage && course.status === "Active";
  const current = activities.find((item) => item.id === selected) ?? activities[0];
  const byActivity = new Map(activities.map((item) => [item.id, item]));
  const matching = new Map(
    submissions
      .filter((item) => item.activity_id === current?.id)
      .map((item) => [item.student_id, item]),
  );
  const enrolled = roster.filter(
    (item) => item.status === "Active" && item.student_status === "Active",
  );
  const path = `/learning/courses/${courseId}/activities`;
  const awaiting = enrolled.filter(
    (student) => current && !matching.has(student.student_id),
  ).length;

  function updated(message: string) {
    setNotice(message);
    setFailure("");
    refresh();
    onChange?.();
  }

  async function changeStatus(activity: Activity) {
    const status = activity.status === "Active" ? "Inactive" : "Active";
    if (
      status === "Inactive" &&
      !window.confirm("Deactivate this activity? Existing submissions and grades will be kept.")
    )
      return;
    setSaving(true);
    try {
      await api(`${path}/${activity.id}`, { method: "PATCH", body: { status } });
      updated(status === "Active" ? "Activity reactivated." : "Activity deactivated.");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) onSessionExpired();
      else setFailure(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="learning-workspace">
      <section className="card learning-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">{course.course_code}</span>
            <h2>{course.course_name}</h2>
            <p>
              Instructor · {course.instructor_name} · {course.status}
            </p>
          </div>
          <button className="text-btn" onClick={refresh}>
            Refresh course
          </button>
        </div>
        <p className="learning-text">
          {course.description || "No course description has been provided."}
        </p>
      </section>
      <section className="card learning-panel">
        <div className="section-head">
          <div>
            <h2>Class roster</h2>
            <p>{enrolled.length} active enrollments</p>
          </div>
        </div>
        {roster.map((student) => {
          const grades = submissions.filter(
            (entry) => entry.student_id === student.student_id && entry.score !== null,
          );
          const progress = gradeAverage(
            grades.map((entry) => ({
              submission: entry,
              maxPoints: byActivity.get(entry.activity_id)!.max_points,
            })),
          );
          return (
            <div className="learning-row" key={student.student_id}>
              <div>
                <strong>{student.student_name}</strong>
                <p>Enrolled {academicDate(student.enrollment_date)}</p>
              </div>
              <span>
                {student.status === "Inactive" || student.student_status === "Inactive"
                  ? "Inactive"
                  : "Active"}
              </span>
              <span>
                {progress === null ? "No graded work" : `${progress}% · ${grades.length} graded`}
              </span>
            </div>
          );
        })}
        {!roster.length && <p>No students have been enrolled.</p>}
      </section>
      <section className="card learning-panel">
        <div className="section-head">
          <div>
            <h2>Course activities</h2>
            <p>View instructions, deadlines, and submission status.</p>
          </div>
          {isEditable && (
            <button className="btn primary small" onClick={() => setEditor("new")}>
              <Plus size={16} /> Create activity
            </button>
          )}
        </div>
        {notice && <p role="status">{notice}</p>}
        {failure && <p role="alert">{failure}</p>}
        {!activities.length && <p>No activities have been created.</p>}
        {activities.length > 0 && (
          <label className="learning-field">
            Select activity
            <select
              aria-label="Select activity"
              value={current?.id ?? ""}
              onChange={(event) => setSelected(event.target.value)}
            >
              {activities.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                  {item.status === "Inactive" ? " (Inactive)" : ""}
                </option>
              ))}
            </select>
          </label>
        )}
        {current && (
          <>
            <div className="learning-row">
              <div>
                <h3>{current.title}</h3>
                <p>
                  Due {academicDate(current.due_date)} · {current.max_points} points · Created{" "}
                  {academicDate(current.created_at)}
                </p>
              </div>
              <Badge tone={current.status === "Active" ? "submitted" : "neutral"}>
                {current.status}
              </Badge>
              {isEditable && (
                <div className="learning-actions">
                  <button className="btn tertiary small" onClick={() => setEditor(current)}>
                    Edit activity
                  </button>
                  <button
                    className="btn secondary small"
                    disabled={saving}
                    onClick={() => void changeStatus(current)}
                  >
                    {current.status === "Active" ? "Deactivate activity" : "Reactivate activity"}
                  </button>
                </div>
              )}
            </div>
            <p className="learning-text">{current.description}</p>
            {current.material_url && (
              <a className="text-btn" href={current.material_url} target="_blank" rel="noreferrer">
                Open learning material
              </a>
            )}
          </>
        )}
      </section>
      {current && (
        <section className="card learning-panel">
          <div className="section-head">
            <div>
              <h2>Submissions</h2>
              <p>
                {matching.size} submitted · {awaiting} active students awaiting submission
              </p>
            </div>
          </div>
          {roster.map((student) => {
            const submission = matching.get(student.student_id);
            return (
              <div className="learning-review" key={student.student_id}>
                {submission ? (
                  <details>
                    <summary>
                      <strong>{student.student_name}</strong> · {submission.submission_status}
                      {submission.score !== null && ` · ${submission.score}/${current.max_points}`}
                    </summary>
                    <p>Submitted {academicDate(submission.submitted_at)}</p>
                    <p className="learning-text">
                      {submission.submission_content || "No text response recorded."}
                    </p>
                    {submission.graded_at && (
                      <p>
                        Graded {academicDate(submission.graded_at)} by {submission.graded_by}
                      </p>
                    )}
                    {submission.feedback && (
                      <p className="learning-text">
                        <strong>Feedback</strong> {submission.feedback}
                      </p>
                    )}
                    {isEditable && (
                      <GradeForm
                        key={submission.submission_id}
                        submission={submission}
                        maxPoints={current.max_points}
                        path={`${path}/${current.id}/submissions/${submission.submission_id}/grade`}
                        onSaved={() => updated("Grade saved.")}
                        onSessionExpired={onSessionExpired}
                      />
                    )}
                  </details>
                ) : (
                  <p>
                    <strong>{student.student_name}</strong> · No submission
                    {(student.status === "Inactive" || student.student_status === "Inactive") &&
                      " (inactive enrollment or account)"}
                  </p>
                )}
              </div>
            );
          })}
          {!roster.length && <p>No students are enrolled.</p>}
        </section>
      )}
      {editor && (
        <ActivityEditor
          activity={editor === "new" ? undefined : editor}
          path={path}
          onClose={() => setEditor(undefined)}
          onSaved={(id) => {
            setEditor(undefined);
            setSelected(id);
            updated(editor === "new" ? "Activity created." : "Activity updated.");
          }}
          onSessionExpired={onSessionExpired}
        />
      )}
    </div>
  );
}

function GradeForm({
  submission,
  maxPoints,
  path,
  onSaved,
  onSessionExpired,
}: {
  submission: StaffSubmission;
  maxPoints: number;
  path: string;
  onSaved: () => void;
  onSessionExpired: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      await api(path, {
        method: "PUT",
        body: { score: Number(form.get("score")), feedback: form.get("feedback") },
      });
      onSaved();
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) onSessionExpired();
      else setError(errorMessage(failure));
    } finally {
      setSaving(false);
    }
  }
  return (
    <form className="learning-form" onSubmit={submit}>
      <label>
        Score out of {maxPoints}
        <input
          type="number"
          name="score"
          min={0}
          max={maxPoints}
          step="0.01"
          required
          defaultValue={submission.score ?? ""}
        />
      </label>
      <label>
        Instructor feedback
        <textarea name="feedback" maxLength={5000} defaultValue={submission.feedback ?? ""} />
      </label>
      {error && <p role="alert">{error}</p>}
      <div>
        <button className="btn primary small" disabled={saving}>
          {saving ? "Saving…" : "Save grade"}
        </button>
      </div>
    </form>
  );
}

function ActivityEditor({
  activity,
  path,
  onClose,
  onSaved,
  onSessionExpired,
}: {
  activity?: Activity;
  path: string;
  onClose: () => void;
  onSaved: (id: string) => void;
  onSessionExpired: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const modal = dialog.current;
    modal?.showModal();
    return () => modal?.close();
  }, []);
  const localDue = activity?.due_date
    ? new Date(Date.parse(activity.due_date) + 8 * 3600000).toISOString().slice(0, 16)
    : "";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      title: form.get("title"),
      description: form.get("description"),
      due_date: `${form.get("due_date")}:00+08:00`,
      max_points: Number(form.get("max_points")),
      material_url: form.get("material_url"),
    };
    setSaving(true);
    setError("");
    try {
      const created = await api<{ id: string }>(activity ? `${path}/${activity.id}` : path, {
        method: activity ? "PUT" : "POST",
        body,
      });
      onSaved(activity?.id ?? created.id);
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) onSessionExpired();
      else setError(errorMessage(failure));
    } finally {
      setSaving(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="admin-dialog card"
      aria-labelledby="activity-form-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
    >
      <form className="compose-modal" onSubmit={submit}>
        <div className="section-head">
          <h2 id="activity-form-title">{activity ? "Edit activity" : "Create activity"}</h2>
          <button
            type="button"
            className="icon-btn"
            aria-label="Close"
            onClick={onClose}
            disabled={saving}
          >
            <X size={18} />
          </button>
        </div>
        <label>
          Activity title
          <input name="title" required maxLength={160} defaultValue={activity?.title} />
        </label>
        <label>
          Instructions
          <textarea
            name="description"
            required
            maxLength={5000}
            defaultValue={activity?.description}
          />
        </label>
        <label>
          Due date (Manila time)
          <input name="due_date" type="datetime-local" required defaultValue={localDue} />
        </label>
        <label>
          Maximum points
          <input
            name="max_points"
            type="number"
            step="0.01"
            min="0.01"
            max="99999.99"
            required
            defaultValue={activity?.max_points ?? 100}
          />
        </label>
        <label>
          Learning material link (optional)
          <input
            name="material_url"
            type="url"
            maxLength={2000}
            defaultValue={activity?.material_url ?? ""}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <div>
          <button type="button" className="btn secondary" disabled={saving} onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" disabled={saving}>
            {saving ? "Saving…" : "Save activity"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
