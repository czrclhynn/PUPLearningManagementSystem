import { useState } from "react";
import { Check, Plus, SlidersHorizontal, Sparkles, Trash2 } from "lucide-react";
import { courses } from "../courses/mock";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";

export function PlannerPage() {
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
