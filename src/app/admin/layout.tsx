import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { AdminMobileNav, AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { logout } from "@/lib/actions/admin";
import { site } from "@/data/site";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-section">
      {/* `relative` anchors the mobile nav panel, which drops out of the bar. */}
      <header className="relative border-b border-border bg-background print:hidden">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
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
            <div className="ml-2 hidden lg:block">
              <AdminNav />
            </div>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            {session && (
              <span className="hidden max-w-40 truncate text-xs text-muted-foreground xl:inline">
                {session.name} ·{" "}
                <span className="font-semibold capitalize">
                  {session.role.toLowerCase()}
                </span>
              </span>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ExternalLink className="size-4" aria-hidden />
              <span className="hidden sm:inline">View site</span>
            </Link>
            {session && (
              <form action={logout}>
                <Button
                  variant="ghost"
                  size="sm"
                  type="submit"
                  aria-label="Sign out"
                >
                  <LogOut aria-hidden />
                </Button>
              </form>
            )}
            {session && <AdminMobileNav />}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
