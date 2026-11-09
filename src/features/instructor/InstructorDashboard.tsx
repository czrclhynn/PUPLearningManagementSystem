import { useState } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Plus,
  Upload,
  Users,
  X,
} from "lucide-react";
import { courses } from "../courses/mock";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";
import { StatCard } from "../../components/ui/StatCard";

export function InstructorDashboard() {
  const [modal, setModal] = useState("");
  const [created, setCreated] = useState("");
  return (
    <div className="page">
      <section className="role-banner instructor-banner">
        <div>
          <span className="eyebrow light">INSTRUCTOR WORKSPACE</span>
          <h1>Good afternoon, Prof. Inovero.</h1>
          <p>Manage your courses, review student work, and keep your classes moving.</p>
        </div>
        <button className="btn light" onClick={() => setModal("announcement")}>
          <Plus size={17} /> Create announcement
        </button>
      </section>
      <div className="stats-grid">
        <StatCard
          icon={BookOpen}
          label="Assigned courses"
          value="4"
          foot="2 active today"
          tone="maroon"
        />
        <StatCard
          icon={Users}
          label="Total students"
          value="168"
          foot="Across 4 sections"
          tone="blue"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Pending submissions"
          value="23"
          foot="8 submitted today"
          tone="amber"
        />
        <StatCard
          icon={CalendarDays}
          label="Upcoming activities"
          value="6"
          foot="Next 14 days"
          tone="green"
        />
      </div>
      {created && (
        <div className="success-toast">
          <CheckCircle2 size={18} />
          {created}
        </div>
      )}
      <div className="instructor-grid">
        <section className="card">
          <div className="section-head">
            <div>
              <h2>Your courses</h2>
              <p>Current semester</p>
            </div>
            <button className="text-btn">View all</button>
          </div>
          {courses.slice(0, 3).map((c, i) => (
            <div className="managed-course" key={c.code}>
              <div className={`course-badge ${c.accent}`}>
                <BookOpen size={20} />
              </div>
              <div>
                <span>
                  {c.code} · {c.section}
                </span>
                <strong>{c.title}</strong>
                <small>
                  {[42, 38, 45][i]} students · {c.materials} materials
                </small>
              </div>
              <button className="btn tertiary small">
                Manage <ChevronRight size={15} />
              </button>
            </div>
          ))}
        </section>
        <section className="card review-queue">
          <div className="section-head">
            <div>
              <h2>Submission queue</h2>
              <p>Work waiting for review</p>
            </div>
            <Badge tone="pending">23 pending</Badge>
          </div>
          {[
            ["Data Preparation Exercise", "COMP 034", "18 of 42 submitted"],
            ["Database Recovery Plan", "COMP 018", "31 of 38 submitted"],
            ["Research Problem Draft", "COMP 015", "40 of 45 submitted"],
          ].map((r, i) => (
            <div className="review-row" key={r[0]}>
              <div>
                <strong>{r[0]}</strong>
                <span>
                  {r[1]} · {r[2]}
                </span>
                <Progress value={[43, 82, 89][i]} />
              </div>
              <button className="btn tertiary small">Review</button>
            </div>
          ))}
        </section>
      </div>
      <div className="instructor-grid lower">
        <section className="card quick-actions">
          <div className="section-head">
            <div>
              <h2>Quick actions</h2>
              <p>Common teaching tasks</p>
            </div>
          </div>
          <div>
            <button onClick={() => setModal("material")}>
              <Upload size={20} />
              <span>
                <strong>Upload material</strong>
                <small>Add PPT, PDF, or resource</small>
              </span>
            </button>
            <button onClick={() => setModal("activity")}>
              <ClipboardCheck size={20} />
              <span>
                <strong>Create activity</strong>
                <small>Assignment, quiz, or project</small>
              </span>
            </button>
            <button>
              <BarChart3 size={20} />
              <span>
                <strong>Class performance</strong>
                <small>Review progress and scores</small>
              </span>
            </button>
            <button onClick={() => setModal("announcement")}>
              <Bell size={20} />
              <span>
                <strong>Post announcement</strong>
                <small>Notify your students</small>
              </span>
            </button>
          </div>
        </section>
        <section className="card at-risk">
          <div className="section-head">
            <div>
              <h2>Class pulse</h2>
              <p>COMP 034 · BSIT 3-3</p>
            </div>
            <button className="text-btn">Full report</button>
          </div>
          <div className="pulse-score">
            <strong>84%</strong>
            <span>
              Class completion rate<small>+6% from last week</small>
            </span>
          </div>
          <Progress value={84} />
          <div className="pulse-metrics">
            <span>
              <strong>36</strong>On track
            </span>
            <span>
              <strong>4</strong>Need attention
            </span>
            <span>
              <strong>2</strong>Inactive
            </span>
          </div>
        </section>
      </div>
      {modal && (
        <div className="modal-layer">
          <form
            className="compose-modal card"
            onSubmit={(e) => {
              e.preventDefault();
              setCreated(`${modal[0].toUpperCase() + modal.slice(1)} created successfully.`);
              setModal("");
            }}
          >
            <div className="section-head">
              <div>
                <span className="eyebrow">INSTRUCTOR TOOL</span>
                <h2>
                  {modal === "material"
                    ? "Upload learning material"
                    : modal === "activity"
                      ? "Create an activity"
                      : "Post an announcement"}
                </h2>
              </div>
              <button type="button" className="icon-btn" onClick={() => setModal("")}>
                <X size={18} />
              </button>
            </div>
            <label>
              Course
              <select>
                <option>COMP 034 · Introduction to Data Science</option>
                <option>COMP 018 · Database Administration</option>
              </select>
            </label>
            <label>
              Title
              <input required placeholder={`Enter ${modal} title`} />
            </label>
            {modal === "material" ? (
              <label className="upload-zone small-zone">
                <Upload size={23} />
                <strong>Select a file</strong>
                <span>PPTX, PDF, DOCX, XLSX, MP4</span>
                <input type="file" />
              </label>
            ) : (
              <label>
                Description
                <textarea placeholder="Add details and instructions..." />
              </label>
            )}
            <div>
              <button type="button" className="btn secondary" onClick={() => setModal("")}>
                Cancel
              </button>
              <button className="btn primary">
                {modal === "material"
                  ? "Upload material"
                  : modal === "activity"
                    ? "Create activity"
                    : "Publish announcement"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
