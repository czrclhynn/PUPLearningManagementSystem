import { Progress } from "../../components/ui/Progress";
import { academicDate, gradeAverage } from "../learning/academic";
import type { LearningCourse, StudentActivity } from "../learning/types";

export function GradesPage({
  compact = false,
  activities,
  courses,
}: {
  compact?: boolean;
  activities: StudentActivity[];
  courses: LearningCourse[];
}) {
  const graded = activities.filter((item) => item.score !== null);
  const average = (items: StudentActivity[]) =>
    gradeAverage(items.map((item) => ({ submission: item, maxPoints: item.max_points })));
  const overall = average(graded);
  return (
    <div className={compact ? "embedded-page" : "page"}>
      {!compact && (
        <div className="page-heading">
          <div>
            <span className="eyebrow">PERFORMANCE</span>
            <h1>My Grades</h1>
            <p>See the results and feedback from your instructors.</p>
          </div>
        </div>
      )}
      <div className="grade-overview">
        <section className="grade-hero card">
          <span>ACADEMIC PERFORMANCE</span>
          <div>
            <strong>{overall === null ? "—" : `${overall}%`}</strong>
          </div>
          <p>
            {graded.length} graded {graded.length === 1 ? "activity" : "activities"}
          </p>
        </section>
        <section className="card grade-bars">
          <div className="section-head">
            <div>
              <h2>Course performance</h2>
              <p>Points earned as a share of graded points</p>
            </div>
          </div>
          {courses.map((course) => {
            const percent = average(graded.filter((item) => item.course_id === course.id));
            return (
              <div className="grade-bar" key={course.id}>
                <span>{course.course_code}</span>
                <Progress value={percent ?? 0} />
                <strong>{percent === null ? "—" : `${percent}%`}</strong>
              </div>
            );
          })}
          {!courses.length && <p>No active courses.</p>}
        </section>
      </div>
      <section className="card gradebook">
        <div className="section-head">
          <div>
            <h2>Detailed gradebook</h2>
            <p>Scores and instructor feedback</p>
          </div>
        </div>
        {!graded.length && <p>No grades have been posted yet.</p>}
        {graded.map((item) => (
          <div className="learning-row" key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <p>{courses.find((course) => course.id === item.course_id)?.course_name}</p>
              <p className="learning-text">{item.feedback || "No written feedback."}</p>
              <p>Graded {academicDate(item.graded_at)}</p>
            </div>
            <strong>
              {item.score}/{item.max_points}
            </strong>
          </div>
        ))}
      </section>
    </div>
  );
}
