import { useCallback, useEffect, useState } from "react";
import type { SessionUser, UserRole } from "@/types";
import { getRoleLabel } from "@/utils";
import { hasPermission } from "@/lib/auth";

export type AuthState = "loading" | "authenticated" | "unauthenticated";

export interface AuthSession {
  user: SessionUser;
  state: AuthState;
}

export function useSession(): AuthSession & {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  can: (permission: string) => boolean;
  displayName: string;
  initials: string;
} {
  const [session, setSession] = useState<AuthSession>({
    user: undefined as unknown as SessionUser,
    state: "loading",
  });

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setSession({ user: data.user as SessionUser, state: "authenticated" });
        } else {
          setSession({ user: undefined as unknown as SessionUser, state: "unauthenticated" });
        }
      })
      .catch(() => {
        setSession({ user: undefined as unknown as SessionUser, state: "unauthenticated" });
      });
  }, []);

  const user = session.user;
  const isAuthenticated = session.state === "authenticated";
  const isLoading = session.state === "loading";

  const hasRole = useCallback(
    (...roles: UserRole[]) => isAuthenticated && roles.includes(user.role),
    [isAuthenticated, user]
  );

  const can = useCallback(
    (permission: string) => isAuthenticated && hasPermission(user.role, permission),
    [isAuthenticated, user]
  );

  const displayName = isAuthenticated ? `${user.firstName} ${user.lastName}` : "";
  const initials = isAuthenticated
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "";

  return { ...session, isAuthenticated, isLoading, hasRole, can, displayName, initials };
}

export function formatUserRole(role: UserRole): string {
  return getRoleLabel(role);
}

export function isAuthenticated(
  session: AuthSession
): session is AuthSession & { user: SessionUser } {
  return session.state === "authenticated" && session.user !== null && session.user !== undefined;
}

export function getAuthError(code: string): string {
  const errorMessages: Record<string, string> = {
    UNAUTHORIZED: "You must be logged in to perform this action",
    FORBIDDEN: "You do not have permission to perform this action",
    INVALID_CREDENTIALS: "Invalid email or password",
    ACCOUNT_LOCKED: "Account temporarily locked due to too many attempts",
    EMAIL_NOT_VERIFIED: "Please verify your email address before continuing",
    SESSION_EXPIRED: "Your session has expired. Please log in again",
  };
  return errorMessages[code] ?? "An unexpected error occurred";
}
