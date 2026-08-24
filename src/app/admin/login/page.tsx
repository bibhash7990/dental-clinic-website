import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/layout/logo";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-section px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-8 shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <Logo className="size-8 text-primary" />
          <span className="font-heading text-lg font-bold">{site.name}</span>
        </div>
        <h1 className="mt-6 text-center text-xl font-bold">Clinic admin</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Sign in to manage appointments
        </p>
        <LoginForm />
        <div className="mt-6 space-y-1 text-center text-xs text-muted-foreground">
          <p>Demo accounts (password after the dash):</p>
          <p><code className="font-mono">owner@brightsmile.demo — admin123</code></p>
          <p><code className="font-mono">desk@brightsmile.demo — desk123</code></p>
          <p><code className="font-mono">dr.mitchell@brightsmile.demo — dentist123</code></p>
        </div>
      </div>
    </main>
  );
}
