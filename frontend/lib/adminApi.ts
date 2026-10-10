import type { ProductDetail, ProductListItem } from "@/lib/api";

// This file is only for client components ("use client"): it uses the
// browser's localStorage, which doesn't exist on the server.

// --- Types: mirror backend/app/schemas_admin.py ---

export type AdminProductListItem = ProductListItem & {
  is_visible: boolean;
  is_featured: boolean;
};
export type AdminProductDetail = ProductDetail & {
  is_visible: boolean;
  is_featured: boolean;
};

export type AdminProductPage = {
  items: AdminProductListItem[];
  total: number;
  page: number;
  page_size: number;
};

// --- The token ---

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_KEY = "kicksjj_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null; // on the server: no browser storage
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

// --- Errors ---

export class AdminApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// FastAPI errors come as {detail: "text"} or, for validation (422),
// {detail: [{msg: "..."}, ...]}. Turn either into one readable string.
async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail.map((d: { msg: string }) => d.msg).join(", ");
    }
  } catch {
    // the body wasn't JSON: fall through
  }
  return `Request failed (${res.status})`;
}

// --- Login ---

// The backend's /auth/login expects a form (username + password), not JSON.
export async function login(username: string, password: string): Promise<void> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set. Check .env.local");

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    body: new URLSearchParams({ username, password }),
  });
  if (!res.ok) throw new AdminApiError(res.status, await errorMessage(res));

  const data: { access_token: string } = await res.json();
  setToken(data.access_token);
}

export function logout(): void {
  clearToken();
  window.location.href = "/admin/login";
}

// --- The helper every admin screen uses ---

// json: send this object as a JSON body. body: send something raw (e.g. a file's FormData).
type Options = Omit<RequestInit, "body"> & { json?: unknown; body?: BodyInit };

export async function adminFetch<T>(path: string, options: Options = {}): Promise<T> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set. Check .env.local");

  const { json, ...init } = options;
  const headers = new Headers(init.headers);

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let body = init.body;
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(json);
  }

  // For files (FormData) we set no Content-Type: the browser adds it with the right boundary.
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    body,
    cache: "no-store",
  });

  if (res.status === 401) {
    // Missing, wrong or expired token: forget it and go to the login page
    clearToken();
    window.location.href = "/admin/login";
    throw new AdminApiError(401, "Session expired. Please log in again.");
  }
  if (!res.ok) throw new AdminApiError(res.status, await errorMessage(res));

  return res.json() as Promise<T>;
}