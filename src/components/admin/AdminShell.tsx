import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  CalendarDays,
  ClipboardList,
  ChevronDown,
  Clock3,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  ReceiptText,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

const navGroups = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operations",
    items: [
      { label: "Patients", to: "/admin/patients", icon: Users },
      { label: "Appointments", to: "/admin/appointments", icon: CalendarDays },
      { label: "Queue", to: "/admin/queue", icon: Clock3 },
    ],
  },
  {
    label: "Clinical",
    items: [
      { label: "Laboratory", to: "/admin/laboratory", icon: FlaskConical },
      { label: "Prescriptions", to: "/admin/prescriptions", icon: ClipboardList },
      { label: "Pharmacy", to: "/admin/pharmacy", icon: Pill },
      { label: "Billing", to: "/admin/billing", icon: ReceiptText },
      { label: "Reports", to: "/admin/reports", icon: Activity },
    ],
  },
] as const;

export function AdminShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await getSupabaseClient().auth.signOut();
        if (error) console.warn("Supabase sign-out failed:", error.message);
      }
    } catch (error) {
      console.warn("Unable to reach Supabase during sign-out:", error);
    } finally {
      // The local app must leave the protected area even if the network is unavailable.
      await navigate({ to: "/admin/login", replace: true });
      setIsSigningOut(false);
    }
  }
  return (
    <div className="min-h-screen bg-[#f6f8fa] text-slate-900 lg:flex">
      <aside
        className={`${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#123247] text-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#38a3a5] font-display text-lg font-bold">
              +
            </span>
            <span>
              <span className="block font-display text-base font-semibold">GGH Portal</span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-white/55">
                Management system
              </span>
            </span>
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6" aria-label="Admin navigation">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map(({ label, to, icon: Icon }) => {
                  const active =
                    pathname === to || (to !== "/admin/dashboard" && pathname.startsWith(to));
                  return (
                    <Link
                      key={label}
                      to={to}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`${active ? "bg-white/12 font-semibold text-white shadow-sm" : "text-white/65 hover:bg-white/8 hover:text-white"} flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors`}
                    >
                      <Icon
                        className={`size-[18px] ${active ? "text-[#70d2c3]" : "text-white/50"}`}
                      />
                      {label}
                      {label === "Queue" ? (
                        <span className="ml-auto rounded-full bg-[#e76f51] px-2 py-0.5 text-[10px] font-bold text-white">
                          18
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          <div>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Administration
            </p>
            <Link
              to="/admin/settings"
              onClick={() => setOpen(false)}
              aria-current={pathname === "/admin/settings" ? "page" : undefined}
              className={`${pathname === "/admin/settings" ? "bg-white/12 font-semibold text-white" : "text-white/65"} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/8 hover:text-white`}
            >
              <Settings className="size-[18px] text-white/50" />
              Settings
            </Link>
            <Link
              to="/admin/audit-logs"
              onClick={() => setOpen(false)}
              aria-current={pathname === "/admin/audit-logs" ? "page" : undefined}
              className={`${pathname === "/admin/audit-logs" ? "bg-white/12 font-semibold text-white" : "text-white/65"} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/8 hover:text-white`}
            >
              <ShieldCheck className="size-[18px] text-white/50" />
              Audit logs
            </Link>
          </div>
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/8 p-3">
            <span className="grid size-9 place-items-center rounded-full bg-[#70d2c3] text-xs font-bold text-[#123247]">
              AM
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Admin Manager</p>
              <p className="text-xs text-white/50">Hospital administrator</p>
            </div>
            <button
              type="button"
              aria-label="Sign out"
              disabled={isSigningOut}
              className="rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-50"
              onClick={() => void handleSignOut()}
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
      {open ? (
        <button
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close navigation overlay"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-20 items-center justify-between gap-4 px-5 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open navigation"
              >
                <Menu />
              </button>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Garowe General Hospital · Management portal
                </p>
                <h1 className="font-display text-xl font-semibold text-slate-900">{title}</h1>
                <p className="hidden text-xs text-slate-400 sm:block">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="relative rounded-lg p-2.5 text-slate-500 hover:bg-slate-100"
                aria-label="Notifications"
              >
                <Bell className="size-[18px]" />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#e76f51] ring-2 ring-white" />
              </button>
              <button className="hidden items-center gap-2 rounded-lg p-1.5 text-left hover:bg-slate-100 sm:flex">
                <span className="grid size-8 place-items-center rounded-full bg-[#dceff0] text-xs font-bold text-[#22577a]">
                  AM
                </span>
                <span className="hidden text-xs lg:block">
                  <span className="block font-semibold text-slate-700">Admin Manager</span>
                  <span className="block text-slate-400">Administrator</span>
                </span>
                <ChevronDown className="size-4 text-slate-400" />
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] space-y-6 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminSectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#38a3a5]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PatientStatusBadge({ status }: { status: string }) {
  const tone =
    status === "Active" || status === "Completed"
      ? "bg-[#e4f4ed] text-[#2d8a76]"
      : status === "Waiting" || status === "Admitted"
        ? "bg-[#fcf1da] text-[#b57918]"
        : "bg-slate-100 text-slate-500";
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone}`}
    >
      {status}
    </span>
  );
}
