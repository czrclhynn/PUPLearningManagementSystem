import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Activity,
  AlarmClock,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Download,
  Eye,
  EyeOff,
  File,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  GraduationCap,
  Grid2X2,
  HelpCircle,
  LayoutDashboard,
  Library,
  List,
  LogOut,
  Maximize2,
  Menu,
  MessageCircle,
  Moon,
  MoreHorizontal,
  NotebookPen,
  PanelLeftClose,
  Paperclip,
  Pencil,
  Play,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Trash2,
  Upload,
  User,
  Users,
  Video,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

type Page =
  | "dashboard"
  | "courses"
  | "course"
  | "activities"
  | "calendar"
  | "grades"
  | "planner"
  | "discussions"
  | "notes"
  | "announcements"
  | "settings"
  | "help"
  | "instructor"
  | "admin";

type Course = {
  code: string;
  title: string;
  instructor: string;
  section: string;
  progress: number;
  materials: number;
  pending: number;
  accent: string;
  updated: string;
  description: string;
};

const courses: Course[] = [
  {
    code: "COMP 034",
    title: "Introduction to Data Science",
    instructor: "Prof. Carlo Inovero",
    section: "BSIT 3-3",
    progress: 78,
    materials: 14,
    pending: 2,
    accent: "wine",
    updated: "Today, 9:40 AM",
    description:
      "Foundations of data analysis, preparation, visualization, and responsible data practice.",
  },
  {
    code: "COMP 018",
    title: "Database Administration",
    instructor: "Prof. Mia Santos",
    section: "BSIT 3-3",
    progress: 64,
    materials: 11,
    pending: 1,
    accent: "gold",
    updated: "Yesterday",
    description: "Database architecture, security, backup, recovery, and performance management.",
  },
  {
    code: "COMP 015",
    title: "Fundamentals of Research",
    instructor: "Dr. Ramon Cortez",
    section: "BSIT 3-3",
    progress: 86,
    materials: 9,
    pending: 0,
    accent: "green",
    updated: "May 20",
    description: "Research methods, academic writing, ethics, and project development.",
  },
  {
    code: "COMP 023",
    title: "Data Structures & Algorithms",
    instructor: "Prof. Lea Mariano",
    section: "BSIT 3-3",
    progress: 71,
    materials: 16,
    pending: 1,
    accent: "blue",
    updated: "May 19",
    description: "Efficient data organization, algorithmic thinking, and complexity analysis.",
  },
  {
    code: "GEED 008",
    title: "Ethics",
    instructor: "Prof. Nina Reyes",
    section: "BSIT 3-3",
    progress: 92,
    materials: 8,
    pending: 0,
    accent: "purple",
    updated: "May 17",
    description: "Contemporary ethical issues examined through reasoned academic discourse.",
  },
  {
    code: "COMP 030",
    title: "Web Development",
    instructor: "Prof. Julian Cruz",
    section: "BSIT 3-3",
    progress: 69,
    materials: 18,
    pending: 2,
    accent: "orange",
    updated: "May 16",
    description: "Modern web standards, accessible interfaces, and full-stack fundamentals.",
  },
];

const activities = [
  {
    title: "Data Preparation Exercise",
    course: "COMP 034",
    type: "Assignment",
    due: "Today, 11:59 PM",
    points: 50,
    status: "Pending",
  },
  {
    title: "Normalization Quiz",
    course: "COMP 018",
    type: "Quiz",
    due: "Tomorrow, 3:00 PM",
    points: 20,
    status: "Pending",
  },
  {
    title: "Research Problem Draft",
    course: "COMP 015",
    type: "Project",
    due: "May 26, 5:00 PM",
    points: 100,
    status: "Submitted",
  },
  {
    title: "Binary Trees Lab",
    course: "COMP 023",
    type: "Assignment",
    due: "May 28, 11:59 PM",
    points: 60,
    status: "Pending",
  },
  {
    title: "Midterm Reflection",
    course: "GEED 008",
    type: "Essay",
    due: "May 18, 11:59 PM",
    points: 30,
    status: "Graded",
  },
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "courses", label: "My Courses", icon: BookOpen },
  { id: "materials", label: "Learning Materials", icon: Library },
  { id: "activities", label: "Activities & Assessments", icon: ClipboardCheck },
  { id: "calendar", label: "Academic Calendar", icon: CalendarDays },
  { id: "grades", label: "My Grades", icon: BarChart3 },
  { id: "planner", label: "Study Planner", icon: CheckCircle2 },
  { id: "discussions", label: "Class Discussions", icon: MessageCircle },
  { id: "notes", label: "My Notes", icon: NotebookPen },
  { id: "announcements", label: "Announcements", icon: Bell },
] as const;

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo-wrap">
      <div className="logo-mark">
        <span>P</span>
      </div>
      {!compact && (
        <div>
          <strong>PUP</strong>
          <small>LEARNING PORTAL</small>
        </div>
      )}
    </div>
  );
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  return (
    <span className={`badge badge-${tone}`}>
      <span className="badge-dot" />
      {children}
    </span>
  );
}

function Progress({ value, gold = false }: { value: number; gold?: boolean }) {
  return (
    <div className="progress">
      <span className={gold ? "gold" : ""} style={{ width: `${value}%` }} />
    </div>
  );
}

function EmptyPage({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="empty-page card">
      <div className="empty-icon">
        <Settings size={26} />
      </div>
      <h2>{title}</h2>
      <p>{copy}</p>
      <button className="btn primary">Update preferences</button>
    </div>
  );
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(onLogin, 650);
  };
  return (
    <div className="login-page">
      <section className="login-brand">
        <Logo />
        <div className="academic-visual" aria-hidden="true">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-card vc-one">
            <BookOpen size={25} />
            <span>Learn</span>
          </div>
          <div className="visual-card vc-two">
            <BarChart3 size={25} />
            <span>Progress</span>
          </div>
          <div className="visual-center">
            <GraduationCap size={48} />
          </div>
        </div>
        <div className="brand-message">
          <span className="eyebrow light">YOUR CAMPUS, CONNECTED</span>
          <h1>
            Learning built around
            <br />
            your academic journey.
          </h1>
          <p>
            Access courses, stay ahead of deadlines, and connect with your university community in
            one focused space.
          </p>
        </div>
        <span className="brand-footer">Polytechnic University learning environment</span>
      </section>
      <section className="login-form-side">
        <div className="mobile-logo">
          <Logo />
        </div>
        <form className="login-form" onSubmit={submit}>
          <span className="eyebrow">WELCOME TO PUP</span>
          <h2>Welcome back</h2>
          <p className="subtitle">Your academic journey starts here.</p>
          <label>
            Student number or email
            <div className="input-wrap">
              <User size={18} />
              <input
                required
                defaultValue="2022-00123-MN-0"
                placeholder="Enter your student number"
              />
            </div>
          </label>
          <label>
            Password
            <div className="input-wrap">
              <ShieldCheck size={18} />
              <input
                required
                defaultValue="student123"
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="icon-btn bare"
                onClick={() => setPasswordVisible(!passwordVisible)}
                aria-label="Show password"
              >
                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <div className="login-options">
            <label className="check-label">
              <input type="checkbox" defaultChecked /> <span>Remember me</span>
            </label>
            <button type="button" className="text-btn">
              Forgot password?
            </button>
          </div>
          <button className="btn primary login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" /> Signing in...
              </>
            ) : (
              <>
                Sign in <ArrowRight size={18} />
              </>
            )}
          </button>
          <div className="secure-note">
            <ShieldCheck size={15} /> Secured university access
          </div>
          <p className="support-copy">
            Having trouble signing in?{" "}
            <button type="button" className="text-btn">
              Contact support
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}

