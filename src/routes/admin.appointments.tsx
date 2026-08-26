import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Plus, Search } from "lucide-react";

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
import { appointmentRows, type AppointmentStatus } from "@/content/appointments";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/appointments")({
  head: () => ({ meta: [{ title: "Appointments | GGH Management Portal" }] }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [appointmentList, setAppointmentList] = useState<typeof appointmentRows>([]);
  const [patientOptions, setPatientOptions] = useState<
    Array<{ id: string; patientNumber: string; name: string; phone: string }>
  >([]);
  const [departmentOptions, setDepartmentOptions] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [doctorOptions, setDoctorOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [department, setDepartment] = useState("All departments");
  const [newOpen, setNewOpen] = useState(false);
  const [viewAppointment, setViewAppointment] = useState<(typeof appointmentRows)[number] | null>(
    null,
  );
  const [editAppointment, setEditAppointment] = useState<(typeof appointmentRows)[number] | null>(
    null,
  );
  const [deleteAppointment, setDeleteAppointment] = useState<
    (typeof appointmentRows)[number] | null
  >(null);
  const [appointmentActionError, setAppointmentActionError] = useState("");
  const [appointmentSaving, setAppointmentSaving] = useState(false);
  const [editAppointmentForm, setEditAppointmentForm] = useState({
    date: "",
    time: "",
    type: "",
    status: "Scheduled",
  });
  const [newAppointment, setNewAppointment] = useState({
    patient: "",
    phone: "",
    date: new Date().toISOString().slice(0, 10),
    time: "12:00",
    department: "",
    doctor: "",
    type: "New consultation",
  });
  useEffect(() => {
    let active = true;
    async function loadAppointments() {
      const client = getSupabaseClient();
      const [appointmentsResult, patientsResult, departmentsResult, doctorsResult] =
        await Promise.all([
          client
            .from("appointments")
            .select("*")
            .eq("hospital_id", GGH_HOSPITAL_ID)
            .order("appointment_at", { ascending: true }),
          client
            .from("patients")
            .select("id,patient_number,first_name,last_name,phone")
            .eq("hospital_id", GGH_HOSPITAL_ID)
            .order("last_name"),
          client
            .from("departments")
            .select("id,name")
            .eq("hospital_id", GGH_HOSPITAL_ID)
            .eq("active", true)
            .order("name"),
          client
            .from("doctors")
            .select("id,name")
            .eq("hospital_id", GGH_HOSPITAL_ID)
            .eq("active", true)
            .order("name"),
        ]);
      if (!active) return;
      const { data, error } = appointmentsResult;
      setPatientOptions(
        (patientsResult.data ?? []).map((patient) => ({
          id: patient.id,
          patientNumber: patient.patient_number,
          name: `${patient.first_name} ${patient.last_name}`,
          phone: patient.phone ?? "Not recorded",
        })),
      );
      setDepartmentOptions(departmentsResult.data ?? []);
      setDoctorOptions(
        (doctorsResult.data ?? []).map((doctor) => ({
          id: doctor.id,
          name: doctor.name,
        })),
      );
      if (error || patientsResult.error || departmentsResult.error || doctorsResult.error) {
        setLoadError(
          (error ?? patientsResult.error ?? departmentsResult.error ?? doctorsResult.error)
            ?.message ?? "Unable to load appointments.",
        );
        setAppointmentList([]);
        return;
      }
      setLoadError("");
      const patientMap = new Map(
        (patientsResult.data ?? []).map((patient) => [patient.id, patient]),
      );
      const doctorMap = new Map(
        (doctorsResult.data ?? []).map((doctor) => [doctor.id, doctor.name]),
      );
      const departmentMap = new Map(
        (departmentsResult.data ?? []).map((department) => [department.id, department.name]),
      );
      setAppointmentList(
        (data ?? []).map((row) => ({
          id: row.id,
          patientId: row.patient_id,
          patient: patientMap.get(row.patient_id)
            ? `${patientMap.get(row.patient_id)?.first_name} ${patientMap.get(row.patient_id)?.last_name}`
            : "Unknown patient",
          patientNumber: patientMap.get(row.patient_id)?.patient_number ?? row.patient_id,
          phone: "—",
          doctor: row.doctor_id ? (doctorMap.get(row.doctor_id) ?? "Unknown doctor") : "Unassigned",
          department: row.department_id
            ? (departmentMap.get(row.department_id) ?? "Unknown department")
            : "Unassigned",
          date: new Date(row.appointment_at).toLocaleDateString(),
          time: new Date(row.appointment_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: row.visit_type,
          status: row.status as AppointmentStatus,
          wait: "—",
        })),
      );
    }
    void loadAppointments();
    return () => {
      active = false;
    };
  }, []);
  const rows = useMemo(
    () =>
      appointmentList.filter(
        (row) =>
          `${row.patient} ${row.patientNumber} ${row.doctor} ${row.id} ${row.phone}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (status === "All statuses" || row.status === status) &&
          (department === "All departments" || row.department === department),
      ),
    [appointmentList, department, query, status],
  );
  const appointmentMetrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayRows = appointmentList.filter((row) => row.date === new Date().toLocaleDateString());
    const source = todayRows.length
      ? todayRows
      : appointmentList.filter((row) => row.date.includes(today));
    return {
      total: source.length,
      checkedIn: source.filter((row) => row.status === "Checked In").length,
      waiting: source.filter((row) => row.status === "Waiting").length,
      completed: source.filter((row) => row.status === "Completed").length,
      noShows: source.filter((row) => row.status === "No Show").length,
    };
  }, [appointmentList]);
  const updateNew = (field: keyof typeof newAppointment, value: string) =>
    setNewAppointment((current) => ({ ...current, [field]: value }));
  const selectedPatient = patientOptions.find((patient) => patient.id === newAppointment.patient);
  const openEditAppointment = (appointment: (typeof appointmentRows)[number]) => {
    setEditAppointment(appointment);
    const parsed = new Date(`${appointment.date} ${appointment.time}`);
    setEditAppointmentForm({
      date: Number.isNaN(parsed.getTime())
        ? new Date().toISOString().slice(0, 10)
        : parsed.toISOString().slice(0, 10),
      time: Number.isNaN(parsed.getTime()) ? "12:00" : parsed.toTimeString().slice(0, 5),
      type: appointment.type,
      status: appointment.status,
    });
    setAppointmentActionError("");
  };
  const createAppointment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !newAppointment.patient ||
      !selectedPatient?.phone ||
      !newAppointment.date ||
      !newAppointment.time
    ) {
      setLoadError("Select a patient and complete the appointment date and time.");
      return;
    }
    const appointmentAt = new Date(`${newAppointment.date}T${newAppointment.time}`);
    if (Number.isNaN(appointmentAt.getTime())) {
      setLoadError("Enter a valid appointment date and time.");
      return;
    }
    const { data, error } = await getSupabaseClient()
      .from("appointments")
      .insert({
        hospital_id: GGH_HOSPITAL_ID,
        patient_id: newAppointment.patient,
        department_id: newAppointment.department || null,
        doctor_id: newAppointment.doctor || null,
        appointment_at: appointmentAt.toISOString(),
        visit_type: newAppointment.type,
        status: "Scheduled",
      })
      .select("*")
      .single();
    if (error || !data) {
      setLoadError(error?.message ?? "Unable to save appointment.");
      return;
    }
    setAppointmentList((current) => [
      {
        id: data.id,
        patientId: data.patient_id,
        patient: selectedPatient?.name ?? "Unknown patient",
        patientNumber: selectedPatient?.patientNumber ?? "Unknown number",
        phone: selectedPatient?.phone ?? "—",
        doctor: data.doctor_id
          ? (doctorOptions.find((doctor) => doctor.id === data.doctor_id)?.name ?? "Unknown doctor")
          : "Unassigned",
        department: data.department_id
          ? (departmentOptions.find((item) => item.id === data.department_id)?.name ??
            "Unknown department")
          : "Unassigned",
        date: new Date(data.appointment_at).toLocaleDateString(),
        time: new Date(data.appointment_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: data.visit_type,
        status: "Scheduled",
        wait: "—",
      },
      ...current,
    ]);
    setNewOpen(false);
    setNewAppointment({
      patient: "",
      phone: "",
      date: new Date().toISOString().slice(0, 10),
      time: "12:00",
      department: "",
      doctor: "",
      type: "New consultation",
    });
    return;
    setAppointmentList((current) => [
      {
        id: `APT-${String(2487 + current.length).padStart(5, "0")}`,
        patientId: "p-new",
        patientNumber: "Pending",
        status: "Scheduled" as const,
        wait: "—",
        ...newAppointment,
      },
      ...current,
    ]);
    setNewOpen(false);
    setNewAppointment({
      patient: "",
      phone: "",
      date: "22 Aug 2026",
      time: "12:00",
      department: "General Medicine",
      doctor: "Dr. Ahmed Yusuf",
      type: "New consultation",
    });
  };
  const updateAppointment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editAppointment) return;
    const appointmentAt = new Date(`${editAppointmentForm.date}T${editAppointmentForm.time}`);
    if (Number.isNaN(appointmentAt.getTime())) {
      setAppointmentActionError("Enter a valid appointment date and time.");
      return;
    }
    setAppointmentSaving(true);
    const { data, error } = await getSupabaseClient()
      .from("appointments")
      .update({
        appointment_at: appointmentAt.toISOString(),
        visit_type: editAppointmentForm.type,
        status: editAppointmentForm.status,
      })
      .eq("id", editAppointment.id)
      .eq("hospital_id", GGH_HOSPITAL_ID)
      .select("*")
      .single();
    if (error || !data) {
      setAppointmentActionError(error?.message ?? "Unable to update appointment.");
      setAppointmentSaving(false);
      return;
    }
    setAppointmentList((current) =>
      current.map((row) =>
        row.id === data.id
          ? {
              ...row,
              date: new Date(data.appointment_at).toLocaleDateString(),
              time: new Date(data.appointment_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              type: data.visit_type,
              status: data.status as AppointmentStatus,
            }
          : row,
      ),
    );
    setEditAppointment(null);
    setViewAppointment(null);
    setAppointmentSaving(false);
  };
  const confirmDeleteAppointment = async () => {
    if (!deleteAppointment) return;
    setAppointmentSaving(true);
    const { error } = await getSupabaseClient()
      .from("appointments")
      .delete()
      .eq("id", deleteAppointment.id)
      .eq("hospital_id", GGH_HOSPITAL_ID);
    if (error) {
      setAppointmentActionError(error.message);
      setAppointmentSaving(false);
      return;
    }
    setAppointmentList((current) => current.filter((row) => row.id !== deleteAppointment.id));
    setDeleteAppointment(null);
    setViewAppointment(null);
    setAppointmentSaving(false);
  };
  const checkIn = (id: string) =>
    setAppointmentList((current) =>
      current.map((row) =>
        row.id === id ? { ...row, status: "Checked In" as const, wait: "0 min" } : row,
      ),
    );
  if (pathname !== "/admin/appointments") return <Outlet />;
  return (
    <AdminShell
      title="Appointments"
      subtitle="Manage scheduled visits, walk-ins, and patient check-ins."
    >
      <AdminSectionHeading
        eyebrow="Hospital operations"
        title="Appointments"
        description="Today's scheduled visits and operational check-ins."
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setNewOpen(true)}>
              <Plus /> New appointment
            </Button>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi
          label="Appointments today"
          value={String(appointmentMetrics.total)}
          detail="Loaded from Supabase"
        />
        <Kpi
          label="Checked in"
          value={String(appointmentMetrics.checkedIn)}
          detail="Today's check-ins"
        />
        <Kpi
          label="Waiting"
          value={String(appointmentMetrics.waiting)}
          detail="Current queue"
          tone="warning"
        />
        <Kpi
          label="Completed"
          value={String(appointmentMetrics.completed)}
          detail="Completed visits"
          tone="success"
        />
        <Kpi
          label="No shows"
          value={String(appointmentMetrics.noShows)}
          detail="Recorded no-shows"
          tone="danger"
        />
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap gap-2">
            <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3">
              <Search className="size-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search patient, appointment or doctor..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none"
            >
              <option>All statuses</option>
              {[
                "Scheduled",
                "Confirmed",
                "Checked In",
                "Waiting",
                "In Consultation",
                "Completed",
                "Cancelled",
                "No Show",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none"
            >
              <option>All departments</option>
              <option>General Medicine</option>
              <option>Pediatrics</option>
              <option>Emergency</option>
              <option>Obstetrics & Gynecology</option>
            </select>
          </div>
          <button className="inline-flex items-center gap-2 text-xs font-semibold text-[#22577a] hover:underline">
            <CalendarDays className="size-4" /> 22 August 2026
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.12em] text-slate-400">
              <tr>
                {[
                  "Appointment",
                  "Patient",
                  "Doctor",
                  "Department",
                  "Time",
                  "Type",
                  "Status",
                  "Wait",
                  "Actions",
                ].map((header) => (
                  <th key={header} className="px-5 py-3 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <Link
                      to="/admin/appointments/$appointmentId"
                      params={{ appointmentId: row.id }}
                      className="font-semibold text-[#22577a] hover:underline"
                    >
                      APT-{row.id.slice(0, 8).toUpperCase()}
                    </Link>
                    <p className="mt-1 text-[11px] text-slate-400">{row.date}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to="/admin/patients/$patientId"
                      params={{ patientId: row.patientId }}
                      className="flex items-center gap-2"
                    >
                      <span className="grid size-8 place-items-center rounded-full bg-[#dceff0] text-[10px] font-bold text-[#22577a]">
                        {row.patient
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <span>
                        <span className="block font-semibold text-slate-800">{row.patient}</span>
                        <span className="block text-[11px] text-slate-400">
                          {row.patientNumber}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{row.doctor}</td>
                  <td className="px-5 py-4 text-slate-600">{row.department}</td>
                  <td className="px-5 py-4 font-semibold text-slate-700">{row.time}</td>
                  <td className="px-5 py-4 text-slate-500">{row.type}</td>
                  <td className="px-5 py-4">
                    <PatientStatusBadge status={row.status} />
                  </td>
                  <td
                    className={`px-5 py-4 font-semibold ${row.wait !== "—" && Number.parseInt(row.wait) > 40 ? "text-[#d85c3f]" : "text-slate-600"}`}
                  >
                    {row.wait}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          row.status === "Scheduled" || row.status === "Confirmed"
                            ? checkIn(row.id)
                            : setViewAppointment(row)
                        }
                        className="text-xs font-semibold text-[#22577a] hover:underline"
                      >
                        {row.status === "Scheduled" || row.status === "Confirmed"
                          ? "Check in"
                          : "View"}
                      </button>
                      <button
                        onClick={() => openEditAppointment(row)}
                        className="text-xs font-semibold text-slate-600 hover:underline"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => {
                          setAppointmentActionError("");
                          setDeleteAppointment(row);
                        }}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarDays className="mx-auto size-8 text-slate-300" />
              <p className="mt-3 text-sm font-semibold">No appointments scheduled</p>
              <p className="mt-1 text-xs text-slate-500">
                There are no appointments matching the selected filters.
              </p>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {rows.length} of {appointmentList.length} appointments
          </span>
          <span>Page 1 of 3 · 20 rows per page</span>
        </div>
      </section>
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New appointment</DialogTitle>
            <DialogDescription>Schedule a visit for a patient.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createAppointment} className="space-y-4">
            <Field
              label="Patient name"
              as="select"
              value={newAppointment.patient}
              onChange={(value) => {
                const patient = patientOptions.find((item) => item.id === value);
                setNewAppointment((current) => ({
                  ...current,
                  patient: value,
                  phone: patient?.phone ?? "",
                }));
              }}
              options={
                patientOptions.length
                  ? patientOptions.map((patient) => `${patient.patientNumber} · ${patient.name}`)
                  : ["No patients available"]
              }
              optionValues={
                patientOptions.length ? patientOptions.map((patient) => patient.id) : [""]
              }
              required
            />
            <Field
              label="Phone number"
              value={selectedPatient?.phone ?? ""}
              onChange={() => undefined}
              readOnly
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Date"
                type="date"
                value={newAppointment.date}
                onChange={(value) => updateNew("date", value)}
              />
              <Field
                label="Time"
                type="time"
                value={newAppointment.time}
                onChange={(value) => updateNew("time", value)}
              />
              <Field
                label="Department"
                as="select"
                value={newAppointment.department}
                onChange={(value) => updateNew("department", value)}
                options={
                  departmentOptions.length
                    ? departmentOptions.map((department) => department.name)
                    : ["No departments available"]
                }
                optionValues={
                  departmentOptions.length
                    ? departmentOptions.map((department) => department.id)
                    : [""]
                }
              />
              <Field
                label="Doctor"
                as="select"
                value={newAppointment.doctor}
                onChange={(value) => updateNew("doctor", value)}
                options={
                  doctorOptions.length
                    ? doctorOptions.map((doctor) => doctor.name)
                    : ["No doctors available"]
                }
                optionValues={
                  doctorOptions.length ? doctorOptions.map((doctor) => doctor.id) : [""]
                }
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create appointment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(viewAppointment)}
        onOpenChange={(open) => !open && setViewAppointment(null)}
      >
        <DialogContent>
          {viewAppointment ? (
            <>
              <DialogHeader>
                <DialogTitle>Appointment {viewAppointment.id}</DialogTitle>
                <DialogDescription>
                  {viewAppointment.patient} · {viewAppointment.date}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Detail label="Doctor">{viewAppointment.doctor}</Detail>
                <Detail label="Department">{viewAppointment.department}</Detail>
                <Detail label="Time">{viewAppointment.time}</Detail>
                <Detail label="Type">{viewAppointment.type}</Detail>
                <Detail label="Status">
                  <PatientStatusBadge status={viewAppointment.status} />
                </Detail>
                <Detail label="Phone">{viewAppointment.phone}</Detail>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => openEditAppointment(viewAppointment)}>
                  Update appointment
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setAppointmentActionError("");
                    setDeleteAppointment(viewAppointment);
                  }}
                >
                  Delete appointment
                </Button>
                <Button variant="outline" onClick={() => setViewAppointment(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(editAppointment)}
        onOpenChange={(open) => !open && setEditAppointment(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update appointment</DialogTitle>
            <DialogDescription>Changes are saved directly to Supabase.</DialogDescription>
          </DialogHeader>
          <form onSubmit={updateAppointment} className="space-y-4">
            <Field
              label="Date"
              type="date"
              value={editAppointmentForm.date}
              onChange={(value) =>
                setEditAppointmentForm((current) => ({ ...current, date: value }))
              }
              required
            />
            <Field
              label="Time"
              type="time"
              value={editAppointmentForm.time}
              onChange={(value) =>
                setEditAppointmentForm((current) => ({ ...current, time: value }))
              }
              required
            />
            <Field
              label="Visit type"
              value={editAppointmentForm.type}
              onChange={(value) =>
                setEditAppointmentForm((current) => ({ ...current, type: value }))
              }
              required
            />
            <Field
              label="Status"
              as="select"
              value={editAppointmentForm.status}
              options={[
                "Scheduled",
                "Confirmed",
                "Checked In",
                "Waiting",
                "In Consultation",
                "Completed",
                "Cancelled",
                "No Show",
              ]}
              onChange={(value) =>
                setEditAppointmentForm((current) => ({ ...current, status: value }))
              }
            />
            {appointmentActionError ? (
              <p className="text-sm text-red-600">{appointmentActionError}</p>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditAppointment(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={appointmentSaving}>
                {appointmentSaving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(deleteAppointment)}
        onOpenChange={(open) => !open && setDeleteAppointment(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete appointment?</DialogTitle>
            <DialogDescription>
              This permanently deletes appointment {deleteAppointment?.id} from Supabase.
            </DialogDescription>
          </DialogHeader>
          {appointmentActionError ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {appointmentActionError}
            </p>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAppointment(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void confirmDeleteAppointment()}
              disabled={appointmentSaving}
            >
              {appointmentSaving ? "Deleting..." : "Yes, delete appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  as = "input",
  options = [],
  optionValues = options,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  as?: "input" | "select";
  options?: string[];
  optionValues?: string[];
  readOnly?: boolean;
}) {
  return (
    <label className="space-y-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {as === "select" ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="field-control"
          required={required}
        >
          {options.map((option, index) => (
            <option key={optionValues[index] ?? option} value={optionValues[index] ?? option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="field-control"
          required={required}
          readOnly={readOnly}
        />
      )}
    </label>
  );
}
function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">{label}</p>
      <div className="mt-1 text-sm text-slate-700">{children}</div>
    </div>
  );
}

function Kpi({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-3 font-display text-2xl font-semibold text-slate-900">{value}</p>
      <p
        className={`mt-1 text-[11px] ${tone === "warning" ? "text-[#b57918]" : tone === "success" ? "text-[#2d8a76]" : tone === "danger" ? "text-[#d85c3f]" : "text-slate-400"}`}
      >
        {detail}
      </p>
    </article>
  );
}
