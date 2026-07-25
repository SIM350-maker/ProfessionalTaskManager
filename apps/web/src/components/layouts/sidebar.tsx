"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  FolderKanban,
  Users,
  BarChart3,
  Bell,
  User,
  Settings,
  ShieldCheck,
  Building2,
  Shield,
  ChevronDown,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Rocket,
} from "lucide-react";
import { cn, getInitials } from "@/lib/helpers";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { logoutUser } from "@/actions";
import { NAVIGATION_ITEMS } from "@/lib/constants";
import type { UserRole } from "@/types";
import { useUnreadNotificationCount } from "@/features/notifications/useUnreadNotificationCount";

const TASK_LABELS: Record<string, string> = {
  ADMINISTRATOR: "All Tasks",
  MANAGER: "Team Tasks",
  TEAM_MEMBER: "My Tasks",
};

const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard className="h-5 w-5" />,
  Tasks: <ClipboardList className="h-5 w-5" />,
  Projects: <FolderKanban className="h-5 w-5" />,
  Teams: <Users className="h-5 w-5" />,
  Reports: <BarChart3 className="h-5 w-5" />,
  Notifications: <Bell className="h-5 w-5" />,
  Profile: <User className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
  "User Management": <ShieldCheck className="h-5 w-5" />,
  Organization: <Building2 className="h-5 w-5" />,
  "Admin Dashboard": <Shield className="h-5 w-5" />,
  "System Journey": <Rocket className="h-5 w-5" />,
};

interface NavLinkProps {
  item: { label: string; href: string; roles: readonly string[] };
  pathname: string;
  unreadNotificationCount: number;
  isCollapsed: boolean;
  onNavigate?: () => void;
}

