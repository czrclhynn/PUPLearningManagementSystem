import { Settings } from "lucide-react";

export function EmptyPage({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="empty-page card">
      <div className="empty-icon">
        <Settings size={26} />
      </div>
      <h2>{title}</h2>
      <p>{copy}</p>
      <button className="btn primary">Update preferences</button>
    </div>
  );
}
