import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  LayoutGrid,
  Clock3,
  HeartPulse,
  List,
  Search,
  Siren,
  UserRound,
} from "lucide-react";

import { AdminSectionHeading, AdminShell, PatientStatusBadge } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { queueRows, type QueueStatus } from "@/content/appointments";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/queue")({
  head: () => ({ meta: [{ title: "Patient Queue | GGH Management Portal" }] }),
  component: QueuePage,
});

function QueuePage() {
  const [queueList, setQueueList] = useState<typeof queueRows>([]);
  const [loadError, setLoadError] = useState("");
  const [view, setView] = useState<"list" | "board">("list");
  const [department, setDepartment] = useState("All departments");
  const [priority, setPriority] = useState("All priorities");
  const [query, setQuery] = useState("");
  const [viewVisit, setViewVisit] = useState<(typeof queueRows)[number] | null>(null);
  useEffect(() => {
    let active = true;
    async function loadQueue() {
      const client = getSupabaseClient();
      const [visitsResult, patientsResult] = await Promise.all([
        client
          .from("visits")
          .select("*")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .order("created_at", { ascending: true }),
        client
          .from("patients")
          .select("id, patient_number, first_name, last_name")
          .eq("hospital_id", GGH_HOSPITAL_ID),
      ]);
      if (!active) return;
      const error = visitsResult.error ?? patientsResult.error;
      if (error) {
        setLoadError(error.message);
        return;
      }
      const patientMap = new Map((patientsResult.data ?? []).map((row) => [row.id, row]));
      setQueueList(
        (visitsResult.data ?? []).map((row, index) => {
          const patient = patientMap.get(row.patient_id);
          return {
            queue: `Q-${String(index + 1).padStart(3, "0")}`,
            patientId: row.patient_id,
            patient: patient ? `${patient.first_name} ${patient.last_name}` : row.patient_id,
            patientNumber: patient?.patient_number ?? row.patient_id,
            arrival: new Date(row.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            department: row.department_id ?? "Unassigned",
            doctor: row.doctor_id ?? "Unassigned",
            priority: "Normal",
            wait: Math.max(
              0,
              Math.round((Date.now() - new Date(row.created_at).getTime()) / 60000),
            ),
            status: row.status as QueueStatus,
            id: row.id,
          } as (typeof queueRows)[number] & { id: string };
        }),
      );
    }
    void loadQueue();
    return () => {
      active = false;
    };
  }, []);
  const rows = useMemo(
    () =>
      queueList.filter(
        (row) =>
          `${row.patient} ${row.patientNumber} ${row.queue}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (department === "All departments" || row.department === department) &&
          (priority === "All priorities" || row.priority === priority),
      ),
    [department, priority, query, queueList],
  );
  const advanceQueue = async (queue: string) => {
    const currentRow = queueList.find((row) => row.queue === queue);
    if (currentRow?.status === "In Consultation" || currentRow?.status === "Completed") {
      setViewVisit(currentRow);
      return;
    }
    const nextStatus =
      currentRow.status === "Waiting"
        ? "Vitals"
        : currentRow.status === "Vitals"
          ? "Ready for Doctor"
          : currentRow.status === "Ready for Doctor"
            ? "In Consultation"
            : "Completed";
    const { error } = await getSupabaseClient()
      .from("visits")
      .update({ status: nextStatus })
      .eq("id", (currentRow as typeof currentRow & { id: string }).id)
      .eq("hospital_id", GGH_HOSPITAL_ID);
    if (error) {
      setLoadError(error.message);
      return;
    }
    setQueueList((current) =>
      current.map((row) => {
        if (row.queue !== queue) return row;
        return { ...row, status: nextStatus };
      }),
    );
  };
  return (
    <AdminShell
      title="Patient queue"
      subtitle="Monitor and manage active patient flow across the hospital."
    >
      <AdminSectionHeading
        eyebrow="Live operations"
        title="Patient queue"
        description="Queue numbers reset daily and are assigned by department."
        action={
          <div className="flex gap-2">
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setView("list")}
              aria-label="List view"
            >
              <List />
            </Button>
            <Button
              variant={view === "board" ? "default" : "outline"}
              size="icon"
              onClick={() => setView("board")}
              aria-label="Board view"
            >
              <LayoutGrid />
            </Button>
          </div>
        }
      />
      {loadError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Queue error: {loadError}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi
          label="Waiting"
          value={String(queueList.filter((row) => row.status === "Waiting").length)}
          detail="Across all departments"
        />
        <Kpi
          label="Average wait"
          value={`${queueList.length ? Math.round(queueList.reduce((sum, row) => sum + row.wait, 0) / queueList.length) : 0} min`}
          detail="Updated just now"
        />
        <Kpi
          label="Ready for doctor"
          value={String(queueList.filter((row) => row.status === "Ready for Doctor").length)}
          detail="Needs attention"
          tone="info"
        />
        <Kpi
          label="In consultation"
          value={String(queueList.filter((row) => row.status === "In Consultation").length)}
          detail="Active visits"
          tone="success"
        />
        <Kpi
          label="Urgent"
          value={String(queueList.filter((row) => row.priority !== "Normal").length)}
          detail="Priority patients"
          tone="danger"
        />
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-wrap gap-2">
            <div className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3">
              <Search className="size-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search queue or patient..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none"
            >
              <option>All departments</option>
              <option>General Medicine</option>
              <option>Pediatrics</option>
              <option>Emergency</option>
              <option>Obstetrics & Gynecology</option>
            </select>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none"
            >
              <option>All priorities</option>
              <option>Normal</option>
              <option>Urgent</option>
              <option>Emergency</option>
            </select>
          </div>
          <span className="text-xs font-medium text-[#2d8a76]">● Updated just now</span>
        </div>
      </section>
      {view === "list" ? (
        <QueueTable rows={rows} onAction={advanceQueue} />
      ) : (
        <QueueBoard rows={rows} onAction={advanceQueue} />
      )}
      <Dialog open={Boolean(viewVisit)} onOpenChange={(open) => !open && setViewVisit(null)}>
        <DialogContent>
          {viewVisit ? (
            <>
              <DialogHeader>
                <DialogTitle>View visit · {viewVisit.queue}</DialogTitle>
                <DialogDescription>
                  {viewVisit.patient} · {viewVisit.department}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Detail label="Doctor">{viewVisit.doctor}</Detail>
                <Detail label="Status">
                  <PatientStatusBadge status={viewVisit.status} />
                </Detail>
                <Detail label="Arrival">{viewVisit.arrival}</Detail>
                <Detail label="Wait">{viewVisit.wait} minutes</Detail>
                <Detail label="Priority">{viewVisit.priority}</Detail>
                <Detail label="Patient number">{viewVisit.patientNumber}</Detail>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewVisit(null)}>
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
function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">{label}</p>
      <div className="mt-1 text-sm text-slate-700">{children}</div>
    </div>
  );
}
function QueueTable({
  rows,
  onAction,
}: {
  rows: typeof queueRows;
  onAction: (queue: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
      <div className="border-b border-slate-100 p-5">
        <h3 className="font-display text-lg font-semibold">Active patient queue</h3>
        <p className="mt-1 text-xs text-slate-500">
          Use the next action to move a patient through the operational workflow.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.12em] text-slate-400">
            <tr>
              {[
                "Queue",
                "Patient",
                "Arrival",
                "Department",
                "Doctor",
                "Priority",
                "Wait",
                "Status",
                "Next action",
              ].map((header) => (
                <th key={header} className="px-5 py-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.queue} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-display text-base font-semibold text-[#22577a]">
                  {row.queue}
                </td>
                <td className="px-5 py-4">
                  <Link
                    to="/admin/patients/$patientId"
                    params={{ patientId: row.patientId }}
                    className="font-semibold text-slate-800 hover:text-[#22577a]"
                  >
                    {row.patient}
                  </Link>
                  <p className="mt-1 text-[11px] text-slate-400">{row.patientNumber}</p>
                </td>
                <td className="px-5 py-4 text-slate-500">{row.arrival}</td>
                <td className="px-5 py-4 text-slate-600">{row.department}</td>
                <td className="px-5 py-4 text-slate-600">{row.doctor}</td>
                <td className="px-5 py-4">
                  <PriorityBadge priority={row.priority} />
                </td>
                <td
                  className={`px-5 py-4 font-semibold ${row.wait > 40 ? "text-[#d85c3f]" : row.wait > 20 ? "text-[#b57918]" : "text-slate-600"}`}
                >
                  {row.wait} min
                </td>
                <td className="px-5 py-4">
                  <PatientStatusBadge status={row.status} />
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => onAction(row.queue)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#22577a] hover:underline"
                  >
                    {row.status === "Waiting"
                      ? "Send to vitals"
                      : row.status === "Vitals"
                        ? "Mark ready"
                        : row.status === "Ready for Doctor"
                          ? "Start consultation"
                          : "View visit"}
                    <ArrowRight className="size-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No patients waiting in this filtered queue.
          </div>
        ) : null}
      </div>
    </section>
  );
}
function QueueBoard({
  rows,
  onAction,
}: {
  rows: typeof queueRows;
  onAction: (queue: string) => void;
}) {
  const columns = ["Waiting", "Vitals", "Ready for Doctor", "In Consultation"] as const;
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {columns.map((column) => (
        <section
          key={column}
          className="min-h-[280px] rounded-2xl border border-slate-200 bg-slate-50 p-3"
        >
          <div className="flex items-center justify-between px-2 pb-3">
            <h3 className="text-sm font-semibold text-slate-700">{column}</h3>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">
              {rows.filter((row) => row.status === column).length}
            </span>
          </div>
          <div className="space-y-3">
            {rows
              .filter((row) => row.status === column)
              .map((row) => (
                <article
                  key={row.queue}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-display text-base font-semibold text-[#22577a]">
                      {row.queue}
                    </span>
                    <PriorityBadge priority={row.priority} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-800">{row.patient}</p>
                  <p className="mt-1 text-xs text-slate-500">{row.department}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <span
                      className={row.wait > 40 ? "font-semibold text-[#d85c3f]" : "text-slate-500"}
                    >
                      <Clock3 className="mr-1 inline size-3" />
                      {row.wait} min
                    </span>
                    <button
                      onClick={() => onAction(row.queue)}
                      className="font-semibold text-[#22577a]"
                    >
                      Next <ArrowRight className="inline size-3" />
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
function PriorityBadge({ priority }: { priority: string }) {
  const tone =
    priority === "Emergency"
      ? "bg-[#fbe5df] text-[#d85c3f]"
      : priority === "Urgent"
        ? "bg-[#fcf1da] text-[#b57918]"
        : "bg-slate-100 text-slate-500";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone}`}
    >
      {priority === "Emergency" ? (
        <Siren className="size-3" />
      ) : priority === "Urgent" ? (
        <HeartPulse className="size-3" />
      ) : null}
      {priority}
    </span>
  );
}
function Kpi({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-3 font-display text-2xl font-semibold text-slate-900">{value}</p>
      <p
        className={`mt-1 text-[11px] ${tone === "danger" ? "text-[#d85c3f]" : tone === "success" ? "text-[#2d8a76]" : tone === "info" ? "text-[#22577a]" : "text-slate-400"}`}
      >
        {detail}
      </p>
    </article>
  );
}
