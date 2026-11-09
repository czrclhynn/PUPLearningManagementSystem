export function Progress({ value, gold = false }: { value: number; gold?: boolean }) {
  return (
    <div className="progress">
      <span className={gold ? "gold" : ""} style={{ width: `${value}%` }} />
    </div>
  );
}
