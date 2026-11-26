import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  LayoutDashboard,
  Library,
  MessageCircle,
  NotebookPen,
} from "lucide-react";
import type { Role } from "./api";

export type Page =
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
export const navItems = [
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
export const titles: Record<Page, string> = {
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

export const workspace: Record<Role, Page> = {
  Administrator: "admin",
  Instructor: "instructor",
  Student: "dashboard",
};

export function pageForRole(role: Role, page: Page) {
  if (page === "settings" || page === "help" || page === "announcements") return page;
  if (role === "Student" && page !== "admin" && page !== "instructor") return page;
  return workspace[role];
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
