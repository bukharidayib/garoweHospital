import { createFileRoute } from "@tanstack/react-router";
import { Edit3, Plus } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { billingServices, formatMoney } from "@/content/billing";

export const Route = createFileRoute("/admin/billing/services")({
  head: () => ({ meta: [{ title: "Billing Services | GGH Management Portal" }] }),
  component: ServicesPage,
});
function ServicesPage() {
  return (
    <AdminShell
      title="Billable services"
      subtitle="Configure centralized service pricing for clinical and operational modules."
    >
      <AdminSectionHeading
        eyebrow="Billing configuration"
        title="Service catalog"
        description="Invoice items keep a snapshot of this price when created."
        action={
          <Button>
            <Plus /> Add service
          </Button>
        }
      />
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-400">
              <tr>
                {[
                  "Code",
                  "Service name",
                  "Category",
                  "Department",
                  "Default price",
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
              {billingServices.map((service) => (
                <tr key={service.code} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-[#22577a]">{service.code}</td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{service.name}</td>
                  <td className="px-5 py-4 text-slate-600">{service.category}</td>
                  <td className="px-5 py-4 text-slate-600">{service.department}</td>
                  <td className="px-5 py-4 font-semibold">{formatMoney(service.price)}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[#e4f4ed] px-2.5 py-1 text-[10px] font-semibold text-[#2d8a76]">
                      Active
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      className="rounded-lg border border-slate-200 p-2 text-slate-500"
                      aria-label={`Edit ${service.name}`}
                    >
                      <Edit3 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <p className="text-xs text-slate-400">
        Automatic sources include Clinical, Laboratory, Pharmacy, Admissions, and Procedures.
        Duplicate prevention will use source references and idempotent billing events.
      </p>
    </AdminShell>
  );
}
