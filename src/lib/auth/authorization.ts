type SessionWithRole = { user?: { role?: unknown } } | null | undefined;

export function isAdminSession(session: SessionWithRole) {
  return session?.user?.role === "admin";
}