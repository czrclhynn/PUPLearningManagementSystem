import {
  CircleHelp,
  LayoutDashboard,
  MoreHorizontal,
  PanelLeftClose,
  Settings,
  X,
} from "lucide-react";
import { type Page } from "./navigation";
import { initials, navItems, workspace } from "./navigation";
import type { SessionUser } from "./api";
import { Logo } from "../components/ui/Logo";

export function Sidebar({
  user,
  pendingActivities,
  page,
  onNavigate,
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}: {
  user: SessionUser;
  pendingActivities?: number;
  page: Page;
  onNavigate: (page: Page, tab?: string) => void;
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const items =
    user.role === "Student"
      ? navItems
      : [{ id: workspace[user.role], label: "Dashboard", icon: LayoutDashboard }];
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
          <span className="nav-label">{user.role.toUpperCase()} WORKSPACE</span>
          {items.map((item) => {
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
                {item.id === "activities" && !!pendingActivities && <em>{pendingActivities}</em>}
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
          <div className="avatar">{initials(user.name)}</div>
          <div>
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </div>
          <MoreHorizontal size={18} />
        </div>
      </aside>
    </>
  );
}