function NavLink({ item, pathname, unreadNotificationCount, isCollapsed, onNavigate }: NavLinkProps) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const badge = item.label === "Notifications" && unreadNotificationCount > 0 ? unreadNotificationCount : undefined;
  const label = item.label === "Tasks" ? (TASK_LABELS[item.roles.includes("ADMINISTRATOR") ? "ADMINISTRATOR" : item.roles.includes("MANAGER") ? "MANAGER" : "TEAM_MEMBER"] ?? "Tasks") : item.label;

  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      href={item.href as any}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
        isCollapsed && "justify-center px-2",
        isActive
          ? "bg-accent-blue/10 text-accent-blue"
          : "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
      )}
      title={isCollapsed ? label : undefined}
    >
      {isActive && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent-blue"
        />
      )}
      <span className={cn("shrink-0 transition-transform group-hover:scale-110", isActive && "scale-110")}>
        {iconMap[item.label] ?? <LayoutDashboard className="h-5 w-5" />}
      </span>
      {!isCollapsed && (
        <>
          <span className="truncate">{label}</span>
          {badge !== undefined && (
            <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent-red px-1 text-[10px] font-bold text-white">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

interface SectionProps {
  items: readonly { label: string; href: string; roles: readonly string[] }[];
  label?: string;
  pathname: string;
  unreadNotificationCount: number;
  isCollapsed: boolean;
  onNavigate?: () => void;
}

function Section({ items, label, pathname, unreadNotificationCount, isCollapsed, onNavigate }: SectionProps) {
  if (items.length === 0) return null;
  return (
    <div className="mb-1">
      {!isCollapsed && label && (
        <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
          {label}
        </p>
      )}
      <div className="space-y-0.5 px-2">
        {items.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} unreadNotificationCount={unreadNotificationCount} isCollapsed={isCollapsed} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

interface SidebarProps {
  role: UserRole;
  isPersonalMode: boolean;
  user: { firstName: string; lastName: string; avatarUrl?: string | null; role: UserRole };
}

export function Sidebar({ role, isPersonalMode, user }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const { count: unreadNotificationCount } = useUnreadNotificationCount();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = (labels: string[]) =>
    NAVIGATION_ITEMS.filter(
      (item) => (item.roles as readonly string[]).includes(role) && labels.includes(item.label),
    );

  const mainItems = filteredItems(["Dashboard", "Tasks", "Projects", "Teams"]);
  const journeyItems = filteredItems(["System Journey"]);
  const reportItems = filteredItems(["Reports", "Notifications"]);
  const profileItems = filteredItems(["Profile", "Settings"]);
  const adminItems = filteredItems(["User Management", "Organization", "Admin Dashboard"]);

  const personalItems = filteredItems(["Dashboard", "Tasks", "Projects"]);

  const handleNavigate = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg border border-border-default bg-bg-card p-2 shadow-sm lg:hidden"
        aria-label="Toggle sidebar"
      >
        {isMobileOpen ? <X className="h-5 w-5 text-text-secondary" /> : <Menu className="h-5 w-5 text-text-secondary" />}
      </button>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-border-default bg-bg-sidebar transition-all duration-300 ease-in-out shadow-sidebar",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-border-default", isCollapsed ? "justify-center px-2" : "px-5")}>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple text-sm font-bold text-white shadow-sm">
              PT
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-base font-bold text-text-primary"
              >
                ProTask
              </motion.span>
            )}
          </Link>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="ml-auto rounded-lg p-1.5 text-text-tertiary hover:bg-bg-hover hover:text-text-secondary transition-colors hidden lg:block"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="rounded-lg p-1.5 text-text-tertiary hover:bg-bg-hover hover:text-text-secondary transition-colors hidden lg:block mt-2"
              aria-label="Expand sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          {isPersonalMode ? (
            <>
              <Section items={personalItems} label="My Workspace" pathname={pathname} unreadNotificationCount={unreadNotificationCount} isCollapsed={isCollapsed} onNavigate={handleNavigate} />
              <Section items={profileItems} pathname={pathname} unreadNotificationCount={unreadNotificationCount} isCollapsed={isCollapsed} onNavigate={handleNavigate} />
            </>
          ) : (
            <>
              <Section items={mainItems} label="Main" pathname={pathname} unreadNotificationCount={unreadNotificationCount} isCollapsed={isCollapsed} onNavigate={handleNavigate} />
              <Section items={journeyItems} label="Guide" pathname={pathname} unreadNotificationCount={unreadNotificationCount} isCollapsed={isCollapsed} onNavigate={handleNavigate} />
              <Section items={reportItems} label="Reports" pathname={pathname} unreadNotificationCount={unreadNotificationCount} isCollapsed={isCollapsed} onNavigate={handleNavigate} />
              {!isCollapsed && <div className="mx-3 h-px bg-border-default" />}
              <Section items={profileItems} pathname={pathname} unreadNotificationCount={unreadNotificationCount} isCollapsed={isCollapsed} onNavigate={handleNavigate} />
              {role === "ADMINISTRATOR" && <Section items={adminItems} label="Admin" pathname={pathname} unreadNotificationCount={unreadNotificationCount} isCollapsed={isCollapsed} onNavigate={handleNavigate} />}
            </>
          )}
        </div>

        <div className="border-t border-border-default p-3" ref={userDropdownRef}>
          {!isCollapsed ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-bg-hover"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-blue-light text-xs font-semibold text-accent-blue">
                  {getInitials(user.firstName, user.lastName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-xs text-text-tertiary">{user.role.replace("_", " ")}</p>
                </div>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-text-tertiary transition-transform", userDropdownOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-border-default bg-bg-card py-1 shadow-dropdown"
                  >
                    <Link href="/profile" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-hover">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <Link href="/settings" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-hover">
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    <div className="mx-3 my-1 h-px bg-border-default" />
                    <form action={logoutUser}>
                      <button type="submit" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-accent-red hover:bg-bg-hover">
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="relative" title={`${user.firstName} ${user.lastName}`}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue-light text-xs font-semibold text-accent-blue">
                  {getInitials(user.firstName, user.lastName)}
                </div>
              </button>
              <ThemeToggle />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
