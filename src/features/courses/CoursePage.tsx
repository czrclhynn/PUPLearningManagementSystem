import { useState } from "react";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
import { initials } from "../../app/navigation";
import { ActivitiesPage } from "../activities/ActivitiesPage";
import { GradesPage } from "../grades/GradesPage";
import type { LearningCourse, StudentActivity } from "../learning/types";

const tabs = ["overview", "materials", "activities", "grades"] as const;

export function CoursePage({
  initialTab,
  course,
  activities,
  onBack,
  refresh,
  onSessionExpired,
}: {
  initialTab: string;
  course: LearningCourse;
  activities: StudentActivity[];
  onBack: () => void;
  refresh: () => void;
  onSessionExpired: () => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const active = activities.filter((activity) => activity.status === "Active");
  return (
    <div className="page course-page">
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={17} /> Back to My Courses
      </button>
      <section className="course-hero">
        <div className="course-hero-pattern" />
        <div className="hero-icon">
          <BookOpen size={32} />
        </div>
        <div className="hero-copy">
          <span className="eyebrow light">{course.course_code}</span>
          <h1>{course.course_name}</h1>
          <div className="hero-instructor">
            <div className="avatar small">{initials(course.instructor_name)}</div>
            <span>{course.instructor_name}</span>
          </div>
        </div>
        <div className="hero-progress">
          <span>Activities submitted</span>
          <div className="hero-score">
            {active.filter((activity) => activity.submission_id).length}/{active.length}
          </div>
        </div>
      </section>
      <div className="course-tabs">
        {tabs.map((value) => (
          <button
            className={tab === value ? "active" : ""}
            key={value}
            onClick={() => setTab(value)}
          >
            {value[0].toUpperCase() + value.slice(1)}
          </button>
        ))}
      </div>
      {tab === "overview" && (
        <section className="card learning-panel">
          <h2>Course overview</h2>
          <p className="learning-text">
            {course.description || "No course description has been provided."}
          </p>
        </section>
      )}
      {tab === "materials" && (
        <section className="card learning-panel">
          <h2>Learning materials</h2>
          {active
            .filter((activity) => activity.material_url)
            .map((activity) => (
              <div className="learning-row" key={activity.id}>
                <strong>{activity.title}</strong>
                <a
                  className="btn tertiary small"
                  href={activity.material_url!}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open material <ExternalLink size={15} />
                </a>
              </div>
            ))}
          {!active.some((activity) => activity.material_url) && (
            <p>No material links have been added to this course.</p>
          )}
        </section>
      )}
      {tab === "activities" && (
        <ActivitiesPage
          embedded
          activities={activities}
          courses={[course]}
          refresh={refresh}
          onSessionExpired={onSessionExpired}
        />
      )}
      {tab === "grades" && <GradesPage compact courses={[course]} activities={activities} />}
    </div>
  );
}
