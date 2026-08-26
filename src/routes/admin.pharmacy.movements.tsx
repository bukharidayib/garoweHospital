import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Filter } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { stockMovements } from "@/content/pharmacy";

export const Route = createFileRoute("/admin/pharmacy/movements")({
  head: () => ({ meta: [{ title: "Stock Movements | GGH Management Portal" }] }),
  component: MovementsPage,
});
function MovementsPage() {
  return (
    <AdminShell
      title="Stock movements"
      subtitle="Every receipt, dispense, adjustment, and write-off remains traceable."
    >
      <AdminSectionHeading
        eyebrow="Inventory ledger"
        title="Stock movements"
        description="A read-only activity ledger for pharmacy stock changes."
        action={
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600">
            <Filter className="size-4" /> Filter movements
          </button>
        }
      />
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-400">
              <tr>
                {[
                  "Medicine / batch",
                  "Movement",
                  "Quantity",
                  "Previous",
                  "New",
                  "Reference",
                  "Performed by",
                  "Time",
                ].map((head) => (
                  <th key={head} className="px-5 py-3 font-semibold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockMovements.map((movement) => (
                <tr key={movement.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{movement.medicine}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{movement.batch}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                      {movement.quantity < 0 ? (
                        <ArrowDownLeft className="size-4 text-[#d85c3f]" />
                      ) : (
                        <ArrowUpRight className="size-4 text-[#2d8a76]" />
                      )}
                      {movement.type}
                    </span>
                  </td>
                  <td
                    className={`px-5 py-4 font-semibold ${movement.quantity < 0 ? "text-[#d85c3f]" : "text-[#2d8a76]"}`}
                  >
                    {movement.quantity > 0 ? "+" : ""}
                    {movement.quantity}
                  </td>
                  <td className="px-5 py-4 text-slate-500">{movement.previous}</td>
                  <td className="px-5 py-4 font-semibold">{movement.next}</td>
                  <td className="px-5 py-4 text-slate-600">{movement.reference}</td>
                  <td className="px-5 py-4 text-slate-600">{movement.user}</td>
                  <td className="px-5 py-4 text-slate-500">{movement.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <p className="text-xs text-slate-400">
        Stock deduction, dispensing events, prescription updates, and billing should be committed
        transactionally when DB integration is added.
      </p>
    </AdminShell>
  );
}
