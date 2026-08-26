import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarCheck, CheckCircle2, Search, UserPlus } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { appointmentDoctors } from "@/content/appointments";
import { patients } from "@/content/patients";

export const Route = createFileRoute("/admin/appointments/new")({
  head: () => ({ meta: [{ title: "New Appointment | GGH Management Portal" }] }),
  component: NewAppointmentPage,
});

function NewAppointmentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [patient, setPatient] = useState("");
  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState("");
  const [saved, setSaved] = useState(false);
  const selectedPatient = patients.find((item) => item.id === patient);

  return (
    <AdminShell
      title="New appointment"
      subtitle="Schedule a planned visit for an existing patient."
    >
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link
          to="/admin/appointments"
          className="inline-flex items-center gap-1 font-semibold text-[#22577a] hover:underline"
        >
          <ArrowLeft className="size-3.5" /> Appointments
        </Link>
        <span>/</span>
        <span>New appointment</span>
      </div>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#38a3a5]">
            Booking workflow
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">Create an appointment</h2>
          <p className="mt-1 text-sm text-slate-500">Book a consultation in four clear steps.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <ol className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
            {["Select patient", "Care team", "Date & time", "Review & confirm"].map(
              (label, index) => (
                <li
                  key={label}
                  className={`flex items-center gap-3 rounded-xl p-3 text-sm ${step === index + 1 ? "bg-[#edf5f5] font-semibold text-[#22577a]" : "text-slate-500"}`}
                >
                  <span
                    className={`grid size-7 place-items-center rounded-full text-xs font-bold ${step === index + 1 ? "bg-[#22577a] text-white" : "bg-slate-100"}`}
                  >
                    {index + 1}
                  </span>
                  {label}
                </li>
              ),
            )}
          </ol>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)] sm:p-8">
            {step === 1 ? (
              <div className="space-y-6">
                <StepTitle
                  number="1"
                  title="Select a patient"
                  detail="Appointments must be linked to an existing patient record."
                />
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                  <Search className="size-4 text-slate-400" />
                  <input
                    placeholder="Search name or patient number..."
                    className="w-full text-sm outline-none"
                  />
                </div>
                <div className="grid gap-2">
                  {patients.slice(0, 5).map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setPatient(item.id)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left ${patient === item.id ? "border-[#38a3a5] bg-[#edf5f5]" : "border-slate-200 hover:bg-slate-50"}`}
                    >
                      <span className="grid size-9 place-items-center rounded-full bg-[#dceff0] text-xs font-bold text-[#22577a]">
                        {item.firstName[0]}
                        {item.lastName[0]}
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">
                          {item.firstName} {item.lastName}
                        </span>
                        <span className="block text-xs text-slate-400">
                          {item.patientNumber} · {item.phone}
                        </span>
                      </span>
                      {patient === item.id ? (
                        <CheckCircle2 className="size-5 text-[#2d8a76]" />
                      ) : null}
                    </button>
                  ))}
                </div>
                <Link
                  to="/admin/patients/new"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#22577a] hover:underline"
                >
                  <UserPlus className="size-4" /> Register a new patient
                </Link>
              </div>
            ) : null}
            {step === 2 ? (
              <div className="space-y-6">
                <StepTitle
                  number="2"
                  title="Choose the care team"
                  detail="Departments and doctors will come from hospital configuration."
                />
                <Field label="Department">
                  <select
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    className="field-control"
                  >
                    <option value="">Select a department</option>
                    <option>General Medicine</option>
                    <option>Pediatrics</option>
                    <option>Emergency</option>
                    <option>Obstetrics & Gynecology</option>
                    <option>Surgery</option>
                  </select>
                </Field>
                <div className="grid gap-3">
                  {appointmentDoctors.map((item) => (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() => setDoctor(item.name)}
                      className={`rounded-xl border p-4 text-left ${doctor === item.name ? "border-[#38a3a5] bg-[#edf5f5]" : "border-slate-200 hover:bg-slate-50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{item.name}</span>
                        <span className="text-xs font-semibold text-[#2d8a76]">
                          {item.availability}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.specialty} · Next available {item.next}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {step === 3 ? (
              <div className="space-y-6">
                <StepTitle
                  number="3"
                  title="Choose date and time"
                  detail="Available slots will be validated against the doctor's schedule."
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Appointment date">
                    <input type="date" defaultValue="2026-08-22" className="field-control" />
                  </Field>
                  <Field label="Appointment time">
                    <select className="field-control">
                      <option>11:00</option>
                      <option>11:30</option>
                      <option>14:00</option>
                      <option>14:30</option>
                      <option>15:00</option>
                    </select>
                  </Field>
                </div>
                <Field label="Appointment type">
                  <select className="field-control">
                    <option>New consultation</option>
                    <option>Follow-up</option>
                    <option>Review</option>
                    <option>Procedure</option>
                  </select>
                </Field>
                <Field label="Visit reason">
                  <textarea
                    rows={4}
                    placeholder="Brief reason for the visit"
                    className="field-control min-h-24 resize-y"
                  />
                </Field>
              </div>
            ) : null}
            {step === 4 ? (
              <div className="space-y-6">
                <StepTitle
                  number="4"
                  title="Review and confirm"
                  detail="Check the details before creating the appointment."
                />
                <div className="grid gap-4 rounded-2xl bg-slate-50 p-5 text-sm sm:grid-cols-2">
                  <Summary
                    label="Patient"
                    value={
                      selectedPatient
                        ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                        : "Amina Hassan"
                    }
                  />
                  <Summary
                    label="Patient number"
                    value={selectedPatient?.patientNumber ?? "GGH-PAT-000128"}
                  />
                  <Summary label="Department" value={department || "General Medicine"} />
                  <Summary label="Doctor" value={doctor || "Dr. Ahmed Yusuf"} />
                  <Summary label="Date" value="22 August 2026" />
                  <Summary label="Time" value="11:00" />
                </div>
                <div className="rounded-xl border border-[#dceff0] bg-[#edf5f5] p-4 text-sm text-slate-600">
                  Appointment reference will be generated as{" "}
                  <strong className="text-[#22577a]">GGH-APT-2026-000124</strong>.
                </div>
              </div>
            ) : null}
            <div className="mt-8 flex justify-between border-t border-slate-100 pt-5">
              {step > 1 ? (
                <Button type="button" variant="ghost" onClick={() => setStep((value) => value - 1)}>
                  <ArrowLeft /> Back
                </Button>
              ) : (
                <span />
              )}
              {step < 4 ? (
                <Button type="button" onClick={() => setStep((value) => value + 1)}>
                  Continue <ArrowRight />
                </Button>
              ) : (
                <Button type="button" onClick={() => setSaved(true)}>
                  <CalendarCheck /> Confirm appointment
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>
      {saved ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-5">
          <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-lift">
            <CheckCircle2 className="mx-auto size-10 text-[#2d8a76]" />
            <h2 className="mt-4 font-display text-xl font-semibold">Appointment created</h2>
            <p className="mt-2 text-sm text-slate-500">
              Reference <strong>GGH-APT-2026-000124</strong> is ready for check-in.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button onClick={() => navigate({ to: "/admin/appointments" })}>
                View appointments
              </Button>
              <Button variant="outline" onClick={() => setSaved(false)}>
                Create another
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}

function StepTitle({ number, title, detail }: { number: string; title: string; detail: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#38a3a5]">
        Step {number} of 4
      </p>
      <h3 className="mt-2 font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  );
}
function Field({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children ?? <input className="field-control" />}
    </label>
  );
}
function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-700">{value}</dd>
    </div>
  );
}
