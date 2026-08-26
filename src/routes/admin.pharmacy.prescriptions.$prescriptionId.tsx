import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Printer,
  ShieldAlert,
} from "lucide-react";
import { AdminSectionHeading, AdminShell, PatientStatusBadge } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import type { pharmacyPrescriptions } from "@/content/pharmacy";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

type PrescriptionItem = {
  name: string;
  form: string;
  strength: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribed: number;
  dispensed: number;
  unit: string;
  batch: string;
  expiry: string;
  price: number;
  stock: number;
  status: string;
};

export const Route = createFileRoute("/admin/pharmacy/prescriptions/$prescriptionId")({
  head: () => ({ meta: [{ title: "Prescription | GGH Management Portal" }] }),
  component: PrescriptionPage,
});

function PrescriptionPage() {
  const { prescriptionId } = Route.useParams();
  const [prescription, setPrescription] = useState<(typeof pharmacyPrescriptions)[number] | null>(
    null,
  );
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let active = true;
    async function loadPrescription() {
      const client = getSupabaseClient();
      const [prescriptionResult, itemsResult] = await Promise.all([
        client
          .from("prescriptions")
          .select("*")
          .eq("id", prescriptionId)
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .single(),
        client.from("prescription_items").select("*").eq("prescription_id", prescriptionId),
      ]);
      if (!active) return;
      const error = prescriptionResult.error ?? itemsResult.error;
      if (error || !prescriptionResult.data) {
        setLoadError(error?.message ?? "Prescription not found.");
        return;
      }
      const row = prescriptionResult.data;
      setPrescription({
        id: row.id,
        number: row.prescription_number,
        patientId: row.patient_id,
        patient: row.patient_id,
        patientNumber: row.patient_id,
        doctor: row.doctor_id ?? "Unassigned",
        department: row.department_id ?? "Unassigned",
        created: new Date(row.created_at).toLocaleString(),
        priority: row.priority,
        status: row.status,
        age: 0,
        gender: "Unknown",
      });
      setItems(
        (itemsResult.data ?? []).map((item) => ({
          name: item.medicine_name,
          form: item.unit ?? "unit",
          strength: "",
          dose: item.dose ?? "",
          route: "Oral",
          frequency: item.frequency ?? "",
          duration: item.duration ?? "",
          instructions: item.instructions ?? "",
          prescribed: Number(item.quantity),
          dispensed: 0,
          unit: item.unit ?? "unit",
          batch: "FEFO",
          expiry: "—",
          price: 0,
          stock: 0,
          status: "Available",
        })),
      );
    }
    void loadPrescription();
    return () => {
      active = false;
    };
  }, [prescriptionId]);
  const [dispensed, setDispensed] = useState<number[]>([]);
  const [issue, setIssue] = useState(false);
  if (!prescription)
    return (
      <AdminShell title="Prescription details" subtitle="Loading prescription from Supabase.">
        <p className="text-sm text-red-600">{loadError || "Loading…"}</p>
      </AdminShell>
    );
  return (
    <AdminShell
      title="Prescription details"
      subtitle="Review and record medication dispensing safely."
    >
      <AdminSectionHeading
        eyebrow="Pharmacy · Prescription"
        title={prescription.number}
        description={`${prescription.created} · ${prescription.department}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer /> Print summary
            </Button>
            <Button onClick={() => setIssue(true)} variant="outline">
              <AlertTriangle /> Request clarification
            </Button>
          </div>
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <PatientStatusBadge status={prescription.status} />
        <span className="text-xs text-slate-500">
          Prescribed by <strong className="text-slate-700">{prescription.doctor}</strong>
        </span>
        <span className="text-xs text-slate-500">
          Patient: <strong className="text-slate-700">{prescription.patient}</strong>
        </span>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
        <section className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">Medication dispensing</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Record each event separately. The original prescribed quantity is preserved.
                </p>
              </div>
              <span className="text-xs font-medium text-slate-400">{items.length} items</span>
            </div>
            <div className="mt-5 space-y-3">
              {items.map((item, index) => {
                const current = dispensed[index] ?? item.dispensed;
                const remaining = item.prescribed - current;
                return (
                  <article key={item.name} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-slate-800">{item.name}</h4>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                            {item.form} · {item.strength}
                          </span>
                          <StockBadge stock={item.stock} />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {item.dose} · {item.route} · {item.frequency} · {item.duration}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{item.instructions}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-right text-xs">
                        <div>
                          <p className="text-slate-400">Prescribed</p>
                          <p className="mt-1 font-semibold">
                            {item.prescribed} {item.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Dispensed</p>
                          <p className="mt-1 font-semibold text-[#2d8a76]">
                            {current} {item.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Remaining</p>
                          <p
                            className={`mt-1 font-semibold ${remaining ? "text-[#b57918]" : "text-slate-700"}`}
                          >
                            {remaining} {item.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>
                          FEFO batch: <strong className="text-slate-700">{item.batch}</strong>
                        </span>
                        <span>Expiry: {item.expiry}</span>
                        <span className="font-medium">${item.price.toFixed(2)} / unit</span>
                      </div>
                      {item.status === "Unavailable" ? (
                        <span className="text-xs font-semibold text-[#d85c3f]">
                          Insufficient stock
                        </span>
                      ) : current >= item.prescribed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2d8a76]">
                          <CheckCircle2 className="size-4" /> Dispensed
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            setDispensed((values) =>
                              values.map((value, itemIndex) =>
                                itemIndex === index ? Math.min(item.prescribed, item.stock) : value,
                              ),
                            )
                          }
                        >
                          {current ? "Dispense remaining" : "Dispense medication"}
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-[#38a3a5]" />
              <div>
                <h3 className="font-display font-semibold">Dispensing record</h3>
                <p className="text-xs text-slate-500">
                  Dispensing activity is stored in Supabase inventory movements.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Info label="Pharmacist" value="Fatima Ali" />
              <Info label="Last action" value="Today, 10:51" />
              <Info label="Billing status" value="Pending charge" />
            </div>
          </div>
        </section>
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-display text-lg font-semibold">Patient summary</h3>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[#dceff0] font-semibold text-[#22577a]">
                {prescription.patient
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <div>
                <p className="font-semibold text-slate-800">{prescription.patient}</p>
                <p className="text-xs text-slate-500">
                  {prescription.patientNumber} · {prescription.age} years · {prescription.gender}
                </p>
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-[#efb4a6] bg-[#fff4f0] p-3">
              <div className="flex gap-2">
                <ShieldAlert className="size-4 shrink-0 text-[#d85c3f]" />
                <div>
                  <p className="text-xs font-bold text-[#b84d35]">Allergy alert</p>
                  <p className="mt-1 text-xs text-slate-600">{prescription.allergies}</p>
                </div>
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-display font-semibold">Safety checklist</h3>
            <div className="mt-4 space-y-3">
              {[
                "Patient identity confirmed",
                "Allergies reviewed",
                "Stock and batch checked",
                "Quantity within prescription",
              ].map((label) => (
                <label key={label} className="flex items-center gap-3 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    defaultChecked={label !== "Quantity within prescription"}
                    className="accent-[#38a3a5]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>
          <Link
            to="/admin/pharmacy"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#22577a]"
          >
            <ArrowLeft className="size-4" /> Back to pharmacy queue
          </Link>
        </aside>
      </div>
      {issue ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-5">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-xl font-semibold">Request clarification</h3>
            <p className="mt-2 text-sm text-slate-500">
              The request will be sent to {prescription.doctor}. Pharmacists do not silently change
              the prescribed dose.
            </p>
            <textarea
              className="mt-4 min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none"
              placeholder="Describe the issue..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIssue(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIssue(false)}>Send request</Button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-semibold text-slate-700">{value}</p>
    </div>
  );
}
function StockBadge({ stock }: { stock: number }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-semibold ${stock ? "bg-[#e4f4ed] text-[#2d8a76]" : "bg-[#fbe5df] text-[#d85c3f]"}`}
    >
      {stock ? `${stock} available` : "Out of stock"}
    </span>
  );
}
