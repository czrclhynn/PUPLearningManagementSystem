import { useState } from "react";
import {
  ArrowRight,
  Bookmark,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import { courses } from "../courses/mock";
import { Badge } from "../../components/ui/Badge";

export function DiscussionsPage({ compact = false }: { compact?: boolean }) {
  const [posts, setPosts] = useState([
    {
      name: "Alyssa Mendoza",
      initials: "AM",
      role: "BSIT 3-3",
      time: "18 min ago",
      title: "Question about handling missing values",
      body: "For the activity, should we remove rows with missing values or apply imputation first?",
      replies: 4,
      reactions: 7,
      pinned: false,
    },
    {
      name: "Prof. Carlo Inovero",
      initials: "CI",
      role: "Instructor · COMP 034",
      time: "1 hr ago",
      title: "Module 2 clarification and examples",
      body: "I added a short walkthrough of data imputation under the Module 2 reference materials. Please review it before the activity.",
      replies: 8,
      reactions: 19,
      pinned: true,
    },
    {
      name: "Joshua Lim",
      initials: "JL",
      role: "BSIT 3-3",
      time: "Yesterday",
      title: "Study group for the normalization quiz",
      body: "Is anyone available for a quick review session tomorrow afternoon?",
      replies: 6,
      reactions: 5,
      pinned: false,
    },
  ]);
  const [compose, setCompose] = useState(false);
  const [draft, setDraft] = useState("");
  return (
    <div className={compact ? "embedded-page" : "page"}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">COMMUNITY</span>
          <h1>{compact ? "Course Discussions" : "Class Discussions"}</h1>
          <p>Ask questions, exchange ideas, and learn with your class.</p>
        </div>
        <button className="btn primary" onClick={() => setCompose(true)}>
          <Plus size={17} /> Start discussion
        </button>
      </div>
      <div className="discussion-layout">
        <main>
          <div className="toolbar card discussion-tools">
            <div className="search-field">
              <Search size={17} />
              <input placeholder="Search discussions..." />
            </div>
            <select>
              <option>All courses</option>
              <option>COMP 034</option>
            </select>
            <button className="icon-btn">
              <SlidersHorizontal size={18} />
            </button>
          </div>
          {posts.map((post, i) => (
            <article className="discussion-card card" key={i}>
              {post.pinned && (
                <div className="pinned-label">
                  <Bookmark size={14} /> PINNED BY INSTRUCTOR
                </div>
              )}
              <div className="discussion-author">
                <div className={`avatar small ${i === 1 ? "gold-avatar" : ""}`}>
                  {post.initials}
                </div>
                <div>
                  <strong>
                    {post.name}
                    {i === 1 && <Badge tone="gold">Instructor</Badge>}
                  </strong>
                  <span>
                    {post.role} · {post.time}
                  </span>
                </div>
                <button className="icon-btn">
                  <MoreHorizontal size={18} />
                </button>
              </div>
              <h2>{post.title}</h2>
              <p>{post.body}</p>
              <div className="discussion-footer">
                <button>
                  <MessageCircle size={17} /> {post.replies} replies
                </button>
                <button>
                  <Star size={17} /> {post.reactions}
                </button>
                <button>
                  <Paperclip size={17} /> Attachment
                </button>
                <button>
                  View thread <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </main>
        <aside className="card discussion-aside">
          <h3>Discussion spaces</h3>
          {courses.slice(0, 4).map((c, i) => (
            <button key={c.code}>
              <span className={`course-dot ${c.accent}`} />{" "}
              <span>
                <strong>{c.code}</strong>
                <small>{[12, 8, 6, 10][i]} conversations</small>
              </span>
              {i === 0 && <i>3</i>}
            </button>
          ))}
          <hr />
          <h3>Community guidelines</h3>
          <p>Be respectful, stay on topic, and support your ideas with academic sources.</p>
          <button className="text-btn">
            Read guidelines <ArrowRight size={14} />
          </button>
        </aside>
      </div>
      {compose && (
        <div className="modal-layer">
          <form
            className="compose-modal card"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft)
                setPosts([
                  {
                    name: "Izy Basco",
                    initials: "IB",
                    role: "BSIT 3-3",
                    time: "Just now",
                    title: draft,
                    body: "I’d appreciate your thoughts and suggestions on this topic.",
                    replies: 0,
                    reactions: 0,
                    pinned: false,
                  },
                  ...posts,
                ]);
              setCompose(false);
              setDraft("");
            }}
          >
            <div className="section-head">
              <div>
                <h2>Start a discussion</h2>
                <p>Share a question or topic with your class.</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => setCompose(false)}>
                <X size={18} />
              </button>
            </div>
            <label>
              Course
              <select>
                <option>COMP 034 · Introduction to Data Science</option>
                <option>COMP 018 · Database Administration</option>
              </select>
            </label>
            <label>
              Discussion title
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="What would you like to discuss?"
              />
            </label>
            <label>
              Message
              <textarea placeholder="Add context, details, or a specific question..." />
            </label>
            <div>
              <button type="button" className="btn secondary" onClick={() => setCompose(false)}>
                Cancel
              </button>
              <button className="btn primary">Publish discussion</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
