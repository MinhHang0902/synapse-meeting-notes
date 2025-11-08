import { cookies } from "next/headers";

import configs from "@/constants/config";
import type { TrelloIntegrationCredential } from "@/types/interfaces/trello";

export function requireAppAccessToken(): string {
  const store = cookies();
  const token = store.get("access_token")?.value;
  if (!token) {
    throw Object.assign(new Error("APP_UNAUTHORIZED"), { code: "APP_UNAUTHORIZED" });
  }
  return token;
}

export async function fetchTrelloCredential(
  appAccessToken: string,
): Promise<TrelloIntegrationCredential | null> {
  const res = await fetch(`${configs.API_DOMAIN}/api/core/v1/integration/trello/credential`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${appAccessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    throw Object.assign(new Error("APP_UNAUTHORIZED"), { code: "APP_UNAUTHORIZED" });
  }

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to load Trello credential: ${res.status} ${text}`);
  }

  const payload = await res.json();
  return payload.data as TrelloIntegrationCredential;
}


