import { useEffect, useMemo, useState } from "react";
import { type Page } from "./app/navigation";
import { titles } from "./app/navigation";
import { Sidebar } from "./app/Sidebar";
import { Header } from "./app/Header";
import { EmptyPage } from "./components/ui/EmptyPage";
import { Login } from "./features/auth/Login";
import { Dashboard } from "./features/dashboard/Dashboard";
import { CoursesPage } from "./features/courses/CoursesPage";
import { CoursePage } from "./features/courses/CoursePage";
import { ActivitiesPage } from "./features/activities/ActivitiesPage";
import { CalendarPage } from "./features/calendar/CalendarPage";
import { GradesPage } from "./features/grades/GradesPage";
import { PlannerPage } from "./features/planner/PlannerPage";
import { DiscussionsPage } from "./features/discussions/DiscussionsPage";
import { NotesPage } from "./features/notes/NotesPage";
import { AnnouncementsPage } from "./features/announcements/AnnouncementsPage";
import { InstructorDashboard } from "./features/instructor/InstructorDashboard";
import { AdminDashboard } from "./features/admin/AdminDashboard";

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
