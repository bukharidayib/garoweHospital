import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FilePenLine,
  FlaskConical,
  MoreHorizontal,
  Phone,
  Plus,
  ReceiptText,
  ShieldAlert,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { AdminSectionHeading, AdminShell, PatientStatusBadge } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  patientAge,
  patientActivities,
  patientAppointments,
  patientVisits,
  patients,
  type Patient,
} from "@/content/patients";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/patients/$patientId")({
  head: () => ({ meta: [{ title: "Patient Profile | GGH Management Portal" }] }),
  component: PatientProfilePage,
});

function PatientProfilePage() {
  const { patientId } = Route.useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let active = true;
    getSupabaseClient()
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .eq("hospital_id", GGH_HOSPITAL_ID)
      .single()
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data) {
          setLoadError(error?.message ?? "Patient not found.");
          return;
        }
        setPatient({
          id: data.id,
          patientNumber: data.patient_number,
          firstName: data.first_name,
          lastName: data.last_name,
          dateOfBirth: data.date_of_birth ?? "",
          gender: data.gender === "Female" ? "Female" : "Male",
          phone: data.phone ?? "",
          email: data.email ?? undefined,
          nationalId: data.national_id ?? undefined,
          address: data.address ?? "",
          city: data.city ?? "",
          region: data.region ?? "",
          country: data.country ?? "Somalia",
          emergencyContactName: "Not recorded",
          emergencyContactRelationship: "Not recorded",
          emergencyContactPhone: "Not recorded",
          status: data.status,
          admissionStatus: "Outpatient",
          department: "Unassigned",
          lastVisit: "Not recorded",
          registrationDate: data.created_at.slice(0, 10),
          lastVisitType: "—",
        });
      });
    return () => {
      active = false;
    };
  }, [patientId]);
  const [tab, setTab] = useState("Overview");
  const tabs = [
    "Overview",
    "Visits",
    "Appointments",
    "Clinical",
    "Laboratory",
    "Prescriptions",
    "Admissions",
    "Billing",
    "Documents",
    "Activity",
  ];

  if (!patient)
    return (
      <AdminShell title="Patient profile" subtitle="Loading patient from Supabase.">
        <p className="text-sm text-red-600">{loadError || "Loading…"}</p>
      </AdminShell>
    );
  return (
    <AdminShell
      title="Patient profile"
      subtitle="Review demographic information and hospital activity."
    >
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link
          to="/admin/patients"
          className="inline-flex items-center gap-1 font-semibold text-[#22577a] hover:underline"
        >
          <ArrowLeft className="size-3.5" /> Patients
        </Link>
        <span>/</span>
        <span>{patient.patientNumber}</span>
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
        <div className="bg-[#123247] p-6 text-white sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid size-16 place-items-center rounded-full bg-[#70d2c3] font-display text-xl font-semibold text-[#123247]">
                {patient.firstName[0]}
                {patient.lastName[0]}
              </span>
              <div>
                <p className="text-xs font-medium text-white/60">{patient.patientNumber}</p>
                <h2 className="mt-1 font-display text-2xl font-semibold">
                  {patient.firstName} {patient.middleName ? `${patient.middleName} ` : ""}
                  {patient.lastName}
                </h2>
                <p className="mt-1 text-sm text-white/70">
                  {patientAge(patient.dateOfBirth)} years · {patient.gender} · {patient.phone}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="hero" size="sm">
                <Phone /> Call patient
              </Button>
              <Button variant="accent" size="sm">
                <Plus /> New visit
              </Button>
              <Link
                to="/admin/patients/$patientId/edit"
                params={{ patientId: patient.id }}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-white/20 px-3 text-sm font-medium text-white hover:bg-white/10"
              >
                <FilePenLine className="size-4" /> Edit patient
              </Link>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <PatientStatusBadge status={patient.status} />
            <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80">
              {patient.admissionStatus}
            </span>
            {patient.allergiesSummary && patient.allergiesSummary !== "No known allergies" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e76f51]/20 px-2.5 py-1 text-[10px] font-semibold text-[#ffd4c8]">
                <ShieldAlert className="size-3" /> Allergy alert
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 py-2 sm:px-6">
          {tabs.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${tab === item ? "bg-[#edf5f5] text-[#22577a]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>
      {tab === "Overview" ? (
        <Overview patient={patient} />
      ) : tab === "Visits" ? (
        <HistoryTable
          title="Visit history"
          columns={["Visit ID", "Date", "Type", "Department", "Doctor", "Status"]}
          rows={patientVisits.map((row) => [
            row.id,
            row.date,
            row.type,
            row.department,
            row.doctor,
            row.status,
          ])}
        />
      ) : tab === "Appointments" ? (
        <HistoryTable
          title="Appointments"
          columns={["Reference", "Date", "Time", "Department", "Doctor", "Status"]}
          rows={patientAppointments.map((row) => [
            row.id,
            row.date,
            row.time,
            row.department,
            row.doctor,
            row.status,
          ])}
        />
      ) : tab === "Activity" ? (
        <ActivityTab />
      ) : (
        <EmptyTab title={tab} />
      )}
    </AdminShell>
  );
}

function Overview({ patient }: { patient: (typeof patients)[number] }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <InfoCard title="Personal information" icon={UserRound}>
          <dl className="grid gap-5 text-sm sm:grid-cols-2">
            <Info label="Full name" value={`${patient.firstName} ${patient.lastName}`} />
            <Info
              label="Date of birth"
              value={`${patient.dateOfBirth} · ${patientAge(patient.dateOfBirth)} years`}
            />
            <Info label="Gender" value={patient.gender} />
            <Info label="Phone" value={patient.phone} />
            <Info label="Email" value={patient.email ?? "Not recorded"} />
            <Info label="Address" value={`${patient.address}, ${patient.city}`} />
          </dl>
        </InfoCard>
        <InfoCard title="Emergency contact" icon={Phone}>
          <dl className="grid gap-5 text-sm sm:grid-cols-3">
            <Info label="Name" value={patient.emergencyContactName} />
            <Info label="Relationship" value={patient.emergencyContactRelationship} />
            <Info label="Phone" value={patient.emergencyContactPhone} />
          </dl>
        </InfoCard>
      </div>
      <div className="space-y-5">
        <InfoCard title="Medical alerts" icon={ShieldAlert}>
          {patient.allergiesSummary && patient.allergiesSummary !== "No known allergies" ? (
            <div className="flex gap-3 rounded-xl bg-[#fff4e8] p-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#b57918]" />
              <div>
                <p className="text-sm font-semibold text-slate-800">{patient.allergiesSummary}</p>
                <p className="mt-1 text-xs text-slate-600">{patient.medicalAlerts}</p>
              </div>
            </div>
          ) : (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No known allergies recorded.
            </p>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
            <span className="text-slate-500">Blood group</span>
            <span className="font-semibold text-slate-800">
              {patient.bloodGroup ?? "Not recorded"}
            </span>
          </div>
        </InfoCard>
        <InfoCard title="Current status" icon={ClipboardList}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {patient.status === "Admitted" ? "Currently admitted" : "Outpatient care"}
              </p>
              <p className="mt-1 text-xs text-slate-500">Last seen in {patient.department}</p>
            </div>
            <PatientStatusBadge status={patient.status} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full">
              <CalendarDays /> Appointment
            </Button>
            <Button variant="outline" className="w-full">
              <ReceiptText /> Invoice
            </Button>
          </div>
        </InfoCard>
      </div>
    </div>
  );
}
function InfoCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof UserRound;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)] sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-[#edf5f5] text-[#22577a]">
          <Icon className="size-4" />
        </span>
        <h3 className="font-display text-base font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-1 font-medium text-slate-700">{value}</dd>
    </div>
  );
}
function HistoryTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <h3 className="font-display text-lg font-semibold text-slate-900">{title}</h3>
        <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-50">
          <MoreHorizontal className="size-4" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.12em] text-slate-400">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-5 py-3 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row[0]} className="hover:bg-slate-50">
                {row.map((cell, index) => (
                  <td key={`${row[0]}-${index}`} className="px-5 py-4 text-slate-600">
                    {index === row.length - 1 ? <PatientStatusBadge status={cell} /> : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function ActivityTab() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
      <h3 className="font-display text-lg font-semibold">Patient activity</h3>
      <div className="mt-5 space-y-5">
        {patientActivities.map((activity) => (
          <div key={activity.title} className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#edf5f5] text-[#22577a]">
              <ClipboardList className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
              <p className="mt-1 text-xs text-slate-500">{activity.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
function EmptyTab({ title }: { title: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
      <FlaskConical className="mx-auto size-8 text-slate-300" />
      <h3 className="mt-4 font-display text-lg font-semibold text-slate-800">{title} records</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        This tab is prepared for role-aware data loading when the hospital database and permissions
        are connected.
      </p>
    </section>
  );
}
