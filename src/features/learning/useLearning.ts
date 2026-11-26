import { useCallback, useEffect, useState } from "react";
import { api, ApiError, errorMessage } from "../../app/api";

export function useLearning<T>(
  path: string | null,
  onSessionExpired: () => void,
  identity?: string,
) {
  const [snapshot, setSnapshot] = useState<{
    path: string;
    identity?: string;
    data?: T;
    error?: string;
  }>();
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((value) => value + 1), []);
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    api<T>(path, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setSnapshot({ path, identity, data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) onSessionExpired();
        else setSnapshot({ path, identity, error: errorMessage(error) });
      });
    return () => controller.abort();
  }, [path, version, onSessionExpired, identity]);
  useEffect(() => {
    if (!path) return;
    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    const interval = window.setInterval(onVisible, 15000);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [path, refresh]);
  const current = path === snapshot?.path && identity === snapshot?.identity ? snapshot : undefined;
  return { data: current?.data, error: current?.error, refresh };
}
