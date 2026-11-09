import { BookOpen } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  foot,
  tone,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  foot: string;
  tone: string;
}) {
  return (
    <div className="stat-card card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={21} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{foot}</small>
      </div>
    </div>
  );
}
