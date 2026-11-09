import { useState } from "react";
import { CalendarDays, Grid2X2, List, Search } from "lucide-react";
import { courses } from "./mock";
import { CourseCard } from "./CourseCard";

export function CoursesPage({ openCourse }: { openCourse: () => void }) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All Courses");
  const [grid, setGrid] = useState(true);
  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACADEMICS</span>
          <h1>My Courses</h1>
          <p>Access your enrolled subjects, materials, and academic activities.</p>
        </div>
        <div className="term-card">
          <CalendarDays size={20} />
          <div>
            <span>Current term</span>
            <strong>2nd Semester, A.Y. 2024–2025</strong>
          </div>
        </div>
      </div>
      <div className="toolbar card">
        <div className="search-field">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by course or code..."
          />
        </div>
        <select aria-label="Semester">
          <option>Second Semester</option>
          <option>First Semester</option>
        </select>
        <select aria-label="Academic year">
          <option>A.Y. 2024–2025</option>
          <option>A.Y. 2023–2024</option>
        </select>
        <div className="view-toggle">
          <button className={grid ? "active" : ""} onClick={() => setGrid(true)}>
            <Grid2X2 size={17} />
          </button>
          <button className={!grid ? "active" : ""} onClick={() => setGrid(false)}>
            <List size={18} />
          </button>
        </div>
      </div>
      <div className="tabs">
        {["All Courses", "In Progress", "Completed"].map((t) => (
          <button className={tab === t ? "active" : ""} onClick={() => setTab(t)} key={t}>
            {t}
            {t === "All Courses" && <span>6</span>}
          </button>
        ))}
      </div>
      <div className={`course-grid ${grid ? "" : "list-view"}`}>
        {filtered.map((course) => (
          <CourseCard key={course.code} course={course} onOpen={openCourse} />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <Search size={30} />
          <h3>No courses found</h3>
          <p>Try another course title or code.</p>
        </div>
      )}
    </div>
  );
}
