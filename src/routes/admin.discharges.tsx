import { Link, createFileRoute } from "@tanstack/react-router";
import { FileCheck2, Printer } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { admissions } from "@/content/admissions";

export const Route = createFileRoute("/admin/discharges")({
  head: () => ({ meta: [{ title: "Discharges | GGH Management Portal" }] }),
  component: DischargesPage,
});
function DischargesPage() {
  const rows = admissions.filter((item) => item.status === "Discharge Pending");
  return (
    <AdminShell
      title="Discharges"
      subtitle="Prepare safe discharge summaries and release beds through cleaning."
    >
      <AdminSectionHeading
        eyebrow="Discharge workflow"
        title="Pending discharges"
        description="Clinical summary, medication plan, billing review, then discharge completion."
        action={
          <Button variant="outline">
            <Printer /> Print list
          </Button>
        }
      />
      <section className="rounded-2xl border border-[#f0c987] bg-[#fff9eb] p-5">
        <div className="flex gap-3">
          <FileCheck2 className="size-5 shrink-0 text-[#b57918]" />
          <div>
            <h3 className="font-display font-semibold">{rows.length} discharge ready for review</h3>
            <p className="mt-1 text-xs text-slate-600">
              Discharge completion will move the active bed to Cleaning, not directly to Available.
            </p>
          </div>
        </div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-400">
              <tr>
                {[
                  "Patient",
                  "Admission",
                  "Ward / bed",
                  "Doctor",
                  "Length of stay",
                  "Readiness",
                  "Action",
                ].map((head) => (
                  <th key={head} className="px-5 py-3 font-semibold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{row.patient}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{row.patientNumber}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#22577a]">{row.number}</td>
                  <td className="px-5 py-4">
                    <p className="text-slate-600">{row.ward}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{row.bed}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{row.doctor}</td>
                  <td className="px-5 py-4">{row.los}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[#fcf1da] px-2.5 py-1 text-[10px] font-semibold text-[#b57918]">
                      Billing review
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to="/admin/admissions/$admissionId"
                      params={{ admissionId: row.id }}
                      className="font-semibold text-[#22577a]"
                    >
                      Open record
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <p className="text-xs text-slate-400">
        Finalized summaries should be amended through a controlled, audited process rather than
        silently edited.
      </p>
    </AdminShell>
  );
}
