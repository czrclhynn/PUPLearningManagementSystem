import { useState } from "react";
import { BookOpen, CalendarDays, ClipboardCheck, Users } from "lucide-react";
import { StatCard } from "../../components/ui/StatCard";
import { CourseWorkspace } from "../learning/CourseWorkspace";
import { FeedStatus } from "../learning/FeedStatus";
import type { InstructorCourse } from "../learning/types";
import { useLearning } from "../learning/useLearning";

export function InstructorDashboard({
  name,
  onSessionExpired,
}: {
  name: string;
  onSessionExpired: () => void;
}) {
  const { data, error, refresh } = useLearning<{ courses: InstructorCourse[] }>(
    "/learning/",
    onSessionExpired,
  );
  const [courseId, setCourseId] = useState("");
  const courses = data?.courses ?? [];
  const selected = courses.find((course) => course.id === courseId) ?? courses[0];

  return (
    <div className="page">
      <section className="role-banner instructor-banner">
        <div>
          <span className="eyebrow light">INSTRUCTOR WORKSPACE</span>
          <h1>Welcome, {name}.</h1>
          <p>Manage your assigned courses, activities, and student work.</p>
        </div>
        <button className="btn light" onClick={refresh}>
          Refresh workspace
        </button>
      </section>
      {data ? (
        <>
          <div className="stats-grid">
            <StatCard
              icon={BookOpen}
              label="Assigned courses"
              value={String(courses.length)}
              foot="Courses on record"
              tone="maroon"
            />
            <StatCard
              icon={Users}
              label="Active enrollments"
              value={String(courses.reduce((total, course) => total + course.enrolled, 0))}
              foot="Across assigned courses"
              tone="blue"
            />
            <StatCard
              icon={CalendarDays}
              label="Active activities"
              value={String(courses.reduce((total, course) => total + course.activity_count, 0))}
              foot="Across assigned courses"
              tone="amber"
            />
            <StatCard
              icon={ClipboardCheck}
              label="Awaiting grading"
              value={String(courses.reduce((total, course) => total + course.review_count, 0))}
              foot="Submissions to review"
              tone="green"
            />
          </div>
          <div className="instructor-grid">
            <section className="card">
              <div className="section-head">
                <div>
                  <h2>Assigned courses</h2>
                  <p>Open a course to manage its roster and activities.</p>
                </div>
              </div>
              {courses.map((course) => (
                <div className="managed-course" key={course.id}>
                  <div className="course-badge maroon">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <strong>{course.course_name}</strong>
                    <p>
                      {course.course_code} · {course.enrolled} active enrollments · {course.status}
                    </p>
                  </div>
                  <button
                    className="btn tertiary small"
                    aria-pressed={selected?.id === course.id}
                    onClick={() => setCourseId(course.id)}
                  >
                    Manage course
                  </button>
                </div>
              ))}
              {!courses.length && <p>Assigned courses will appear here.</p>}
            </section>
            <section className="card review-queue">
              <div className="section-head">
                <div>
                  <h2>Review queue</h2>
                  <p>Submissions awaiting grades by course</p>
                </div>
              </div>
              {courses
                .filter((course) => course.review_count > 0)
                .map((course) => (
                  <div className="learning-row" key={course.id}>
                    <div>
                      <strong>{course.course_code}</strong>
                      <p>{course.review_count} awaiting grading</p>
                    </div>
                    <button className="btn tertiary small" onClick={() => setCourseId(course.id)}>
                      Review course
                    </button>
                  </div>
                ))}
              {!courses.some((course) => course.review_count > 0) && (
                <p>No submissions are awaiting review.</p>
              )}
            </section>
          </div>
          {selected && (
            <CourseWorkspace
              key={selected.id}
              courseId={selected.id}
              canManage
              onChange={refresh}
              onSessionExpired={onSessionExpired}
            />
          )}
        </>
      ) : (
        <FeedStatus error={error} refresh={refresh} />
      )}
    </div>
  );
}
