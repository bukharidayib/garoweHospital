import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { reportCategories, type ReportCategory } from "@/content/reports";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/reports/$category")({
  head: () => ({ meta: [{ title: "Report Detail | GGH Management Portal" }] }),
  component: CategoryReportPage,
});

type RecordRow = {
  date: string;
  departmentId: string | null;
  visits: number;
  completed: number;
  revenue: number;
};
type DisplayRow = {
  department: string;
  visits: number;
  completed: number;
  revenue: number;
  wait: number;
};

function dateStart(range: string) {
  const date = new Date();
  if (range === "Today") date.setHours(0, 0, 0, 0);
  else if (range === "Last 7 days") date.setDate(date.getDate() - 6);
  else if (range === "This month") date.setDate(1);
  else if (range === "This quarter") date.setMonth(Math.floor(date.getMonth() / 3) * 3, 1);
  else if (range === "This year") date.setMonth(0, 1);
  else date.setDate(date.getDate() - 29);
  date.setHours(0, 0, 0, 0);
  return date;
}

function CategoryReportPage() {
  const { category: rawCategory } = Route.useParams();
  const category = (
    reportCategories.some((item) => item.key === rawCategory) ? rawCategory : "operations"
  ) as ReportCategory;
  const definition = reportCategories.find((item) => item.key === category) ?? reportCategories[7];
  const [range, setRange] = useState("Last 30 days");
  const [department, setDepartment] = useState("All departments");
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [sourceRows, setSourceRows] = useState<RecordRow[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const client = getSupabaseClient();
      const [
        departmentsResult,
        patientsResult,
        appointmentsResult,
        visitsResult,
        labsResult,
        prescriptionsResult,
        paymentsResult,
        admissionsResult,
      ] = await Promise.all([
        client.from("departments").select("id,name").eq("hospital_id", GGH_HOSPITAL_ID),
        client
          .from("patients")
          .select("id,department_id,created_at")
          .eq("hospital_id", GGH_HOSPITAL_ID),
        client
          .from("appointments")
          .select("department_id,appointment_at,status")
          .eq("hospital_id", GGH_HOSPITAL_ID),
        client
          .from("visits")
          .select("department_id,created_at,status")
          .eq("hospital_id", GGH_HOSPITAL_ID),
        client.from("lab_orders").select("requested_at,status").eq("hospital_id", GGH_HOSPITAL_ID),
        client
          .from("prescriptions")
          .select("department_id,created_at,status")
          .eq("hospital_id", GGH_HOSPITAL_ID),
        client.from("payments").select("amount,received_at").eq("hospital_id", GGH_HOSPITAL_ID),
        client.from("admissions").select("created_at,status").eq("hospital_id", GGH_HOSPITAL_ID),
      ]);
      if (!active) return;
      const error = [
        departmentsResult,
        patientsResult,
        appointmentsResult,
        visitsResult,
        labsResult,
        prescriptionsResult,
        paymentsResult,
        admissionsResult,
      ].find((result) => result.error)?.error;
      if (error) {
        setLoadError(error.message);
        return;
      }
      setDepartments(departmentsResult.data ?? []);
      const start = dateStart(range).getTime();
      const within = (value: string) => new Date(value).getTime() >= start;
      let records: RecordRow[] = [];
      if (category === "patients")
        records = (patientsResult.data ?? [])
          .filter((row) => within(row.created_at))
          .map((row) => ({
            date: row.created_at,
            departmentId: row.department_id,
            visits: 1,
            completed: 1,
            revenue: 0,
          }));
      else if (category === "appointments")
        records = (appointmentsResult.data ?? [])
          .filter((row) => within(row.appointment_at))
          .map((row) => ({
            date: row.appointment_at,
            departmentId: row.department_id,
            visits: 1,
            completed: ["Completed", "Checked In"].includes(row.status) ? 1 : 0,
            revenue: 0,
          }));
      else if (category === "laboratory")
        records = (labsResult.data ?? [])
          .filter((row) => within(row.requested_at))
          .map((row) => ({
            date: row.requested_at,
            departmentId: null,
            visits: 1,
            completed: ["Verified", "Completed"].includes(row.status) ? 1 : 0,
            revenue: 0,
          }));
      else if (category === "pharmacy")
        records = (prescriptionsResult.data ?? [])
          .filter((row) => within(row.created_at))
          .map((row) => ({
            date: row.created_at,
            departmentId: row.department_id,
            visits: 1,
            completed: ["Dispensed", "Completed"].includes(row.status) ? 1 : 0,
            revenue: 0,
          }));
      else if (category === "billing")
        records = (paymentsResult.data ?? [])
          .filter((row) => within(row.received_at))
          .map((row) => ({
            date: row.received_at,
            departmentId: null,
            visits: 1,
            completed: 1,
            revenue: Number(row.amount ?? 0),
          }));
      else if (category === "admissions")
        records = (admissionsResult.data ?? [])
          .filter((row) => within(row.created_at))
          .map((row) => ({
            date: row.created_at,
            departmentId: null,
            visits: 1,
            completed: ["Discharged", "Completed"].includes(row.status) ? 1 : 0,
            revenue: 0,
          }));
      else
        records = (visitsResult.data ?? [])
          .filter((row) => within(row.created_at))
          .map((row) => ({
            date: row.created_at,
            departmentId: row.department_id,
            visits: 1,
            completed: ["In Consultation", "Completed"].includes(row.status) ? 1 : 0,
            revenue: 0,
          }));
      setSourceRows(records);
    }
    void load();
    return () => {
      active = false;
    };
  }, [category, range]);

  const departmentMap = useMemo(
    () => new Map(departments.map((item) => [item.id, item.name])),
    [departments],
  );
  const rows = useMemo<DisplayRow[]>(() => {
    const grouped = new Map<string, DisplayRow>();
    for (const item of sourceRows) {
      const name = item.departmentId
        ? (departmentMap.get(item.departmentId) ?? "Unknown department")
        : "All departments";
      if (department !== "All departments" && name !== department) continue;
      const current = grouped.get(name) ?? {
        department: name,
        visits: 0,
        completed: 0,
        revenue: 0,
        wait: 0,
      };
      current.visits += item.visits;
      current.completed += item.completed;
      current.revenue += item.revenue;
      grouped.set(name, current);
    }
    return Array.from(grouped.values());
  }, [department, departmentMap, sourceRows]);
  const trend = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const item of sourceRows)
      grouped.set(item.date.slice(0, 10), (grouped.get(item.date.slice(0, 10)) ?? 0) + item.visits);
    return Array.from(grouped.entries()).map(([label, visits]) => ({ label, visits }));
  }, [sourceRows]);
  const total = rows.reduce((sum, row) => sum + row.visits, 0);
  const completed = rows.reduce((sum, row) => sum + row.completed, 0);
  const revenue = rows.reduce((sum, row) => sum + row.revenue, 0);
  return (
    <AdminShell title={definition.title} subtitle="Live report data from Supabase.">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link
          to="/admin/reports"
          className="inline-flex items-center gap-1 font-semibold text-[#22577a]"
        >
          <ArrowLeft className="size-3.5" /> Reports & Analytics
        </Link>
        <span>/</span>
        <span>{definition.title}</span>
      </div>
      <AdminSectionHeading
        eyebrow="Report detail"
        title={definition.title}
        description={`${definition.description} All figures are loaded from Supabase.`}
      />
      {loadError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </p>
      ) : null}
      <section className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <label className="text-[11px] font-semibold text-slate-500">
          <span className="mb-1 block">Date range</span>
          <select
            value={range}
            onChange={(event) => setRange(event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium"
          >
            <option>Today</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This month</option>
            <option>This quarter</option>
            <option>This year</option>
          </select>
        </label>
        <label className="text-[11px] font-semibold text-slate-500">
          <span className="mb-1 block">Department</span>
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium"
          >
            <option>All departments</option>
            {departments.map((item) => (
              <option key={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Records in period" value={total.toLocaleString()} />
        <Metric label="Completed activity" value={completed.toLocaleString()} />
        <Metric label="Revenue collected" value={`$${revenue.toLocaleString()}`} />
        <Metric label="Departments represented" value={rows.length.toLocaleString()} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-display text-lg font-semibold">Activity by day</h3>
          <div className="mt-5">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eef1" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={10} />
                <YAxis tickLine={false} axisLine={false} fontSize={10} />
                <Tooltip />
                <Bar dataKey="visits" fill="#22577a" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5">
            <h3 className="font-display text-lg font-semibold">Live report table</h3>
            <p className="mt-1 text-xs text-slate-500">
              Grouped from Supabase records for the selected period.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-400">
                <tr>
                  {["Department", "Records", "Completed", "Revenue"].map((head) => (
                    <th key={head} className="px-5 py-3 font-semibold">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.department}>
                    <td className="px-5 py-4 font-semibold">{row.department}</td>
                    <td className="px-5 py-4">{row.visits}</td>
                    <td className="px-5 py-4">{row.completed}</td>
                    <td className="px-5 py-4">${row.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
    </article>
  );
}
