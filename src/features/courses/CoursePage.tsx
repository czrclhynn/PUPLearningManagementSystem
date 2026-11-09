import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  Maximize2,
  Play,
  Search,
  Star,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";
import { ActivitiesPage } from "../activities/ActivitiesPage";
import { GradesPage } from "../grades/GradesPage";
import { DiscussionsPage } from "../discussions/DiscussionsPage";

function MaterialRow({
  type,
  name,
  meta,
  onPreview,
}: {
  type: string;
  name: string;
  meta: string;
  onPreview: () => void;
}) {
  const Icon =
    type === "PPTX" ? Play : type === "PDF" ? FileText : type === "XLSX" ? FileSpreadsheet : File;
  const [saved, setSaved] = useState(false);
  return (
    <div className="material-row">
      <div className={`file-icon ${type.toLowerCase()}`}>
        <Icon size={21} />
        <span>{type}</span>
      </div>
      <div className="file-info">
        <strong>{name}</strong>
        <span>{meta}</span>
      </div>
      <button
        className={`icon-btn ${saved ? "saved" : ""}`}
        onClick={() => setSaved(!saved)}
        aria-label="Bookmark"
      >
        <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
      </button>
      <button className="btn tertiary small" onClick={onPreview}>
        <Eye size={16} /> Preview
      </button>
      <button className="icon-btn">
        <Download size={18} />
      </button>
    </div>
  );
}
function PresentationViewer({ onClose }: { onClose: () => void }) {
  const [slide, setSlide] = useState(1);
  const [zoom, setZoom] = useState(100);
  return (
    <div className="modal-layer viewer-layer">
      <div className="presentation-viewer">
        <header>
          <div>
            <button className="icon-btn dark" onClick={onClose}>
              <X size={19} />
            </button>
            <div>
              <strong>Introduction to Data Science.pptx</strong>
              <span>COMP 034 · Module 1</span>
            </div>
          </div>
          <div>
            <button className="icon-btn dark" onClick={() => setZoom(Math.max(70, zoom - 10))}>
              <ZoomOut size={18} />
            </button>
            <span>{zoom}%</span>
            <button className="icon-btn dark" onClick={() => setZoom(Math.min(130, zoom + 10))}>
              <ZoomIn size={18} />
            </button>
            <button className="icon-btn dark">
              <Maximize2 size={18} />
            </button>
            <button className="btn light small">
              <Download size={16} /> Download
            </button>
          </div>
        </header>
        <div className="viewer-body">
          <aside>
            <span>SLIDES</span>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button className={slide === n ? "active" : ""} onClick={() => setSlide(n)} key={n}>
                <i>{n}</i>
                <div className={`thumb thumb-${n}`}>
                  <small>
                    {n === 1
                      ? "DATA SCIENCE"
                      : n === 2
                        ? "What is Data?"
                        : n === 3
                          ? "The Process"
                          : `Topic ${n}`}
                  </small>
                </div>
              </button>
            ))}
          </aside>
          <main>
            <div className="slide-canvas" style={{ transform: `scale(${zoom / 100})` }}>
              {slide === 1 ? (
                <>
                  <span className="slide-kicker">COMP 034 · MODULE 1</span>
                  <h1>
                    Introduction to
                    <br />
                    <b>Data Science</b>
                  </h1>
                  <p>Understanding data, insights, and the questions that connect them.</p>
                  <div className="slide-footer">
                    <span>PUP</span>
                    <small>Prof. Carlo Inovero · 2024–2025</small>
                  </div>
                </>
              ) : (
                <>
                  <span className="slide-kicker">LESSON {slide - 1}</span>
                  <h1>
                    {
                      [
                        "",
                        "",
                        "What is Data?",
                        "The Data Science Process",
                        "Collecting Information",
                        "Preparing a Dataset",
                        "Key Takeaways",
                      ][slide]
                    }
                  </h1>
                  <div className="slide-columns">
                    <div>
                      <span>0{slide - 1}</span>
                      <h3>Observe</h3>
                      <p>Start with a clear question and understand the available information.</p>
                    </div>
                    <div>
                      <span>0{slide}</span>
                      <h3>Analyze</h3>
                      <p>Transform raw inputs into meaningful and responsible insight.</p>
                    </div>
                  </div>
                  <div className="slide-footer">
                    <span>PUP</span>
                    <small>Introduction to Data Science</small>
                  </div>
                </>
              )}
            </div>
            <div className="viewer-controls">
              <button onClick={() => setSlide(Math.max(1, slide - 1))} disabled={slide === 1}>
                <ChevronLeft size={20} />
              </button>
              <span>Slide {slide} of 6</span>
              <button onClick={() => setSlide(Math.min(6, slide + 1))} disabled={slide === 6}>
                <ChevronRight size={20} />
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
export function CoursePage({
  initialTab,
  onBack,
  onActivity,
}: {
  initialTab: string;
  onBack: () => void;
  onActivity: () => void;
}) {
  const [tab, setTab] = useState(initialTab || "overview");
  const [viewer, setViewer] = useState(false);
  return (
    <div className="page course-page">
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={16} /> Back to my courses
      </button>
      <section className="course-hero">
        <div className="course-hero-pattern" />
        <div className="hero-icon">
          <BookOpen size={31} />
        </div>
        <div className="hero-copy">
          <span>COMP 034 · BSIT 3-3</span>
          <h1>Introduction to Data Science</h1>
          <p>
            Explore the principles, tools, and practices that turn raw data into meaningful
            decisions.
          </p>
          <div className="hero-instructor">
            <div className="avatar small">CI</div>
            <span>
              <small>Course instructor</small>
              <strong>Prof. Carlo Inovero</strong>
            </span>
          </div>
        </div>
        <div className="hero-progress">
          <span>COURSE PROGRESS</span>
          <div className="hero-score">
            <strong>78%</strong>
            <small>completed</small>
          </div>
          <Progress value={78} gold />
          <p>11 of 14 materials completed</p>
        </div>
      </section>
      <div className="course-tabs">
        {["overview", "materials", "activities", "discussions", "grades"].map((t) => (
          <button className={tab === t ? "active" : ""} onClick={() => setTab(t)} key={t}>
            {t === "materials" ? "Learning Materials" : t[0].toUpperCase() + t.slice(1)}
            {t === "activities" && <span>2</span>}
          </button>
        ))}
      </div>
      {tab === "overview" && (
        <div className="course-overview">
          <div className="overview-main">
            <section className="card instructor-note">
              <div className="quote-mark">“</div>
              <div>
                <span className="eyebrow">A NOTE FROM YOUR INSTRUCTOR</span>
                <h2>Welcome to the course, data explorers.</h2>
                <p>
                  This week, we’ll learn how raw information becomes useful insight. Review Module 2
                  before our live session and bring one real-world example of a messy dataset.
                </p>
                <div className="signed">
                  <div className="avatar small">CI</div>
                  <span>
                    <strong>Prof. Carlo Inovero</strong>
                    <small>Posted May 22</small>
                  </span>
                </div>
              </div>
            </section>
            <section className="card">
              <div className="section-head">
                <div>
                  <h2>Continue learning</h2>
                  <p>Your most recent module</p>
                </div>
                <button className="text-btn" onClick={() => setTab("materials")}>
                  All materials
                </button>
              </div>
              <div className="continue-module">
                <div className="module-number">02</div>
                <div>
                  <span>MODULE 2 · 4 MATERIALS</span>
                  <h3>Data Collection and Preparation</h3>
                  <p>Learn methods for gathering, cleaning, and preparing quality data.</p>
                  <Progress value={50} />
                </div>
                <button className="btn primary" onClick={() => setTab("materials")}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </section>
          </div>
          <aside className="overview-aside card">
            <div className="section-head">
              <div>
                <h2>Up next</h2>
                <p>Course activities</p>
              </div>
            </div>
            <div className="up-next-date">
              <span>MAY</span>
              <strong>25</strong>
            </div>
            <Badge tone="pending">Due today</Badge>
            <h3>Data Preparation Exercise</h3>
            <p>Apply preprocessing techniques to the sample customer dataset.</p>
            <div className="detail-list">
              <span>
                <Clock3 size={16} /> 11:59 PM
              </span>
              <span>
                <Star size={16} /> 50 points
              </span>
            </div>
            <button className="btn primary full" onClick={onActivity}>
              View activity
            </button>
            <hr />
            <h4>Course at a glance</h4>
            <div className="glance-grid">
              <div>
                <strong>14</strong>
                <span>Materials</span>
              </div>
              <div>
                <strong>6</strong>
                <span>Activities</span>
              </div>
              <div>
                <strong>3</strong>
                <span>Discussions</span>
              </div>
              <div>
                <strong>89</strong>
                <span>Standing</span>
              </div>
            </div>
          </aside>
        </div>
      )}
      {tab === "materials" && (
        <div className="materials-layout">
          <main>
            <div className="page-subhead">
              <div>
                <h2>Learning Materials</h2>
                <p>Course content organized by learning module.</p>
              </div>
              <div className="search-field compact">
                <Search size={17} />
                <input placeholder="Search materials..." />
              </div>
            </div>
            <section className="module card">
              <div className="module-head">
                <div>
                  <span>MODULE 1</span>
                  <h2>Introduction to Data Science</h2>
                  <p>Completed · 3 materials</p>
                </div>
                <div className="completion-check">
                  <Check size={18} />
                </div>
              </div>
              <MaterialRow
                type="PPTX"
                name="Introduction to Data Science.pptx"
                meta="8.4 MB · Uploaded May 5 by Prof. Inovero"
                onPreview={() => setViewer(true)}
              />
              <MaterialRow
                type="PDF"
                name="History and Applications of Data Science.pdf"
                meta="2.1 MB · Uploaded May 5 by Prof. Inovero"
                onPreview={() => setViewer(true)}
              />
              <MaterialRow
                type="PDF"
                name="Lecture Notes – Week 1.pdf"
                meta="1.8 MB · Uploaded May 7 by Prof. Inovero"
                onPreview={() => setViewer(true)}
              />
            </section>
            <section className="module card">
              <div className="module-head">
                <div>
                  <span>MODULE 2 · CURRENT</span>
                  <h2>Data Collection and Preparation</h2>
                  <p>2 of 4 materials viewed</p>
                </div>
                <div className="module-percent">50%</div>
              </div>
              <MaterialRow
                type="PPTX"
                name="Data Collection Methods.pptx"
                meta="10.2 MB · Uploaded May 18 by Prof. Inovero"
                onPreview={() => setViewer(true)}
              />
              <MaterialRow
                type="PDF"
                name="Data Preprocessing.pdf"
                meta="3.6 MB · Uploaded May 18 by Prof. Inovero"
                onPreview={() => setViewer(true)}
              />
              <MaterialRow
                type="XLSX"
                name="Customer Dataset – Practice File.xlsx"
                meta="780 KB · Uploaded May 20 by Prof. Inovero"
                onPreview={() => setViewer(true)}
              />
            </section>
          </main>
          <aside className="card materials-aside">
            <h3>Course resources</h3>
            <button>
              <FileText size={18} /> Course syllabus <Download size={16} />
            </button>
            <button>
              <CalendarDays size={18} /> Learning schedule <Download size={16} />
            </button>
            <button>
              <BookMarked size={18} /> Reference guide <Download size={16} />
            </button>
            <hr />
            <h3>Your bookmarks</h3>
            <p>Save materials for quick access while studying.</p>
            <button className="btn tertiary full">
              <Bookmark size={16} /> View bookmarks
            </button>
          </aside>
        </div>
      )}
      {tab === "activities" && <ActivitiesPage embedded onOpen={onActivity} />}
      {tab === "discussions" && <DiscussionsPage compact />}
      {tab === "grades" && <GradesPage compact />}
      {viewer && <PresentationViewer onClose={() => setViewer(false)} />}
    </div>
  );
}
