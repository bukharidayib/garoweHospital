import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, FilePlus2, Pill } from "lucide-react";
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
import type { AppPrescriptionItem } from "@/lib/pharmacy-store";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/prescriptions")({
  head: () => ({ meta: [{ title: "Prescriptions | GGH Management Portal" }] }),
  component: PrescriptionsPage,
});

function PrescriptionsPage() {
  type PrescriptionRow = {
    id: string;
    number: string;
    patientId: string;
    patient: string;
    patientNumber: string;
    doctor: string;
    department: string;
    items: AppPrescriptionItem[];
    medicines: number;
    created: string;
    status: string;
  };
  const [rows, setRows] = useState<PrescriptionRow[]>([]);
  const [patients, setPatients] = useState<{ id: string; number: string; name: string }[]>([]);
  const [medicines, setMedicines] = useState<{ id: string; name: string }[]>([]);
  const [loadError, setLoadError] = useState("");
  const [open, setOpen] = useState(false);
  const [viewPrescription, setViewPrescription] = useState<(typeof rows)[number] | null>(null);
  const [patientId, setPatientId] = useState("");
  const [medicine, setMedicine] = useState("");
  const [items, setItems] = useState<AppPrescriptionItem[]>([]);

  useEffect(() => {
    let active = true;
    async function loadPrescriptions() {
      const client = getSupabaseClient();
      const [prescriptionsResult, patientsResult, medicinesResult] = await Promise.all([
        client
          .from("prescriptions")
          .select("*")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .order("created_at", { ascending: false }),
        client
          .from("patients")
          .select("id, patient_number, first_name, last_name")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .order("created_at", { ascending: false }),
        client
          .from("medicines")
          .select("id, name")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .eq("active", true)
          .order("name"),
      ]);
      if (!active) return;
      const error = prescriptionsResult.error ?? patientsResult.error ?? medicinesResult.error;
      if (error) {
        setLoadError(error.message);
        return;
      }
      setPatients(
        (patientsResult.data ?? []).map((row) => ({
          id: row.id,
          number: row.patient_number,
          name: `${row.first_name} ${row.last_name}`,
        })),
      );
      setMedicines(medicinesResult.data ?? []);
      setPatientId(patientsResult.data?.[0]?.id ?? "");
      setMedicine(medicinesResult.data?.[0]?.name ?? "");
      setRows(
        (prescriptionsResult.data ?? []).map((row) => ({
          id: row.id,
          number: row.prescription_number,
          patientId: row.patient_id,
          patient: row.patient_id,
          patientNumber: row.patient_id,
          doctor: row.doctor_id ?? "Unassigned",
          department: row.department_id ?? "Unassigned",
          items: [],
          medicines: 0,
          created: new Date(row.created_at).toLocaleString(),
          status: row.status,
        })),
      );
    }
    void loadPrescriptions();
    return () => {
      active = false;
    };
  }, []);
  const addItem = () =>
    setItems((current) => [
      ...current,
      {
        medicine,
        dose: "1 unit",
        frequency: "Once daily",
        duration: "5 days",
        quantity: 5,
        unit: "units",
      },
    ]);
  const createPrescription = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!patientId || items.length === 0) return;
    const patient = patients.find((item) => item.id === patientId);
    if (!patient) return;
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("prescriptions")
      .insert({
        hospital_id: GGH_HOSPITAL_ID,
        patient_id: patient.id,
        prescription_number: `GGH-RX-${Date.now()}`,
        priority: "Routine",
        status: "Sent to Pharmacy",
      })
      .select("*")
      .single();
    if (error || !data) {
      setLoadError(error?.message ?? "Unable to save prescription.");
      return;
    }
    const { error: itemError } = await client.from("prescription_items").insert(
      items.map((item) => ({
        prescription_id: data.id,
        medicine_name: item.medicine,
        dose: item.dose,
        frequency: item.frequency,
        duration: item.duration,
        quantity: item.quantity,
        unit: item.unit,
      })),
    );
    if (itemError) {
      setLoadError(itemError.message);
      return;
    }
    setRows((current) => [
      {
        id: data.id,
        number: data.prescription_number,
        patientId: patient.id,
        patient: patient.name,
        patientNumber: patient.number,
        doctor: "Unassigned",
        department: "Unassigned",
        items,
        medicines: items.length,
        created: new Date(data.created_at).toLocaleString(),
        status: data.status,
      },
      ...current,
    ]);
    setItems([]);
    setOpen(false);
  };

  return (
    <AdminShell
      title="Prescriptions"
      subtitle="Doctors send medication orders directly to the pharmacy."
    >
      <AdminSectionHeading
        eyebrow="Clinical prescribing"
        title="Prescription module"
        description="Create, review, and track prescriptions shared with Pharmacy."
        action={
          <Button onClick={() => setOpen(true)}>
            <FilePlus2 /> New prescription
          </Button>
        }
      />
      {loadError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Prescription error: {loadError}
        </p>
      ) : null}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <h3 className="font-display text-lg font-semibold">All prescriptions</h3>
          <p className="mt-1 text-xs text-slate-500">
            New orders appear in the Pharmacy queue automatically.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-400">
              <tr>
                {[
                  "Prescription",
                  "Patient",
                  "Doctor",
                  "Medicines",
                  "Created",
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
                  <td className="px-5 py-4 font-semibold text-[#22577a]">
                    {row.number}
                    <p className="mt-1 text-[11px] font-normal text-slate-400">{row.department}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold">{row.patient}</span>
                    <span className="mt-1 block text-[11px] text-slate-400">
                      {row.patientNumber}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{row.doctor}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {row.items.length || row.medicines} medicines
                  </td>
                  <td className="px-5 py-4 text-slate-500">{row.created}</td>
                  <td className="px-5 py-4">
                    <PatientStatusBadge status={row.status} />
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setViewPrescription(row)}
                      className="inline-flex items-center gap-1 font-semibold text-[#22577a] hover:underline"
                    >
                      <Eye className="size-3.5" /> View prescription
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New prescription</DialogTitle>
            <DialogDescription>
              Select a patient and add the medicines the doctor is prescribing.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createPrescription} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Patient
              <select
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
                className="field-control mt-2"
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.patientNumber} · {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Medicine
              <select
                value={medicine}
                onChange={(event) => setMedicine(event.target.value)}
                className="field-control mt-2"
              >
                {medicines.map((item) => (
                  <option key={item.code}>{item.name}</option>
                ))}
              </select>
            </label>
            <Button type="button" variant="outline" onClick={addItem}>
              <Pill /> Add medicine
            </Button>
            {items.map((item, index) => (
              <div
                key={`${item.medicine}-${index}`}
                className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600"
              >
                {item.medicine} · {item.dose} · {item.frequency} · {item.duration}
              </div>
            ))}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={items.length === 0}>
                Send to pharmacy
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(viewPrescription)}
        onOpenChange={(nextOpen) => !nextOpen && setViewPrescription(null)}
      >
        <DialogContent className="max-w-2xl">
          {viewPrescription ? (
            <>
              <DialogHeader>
                <DialogTitle>{viewPrescription.number}</DialogTitle>
                <DialogDescription>
                  Patient prescription details and medication instructions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Patient">
                  {viewPrescription.patient} · {viewPrescription.patientNumber}
                </Info>
                <Info label="Doctor">{viewPrescription.doctor}</Info>
                <Info label="Department">{viewPrescription.department}</Info>
                <Info label="Status">
                  <PatientStatusBadge status={viewPrescription.status} />
                </Info>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="font-display font-semibold">Prescribed medicines</h3>
                <div className="mt-3 space-y-2">
                  {viewPrescription.items.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Medication item details are not available for this historical prescription.
                    </p>
                  ) : (
                    viewPrescription.items.map((item, index) => (
                      <div
                        key={`${item.medicine}-${index}`}
                        className="flex flex-wrap justify-between gap-2 rounded-lg bg-slate-50 p-3 text-xs"
                      >
                        <span className="font-semibold text-slate-800">{item.medicine}</span>
                        <span className="text-slate-600">
                          {item.dose} · {item.frequency} · {item.duration} · Qty {item.quantity}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewPrescription(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">{label}</p>
      <div className="mt-1 text-sm text-slate-700">{children}</div>
    </div>
  );
}
