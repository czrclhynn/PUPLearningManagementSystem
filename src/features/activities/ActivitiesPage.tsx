import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Download,
  File,
  FileSpreadsheet,
  FileText,
  Play,
  Send,
  ShieldCheck,
  Star,
  Upload,
} from "lucide-react";
import { activities } from "./mock";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";

export function ActivitiesPage({
  embedded = false,
  onOpen,
}: {
  embedded?: boolean;
  onOpen?: () => void;
}) {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<(typeof activities)[0] | null>(null);
  const [file, setFile] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const [question, setQuestion] = useState(0);
  const [answer, setAnswer] = useState<number[]>([]);
  const shown = activities.filter(
    (a) => filter === "All" || a.type === filter || a.status === filter,
  );
  if (quiz)
    return (
      <div className={embedded ? "" : "page"}>
        <div className="quiz-shell card">
          <div className="quiz-head">
            <div>
              <span className="eyebrow">COMP 018 · ASSESSMENT</span>
              <h1>Database Normalization Quiz</h1>
              <p>20 questions · 30 minute time limit</p>
            </div>
            <div className="quiz-time">
              <Clock3 size={18} />
              <span>
                Time remaining<strong>24:18</strong>
              </span>
            </div>
          </div>
          <Progress value={((question + 1) / 4) * 100} />
          <div className="quiz-body">
            <aside>
              <span>QUESTIONS</span>
              <div>
                {[0, 1, 2, 3].map((n) => (
                  <button
                    className={`${question === n ? "active" : ""} ${answer[n] !== undefined ? "answered" : ""}`}
                    onClick={() => setQuestion(n)}
                    key={n}
                  >
                    {n + 1}
                  </button>
                ))}
              </div>
              <p>
                <i /> Answered <i /> Current
              </p>
            </aside>
            <main>
              <span>QUESTION {question + 1} OF 4</span>
              <h2>
                {
                  [
                    "Which normal form removes partial dependencies?",
                    "What uniquely identifies each row in a relation?",
                    "A transitive dependency is removed in which normal form?",
                    "Which operation combines rows from related tables?",
                  ][question]
                }
              </h2>
              {[
                "First normal form|Second normal form|Third normal form|Boyce-Codd normal form",
                "Foreign key|Primary key|Composite view|Index",
                "1NF|2NF|3NF|4NF",
                "Select|Join|Update|Group",
              ].map(
                (set, i) =>
                  i === question &&
                  set.split("|").map((option, n) => (
                    <button
                      className={`answer-option ${answer[question] === n ? "selected" : ""}`}
                      onClick={() => {
                        const next = [...answer];
                        next[question] = n;
                        setAnswer(next);
                      }}
                      key={option}
                    >
                      <span>{String.fromCharCode(65 + n)}</span>
                      {option}
                      <i>{answer[question] === n && <Check size={15} />}</i>
                    </button>
                  )),
              )}
              <div className="quiz-actions">
                <button
                  className="btn secondary"
                  onClick={() => setQuestion(Math.max(0, question - 1))}
                  disabled={question === 0}
                >
                  <ChevronLeft size={17} /> Previous
                </button>
                {question < 3 ? (
                  <button className="btn primary" onClick={() => setQuestion(question + 1)}>
                    Next question <ChevronRight size={17} />
                  </button>
                ) : (
                  <button
                    className="btn primary"
                    onClick={() => {
                      setQuiz(false);
                      setSubmitted(true);
                    }}
                  >
                    Submit quiz
                  </button>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  if (selected)
    return (
      <div className={embedded ? "" : "page"}>
        <button className="back-link" onClick={() => setSelected(null)}>
          <ArrowLeft size={16} /> Back to activities
        </button>
        <div className="activity-detail-grid">
          <main className="card activity-detail">
            <div className="activity-title-row">
              <div className="activity-type-icon">
                <ClipboardCheck size={24} />
              </div>
              <div>
                <span className="eyebrow">
                  {selected.course} · {selected.type}
                </span>
                <h1>{selected.title}</h1>
                <p>Posted by Prof. Carlo Inovero · May 20</p>
              </div>
            </div>
            <div className="activity-facts">
              <span>
                <CalendarDays size={18} />
                <small>Due date</small>
                <strong>{selected.due}</strong>
              </span>
              <span>
                <Star size={18} />
                <small>Maximum points</small>
                <strong>{selected.points} points</strong>
              </span>
              <span>
                <FileText size={18} />
                <small>Submission type</small>
                <strong>File upload</strong>
              </span>
            </div>
            <section>
              <h2>Instructions</h2>
              <p>
                Use the provided customer dataset to demonstrate the data preparation techniques
                discussed in Module 2. Document missing values, duplicate records, and
                transformations in a concise report.
              </p>
              <ol>
                <li>Download and inspect the attached dataset.</li>
                <li>Clean the data using the techniques from the lecture.</li>
                <li>Submit your notebook and a one-page summary as a single ZIP file.</li>
              </ol>
            </section>
            <section>
              <h2>Reference material</h2>
              <div className="attachment">
                <FileSpreadsheet size={20} />
                <span>
                  <strong>customer-dataset.xlsx</strong>
                  <small>780 KB · Excel spreadsheet</small>
                </span>
                <button className="icon-btn">
                  <Download size={18} />
                </button>
              </div>
            </section>
          </main>
          <aside className="card submission-card">
            <div className="section-head">
              <div>
                <h2>Your submission</h2>
                <p>{submitted ? "Submitted successfully" : "Not yet submitted"}</p>
              </div>
              {submitted ? (
                <Badge tone="submitted">Submitted</Badge>
              ) : (
                <Badge tone="pending">Pending</Badge>
              )}
            </div>
            {submitted ? (
              <div className="submission-success">
                <div>
                  <CheckCircle2 size={28} />
                </div>
                <h3>Work submitted</h3>
                <p>May 25, 3:42 PM</p>
                <div className="attachment">
                  <File size={19} />
                  <span>
                    <strong>{file || "izy-delacruz-data-prep.zip"}</strong>
                    <small>4.2 MB</small>
                  </span>
                </div>
                <button className="btn secondary full">View submission</button>
              </div>
            ) : (
              <>
                <label className="upload-zone">
                  <Upload size={26} />
                  <strong>{file || "Upload your work"}</strong>
                  <span>
                    {file ? "File ready for submission" : "Drag and drop or browse your device"}
                  </span>
                  <small>ZIP, PDF, DOCX · Maximum 50 MB</small>
                  <input type="file" onChange={(e) => setFile(e.target.files?.[0]?.name || "")} />
                </label>
                <label className="response-label">
                  Submission note{" "}
                  <textarea placeholder="Add an optional note for your instructor..." />
                </label>
                <button
                  className="btn primary full"
                  disabled={!file}
                  onClick={() => setConfirm(true)}
                >
                  Submit activity <Send size={16} />
                </button>
                <p className="submission-note">
                  <ShieldCheck size={14} /> You can replace your submission until the deadline.
                </p>
              </>
            )}
          </aside>
        </div>
        {confirm && (
          <div className="modal-layer">
            <div className="confirm-modal card">
              <div className="confirm-icon">
                <Send size={24} />
              </div>
              <h2>Submit your activity?</h2>
              <p>
                You’re about to submit <strong>{file}</strong>. You can still resubmit before the
                deadline.
              </p>
              <div>
                <button className="btn secondary" onClick={() => setConfirm(false)}>
                  Review again
                </button>
                <button
                  className="btn primary"
                  onClick={() => {
                    setConfirm(false);
                    setSubmitted(true);
                  }}
                >
                  Confirm submission
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  return (
    <div className={embedded ? "embedded-page" : "page"}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACADEMICS</span>
          <h1>{embedded ? "Course Activities" : "Activities & Assessments"}</h1>
          <p>Track requirements and submit your academic work on time.</p>
        </div>
        <button className="btn secondary" onClick={() => setQuiz(true)}>
          <Play size={17} /> Try sample quiz
        </button>
      </div>
      <div className="activity-summary">
        {[
          ["Pending", "4", "Due this week"],
          ["Submitted", "12", "Awaiting review"],
          ["Graded", "16", "View feedback"],
          ["Overdue", "0", "You’re on track"],
        ].map(([a, b, c]) => (
          <div className="card" key={a}>
            <span>{a}</span>
            <strong>{b}</strong>
            <small>{c}</small>
          </div>
        ))}
      </div>
      <div className="filter-bar">
        {["All", "Assignment", "Quiz", "Project", "Submitted", "Pending", "Overdue"].map((t) => (
          <button className={filter === t ? "active" : ""} onClick={() => setFilter(t)} key={t}>
            {t}
          </button>
        ))}
      </div>
      <div className="activity-list card">
        <div className="table-head">
          <span>ACTIVITY</span>
          <span>DUE DATE</span>
          <span>POINTS</span>
          <span>STATUS</span>
          <span />
        </div>
        {shown.map((a) => (
          <div className="activity-row" key={a.title}>
            <div>
              <div className={`activity-mini ${a.type.toLowerCase()}`}>
                <ClipboardCheck size={18} />
              </div>
              <span>
                <strong>{a.title}</strong>
                <small>
                  {a.course} · {a.type}
                </small>
              </span>
            </div>
            <span>
              <strong>{a.due.split(",")[0]}</strong>
              <small>{a.due.includes(",") ? a.due.split(",").slice(1).join(",") : ""}</small>
            </span>
            <strong>{a.points} pts</strong>
            <Badge tone={a.status.toLowerCase()}>{a.status}</Badge>
            <button
              className="btn tertiary small"
              onClick={() => {
                setSelected(a);
                onOpen?.();
              }}
            >
              View <ChevronRight size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
