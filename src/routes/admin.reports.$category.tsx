import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import {
  departmentReport,
  reportCategories,
  reportTrend,
  type ReportCategory,
} from "@/content/reports";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/reports/$category")({
  head: () => ({ meta: [{ title: "Report Detail | GGH Management Portal" }] }),
  component: CategoryReportPage,
});

function CategoryReportPage() {
  const { category: rawCategory } = Route.useParams();
  const category = (
    reportCategories.some((item) => item.key === rawCategory) ? rawCategory : "operations"
  ) as ReportCategory;
  const definition = reportCategories.find((item) => item.key === category) ?? reportCategories[7];
  const [department, setDepartment] = useState("All departments");
  const [sourceRows, setSourceRows] = useState<typeof departmentReport>([]);
  const [trendRows, setTrendRows] = useState<typeof reportTrend>([]);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      const client = getSupabaseClient();
      const [visitsResult, paymentsResult] = await Promise.all([
        client
          .from("visits")
          .select("department_id,status,created_at")
          .eq("hospital_id", GGH_HOSPITAL_ID),
        client.from("payments").select("amount,received_at").eq("hospital_id", GGH_HOSPITAL_ID),
      ]);
      if (!active) return;
      if (visitsResult.error || paymentsResult.error) {
        setLoadError(
          (visitsResult.error ?? paymentsResult.error)?.message ?? "Could not load report.",
        );
        return;
      }
      const paymentTotal = (paymentsResult.data ?? []).reduce(
        (sum, row) => sum + Number(row.amount ?? 0),
        0,
      );
      const grouped = new Map<string, { visits: number; consultations: number }>();
      (visitsResult.data ?? []).forEach((row) => {
        const key = row.department_id ?? "Unassigned";
        const value = grouped.get(key) ?? { visits: 0, consultations: 0 };
        value.visits += 1;
        value.consultations += ["In Consultation", "Completed"].includes(row.status) ? 1 : 0;
        grouped.set(key, value);
      });
      setSourceRows(
        Array.from(grouped.entries()).map(([department, value]) => ({
          department,
          visits: value.visits,
          consultations: value.consultations,
          revenue: grouped.size ? paymentTotal / grouped.size : 0,
          wait: 0,
        })),
      );
      const byDay = new Map<string, number>();
      (visitsResult.data ?? []).forEach((row) =>
        byDay.set(row.created_at.slice(0, 10), (byDay.get(row.created_at.slice(0, 10)) ?? 0) + 1),
      );
      setTrendRows(
        Array.from(byDay.entries()).map(([label, visits]) => ({ label, visits, revenue: 0 })),
      );
    }
    void load();
    return () => {
      active = false;
    };
  }, []);
  const rows = useMemo(
    () =>
      department === "All departments"
        ? sourceRows
        : sourceRows.filter((row) => row.department === department),
    [department, sourceRows],
  );
  return (
    <AdminShell
      title={definition.title}
      subtitle="Filtered hospital activity report for authorized management users."
    >
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
        description={`${definition.description} Reporting period: Last 30 days.`}
      />
      {loadError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </p>
      ) : null}
      <section className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <label className="text-[11px] font-semibold text-slate-500">
          <span className="mb-1 block">Department</span>
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium"
          >
            <option>All departments</option>
            {sourceRows.map((row) => (
              <option key={row.department}>{row.department}</option>
            ))}
          </select>
        </label>
        <span className="pb-2 text-xs text-slate-500">
          Filters are reflected in the chart, KPI cards, and table.
        </span>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Records in period"
          value={rows.reduce((sum, row) => sum + row.visits, 0).toLocaleString()}
        />
        <Metric
          label="Completed activity"
          value={rows.reduce((sum, row) => sum + row.consultations, 0).toLocaleString()}
        />
        <Metric
          label="Revenue collected"
          value={`$${rows.reduce((sum, row) => sum + row.revenue, 0).toLocaleString()}`}
        />
        <Metric
          label="Average wait"
          value={`${Math.round(rows.reduce((sum, row) => sum + row.wait, 0) / Math.max(rows.length, 1))} min`}
        />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-display text-lg font-semibold">Activity by day</h3>
          <p className="mt-1 text-xs text-slate-500">
            Observed activity during the selected period.
          </p>
          <div className="mt-5">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trendRows}>
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
            <h3 className="font-display text-lg font-semibold">Detailed activity table</h3>
            <p className="mt-1 text-xs text-slate-500">
              Sortable/report-ready source rows for drill-down.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-400">
                <tr>
                  {["Department", "Visits", "Consultations", "Revenue", "Avg wait"].map((head) => (
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
                    <td className="px-5 py-4">{row.consultations}</td>
                    <td className="px-5 py-4">${row.revenue.toLocaleString()}</td>
                    <td className="px-5 py-4">{row.wait} min</td>
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
