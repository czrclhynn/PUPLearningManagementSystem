import {
  AlarmClock,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Library,
  MoreHorizontal,
  Sparkles,
  Video,
} from "lucide-react";
import { type Page } from "../../app/navigation";
import { courses } from "../courses/mock";
import { activities } from "../activities/mock";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";
import { StatCard } from "../../components/ui/StatCard";
import { CourseCard } from "../courses/CourseCard";

export function Dashboard({
  onNavigate,
  openCourse,
}: {
  onNavigate: (p: Page) => void;
  openCourse: () => void;
}) {
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
        ? "Good afternoon"
        : "Good evening";
  return (
    <div className="page dashboard-page">
      <section className="welcome-panel">
        <div>
          <span className="eyebrow light">MONDAY, MAY 25</span>
          <h1>{greeting}, Izy!</h1>
          <p>Here’s what’s happening with your academic journey today.</p>
        </div>
        <div className="day-focus">
          <span>
            <Sparkles size={16} /> TODAY’S FOCUS
          </span>
          <strong>2 classes · 1 deadline</strong>
          <small>You’re all caught up on announcements</small>
        </div>
      </section>
      <div className="stats-grid">
        <StatCard
          icon={BookOpen}
          label="Enrolled courses"
          value="6"
          foot="This semester"
          tone="maroon"
        />
        <StatCard
          icon={AlarmClock}
          label="Pending activities"
          value="4"
          foot="1 due today"
          tone="amber"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed activities"
          value="18"
          foot="+3 this week"
          tone="green"
        />
        <StatCard
          icon={BarChart3}
          label="Academic progress"
          value="82%"
          foot="+4% this month"
          tone="blue"
        />
      </div>
      <div className="dashboard-grid">
        <section className="card schedule-card">
          <div className="section-head">
            <div>
              <h2>Today’s schedule</h2>
              <p>Monday, May 25</p>
            </div>
            <button className="text-btn" onClick={() => onNavigate("calendar")}>
              Full calendar <ArrowRight size={15} />
            </button>
          </div>
          <div className="timeline">
            <div className="timeline-row current">
              <div className="time">
                <strong>10:00</strong>
                <span>11:30 AM</span>
              </div>
              <i />
              <div className="class-info">
                <div>
                  <span className="live-label">NEXT CLASS</span>
                  <h3>Introduction to Data Science</h3>
                  <p>COMP 034 · Prof. Carlo Inovero</p>
                </div>
                <div className="room">
                  <Video size={16} />
                  <span>
                    Online class<small>Meeting link available</small>
                  </span>
                </div>
                <button className="btn primary small">Join class</button>
              </div>
            </div>
            <div className="timeline-row">
              <div className="time">
                <strong>1:00</strong>
                <span>2:30 PM</span>
              </div>
              <i />
              <div className="class-info">
                <div>
                  <h3>Database Administration</h3>
                  <p>COMP 018 · Prof. Mia Santos</p>
                </div>
                <div className="room">
                  <Library size={16} />
                  <span>
                    Room 405<small>CEA Building</small>
                  </span>
                </div>
              </div>
            </div>
            <div className="timeline-row">
              <div className="time">
                <strong>3:00</strong>
                <span>4:30 PM</span>
              </div>
              <i />
              <div className="class-info">
                <div>
                  <h3>Fundamentals of Research</h3>
                  <p>COMP 015 · Dr. Ramon Cortez</p>
                </div>
                <div className="room">
                  <Library size={16} />
                  <span>
                    Room 310<small>Main Building</small>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="card deadlines-card">
          <div className="section-head">
            <div>
              <h2>Upcoming deadlines</h2>
              <p>Your next requirements</p>
            </div>
            <button className="icon-btn">
              <MoreHorizontal size={19} />
            </button>
          </div>
          {activities.slice(0, 4).map((item, i) => (
            <button
              className="deadline-item"
              key={item.title}
              onClick={() => onNavigate("activities")}
            >
              <div className={`date-tile ${i === 0 ? "urgent" : ""}`}>
                <strong>{i === 0 ? "25" : 26 + i}</strong>
                <span>MAY</span>
              </div>
              <div>
                <strong>{item.title}</strong>
                <span>
                  {item.course} · {item.type}
                </span>
                <small>
                  <Clock3 size={13} /> {i === 0 ? "Due in 8 hours" : item.due}
                </small>
              </div>
              <Badge tone={item.status.toLowerCase()}>{item.status}</Badge>
            </button>
          ))}
          <button className="view-all" onClick={() => onNavigate("activities")}>
            View all activities <ArrowRight size={15} />
          </button>
        </section>
      </div>
      <section className="content-section">
        <div className="section-head">
          <div>
            <h2>Continue learning</h2>
            <p>Pick up where you left off</p>
          </div>
          <button className="text-btn" onClick={() => onNavigate("courses")}>
            All courses <ArrowRight size={15} />
          </button>
        </div>
        <div className="course-grid preview">
          {courses.slice(0, 3).map((course) => (
            <CourseCard key={course.code} course={course} onOpen={openCourse} />
          ))}
        </div>
      </section>
      <div className="dashboard-lower">
        <section className="card announcements-card">
          <div className="section-head">
            <div>
              <h2>Recent announcements</h2>
              <p>Latest updates from your courses</p>
            </div>
            <button className="text-btn" onClick={() => onNavigate("announcements")}>
              View all
            </button>
          </div>
          {[
            [
              "Updated consultation hours",
              "COMP 034 · Prof. Carlo Inovero",
              "Consultation will be held online this Wednesday from 2:00–4:00 PM.",
              "20 min",
            ],
            [
              "Midterm examination coverage",
              "COMP 018 · Prof. Mia Santos",
              "Please review Modules 1–4 and the database security case study.",
              "2 hr",
            ],
            [
              "University library advisory",
              "PUP University Library",
              "Extended library hours begin this week for the midterm period.",
              "Yesterday",
            ],
          ].map((a, i) => (
            <article className="announcement-row" key={a[0]}>
              <div className={`announcement-icon a${i}`}>
                <Bell size={17} />
              </div>
              <div>
                <h3>{a[0]}</h3>
                <span>
                  {a[1]} · {a[3]}
                </span>
                <p>{a[2]}</p>
              </div>
              <ChevronRight size={18} />
            </article>
          ))}
        </section>
        <section className="card progress-card">
          <div className="section-head">
            <div>
              <h2>Learning progress</h2>
              <p>This semester</p>
            </div>
            <button className="icon-btn">
              <MoreHorizontal size={19} />
            </button>
          </div>
          <div className="progress-score">
            <div className="ring">
              <span>
                82<small>%</small>
              </span>
            </div>
            <div>
              <strong>On track</strong>
              <p>You’re making steady progress across your courses.</p>
            </div>
          </div>
          {[
            ["Activities completed", "18 of 22", 82],
            ["Materials accessed", "56 of 68", 76],
            ["Weekly study goal", "7.5 of 10 hrs", 75],
          ].map(([a, b, c]) => (
            <div className="metric" key={a as string}>
              <div>
                <span>{a}</span>
                <strong>{b}</strong>
              </div>
              <Progress value={c as number} gold={a === "Weekly study goal"} />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
