import { getToken, getUser, clearAuth } from "./auth";

const BASE_URL = "https://dev.bharathbots.com";

interface ApiOptions {
  skipTenantFields?: boolean;
}

export async function apiPost<T = any>(
  endpoint: string,
  body: Record<string, any> = {},
  options?: ApiOptions
): Promise<T> {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    clearAuth();
    window.location.href = "/login";
    throw new Error("Not authenticated");
  }

  const enrichedBody = options?.skipTenantFields
    ? body
    : {
        company_id: user.company_id,
        branch_id: user.branch_id,
        ...body,
      };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(enrichedBody),
  });

  if (res.status === 401) {
    clearAuth();
    window.location.href = "/login";
    throw new Error("Token expired");
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed: ${res.status}`);
  }

  return res.json();
}
