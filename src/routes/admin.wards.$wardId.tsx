import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, BedDouble } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { beds, wards } from "@/content/admissions";

export const Route = createFileRoute("/admin/wards/$wardId")({
  head: () => ({ meta: [{ title: "Ward Details | GGH Management Portal" }] }),
  component: WardPage,
});
function WardPage() {
  const { wardId } = Route.useParams();
  const ward = wards.find((item) => item.id === wardId) ?? wards[0];
  const wardBeds = beds.filter((bed) => bed.ward === ward.name);
  return (
    <AdminShell
      title="Ward details"
      subtitle="Current patients, rooms, and bed status for this ward."
    >
      <AdminSectionHeading
        eyebrow="Ward operations"
        title={ward.name}
        description={`${ward.department} · ${ward.code}`}
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <Metric label="Total beds" value={String(ward.total)} />
        <Metric label="Occupied" value={String(ward.occupied)} />
        <Metric label="Available" value={String(ward.available)} tone="success" />
        <Metric label="Occupancy" value={`${ward.rate}%`} tone="warning" />
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-display text-lg font-semibold">Bed inventory</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {wardBeds.map((bed) => (
            <div key={bed.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <BedDouble className="size-4 text-[#22577a]" />
                {bed.code}
              </div>
              <p className="mt-3 text-[11px] font-semibold text-slate-700">{bed.status}</p>
              {bed.patient ? (
                <p className="mt-2 text-sm font-semibold text-slate-800">{bed.patient}</p>
              ) : (
                <p className="mt-2 text-[11px] text-slate-500">Ready for placement</p>
              )}
            </div>
          ))}
        </div>
      </section>
      <Link
        to="/admin/wards"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#22577a]"
      >
        <ArrowLeft className="size-4" /> Back to wards
      </Link>
    </AdminShell>
  );
}
function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`mt-2 font-display text-2xl font-semibold ${tone === "success" ? "text-[#2d8a76]" : tone === "warning" ? "text-[#b57918]" : "text-slate-800"}`}
      >
        {value}
      </p>
    </article>
  );
}
