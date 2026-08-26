import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileSearch,
  RefreshCw,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type AuditEntry } from "@/content/audit";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/audit-logs")({
  head: () => ({ meta: [{ title: "Audit Logs | GGH Management Portal" }] }),
  component: AuditLogsPage,
});

function AuditLogsPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [module, setModule] = useState("All modules");
  const [severity, setSeverity] = useState("All severity");
  const [outcome, setOutcome] = useState("All outcomes");
  const [selected, setSelected] = useState<AuditEntry | null>(null);
  const loadEntries = async () => {
    setIsLoading(true);
    setLoadError("");
    const { data, error } = await getSupabaseClient()
      .from("audit_logs")
      .select(
        "id, actor_id, action, module, target_type, target_id, severity, outcome, metadata, ip_address, created_at",
      )
      .eq("hospital_id", GGH_HOSPITAL_ID)
      .order("created_at", { ascending: false });
    if (error) {
      setLoadError(error.message);
      setEntries([]);
      setIsLoading(false);
      return;
    }
    setLoadError("");
    setEntries(
      (data ?? []).map((row) => ({
        id: row.id,
        occurredAt: new Date(row.created_at).toLocaleString(),
        actor: row.actor_id ? `User ${row.actor_id.slice(0, 8)}` : "System",
        role: row.actor_id ? "Authenticated user" : "System",
        action: row.action,
        module: row.module,
        target: row.target_id ?? row.target_type ?? "—",
        severity:
          row.severity === "critical"
            ? "Critical"
            : row.severity === "warning"
              ? "Warning"
              : "Info",
        outcome:
          row.outcome === "blocked" ? "Blocked" : row.outcome === "failed" ? "Failed" : "Success",
        ipAddress: row.ip_address ?? "—",
        details: JSON.stringify(row.metadata ?? {}),
      })),
    );
    setIsLoading(false);
  };
  useEffect(() => {
    void loadEntries();
  }, []);
  const rows = useMemo(
    () =>
      entries.filter(
        (entry) =>
          `${entry.actor} ${entry.action} ${entry.module} ${entry.target}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (module === "All modules" || entry.module === module) &&
          (severity === "All severity" || entry.severity === severity) &&
          (outcome === "All outcomes" || entry.outcome === outcome),
      ),
    [entries, module, outcome, query, severity],
  );
  const refresh = () => void loadEntries();
  return (
    <AdminShell
      title="Audit logs"
      subtitle="Track security, clinical, operational, and financial activity across the portal."
    >
      <AdminSectionHeading
        eyebrow="Security and compliance"
        title="Audit logs"
        description="Review who did what, where, and when. Sensitive activity should be retained and protected when connected to Supabase."
        action={
          <Button variant="outline" onClick={refresh}>
            <RefreshCw /> Refresh
          </Button>
        }
      />
      {loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load audit logs from Supabase: {loadError}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary icon={<FileSearch />} label="Events in view" value={String(rows.length)} />
        <Summary
          icon={<ShieldAlert />}
          label="Warnings"
          value={String(entries.filter((entry) => entry.severity === "Warning").length)}
          tone="warning"
        />
        <Summary
          icon={<AlertTriangle />}
          label="Critical events"
          value={String(entries.filter((entry) => entry.severity === "Critical").length)}
          tone="danger"
        />
        <Summary
          icon={<XCircle />}
          label="Blocked / failed"
          value={String(entries.filter((entry) => entry.outcome !== "Success").length)}
          tone="danger"
        />
      </div>
      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-end">
          <label className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3">
            <Search className="size-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search actor, action, module, target..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <Filter
            label="Module"
            value={module}
            options={[
              "All modules",
              ...Array.from(new Set(entries.map((entry) => entry.module))).sort(),
            ]}
            onChange={setModule}
          />
          <Filter
            label="Severity"
            value={severity}
            options={["All severity", "Info", "Warning", "Critical"]}
            onChange={setSeverity}
          />
          <Filter
            label="Outcome"
            value={outcome}
            options={["All outcomes", "Success", "Blocked", "Failed"]}
            onChange={setOutcome}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-400">
              <tr>
                {[
                  "Time",
                  "Actor",
                  "Action",
                  "Module / target",
                  "Severity",
                  "Outcome",
                  "Details",
                ].map((head) => (
                  <th key={head} className="px-5 py-3 font-semibold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 whitespace-nowrap text-slate-500">{entry.occurredAt}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{entry.actor}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{entry.role}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700">{entry.action}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-700">{entry.module}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{entry.target}</p>
                  </td>
                  <td className="px-5 py-4">
                    <SeverityBadge value={entry.severity} />
                  </td>
                  <td className="px-5 py-4">
                    <OutcomeBadge value={entry.outcome} />
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setSelected(entry)}
                      className="inline-flex items-center gap-1 font-semibold text-[#22577a] hover:underline"
                    >
                      <Eye className="size-3.5" /> View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading audit events from Supabase…
            </div>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              {entries.length === 0
                ? "No audit events have been recorded in Supabase for this hospital yet."
                : "No audit events match these filters."}
            </div>
          ) : null}
        </div>
      </section>
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#dceff0] bg-[#edf5f5] p-4 text-xs leading-relaxed text-slate-600">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-[#22577a]" />
        <p>
          Audit logs are security-sensitive records. In production, access will be
          permission-controlled, hospital-scoped, append-only, and persisted server-side.
        </p>
      </div>
      <Dialog open={Boolean(selected)} onOpenChange={(nextOpen) => !nextOpen && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.action}</DialogTitle>
                <DialogDescription>
                  {selected.module} · {selected.occurredAt}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Actor">
                  {selected.actor} · {selected.role}
                </Info>
                <Info label="Outcome">
                  <OutcomeBadge value={selected.outcome} />
                </Info>
                <Info label="Target">{selected.target}</Info>
                <Info label="IP address">{selected.ipAddress}</Info>
                <Info label="Severity">
                  <SeverityBadge value={selected.severity} />
                </Info>
                <Info label="Event ID">{selected.id}</Info>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                {selected.details}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
function Filter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-[11px] font-semibold text-slate-500">
      <span className="mb-1 block">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700"
      >
        <option>{options[0]}</option>
        {options.slice(1).map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function Summary({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <span
        className={`grid size-9 place-items-center rounded-xl ${tone === "danger" ? "bg-[#fbe5df] text-[#d85c3f]" : tone === "warning" ? "bg-[#fcf1da] text-[#b57918]" : "bg-[#edf5f5] text-[#22577a]"}`}
      >
        {icon}
      </span>
      <p className="mt-3 text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
    </article>
  );
}
function SeverityBadge({ value }: { value: AuditEntry["severity"] }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${value === "Critical" ? "bg-[#fbe5df] text-[#d85c3f]" : value === "Warning" ? "bg-[#fcf1da] text-[#b57918]" : "bg-[#e4f4ed] text-[#2d8a76]"}`}
    >
      {value}
    </span>
  );
}
function OutcomeBadge({ value }: { value: AuditEntry["outcome"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${value === "Success" ? "bg-[#e4f4ed] text-[#2d8a76]" : "bg-[#fbe5df] text-[#d85c3f]"}`}
    >
      {value === "Success" ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
      {value}
    </span>
  );
}
function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">{label}</p>
      <div className="mt-1 text-sm text-slate-700">{children}</div>
    </div>
  );
}
