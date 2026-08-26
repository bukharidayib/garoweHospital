import { useEffect, useMemo, useState } from "react";
import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { Plus, Search, Users } from "lucide-react";

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
import { patientAge, type Patient } from "@/content/patients";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/patients")({
  head: () => ({ meta: [{ title: "Patients | GGH Management Portal" }] }),
  component: PatientsPage,
});

function PatientsPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [patientRows, setPatientRows] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [patientMetrics, setPatientMetrics] = useState({
    newToday: 0,
    returningToday: 0,
    admitted: 0,
  });
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("All genders");
  const [status, setStatus] = useState("All statuses");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [registerError, setRegisterError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    department: "General Medicine",
    address: "",
  });

  useEffect(() => {
    let active = true;
    async function loadPatients() {
      setLoading(true);
      const client = getSupabaseClient();
      const [patientsResult, visitsResult] = await Promise.all([
        client
          .from("patients")
          .select("*")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .order("created_at", { ascending: false }),
        client.from("visits").select("patient_id,created_at").eq("hospital_id", GGH_HOSPITAL_ID),
      ]);
      const { data, error } = patientsResult;
      if (!active) return;
      if (error) {
        setLoadError(error.message);
        setPatientRows([]);
      } else {
        setLoadError("");
        const today = new Date().toISOString().slice(0, 10);
        const todayPatients = (data ?? []).filter((row) => row.created_at.slice(0, 10) === today);
        const todayVisitPatients = new Set(
          (visitsResult.data ?? [])
            .filter((row) => row.created_at.slice(0, 10) === today)
            .map((row) => row.patient_id),
        );
        setPatientMetrics({
          newToday: todayPatients.length,
          returningToday: Math.max(0, todayVisitPatients.size - todayPatients.length),
          admitted: (data ?? []).filter((row) => row.status === "Admitted").length,
        });
        setPatientRows(
          (data ?? []).map((row) => ({
            id: row.id,
            patientNumber: row.patient_number,
            firstName: row.first_name,
            middleName: row.middle_name ?? undefined,
            lastName: row.last_name,
            dateOfBirth: row.date_of_birth ?? "",
            gender: row.gender === "Female" ? "Female" : "Male",
            phone: row.phone ?? "Not recorded",
            email: row.email ?? undefined,
            nationalId: row.national_id ?? undefined,
            address: row.address ?? "Not recorded",
            city: row.city ?? "Garowe",
            region: row.region ?? "Nugaal, Puntland",
            country: row.country ?? "Somalia",
            emergencyContactName: "Not recorded",
            emergencyContactRelationship: "Not recorded",
            emergencyContactPhone: "Not recorded",
            bloodGroup: row.blood_group ?? undefined,
            allergiesSummary: row.allergies_summary ?? undefined,
            medicalAlerts: row.medical_alerts ?? undefined,
            status: (row.status as Patient["status"]) ?? "Active",
            admissionStatus: "Outpatient",
            department: "Not assigned",
            lastVisit: "Not yet visited",
            registrationDate: row.created_at.slice(0, 10),
            lastVisitType: "New registration",
          })),
        );
      }
      setLoading(false);
    }
    void loadPatients();
    return () => {
      active = false;
    };
  }, []);
  const filtered = useMemo(
    () =>
      patientRows.filter((patient) => {
        const text =
          `${patient.firstName} ${patient.lastName} ${patient.patientNumber} ${patient.phone}`.toLowerCase();
        return (
          text.includes(search.toLowerCase()) &&
          (gender === "All genders" || patient.gender === gender) &&
          (status === "All statuses" || patient.status === status)
        );
      }),
    [gender, patientRows, search, status],
  );

  function updateForm(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function registerPatient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.firstName || !form.lastName || !form.dateOfBirth || !form.gender || !form.phone) {
      setRegisterError("Complete all required fields before saving the patient.");
      return;
    }

    const { data, error } = await getSupabaseClient()
      .from("patients")
      .insert({
        hospital_id: GGH_HOSPITAL_ID,
        patient_number: `GGH-PAT-${Date.now().toString().slice(-6)}`,
        first_name: form.firstName,
        last_name: form.lastName,
        date_of_birth: form.dateOfBirth,
        gender: form.gender,
        phone: form.phone,
        address: form.address || null,
        city: "Garowe",
        region: "Nugaal, Puntland",
        country: "Somalia",
        status: "Active",
      })
      .select("*")
      .single();
    if (error || !data) {
      setRegisterError(error?.message ?? "Unable to save patient.");
      return;
    }
    const newPatient: Patient = {
      id: data.id,
      patientNumber: data.patient_number,
      firstName: data.first_name,
      lastName: data.last_name,
      dateOfBirth: data.date_of_birth ?? form.dateOfBirth,
      gender: data.gender === "Female" ? "Female" : "Male",
      phone: data.phone ?? form.phone,
      address: data.address ?? "Not recorded",
      city: data.city ?? "Garowe",
      region: data.region ?? "Nugaal, Puntland",
      country: data.country ?? "Somalia",
      emergencyContactName: "Not recorded",
      emergencyContactRelationship: "Not recorded",
      emergencyContactPhone: "Not recorded",
      status: "Active",
      admissionStatus: "Outpatient",
      department: "Not assigned",
      lastVisit: "Not yet visited",
      registrationDate: data.created_at.slice(0, 10),
      lastVisitType: "New registration",
    };
    setPatientRows((current) => [newPatient, ...current]);
    setRegisterOpen(false);
    setRegisterError("");
    setForm({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      phone: "",
      department: "General Medicine",
      address: "",
    });
  }

  if (pathname !== "/admin/patients") return <Outlet />;
  return (
    <AdminShell title="Patients" subtitle="Manage patient records and hospital visit history.">
      <AdminSectionHeading
        eyebrow="Patient management"
        title="Patients"
        description="Search, register and manage patient records across Garowe General Hospital."
        action={
          <div className="flex gap-2">
            <Button onClick={() => setRegisterOpen(true)}>
              <Plus /> Register patient
            </Button>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total patients"
          value={String(patientRows.length)}
          detail={loading ? "Loading from Supabase" : "Records in Supabase"}
          icon="Total"
        />
        <SummaryCard
          label="New today"
          value={String(patientMetrics.newToday)}
          detail="Registered today"
          icon="New"
        />
        <SummaryCard
          label="Returning today"
          value={String(patientMetrics.returningToday)}
          detail="Based on today's visits"
          icon="Return"
        />
        <SummaryCard
          label="Currently admitted"
          value={String(patientMetrics.admitted)}
          detail="Active admitted records"
          icon="Admit"
        />
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap gap-2">
            <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3">
              <Search className="size-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, patient number or phone..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <select
              value={gender}
              onChange={(event) => setGender(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none"
            >
              <option>All genders</option>
              <option>Female</option>
              <option>Male</option>
            </select>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none"
            >
              <option>All statuses</option>
              <option>Active</option>
              <option>Waiting</option>
              <option>Admitted</option>
              <option>Archived</option>
            </select>
          </div>
          <span className="text-xs text-slate-400">{filtered.length} results</span>
        </div>
        {loadError ? (
          <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
            Unable to load patients: {loadError}
          </p>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.12em] text-slate-400">
              <tr>
                {[
                  "Patient",
                  "Phone",
                  "Age / gender",
                  "Last visit",
                  "Department",
                  "Status",
                  "Registered",
                  "",
                ].map((header) => (
                  <th key={header} className="px-5 py-3 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((patient) => (
                <tr key={patient.id} className="transition-colors hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setViewPatient(patient)}
                      className="flex items-center gap-3"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#dceff0] text-xs font-bold text-[#22577a]">
                        {patient.firstName[0]}
                        {patient.lastName[0]}
                      </span>
                      <span>
                        <span className="block font-semibold text-slate-800 hover:text-[#22577a]">
                          {patient.firstName} {patient.lastName}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-slate-400">
                          {patient.patientNumber}
                        </span>
                      </span>
                    </button>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{patient.phone}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {patientAge(patient.dateOfBirth)} · {patient.gender === "Female" ? "F" : "M"}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{patient.lastVisit}</td>
                  <td className="px-5 py-4 text-slate-600">{patient.department}</td>
                  <td className="px-5 py-4">
                    <PatientStatusBadge status={patient.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-500">{patient.registrationDate}</td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setViewPatient(patient)}
                      className="font-semibold text-[#22577a] hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">Loading patients…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto size-8 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No patients found</p>
              <p className="mt-1 text-xs text-slate-500">
                Try another search or clear your filters.
              </p>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {filtered.length} of {patientRows.length} patients
          </span>
          <div className="flex gap-1">
            <button className="rounded-md border border-slate-200 px-3 py-1.5 hover:bg-slate-50">
              Previous
            </button>
            <button className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700">
              1
            </button>
            <button className="rounded-md border border-slate-200 px-3 py-1.5 hover:bg-slate-50">
              2
            </button>
            <button className="rounded-md border border-slate-200 px-3 py-1.5 hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      </section>
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register patient</DialogTitle>
            <DialogDescription>
              Create a patient record with the information required at reception.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={registerPatient} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="First name *"
                value={form.firstName}
                onChange={(value) => updateForm("firstName", value)}
                required
              />
              <FormField
                label="Last name *"
                value={form.lastName}
                onChange={(value) => updateForm("lastName", value)}
                required
              />
              <FormField
                label="Date of birth *"
                type="date"
                value={form.dateOfBirth}
                onChange={(value) => updateForm("dateOfBirth", value)}
                required
              />
              <FormField
                label="Phone number *"
                value={form.phone}
                onChange={(value) => updateForm("phone", value)}
                required
              />
              <FormField
                label="Gender *"
                as="select"
                value={form.gender}
                onChange={(value) => updateForm("gender", value)}
                options={["Female", "Male"]}
                required
              />
              <FormField
                label="Address"
                value={form.address}
                onChange={(value) => updateForm("address", value)}
                className="sm:col-span-2"
              />
            </div>
            {registerError ? <p className="text-sm text-red-600">{registerError}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRegisterOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Register patient</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(viewPatient)} onOpenChange={(open) => !open && setViewPatient(null)}>
        <DialogContent className="max-w-2xl">
          {viewPatient ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {viewPatient.firstName} {viewPatient.lastName}
                </DialogTitle>
                <DialogDescription>
                  {viewPatient.patientNumber} · {viewPatient.department}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 sm:grid-cols-2">
                <Detail label="Status">
                  <PatientStatusBadge status={viewPatient.status} />
                </Detail>
                <Detail label="Age / gender">
                  {patientAge(viewPatient.dateOfBirth)} years · {viewPatient.gender}
                </Detail>
                <Detail label="Phone">{viewPatient.phone}</Detail>
                <Detail label="Email">{viewPatient.email || "Not recorded"}</Detail>
                <Detail label="Last visit">{viewPatient.lastVisit}</Detail>
                <Detail label="Admission">{viewPatient.admissionStatus}</Detail>
                <Detail label="Address">
                  {viewPatient.address}, {viewPatient.city}
                </Detail>
                <Detail label="Registered">{viewPatient.registrationDate}</Detail>
                <Detail label="Emergency contact">
                  {viewPatient.emergencyContactName} · {viewPatient.emergencyContactPhone}
                </Detail>
                <Detail label="Allergies / alerts">
                  {viewPatient.allergiesSummary || "None recorded"}
                  {viewPatient.medicalAlerts ? ` · ${viewPatient.medicalAlerts}` : ""}
                </Detail>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewPatient(null)}>
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

function FormField({
  label,
  value,
  onChange,
  type = "text",
  required,
  as = "input",
  options = [],
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  as?: "input" | "select";
  options?: string[];
  className?: string;
}) {
  return (
    <label className={`space-y-2 text-sm font-medium text-slate-700 ${className}`}>
      <span>{label}</span>
      {as === "select" ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          className="field-control"
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          className="field-control"
        />
      )}
    </label>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <div className="mt-1 text-sm text-slate-700">{children}</div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <span className="grid size-9 place-items-center rounded-xl bg-[#edf5f5] text-[#22577a]">
          <Users className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] text-slate-400">{detail}</p>
    </article>
  );
}
