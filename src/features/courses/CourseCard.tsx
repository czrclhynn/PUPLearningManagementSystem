import { ArrowRight, BookOpen, ClipboardCheck, Library } from "lucide-react";
import { Progress } from "../../components/ui/Progress";
import type { LearningCourse, StudentActivity } from "../learning/types";

export function CourseCard({
  course,
  activities,
  onOpen,
}: {
  course: LearningCourse;
  activities: StudentActivity[];
  onOpen: () => void;
}) {
  const active = activities.filter((activity) => activity.status === "Active");
  const pending = active.filter((activity) => !activity.submission_id).length;
  const progress = active.length
    ? Math.round(((active.length - pending) * 100) / active.length)
    : 0;
  return (
    <article className="course-card card">
      <div className="course-cover maroon">
        <span>{course.course_code}</span>
        <BookOpen size={30} />
      </div>
      <div className="course-body">
        <span className="course-code">{course.course_code}</span>
        <h3>{course.course_name}</h3>
        <div className="instructor-line">
          <div className="mini-avatar">{course.instructor_name[0]}</div>
          {course.instructor_name}
        </div>
        <div className="course-progress-head">
          <span>Activities submitted</span>
          <strong>{progress}%</strong>
        </div>
        <Progress value={progress} />
        <div className="course-meta">
          <span>
            <Library size={15} /> {activities.filter((activity) => activity.material_url).length}{" "}
            material links
          </span>
          <span>
            <ClipboardCheck size={15} /> {pending} pending
          </span>
        </div>
        <button className="btn secondary full" onClick={onOpen}>
          View course <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}
