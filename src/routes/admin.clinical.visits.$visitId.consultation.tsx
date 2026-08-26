import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  FileText,
  FlaskConical,
  HeartPulse,
  Plus,
  Save,
  ShieldAlert,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  clinicalHistory,
  clinicalQueue,
  currentVitals,
  recentLabs,
  recentMedications,
} from "@/content/clinical";

export const Route = createFileRoute("/admin/clinical/visits/$visitId/consultation")({
  head: () => ({ meta: [{ title: "Consultation | GGH Clinical Workspace" }] }),
  component: ConsultationPage,
});

function ConsultationPage() {
  const { visitId } = Route.useParams();
  const navigate = useNavigate();
  const visit = clinicalQueue.find((item) => item.visitId === visitId) ?? clinicalQueue[1];
  const [saved, setSaved] = useState("Saved just now");
  const [completed, setCompleted] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [labOpen, setLabOpen] = useState(false);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);

  return (
    <AdminShell
      title="Consultation"
      subtitle="Document the clinical encounter with a focused, safe workflow."
    >
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link
          to="/admin/clinical"
          className="inline-flex items-center gap-1 font-semibold text-[#22577a] hover:underline"
        >
          <ArrowLeft className="size-3.5" /> Clinical workspace
        </Link>
        <span>/</span>
        <span>{visit.visitId}</span>
      </div>
      <section className="sticky top-20 z-20 rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full bg-[#dceff0] font-semibold text-[#22577a]">
              {visit.patient
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </span>
            <div>
              <p className="text-xs font-semibold text-[#22577a]">
                {visit.number} · Visit {visit.visitId}
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold">{visit.patient}</h2>
              <p className="mt-1 text-xs text-slate-500">
                {visit.age} years · {visit.gender} · {visit.department} · {visit.queue}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#fcf1da] px-2.5 py-1 text-[10px] font-semibold text-[#b57918]">
              {visit.priority}
            </span>
            <span className="rounded-full bg-[#dceff0] px-2.5 py-1 text-[10px] font-semibold text-[#22577a]">
              In consultation
            </span>
            <span className="mr-2 text-xs text-slate-400">{saved}</span>
            <Button variant="outline" onClick={() => setSaved("Draft saved just now")}>
              <Save /> Save draft
            </Button>
            <Button onClick={() => setCompleted(true)}>
              <CheckCircle2 /> Complete consultation
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Consultation flow</span>
          <span>Checked in</span>
          <span>→</span>
          <span>Vitals</span>
          <span>→</span>
          <span className="font-semibold text-[#22577a]">Doctor started</span>
          <span>→</span>
          <span>Orders & plan</span>
        </div>
      </section>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <SafetyBanner />
          <ClinicalSection title="Chief complaint" icon={Stethoscope}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Main complaint" placeholder="e.g. Headache" />
              <Field label="Duration" placeholder="e.g. 3 days" />
            </div>
            <Field label="Additional complaint" placeholder="Optional" />
          </ClinicalSection>
          <ClinicalSection title="History of present illness" icon={FileText}>
            <Field label="Clinical history">
              <textarea
                rows={6}
                className="field-control min-h-36 resize-y"
                placeholder="Document onset, progression, associated symptoms and relevant context..."
              />
            </Field>
          </ClinicalSection>
          <ClinicalSection title="Examination" icon={HeartPulse} collapsible>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="General" placeholder="General appearance and findings" />
              <Field label="Cardiovascular" placeholder="Findings" />
              <Field label="Respiratory" placeholder="Findings" />
              <Field label="Abdomen" placeholder="Findings" />
            </div>
            <Field label="Other examination findings">
              <textarea
                rows={3}
                className="field-control min-h-24 resize-y"
                placeholder="Additional findings"
              />
            </Field>
          </ClinicalSection>
          <ClinicalSection title="Diagnosis" icon={ShieldAlert}>
            <div className="flex gap-2">
              <input
                value={diagnosis}
                onChange={(event) => setDiagnosis(event.target.value)}
                className="field-control"
                placeholder="Search or enter a diagnosis"
              />
              <Button type="button" variant="outline">
                <Plus /> Add
              </Button>
            </div>
            {diagnosis ? (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-[#edf5f5] p-3 text-sm">
                <span>
                  <strong>Primary:</strong> {diagnosis}
                </span>
                <button
                  onClick={() => setDiagnosis("")}
                  className="text-xs font-semibold text-[#22577a]"
                >
                  Remove
                </button>
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-400">
                No diagnosis added yet. Coding can be connected to a configured diagnosis catalog
                later.
              </p>
            )}
          </ClinicalSection>
          <ClinicalSection title="Investigations and treatment" icon={FlaskConical}>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setLabOpen((value) => !value)}>
                <FlaskConical /> Request lab test
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPrescriptionOpen((value) => !value)}
              >
                <Plus /> Add prescription
              </Button>
            </div>
            {labOpen ? (
              <OrderPanel
                title="Request laboratory tests"
                items={[
                  "Complete blood count",
                  "Malaria test",
                  "Fasting glucose",
                  "Urinalysis",
                  "Liver function",
                ]}
                close={() => setLabOpen(false)}
              />
            ) : null}
            {prescriptionOpen ? (
              <PrescriptionPanel close={() => setPrescriptionOpen(false)} />
            ) : null}
          </ClinicalSection>
          <ClinicalSection title="Treatment plan and follow-up" icon={FileText}>
            <Field label="Treatment plan">
              <textarea
                rows={5}
                className="field-control min-h-32 resize-y"
                placeholder="Treatment, procedures, advice and monitoring instructions..."
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Follow-up required">
                <select className="field-control">
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </Field>
              <Field label="Suggested follow-up date">
                <input type="date" className="field-control" />
              </Field>
            </div>
          </ClinicalSection>
        </div>
        <aside className="space-y-5">
          <PatientContext />
          <VitalsCard />
          <HistoryCard />
        </aside>
      </div>
      {completed ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-5">
          <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-lift">
            <CheckCircle2 className="mx-auto size-10 text-[#2d8a76]" />
            <h2 className="mt-4 font-display text-xl font-semibold">Complete consultation?</h2>
            <p className="mt-2 text-sm text-slate-500">
              The clinical record becomes read-only by default and the queue visit will be marked
              completed.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button onClick={() => navigate({ to: "/admin/clinical" })}>
                Confirm completion
              </Button>
              <Button variant="outline" onClick={() => setCompleted(false)}>
                Keep editing
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}

function SafetyBanner() {
  return (
    <section className="flex gap-3 rounded-2xl border border-[#f0c987] bg-[#fff9eb] p-4">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#b57918]" />
      <div>
        <p className="text-sm font-semibold text-slate-800">Safety information requires review</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Documented allergy: <strong>Penicillin</strong>. Confirm before prescribing related
          medicines.
        </p>
      </div>
    </section>
  );
}
function ClinicalSection({
  title,
  icon: Icon,
  children,
  collapsible = false,
}: {
  title: string;
  icon: typeof FileText;
  children: React.ReactNode;
  collapsible?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-[#edf5f5] text-[#22577a]">
            <Icon className="size-4" />
          </span>
          <h3 className="font-display text-lg font-semibold">{title}</h3>
        </div>
        {collapsible ? <ChevronDown className="size-4 text-slate-400" /> : null}
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
function Field({
  label,
  placeholder,
  children,
}: {
  label: string;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <label className="block space-y-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children ?? <input className="field-control" placeholder={placeholder} />}
    </label>
  );
}
function PatientContext() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
      <div className="flex items-center gap-3">
        <UserRound className="size-4 text-[#22577a]" />
        <h3 className="font-display text-base font-semibold">Patient context</h3>
      </div>
      <div className="mt-4 space-y-4 text-xs">
        <div>
          <p className="text-slate-400">Medical alerts</p>
          <p className="mt-1 flex items-center gap-2 font-semibold text-[#b57918]">
            <ShieldAlert className="size-3.5" /> Penicillin allergy · severe
          </p>
        </div>
        <div>
          <p className="text-slate-400">Blood group</p>
          <p className="mt-1 font-semibold text-slate-700">O+</p>
        </div>
        <div>
          <p className="text-slate-400">Contact</p>
          <p className="mt-1 font-semibold text-slate-700">+252 90 633 1108</p>
        </div>
      </div>
      <Link
        to="/admin/patients/$patientId"
        params={{ patientId: "p-00133" }}
        className="mt-5 inline-flex text-xs font-semibold text-[#22577a] hover:underline"
      >
        View full patient history <ArrowRight className="ml-1 size-3" />
      </Link>
    </section>
  );
}
function VitalsCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold">Current vitals</h3>
        <button className="text-xs font-semibold text-[#22577a] hover:underline">
          Record vitals
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          ["Temperature", currentVitals.temperature],
          ["Blood pressure", currentVitals.bloodPressure],
          ["Pulse", currentVitals.pulse],
          ["SpO2", currentVitals.oxygen],
          ["Respiratory", currentVitals.respiratory],
          ["Weight", currentVitals.weight],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-slate-400">
        Recorded {currentVitals.recorded} by {currentVitals.recordedBy}
      </p>
    </section>
  );
}
function HistoryCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold">Recent history</h3>
        <Link
          to="/admin/patients/$patientId"
          params={{ patientId: "p-00133" }}
          className="text-xs font-semibold text-[#22577a]"
        >
          View all
        </Link>
      </div>
      <div className="mt-4 space-y-4">
        {clinicalHistory.slice(0, 2).map((item) => (
          <div key={item.date} className="border-l-2 border-[#dceff0] pl-3">
            <p className="text-[11px] text-slate-400">
              {item.date} · {item.department}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-700">{item.diagnosis}</p>
            <p className="mt-1 text-[11px] text-slate-500">{item.detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Recent labs
        </p>
        {recentLabs.map((lab) => (
          <div key={lab.test} className="mt-3 flex justify-between gap-2 text-xs">
            <span className="text-slate-600">{lab.test}</span>
            <span className="font-semibold text-slate-700">{lab.result}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Recent medicines
        </p>
        {recentMedications.map((medication) => (
          <div key={medication.medicine} className="mt-3 flex justify-between gap-2 text-xs">
            <span className="text-slate-600">{medication.medicine}</span>
            <span className="text-slate-400">{medication.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
function OrderPanel({
  title,
  items,
  close,
}: {
  title: string;
  items: string[];
  close: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#dceff0] bg-[#edf5f5] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <button onClick={close} className="text-xs font-semibold text-[#22577a]">
          Close
        </button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 rounded-lg bg-white p-2 text-xs">
            <input type="checkbox" />
            {item}
          </label>
        ))}
      </div>
      <Button size="sm" className="mt-4">
        Submit lab request
      </Button>
    </div>
  );
}
function PrescriptionPanel({ close }: { close: () => void }) {
  return (
    <div className="rounded-xl border border-[#f0c987] bg-[#fff9eb] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Add medication</p>
        <button onClick={close} className="text-xs font-semibold text-[#b57918]">
          Close
        </button>
      </div>
      <p className="mt-2 text-xs text-[#8b671d]">
        Potential Allergy Conflict: review Penicillin allergy before prescribing related medicines.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input className="field-control" placeholder="Medication" />
        <input className="field-control" placeholder="Strength and dose" />
        <input className="field-control" placeholder="Route and frequency" />
        <input className="field-control" placeholder="Duration" />
      </div>
      <Button size="sm" className="mt-4">
        Add prescription
      </Button>
    </div>
  );
}