function Sidebar({
  page,
  onNavigate,
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}: {
  page: Page;
  onNavigate: (page: Page, tab?: string) => void;
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  return (
    <>
      {open && <button className="sidebar-scrim" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`sidebar ${open ? "open" : ""} ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-top">
          <Logo />
          <button
            className="sidebar-collapse icon-btn"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeftClose size={17} />
          </button>
          <button className="mobile-close icon-btn" onClick={onClose}>
            <X size={19} />
          </button>
        </div>
        <nav>
          <span className="nav-label">STUDENT WORKSPACE</span>
          {navItems.map((item) => {
            const active = item.id === "materials" ? page === "course" : page === item.id;
            return (
              <button
                key={item.id}
                className={active ? "active" : ""}
                data-tooltip={item.label}
                aria-label={item.label}
                onClick={() => {
                  if (item.id === "materials") onNavigate("course", "materials");
                  else onNavigate(item.id as Page);
                  onClose();
                }}
              >
                <item.icon size={19} />
                <span>{item.label}</span>
                {item.id === "activities" && <em>4</em>}
                {item.id === "announcements" && <em className="announcement-badge">3</em>}
              </button>
            );
          })}
          <span className="nav-label second">ACCOUNT</span>
          <button
            className={page === "settings" ? "active" : ""}
            onClick={() => onNavigate("settings")}
            data-tooltip="Settings"
            aria-label="Settings"
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>
          <button
            className={page === "help" ? "active" : ""}
            onClick={() => onNavigate("help")}
            data-tooltip="Help & Support"
            aria-label="Help & Support"
          >
            <CircleHelp size={19} />
            <span>Help & Support</span>
          </button>
        </nav>
        <div className="sidebar-profile">
          <div className="avatar">IB</div>
          <div>
            <strong>Izy Basco</strong>
            <span>BSIT 3-3 · 2022-00123</span>
          </div>
          <MoreHorizontal size={18} />
        </div>
      </aside>
    </>
  );
}

function Header({
  title,
  onMenu,
  onNavigate,
  role,
  setRole,
  theme,
  onThemeToggle,
}: {
  title: string;
  onMenu: () => void;
  onNavigate: (p: Page) => void;
  role: string;
  setRole: (r: string) => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
}) {
  const [notifications, setNotifications] = useState(false);
  const [profile, setProfile] = useState(false);
  return (
    <header className="topbar">
      <div className="topbar-title">
        <button className="menu-button icon-btn" onClick={onMenu}>
          <Menu size={21} />
        </button>
        <div>
          <span>PUP Learning Portal</span>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="topbar-actions">
        <div className="global-search">
          <Search size={18} />
          <input placeholder="Search courses, materials..." />
        </div>
        <button
          className="icon-btn theme-toggle"
          onClick={onThemeToggle}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
        </button>
        <div className="relative">
          <button
            className="icon-btn notification-button"
            onClick={() => {
              setNotifications(!notifications);
              setProfile(false);
            }}
          >
            <Bell size={20} />
            <span />
          </button>
          {notifications && (
            <div className="popover notification-popover">
              <div className="popover-head">
                <div>
                  <strong>Notifications</strong>
                  <span>3 unread updates</span>
                </div>
                <button className="text-btn">Mark all read</button>
              </div>
              {[
                ["New material uploaded", "COMP 034 · 8 minutes ago", BookOpen],
                ["Deadline approaching", "Database activity · Due tomorrow", AlarmClock],
                ["Your work was graded", "Ethics reflection · 28/30", CheckCircle2],
              ].map(([a, b, Icon], i) => (
                <button className="notification-item" key={i}>
                  <div className="notif-icon">
                    <Icon size={17} />
                  </div>
                  <span>
                    <strong>{a as string}</strong>
                    <small>{b as string}</small>
                  </span>
                  <i />
                </button>
              ))}
              <button
                className="view-all"
                onClick={() => {
                  onNavigate("announcements");
                  setNotifications(false);
                }}
              >
                View notification center <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            className="profile-trigger"
            onClick={() => {
              setProfile(!profile);
              setNotifications(false);
            }}
          >
            <div className="avatar small">IB</div>
            <span>
              <strong>Izy Basco</strong>
              <small>{role} account</small>
            </span>
            <ChevronDown size={15} />
          </button>
          {profile && (
            <div className="popover profile-popover">
              <span className="menu-label">SWITCH WORKSPACE</span>
              <button
                onClick={() => {
                  setRole("Student");
                  onNavigate("dashboard");
                  setProfile(false);
                }}
              >
                <GraduationCap size={17} /> Student{" "}
                <Check size={15} className={role === "Student" ? "" : "hidden"} />
              </button>
              <button
                onClick={() => {
                  setRole("Instructor");
                  onNavigate("instructor");
                  setProfile(false);
                }}
              >
                <BookMarked size={17} /> Instructor{" "}
                <Check size={15} className={role === "Instructor" ? "" : "hidden"} />
              </button>
              <button
                onClick={() => {
                  setRole("Administrator");
                  onNavigate("admin");
                  setProfile(false);
                }}
              >
                <ShieldCheck size={17} /> Administrator{" "}
                <Check size={15} className={role === "Administrator" ? "" : "hidden"} />
              </button>
              <hr />
              <button>
                <User size={17} /> My profile
              </button>
              <button>
                <Settings size={17} /> Account settings
              </button>
              <button className="danger">
                <LogOut size={17} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  foot,
  tone,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  foot: string;
  tone: string;
}) {
  return (
    <div className="stat-card card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={21} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{foot}</small>
      </div>
    </div>
  );
}

function CourseCard({ course, onOpen }: { course: Course; onOpen: () => void }) {
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

function Dashboard({
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

function CoursesPage({ openCourse }: { openCourse: () => void }) {
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

function MaterialRow({
  type,
  name,
  meta,
  onPreview,
}: {
  type: string;
  name: string;
  meta: string;
  onPreview: () => void;
}) {
  const Icon =
    type === "PPTX" ? Play : type === "PDF" ? FileText : type === "XLSX" ? FileSpreadsheet : File;
  const [saved, setSaved] = useState(false);
  return (
    <div className="material-row">
      <div className={`file-icon ${type.toLowerCase()}`}>
        <Icon size={21} />
        <span>{type}</span>
      </div>
      <div className="file-info">
        <strong>{name}</strong>
        <span>{meta}</span>
      </div>
      <button
        className={`icon-btn ${saved ? "saved" : ""}`}
        onClick={() => setSaved(!saved)}
        aria-label="Bookmark"
      >
        <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
      </button>
      <button className="btn tertiary small" onClick={onPreview}>
        <Eye size={16} /> Preview
      </button>
      <button className="icon-btn">
        <Download size={18} />
      </button>
    </div>
  );
}

function PresentationViewer({ onClose }: { onClose: () => void }) {
  const [slide, setSlide] = useState(1);
  const [zoom, setZoom] = useState(100);
  return (
    <div className="modal-layer viewer-layer">
      <div className="presentation-viewer">
        <header>
          <div>
            <button className="icon-btn dark" onClick={onClose}>
              <X size={19} />
            </button>
            <div>
              <strong>Introduction to Data Science.pptx</strong>
              <span>COMP 034 · Module 1</span>
            </div>
          </div>
          <div>
            <button className="icon-btn dark" onClick={() => setZoom(Math.max(70, zoom - 10))}>
              <ZoomOut size={18} />
            </button>
            <span>{zoom}%</span>
            <button className="icon-btn dark" onClick={() => setZoom(Math.min(130, zoom + 10))}>
              <ZoomIn size={18} />
            </button>
            <button className="icon-btn dark">
              <Maximize2 size={18} />
            </button>
            <button className="btn light small">
              <Download size={16} /> Download
            </button>
          </div>
        </header>
        <div className="viewer-body">
          <aside>
            <span>SLIDES</span>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button className={slide === n ? "active" : ""} onClick={() => setSlide(n)} key={n}>
                <i>{n}</i>
                <div className={`thumb thumb-${n}`}>
                  <small>
                    {n === 1
                      ? "DATA SCIENCE"
                      : n === 2
                        ? "What is Data?"
                        : n === 3
                          ? "The Process"
                          : `Topic ${n}`}
                  </small>
                </div>
              </button>
            ))}
          </aside>
          <main>
            <div className="slide-canvas" style={{ transform: `scale(${zoom / 100})` }}>
              {slide === 1 ? (
                <>
                  <span className="slide-kicker">COMP 034 · MODULE 1</span>
                  <h1>
                    Introduction to
                    <br />
                    <b>Data Science</b>
                  </h1>
                  <p>Understanding data, insights, and the questions that connect them.</p>
                  <div className="slide-footer">
                    <span>PUP</span>
                    <small>Prof. Carlo Inovero · 2024–2025</small>
                  </div>
                </>
              ) : (
                <>
                  <span className="slide-kicker">LESSON {slide - 1}</span>
                  <h1>
                    {
                      [
                        "",
                        "",
                        "What is Data?",
                        "The Data Science Process",
                        "Collecting Information",
                        "Preparing a Dataset",
                        "Key Takeaways",
                      ][slide]
                    }
                  </h1>
                  <div className="slide-columns">
                    <div>
                      <span>0{slide - 1}</span>
                      <h3>Observe</h3>
                      <p>Start with a clear question and understand the available information.</p>
                    </div>
                    <div>
                      <span>0{slide}</span>
                      <h3>Analyze</h3>
                      <p>Transform raw inputs into meaningful and responsible insight.</p>
                    </div>
                  </div>
                  <div className="slide-footer">
                    <span>PUP</span>
                    <small>Introduction to Data Science</small>
                  </div>
                </>
              )}
            </div>
            <div className="viewer-controls">
              <button onClick={() => setSlide(Math.max(1, slide - 1))} disabled={slide === 1}>
                <ChevronLeft size={20} />
              </button>
              <span>Slide {slide} of 6</span>
              <button onClick={() => setSlide(Math.min(6, slide + 1))} disabled={slide === 6}>
                <ChevronRight size={20} />
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function CoursePage({
  initialTab,
  onBack,
  onActivity,
}: {
  initialTab: string;
  onBack: () => void;
  onActivity: () => void;
}) {
  const [tab, setTab] = useState(initialTab || "overview");
  const [viewer, setViewer] = useState(false);
  return (
    <div className="page course-page">
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={16} /> Back to my courses
      </button>
      <section className="course-hero">
        <div className="course-hero-pattern" />
        <div className="hero-icon">
          <BookOpen size={31} />
        </div>
        <div className="hero-copy">
          <span>COMP 034 · BSIT 3-3</span>
          <h1>Introduction to Data Science</h1>
          <p>
            Explore the principles, tools, and practices that turn raw data into meaningful
            decisions.
          </p>
          <div className="hero-instructor">
            <div className="avatar small">CI</div>
            <span>
              <small>Course instructor</small>
              <strong>Prof. Carlo Inovero</strong>
            </span>
          </div>
        </div>
        <div className="hero-progress">
          <span>COURSE PROGRESS</span>
          <div className="hero-score">
            <strong>78%</strong>
            <small>completed</small>
          </div>
          <Progress value={78} gold />
          <p>11 of 14 materials completed</p>
        </div>
      </section>
      <div className="course-tabs">
        {["overview", "materials", "activities", "discussions", "grades"].map((t) => (
          <button className={tab === t ? "active" : ""} onClick={() => setTab(t)} key={t}>
            {t === "materials" ? "Learning Materials" : t[0].toUpperCase() + t.slice(1)}
            {t === "activities" && <span>2</span>}
          </button>
        ))}
      </div>
      {tab === "overview" && (
        <div className="course-overview">
          <div className="overview-main">
            <section className="card instructor-note">
              <div className="quote-mark">“</div>
              <div>
                <span className="eyebrow">A NOTE FROM YOUR INSTRUCTOR</span>
                <h2>Welcome to the course, data explorers.</h2>
                <p>
                  This week, we’ll learn how raw information becomes useful insight. Review Module 2
                  before our live session and bring one real-world example of a messy dataset.
                </p>
                <div className="signed">
                  <div className="avatar small">CI</div>
                  <span>
                    <strong>Prof. Carlo Inovero</strong>
                    <small>Posted May 22</small>
                  </span>
                </div>
              </div>
            </section>
            <section className="card">
              <div className="section-head">
                <div>
                  <h2>Continue learning</h2>
                  <p>Your most recent module</p>
                </div>
                <button className="text-btn" onClick={() => setTab("materials")}>
                  All materials
                </button>
              </div>
              <div className="continue-module">
                <div className="module-number">02</div>
                <div>
                  <span>MODULE 2 · 4 MATERIALS</span>
                  <h3>Data Collection and Preparation</h3>
                  <p>Learn methods for gathering, cleaning, and preparing quality data.</p>
                  <Progress value={50} />
                </div>
                <button className="btn primary" onClick={() => setTab("materials")}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </section>
          </div>
          <aside className="overview-aside card">
            <div className="section-head">
              <div>
                <h2>Up next</h2>
                <p>Course activities</p>
              </div>
            </div>
            <div className="up-next-date">
              <span>MAY</span>
              <strong>25</strong>
            </div>
            <Badge tone="pending">Due today</Badge>
            <h3>Data Preparation Exercise</h3>
            <p>Apply preprocessing techniques to the sample customer dataset.</p>
            <div className="detail-list">
              <span>
                <Clock3 size={16} /> 11:59 PM
              </span>
              <span>
                <Star size={16} /> 50 points
              </span>
            </div>
            <button className="btn primary full" onClick={onActivity}>
              View activity
            </button>
            <hr />
            <h4>Course at a glance</h4>
            <div className="glance-grid">
              <div>
                <strong>14</strong>
                <span>Materials</span>
              </div>
              <div>
                <strong>6</strong>
                <span>Activities</span>
              </div>
              <div>
                <strong>3</strong>
                <span>Discussions</span>
              </div>
              <div>
                <strong>89</strong>
                <span>Standing</span>
              </div>
            </div>
          </aside>
        </div>
      )}
      {tab === "materials" && (
        <div className="materials-layout">
          <main>
            <div className="page-subhead">
              <div>
                <h2>Learning Materials</h2>
                <p>Course content organized by learning module.</p>
              </div>
              <div className="search-field compact">
                <Search size={17} />
                <input placeholder="Search materials..." />
              </div>
            </div>
            <section className="module card">
              <div className="module-head">
                <div>
                  <span>MODULE 1</span>
                  <h2>Introduction to Data Science</h2>
                  <p>Completed · 3 materials</p>
                </div>
                <div className="completion-check">
                  <Check size={18} />
                </div>
              </div>
              <MaterialRow
                type="PPTX"
                name="Introduction to Data Science.pptx"
                meta="8.4 MB · Uploaded May 5 by Prof. Inovero"
                onPreview={() => setViewer(true)}
              />
              <MaterialRow
                type="PDF"
                name="History and Applications of Data Science.pdf"
                meta="2.1 MB · Uploaded May 5 by Prof. Inovero"
                onPreview={() => setViewer(true)}
              />
              <MaterialRow
                type="PDF"
                name="Lecture Notes – Week 1.pdf"
                meta="1.8 MB · Uploaded May 7 by Prof. Inovero"
                onPreview={() => setViewer(true)}
              />
            </section>
            <section className="module card">
              <div className="module-head">
                <div>
                  <span>MODULE 2 · CURRENT</span>
                  <h2>Data Collection and Preparation</h2>
                  <p>2 of 4 materials viewed</p>
                </div>
                <div className="module-percent">50%</div>
              </div>
              <MaterialRow
                type="PPTX"
                name="Data Collection Methods.pptx"
                meta="10.2 MB · Uploaded May 18 by Prof. Inovero"
                onPreview={() => setViewer(true)}
              />
              <MaterialRow
                type="PDF"
                name="Data Preprocessing.pdf"
                meta="3.6 MB · Uploaded May 18 by Prof. Inovero"
                onPreview={() => setViewer(true)}
              />
              <MaterialRow
                type="XLSX"
                name="Customer Dataset – Practice File.xlsx"
                meta="780 KB · Uploaded May 20 by Prof. Inovero"
                onPreview={() => setViewer(true)}
              />
            </section>
          </main>
          <aside className="card materials-aside">
            <h3>Course resources</h3>
            <button>
              <FileText size={18} /> Course syllabus <Download size={16} />
            </button>
            <button>
              <CalendarDays size={18} /> Learning schedule <Download size={16} />
            </button>
            <button>
              <BookMarked size={18} /> Reference guide <Download size={16} />
            </button>
            <hr />
            <h3>Your bookmarks</h3>
            <p>Save materials for quick access while studying.</p>
            <button className="btn tertiary full">
              <Bookmark size={16} /> View bookmarks
            </button>
          </aside>
        </div>
      )}
      {tab === "activities" && <ActivitiesPage embedded onOpen={onActivity} />}
      {tab === "discussions" && <DiscussionsPage compact />}
      {tab === "grades" && <GradesPage compact />}
      {viewer && <PresentationViewer onClose={() => setViewer(false)} />}
    </div>
  );
}

function ActivitiesPage({ embedded = false, onOpen }: { embedded?: boolean; onOpen?: () => void }) {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<(typeof activities)[0] | null>(null);
  const [file, setFile] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const [question, setQuestion] = useState(0);
  const [answer, setAnswer] = useState<number[]>([]);
  const shown = activities.filter(
    (a) => filter === "All" || a.type === filter || a.status === filter,
  );
  if (quiz)
    return (
      <div className={embedded ? "" : "page"}>
        <div className="quiz-shell card">
          <div className="quiz-head">
            <div>
              <span className="eyebrow">COMP 018 · ASSESSMENT</span>
              <h1>Database Normalization Quiz</h1>
              <p>20 questions · 30 minute time limit</p>
            </div>
            <div className="quiz-time">
              <Clock3 size={18} />
              <span>
                Time remaining<strong>24:18</strong>
              </span>
            </div>
          </div>
          <Progress value={((question + 1) / 4) * 100} />
          <div className="quiz-body">
            <aside>
              <span>QUESTIONS</span>
              <div>
                {[0, 1, 2, 3].map((n) => (
                  <button
                    className={`${question === n ? "active" : ""} ${answer[n] !== undefined ? "answered" : ""}`}
                    onClick={() => setQuestion(n)}
                    key={n}
                  >
                    {n + 1}
                  </button>
                ))}
              </div>
              <p>
                <i /> Answered <i /> Current
              </p>
            </aside>
            <main>
              <span>QUESTION {question + 1} OF 4</span>
              <h2>
                {
                  [
                    "Which normal form removes partial dependencies?",
                    "What uniquely identifies each row in a relation?",
                    "A transitive dependency is removed in which normal form?",
                    "Which operation combines rows from related tables?",
                  ][question]
                }
              </h2>
              {[
                "First normal form|Second normal form|Third normal form|Boyce-Codd normal form",
                "Foreign key|Primary key|Composite view|Index",
                "1NF|2NF|3NF|4NF",
                "Select|Join|Update|Group",
              ].map(
                (set, i) =>
                  i === question &&
                  set.split("|").map((option, n) => (
                    <button
                      className={`answer-option ${answer[question] === n ? "selected" : ""}`}
                      onClick={() => {
                        const next = [...answer];
                        next[question] = n;
                        setAnswer(next);
                      }}
                      key={option}
                    >
                      <span>{String.fromCharCode(65 + n)}</span>
                      {option}
                      <i>{answer[question] === n && <Check size={15} />}</i>
                    </button>
                  )),
              )}
              <div className="quiz-actions">
                <button
                  className="btn secondary"
                  onClick={() => setQuestion(Math.max(0, question - 1))}
                  disabled={question === 0}
                >
                  <ChevronLeft size={17} /> Previous
                </button>
                {question < 3 ? (
                  <button className="btn primary" onClick={() => setQuestion(question + 1)}>
                    Next question <ChevronRight size={17} />
                  </button>
                ) : (
                  <button
                    className="btn primary"
                    onClick={() => {
                      setQuiz(false);
                      setSubmitted(true);
                    }}
                  >
                    Submit quiz
                  </button>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  if (selected)
    return (
      <div className={embedded ? "" : "page"}>
        <button className="back-link" onClick={() => setSelected(null)}>
          <ArrowLeft size={16} /> Back to activities
        </button>
        <div className="activity-detail-grid">
          <main className="card activity-detail">
            <div className="activity-title-row">
              <div className="activity-type-icon">
                <ClipboardCheck size={24} />
              </div>
              <div>
                <span className="eyebrow">
                  {selected.course} · {selected.type}
                </span>
                <h1>{selected.title}</h1>
                <p>Posted by Prof. Carlo Inovero · May 20</p>
              </div>
            </div>
            <div className="activity-facts">
              <span>
                <CalendarDays size={18} />
                <small>Due date</small>
                <strong>{selected.due}</strong>
              </span>
              <span>
                <Star size={18} />
                <small>Maximum points</small>
                <strong>{selected.points} points</strong>
              </span>
              <span>
                <FileText size={18} />
                <small>Submission type</small>
                <strong>File upload</strong>
              </span>
            </div>
            <section>
              <h2>Instructions</h2>
              <p>
                Use the provided customer dataset to demonstrate the data preparation techniques
                discussed in Module 2. Document missing values, duplicate records, and
                transformations in a concise report.
              </p>
              <ol>
                <li>Download and inspect the attached dataset.</li>
                <li>Clean the data using the techniques from the lecture.</li>
                <li>Submit your notebook and a one-page summary as a single ZIP file.</li>
              </ol>
            </section>
            <section>
              <h2>Reference material</h2>
              <div className="attachment">
                <FileSpreadsheet size={20} />
                <span>
                  <strong>customer-dataset.xlsx</strong>
                  <small>780 KB · Excel spreadsheet</small>
                </span>
                <button className="icon-btn">
                  <Download size={18} />
                </button>
              </div>
            </section>
          </main>
          <aside className="card submission-card">
            <div className="section-head">
              <div>
                <h2>Your submission</h2>
                <p>{submitted ? "Submitted successfully" : "Not yet submitted"}</p>
              </div>
              {submitted ? (
                <Badge tone="submitted">Submitted</Badge>
              ) : (
                <Badge tone="pending">Pending</Badge>
              )}
            </div>
            {submitted ? (
              <div className="submission-success">
                <div>
                  <CheckCircle2 size={28} />
                </div>
                <h3>Work submitted</h3>
                <p>May 25, 3:42 PM</p>
                <div className="attachment">
                  <File size={19} />
                  <span>
                    <strong>{file || "izy-delacruz-data-prep.zip"}</strong>
                    <small>4.2 MB</small>
                  </span>
                </div>
                <button className="btn secondary full">View submission</button>
              </div>
            ) : (
              <>
                <label className="upload-zone">
                  <Upload size={26} />
                  <strong>{file || "Upload your work"}</strong>
                  <span>
                    {file ? "File ready for submission" : "Drag and drop or browse your device"}
                  </span>
                  <small>ZIP, PDF, DOCX · Maximum 50 MB</small>
                  <input type="file" onChange={(e) => setFile(e.target.files?.[0]?.name || "")} />
                </label>
                <label className="response-label">
                  Submission note{" "}
                  <textarea placeholder="Add an optional note for your instructor..." />
                </label>
                <button
                  className="btn primary full"
                  disabled={!file}
                  onClick={() => setConfirm(true)}
                >
                  Submit activity <Send size={16} />
                </button>
                <p className="submission-note">
                  <ShieldCheck size={14} /> You can replace your submission until the deadline.
                </p>
              </>
            )}
          </aside>
        </div>
        {confirm && (
          <div className="modal-layer">
            <div className="confirm-modal card">
              <div className="confirm-icon">
                <Send size={24} />
              </div>
              <h2>Submit your activity?</h2>
              <p>
                You’re about to submit <strong>{file}</strong>. You can still resubmit before the
                deadline.
              </p>
              <div>
                <button className="btn secondary" onClick={() => setConfirm(false)}>
                  Review again
                </button>
                <button
                  className="btn primary"
                  onClick={() => {
                    setConfirm(false);
                    setSubmitted(true);
                  }}
                >
                  Confirm submission
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  return (
    <div className={embedded ? "embedded-page" : "page"}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACADEMICS</span>
          <h1>{embedded ? "Course Activities" : "Activities & Assessments"}</h1>
          <p>Track requirements and submit your academic work on time.</p>
        </div>
        <button className="btn secondary" onClick={() => setQuiz(true)}>
          <Play size={17} /> Try sample quiz
        </button>
      </div>
      <div className="activity-summary">
        {[
          ["Pending", "4", "Due this week"],
          ["Submitted", "12", "Awaiting review"],
          ["Graded", "16", "View feedback"],
          ["Overdue", "0", "You’re on track"],
        ].map(([a, b, c]) => (
          <div className="card" key={a}>
            <span>{a}</span>
            <strong>{b}</strong>
            <small>{c}</small>
          </div>
        ))}
      </div>
      <div className="filter-bar">
        {["All", "Assignment", "Quiz", "Project", "Submitted", "Pending", "Overdue"].map((t) => (
          <button className={filter === t ? "active" : ""} onClick={() => setFilter(t)} key={t}>
            {t}
          </button>
        ))}
      </div>
      <div className="activity-list card">
        <div className="table-head">
          <span>ACTIVITY</span>
          <span>DUE DATE</span>
          <span>POINTS</span>
          <span>STATUS</span>
          <span />
        </div>
        {shown.map((a) => (
          <div className="activity-row" key={a.title}>
            <div>
              <div className={`activity-mini ${a.type.toLowerCase()}`}>
                <ClipboardCheck size={18} />
              </div>
              <span>
                <strong>{a.title}</strong>
                <small>
                  {a.course} · {a.type}
                </small>
              </span>
            </div>
            <span>
              <strong>{a.due.split(",")[0]}</strong>
              <small>{a.due.includes(",") ? a.due.split(",").slice(1).join(",") : ""}</small>
            </span>
            <strong>{a.points} pts</strong>
            <Badge tone={a.status.toLowerCase()}>{a.status}</Badge>
            <button
              className="btn tertiary small"
              onClick={() => {
                setSelected(a);
                onOpen?.();
              }}
            >
              View <ChevronRight size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarPage() {
  const [view, setView] = useState("Month");
  const [month, setMonth] = useState(4);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const events: Record<number, string[]> = {
    3: ["Web Dev class"],
    5: ["Research consult"],
    8: ["Data Science"],
    12: ["Database quiz"],
    15: ["Ethics reflection"],
    19: ["DSA laboratory"],
    22: ["Module 2 uploaded"],
    25: ["Data prep due"],
    26: ["Normalization quiz"],
    28: ["Binary Trees Lab"],
  };
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR SCHEDULE</span>
          <h1>Academic Calendar</h1>
          <p>All your classes, deadlines, and university events in one view.</p>
        </div>
        <button className="btn primary">
          <Plus size={17} /> Add study event
        </button>
      </div>
      <div className="calendar-toolbar card">
        <div>
          <button className="icon-btn" onClick={() => setMonth((month + 11) % 12)}>
            <ChevronLeft size={19} />
          </button>
          <h2>{months[month]} 2025</h2>
          <button className="icon-btn" onClick={() => setMonth((month + 1) % 12)}>
            <ChevronRight size={19} />
          </button>
          <button className="btn tertiary small" onClick={() => setMonth(4)}>
            Today
          </button>
        </div>
        <div className="view-pills">
          {["Month", "Week", "Agenda"].map((v) => (
            <button className={view === v ? "active" : ""} onClick={() => setView(v)} key={v}>
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="calendar-layout">
        <div className="calendar card">
          <div className="weekdays">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {Array.from({ length: 35 }, (_, i) => i - 2).map((day, i) => (
              <div
                className={`${day === 25 ? "today" : ""} ${day < 1 || day > 31 ? "muted" : ""}`}
                key={i}
              >
                <span>{day < 1 ? 30 + day : day > 31 ? day - 31 : day}</span>
                {events[day]?.map((e, n) => (
                  <button className={`calendar-event e${n % 3}`} key={e}>
                    {e}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        <aside className="card upcoming-panel">
          <div className="section-head">
            <div>
              <h2>Upcoming</h2>
              <p>Next 7 days</p>
            </div>
            <SlidersHorizontal size={18} />
          </div>
          <div className="upcoming-day">
            <span>TODAY · MAY 25</span>
            <article>
              <i className="red" />
              <div>
                <strong>Data Preparation Exercise</strong>
                <p>COMP 034 · Due 11:59 PM</p>
              </div>
            </article>
            <article>
              <i className="gold" />
              <div>
                <strong>Research consultation</strong>
                <p>COMP 015 · 3:00 PM</p>
              </div>
            </article>
          </div>
          <div className="upcoming-day">
            <span>TOMORROW · MAY 26</span>
            <article>
              <i className="blue" />
              <div>
                <strong>Normalization Quiz</strong>
                <p>COMP 018 · 3:00 PM</p>
              </div>
            </article>
          </div>
          <hr />
          <div className="calendar-legend">
            <span>
              <i className="red" />
              Deadlines
            </span>
            <span>
              <i className="blue" />
              Classes & quizzes
            </span>
            <span>
              <i className="gold" />
              Personal events
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function GradesPage({ compact = false }: { compact?: boolean }) {
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

function PlannerPage() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Review COMP 034 Module 2", course: "COMP 034", priority: "High", done: false },
    {
      id: 2,
      title: "Finish Database Administration activity",
      course: "COMP 018",
      priority: "High",
      done: false,
    },
    {
      id: 3,
      title: "Prepare for Research consultation",
      course: "COMP 015",
      priority: "Medium",
      done: false,
    },
    {
      id: 4,
      title: "Review for upcoming examination",
      course: "GEED 008",
      priority: "Low",
      done: true,
    },
  ]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const add = () => {
    if (draft.trim())
      setTasks([
        ...tasks,
        { id: Date.now(), title: draft, course: "Personal", priority: "Medium", done: false },
      ]);
    setDraft("");
    setAdding(false);
  };
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">PRODUCTIVITY</span>
          <h1>Study Planner</h1>
          <p>Build a focused plan and make steady progress every day.</p>
        </div>
        <button className="btn primary" onClick={() => setAdding(true)}>
          <Plus size={17} /> New study task
        </button>
      </div>
      <div className="planner-stats">
        <div className="card">
          <span>WEEKLY GOAL</span>
          <div className="ring mini">
            <strong>75%</strong>
          </div>
          <p>
            <strong>7.5</strong> of 10 hours
          </p>
        </div>
        <div className="card streak">
          <Sparkles size={24} />
          <div>
            <span>STUDY STREAK</span>
            <strong>6 days</strong>
            <p>Keep your momentum going.</p>
          </div>
        </div>
        <div className="card">
          <span>TASK COMPLETION</span>
          <strong className="big">12 / 16</strong>
          <Progress value={75} />
          <p>4 tasks left this week</p>
        </div>
      </div>
      <div className="planner-layout">
        <section className="card task-panel">
          <div className="section-head">
            <div>
              <h2>Today’s tasks</h2>
              <p>Monday, May 25 · {tasks.filter((t) => !t.done).length} remaining</p>
            </div>
            <button className="icon-btn">
              <SlidersHorizontal size={18} />
            </button>
          </div>
          {tasks.map((task) => (
            <div className={`task-row ${task.done ? "done" : ""}`} key={task.id}>
              <button
                className="task-check"
                onClick={() =>
                  setTasks(tasks.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)))
                }
              >
                {task.done && <Check size={15} />}
              </button>
              <div>
                <strong>{task.title}</strong>
                <span>{task.course} · Today</span>
              </div>
              <Badge tone={task.priority.toLowerCase()}>{task.priority}</Badge>
              <button
                className="icon-btn"
                onClick={() => setTasks(tasks.filter((t) => t.id !== task.id))}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button className="add-task-row" onClick={() => setAdding(true)}>
            <Plus size={17} /> Add another task
          </button>
        </section>
        <aside className="card weekly-plan">
          <div className="section-head">
            <div>
              <h2>Weekly overview</h2>
              <p>May 25–31</p>
            </div>
          </div>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
            <div className={`study-day ${i === 0 ? "active" : ""}`} key={d}>
              <span>
                {d}
                <small>{25 + i}</small>
              </span>
              <div>
                <i style={{ width: `${[75, 40, 85, 55, 65, 25, 10][i]}%` }} />
              </div>
              <strong>{[2.5, 1, 3, 1.5, 2, 0.5, 0][i]}h</strong>
            </div>
          ))}
        </aside>
      </div>
      {adding && (
        <div className="modal-layer">
          <form
            className="confirm-modal card"
            onSubmit={(e) => {
              e.preventDefault();
              add();
            }}
          >
            <div className="confirm-icon">
              <Plus size={24} />
            </div>
            <h2>Create a study task</h2>
            <label>
              What do you need to do?
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="e.g. Review Module 3 notes"
              />
            </label>
            <label>
              Subject
              <select>
                <option>Personal</option>
                {courses.map((c) => (
                  <option key={c.code}>{c.code}</option>
                ))}
              </select>
            </label>
            <div>
              <button type="button" className="btn secondary" onClick={() => setAdding(false)}>
                Cancel
              </button>
              <button className="btn primary">Add task</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function DiscussionsPage({ compact = false }: { compact?: boolean }) {
  const [posts, setPosts] = useState([
    {
      name: "Alyssa Mendoza",
      initials: "AM",
      role: "BSIT 3-3",
      time: "18 min ago",
      title: "Question about handling missing values",
      body: "For the activity, should we remove rows with missing values or apply imputation first?",
      replies: 4,
      reactions: 7,
      pinned: false,
    },
    {
      name: "Prof. Carlo Inovero",
      initials: "CI",
      role: "Instructor · COMP 034",
      time: "1 hr ago",
      title: "Module 2 clarification and examples",
      body: "I added a short walkthrough of data imputation under the Module 2 reference materials. Please review it before the activity.",
      replies: 8,
      reactions: 19,
      pinned: true,
    },
    {
      name: "Joshua Lim",
      initials: "JL",
      role: "BSIT 3-3",
      time: "Yesterday",
      title: "Study group for the normalization quiz",
      body: "Is anyone available for a quick review session tomorrow afternoon?",
      replies: 6,
      reactions: 5,
      pinned: false,
    },
  ]);
  const [compose, setCompose] = useState(false);
  const [draft, setDraft] = useState("");
  return (
    <div className={compact ? "embedded-page" : "page"}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">COMMUNITY</span>
          <h1>{compact ? "Course Discussions" : "Class Discussions"}</h1>
          <p>Ask questions, exchange ideas, and learn with your class.</p>
        </div>
        <button className="btn primary" onClick={() => setCompose(true)}>
          <Plus size={17} /> Start discussion
        </button>
      </div>
      <div className="discussion-layout">
        <main>
          <div className="toolbar card discussion-tools">
            <div className="search-field">
              <Search size={17} />
              <input placeholder="Search discussions..." />
            </div>
            <select>
              <option>All courses</option>
              <option>COMP 034</option>
            </select>
            <button className="icon-btn">
              <SlidersHorizontal size={18} />
            </button>
          </div>
          {posts.map((post, i) => (
            <article className="discussion-card card" key={i}>
              {post.pinned && (
                <div className="pinned-label">
                  <Bookmark size={14} /> PINNED BY INSTRUCTOR
                </div>
              )}
              <div className="discussion-author">
                <div className={`avatar small ${i === 1 ? "gold-avatar" : ""}`}>
                  {post.initials}
                </div>
                <div>
                  <strong>
                    {post.name}
                    {i === 1 && <Badge tone="gold">Instructor</Badge>}
                  </strong>
                  <span>
                    {post.role} · {post.time}
                  </span>
                </div>
                <button className="icon-btn">
                  <MoreHorizontal size={18} />
                </button>
              </div>
              <h2>{post.title}</h2>
              <p>{post.body}</p>
              <div className="discussion-footer">
                <button>
                  <MessageCircle size={17} /> {post.replies} replies
                </button>
                <button>
                  <Star size={17} /> {post.reactions}
                </button>
                <button>
                  <Paperclip size={17} /> Attachment
                </button>
                <button>
                  View thread <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </main>
        <aside className="card discussion-aside">
          <h3>Discussion spaces</h3>
          {courses.slice(0, 4).map((c, i) => (
            <button key={c.code}>
              <span className={`course-dot ${c.accent}`} />{" "}
              <span>
                <strong>{c.code}</strong>
                <small>{[12, 8, 6, 10][i]} conversations</small>
              </span>
              {i === 0 && <i>3</i>}
            </button>
          ))}
          <hr />
          <h3>Community guidelines</h3>
          <p>Be respectful, stay on topic, and support your ideas with academic sources.</p>
          <button className="text-btn">
            Read guidelines <ArrowRight size={14} />
          </button>
        </aside>
      </div>
      {compose && (
        <div className="modal-layer">
          <form
            className="compose-modal card"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft)
                setPosts([
                  {
                    name: "Izy Basco",
                    initials: "IB",
                    role: "BSIT 3-3",
                    time: "Just now",
                    title: draft,
                    body: "I’d appreciate your thoughts and suggestions on this topic.",
                    replies: 0,
                    reactions: 0,
                    pinned: false,
                  },
                  ...posts,
                ]);
              setCompose(false);
              setDraft("");
            }}
          >
            <div className="section-head">
              <div>
                <h2>Start a discussion</h2>
                <p>Share a question or topic with your class.</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => setCompose(false)}>
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
              Discussion title
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="What would you like to discuss?"
              />
            </label>
            <label>
              Message
              <textarea placeholder="Add context, details, or a specific question..." />
            </label>
            <div>
              <button type="button" className="btn secondary" onClick={() => setCompose(false)}>
                Cancel
              </button>
              <button className="btn primary">Publish discussion</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function NotesPage() {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: "Data preprocessing checklist",
      course: "COMP 034",
      copy: "Check null values, duplicates, inconsistent labels, and outliers before analysis.",
      date: "Edited 20 min ago",
    },
    {
      id: 2,
      title: "Database recovery concepts",
      course: "COMP 018",
      copy: "Recovery point objective defines acceptable data loss measured in time.",
      date: "Edited yesterday",
    },
    {
      id: 3,
      title: "Research consultation questions",
      course: "COMP 015",
      copy: "Clarify scope, target participants, and instrument validation approach.",
      date: "Edited May 22",
    },
  ]);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [copy, setCopy] = useState("");
  const add = () => {
    if (title)
      setNotes([
        { id: Date.now(), title, copy, course: "Personal", date: "Created just now" },
        ...notes,
      ]);
    setEditing(false);
    setTitle("");
    setCopy("");
  };
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">PERSONAL WORKSPACE</span>
          <h1>My Notes & Bookmarks</h1>
          <p>Capture ideas and keep important learning resources close.</p>
        </div>
        <button className="btn primary" onClick={() => setEditing(true)}>
          <Plus size={17} /> New note
        </button>
      </div>
      <div className="notes-toolbar">
        <div className="search-field">
          <Search size={18} />
          <input placeholder="Search your notes..." />
        </div>
        <div className="tabs compact-tabs">
          <button className="active">Recent Notes</button>
          <button>
            Bookmarks <span>5</span>
          </button>
        </div>
      </div>
      <div className="notes-layout">
        <aside className="card subjects-panel">
          <h3>Subjects</h3>
          <button className="active">
            <span>All notes</span>
            <i>{notes.length}</i>
          </button>
          {courses.slice(0, 4).map((c) => (
            <button key={c.code}>
              <span>{c.code}</span>
              <i>{Math.ceil(Math.random() * 4)}</i>
            </button>
          ))}
        </aside>
        <main className="notes-grid">
          {notes.map((note, i) => (
            <article className={`note-card card note-${i % 3}`} key={note.id}>
              <div className="note-top">
                <Badge tone="neutral">{note.course}</Badge>
                <div>
                  <button className="icon-btn">
                    <Pencil size={15} />
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => setNotes(notes.filter((n) => n.id !== note.id))}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <h2>{note.title}</h2>
              <p>{note.copy}</p>
              <span>{note.date}</span>
            </article>
          ))}
        </main>
      </div>
      {editing && (
        <div className="modal-layer">
          <form
            className="note-editor card"
            onSubmit={(e) => {
              e.preventDefault();
              add();
            }}
          >
            <div className="section-head">
              <div>
                <span className="eyebrow">NEW NOTE</span>
                <h2>Capture an idea</h2>
              </div>
              <button type="button" className="icon-btn" onClick={() => setEditing(false)}>
                <X size={18} />
              </button>
            </div>
            <input
              className="note-title-input"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled note"
            />
            <select>
              <option>Personal</option>
              {courses.map((c) => (
                <option key={c.code}>{c.code}</option>
              ))}
            </select>
            <textarea
              value={copy}
              onChange={(e) => setCopy(e.target.value)}
              placeholder="Start writing your note..."
            />
            <div>
              <span>Changes are saved when you create the note.</span>
              <button className="btn primary">Create note</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function AnnouncementsPage() {
  const [filter, setFilter] = useState("All");
  const announcements = [
    {
      category: "Course",
      title: "Updated consultation hours for this week",
      author: "Prof. Carlo Inovero · COMP 034",
      time: "20 minutes ago",
      copy: "Consultation will be held online this Wednesday from 2:00–4:00 PM. The meeting link is now available in the course overview.",
      unread: true,
    },
    {
      category: "University",
      title: "Extended library hours during midterms",
      author: "PUP University Library",
      time: "Yesterday",
      copy: "The Main Library will remain open until 9:00 PM from May 25 to June 5 to support students preparing for examinations.",
      unread: true,
    },
    {
      category: "Course",
      title: "Midterm examination coverage",
      author: "Prof. Mia Santos · COMP 018",
      time: "May 23",
      copy: "Please review Modules 1–4, including the database security case study and all laboratory exercises.",
      unread: false,
    },
    {
      category: "Department",
      title: "College student research forum",
      author: "College of Computer and Information Sciences",
      time: "May 21",
      copy: "Registration is open for students who wish to present ongoing research at the annual college forum.",
      unread: false,
    },
  ];
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">STAY INFORMED</span>
          <h1>Announcements</h1>
          <p>Important university, department, and course updates.</p>
        </div>
        <button className="btn tertiary">
          <Check size={16} /> Mark all as read
        </button>
      </div>
      <div className="filter-bar announcement-filters">
        {["All", "University", "Department", "Course", "Important"].map((f) => (
          <button className={filter === f ? "active" : ""} onClick={() => setFilter(f)} key={f}>
            {f}
          </button>
        ))}
      </div>
      <div className="announcement-layout">
        <main className="announcement-list">
          {announcements
            .filter((a) => filter === "All" || a.category === filter)
            .map((a, i) => (
              <article
                className={`card full-announcement ${a.unread ? "unread" : ""}`}
                key={a.title}
              >
                <div className={`announcement-icon a${i % 3}`}>
                  <Bell size={18} />
                </div>
                <div>
                  <div className="announcement-meta">
                    <Badge tone={a.category.toLowerCase()}>{a.category}</Badge>
                    <span>{a.time}</span>
                    {a.unread && <i />}
                  </div>
                  <h2>{a.title}</h2>
                  <span>{a.author}</span>
                  <p>{a.copy}</p>
                  <button className="text-btn">
                    View details <ArrowRight size={14} />
                  </button>
                </div>
                <button className="icon-btn">
                  <MoreHorizontal size={18} />
                </button>
              </article>
            ))}
        </main>
        <aside className="card announcement-aside">
          <h3>Announcement summary</h3>
          <div>
            <span>
              <strong>2</strong>
              <small>Unread</small>
            </span>
            <span>
              <strong>8</strong>
              <small>This week</small>
            </span>
          </div>
          <hr />
          <h3>Notification preferences</h3>
          <p>Choose which updates you receive by email or in the portal.</p>
          <button className="btn tertiary full">
            <Settings size={16} /> Manage preferences
          </button>
        </aside>
      </div>
    </div>
  );
}

function InstructorDashboard() {
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

function AdminDashboard() {
  const [section, setSection] = useState("Overview");
  return (
    <div className="page">
      <section className="role-banner admin-banner">
        <div>
          <span className="eyebrow light">ADMINISTRATOR WORKSPACE</span>
          <h1>Platform administration</h1>
          <p>Monitor institutional activity and manage the academic learning environment.</p>
        </div>
        <Badge tone="submitted">All systems operational</Badge>
      </section>
      <div className="admin-tabs">
        {["Overview", "User Management", "Course Management", "System Activity"].map((s) => (
          <button className={section === s ? "active" : ""} onClick={() => setSection(s)} key={s}>
            {s}
          </button>
        ))}
      </div>
      <div className="stats-grid">
        <StatCard
          icon={GraduationCap}
          label="Total students"
          value="24,820"
          foot="+312 this term"
          tone="maroon"
        />
        <StatCard icon={Users} label="Instructors" value="1,284" foot="96% active" tone="blue" />
        <StatCard
          icon={BookOpen}
          label="Active courses"
          value="642"
          foot="Across 18 colleges"
          tone="amber"
        />
        <StatCard
          icon={Grid2X2}
          label="Class sections"
          value="1,946"
          foot="Current semester"
          tone="green"
        />
      </div>
      {section === "User Management" ? (
        <section className="card admin-table">
          <div className="section-head">
            <div>
              <h2>User management</h2>
              <p>Search and manage platform accounts.</p>
            </div>
            <button className="btn primary small">
              <Plus size={16} /> Add account
            </button>
          </div>
          <div className="toolbar">
            <div className="search-field">
              <Search size={17} />
              <input placeholder="Search name, number, or email..." />
            </div>
            <select>
              <option>All roles</option>
              <option>Students</option>
              <option>Instructors</option>
            </select>
          </div>
          {[
            ["Izy Basco", "2022-00123", "Student", "Active"],
            ["Carlo Inovero", "FAC-00842", "Instructor", "Active"],
            ["Mia Santos", "FAC-00419", "Instructor", "Active"],
            ["Joshua Lim", "2022-00318", "Student", "Inactive"],
          ].map((u) => (
            <div className="user-row" key={u[1]}>
              <div className="avatar small">
                {u[0]
                  .split(" ")
                  .map((x) => x[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <span>
                <strong>{u[0]}</strong>
                <small>{u[1]}</small>
              </span>
              <span>{u[2]}</span>
              <Badge tone={u[3] === "Active" ? "submitted" : "neutral"}>{u[3]}</Badge>
              <button className="icon-btn">
                <MoreHorizontal size={18} />
              </button>
            </div>
          ))}
        </section>
      ) : (
        <div className="admin-grid">
          <section className="card analytics-card">
            <div className="section-head">
              <div>
                <h2>Platform activity</h2>
                <p>Weekly active users</p>
              </div>
              <select>
                <option>Last 7 days</option>
              </select>
            </div>
            <div className="big-number">
              18,492 <span>+8.4%</span>
            </div>
            <div className="bar-chart">
              {[42, 56, 49, 72, 66, 84, 77, 92, 86, 100, 90, 95].map((h, i) => (
                <i key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="chart-labels">
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>
          </section>
          <section className="card system-card">
            <div className="section-head">
              <div>
                <h2>System overview</h2>
                <p>Current service status</p>
              </div>
            </div>
            {[
              ["Learning portal", "99.99%"],
              ["File storage", "99.98%"],
              ["Authentication", "100%"],
              ["Notifications", "99.95%"],
            ].map((x) => (
              <div key={x[0]}>
                <span>
                  <i />
                  {x[0]}
                </span>
                <strong>{x[1]}</strong>
              </div>
            ))}
            <hr />
            <div className="storage">
              <span>
                Storage utilization<strong>3.8 TB of 6 TB</strong>
              </span>
              <Progress value={63} />
            </div>
          </section>
          <section className="card recent-activity">
            <div className="section-head">
              <div>
                <h2>Recent administrative activity</h2>
                <p>Latest platform changes</p>
              </div>
              <button className="text-btn">View audit log</button>
            </div>
            {[
              ["New course section created", "BSIT 3-3 · COMP 034", "4 min ago"],
              ["Instructor account activated", "Prof. Elena Bautista", "22 min ago"],
              [
                "Institutional announcement published",
                "Office of the University Registrar",
                "1 hr ago",
              ],
              ["Course archive completed", "A.Y. 2023–2024 · 486 courses", "3 hr ago"],
            ].map((x, i) => (
              <div key={x[0]}>
                <div className={`activity-admin-icon i${i}`}>
                  <Activity size={16} />
                </div>
                <span>
                  <strong>{x[0]}</strong>
                  <small>{x[1]}</small>
                </span>
                <time>{x[2]}</time>
              </div>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}

const titles: Record<Page, string> = {
  dashboard: "Dashboard",
  courses: "My Courses",
  course: "Course Details",
  activities: "Activities & Assessments",
  calendar: "Academic Calendar",
  grades: "My Grades",
  planner: "Study Planner",
  discussions: "Class Discussions",
  notes: "My Notes",
  announcements: "Announcements",
  settings: "Settings",
  help: "Help & Support",
  instructor: "Instructor Dashboard",
  admin: "Administrator Dashboard",
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState<Page>("dashboard");
  const [courseTab, setCourseTab] = useState("overview");
  const [sidebar, setSidebar] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [role, setRole] = useState("Student");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("pup-theme") === "dark" ? "dark" : "light";
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("pup-theme", theme);
  }, [theme]);
  const navigate = (next: Page, tab?: string) => {
    setPage(next);
    if (tab) setCourseTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const content = useMemo(() => {
    if (page === "dashboard")
      return <Dashboard onNavigate={navigate} openCourse={() => navigate("course", "overview")} />;
    if (page === "courses")
      return <CoursesPage openCourse={() => navigate("course", "overview")} />;
    if (page === "course")
      return (
        <CoursePage
          initialTab={courseTab}
          onBack={() => navigate("courses")}
          onActivity={() => navigate("activities")}
        />
      );
    if (page === "activities") return <ActivitiesPage />;
    if (page === "calendar") return <CalendarPage />;
    if (page === "grades") return <GradesPage />;
    if (page === "planner") return <PlannerPage />;
    if (page === "discussions") return <DiscussionsPage />;
    if (page === "notes") return <NotesPage />;
    if (page === "announcements") return <AnnouncementsPage />;
    if (page === "instructor") return <InstructorDashboard />;
    if (page === "admin") return <AdminDashboard />;
    if (page === "settings")
      return (
        <div className="page">
          <EmptyPage
            title="Account settings"
            copy="Manage your profile, privacy, accessibility, and notification preferences."
          />
        </div>
      );
    return (
      <div className="page">
        <EmptyPage
          title="Help & Support"
          copy="Browse student guides or contact the university learning support team."
        />
      </div>
    );
  }, [page, courseTab]);
  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;
  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        onNavigate={navigate}
        open={sidebar}
        onClose={() => setSidebar(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className={`app-main ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <Header
          title={titles[page]}
          onMenu={() => setSidebar(true)}
          onNavigate={navigate}
          role={role}
          setRole={setRole}
          theme={theme}
          onThemeToggle={() => setTheme(theme === "light" ? "dark" : "light")}
        />
        {content}
        <footer className="app-footer">
          <span>PUP Learning Portal · Academic Year 2024–2025</span>
          <span>Privacy · Accessibility · Support</span>
        </footer>
      </div>
    </div>
  );
}
