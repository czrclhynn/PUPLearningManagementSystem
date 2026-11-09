import { Download } from "lucide-react";
import { courses } from "../courses/mock";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";

export function GradesPage({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "embedded-page" : "page"}>
      {!compact && (
        <div className="page-heading">
          <div>
            <span className="eyebrow">PERFORMANCE</span>
            <h1>My Grades</h1>
            <p>Illustrative academic data for the current semester.</p>
          </div>
          <select>
            <option>2nd Semester, 2024–2025</option>
          </select>
        </div>
      )}
      <div className="grade-overview">
        <section className="grade-hero card">
          <span>OVERALL ACADEMIC PERFORMANCE</span>
          <div>
            <strong>88.4</strong>
            <small>Average score</small>
          </div>
          <Badge tone="submitted">On track</Badge>
          <p>
            Based on 34 graded activities across 6 courses. These values are illustrative and do not
            represent official PUP grading policy.
          </p>
        </section>
        <section className="card grade-bars">
          <div className="section-head">
            <div>
              <h2>Course comparison</h2>
              <p>Average numerical score</p>
            </div>
          </div>
          {courses.slice(0, 4).map((c, i) => (
            <div className="grade-bar" key={c.code}>
              <span>{c.code}</span>
              <Progress value={[91, 86, 89, 84][i]} />
              <strong>{[91, 86, 89, 84][i]}</strong>
            </div>
          ))}
        </section>
      </div>
      <section className="card gradebook">
        <div className="section-head">
          <div>
            <h2>Detailed gradebook</h2>
            <p>Scores and instructor feedback</p>
          </div>
          <button className="btn tertiary small">
            <Download size={16} /> Export
          </button>
        </div>
        <div className="table-head grades">
          <span>COURSE</span>
          <span>ACTIVITIES</span>
          <span>QUIZZES</span>
          <span>EXAMS</span>
          <span>AVERAGE</span>
        </div>
        {courses.slice(0, 5).map((c, i) => (
          <div className="grade-row" key={c.code}>
            <div>
              <strong>{c.code}</strong>
              <small>{c.title}</small>
            </div>
            <span>{[92, 87, 90, 82, 94][i]}</span>
            <span>{[88, 84, 91, 86, 92][i]}</span>
            <span>{[90, 86, 88, 84, 89][i]}</span>
            <strong>{[90, 86, 89, 84, 92][i]}</strong>
          </div>
        ))}
      </section>
    </div>
  );
}
