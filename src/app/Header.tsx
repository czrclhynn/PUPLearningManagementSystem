import { useState } from "react";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { initials, type Page } from "./navigation";
import type { SessionUser } from "./api";

export function Header({
  title,
  onMenu,
  onNavigate,
  user,
  onLogout,
  signingOut,
  theme,
  onThemeToggle,
}: {
  title: string;
  onMenu: () => void;
  onNavigate: (p: Page) => void;
  user: SessionUser;
  onLogout: () => void;
  signingOut: boolean;
  theme: "light" | "dark";
  onThemeToggle: () => void;
}) {
  const [notifications, setNotifications] = useState(false);
  const [profile, setProfile] = useState(false);
  return (
    <header className="topbar">
      <div className="topbar-title">
        <button className="menu-button icon-btn" onClick={onMenu} aria-label="Open navigation">
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
            aria-label="Notifications"
            onClick={() => {
              setNotifications(!notifications);
              setProfile(false);
            }}
          >
            <Bell size={20} />
          </button>
          {notifications && (
            <div className="popover notification-popover">
              <div className="popover-head">
                <div>
                  <strong>Notifications</strong>
                  <span>No portal notifications</span>
                </div>
              </div>
              <button
                className="view-all"
                onClick={() => {
                  onNavigate("announcements");
                  setNotifications(false);
                }}
              >
                View announcements <ArrowRight size={15} />
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
            <div className="avatar small">{initials(user.name)}</div>
            <span>
              <strong>{user.name}</strong>
              <small>{user.role} account</small>
            </span>
            <ChevronDown size={15} />
          </button>
          {profile && (
            <div className="popover profile-popover">
              <span className="menu-label">{user.role.toUpperCase()} ACCOUNT</span>
              <button
                type="button"
                onClick={() => {
                  onNavigate("settings");
                  setProfile(false);
                }}
              >
                <User size={17} /> My profile
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigate("settings");
                  setProfile(false);
                }}
              >
                <Settings size={17} /> Account settings
              </button>
              <button className="danger" onClick={onLogout} disabled={signingOut}>
                <LogOut size={17} /> {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
