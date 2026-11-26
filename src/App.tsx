import { useCallback, useEffect, useState } from "react";
import { type Page } from "./app/navigation";
import { pageForRole, titles, workspace } from "./app/navigation";
import { api, ApiError, errorMessage, type SessionUser } from "./app/api";
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
import { activityStatus } from "./features/learning/academic";
import { FeedStatus } from "./features/learning/FeedStatus";
import type { StudentLearning } from "./features/learning/types";
import { useLearning } from "./features/learning/useLearning";

const base = new URL(import.meta.env.BASE_URL, window.location.origin).pathname;
function pageFromUrl(): Page {
  const segment = window.location.pathname.slice(base.length).replace(/\/$/, "");
  return Object.prototype.hasOwnProperty.call(titles, segment) ? (segment as Page) : "dashboard";
}
const courseParam = (key: string) => new URLSearchParams(window.location.search).get(key) ?? "";
const courseTabs = ["overview", "materials", "activities", "grades"];

export default function App() {
  const [user, setUser] = useState<SessionUser | null>();
  const [sessionError, setSessionError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [requestedPage, setPage] = useState(pageFromUrl);
  const page = user ? pageForRole(user.role, requestedPage) : "dashboard";
  const [courseTab, setCourseTab] = useState(() => courseParam("tab") || "overview");
  const [courseId, setCourseId] = useState(() => courseParam("id"));
  const [sidebar, setSidebar] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("pup-theme") === "dark" ? "dark" : "light";
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("pup-theme", theme);
  }, [theme]);
  useEffect(() => {
    const controller = new AbortController();
    const onBack = () => {
      setPage(pageFromUrl());
      setCourseId(courseParam("id"));
      setCourseTab(courseParam("tab") || "overview");
    };
    window.addEventListener("popstate", onBack);
    api<SessionUser>("/auth/session", { signal: controller.signal })
      .then(setUser)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (!(error instanceof ApiError && error.status === 401))
          setSessionError(errorMessage(error));
        setUser(null);
      });
    return () => {
      controller.abort();
      window.removeEventListener("popstate", onBack);
    };
  }, []);
  useEffect(() => {
    if (user && window.location.pathname !== `${base}${page}`) {
      window.history.replaceState(null, "", `${base}${page}`);
    }
  }, [user, page, requestedPage]);

  const navigate = (next: Page, tab = "overview", id = "") => {
    if (!user || pageForRole(user.role, next) !== next) return;
    const search = next === "course" ? `?${new URLSearchParams({ id, tab })}` : "";
    const nextUrl = `${base}${next}${search}`;
    if (window.location.pathname + window.location.search !== nextUrl)
      window.history.pushState(null, "", nextUrl);
    setPage(next);
    setCourseTab(tab);
    setCourseId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const endSession = useCallback(() => {
    setUser(null);
    setSessionError("");
    setSidebar(false);
    setPage("dashboard");
    setCourseId("");
    setCourseTab("overview");
    window.history.replaceState(null, "", base);
  }, []);
  const studentPage =
    user?.role === "Student" &&
    ["dashboard", "courses", "course", "activities", "grades"].includes(page);
  const learning = useLearning<StudentLearning>(
    studentPage ? "/learning/" : null,
    endSession,
    user?.id,
  );
  const openCourse = (id: string, tab = "overview") => navigate("course", tab, id);
  async function logout() {
    setSessionError("");
    setSigningOut(true);
    try {
      await api("/auth/logout", { method: "POST" });
      endSession();
    } catch (error) {
      setSessionError(errorMessage(error));
    } finally {
      setSigningOut(false);
    }
  }
  if (user === undefined)
    return (
      <main className="page" role="status">
        Checking your session…
      </main>
    );
  if (!user)
    return (
      <Login
        sessionError={sessionError}
        onLogin={(account) => {
          setSessionError("");
          setPage(workspace[account.role]);
          setUser(account);
        }}
      />
    );

  const content = (() => {
    if (studentPage && !learning.data)
      return (
        <main className="page">
          <FeedStatus error={learning.error} refresh={learning.refresh} />
        </main>
      );
    const data = learning.data!;
    if (page === "dashboard")
      return (
        <Dashboard name={user.name} onNavigate={navigate} learning={data} openCourse={openCourse} />
      );
    if (page === "courses") return <CoursesPage learning={data} openCourse={openCourse} />;
    if (page === "course") {
      const course = courseId
        ? data.courses.find((entry) => entry.id === courseId)
        : data.courses[0];
      if (!course)
        return (
          <div className="page">
            <EmptyPage
              title="Course unavailable"
              copy="Choose a course from your active enrollments."
            />
            <button className="btn secondary" onClick={() => navigate("courses")}>
              My Courses
            </button>
          </div>
        );
      const tab = courseTabs.includes(courseTab) ? courseTab : "overview";
      return (
        <CoursePage
          key={`${course.id}:${tab}`}
          initialTab={tab}
          course={course}
          activities={data.activities.filter((activity) => activity.course_id === course.id)}
          onBack={() => navigate("courses")}
          refresh={learning.refresh}
          onSessionExpired={endSession}
        />
      );
    }
    if (page === "activities")
      return (
        <ActivitiesPage
          courses={data.courses}
          activities={data.activities}
          refresh={learning.refresh}
          onSessionExpired={endSession}
        />
      );
    if (page === "calendar") return <CalendarPage />;
    if (page === "grades")
      return <GradesPage courses={data.courses} activities={data.activities} />;
    if (page === "planner") return <PlannerPage />;
    if (page === "discussions") return <DiscussionsPage />;
    if (page === "notes") return <NotesPage />;
    if (page === "announcements") return <AnnouncementsPage />;
    if (page === "instructor")
      return <InstructorDashboard name={user.name} onSessionExpired={endSession} />;
    if (page === "admin") return <AdminDashboard onSessionExpired={endSession} />;
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
  })();
  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        pendingActivities={
          learning.data?.activities.filter((activity) => activityStatus(activity) === "Pending")
            .length
        }
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
          user={user}
          onLogout={logout}
          signingOut={signingOut}
          theme={theme}
          onThemeToggle={() => setTheme(theme === "light" ? "dark" : "light")}
        />
        {sessionError && (
          <p className="page" role="alert">
            {sessionError}
          </p>
        )}
        {["calendar", "planner", "discussions", "notes", "announcements"].includes(page) && (
          <p className="page admin-message">Preview · This section includes sample content.</p>
        )}
        {content}
        <footer className="app-footer">
          <span>PUP Learning Portal · Academic Year 2024–2025</span>
          <span>Privacy · Accessibility · Support</span>
        </footer>
      </div>
    </div>
  );
}
