"use client";

import { cn, getInitials, getInitialsColor } from "@/lib/helpers";
import { forwardRef } from "react";

const sizes = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
  xl: "h-14 w-14 text-base",
};

const indicatorSizes = { sm: "h-2 w-2", md: "h-2.5 w-2.5", lg: "h-3 w-3", xl: "h-3.5 w-3.5" };

interface AvatarProps {
  src?: string | null;
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  size?: keyof typeof sizes;
  className?: string;
  status?: "online" | "away" | "offline";
}

const statusColors: Record<string, string> = {
  online: "bg-accent-green",
  away: "bg-accent-amber",
  offline: "bg-text-tertiary",
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, avatarUrl, firstName = "", lastName = "", size = "md", className, status, ...props }, ref) => {
    const imgSrc = src ?? avatarUrl;
    const initials = getInitials(firstName, lastName);
    const colorClass = getInitialsColor(firstName + lastName);

    return (
      <div ref={ref} className={cn("relative inline-flex shrink-0", className)} {...props}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={`${firstName} ${lastName}`}
            className={cn("rounded-full object-cover", sizes[size])}
          />
        ) : (
          <div className={cn("flex items-center justify-center rounded-full font-semibold", sizes[size], colorClass)}>
            {initials || "?"}
          </div>
        )}
        {status && (
          <span className={cn("absolute bottom-0 right-0 rounded-full ring-2 ring-bg-card", indicatorSizes[size], statusColors[status])} />
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

interface AvatarGroupProps {
  users: { firstName?: string; lastName?: string; avatarUrl?: string | null; id?: string }[];
  max?: number;
  size?: keyof typeof sizes;
  className?: string;
}

export function AvatarGroup({ users, max = 4, size = "sm", className }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className={cn("flex items-center -space-x-1.5", className)}>
      {visible.map((user, i) => (
        <Avatar key={user.id ?? i} firstName={user.firstName} lastName={user.lastName} src={user.avatarUrl} size={size} className="ring-2 ring-bg-card" />
      ))}
      {remaining > 0 && (
        <div className={cn("flex items-center justify-center rounded-full bg-bg-hover text-[10px] font-medium text-text-secondary ring-2 ring-bg-card", sizes[size])}>
          +{remaining}
        </div>
      )}
    </div>
  );
}
