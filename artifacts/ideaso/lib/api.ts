import { AIAction } from "./types";

const getBaseUrl = () => {
  const domain = process.env["EXPO_PUBLIC_DOMAIN"];
  if (!domain) return "";
  return `https://${domain}`;
};

export async function callAI(action: AIAction, content: string): Promise<string> {
  const base = getBaseUrl();
  const response = await fetch(`${base}/api/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, content }),
  });
  if (!response.ok) {
    throw new Error(`AI request failed: ${response.statusText}`);
  }
  const data = (await response.json()) as { result: string };
  return data.result;
}
