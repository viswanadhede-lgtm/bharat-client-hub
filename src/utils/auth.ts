export interface AuthUser {
  user_id: string;
  company_id: string;
  branch_id: string;
  role?: string;
}

const TOKEN_KEY = "auth_token";
const USER_KEY = "bb_user";

export function decodeToken(token: string): AuthUser | null {
  try {
    const decoded = JSON.parse(atob(token));
    return {
      user_id: decoded.user_id,
      company_id: decoded.company_id,
      branch_id: decoded.branch_id,
      role: decoded.role || "admin",
    };
  } catch {
    return null;
  }
}

export function storeAuth(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  const user = decodeToken(token);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getUser();
}
