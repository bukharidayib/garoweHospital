import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { formatMoney, invoices } from "@/content/billing";

export const Route = createFileRoute("/admin/billing/outstanding")({
  head: () => ({ meta: [{ title: "Outstanding Balances | GGH Management Portal" }] }),
  component: OutstandingPage,
});
function OutstandingPage() {
  const rows = invoices.filter((item) => item.balance > 0);
  return (
    <AdminShell
      title="Outstanding balances"
      subtitle="Track unpaid and partially paid invoices with simple aging."
    >
      <AdminSectionHeading
        eyebrow="Accounts receivable"
        title="Outstanding balances"
        description="Use current filters and patient history to follow up responsibly."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Current" value={formatMoney(680)} />
        <Metric label="1–30 days" value={formatMoney(1120)} />
        <Metric label="31–60 days" value={formatMoney(535)} tone="warning" />
        <Metric label="90+ days" value={formatMoney(145)} tone="danger" />
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <div className="flex gap-3">
            <CalendarClock className="size-5 text-[#38a3a5]" />
            <div>
              <h3 className="font-display font-semibold">Open invoices</h3>
              <p className="mt-1 text-xs text-slate-500">
                {rows.length} invoices require payment follow-up.
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-400">
              <tr>
                {[
                  "Patient",
                  "Invoice",
                  "Original amount",
                  "Paid",
                  "Balance",
                  "Age",
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
              {rows.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{item.patient}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{item.patientNumber}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#22577a]">{item.number}</td>
                  <td className="px-5 py-4">{formatMoney(item.total)}</td>
                  <td className="px-5 py-4 text-[#2d8a76]">{formatMoney(item.paid)}</td>
                  <td className="px-5 py-4 font-semibold text-[#b57918]">
                    {formatMoney(item.balance)}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {index === 0 ? "Today" : index === 1 ? "Today" : "4 days"}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[#fcf1da] px-2.5 py-1 text-[10px] font-semibold text-[#b57918]">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to="/admin/billing/invoices/$invoiceId"
                      params={{ invoiceId: item.id }}
                      className="font-semibold text-[#22577a]"
                    >
                      Open invoice
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Link
        to="/admin/billing"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#22577a]"
      >
        <ArrowLeft className="size-4" /> Back to billing
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
        className={`mt-2 font-display text-2xl font-semibold ${tone === "warning" ? "text-[#b57918]" : tone === "danger" ? "text-[#d85c3f]" : "text-slate-800"}`}
      >
        {value}
      </p>
    </article>
  );
}
