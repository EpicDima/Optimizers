import { API_BASE_URL } from "@shared/config/constants";
import { getSessionId } from "@shared/lib/session-id";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** FastAPI отдаёт ошибки как {detail: string} (HTTPException) или
 * {detail: [{msg, loc}, ...]} (ошибка валидации pydantic) — приводим к строке. */
function extractDetail(body: unknown): string | null {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item) => (item && typeof item === "object" && "msg" in item ? String(item.msg) : String(item)))
        .join("; ");
    }
  }
  return null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": getSessionId(),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, extractDetail(body) ?? response.statusText);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
};
