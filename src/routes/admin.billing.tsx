import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight,
  Banknote,
  CreditCard,
  Filter,
  Receipt,
  Search,
  WalletCards,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { formatMoney, invoices } from "@/content/billing";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/billing")({
  head: () => ({ meta: [{ title: "Billing | GGH Management Portal" }] }),
  component: BillingPage,
});
function BillingPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [invoiceList, setInvoiceList] = useState<typeof invoices>([]);
  const [revenueTrend, setRevenueTrend] = useState<{ day: string; value: number }[]>([]);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const rows = useMemo(
    () =>
      invoiceList.filter((item) =>
        `${item.number} ${item.patient} ${item.patientNumber}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [invoiceList, query],
  );
  useEffect(() => {
    let active = true;
    async function loadBilling() {
      const client = getSupabaseClient();
      const [invoicesResult, patientsResult, paymentsResult] = await Promise.all([
        client
          .from("invoices")
          .select("*")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .order("issued_at", { ascending: false }),
        client
          .from("patients")
          .select("id, patient_number, first_name, last_name")
          .eq("hospital_id", GGH_HOSPITAL_ID),
        client
          .from("payments")
          .select("amount, payment_method, received_at")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .order("received_at", { ascending: false }),
      ]);
      if (!active) return;
      const error = invoicesResult.error ?? patientsResult.error ?? paymentsResult.error;
      if (error) {
        setLoadError(error.message);
        return;
      }
      const patientMap = new Map((patientsResult.data ?? []).map((row) => [row.id, row]));
      const mappedInvoices = (invoicesResult.data ?? []).map((row) => {
        const patient = patientMap.get(row.patient_id);
        return {
          id: row.id,
          number: row.invoice_number,
          patientId: row.patient_id,
          patient: patient ? `${patient.first_name} ${patient.last_name}` : row.patient_id,
          patientNumber: patient?.patient_number ?? row.patient_id,
          visit: "—",
          department: "Unassigned",
          date: new Date(row.issued_at).toLocaleDateString(),
          total: Number(row.total),
          paid: Number(row.paid),
          balance: Number(row.due),
          status: row.status,
          createdBy: row.created_by ?? "System",
        };
      });
      setInvoiceList(mappedInvoices);
      setPaymentTotal(
        (paymentsResult.data ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0),
      );
      const grouped = new Map<string, number>();
      for (const payment of paymentsResult.data ?? []) {
        const day = payment.received_at.slice(0, 10);
        grouped.set(day, (grouped.get(day) ?? 0) + Number(payment.amount ?? 0));
      }
      setRevenueTrend(
        Array.from(grouped.entries())
          .slice(-7)
          .map(([day, value]) => ({ day, value })),
      );
    }
    void loadBilling();
    return () => {
      active = false;
    };
  }, []);
  if (pathname !== "/admin/billing") return <Outlet />;
  return (
    <AdminShell
      title="Billing"
      subtitle="Manage hospital charges, invoices, payments, and outstanding balances."
    >
      <AdminSectionHeading
        eyebrow="Financial operations"
        title="Billing"
        description="Today’s cashier workspace and financial overview."
        action={
          <div className="flex gap-2">
            <Button asChild>
              <a href="/admin/billing/invoices/new">
                <Receipt /> Create invoice
              </a>
            </Button>
          </div>
        }
      />
      {loadError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Billing error: {loadError}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Kpi
          label="Revenue today"
          value={formatMoney(paymentTotal)}
          detail="+12.4% vs yesterday"
          tone="success"
        />
        <Kpi
          label="Payments received"
          value={formatMoney(paymentTotal)}
          detail="Recorded payments"
        />
        <Kpi
          label="Outstanding balance"
          value={formatMoney(invoiceList.reduce((sum, invoice) => sum + invoice.balance, 0))}
          detail={`${invoiceList.filter((invoice) => invoice.balance > 0).length} open invoices`}
          tone="warning"
        />
        <Kpi
          label="Unpaid invoices"
          value={String(invoiceList.filter((invoice) => invoice.paid === 0).length)}
          detail="Needs follow-up"
          tone="danger"
        />
        <Kpi
          label="Partially paid"
          value={String(
            invoiceList.filter((invoice) => invoice.paid > 0 && invoice.balance > 0).length,
          )}
          detail="Balance remaining"
          tone="warning"
        />
        <Kpi
          label="Average invoice"
          value={formatMoney(
            invoiceList.length
              ? invoiceList.reduce((sum, invoice) => sum + invoice.total, 0) / invoiceList.length
              : 0,
          )}
          detail="Current invoices"
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Revenue trend</h3>
              <p className="mt-1 text-xs text-slate-500">
                Collected payments by hospital day · demo currency
              </p>
            </div>
            <span className="rounded-full bg-[#e4f4ed] px-2.5 py-1 text-[10px] font-semibold text-[#2d8a76]">
              +12.4%
            </span>
          </div>
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="billingFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#38a3a5" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#38a3a5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={11} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip formatter={(value) => formatMoney(Number(value))} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#38a3a5"
                  strokeWidth={3}
                  fill="url(#billingFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-display text-lg font-semibold">Payments by method</h3>
          <div className="mt-5 space-y-5">
            {[
              ["Cash", 560, Banknote, "#38a3a5"],
              ["Mobile Money", 420, WalletCards, "#22577a"],
              ["Card / transfer", 200, CreditCard, "#e9a23b"],
            ].map(([label, amount, Icon, color]) => (
              <div key={String(label)}>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-slate-600">
                    <span className="grid size-8 place-items-center rounded-lg bg-slate-50">
                      <Icon className="size-4" style={{ color: String(color) }} />
                    </span>
                    {String(label)}
                  </span>
                  <strong>{formatMoney(Number(amount))}</strong>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${Number(amount) / 6}%`, backgroundColor: String(color) }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/admin/billing/payments"
            className="mt-6 inline-block text-xs font-semibold text-[#22577a]"
          >
            View payment history →
          </Link>
        </section>
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div>
            <h3 className="font-display text-lg font-semibold">Recent invoices</h3>
            <p className="mt-1 text-xs text-slate-500">Cashier review queue</p>
          </div>
          <div className="flex gap-2">
            <div className="flex h-9 min-w-[240px] items-center gap-2 rounded-lg border border-slate-200 px-3">
              <Search className="size-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search invoice or patient..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>
            <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600">
              <Filter className="size-4" /> Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-400">
              <tr>
                {["Invoice", "Patient", "Date", "Total", "Paid", "Balance", "Status", "Action"].map(
                  (head) => (
                    <th key={head} className="px-5 py-3 font-semibold">
                      {head}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <a
                      href={`/admin/billing/invoices/${item.id}`}
                      className="font-semibold text-[#22577a] hover:underline"
                    >
                      {item.number}
                    </a>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {item.visit} · {item.department}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{item.patient}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{item.patientNumber}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{item.date}</td>
                  <td className="px-5 py-4 font-semibold">{formatMoney(item.total)}</td>
                  <td className="px-5 py-4 text-[#2d8a76]">{formatMoney(item.paid)}</td>
                  <td className="px-5 py-4 font-semibold text-[#b57918]">
                    {formatMoney(item.balance)}
                  </td>
                  <td className="px-5 py-4">
                    <InvoiceBadge status={item.status} />
                  </td>
                  <td className="px-5 py-4">
                    <a
                      href={`/admin/billing/invoices/${item.id}`}
                      className="font-semibold text-[#22577a]"
                    >
                      Open
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
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
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
      <p
        className={`mt-1 text-[11px] ${tone === "success" ? "text-[#2d8a76]" : tone === "warning" ? "text-[#b57918]" : tone === "danger" ? "text-[#d85c3f]" : "text-slate-400"}`}
      >
        {detail}
      </p>
    </article>
  );
}
export function InvoiceBadge({ status }: { status: string }) {
  const tone =
    status === "Paid"
      ? "bg-[#e4f4ed] text-[#2d8a76]"
      : status === "Partially Paid"
        ? "bg-[#fcf1da] text-[#b57918]"
        : status === "Overdue"
          ? "bg-[#fbe5df] text-[#d85c3f]"
          : "bg-slate-100 text-slate-500";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone}`}>{status}</span>
  );
}
