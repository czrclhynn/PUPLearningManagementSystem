import { useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { courses } from "../courses/mock";
import { Badge } from "../../components/ui/Badge";

export function NotesPage() {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: "Data preprocessing checklist",
      course: "COMP 034",
      copy: "Check null values, duplicates, inconsistent labels, and outliers before analysis.",
      date: "Edited 20 min ago",
    },
    {
      id: 2,
      title: "Database recovery concepts",
      course: "COMP 018",
      copy: "Recovery point objective defines acceptable data loss measured in time.",
      date: "Edited yesterday",
    },
    {
      id: 3,
      title: "Research consultation questions",
      course: "COMP 015",
      copy: "Clarify scope, target participants, and instrument validation approach.",
      date: "Edited May 22",
    },
  ]);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [copy, setCopy] = useState("");
  const add = () => {
    if (title)
      setNotes([
        { id: Date.now(), title, copy, course: "Personal", date: "Created just now" },
        ...notes,
      ]);
    setEditing(false);
    setTitle("");
    setCopy("");
  };
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">PERSONAL WORKSPACE</span>
          <h1>My Notes & Bookmarks</h1>
          <p>Capture ideas and keep important learning resources close.</p>
        </div>
        <button className="btn primary" onClick={() => setEditing(true)}>
          <Plus size={17} /> New note
        </button>
      </div>
      <div className="notes-toolbar">
        <div className="search-field">
          <Search size={18} />
          <input placeholder="Search your notes..." />
        </div>
        <div className="tabs compact-tabs">
          <button className="active">Recent Notes</button>
          <button>
            Bookmarks <span>5</span>
          </button>
        </div>
      </div>
      <div className="notes-layout">
        <aside className="card subjects-panel">
          <h3>Subjects</h3>
          <button className="active">
            <span>All notes</span>
            <i>{notes.length}</i>
          </button>
          {courses.slice(0, 4).map((c) => (
            <button key={c.code}>
              <span>{c.code}</span>
              <i>{notes.filter((note) => note.course === c.code).length}</i>
            </button>
          ))}
        </aside>
        <main className="notes-grid">
          {notes.map((note, i) => (
            <article className={`note-card card note-${i % 3}`} key={note.id}>
              <div className="note-top">
                <Badge tone="neutral">{note.course}</Badge>
                <div>
                  <button className="icon-btn">
                    <Pencil size={15} />
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => setNotes(notes.filter((n) => n.id !== note.id))}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <h2>{note.title}</h2>
              <p>{note.copy}</p>
              <span>{note.date}</span>
            </article>
          ))}
        </main>
      </div>
      {editing && (
        <div className="modal-layer">
          <form
            className="note-editor card"
            onSubmit={(e) => {
              e.preventDefault();
              add();
            }}
          >
            <div className="section-head">
              <div>
                <span className="eyebrow">NEW NOTE</span>
                <h2>Capture an idea</h2>
              </div>
              <button type="button" className="icon-btn" onClick={() => setEditing(false)}>
                <X size={18} />
              </button>
            </div>
            <input
              className="note-title-input"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled note"
            />
            <select>
              <option>Personal</option>
              {courses.map((c) => (
                <option key={c.code}>{c.code}</option>
              ))}
            </select>
            <textarea
              value={copy}
              onChange={(e) => setCopy(e.target.value)}
              placeholder="Start writing your note..."
            />
            <div>
              <span>Changes are saved when you create the note.</span>
              <button className="btn primary">Create note</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
