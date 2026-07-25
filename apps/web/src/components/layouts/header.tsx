"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Sun, Moon, LogOut, User, Settings as SettingsIcon, ChevronRight, Keyboard } from "lucide-react";
import { cn, getInitials, timeAgo } from "@/lib/helpers";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { logoutUser } from "@/actions";
import { useNotifications } from "@/features/notifications/useUnreadNotificationCount";
import { CommandPalette } from "@/components/layouts/CommandPalette";
import { KeyboardShortcutsModal } from "@/components/layouts/KeyboardShortcutsModal";
import type { NotificationWithActor } from "@/types";

const SHORTCUT_ROUTES: Record<string, string> = { d: "/dashboard", t: "/tasks", p: "/projects" };

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}

interface HeaderProps {
  actions?: React.ReactNode;
  user?: { firstName: string; lastName: string; avatarUrl?: string | null; role: string } | null;
}

const BREADCRUMB_MAP: Record<string, { label: string; href?: string }[]> = {
  "/dashboard": [{ label: "Dashboard" }],
  "/tasks": [{ label: "Tasks", href: "/tasks" }],
  "/tasks/new": [{ label: "Tasks", href: "/tasks" }, { label: "New Task" }],
  "/projects": [{ label: "Projects", href: "/projects" }],
  "/teams": [{ label: "Teams", href: "/teams" }],
  "/reports": [{ label: "Reports", href: "/reports" }],
  "/notifications": [{ label: "Notifications", href: "/notifications" }],
  "/profile": [{ label: "Profile", href: "/profile" }],
  "/settings": [{ label: "Settings", href: "/settings" }],
  "/admin/users": [{ label: "Admin" }, { label: "User Management" }],
  "/admin/organization": [{ label: "Admin" }, { label: "Organization" }],
};

function getBreadcrumbItems(pathname: string): { label: string; href?: string }[] {
  if (BREADCRUMB_MAP[pathname]) return BREADCRUMB_MAP[pathname];
  if (pathname.startsWith("/tasks/")) {
    if (pathname.endsWith("/edit")) return [{ label: "Tasks", href: "/tasks" }, { label: "Edit Task" }];
    return [{ label: "Tasks", href: "/tasks" }, { label: "Task Details" }];
  }
  if (pathname.startsWith("/projects/")) {
    if (pathname.endsWith("/edit")) return [{ label: "Projects", href: "/projects" }, { label: "Edit Project" }];
    return [{ label: "Projects", href: "/projects" }, { label: "Project Details" }];
  }
  if (pathname.startsWith("/teams/")) {
    return [{ label: "Teams", href: "/teams" }, { label: "Team Details" }];
  }
  return [{ label: "Dashboard" }];
}

export function Header({ actions, user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const gPressedAtRef = useRef<number | null>(null);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setDropdownOpen(false);
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) setNotifDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (isTypingTarget(event.target)) return;

      if (event.key === "?") {
        event.preventDefault();
        setShortcutsOpen((prev) => !prev);
        return;
      }

      if (event.key === "g") {
        gPressedAtRef.current = Date.now();
        return;
      }

      const route = SHORTCUT_ROUTES[event.key];
      if (route && gPressedAtRef.current && Date.now() - gPressedAtRef.current < 600) {
        gPressedAtRef.current = null;
        router.push(route as Parameters<typeof router.push>[0]);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const breadcrumbItems = getBreadcrumbItems(pathname);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border-default bg-bg-card/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <nav className="hidden sm:flex items-center gap-1.5 text-sm">
          {breadcrumbItems.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />}
              {item.href ? (
                <Link href={item.href as any} className="text-text-secondary hover:text-text-primary transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-text-primary">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {actions}

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-subtle px-3 py-1.5 text-sm text-text-tertiary hover:border-border-hover hover:text-text-secondary transition-colors min-w-[180px]"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="ml-auto flex items-center gap-0.5 rounded-md border border-border-default bg-bg-card px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {user && (
          <CommandPalette
            open={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
            role={user.role}
          />
        )}

        <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

        <div className="relative">
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative rounded-lg p-2 text-text-tertiary hover:bg-bg-hover hover:text-text-secondary transition-colors"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-accent-red px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifDropdownOpen && (
              <motion.div
                ref={notifDropdownRef}
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border-default bg-bg-card py-2 shadow-dropdown"
              >
                <div className="flex items-center justify-between px-4 py-2">
                  <p className="text-sm font-semibold text-text-primary">Notifications</p>
                  {unreadCount > 0 && (
                    <button onClick={() => markAsRead()} className="text-xs text-accent-blue hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="border-t border-border-default" />
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-text-tertiary">No notifications yet</div>
                  ) : (
                    notifications.slice(0, 5).map((notif: NotificationWithActor) => (
                      <Link
                        key={notif.id}
                        href="/notifications"
                        onClick={() => { setNotifDropdownOpen(false); if (!notif.isRead) markAsRead(notif.id); }}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-bg-hover",
                          !notif.isRead && "bg-accent-blue-light/50",
                        )}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-blue-light text-xs font-semibold text-accent-blue">
                          {notif.actor ? getInitials(notif.actor.firstName, notif.actor.lastName) : "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-text-primary">{notif.message}</p>
                          <p className="text-xs text-text-tertiary mt-0.5">{timeAgo(notif.createdAt)}</p>
                        </div>
                        {!notif.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-blue" />}
                      </Link>
                    ))
                  )}
                </div>
                <div className="border-t border-border-default" />
                <Link
                  href="/notifications"
                  onClick={() => setNotifDropdownOpen(false)}
                  className="flex items-center justify-center px-4 py-2 text-sm text-accent-blue hover:bg-bg-hover transition-colors"
                >
                  View all notifications
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ThemeToggle />

        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 border-l border-border-default pl-3 sm:pl-4 hover:opacity-80 transition-opacity"
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-text-primary">{user.firstName} {user.lastName}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue-light text-sm font-semibold text-accent-blue">
                {getInitials(user.firstName, user.lastName)}
              </div>
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border-default bg-bg-card py-1 shadow-dropdown"
                >
                  <div className="border-b border-border-default px-4 py-2">
                    <p className="truncate text-sm font-medium text-text-primary">{user.firstName} {user.lastName}</p>
                    <p className="truncate text-xs text-text-tertiary">{user.role.replace("_", " ")}</p>
                  </div>
                  <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-bg-hover transition-colors">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                  <Link href="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-bg-hover transition-colors">
                    <SettingsIcon className="h-4 w-4" /> Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setDropdownOpen(false); setShortcutsOpen(true); }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-bg-hover transition-colors"
                  >
                    <Keyboard className="h-4 w-4" /> Keyboard Shortcuts
                  </button>
                  <div className="mx-3 my-1 h-px bg-border-default" />
                  <form action={logoutUser}>
                    <button type="submit" className="flex w-full items-center gap-2 px-4 py-2 text-sm text-accent-red hover:bg-bg-hover transition-colors">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
