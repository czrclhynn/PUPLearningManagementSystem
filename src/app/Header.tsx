import { useState } from "react";
import {
  AlarmClock,
  ArrowRight,
  Bell,
  BookMarked,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";
import { type Page } from "./navigation";

export function Header({
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
