import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { logout } from "@/lib/actions/admin";
import { site } from "@/data/site";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/patients", label: "Patients" },
  { href: "/admin/day-sheet", label: "Day sheet" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-section">
      <header className="border-b border-border bg-background print:hidden">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 overflow-x-auto">
            <Link href="/admin" className="flex shrink-0 items-center gap-2">
              <Logo className="size-7 text-primary" />
              <span className="hidden font-heading font-bold sm:inline">
                {site.name}
              </span>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                Admin
              </span>
            </Link>
            {session && (
              <nav className="flex items-center gap-1 text-sm">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="whitespace-nowrap rounded-md px-2.5 py-1.5 font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {session && (
              <span className="hidden text-xs text-muted-foreground md:inline">
                {session.name} ·{" "}
                <span className="font-semibold capitalize">
                  {session.role.toLowerCase()}
                </span>
              </span>
            )}
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              View site
            </Link>
            {session && (
              <form action={logout}>
                <Button variant="ghost" size="sm" type="submit" aria-label="Sign out">
                  <LogOut aria-hidden />
                </Button>
              </form>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
