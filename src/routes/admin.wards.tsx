import { Link, createFileRoute } from "@tanstack/react-router";
import { BedDouble, Plus } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { wards } from "@/content/admissions";

export const Route = createFileRoute("/admin/wards")({
  head: () => ({ meta: [{ title: "Wards | GGH Management Portal" }] }),
  component: WardsPage,
});
function WardsPage() {
  return (
    <AdminShell
      title="Wards"
      subtitle="Configure wards and monitor capacity from actual bed inventory."
    >
      <AdminSectionHeading
        eyebrow="Capacity configuration"
        title="Wards"
        description="Available counts should always be derived from bed statuses."
        action={
          <Button>
            <Plus /> Add ward
          </Button>
        }
      />
      <section className="grid gap-4 md:grid-cols-2">
        {wards.map((ward) => (
          <article key={ward.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#38a3a5]">
                  {ward.code}
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold">{ward.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{ward.department}</p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-[#e6f1f6] text-[#22577a]">
                <BedDouble className="size-5" />
              </span>
            </div>
            <div className="mt-5 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-[#38a3a5]" style={{ width: `${ward.rate}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[11px]">
              <div>
                <p className="font-semibold text-slate-800">{ward.total}</p>
                <p className="text-slate-400">Total</p>
              </div>
              <div>
                <p className="font-semibold text-[#22577a]">{ward.occupied}</p>
                <p className="text-slate-400">Occupied</p>
              </div>
              <div>
                <p className="font-semibold text-[#2d8a76]">{ward.available}</p>
                <p className="text-slate-400">Available</p>
              </div>
              <div>
                <p className="font-semibold text-[#b57918]">{ward.cleaning}</p>
                <p className="text-slate-400">Cleaning</p>
              </div>
            </div>
            <Link
              to="/admin/wards/$wardId"
              params={{ wardId: ward.id }}
              className="mt-5 inline-block text-xs font-semibold text-[#22577a]"
            >
              Open ward details →
            </Link>
          </article>
        ))}
      </section>
    </AdminShell>
  );
}
