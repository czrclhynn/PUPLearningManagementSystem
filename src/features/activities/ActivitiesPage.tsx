import { useState, type FormEvent } from "react";
import { ArrowLeft, ClipboardCheck, ExternalLink, Send } from "lucide-react";
import { api, ApiError, errorMessage } from "../../app/api";
import { Badge } from "../../components/ui/Badge";
import { academicDate, activityStatus } from "../learning/academic";
import type { LearningCourse, StudentActivity } from "../learning/types";

const filters = ["All", "Pending", "Submitted", "Graded", "Overdue", "Returned"];

export function ActivitiesPage({
  embedded = false,
  activities,
  courses,
  refresh,
  onSessionExpired,
}: {
  embedded?: boolean;
  activities: StudentActivity[];
  courses: LearningCourse[];
  refresh: () => void;
  onSessionExpired: () => void;
}) {
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState("");
  const selected = activities.find((item) => item.id === selectedId);
  const shown = activities.filter((item) => filter === "All" || activityStatus(item) === filter);
  const courseNames = new Map(courses.map((course) => [course.id, course.course_name]));
  if (selected)
    return (
      <div className={embedded ? "embedded-page" : "page"}>
        <button className="back-link" onClick={() => setSelectedId("")}>
          <ArrowLeft size={17} /> Back to activities
        </button>
        <ActivityDetails
          key={selected.id}
          activity={selected}
          courseName={courseNames.get(selected.course_id)}
          refresh={refresh}
          onSessionExpired={onSessionExpired}
        />
      </div>
    );
  return (
    <div className={embedded ? "embedded-page" : "page"}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACADEMICS</span>
          {embedded ? <h2>Course activities</h2> : <h1>Activities &amp; Assessments</h1>}
          <p>View instructions, submit your work, and see activity results.</p>
        </div>
      </div>
      <div className="filter-bar">
        {filters.map((value) => (
          <button
            className={filter === value ? "active" : ""}
            key={value}
            onClick={() => setFilter(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <section className="card learning-panel">
        {shown.map((item) => (
          <div className="learning-row" key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <p>
                {courseNames.get(item.course_id)} · {item.max_points} points ·{" "}
                {academicDate(item.due_date)}
              </p>
            </div>
            <Badge tone={item.submission_id ? "submitted" : "neutral"}>
              {activityStatus(item)}
            </Badge>
            <button className="btn tertiary small" onClick={() => setSelectedId(item.id)}>
              Open activity
            </button>
          </div>
        ))}
        {!shown.length && <p>No matching activities.</p>}
      </section>
    </div>
  );
}

function ActivityDetails({
  activity,
  courseName,
  refresh,
  onSessionExpired,
}: {
  activity: StudentActivity;
  courseName?: string;
  refresh: () => void;
  onSessionExpired: () => void;
}) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const status = activityStatus(activity);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!window.confirm("Submit this response? Each activity accepts one submission.")) return;
    const response = new FormData(event.currentTarget).get("response")?.toString().trim();
    if (!response) {
      setError("Enter your response before submitting.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api(`/learning/courses/${activity.course_id}/activities/${activity.id}/submit`, {
        method: "POST",
        body: { response },
      });
      setSaved(true);
      refresh();
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) onSessionExpired();
      else setError(errorMessage(failure));
      refresh();
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="activity-detail-grid">
      <section className="card activity-detail">
        <div className="activity-title-row">
          <div className="activity-type-icon">
            <ClipboardCheck size={23} />
          </div>
          <div>
            <span className="eyebrow">{courseName}</span>
            <h2>{activity.title}</h2>
          </div>
        </div>
        <div className="learning-row">
          <span>Due {academicDate(activity.due_date)}</span>
          <span>{activity.max_points} points</span>
          <Badge tone={activity.submission_id ? "submitted" : "neutral"}>
            {saved && !activity.submission_id ? "Submitted" : status}
          </Badge>
        </div>
        <h3>Instructions</h3>
        <p className="learning-text">{activity.description}</p>
        {activity.material_url && (
          <a
            className="btn tertiary small"
            href={activity.material_url}
            target="_blank"
            rel="noreferrer"
          >
            Open learning material <ExternalLink size={15} />
          </a>
        )}
      </section>
      <aside className="card submission-card">
        <h3>Your submission</h3>
        {saved && <p role="status">Response submitted.</p>}
        {error && <p role="alert">{error}</p>}
        {activity.submission_id ? (
          <>
            <p>Submitted {academicDate(activity.submitted_at)}</p>
            <p className="learning-text">{activity.submission_content}</p>
            {activity.score !== null && (
              <>
                <strong>
                  {activity.score}/{activity.max_points}
                </strong>
                <p className="learning-text">{activity.feedback}</p>
                <p>Graded {academicDate(activity.graded_at)}</p>
              </>
            )}
          </>
        ) : !saved && status === "Pending" ? (
          <form className="learning-form" onSubmit={submit}>
            <label>
              Response
              <textarea name="response" required maxLength={10000} rows={5} />
            </label>
            <button className="btn primary full" disabled={saving}>
              <Send size={16} /> {saving ? "Submitting…" : "Submit response"}
            </button>
          </form>
        ) : (
          !saved && (
            <p>{status === "Overdue" ? "The deadline has passed." : "This activity is closed."}</p>
          )
        )}
      </aside>
    </div>
  );
}
