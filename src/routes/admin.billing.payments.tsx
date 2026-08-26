import { Link, createFileRoute } from "@tanstack/react-router";
import { Filter, Printer } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { formatMoney, payments } from "@/content/billing";

export const Route = createFileRoute("/admin/billing/payments")({
  head: () => ({ meta: [{ title: "Payments | GGH Management Portal" }] }),
  component: PaymentsPage,
});
function PaymentsPage() {
  return (
    <AdminShell
      title="Payments"
      subtitle="Review completed collections and receipt-linked payment records."
    >
      <AdminSectionHeading
        eyebrow="Collections"
        title="Payments"
        description="Each payment has its own readable reference and receipt."
        action={
          <div className="flex gap-2">
            <Button>
              <Printer /> Cashier report
            </Button>
          </div>
        }
      />
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <p className="text-xs text-slate-500">{payments.length} payments recorded today</p>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
            <Filter className="size-4" /> Filters
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-400">
              <tr>
                {[
                  "Payment number",
                  "Receipt",
                  "Patient",
                  "Invoice",
                  "Amount",
                  "Method",
                  "Reference",
                  "Cashier",
                  "Time",
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
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-[#22577a]">{payment.number}</td>
                  <td className="px-5 py-4 text-slate-600">{payment.receipt}</td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{payment.patient}</td>
                  <td className="px-5 py-4 text-slate-500">{payment.invoice}</td>
                  <td className="px-5 py-4 font-semibold text-[#2d8a76]">
                    {formatMoney(payment.amount)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{payment.method}</td>
                  <td className="px-5 py-4 text-slate-500">{payment.reference}</td>
                  <td className="px-5 py-4 text-slate-600">{payment.cashier}</td>
                  <td className="px-5 py-4 text-slate-500">{payment.date}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[#e4f4ed] px-2.5 py-1 text-[10px] font-semibold text-[#2d8a76]">
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="font-semibold text-[#22577a]">Reprint</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <p className="text-xs text-slate-400">
        Reprinting a receipt does not create a new payment. Reversals and refunds should append
        records rather than delete history.
      </p>
      <Link to="/admin/billing" className="text-xs font-semibold text-[#22577a]">
        ← Back to billing
      </Link>
    </AdminShell>
  );
}
