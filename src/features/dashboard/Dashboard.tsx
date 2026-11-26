import { AlarmClock, ArrowRight, BarChart3, BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import { type Page } from "../../app/navigation";
import { StatCard } from "../../components/ui/StatCard";
import { CourseCard } from "../courses/CourseCard";
import { academicDate, activityStatus, gradeAverage } from "../learning/academic";
import type { StudentLearning } from "../learning/types";

export function Dashboard({
  name,
  learning,
  onNavigate,
  openCourse,
}: {
  name: string;
  learning: StudentLearning;
  onNavigate: (page: Page) => void;
  openCourse: (id: string, tab?: string) => void;
}) {
  const pending = learning.activities.filter((item) => activityStatus(item) === "Pending");
  const submitted = learning.activities.filter((item) => item.submission_id);
  const average = gradeAverage(
    submitted.map((item) => ({ submission: item, maxPoints: item.max_points })),
  );
  const date = new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeZone: "Asia/Manila",
  }).format(new Date());
  return (
    <div className="page dashboard-page">
      <section className="welcome-panel">
        <div>
          <span className="eyebrow light">{date}</span>
          <h1>Welcome, {name.split(/\s+/)[0]}!</h1>
          <p>See your courses, activity deadlines, and latest results.</p>
        </div>
        <div className="day-focus">
          <span>
            <Sparkles size={16} /> YOUR NEXT DEADLINE
          </span>
          <strong>{pending.find((item) => item.due_date)?.title ?? "No upcoming deadlines"}</strong>
        </div>
      </section>
      <div className="stats-grid">
        <StatCard
          icon={BookOpen}
          label="Enrolled courses"
          value={String(learning.courses.length)}
          foot="Active enrollments"
          tone="maroon"
        />
        <StatCard
          icon={AlarmClock}
          label="Pending activities"
          value={String(pending.length)}
          foot="Open for submission"
          tone="amber"
        />
        <StatCard
          icon={CheckCircle2}
          label="Submitted activities"
          value={String(submitted.length)}
          foot="Responses on record"
          tone="green"
        />
        <StatCard
          icon={BarChart3}
          label="Academic progress"
          value={average === null ? "—" : `${average}%`}
          foot="Based on graded work"
          tone="blue"
        />
      </div>
      <div className="dashboard-grid">
        <section className="card learning-panel">
          <div className="section-head">
            <h2>Upcoming activities</h2>
            <button className="text-btn" onClick={() => onNavigate("activities")}>
              All activities <ArrowRight size={15} />
            </button>
          </div>
          {pending.slice(0, 5).map((item) => (
            <div className="learning-row" key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <p>{academicDate(item.due_date)}</p>
              </div>
              <button
                className="btn tertiary small"
                onClick={() => openCourse(item.course_id, "activities")}
              >
                Open course activities
              </button>
            </div>
          ))}
          {!pending.length && <p>No pending activities.</p>}
        </section>
        <section className="card learning-panel">
          <div className="section-head">
            <h2>Latest grades</h2>
            <button className="text-btn" onClick={() => onNavigate("grades")}>
              My grades <ArrowRight size={15} />
            </button>
          </div>
          {submitted
            .filter((item) => item.graded_at)
            .sort((a, b) => Date.parse(b.graded_at!) - Date.parse(a.graded_at!))
            .slice(0, 4)
            .map((item) => (
              <div className="learning-row" key={item.id}>
                <strong>{item.title}</strong>
                <span>
                  {item.score}/{item.max_points}
                </span>
              </div>
            ))}
          {average === null && (
            <p>Your grades will appear after your instructor reviews your work.</p>
          )}
        </section>
      </div>
      <div className="section-head">
        <h2>My courses</h2>
        <button className="text-btn" onClick={() => onNavigate("courses")}>
          All courses <ArrowRight size={15} />
        </button>
      </div>
      <div className="course-grid">
        {learning.courses.slice(0, 4).map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            activities={learning.activities.filter((item) => item.course_id === course.id)}
            onOpen={() => openCourse(course.id)}
          />
        ))}
      </div>
      {!learning.courses.length && <p>You have no active course enrollments.</p>}
    </div>
  );
}
