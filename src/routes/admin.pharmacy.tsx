import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Package,
  Pill,
  Search,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { AdminSectionHeading, AdminShell, PatientStatusBadge } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { pharmacyActivity } from "@/content/pharmacy";
import type { AppPrescription } from "@/lib/pharmacy-store";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/pharmacy")({
  head: () => ({ meta: [{ title: "Pharmacy | GGH Management Portal" }] }),
  component: PharmacyPage,
});

function PharmacyPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [prescriptionList, setPrescriptionList] = useState<AppPrescription[]>([]);
  const [loadError, setLoadError] = useState("");
  const [stockMetrics, setStockMetrics] = useState({ lowStock: 0, outOfStock: 0, expiringSoon: 0 });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [receiveOpen, setReceiveOpen] = useState(false);
  useEffect(() => {
    let active = true;
    async function loadPrescriptions() {
      const client = getSupabaseClient();
      const [prescriptionsResult, patientsResult, medicinesResult, batchesResult] =
        await Promise.all([
          client
            .from("prescriptions")
            .select("*")
            .eq("hospital_id", GGH_HOSPITAL_ID)
            .order("created_at", { ascending: false }),
          client
            .from("patients")
            .select("id, patient_number, first_name, last_name")
            .eq("hospital_id", GGH_HOSPITAL_ID),
          client
            .from("medicines")
            .select("id,minimum_stock")
            .eq("hospital_id", GGH_HOSPITAL_ID)
            .eq("active", true),
          client
            .from("inventory_batches")
            .select("medicine_id,available_quantity,expiry_date")
            .eq("hospital_id", GGH_HOSPITAL_ID),
        ]);
      if (!active) return;
      const error =
        prescriptionsResult.error ??
        patientsResult.error ??
        medicinesResult.error ??
        batchesResult.error;
      if (error) {
        setLoadError(error.message);
        return;
      }
      const patientMap = new Map((patientsResult.data ?? []).map((row) => [row.id, row]));
      setPrescriptionList(
        (prescriptionsResult.data ?? []).map((row) => {
          const patient = patientMap.get(row.patient_id);
          return {
            id: row.id,
            number: row.prescription_number,
            patientId: row.patient_id,
            patient: patient ? `${patient.first_name} ${patient.last_name}` : row.patient_id,
            patientNumber: patient?.patient_number ?? row.patient_id,
            doctor: row.doctor_id ?? "Unassigned",
            department: row.department_id ?? "Unassigned",
            created: new Date(row.created_at).toLocaleString(),
            priority: row.priority,
            status: row.status,
            medicines: 0,
            items: [],
          };
        }),
      );
      const stock = new Map<string, number>();
      (batchesResult.data ?? []).forEach((batch) =>
        stock.set(
          batch.medicine_id,
          (stock.get(batch.medicine_id) ?? 0) + Number(batch.available_quantity ?? 0),
        ),
      );
      const thirtyDays = Date.now() + 30 * 86400000;
      setStockMetrics({
        lowStock: (medicinesResult.data ?? []).filter((medicine) => {
          const quantity = stock.get(medicine.id) ?? 0;
          return quantity > 0 && quantity <= Number(medicine.minimum_stock ?? 0);
        }).length,
        outOfStock: (medicinesResult.data ?? []).filter(
          (medicine) => (stock.get(medicine.id) ?? 0) <= 0,
        ).length,
        expiringSoon: (batchesResult.data ?? []).filter(
          (batch) =>
            new Date(batch.expiry_date).getTime() <= thirtyDays &&
            new Date(batch.expiry_date).getTime() >= Date.now(),
        ).length,
      });
    }
    void loadPrescriptions();
    return () => {
      active = false;
    };
  }, []);
  const rows = useMemo(
    () =>
      prescriptionList.filter(
        (row) =>
          `${row.number} ${row.patient} ${row.patientNumber} ${row.doctor}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (status === "All statuses" || row.status === status),
      ),
    [prescriptionList, query, status],
  );
  const receivePrescription = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const row = prescriptionList.find((item) => item.status === "Ready to Dispense");
    if (row) {
      const { error } = await getSupabaseClient()
        .from("prescriptions")
        .update({ status: "Dispensed" })
        .eq("id", row.id)
        .eq("hospital_id", GGH_HOSPITAL_ID);
      if (error) {
        setLoadError(error.message);
        return;
      }
      setPrescriptionList((current) =>
        current.map((item) => (item.id === row.id ? { ...item, status: "Dispensed" } : item)),
      );
    }
    setReceiveOpen(false);
  };
  if (pathname !== "/admin/pharmacy") return <Outlet />;
  return (
    <AdminShell
      title="Pharmacy"
      subtitle="Manage prescriptions, dispensing, and medication inventory."
    >
      <AdminSectionHeading
        eyebrow="Pharmacy operations"
        title="Pharmacy"
        description="Move safely from prescription review to recorded dispensing."
        action={
          <Button onClick={() => setReceiveOpen(true)}>
            <ShoppingCart /> Receive prescription
          </Button>
        }
      />
      {loadError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Pharmacy error: {loadError}
        </p>
      ) : null}
      <div className="mb-5 flex flex-wrap gap-3 text-xs font-semibold">
        <a href="/admin/pharmacy/pos" className="rounded-lg bg-[#22577a] px-3 py-2 text-white">
          Open pharmacy POS
        </a>
        <a
          href="/admin/prescriptions"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[#22577a]"
        >
          Prescription module
        </a>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Kpi
          label="Pending prescriptions"
          value={String(
            prescriptionList.filter((row) => ["Sent to Pharmacy", "In Review"].includes(row.status))
              .length,
          )}
          detail="5 urgent"
          tone="warning"
          icon={<Pill />}
        />
        <Kpi
          label="Dispensed today"
          value={String(prescriptionList.filter((row) => row.status === "Dispensed").length)}
          detail="+8 vs yesterday"
          tone="success"
          icon={<ShoppingCart />}
        />
        <Kpi
          label="Partially dispensed"
          value={String(
            prescriptionList.filter((row) => row.status === "Partially Dispensed").length,
          )}
          detail="Follow-up needed"
          tone="info"
          icon={<Package />}
        />
        <Kpi
          label="Low stock"
          value={String(stockMetrics.lowStock)}
          detail="From inventory batches"
          tone="warning"
          icon={<AlertTriangle />}
        />
        <Kpi
          label="Out of stock"
          value={String(stockMetrics.outOfStock)}
          detail="From inventory batches"
          tone="danger"
          icon={<Package />}
        />
        <Kpi
          label="Expiring soon"
          value={String(stockMetrics.expiringSoon)}
          detail="From expiry dates"
          tone="danger"
          icon={<Truck />}
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap gap-2">
              <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3">
                <Search className="size-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search prescription, patient or doctor..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600"
              >
                <option>All statuses</option>
                <option>Sent to Pharmacy</option>
                <option>In Review</option>
                <option>Ready to Dispense</option>
                <option>Partially Dispensed</option>
                <option>Dispensed</option>
                <option>Needs Clarification</option>
              </select>
            </div>
            <a href="/admin/pharmacy/inventory" className="text-xs font-semibold text-[#22577a]">
              Open inventory <ArrowRight className="ml-1 inline size-3.5" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-400">
                <tr>
                  {[
                    "Prescription",
                    "Patient",
                    "Doctor",
                    "Items",
                    "Created",
                    "Priority",
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
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <a
                        href={`/admin/pharmacy/prescriptions/${row.id}`}
                        className="font-semibold text-[#22577a] hover:underline"
                      >
                        {row.number}
                      </a>
                      <p className="mt-1 text-[11px] text-slate-400">{row.department}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="block font-semibold text-slate-800">{row.patient}</span>
                      <span className="text-[11px] text-slate-400">{row.patientNumber}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{row.doctor}</td>
                    <td className="px-5 py-4 text-slate-600">{row.medicines} medicines</td>
                    <td className="px-5 py-4 text-slate-500">{row.created}</td>
                    <td className="px-5 py-4">
                      <Priority value={row.priority} />
                    </td>
                    <td className="px-5 py-4">
                      <PatientStatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`/admin/pharmacy/prescriptions/${row.id}`}
                        className="font-semibold text-[#22577a] hover:underline"
                      >
                        Open prescription
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <div className="p-12 text-center text-sm text-slate-500">
                No pending prescriptions match your filters.
              </div>
            )}
          </div>
        </section>
        <aside className="space-y-5">
          <section className="rounded-2xl border border-[#f0c987] bg-[#fff9eb] p-5">
            <div className="flex gap-3">
              <AlertTriangle className="size-5 shrink-0 text-[#b57918]" />
              <div>
                <h3 className="font-display font-semibold">Stock attention</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  3 medicines are out of stock and 7 batches expire within 30 days.
                </p>
                <Link
                  to="/admin/pharmacy/expiry"
                  className="mt-3 inline-block text-xs font-semibold text-[#b57918]"
                >
                  Review stock alerts →
                </Link>
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-display font-semibold">Recent pharmacy activity</h3>
            <div className="mt-4 space-y-4">
              {pharmacyActivity.map((item) => (
                <div key={item} className="flex gap-3 text-xs">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#38a3a5]" />
                  <span className="leading-relaxed text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
      <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive prescription</DialogTitle>
            <DialogDescription>
              Confirm that a prescription has been received by the pharmacy.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={receivePrescription} className="space-y-4">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Prescription</span>
              <select className="field-control">
                {prescriptionList.map((row) => (
                  <option key={row.id}>
                    {row.number} · {row.patient}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Receiving note</span>
              <textarea
                rows={3}
                className="field-control"
                placeholder="Optional note about the prescription handover"
              />
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReceiveOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Confirm receipt</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
function Kpi({
  label,
  value,
  detail,
  tone,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone: string;
  icon: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    warning: "text-[#b57918] bg-[#fcf1da]",
    success: "text-[#2d8a76] bg-[#e4f4ed]",
    info: "text-[#22577a] bg-[#e6f1f6]",
    danger: "text-[#d85c3f] bg-[#fbe5df]",
  };
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className={`grid size-9 place-items-center rounded-xl ${colors[tone]}`}>{icon}</div>
      <p className="mt-3 text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
      <p className={`mt-1 text-[11px] ${colors[tone]?.split(" ")[0]}`}>{detail}</p>
    </article>
  );
}
function Priority({ value }: { value: string }) {
  const tone =
    value === "STAT"
      ? "bg-[#fbe5df] text-[#d85c3f]"
      : value === "Urgent"
        ? "bg-[#fcf1da] text-[#b57918]"
        : "bg-slate-100 text-slate-500";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone}`}>{value}</span>
  );
}
