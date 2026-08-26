import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Receipt } from "lucide-react";

import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/billing/invoices/new")({
  head: () => ({ meta: [{ title: "Create Invoice | GGH Management Portal" }] }),
  component: CreateInvoicePage,
});

function CreateInvoicePage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  return (
    <AdminShell
      title="Create invoice"
      subtitle="Prepare a new patient invoice and record its charges."
    >
      <Link
        to="/admin/billing"
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#22577a]"
      >
        <ArrowLeft className="size-3.5" /> Billing
      </Link>
      <AdminSectionHeading
        eyebrow="Financial operations"
        title="Create invoice"
        description="Add the patient, visit reference, and services to be billed."
      />
      {saved ? (
        <div className="rounded-2xl border border-[#b8dfd0] bg-[#edf8f3] p-5 text-sm text-[#2d8a76]">
          Invoice draft created successfully.
        </div>
      ) : (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            const form = new FormData(event.currentTarget);
            const patientId = String(form.get("patientId") ?? "");
            const description = String(form.get("description") ?? "");
            const amount = Number(form.get("amount") ?? 0);
            const status = String(form.get("status") ?? "Draft");
            const { data, error: invoiceError } = await getSupabaseClient()
              .from("invoices")
              .insert({
                hospital_id: GGH_HOSPITAL_ID,
                patient_id: patientId,
                invoice_number: `GGH-INV-${Date.now()}`,
                status,
                subtotal: amount,
                discount: 0,
                total: amount,
                paid: 0,
                due: amount,
              })
              .select("id")
              .single();
            if (invoiceError || !data) {
              setError(invoiceError?.message ?? "Unable to create invoice.");
              return;
            }
            const { error: itemError } = await getSupabaseClient().from("invoice_items").insert({
              invoice_id: data.id,
              description,
              quantity: 1,
              unit_price: amount,
              amount,
            });
            if (itemError) {
              setError(itemError.message);
              return;
            }
            setSaved(true);
          }}
          className="max-w-3xl space-y-5"
        >
          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
            <Field label="Patient UUID" name="patientId" required />
            <Field label="Patient number" placeholder="GGH-PAT-000000" />
            <Field label="Visit reference" placeholder="VIS-00000" />
            <Field
              label="Department"
              as="select"
              options={[
                "General Medicine",
                "Emergency",
                "Pediatrics",
                "Obstetrics & Gynecology",
                "Surgery",
              ]}
            />
            <Field
              label="Service description"
              name="description"
              placeholder="Consultation or hospital service"
              className="sm:col-span-2"
            />
            <Field label="Amount" name="amount" type="number" placeholder="0.00" />
            <Field
              label="Payment status"
              as="select"
              name="status"
              options={["Draft", "Issued", "Paid", "Partially Paid"]}
            />
          </section>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/admin/billing" })}
            >
              Cancel
            </Button>
            <Button type="submit">
              <Receipt /> Create invoice
            </Button>
          </div>
        </form>
      )}
    </AdminShell>
  );
}
function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  as = "input",
  options = [],
  className = "",
}: {
  label: string;
  name?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  as?: "input" | "select";
  options?: string[];
  className?: string;
}) {
  return (
    <label className={`space-y-2 text-sm font-medium text-slate-700 ${className}`}>
      <span>{label}</span>
      {as === "select" ? (
        <select name={name} defaultValue={options[0]} className="field-control" required={required}>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          className="field-control"
          required={required}
        />
      )}
    </label>
  );
}
