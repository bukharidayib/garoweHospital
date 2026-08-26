import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FilePenLine,
  Phone,
  Play,
  UserRound,
  XCircle,
} from "lucide-react";

import { AdminShell, PatientStatusBadge } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { appointmentRows } from "@/content/appointments";

export const Route = createFileRoute("/admin/appointments/$appointmentId")({
  head: () => ({ meta: [{ title: "Appointment Details | GGH Management Portal" }] }),
  component: AppointmentDetailsPage,
});

function AppointmentDetailsPage() {
  const { appointmentId } = Route.useParams();
  const appointment = appointmentRows.find((row) => row.id === appointmentId) ?? appointmentRows[0];
  return (
    <AdminShell
      title="Appointment details"
      subtitle="Review scheduling and operational check-in information."
    >
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link
          to="/admin/appointments"
          className="inline-flex items-center gap-1 font-semibold text-[#22577a] hover:underline"
        >
          <ArrowLeft className="size-3.5" /> Appointments
        </Link>
        <span>/</span>
        <span>{appointment.id}</span>
      </div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#38a3a5]">
            Appointment reference
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">{appointment.id}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Created for {appointment.patient} · {appointment.date} at {appointment.time}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <FilePenLine /> Edit
          </Button>
          <Button variant="outline">
            <CalendarDays /> Reschedule
          </Button>
          <Button variant="emergency">
            <XCircle /> Cancel
          </Button>
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Appointment overview</h3>
            <PatientStatusBadge status={appointment.status} />
          </div>
          <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
            <Info label="Patient" value={appointment.patient} />
            <Info label="Patient number" value={appointment.patientNumber} />
            <Info label="Doctor" value={appointment.doctor} />
            <Info label="Department" value={appointment.department} />
            <Info label="Date" value={appointment.date} />
            <Info label="Time" value={appointment.time} />
            <Info label="Appointment type" value={appointment.type} />
            <Info label="Reason" value="Routine consultation and follow-up" />
          </dl>
          <div className="mt-7 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
            <Button asChild variant="outline">
              <Link to="/admin/patients/$patientId" params={{ patientId: appointment.patientId }}>
                <UserRound /> View patient
              </Link>
            </Button>
            {appointment.status === "Scheduled" || appointment.status === "Confirmed" ? (
              <Button>
                <CheckCircle2 /> Check in patient
              </Button>
            ) : null}
            {appointment.status === "Checked In" || appointment.status === "Waiting" ? (
              <Button>
                <Play /> Start visit
              </Button>
            ) : null}
          </div>
        </section>
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
            <h3 className="font-display text-lg font-semibold">Operational status</h3>
            <div className="mt-5 space-y-4">
              <Timeline label="Appointment created" value="Today · 07:44" done />
              <Timeline label="Confirmed" value="Today · 07:51" done />
              <Timeline
                label="Checked in"
                value={appointment.status === "Scheduled" ? "Awaiting patient" : "Today · 08:42"}
                done={appointment.status !== "Scheduled"}
              />
              <Timeline
                label="Entered queue"
                value={
                  appointment.status === "Waiting" || appointment.status === "In Consultation"
                    ? "GEN-014"
                    : "Awaiting check-in"
                }
                done={appointment.status === "Waiting" || appointment.status === "In Consultation"}
              />
              <Timeline
                label="Consultation"
                value={appointment.status === "Completed" ? "Completed" : "Not started"}
                done={appointment.status === "Completed"}
              />
            </div>
          </section>
          <section className="rounded-2xl border border-[#dceff0] bg-[#edf5f5] p-5">
            <div className="flex gap-3">
              <Clock3 className="mt-0.5 size-5 shrink-0 text-[#22577a]" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Patient flow reminder</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Appointment status describes the scheduled visit. Queue and visit status are
                  tracked separately after check-in.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
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
function Timeline({ label, value, done }: { label: string; value: string; done: boolean }) {
  return (
    <div className="flex gap-3">
      <span
        className={`mt-0.5 grid size-5 place-items-center rounded-full ${done ? "bg-[#e4f4ed] text-[#2d8a76]" : "bg-slate-100 text-slate-300"}`}
      >
        {done ? (
          <CheckCircle2 className="size-3.5" />
        ) : (
          <span className="size-1.5 rounded-full bg-current" />
        )}
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{value}</p>
      </div>
    </div>
  );
}
