import { useState } from "react";
import {
  Activity,
  BookOpen,
  GraduationCap,
  Grid2X2,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";
import { StatCard } from "../../components/ui/StatCard";

export function AdminDashboard() {
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
