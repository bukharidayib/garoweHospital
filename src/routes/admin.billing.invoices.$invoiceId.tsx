import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Printer, Receipt, ShieldAlert } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { formatMoney, invoices } from "@/content/billing";
import { InvoiceBadge } from "@/routes/admin.billing";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/billing/invoices/$invoiceId")({
  head: () => ({ meta: [{ title: "Payment Details | GGH Management Portal" }] }),
  component: InvoicePage,
});
function InvoicePage() {
  const { invoiceId } = Route.useParams();
  const [invoice, setInvoice] = useState<(typeof invoices)[number] | null>(null);
  const [items, setItems] = useState<
    {
      service: string;
      category: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      total: number;
      source: string;
      reference: string;
    }[]
  >([]);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let active = true;
    async function loadInvoice() {
      const client = getSupabaseClient();
      const [invoiceResult, itemsResult] = await Promise.all([
        client
          .from("invoices")
          .select("*")
          .eq("id", invoiceId)
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .single(),
        client.from("invoice_items").select("*").eq("invoice_id", invoiceId),
      ]);
      if (!active) return;
      const error = invoiceResult.error ?? itemsResult.error;
      if (error || !invoiceResult.data) {
        setLoadError(error?.message ?? "Invoice not found.");
        return;
      }
      const row = invoiceResult.data;
      setInvoice({
        id: row.id,
        number: row.invoice_number,
        patientId: row.patient_id,
        patient: row.patient_id,
        patientNumber: row.patient_id,
        visit: "—",
        department: "Unassigned",
        date: new Date(row.issued_at).toLocaleDateString(),
        total: Number(row.total),
        paid: Number(row.paid),
        balance: Number(row.due),
        status: row.status,
        createdBy: row.created_by ?? "System",
      });
      setItems(
        (itemsResult.data ?? []).map((item) => ({
          service: item.description,
          category: "Service",
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          discount: 0,
          total: Number(item.amount),
          source: "Billing",
          reference: item.id,
        })),
      );
    }
    void loadInvoice();
    return () => {
      active = false;
    };
  }, [invoiceId]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentError, setPaymentError] = useState("");
  const [paymentSaving, setPaymentSaving] = useState(false);
  const recordPayment = async () => {
    if (!invoice || amount <= 0 || amount > invoice.balance) {
      setPaymentError("Enter an amount up to the outstanding balance.");
      return;
    }
    setPaymentSaving(true);
    setPaymentError("");
    const client = getSupabaseClient();
    const payment = await client
      .from("payments")
      .insert({
        hospital_id: GGH_HOSPITAL_ID,
        invoice_id: invoice.id,
        patient_id: invoice.patientId,
        payment_method: paymentMethod,
        amount,
        received_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (payment.error || !payment.data) {
      setPaymentError(payment.error?.message ?? "Unable to record payment.");
      setPaymentSaving(false);
      return;
    }
    const paid = invoice.paid + amount;
    const balance = Math.max(0, invoice.total - paid);
    const nextStatus = balance <= 0 ? "Paid" : paid > 0 ? "Partially Paid" : "Unpaid";
    const update = await client
      .from("invoices")
      .update({ paid, due: balance, status: nextStatus })
      .eq("id", invoice.id)
      .eq("hospital_id", GGH_HOSPITAL_ID);
    if (update.error) {
      setPaymentError(update.error.message);
      setPaymentSaving(false);
      return;
    }
    setInvoice((current) =>
      current ? { ...current, paid, balance, status: nextStatus } : current,
    );
    setAmount(0);
    setPaymentOpen(false);
    setPaymentSaving(false);
  };
  if (!invoice)
    return (
      <AdminShell title="Payment Details" subtitle="Loading payment data from Supabase.">
        <p className="text-sm text-red-600">{loadError || "Loading…"}</p>
      </AdminShell>
    );
  const remaining = Math.max(0, invoice.balance - amount);
  return (
    <AdminShell
      title="Payment Details"
      subtitle="Review financial items, collect payment, and preserve the audit trail."
    >
      <AdminSectionHeading
        eyebrow="Billing · Invoice"
        title={invoice.number}
        description={`${invoice.date} · ${invoice.department}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer /> Print invoice
            </Button>
            <Button
              onClick={() => {
                setPaymentError("");
                setAmount(invoice.balance);
                setPaymentOpen(true);
              }}
              disabled={invoice.balance <= 0}
            >
              <Receipt /> Record payment
            </Button>
          </div>
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <InvoiceBadge status={invoice.status} />
        <span className="text-xs text-slate-500">
          Patient <strong className="text-slate-700">{invoice.patient}</strong>
        </span>
        <span className="text-xs text-slate-500">Created by {invoice.createdBy}</span>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <section className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h3 className="font-display text-lg font-semibold">Invoice items</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Prices are snapshots from the source service at charge creation.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Add item
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-400">
                  <tr>
                    {[
                      "Service / item",
                      "Category",
                      "Qty",
                      "Unit price",
                      "Discount",
                      "Line total",
                      "Source",
                    ].map((head) => (
                      <th key={head} className="px-5 py-3 font-semibold">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.reference}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{item.service}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{item.reference}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{item.category}</td>
                      <td className="px-5 py-4">{item.quantity}</td>
                      <td className="px-5 py-4">{formatMoney(item.unitPrice)}</td>
                      <td className="px-5 py-4 text-slate-500">{formatMoney(item.discount)}</td>
                      <td className="px-5 py-4 font-semibold">{formatMoney(item.total)}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                          {item.source}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-display font-semibold">Financial immutability</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Once issued or paid, this invoice should not be silently edited. Use a void,
              amendment, reversal, or refund record with an authorized reason.
            </p>
            <button className="mt-4 text-xs font-semibold text-[#d85c3f]">Void invoice</button>
          </div>
        </section>
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-display text-lg font-semibold">Patient summary</h3>
            <p className="mt-4 font-semibold text-slate-800">{invoice.patient}</p>
            <p className="mt-1 text-xs text-slate-500">
              {invoice.patientNumber} · Visit {invoice.visit}
            </p>
            <p className="mt-1 text-xs text-slate-500">{invoice.department} · Dr. Ahmed Yusuf</p>
            <Link
              to="/admin/patients/$patientId"
              params={{ patientId: invoice.patientId }}
              className="mt-4 inline-block text-xs font-semibold text-[#22577a]"
            >
              View patient billing history →
            </Link>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-display font-semibold">Payment summary</h3>
            <div className="mt-4 space-y-3 text-xs">
              <Summary label="Subtotal" value={formatMoney(invoice.total)} />
              <Summary label="Discount" value={formatMoney(0)} />
              <Summary label="Total" value={formatMoney(invoice.total)} strong />
              <Summary label="Paid" value={formatMoney(invoice.paid)} tone="success" />
              <div className="border-t border-slate-100 pt-3">
                <Summary
                  label="Balance"
                  value={formatMoney(invoice.balance)}
                  strong
                  tone="warning"
                />
              </div>
            </div>
          </section>
        </aside>
      </div>
      {paymentOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-5">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex gap-3">
              <ShieldAlert className="size-5 text-[#38a3a5]" />
              <div>
                <h3 className="font-display text-xl font-semibold">Record payment</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Outstanding balance: {formatMoney(invoice.balance)}
                </p>
              </div>
            </div>
            <label className="mt-5 block text-xs font-semibold text-slate-600">Amount</label>
            <input
              type="number"
              max={invoice.balance}
              value={amount}
              onChange={(e) => setAmount(Math.min(invoice.balance, Number(e.target.value)))}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
            />
            <p className="mt-2 text-xs text-slate-500">
              Remaining after payment: {formatMoney(remaining)}
            </p>
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="mt-4 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
            >
              <option>Cash</option>
              <option>Sahal Merchant</option>
            </select>
            {paymentError ? <p className="mt-3 text-sm text-red-600">{paymentError}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPaymentOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => void recordPayment()}
                disabled={paymentSaving || amount <= 0 || amount > invoice.balance}
              >
                <CheckCircle2 /> {paymentSaving ? "Recording..." : "Confirm payment"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <Link
        to="/admin/billing/invoices"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#22577a]"
      >
        <ArrowLeft className="size-4" /> Back to invoices
      </Link>
    </AdminShell>
  );
}
function Summary({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "font-semibold text-slate-700" : "text-slate-500"}>{label}</span>
      <span
        className={`${strong ? "font-semibold" : ""} ${tone === "success" ? "text-[#2d8a76]" : tone === "warning" ? "text-[#b57918]" : "text-slate-800"}`}
      >
        {value}
      </span>
    </div>
  );
}
