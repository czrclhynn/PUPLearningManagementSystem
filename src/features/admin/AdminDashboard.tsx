import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BookOpen,
  GraduationCap,
  Grid2X2,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { api, ApiError, errorMessage } from "../../app/api";
import { initials } from "../../app/navigation";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";
import { StatCard } from "../../components/ui/StatCard";
import { CourseWorkspace } from "../learning/CourseWorkspace";
import { AdminEditor } from "./AdminEditor";
import type { AdminData, Editor, Status } from "./types";

const tabs = [
  "Overview",
  "User Management",
  "Course Management",
  "Enrollments",
  "Academic Progress",
  "System Activity",
] as const;
const cards = [
  { key: "students", label: "Total students", icon: GraduationCap, tone: "maroon" },
  { key: "instructors", label: "Total instructors", icon: Users, tone: "blue" },
  { key: "courses", label: "Total courses", icon: BookOpen, tone: "amber" },
  { key: "enrollments", label: "Total student enrollments", icon: Grid2X2, tone: "green" },
  { key: "users", label: "Total registered users", icon: Users, tone: "blue" },
  { key: "administrators", label: "Total administrators", icon: ShieldCheck, tone: "maroon" },
] as const;

export function AdminDashboard({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [section, setSection] = useState<(typeof tabs)[number]>("Overview");
  const [data, setData] = useState<AdminData>();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<Editor>();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [academicCourseId, setAcademicCourseId] = useState("");

  const reload = useCallback(
    (signal?: AbortSignal) => {
      return api<AdminData>("/admin/dashboard", { signal })
        .then((dashboard) => {
          if (signal?.aborted) return;
          setData(dashboard);
          setError("");
        })
        .catch((failure) => {
          if (signal?.aborted) return;
          if (failure instanceof ApiError && failure.status === 401) onSessionExpired();
          else setError(errorMessage(failure));
        })
        .finally(() => {
          if (!signal?.aborted) setLoading(false);
        });
    },
    [onSessionExpired],
  );

  useEffect(() => {
    const controller = new AbortController();
    void reload(controller.signal);
    return () => controller.abort();
  }, [reload]);

  useEffect(() => {
    if (section !== "User Management" || loading) return;
    const controller = new AbortController();
    const refreshVisible = () => {
      if (!document.hidden) void reload(controller.signal);
    };
    const timer = window.setInterval(refreshVisible, 15000);
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshVisible);
      controller.abort();
    };
  }, [section, loading, reload]);

  function saved(message: string) {
    setEditor(undefined);
    setNotice(message);
    setLoading(true);
    void reload();
  }

  const shownAccounts =
    data?.accounts.filter(
      (account) =>
        (!role || role === account.role) &&
        `${account.name} ${account.email}`.toLowerCase().includes(search.trim().toLowerCase()),
    ) ?? [];
  const students = data?.accounts.filter((account) => account.role === "Student") ?? [];
  const instructorsAwaitingReview =
    data?.accounts.filter((account) => account.instructor_approval === "Pending") ?? [];
  const academicCourse =
    data?.courses.find((course) => course.id === academicCourseId) ?? data?.courses[0];

  async function reviewRegistration(id: string, decision: "Approved" | "Rejected") {
    if (decision === "Rejected" && !window.confirm("Reject this instructor registration?")) return;
    setLoading(true);
    setError("");
    try {
      await api(`/admin/accounts/${id}/instructor-approval`, {
        method: "PATCH",
        body: { decision },
      });
      saved(
        decision === "Approved"
          ? "Instructor registration approved."
          : "Instructor registration rejected.",
      );
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) onSessionExpired();
      else {
        setError(errorMessage(failure));
        setLoading(false);
      }
    }
  }
  const shownEnrollments =
    data?.enrollments.filter(
      (item) =>
        (!courseFilter || item.course_id === courseFilter) &&
        (!studentFilter || item.student_id === studentFilter),
    ) ?? [];

  return (
    <div className="page">
      <section className="role-banner admin-banner">
        <div>
          <span className="eyebrow light">ADMINISTRATOR WORKSPACE</span>
          <h1>Platform administration</h1>
          <p>Monitor institutional activity and manage the academic learning environment.</p>
        </div>
        <Badge tone={error ? "neutral" : "submitted"}>
          {error ? "Data unavailable" : loading ? "Loading data" : "Database connected"}
        </Badge>
      </section>
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            className={section === tab ? "active" : ""}
            aria-pressed={section === tab}
            onClick={() => setSection(tab)}
            key={tab}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="stats-grid" aria-busy={loading}>
        {cards.map(({ key, label, icon, tone }) => (
          <StatCard
            key={key}
            icon={icon}
            label={label}
            value={data?.stats[key].toLocaleString() ?? "—"}
            foot={data ? `${data.stats[`active_${key}`].toLocaleString()} active` : " "}
            tone={tone}
          />
        ))}
      </div>
      {loading && (
        <p className="admin-message" role="status">
          Loading administrator data…
        </p>
      )}
      {notice && (
        <p className="admin-message" role="status">
          {notice}
        </p>
      )}
      {error && (
        <div className="admin-message">
          <span className="admin-error" role="alert">
            {error}
          </span>{" "}
          <button
            className="text-btn"
            onClick={() => {
              setLoading(true);
              void reload();
            }}
          >
            Retry
          </button>
        </div>
      )}
      {data && section === "User Management" && (
        <section className="card admin-table">
          <div className="section-head">
            <div>
              <h2>User management</h2>
              <p>Search and manage platform accounts.</p>
            </div>
            <button
              className="btn primary small"
              disabled={loading}
              onClick={() => setEditor({ kind: "account" })}
            >
              <Plus size={16} /> Add account
            </button>
          </div>
          {instructorsAwaitingReview.length > 0 && (
            <section className="learning-panel instructor-approvals">
              <h3>Pending instructor registrations</h3>
              {instructorsAwaitingReview.map((account) => (
                <div className="learning-row" key={account.id}>
                  <div>
                    <strong>{account.name}</strong>
                    <p>{account.email}</p>
                  </div>
                  <div className="learning-actions">
                    <button
                      className="btn primary small"
                      disabled={loading}
                      aria-label={`Approve instructor ${account.name}`}
                      onClick={() => void reviewRegistration(account.id, "Approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="btn secondary small"
                      disabled={loading}
                      aria-label={`Reject instructor ${account.name}`}
                      onClick={() => void reviewRegistration(account.id, "Rejected")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}
          <div className="toolbar">
            <div className="search-field">
              <Search size={17} />
              <input
                aria-label="Search name or email"
                placeholder="Search name or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <select
              aria-label="Filter by role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="">All roles</option>
              <option value="Student">Students</option>
              <option value="Instructor">Instructors</option>
              <option value="Administrator">Administrators</option>
            </select>
          </div>
          {shownAccounts.map((account) => (
            <div className="user-row admin-record" key={account.id}>
              <div className="avatar small">{initials(account.name)}</div>
              <span>
                <strong>{account.name}</strong>
                <small>{account.email}</small>
              </span>
              <span>{account.role}</span>
              {account.instructor_approval && account.instructor_approval !== "Approved" ? (
                <Badge tone="neutral">{account.instructor_approval}</Badge>
              ) : (
                <StatusBadge status={account.status} />
              )}
              {(account.role === "Student" || account.instructor_approval === "Approved") && (
                <button
                  className="icon-btn admin-edit"
                  aria-label={`Edit account ${account.name}`}
                  disabled={loading}
                  onClick={() => setEditor({ kind: "account", account })}
                >
                  <MoreHorizontal size={18} />
                </button>
              )}
            </div>
          ))}
          {!shownAccounts.length && <p className="admin-message">No matching accounts.</p>}
        </section>
      )}
      {data && section === "Course Management" && (
        <section className="card admin-table">
          <div className="section-head">
            <div>
              <h2>Course management</h2>
              <p>Manage courses and instructor assignments.</p>
            </div>
            <button
              className="btn primary small"
              disabled={loading || !data.stats.active_instructors}
              onClick={() => setEditor({ kind: "course" })}
            >
              <Plus size={16} /> Add course
            </button>
          </div>
          {!data.stats.active_instructors && (
            <p className="admin-message">Add or activate an instructor to create a course.</p>
          )}
          {data.courses.map((course) => (
            <div className="user-row admin-record" key={course.id}>
              <div className="avatar small">
                <BookOpen size={17} />
              </div>
              <span>
                <strong>
                  {course.course_code} · {course.course_name}
                </strong>
                <small>{course.description}</small>
              </span>
              <span>
                Instructor: {course.instructor_name}
                {course.instructor_status === "Inactive" && " (Inactive)"}
              </span>
              <StatusBadge status={course.status} />
              <button
                className="icon-btn admin-edit"
                aria-label={`Edit course ${course.course_code}`}
                disabled={loading}
                onClick={() => setEditor({ kind: "course", course })}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          ))}
          {!data.courses.length && <p className="admin-message">No courses yet.</p>}
        </section>
      )}
      {data && section === "Enrollments" && (
        <section className="card admin-table">
          <div className="section-head">
            <div>
              <h2>Student enrollments</h2>
              <p>View course rosters and each student’s courses.</p>
            </div>
            <button
              className="btn primary small"
              disabled={loading || !data.stats.active_students || !data.stats.active_courses}
              onClick={() =>
                setEditor({
                  kind: "enrollment",
                  studentId: students.some(
                    (student) => student.id === studentFilter && student.status === "Active",
                  )
                    ? studentFilter
                    : "",
                  courseId: data.courses.some(
                    (course) => course.id === courseFilter && course.status === "Active",
                  )
                    ? courseFilter
                    : "",
                })
              }
            >
              <Plus size={16} /> Enroll student
            </button>
          </div>
          <div className="toolbar">
            <select
              aria-label="Filter by course"
              value={courseFilter}
              onChange={(event) => setCourseFilter(event.target.value)}
            >
              <option value="">All courses</option>
              {data.courses.map((course) => (
                <option value={course.id} key={course.id}>
                  {course.course_code} · {course.course_name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by student"
              value={studentFilter}
              onChange={(event) => setStudentFilter(event.target.value)}
            >
              <option value="">All students</option>
              {students.map((student) => (
                <option value={student.id} key={student.id}>
                  {student.name} · {student.email}
                </option>
              ))}
            </select>
          </div>
          {shownEnrollments.map((enrollment) => (
            <div className="user-row admin-record" key={enrollment.id}>
              <div className="avatar small">{initials(enrollment.student_name)}</div>
              <span>
                <strong>{enrollment.student_name}</strong>
                <small>
                  {new Date(enrollment.enrollment_date).toLocaleDateString()}
                  {enrollment.student_status === "Inactive" && " · Inactive account"}
                </small>
              </span>
              <span>
                {enrollment.course_code} · {enrollment.course_name}
                {enrollment.course_status === "Inactive" && " (Inactive course)"}
              </span>
              <StatusBadge status={enrollment.status} />
              <button
                className="icon-btn admin-edit"
                aria-label={`Manage enrollment for ${enrollment.student_name} in ${enrollment.course_code}`}
                disabled={loading}
                onClick={() => setEditor({ kind: "enrollmentStatus", enrollment })}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          ))}
          {!shownEnrollments.length && <p className="admin-message">No matching enrollments.</p>}
        </section>
      )}
      {data && section === "Academic Progress" && (
        <div className="learning-workspace">
          <section className="card learning-panel">
            <div className="section-head">
              <div>
                <h2>Academic progress</h2>
                <p>Review course rosters, activities, submissions, and grades.</p>
              </div>
            </div>
            {academicCourse ? (
              <label className="learning-field">
                Course
                <select
                  aria-label="Choose course for academic progress"
                  value={academicCourse.id}
                  onChange={(event) => setAcademicCourseId(event.target.value)}
                >
                  {data.courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_code} · {course.course_name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p>No courses have been created.</p>
            )}
          </section>
          {academicCourse && (
            <CourseWorkspace
              key={academicCourse.id}
              courseId={academicCourse.id}
              canManage={false}
              onSessionExpired={onSessionExpired}
            />
          )}
        </div>
      )}
      {data && (section === "Overview" || section === "System Activity") && (
        <AdminOverview
          data={data}
          expanded={section === "System Activity"}
          onViewActivity={() => setSection("System Activity")}
        />
      )}
      {data && editor && (
        <AdminEditor
          editor={editor}
          data={data}
          onClose={() => setEditor(undefined)}
          onSaved={saved}
          onSessionExpired={onSessionExpired}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  return <Badge tone={status === "Active" ? "submitted" : "neutral"}>{status}</Badge>;
}

function AdminOverview({
  data,
  expanded,
  onViewActivity,
}: {
  data: AdminData;
  expanded: boolean;
  onViewActivity: () => void;
}) {
  const max = Math.max(1, ...data.signIns.map(({ accounts }) => accounts));
  const latestCount = data.signIns.reduce((total, { accounts }) => total + accounts, 0);
  return (
    <div className="admin-grid">
      <section className="card analytics-card">
        <div className="section-head">
          <div>
            <h2>Platform activity</h2>
            <p>Accounts grouped by their most recent sign-in</p>
          </div>
          <span>Last 7 days</span>
        </div>
        <div className="big-number">{latestCount.toLocaleString()}</div>
        <div
          className="bar-chart"
          role="img"
          aria-label={data.signIns.map(({ day, accounts }) => `${day}: ${accounts}`).join(", ")}
        >
          {data.signIns.map(({ day, accounts }) => (
            <i
              key={day}
              title={`${day} · ${accounts} accounts`}
              style={{ height: `${(100 * accounts) / max}%` }}
            />
          ))}
        </div>
        <div className="chart-labels">
          {data.signIns.map(({ day }) => (
            <span key={day}>
              {new Intl.DateTimeFormat(undefined, { weekday: "short", timeZone: "UTC" })
                .format(new Date(day))
                .toUpperCase()}
            </span>
          ))}
        </div>
      </section>
      <section className="card system-card">
        <div className="section-head">
          <div>
            <h2>System overview</h2>
            <p>Current service status</p>
          </div>
        </div>
        <div>
          <span>
            <i /> Database
          </span>
          <strong>Connected</strong>
        </div>
        <div>
          <span>Active accounts</span>
          <strong>{data.stats.active_users.toLocaleString()}</strong>
        </div>
        <div>
          <span>Active courses</span>
          <strong>{data.stats.active_courses.toLocaleString()}</strong>
        </div>
        <div>
          <span>Active enrollments</span>
          <strong>{data.stats.active_enrollments.toLocaleString()}</strong>
        </div>
        <hr />
        <div className="storage">
          <span>
            Enrollment activity
            <strong>
              {data.stats.active_enrollments} of {data.stats.enrollments} active
            </strong>
          </span>
          <Progress
            value={
              data.stats.enrollments
                ? (100 * data.stats.active_enrollments) / data.stats.enrollments
                : 0
            }
          />
        </div>
      </section>
      <section className="card recent-activity">
        <div className="section-head">
          <div>
            <h2>Recent administrative activity</h2>
            <p>Latest changes to accounts, courses and enrollments</p>
          </div>
          {!expanded && (
            <button className="text-btn" onClick={onViewActivity}>
              View system activity
            </button>
          )}
        </div>
        {data.recent
          .slice(0, expanded ? data.recent.length : 4)
          .map(({ id, kind, label, status, updated_at }) => (
            <div key={`${kind}-${id}`}>
              <div className="activity-admin-icon">
                <Activity size={16} />
              </div>
              <span>
                <strong>{label}</strong>
                <small>
                  {kind} · {status}
                </small>
              </span>
              <time dateTime={updated_at}>{new Date(updated_at).toLocaleString()}</time>
            </div>
          ))}
      </section>
    </div>
  );
}
