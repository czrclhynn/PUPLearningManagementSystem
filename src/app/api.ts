export type Role = "Administrator" | "Instructor" | "Student";
export type SessionUser = { id: string; name: string; email: string; role: Role };

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(
  path: string,
  { method = "GET", body, signal }: { method?: string; body?: object; signal?: AbortSignal } = {},
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    credentials: "same-origin",
    headers: {
      ...(method !== "GET" ? { "X-LMS-Request": "1" } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok || data === null) {
    throw new ApiError(
      response.status,
      data?.error ?? "The learning portal is temporarily unavailable.",
    );
  }
  return data as T;
}

export function errorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "The learning portal is temporarily unavailable. Try again.";
}
