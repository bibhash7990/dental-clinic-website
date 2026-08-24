import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-section px-4 text-center">
      <Logo className="size-14 text-primary" />
      <h1 className="mt-6 font-heading text-5xl font-bold">404</h1>
      <p className="mt-2 text-lg font-medium">This page seems to have a cavity.</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        Let&rsquo;s get you back to a healthy place.
      </p>
      <Link href="/" className={cn(buttonVariants(), "mt-8 h-11 px-6")}>
        Back to home
      </Link>
    </main>
  );
}
