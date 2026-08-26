import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, FilePlus2, Pencil, Pill, Trash2 } from "lucide-react";
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
  const [patients, setPatients] = useState<
    {
      id: string;
      number: string;
      name: string;
      patientNumber: string;
      firstName: string;
      lastName: string;
    }[]
  >([]);
  const [medicines, setMedicines] = useState<{ id: string; name: string }[]>([]);
  const [loadError, setLoadError] = useState("");
  const [open, setOpen] = useState(false);
  const [viewPrescription, setViewPrescription] = useState<(typeof rows)[number] | null>(null);
  const [editPrescription, setEditPrescription] = useState<(typeof rows)[number] | null>(null);
  const [deletePrescription, setDeletePrescription] = useState<(typeof rows)[number] | null>(null);
  const [editPatientId, setEditPatientId] = useState("");
  const [editStatus, setEditStatus] = useState("Sent to Pharmacy");
  const [actionError, setActionError] = useState("");
  const [savingAction, setSavingAction] = useState(false);
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
          patientNumber: row.patient_number,
          firstName: row.first_name,
          lastName: row.last_name,
        })),
      );
      setMedicines(medicinesResult.data ?? []);
      setPatientId(patientsResult.data?.[0]?.id ?? "");
      setMedicine(medicinesResult.data?.[0]?.id ?? "");
      const prescriptionIds = (prescriptionsResult.data ?? []).map(
        (prescription) => prescription.id,
      );
      const itemsResult = prescriptionIds.length
        ? await client.from("prescription_items").select("*").in("prescription_id", prescriptionIds)
        : { data: [], error: null };
      if (itemsResult.error) {
        setLoadError(itemsResult.error.message);
        return;
      }
      const patientMap = new Map(
        (patientsResult.data ?? []).map((patient) => [patient.id, patient]),
      );
      const itemsByPrescription = new Map<string, AppPrescriptionItem[]>();
      for (const item of itemsResult.data ?? []) {
        const current = itemsByPrescription.get(item.prescription_id) ?? [];
        current.push({
          medicine: item.medicine_name,
          dose: item.dose,
          frequency: item.frequency,
          duration: item.duration,
          quantity: item.quantity,
          unit: item.unit,
        });
        itemsByPrescription.set(item.prescription_id, current);
      }
      setRows(
        (prescriptionsResult.data ?? []).map((row) => ({
          id: row.id,
          number: row.prescription_number,
          patientId: row.patient_id,
          patient: patientMap.get(row.patient_id)
            ? `${patientMap.get(row.patient_id)?.first_name} ${patientMap.get(row.patient_id)?.last_name}`
            : "Unknown patient",
          patientNumber: patientMap.get(row.patient_id)?.patient_number ?? row.patient_id,
          doctor: row.doctor_id ?? "Unassigned",
          department: row.department_id ?? "Unassigned",
          items: itemsByPrescription.get(row.id) ?? [],
          medicines: (itemsByPrescription.get(row.id) ?? []).length,
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
  const addItem = () => {
    const selectedMedicine = medicines.find((item) => item.id === medicine);
    if (!selectedMedicine) return;
    setItems((current) => [
      ...current,
      {
        medicine: selectedMedicine.name,
        dose: "1 unit",
        frequency: "Once daily",
        duration: "5 days",
        quantity: 5,
        unit: "units",
      },
    ]);
  };
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
  const openEdit = (row: (typeof rows)[number]) => {
    setEditPrescription(row);
    setEditPatientId(row.patientId);
    setEditStatus(row.status);
    setActionError("");
  };
  const updatePrescription = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editPrescription || !editPatientId) return;
    setSavingAction(true);
    const { data, error } = await getSupabaseClient()
      .from("prescriptions")
      .update({ patient_id: editPatientId, status: editStatus })
      .eq("id", editPrescription.id)
      .eq("hospital_id", GGH_HOSPITAL_ID)
      .select("*")
      .single();
    if (error || !data) {
      setActionError(error?.message ?? "Unable to update prescription.");
      setSavingAction(false);
      return;
    }
    const patient = patients.find((item) => item.id === editPatientId);
    setRows((current) =>
      current.map((row) =>
        row.id === data.id
          ? {
              ...row,
              patientId: data.patient_id,
              patient: patient?.name ?? "Unknown patient",
              patientNumber: patient?.number ?? data.patient_id,
              status: data.status,
            }
          : row,
      ),
    );
    setEditPrescription(null);
    setSavingAction(false);
  };
  const confirmDelete = async () => {
    if (!deletePrescription) return;
    setSavingAction(true);
    const client = getSupabaseClient();
    const itemsResult = await client
      .from("prescription_items")
      .delete()
      .eq("prescription_id", deletePrescription.id);
    if (itemsResult.error) {
      setActionError(itemsResult.error.message);
      setSavingAction(false);
      return;
    }
    const { error } = await client
      .from("prescriptions")
      .delete()
      .eq("id", deletePrescription.id)
      .eq("hospital_id", GGH_HOSPITAL_ID);
    if (error) {
      setActionError(error.message);
      setSavingAction(false);
      return;
    }
    setRows((current) => current.filter((row) => row.id !== deletePrescription.id));
    setDeletePrescription(null);
    setSavingAction(false);
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
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewPrescription(row)}
                        className="inline-flex items-center gap-1 font-semibold text-[#22577a] hover:underline"
                      >
                        <Eye className="size-3.5" /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="text-slate-500 hover:text-[#22577a]"
                        aria-label="Update prescription"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeletePrescription(row);
                          setActionError("");
                        }}
                        className="text-red-600"
                        aria-label="Delete prescription"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
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
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
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
        open={Boolean(editPrescription)}
        onOpenChange={(nextOpen) => !nextOpen && setEditPrescription(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update prescription</DialogTitle>
            <DialogDescription>{editPrescription?.number}</DialogDescription>
          </DialogHeader>
          <form onSubmit={updatePrescription} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Patient
              <select
                value={editPatientId}
                onChange={(event) => setEditPatientId(event.target.value)}
                className="field-control mt-2"
                required
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.number} · {patient.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Status
              <select
                value={editStatus}
                onChange={(event) => setEditStatus(event.target.value)}
                className="field-control mt-2"
              >
                <option>Sent to Pharmacy</option>
                <option>In Review</option>
                <option>Ready to Dispense</option>
                <option>Dispensed</option>
                <option>Cancelled</option>
              </select>
            </label>
            {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditPrescription(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingAction}>
                {savingAction ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(deletePrescription)}
        onOpenChange={(nextOpen) => !nextOpen && setDeletePrescription(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete prescription?</DialogTitle>
            <DialogDescription>
              This permanently removes {deletePrescription?.number} and its medicine items from
              Supabase.
            </DialogDescription>
          </DialogHeader>
          {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePrescription(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={savingAction}
            >
              {savingAction ? "Deleting..." : "Delete prescription"}
            </Button>
          </DialogFooter>
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
