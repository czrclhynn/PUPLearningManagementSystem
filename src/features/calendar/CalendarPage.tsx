import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, SlidersHorizontal } from "lucide-react";

export function CalendarPage() {
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
