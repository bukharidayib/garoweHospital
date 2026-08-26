import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Plus, Search } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { formatMoney, invoices } from "@/content/billing";
import { InvoiceBadge } from "@/routes/admin.billing";

export const Route = createFileRoute("/admin/billing/invoices")({
  head: () => ({ meta: [{ title: "Invoices | GGH Management Portal" }] }),
  component: InvoicesPage,
});
function InvoicesPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname !== "/admin/billing/invoices") return <Outlet />;
  return (
    <AdminShell title="Invoices" subtitle="Manage patient invoices and hospital service charges.">
      <AdminSectionHeading
        eyebrow="Billing workspace"
        title="Invoices"
        description="Draft, issue, and review patient balances."
        action={
          <div className="flex gap-2">
            <Button asChild>
              <a href="/admin/billing/invoices/new">
                <Plus /> Create invoice
              </a>
            </Button>
          </div>
        }
      />
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div className="flex h-10 min-w-[280px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3">
            <Search className="size-4 text-slate-400" />
            <input
              placeholder="Search invoice, patient, visit or phone..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <Link to="/admin/billing/outstanding" className="text-xs font-semibold text-[#22577a]">
            View outstanding <ArrowRight className="ml-1 inline size-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-400">
              <tr>
                {[
                  "Invoice number",
                  "Patient",
                  "Visit / department",
                  "Date",
                  "Total",
                  "Paid",
                  "Balance",
                  "Status",
                  "Created by",
                  "Action",
                ].map((head) => (
                  <th key={head} className="px-5 py-3 font-semibold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <a
                      href={`/admin/billing/invoices/${item.id}`}
                      className="font-semibold text-[#22577a]"
                    >
                      {item.number}
                    </a>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{item.patient}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{item.patientNumber}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-slate-600">{item.visit}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{item.department}</p>
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
                  <td className="px-5 py-4 text-slate-500">{item.createdBy}</td>
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
