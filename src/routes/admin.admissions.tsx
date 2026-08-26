import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { ArrowRight, BedDouble, CalendarPlus, Search, Users, UserRoundCheck } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { admissionActivity, admissionRequests, admissions } from "@/content/admissions";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/admissions")({
  head: () => ({ meta: [{ title: "Admissions | GGH Management Portal" }] }),
  component: AdmissionsPage,
});
function AdmissionsPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [admissionList, setAdmissionList] = useState(admissions.map((row) => ({ ...row })));
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [newOpen, setNewOpen] = useState(false);
  const [viewAdmission, setViewAdmission] = useState<(typeof admissions)[number] | null>(null);
  const [newAdmission, setNewAdmission] = useState({
    patient: "",
    ward: "Medical Ward",
    doctor: "Dr. Ahmed Yusuf",
    diagnosis: "",
    priority: "Routine",
  });
  useEffect(() => {
    let active = true;
    async function loadAdmissions() {
      const { data, error } = await getSupabaseClient()
        .from("admissions")
        .select("*")
        .eq("hospital_id", GGH_HOSPITAL_ID)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) {
        setLoadError(error.message);
        setAdmissionList([]);
        return;
      }
      setAdmissionList(
        (data ?? []).map((row) => ({
          id: row.id,
          number: row.admission_number,
          patientId: row.patient_id,
          patient: row.patient_id,
          patientNumber: row.patient_id,
          ward: row.ward_id ?? "Unassigned",
          wardId: row.ward_id ?? "",
          room: "—",
          bed: row.bed_id ?? "—",
          doctor: row.attending_doctor_id ?? "Unassigned",
          admittedAt: row.admitted_at ? new Date(row.admitted_at).toLocaleString() : "Pending",
          los: "—",
          diagnosis: "—",
          status: row.status,
          priority: "Routine",
        })),
      );
    }
    void loadAdmissions();
    return () => {
      active = false;
    };
  }, []);
  const rows = useMemo(
    () =>
      admissionList.filter(
        (row) =>
          `${row.number} ${row.patient} ${row.patientNumber} ${row.ward} ${row.doctor}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (status === "All statuses" || row.status === status),
      ),
    [admissionList, query, status],
  );
  const updateAdmission = (field: keyof typeof newAdmission, value: string) =>
    setNewAdmission((current) => ({ ...current, [field]: value }));
  const createAdmission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newAdmission.patient || !newAdmission.diagnosis) return;
    const { data, error } = await getSupabaseClient()
      .from("admissions")
      .insert({
        hospital_id: GGH_HOSPITAL_ID,
        patient_id: newAdmission.patient,
        ward_id: newAdmission.ward,
        admission_number: `GGH-ADM-${Date.now()}`,
        status: "Pending",
      })
      .select("*")
      .single();
    if (error || !data) {
      setLoadError(error?.message ?? "Unable to save admission.");
      return;
    }
    setAdmissionList((current) => [
      {
        id: data.id,
        number: data.admission_number,
        patientId: data.patient_id,
        patient: newAdmission.patient,
        patientNumber: data.patient_id,
        ward: newAdmission.ward,
        wardId: newAdmission.ward.toLowerCase().replaceAll(" ", "-"),
        room: "Pending",
        bed: "Pending",
        doctor: newAdmission.doctor,
        admittedAt: "Pending",
        los: "0d",
        diagnosis: newAdmission.diagnosis,
        status: "Pending",
        priority: newAdmission.priority,
      },
      ...current,
    ]);
    setNewOpen(false);
    setNewAdmission({
      patient: "",
      ward: "Medical Ward",
      doctor: "Dr. Ahmed Yusuf",
      diagnosis: "",
      priority: "Routine",
    });
  };
  if (pathname !== "/admin/admissions") return <Outlet />;
  return (
    <AdminShell
      title="Admissions"
      subtitle="Manage inpatient admissions, bed capacity, transfers, and discharges."
    >
      <AdminSectionHeading
        eyebrow="Inpatient operations"
        title="Admissions"
        description="Capacity-aware oversight from admission request to discharge."
        action={
          <Button onClick={() => setNewOpen(true)}>
            <CalendarPlus /> New admission
          </Button>
        }
      />
      {loadError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Admissions error: {loadError}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Kpi label="Current inpatients" value="54" detail="Across 4 wards" icon={<Users />} />
        <Kpi
          label="Admissions today"
          value="7"
          detail="3 pending review"
          icon={<UserRoundCheck />}
          tone="info"
        />
        <Kpi label="Discharges today" value="4" detail="2 completed" tone="success" />
        <Kpi
          label="Available beds"
          value="18"
          detail="Usable now"
          icon={<BedDouble />}
          tone="success"
        />
        <Kpi label="Occupied beds" value="54" detail="Of 78 beds" />
        <Kpi label="Occupancy rate" value="69%" detail="Target below 85%" tone="warning" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap gap-2">
              <div className="flex h-10 min-w-[250px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3">
                <Search className="size-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search patient, admission, ward or doctor..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600"
              >
                <option>All statuses</option>
                <option>Admitted</option>
                <option>Transferred</option>
                <option>Discharge Pending</option>
              </select>
            </div>
            <Link to="/admin/bed-board" className="text-xs font-semibold text-[#22577a]">
              Open bed board <ArrowRight className="ml-1 inline size-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-400">
                <tr>
                  {[
                    "Admission",
                    "Patient",
                    "Ward / bed",
                    "Doctor",
                    "Admitted",
                    "LOS",
                    "Reason",
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
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setViewAdmission(row)}
                        className="font-semibold text-[#22577a]"
                      >
                        {row.number}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{row.patient}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{row.patientNumber}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-700">{row.ward}</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {row.room} · {row.bed}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{row.doctor}</td>
                    <td className="px-5 py-4 text-slate-500">{row.admittedAt}</td>
                    <td className="px-5 py-4 font-semibold">{row.los}</td>
                    <td className="max-w-[170px] truncate px-5 py-4 text-slate-600">
                      {row.diagnosis}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setViewAdmission(row)}
                        className="font-semibold text-[#22577a]"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <aside className="space-y-5">
          <section className="rounded-2xl border border-[#f0c987] bg-[#fff9eb] p-5">
            <h3 className="font-display font-semibold">Admission requests</h3>
            <p className="mt-1 text-xs text-slate-600">
              {admissionRequests.length} requests are waiting for placement review.
            </p>
            <div className="mt-4 space-y-3">
              {admissionRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-xl border border-[#f0d9a4] bg-white/70 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800">{request.patient}</p>
                    <Priority value={request.priority} />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {request.requestedWard} · {request.requestedAt}
                  </p>
                </div>
              ))}
            </div>
            <button className="mt-4 text-xs font-semibold text-[#b57918]">
              Review all requests →
            </button>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-display font-semibold">Inpatient attention</h3>
            <div className="mt-4 space-y-3">
              {admissionActivity.map((item) => (
                <div key={item} className="flex gap-3 text-xs">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#38a3a5]" />
                  <span className="leading-relaxed text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New admission</DialogTitle>
            <DialogDescription>Create an inpatient admission request.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createAdmission} className="space-y-4">
            <Field
              label="Patient name"
              value={newAdmission.patient}
              onChange={(value) => updateAdmission("patient", value)}
              required
            />
            <Field
              label="Reason / diagnosis"
              value={newAdmission.diagnosis}
              onChange={(value) => updateAdmission("diagnosis", value)}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Ward"
                as="select"
                value={newAdmission.ward}
                onChange={(value) => updateAdmission("ward", value)}
                options={["Medical Ward", "Pediatric Ward", "Maternity Ward", "Surgical Ward"]}
              />
              <Field
                label="Doctor"
                as="select"
                value={newAdmission.doctor}
                onChange={(value) => updateAdmission("doctor", value)}
                options={["Dr. Ahmed Yusuf", "Dr. Hawa Omar", "Dr. Hassan Ismail"]}
              />
              <Field
                label="Priority"
                as="select"
                value={newAdmission.priority}
                onChange={(value) => updateAdmission("priority", value)}
                options={["Routine", "Urgent", "Emergency"]}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create admission</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(viewAdmission)}
        onOpenChange={(open) => !open && setViewAdmission(null)}
      >
        <DialogContent>
          {viewAdmission ? (
            <>
              <DialogHeader>
                <DialogTitle>{viewAdmission.number}</DialogTitle>
                <DialogDescription>
                  {viewAdmission.patient} · {viewAdmission.ward}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Detail label="Status">
                  <StatusBadge status={viewAdmission.status} />
                </Detail>
                <Detail label="Doctor">{viewAdmission.doctor}</Detail>
                <Detail label="Room / bed">
                  {viewAdmission.room} · {viewAdmission.bed}
                </Detail>
                <Detail label="Admitted">{viewAdmission.admittedAt}</Detail>
                <Detail label="Length of stay">{viewAdmission.los}</Detail>
                <Detail label="Priority">{viewAdmission.priority}</Detail>
                <Detail label="Reason">{viewAdmission.diagnosis}</Detail>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewAdmission(null)}>
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

function Field({
  label,
  value,
  onChange,
  required,
  as = "input",
  options = [],
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  as?: "input" | "select";
  options?: string[];
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
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="field-control"
          required={required}
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
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: string;
  icon?: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      {icon ? (
        <span
          className={`grid size-9 place-items-center rounded-xl ${tone === "success" ? "bg-[#e4f4ed] text-[#2d8a76]" : "bg-[#e6f1f6] text-[#22577a]"}`}
        >
          {icon}
        </span>
      ) : null}
      <p className="mt-3 text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
      <p
        className={`mt-1 text-[11px] ${tone === "warning" ? "text-[#b57918]" : tone === "success" ? "text-[#2d8a76]" : tone === "info" ? "text-[#22577a]" : "text-slate-400"}`}
      >
        {detail}
      </p>
    </article>
  );
}
function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Admitted"
      ? "bg-[#e4f4ed] text-[#2d8a76]"
      : status === "Discharge Pending"
        ? "bg-[#fcf1da] text-[#b57918]"
        : "bg-slate-100 text-slate-500";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone}`}>{status}</span>
  );
}
function Priority({ value }: { value: string }) {
  const tone =
    value === "Emergency"
      ? "bg-[#fbe5df] text-[#d85c3f]"
      : value === "Urgent"
        ? "bg-[#fcf1da] text-[#b57918]"
        : "bg-slate-100 text-slate-500";
  return (
    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${tone}`}>{value}</span>
  );
}
