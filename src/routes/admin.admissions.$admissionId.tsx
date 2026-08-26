import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, BedDouble, FileText, MoveRight, Printer, ShieldAlert } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { admissions } from "@/content/admissions";

export const Route = createFileRoute("/admin/admissions/$admissionId")({
  head: () => ({ meta: [{ title: "Inpatient Record | GGH Management Portal" }] }),
  component: InpatientPage,
});
function InpatientPage() {
  const { admissionId } = Route.useParams();
  const admission = admissions.find((item) => item.id === admissionId) ?? admissions[0];
  const [transferOpen, setTransferOpen] = useState(false);
  return (
    <AdminShell
      title="Inpatient record"
      subtitle="Coordinate placement, clinical context, transfers, and discharge preparation."
    >
      <AdminSectionHeading
        eyebrow="Admissions · Inpatient"
        title={admission.patient}
        description={`${admission.number} · ${admission.patientNumber}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setTransferOpen(true)}>
              <MoveRight /> Transfer
            </Button>
            <Button>
              <FileText /> Prepare discharge
            </Button>
          </div>
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-[#e4f4ed] px-2.5 py-1 text-[10px] font-semibold text-[#2d8a76]">
          {admission.status}
        </span>
        <span className="text-xs text-slate-500">
          {admission.ward} · {admission.room} ·{" "}
          <strong className="text-slate-700">{admission.bed}</strong>
        </span>
        <span className="text-xs text-slate-500">
          Length of stay: <strong className="text-slate-700">{admission.los}</strong>
        </span>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <section className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
              {[
                "Overview",
                "Clinical",
                "Medications",
                "Laboratory",
                "Nursing",
                "Transfers",
                "Billing",
                "Discharge",
              ].map((tab, index) => (
                <button
                  key={tab}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${index === 0 ? "bg-[#e6f1f6] text-[#22577a]" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Info label="Admission reason" value={admission.diagnosis} />
              <Info label="Attending doctor" value={admission.doctor} />
              <Info label="Department" value={admission.ward} />
              <Info label="Admission date" value={admission.admittedAt} />
              <Info
                label="Current placement"
                value={`${admission.ward} · ${admission.room} · ${admission.bed}`}
              />
              <Info label="Billing status" value="Review before discharge" />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">Recent inpatient activity</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Placement and care events remain append-only after database integration.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Add nursing note
              </Button>
            </div>
            <div className="mt-5 space-y-4">
              {[
                "Vitals recorded · Nurse Amina · 12 min ago",
                "Medication round completed · 1 hr ago",
                "Admission placement confirmed · Yesterday",
              ].map((event) => (
                <div key={event} className="flex gap-3 text-xs">
                  <span className="mt-1 size-2 rounded-full bg-[#38a3a5]" />
                  <span className="text-slate-600">{event}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-display font-semibold">Discharge readiness</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Check label="Clinical summary" />
              <Check label="Medication plan" />
              <Check label="Billing review" />
            </div>
          </div>
        </section>
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-display text-lg font-semibold">Placement summary</h3>
            <div className="mt-4 rounded-xl bg-[#f4f9fc] p-4">
              <div className="flex items-center gap-3">
                <BedDouble className="size-5 text-[#22577a]" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">{admission.bed}</p>
                  <p className="text-[11px] text-slate-500">
                    {admission.ward} · {admission.room}
                  </p>
                </div>
              </div>
            </div>
            <Link
              to="/admin/bed-board"
              className="mt-4 inline-block text-xs font-semibold text-[#22577a]"
            >
              View bed board →
            </Link>
          </section>
          <section className="rounded-2xl border border-[#efc0b4] bg-[#fff6f3] p-5">
            <div className="flex gap-3">
              <ShieldAlert className="size-5 shrink-0 text-[#d85c3f]" />
              <div>
                <h3 className="font-display font-semibold">Privacy boundary</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Placement staff see only the clinical context needed for safe inpatient
                  operations.
                </p>
              </div>
            </div>
          </section>
          <Link
            to="/admin/admissions"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#22577a]"
          >
            <ArrowLeft className="size-4" /> Back to admissions
          </Link>
        </aside>
      </div>
      {transferOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-5">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-xl font-semibold">Transfer patient</h3>
            <p className="mt-1 text-xs text-slate-500">
              Current placement: {admission.bed}. Destination availability will be rechecked
              transactionally.
            </p>
            <select className="mt-5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm">
              <option>Medical Ward · MED-02-B · Available</option>
              <option>Pediatric Ward · PED-01-C · Available</option>
            </select>
            <textarea
              className="mt-3 min-h-24 w-full rounded-lg border border-slate-200 p-3 text-sm"
              placeholder="Transfer reason and notes..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTransferOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setTransferOpen(false)}>Request transfer</Button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="mt-4">
        <Button variant="outline">
          <Printer /> Print inpatient summary
        </Button>
      </div>
    </AdminShell>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-semibold text-slate-700">{value}</p>
    </div>
  );
}
function Check({ label }: { label: string }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-slate-100 p-3 text-xs text-slate-600">
      <input type="checkbox" className="accent-[#38a3a5]" />
      {label}
    </label>
  );
}
