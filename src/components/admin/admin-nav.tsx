"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  Hourglass,
  Menu,
  RotateCcw,
  Settings,
  Star,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  hint?: string;
};

/** Everything the front desk touches on a normal day. */
const primary: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/day-sheet", label: "Day sheet", icon: ClipboardList },
  { href: "/admin/patients", label: "Patients", icon: Users },
];

/**
 * The four queues that need chasing rather than scheduling. Ten flat links
 * overflowed the bar, and these are the ones nobody opens hourly.
 */
const outreach: NavItem[] = [
  {
    href: "/admin/follow-ups",
    label: "Follow-ups",
    icon: Bell,
    hint: "Reminders and post-visit emails",
  },
  {
    href: "/admin/recall",
    label: "Recall",
    icon: RotateCcw,
    hint: "Patients due for a check-up",
  },
  {
    href: "/admin/waitlist",
    label: "Waitlist",
    icon: Hourglass,
    hint: "Waiting for an earlier slot",
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: Star,
    hint: "Moderate and reply",
  },
];

const reports: NavItem = {
  href: "/admin/reports",
  label: "Reports",
  icon: BarChart3,
};

const settings: NavItem = {
  href: "/admin/settings",
  label: "Settings",
  icon: Settings,
};

function isActive(pathname: string, href: string): boolean {
  // "/admin" would otherwise light up on every child route.
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

const linkBase =
  "flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors";
const linkIdle = "text-muted-foreground hover:bg-accent hover:text-foreground";
const linkActive = "bg-primary/10 text-primary";

/** Desktop bar: four daily links, the Outreach menu, Reports, Settings gear. */
export function AdminNav() {
  const pathname = usePathname();
  const [outreachOpen, setOutreachOpen] = useState(false);
  const outreachRef = useRef<HTMLDivElement>(null);

  const outreachActive = outreach.some((item) => isActive(pathname, item.href));

  useEffect(() => {
    if (!outreachOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!outreachRef.current?.contains(event.target as Node)) {
        setOutreachOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOutreachOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [outreachOpen]);

  return (
    <div className="flex items-center gap-1">
      <nav aria-label="Admin sections" className="flex items-center gap-1">
        {primary.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            className={cn(
              linkBase,
              isActive(pathname, item.href) ? linkActive : linkIdle
            )}
          >
            {item.label}
          </Link>
        ))}

        <div className="relative" ref={outreachRef}>
          <button
            type="button"
            onClick={() => setOutreachOpen((open) => !open)}
            aria-expanded={outreachOpen}
            aria-haspopup="menu"
            className={cn(
              linkBase,
              outreachActive || outreachOpen ? linkActive : linkIdle
            )}
          >
            Outreach
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                outreachOpen && "rotate-180"
              )}
              aria-hidden
            />
          </button>

          {outreachOpen && (
            <div
              role="menu"
              className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-lg border border-border bg-background p-1.5 shadow-lg"
            >
              {outreach.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOutreachOpen(false)}
                  aria-current={
                    isActive(pathname, item.href) ? "page" : undefined
                  }
                  className={cn(
                    "flex items-start gap-3 rounded-md p-2.5 transition-colors",
                    isActive(pathname, item.href)
                      ? "bg-primary/10"
                      : "hover:bg-accent"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      isActive(pathname, item.href)
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                    aria-hidden
                  />
                  <span>
                    <span
                      className={cn(
                        "block text-sm font-medium",
                        isActive(pathname, item.href) && "text-primary"
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {item.hint}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link
          href={reports.href}
          aria-current={isActive(pathname, reports.href) ? "page" : undefined}
          className={cn(
            linkBase,
            isActive(pathname, reports.href) ? linkActive : linkIdle
          )}
        >
          {reports.label}
        </Link>
      </nav>

      {/* Settings is configuration, not somewhere you go during a shift, so it
          reads as an icon rather than competing with the daily links. */}
      <Link
        href={settings.href}
        aria-label="Settings"
        title="Settings"
        aria-current={isActive(pathname, settings.href) ? "page" : undefined}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-md transition-colors",
          isActive(pathname, settings.href) ? linkActive : linkIdle
        )}
      >
        <Settings className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

/** Everything collapses behind one button below `lg`. */
export function AdminMobileNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        aria-expanded={mobileOpen}
        aria-controls="admin-mobile-nav"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
      >
        {mobileOpen ? (
          <X className="size-5" aria-hidden />
        ) : (
          <Menu className="size-5" aria-hidden />
        )}
      </button>

      {mobileOpen && (
        <div
          id="admin-mobile-nav"
          className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-border bg-background shadow-lg lg:hidden"
        >
          <nav
            aria-label="Admin sections"
            className="mx-auto max-w-7xl px-4 py-3 sm:px-6"
          >
            <ul className="space-y-1">
              {primary.map((item) => (
                <MobileLink key={item.href} item={item} pathname={pathname} onNavigate={close} />
              ))}
            </ul>

            <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Outreach
            </p>
            <ul className="space-y-1">
              {outreach.map((item) => (
                <MobileLink key={item.href} item={item} pathname={pathname} onNavigate={close} />
              ))}
            </ul>

            <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Practice
            </p>
            <ul className="space-y-1 pb-2">
              <MobileLink item={reports} pathname={pathname} onNavigate={close} />
              <MobileLink item={settings} pathname={pathname} onNavigate={close} />
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}

function MobileLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
}) {
  const active = isActive(pathname, item.href);
  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
          active ? linkActive : linkIdle
        )}
      >
        <item.icon className="size-4 shrink-0" aria-hidden />
        {item.label}
      </Link>
    </li>
  );
}
