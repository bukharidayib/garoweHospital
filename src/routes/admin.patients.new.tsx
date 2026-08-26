import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, CheckCircle2, Save, ShieldCheck } from "lucide-react";

import { AdminShell, AdminSectionHeading } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { patientAge, patients } from "@/content/patients";

export const Route = createFileRoute("/admin/patients/new")({
  head: () => ({ meta: [{ title: "Register Patient | GGH Management Portal" }] }),
  component: NewPatientPage,
});

function NewPatientPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [saved, setSaved] = useState(false);
  const duplicate =
    phone.length > 7
      ? patients.find((patient) => patient.phone.replaceAll(" ", "") === phone.replaceAll(" ", ""))
      : name.length > 4 && dateOfBirth
        ? patients.find(
            (patient) =>
              `${patient.firstName} ${patient.lastName}`.toLowerCase() === name.toLowerCase() &&
              patient.dateOfBirth === dateOfBirth,
          )
        : undefined;

  return (
    <AdminShell
      title="Register patient"
      subtitle="Create a new patient record with only the information needed at reception."
    >
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link
          to="/admin/patients"
          className="inline-flex items-center gap-1 font-semibold text-[#22577a] hover:underline"
        >
          <ArrowLeft className="size-3.5" /> Patients
        </Link>
        <span>/</span>
        <span>Register patient</span>
      </div>
      <AdminSectionHeading
        eyebrow="Patient management"
        title="Register a new patient"
        description="A unique patient number will be generated when the record is saved."
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
        className="grid gap-5 xl:grid-cols-[1fr_320px]"
      >
        <div className="space-y-5">
          <FormSection
            title="Personal information"
            description="Basic identity and contact information. Fields marked with * are required."
          >
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="First name *" id="first-name" required />
              <Field label="Middle name" id="middle-name" />
              <Field label="Last name *" id="last-name" required />
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Date of birth *</span>
                <input
                  id="date-of-birth"
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  className="field-control"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Gender *</span>
                <select required className="field-control">
                  <option value="">Select gender</option>
                  <option>Female</option>
                  <option>Male</option>
                </select>
              </label>
              <Field
                label="Phone number *"
                id="phone"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email (optional)" id="email" type="email" />
              <Field label="National ID / passport (optional)" id="national-id" />
            </div>
          </FormSection>
          <FormSection
            title="Address"
            description="Keep the address simple for the initial registration. It can be updated later."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Address" id="address" />
              <Field label="City" id="city" value="Garowe" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Region" id="region" value="Nugaal, Puntland" />
              <Field label="Country" id="country" value="Somalia" />
            </div>
          </FormSection>
          <FormSection
            title="Emergency contact"
            description="A trusted contact for urgent communication if needed."
          >
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Full name" id="emergency-name" />
              <Field label="Relationship" id="emergency-relationship" />
              <Field label="Phone number" id="emergency-phone" type="tel" />
            </div>
          </FormSection>
          <FormSection
            title="Medical basics"
            description="Optional safety context. Do not make clinical diagnoses part of reception registration."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Blood group</span>
                <select className="field-control">
                  <option value="">Not recorded</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                  <option>O+</option>
                  <option>O-</option>
                </select>
              </label>
              <Field label="Known allergies" id="allergies" placeholder="e.g. No known allergies" />
            </div>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Important medical alerts</span>
              <textarea
                rows={3}
                className="field-control min-h-24 resize-y"
                placeholder="Only include safety-critical information."
              />
            </label>
          </FormSection>
        </div>
        <aside className="space-y-5">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#38a3a5]">
              Record preview
            </p>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-[#dceff0] font-semibold text-[#22577a]">
                NP
              </span>
              <div>
                <p className="font-semibold text-slate-800">New patient</p>
                <p className="text-xs text-slate-400">GGH-PAT-000146</p>
              </div>
            </div>
            <dl className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Registration type</dt>
                <dd className="font-semibold text-slate-700">New record</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Created by</dt>
                <dd className="font-semibold text-slate-700">Admin Manager</dd>
              </div>
            </dl>
            <div className="mt-5 flex gap-2 rounded-xl bg-[#edf5f5] p-3 text-xs leading-relaxed text-slate-600">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#22577a]" />A patient number is
              not a clinical identifier and should be used for day-to-day lookup.
            </div>
            <div className="mt-5 flex gap-2">
              <Button type="submit" className="flex-1">
                <Save /> Save patient
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/admin/patients" })}
              >
                Cancel
              </Button>
            </div>
          </div>
        </aside>
      </form>
      {duplicate ? (
        <div className="fixed inset-x-5 bottom-5 z-40 mx-auto flex max-w-2xl items-start gap-3 rounded-2xl border border-[#f0c987] bg-[#fff9eb] p-4 shadow-lift">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#b57918]" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Possible existing patient found</p>
            <p className="mt-1 text-xs text-slate-600">
              {duplicate.firstName} {duplicate.lastName} · {duplicate.patientNumber} ·{" "}
              {patientAge(duplicate.dateOfBirth)} years · {duplicate.phone}
            </p>
            <div className="mt-3 flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/patients/$patientId" params={{ patientId: duplicate.id }}>
                  View existing patient
                </Link>
              </Button>
              <button
                type="button"
                className="text-xs font-semibold text-[#b57918] underline underline-offset-2"
              >
                Continue anyway
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {saved ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-5">
          <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-lift">
            <CheckCircle2 className="mx-auto size-10 text-[#2d8a76]" />
            <h2 className="mt-4 font-display text-xl font-semibold">Patient record saved</h2>
            <p className="mt-2 text-sm text-slate-500">
              Demo record created with patient number <strong>GGH-PAT-000146</strong>.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button onClick={() => navigate({ to: "/admin/patients" })}>Back to patients</Button>
              <Button variant="outline" onClick={() => setSaved(false)}>
                Register another
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)] sm:p-6">
      <h2 className="font-display text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}
function Field({
  label,
  id,
  required,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  id: string;
  required?: boolean;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        required={required}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
      />
    </div>
  );
}
