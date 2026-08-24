"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock3, Menu, X, Phone, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/data/site";
import { Logo } from "@/components/layout/logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/reviews", label: "Reviews" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

const tel = site.phone.replace(/[^+\d]/g, "");

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-background/90 backdrop-blur transition-shadow",
        scrolled ? "shadow-sm border-b border-border" : "border-b border-transparent"
      )}
    >
      {/* Utility strip — phone, hours and account. Collapses once you scroll so
          the main row stays compact. */}
      <div
        className={cn(
          "hidden overflow-hidden border-b border-border/60 bg-section transition-[max-height,opacity] duration-200 lg:block",
          scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
        )}
      >
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs sm:px-6 lg:px-8">
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <Clock3 className="size-3.5" aria-hidden />
            Mon–Thu 8am–6pm · Fri 8am–4pm · Sat 9am–1pm
          </p>
          <div className="flex items-center gap-5">
            <a
              href={`tel:${tel}`}
              className="flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <Phone className="size-3.5" aria-hidden />
              {site.phone}
            </a>
            <Link
              href="/portal"
              className="flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <UserRound className="size-3.5" aria-hidden />
              My account
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-ring"
          aria-label={`${site.name} — home`}
        >
          <Logo className="size-8 text-primary" />
          <span className="font-heading text-lg font-bold tracking-tight">
            {site.name}
          </span>
        </Link>

        <nav
          aria-label="Main"
          className="hidden flex-1 items-center justify-center gap-0.5 lg:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring",
                isActive(link.href) ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/book"
          className={cn(
            buttonVariants(),
            "ml-auto hidden h-10 shrink-0 whitespace-nowrap bg-cta px-5 text-cta-foreground hover:bg-cta/90 lg:inline-flex"
          )}
        >
          Book Appointment
        </Link>

        <button
          type="button"
          className="ml-auto inline-flex size-11 items-center justify-center rounded-md text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="border-t border-border bg-background px-4 pb-6 pt-2 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-md px-3 py-3 text-base font-medium hover:bg-accent",
                    isActive(link.href) ? "text-primary" : "text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/portal"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-3 text-base font-medium hover:bg-accent"
              >
                <UserRound className="size-4" aria-hidden />
                My account
              </Link>
            </li>
            <li>
              <a
                href={`tel:${tel}`}
                className="flex items-center gap-2 rounded-md px-3 py-3 text-base font-medium hover:bg-accent"
              >
                <Phone className="size-4" aria-hidden />
                {site.phone}
              </a>
            </li>
          </ul>
          <Link
            href="/book"
            onClick={() => setOpen(false)}
            className={cn(
              buttonVariants(),
              "mt-3 h-11 w-full bg-cta text-base text-cta-foreground hover:bg-cta/90"
            )}
          >
            Book Appointment
          </Link>
        </nav>
      )}
    </header>
  );
}
