export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo-wrap">
      <div className="logo-mark">
        <span>P</span>
      </div>
      {!compact && (
        <div>
          <strong>PUP</strong>
          <small>LEARNING PORTAL</small>
        </div>
      )}
    </div>
  );
}
