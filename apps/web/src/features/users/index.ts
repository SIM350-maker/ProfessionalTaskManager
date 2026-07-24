"use client";

import { useState, useEffect, useCallback } from "react";
import type { User, UserRole, UserPreferences } from "@/types";
import { getRoleLabel } from "@/utils";
import { formatDate } from "@/lib/helpers";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  department: string | null;
  avatarUrl: string | null;
  timezone: string | null;
  role: UserRole;
  isActive: boolean;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  teams: { id: string; name: string }[];
  preferences: Pick<
    UserPreferences,
    "theme" | "language" | "notificationEmailEnabled" | "notificationInAppEnabled"
  > | null;
}

export interface UserRoleInfo {
  role: UserRole;
  label: string;
  isAdmin: boolean;
  isManager: boolean;
  isMember: boolean;
}

export function useUserProfile(userId: string | undefined): {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user profile");
      const json = await res.json();
      setProfile(json.data as UserProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [fetchProfile]);

  return { profile, isLoading, error, refresh: fetchProfile };
}

export function getUserRoleInfo(role: UserRole): UserRoleInfo {
  return {
    role,
    label: getRoleLabel(role),
    isAdmin: role === "ADMINISTRATOR",
    isManager: role === "MANAGER",
    isMember: role === "TEAM_MEMBER",
  };
}

export function formatUserDisplayName(user: Pick<User, "firstName" | "lastName">): string {
  return `${user.firstName} ${user.lastName}`;
}

export function formatLastLogin(date: Date | null): string {
  if (!date) return "Never";
  return formatDate(date);
}

export function canManageUsers(currentRole: UserRole): boolean {
  return currentRole === "ADMINISTRATOR";
}

export function canManageRoles(currentRole: UserRole): boolean {
  return currentRole === "ADMINISTRATOR";
}
