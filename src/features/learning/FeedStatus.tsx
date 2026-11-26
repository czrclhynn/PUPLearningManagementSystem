export function FeedStatus({ error, refresh }: { error?: string; refresh: () => void }) {
  return error ? (
    <div className="card learning-panel">
      <p role="alert">{error}</p>
      <button className="text-btn" onClick={refresh}>
        Retry
      </button>
    </div>
  ) : (
    <p role="status">Loading academic records…</p>
  );
}
