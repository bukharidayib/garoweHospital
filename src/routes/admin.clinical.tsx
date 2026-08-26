import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FlaskConical,
  HeartPulse,
  Pill,
  Play,
  ShieldAlert,
  Stethoscope,
  Users,
} from "lucide-react";

import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { clinicalQueue } from "@/content/clinical";

export const Route = createFileRoute("/admin/clinical")({
  head: () => ({ meta: [{ title: "Clinical Workspace | GGH Management Portal" }] }),
  component: ClinicalWorkspacePage,
});

function ClinicalWorkspacePage() {
  return (
    <AdminShell
      title="Clinical workspace"
      subtitle="Manage today's consultations and assigned patients."
    >
      <AdminSectionHeading
        eyebrow="Doctor workspace"
        title="Good morning, Dr. Ahmed"
        description="Your assigned patient flow and consultation worklist for today."
        action={
          <Button variant="outline">
            <CalendarDays /> 22 August 2026
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Patients waiting" value="4" detail="2 over 30 min" />
        <Kpi label="Ready for consultation" value="2" detail="Next: GEN-015" tone="info" />
        <Kpi label="In consultation" value="1" detail="Since 09:12" tone="active" />
        <Kpi label="Completed today" value="11" detail="3 more than yesterday" tone="success" />
        <Kpi label="Urgent patients" value="1" detail="Review first" tone="danger" />
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold">My patient queue</h3>
            <p className="mt-1 text-xs text-slate-500">
              Patients assigned to your clinical workspace. Queue and visit states remain separate.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Waiting
            </Button>
            <Button variant="outline" size="sm">
              In progress
            </Button>
            <Button variant="outline" size="sm">
              Completed
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.12em] text-slate-400">
              <tr>
                {[
                  "Queue",
                  "Patient",
                  "Age / gender",
                  "Arrival",
                  "Wait",
                  "Priority",
                  "Vitals",
                  "Status",
                  "Action",
                ].map((head) => (
                  <th key={head} className="px-5 py-3 font-semibold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clinicalQueue.map((row) => (
                <tr key={row.visitId} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-display text-base font-semibold text-[#22577a]">
                    {row.queue}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to="/admin/patients/$patientId"
                      params={{ patientId: row.patientId }}
                      className="flex items-center gap-3"
                    >
                      <span className="grid size-9 place-items-center rounded-full bg-[#dceff0] text-xs font-bold text-[#22577a]">
                        {row.patient
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <span>
                        <span className="block font-semibold text-slate-800">{row.patient}</span>
                        <span className="block text-[11px] text-slate-400">{row.number}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {row.age} · {row.gender}
                  </td>
                  <td className="px-5 py-4 text-slate-500">{row.arrival}</td>
                  <td
                    className={`px-5 py-4 font-semibold ${row.wait > 40 ? "text-[#d85c3f]" : row.wait > 20 ? "text-[#b57918]" : "text-slate-600"}`}
                  >
                    {row.wait} min
                  </td>
                  <td className="px-5 py-4">
                    <PriorityBadge priority={row.priority} />
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 text-slate-600">
                      <HeartPulse className="size-3.5 text-[#38a3a5]" />
                      {row.vitals}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-5 py-4">
                    {row.status === "Ready for Doctor" || row.status === "In Consultation" ? (
                      <Button asChild size="sm">
                        <Link
                          to="/admin/clinical/visits/$visitId/consultation"
                          params={{ visitId: row.visitId }}
                        >
                          <Play />{" "}
                          {row.status === "In Consultation" ? "Resume" : "Start consultation"}
                        </Link>
                      </Button>
                    ) : (
                      <button className="text-xs font-semibold text-[#22577a] hover:underline">
                        Review vitals
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="grid gap-5 lg:grid-cols-3">
        <QuickCard
          icon={FlaskConical}
          title="Lab results ready"
          detail="2 results are ready for review"
          action="Review results"
        />
        <QuickCard
          icon={Pill}
          title="Pending prescriptions"
          detail="3 prescriptions awaiting pharmacy"
          action="View pharmacy"
        />
        <QuickCard
          icon={ShieldAlert}
          title="Safety reminders"
          detail="1 allergy alert requires acknowledgement"
          action="Review alerts"
        />
      </div>
    </AdminShell>
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
      <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
      <p
        className={`mt-1 text-[11px] ${tone === "danger" ? "text-[#d85c3f]" : tone === "success" ? "text-[#2d8a76]" : tone === "info" || tone === "active" ? "text-[#22577a]" : "text-slate-400"}`}
      >
        {detail}
      </p>
    </article>
  );
}
function PriorityBadge({ priority }: { priority: string }) {
  const tone =
    priority === "Urgent" ? "bg-[#fcf1da] text-[#b57918]" : "bg-slate-100 text-slate-500";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone}`}>{priority}</span>
  );
}
function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Ready for Doctor"
      ? "bg-[#dceff0] text-[#22577a]"
      : status === "In Consultation"
        ? "bg-[#e4f4ed] text-[#2d8a76]"
        : "bg-[#fcf1da] text-[#b57918]";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone}`}>{status}</span>
  );
}
function QuickCard({
  icon: Icon,
  title,
  detail,
  action,
}: {
  icon: typeof FlaskConical;
  title: string;
  detail: string;
  action: string;
}) {
  return (
    <section className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
      <span className="grid size-10 place-items-center rounded-xl bg-[#edf5f5] text-[#22577a]">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      </div>
      <button className="text-xs font-semibold text-[#22577a] hover:underline">
        {action} <ArrowRight className="inline size-3" />
      </button>
    </section>
  );
}
