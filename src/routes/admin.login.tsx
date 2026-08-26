import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hospital } from "@/content/hospital";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: `Admin Sign In | ${hospital.name}` },
      { name: "description", content: `Secure staff sign in for ${hospital.name}.` },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      if (!isSupabaseConfigured()) {
        throw new Error("Supabase is not configured. Add the VITE_SUPABASE_* values first.");
      }
      const { error: signInError } = await getSupabaseClient().auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      await navigate({ to: "/admin/dashboard" });
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="mb-8 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-card">
        <LockKeyhole className="size-5" aria-hidden="true" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Staff portal</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">Welcome back</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Sign in to manage hospital services, appointments and public content.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Work email</Label>
          <Input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@garowehospital.org"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="admin-password">Password</Label>
            <Link
              to="/admin/forgot-password"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="admin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-0 top-0 grid h-full w-11 place-items-center text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        {error ? (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"} <ArrowRight />
        </Button>
      </form>
      <SecurityNote />
    </AuthShell>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-surface">
      <div className="absolute -left-32 -top-32 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-32 size-[28rem] rounded-full bg-accent/10 blur-3xl" />
      <header className="relative z-10 border-b border-border bg-background/70">
        <div className="container-page flex h-20 items-center justify-between">
          <Logo />
          <Link
            to="/"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Return to website
          </Link>
        </div>
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-12">
        <section className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-lift sm:p-9">
          {children}
        </section>
      </main>
      <footer className="relative z-10 px-5 pb-6 text-center text-xs text-muted-foreground">
        {hospital.name} · Staff access
      </footer>
    </div>
  );
}

function SecurityNote() {
  return (
    <p className="mt-8 flex gap-2 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
      Admin access will require verified staff identity and multi-factor authentication when
      connected.
    </p>
  );
}
