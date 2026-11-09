import { useState } from "react";
import { ArrowRight, Bell, Check, MoreHorizontal, Settings } from "lucide-react";
import { Badge } from "../../components/ui/Badge";

export function AnnouncementsPage() {
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
