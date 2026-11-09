import { ArrowRight, BookOpen, Bookmark, ClipboardCheck, Library } from "lucide-react";
import { type Course } from "./types";
import { Progress } from "../../components/ui/Progress";

export function CourseCard({ course, onOpen }: { course: Course; onOpen: () => void }) {
  return (
    <article className="course-card card">
      <div className={`course-cover ${course.accent}`}>
        <span>{course.code}</span>
        <BookOpen size={30} />
        <button className="icon-btn bookmark">
          <Bookmark size={17} />
        </button>
      </div>
      <div className="course-body">
        <span className="course-code">
          {course.code} · {course.section}
        </span>
        <h3>{course.title}</h3>
        <div className="instructor-line">
          <div className="mini-avatar">{course.instructor.split(" ").at(-1)?.[0]}</div>
          {course.instructor}
        </div>
        <div className="course-progress-head">
          <span>Course progress</span>
          <strong>{course.progress}%</strong>
        </div>
        <Progress value={course.progress} />
        <div className="course-meta">
          <span>
            <Library size={15} /> {course.materials} materials
          </span>
          <span>
            <ClipboardCheck size={15} /> {course.pending} pending
          </span>
        </div>
        <button className="btn secondary full" onClick={onOpen}>
          View course <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}
