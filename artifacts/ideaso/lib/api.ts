import * as SecureStore from "expo-secure-store";
import { Note, Task, Tag, AIAction } from "./types";

const AUTH_TOKEN_KEY = "auth_session_token";

export function getBaseUrl(): string {
  const domain = process.env["EXPO_PUBLIC_DOMAIN"];
  if (!domain) return "";
  return `https://${domain}`;
}

async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const base = getBaseUrl();
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${base}${path}`, { ...options, headers });
}

export async function callAI(action: AIAction, content: string): Promise<string> {
  const response = await apiFetch("/api/ai", {
    method: "POST",
    body: JSON.stringify({ action, content }),
  });
  if (!response.ok) {
    throw new Error(`AI request failed: ${response.statusText}`);
  }
  const data = (await response.json()) as { result: string };
  return data.result;
}

export async function syncToServer(data: {
  notes: Note[];
  tasks: Task[];
  tags: Tag[];
}): Promise<void> {
  const response = await apiFetch("/api/data/sync", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Sync failed: ${response.statusText}`);
  }
}

export async function fetchFromServer(): Promise<{
  notes: Note[];
  tasks: Task[];
  tags: Tag[];
  syncedAt: string | null;
} | null> {
  const response = await apiFetch("/api/data/sync");
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
  return response.json();
}
