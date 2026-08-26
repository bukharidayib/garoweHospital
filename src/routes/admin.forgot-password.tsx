import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hospital } from "@/content/hospital";

export const Route = createFileRoute("/admin/forgot-password")({
  head: () => ({ meta: [{ title: `Reset Admin Password | ${hospital.name}` }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [notice, setNotice] = useState("");

  return (
    <AuthShell>
      <div className="mb-8 flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
        <Mail className="size-5" aria-hidden="true" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Account recovery
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">
        Reset your password
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Enter your staff email and the connected authentication service will send recovery
        instructions.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setNotice("Password recovery will be enabled when the hospital database is connected.");
        }}
        className="mt-8 space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="recovery-email">Work email</Label>
          <Input
            id="recovery-email"
            type="email"
            autoComplete="email"
            placeholder="name@garowehospital.org"
            required
          />
        </div>
        {notice ? (
          <p role="status" className="rounded-lg bg-primary-soft px-3 py-2 text-sm text-primary">
            {notice}
          </p>
        ) : null}
        <Button type="submit" className="w-full" size="lg">
          Send recovery link
        </Button>
      </form>
      <div className="mt-7 border-t border-border pt-5">
        <Link
          to="/admin/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to sign in
        </Link>
      </div>
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
          <Link to="/" className="font-display text-lg font-semibold text-foreground">
            {hospital.name}
          </Link>
          <Link
            to="/admin/login"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Sign in
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
      Recovery will use a verified staff identity when authentication is connected.
    </p>
  );
}
