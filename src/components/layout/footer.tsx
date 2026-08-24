import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5H16.5V4.9c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H8v3h2.3v7h3.2Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.6 3h3l-6.6 7.6L21.8 21h-6.1l-4.8-6.3L5.4 21h-3l7.1-8.1L2.5 3h6.3l4.3 5.7L17.6 3Zm-1.1 16.2h1.7L7.9 4.7H6.1l10.4 14.5Z" />
    </svg>
  );
}
import { site } from "@/data/site";
import { Logo } from "@/components/layout/logo";

const quickLinks = [
  { href: "/services", label: "Our Services" },
  { href: "/pricing", label: "Pricing & Payment" },
  { href: "/reviews", label: "Patient Reviews" },
  { href: "/gallery", label: "Smile Gallery" },
  { href: "/blog", label: "Dental Tips" },
  { href: "/portal", label: "Patient Portal" },
  { href: "/waitlist", label: "Cancellation Waitlist" },
  { href: "/book", label: "Book Appointment" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-section">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <Logo className="size-8 text-primary" />
            <span className="font-heading text-lg font-bold">{site.name}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {site.tagline}. Modern, gentle dental care for the whole family —
            from routine check-ups to complete smile makeovers.
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href={site.social.facebook}
              aria-label="Facebook"
              className="inline-flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <FacebookIcon className="size-4" />
            </a>
            <a
              href={site.social.instagram}
              aria-label="Instagram"
              className="inline-flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href={site.social.twitter}
              aria-label="Twitter"
              className="inline-flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <XIcon className="size-4" />
            </a>
          </div>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Quick Links
          </h2>
          <ul className="mt-4 space-y-2.5">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Opening Hours
          </h2>
          <ul className="mt-4 space-y-2">
            {site.hours.map((h) => (
              <li
                key={h.day}
                className="flex justify-between gap-4 text-sm text-muted-foreground"
              >
                <span>{h.day}</span>
                <span className={h.hours === "Closed" ? "text-destructive" : ""}>
                  {h.hours}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Contact
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>
                {site.address.line1}, {site.address.line2}
                <br />
                {site.address.city}, {site.address.zip}
              </span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <a
                href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}
                className="hover:text-primary"
              >
                {site.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <a href={`mailto:${site.email}`} className="hover:text-primary">
                {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-primary">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms
            </Link>
            <span>Demo website — not a real clinic.</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
