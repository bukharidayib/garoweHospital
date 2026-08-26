import { createFileRoute } from "@tanstack/react-router";
import { Printer, Receipt } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { payments, formatMoney } from "@/content/billing";

export const Route = createFileRoute("/admin/billing/receipts")({
  head: () => ({ meta: [{ title: "Receipts | GGH Management Portal" }] }),
  component: ReceiptsPage,
});
function ReceiptsPage() {
  return (
    <AdminShell title="Receipts" subtitle="Print and reprint payment-linked GGH receipts.">
      <AdminSectionHeading
        eyebrow="Payment documents"
        title="Receipts"
        description="A receipt belongs to a payment; reprinting never creates a new payment."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {payments.map((payment) => (
          <article
            key={payment.receipt}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-[#e6f1f6] text-[#22577a]">
                <Receipt className="size-5" />
              </span>
              <span className="text-xs text-slate-400">{payment.date}</span>
            </div>
            <p className="mt-4 text-xs font-semibold text-[#22577a]">{payment.receipt}</p>
            <h3 className="mt-2 font-display text-lg font-semibold">Garowe General Hospital</h3>
            <p className="mt-1 text-xs text-slate-500">
              {payment.patient} · {payment.invoice}
            </p>
            <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="text-[11px] text-slate-400">Amount received</p>
                <p className="mt-1 text-xl font-semibold text-[#2d8a76]">
                  {formatMoney(payment.amount)}
                </p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
                <Printer className="size-4" /> Reprint
              </button>
            </div>
          </article>
        ))}
      </section>
    </AdminShell>
  );
}
