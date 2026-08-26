import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import { z } from "zod";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { departments, doctors, hospital } from "@/content/hospital";

const appointmentSearch = z.object({
  department: z.string().optional(),
  doctor: z.string().optional(),
});

export const Route = createFileRoute("/appointments")({
  validateSearch: appointmentSearch,
  head: () => ({
    meta: [
      { title: `Book an Appointment | ${hospital.name}` },
      {
        name: "description",
        content: `Request a consultation with ${hospital.name}. Choose a department, doctor and preferred appointment time.`,
      },
      { property: "og:title", content: `Book an Appointment | ${hospital.shortName}` },
      {
        property: "og:description",
        content: `Request a consultation with ${hospital.name}.`,
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/appointments" }],
  }),
  component: AppointmentsPage,
});

type FormState = {
  department: string;
  doctor: string;
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  reason: string;
};

const initialForm: FormState = {
  department: "",
  doctor: "",
  date: "",
  time: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  reason: "",
};

const times = ["08:30", "09:30", "10:30", "11:30", "14:00", "15:00", "16:00"];

function AppointmentsPage() {
  const search = Route.useSearch();
  const [form, setForm] = useState<FormState>({
    ...initialForm,
    department: search.department ?? "",
    doctor: search.doctor ?? "",
  });
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const availableDoctors = useMemo(
    () => doctors.filter((doctor) => !form.department || doctor.departmentSlug === form.department),
    [form.department],
  );
  const selectedDepartment = departments.find((department) => department.slug === form.department);
  const selectedDoctor = doctors.find((doctor) => doctor.slug === form.doctor);

  function update(field: keyof FormState, value: string) {
    setError("");
    setForm((current) => ({ ...current, [field]: value }));
  }

  function next() {
    if (step === 1 && !form.department) {
      setError("Choose a department to continue.");
      return;
    }
    if (step === 2 && (!form.date || !form.time)) {
      setError("Choose a preferred date and time to continue.");
      return;
    }
    if (step === 3 && (!form.firstName || !form.lastName || !form.phone)) {
      setError("Enter your first name, last name and phone number to continue.");
      return;
    }
    setError("");
    setStep((current) => Math.min(4, current + 1));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.reason.trim()) {
      setError("Add a short reason for your visit.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <>
        <PageHeader
          title="Appointment request received"
          description="Keep this reference for your records. Hospital administration will confirm the appointment when scheduling is connected."
          crumbs={[{ label: "Appointments" }]}
        />
        <section className="container-page section-y">
          <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-card sm:p-12">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-accent-soft text-accent">
              <CheckCircle2 className="size-8" aria-hidden="true" />
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Request reference
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-foreground">
              GGH-{form.date.replaceAll("-", "")}-001
            </p>
            <dl className="mx-auto mt-8 grid max-w-md gap-4 border-y border-border py-6 text-left text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Patient</dt>
                <dd className="mt-1 font-semibold text-foreground">
                  {form.firstName} {form.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Department</dt>
                <dd className="mt-1 font-semibold text-foreground">{selectedDepartment?.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Preferred date</dt>
                <dd className="mt-1 font-semibold text-foreground">{form.date}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Preferred time</dt>
                <dd className="mt-1 font-semibold text-foreground">{form.time}</dd>
              </div>
            </dl>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              This is a request, not a confirmed appointment. Please bring identification and arrive
              a little early. Contact the hospital if you need urgent help.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/">Return home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Contact the hospital</Link>
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Book an appointment"
        description={`Request a consultation with ${hospital.name}. Choose a department and preferred time, then share only the details needed for scheduling.`}
        crumbs={[{ label: "Appointments" }]}
      />
      <section className="container-page section-y">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Simple booking
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-foreground">
                Plan your visit with confidence.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Your request helps the team understand what care you need. A member of hospital
                administration confirms availability before the visit.
              </p>
            </div>
            <ol className="space-y-4">
              {["Choose care", "Select a time", "Your details", "Review request"].map(
                (label, index) => (
                  <li key={label} className="flex items-center gap-3 text-sm">
                    <span
                      className={`grid size-9 place-items-center rounded-full text-sm font-semibold ${step === index + 1 ? "bg-primary text-primary-foreground" : step > index + 1 ? "bg-accent-soft text-accent" : "bg-secondary text-muted-foreground"}`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={
                        step === index + 1
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {label}
                    </span>
                  </li>
                ),
              )}
            </ol>
            <div className="flex gap-3 rounded-2xl bg-secondary p-4 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                Do not include medical records or detailed health information in this request. For
                emergencies, go directly to emergency care.
              </span>
            </div>
          </aside>

          <form
            onSubmit={submit}
            className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
          >
            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    Step 1 of 4
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                    What kind of care do you need?
                  </h2>
                </div>
                <Field label="Department" id="appointment-department">
                  <select
                    id="appointment-department"
                    value={form.department}
                    onChange={(event) => {
                      update("department", event.target.value);
                      update("doctor", "");
                    }}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select a department</option>
                    {departments
                      .filter((department) => department.active)
                      .map((department) => (
                        <option key={department.slug} value={department.slug}>
                          {department.name}
                        </option>
                      ))}
                  </select>
                </Field>
                <Field label="Preferred doctor (optional)" id="appointment-doctor">
                  <select
                    id="appointment-doctor"
                    value={form.doctor}
                    onChange={(event) => update("doctor", event.target.value)}
                    disabled={!form.department}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Any available doctor</option>
                    {availableDoctors.map((doctor) => (
                      <option key={doctor.slug} value={doctor.slug}>
                        {doctor.name} — {doctor.specialty}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    Step 2 of 4
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                    When would you prefer to visit?
                  </h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Preferred date" id="appointment-date">
                    <input
                      id="appointment-date"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={form.date}
                      onChange={(event) => update("date", event.target.value)}
                      className="field-control"
                    />
                  </Field>
                  <Field label="Preferred time" id="appointment-time">
                    <select
                      id="appointment-time"
                      value={form.time}
                      onChange={(event) => update("time", event.target.value)}
                      className="field-control"
                    >
                      <option value="">Select a time</option>
                      {times.map((time) => (
                        <option key={time}>{time}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-primary-soft p-4 text-sm text-muted-foreground">
                  <Clock3 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    Clinic hours vary by department. Your selected time is a preference and will be
                    confirmed by the hospital team.
                  </span>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    Step 3 of 4
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                    How can we reach you?
                  </h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="First name" id="first-name">
                    <input
                      id="first-name"
                      required
                      value={form.firstName}
                      onChange={(event) => update("firstName", event.target.value)}
                      className="field-control"
                    />
                  </Field>
                  <Field label="Last name" id="last-name">
                    <input
                      id="last-name"
                      required
                      value={form.lastName}
                      onChange={(event) => update("lastName", event.target.value)}
                      className="field-control"
                    />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Phone number" id="phone">
                    <input
                      id="phone"
                      required
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(event) => update("phone", event.target.value)}
                      className="field-control"
                    />
                  </Field>
                  <Field label="Email (optional)" id="email">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) => update("email", event.target.value)}
                      className="field-control"
                    />
                  </Field>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    Step 4 of 4
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                    Review your request
                  </h2>
                </div>
                <div className="grid gap-4 rounded-2xl bg-surface p-5 text-sm sm:grid-cols-2">
                  <Summary label="Department" value={selectedDepartment?.name ?? "—"} />
                  <Summary label="Doctor" value={selectedDoctor?.name ?? "Any available doctor"} />
                  <Summary label="Date" value={form.date || "—"} />
                  <Summary label="Time" value={form.time || "—"} />
                  <Summary label="Patient" value={`${form.firstName} ${form.lastName}`} />
                  <Summary label="Phone" value={form.phone} />
                </div>
                <Field label="Brief reason for visit" id="reason">
                  <textarea
                    id="reason"
                    required
                    rows={4}
                    value={form.reason}
                    onChange={(event) => update("reason", event.target.value)}
                    placeholder="For example: general consultation or follow-up visit"
                    className="field-control min-h-28 resize-y"
                  />
                </Field>
              </div>
            ) : null}

            {error ? (
              <p
                role="alert"
                className="mt-6 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
              >
                {error}
              </p>
            ) : null}
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setError("");
                    setStep((current) => current - 1);
                  }}
                >
                  <ArrowLeft /> Back
                </Button>
              ) : (
                <span />
              )}
              {step < 4 ? (
                <Button type="button" onClick={next}>
                  Continue <ArrowRight />
                </Button>
              ) : (
                <Button type="submit">
                  <CalendarCheck /> Submit request
                </Button>
              )}
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="block space-y-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold text-foreground">{value}</dd>
    </div>
  );
}
