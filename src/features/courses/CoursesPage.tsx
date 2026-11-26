import { useState } from "react";
import { Grid2X2, List, Search } from "lucide-react";
import { CourseCard } from "./CourseCard";
import type { StudentLearning } from "../learning/types";

export function CoursesPage({
  learning,
  openCourse,
}: {
  learning: StudentLearning;
  openCourse: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [grid, setGrid] = useState(true);
  const query = search.trim().toLowerCase();
  const filtered = learning.courses.filter((course) =>
    `${course.course_name} ${course.course_code}`.toLowerCase().includes(query),
  );
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACADEMICS</span>
          <h1>My Courses</h1>
          <p>Access your enrolled subjects, materials, and academic activities.</p>
        </div>
      </div>
      <div className="toolbar card">
        <div className="search-field">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search courses"
            placeholder="Search by course or code..."
          />
        </div>
        <div className="view-toggle">
          <button
            className={grid ? "active" : ""}
            onClick={() => setGrid(true)}
            aria-label="Grid view"
          >
            <Grid2X2 size={17} />
          </button>
          <button
            className={!grid ? "active" : ""}
            onClick={() => setGrid(false)}
            aria-label="List view"
          >
            <List size={18} />
          </button>
        </div>
      </div>
      <div className="tabs">
        <button className="active">
          Enrolled courses <span>{learning.courses.length}</span>
        </button>
      </div>
      <div className={`course-grid ${grid ? "" : "list-view"}`}>
        {filtered.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            activities={learning.activities.filter((item) => item.course_id === course.id)}
            onOpen={() => openCourse(course.id)}
          />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <Search size={30} />
          <h3>No courses found</h3>
          <p>
            {query
              ? "Try another course title or code."
              : "Your courses will appear when an administrator enrolls you."}
          </p>
        </div>
      )}
    </div>
  );
}
