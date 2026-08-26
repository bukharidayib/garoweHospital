import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BedDouble,
  CalendarDays,
  FlaskConical,
  Pill,
  ReceiptText,
  Stethoscope,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import {
  attentionItems,
  departmentReport,
  paymentReport,
  reportCategories,
  reportTrend,
} from "@/content/reports";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics | GGH Management Portal" }] }),
  component: ReportsPage,
});

const iconMap = {
  users: Users,
  calendar: CalendarDays,
  clinical: Stethoscope,
  lab: FlaskConical,
  pharmacy: Pill,
  billing: ReceiptText,
  beds: BedDouble,
  operations: Activity,
  staff: Users,
};

function ReportsPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [filters, setFilters] = useState({
    range: "Last 30 days",
    department: "All departments",
    doctor: "All doctors",
    visitType: "All visit types",
    comparison: "Previous period",
  });
  const [updated, setUpdated] = useState("2 min ago");
  const [departmentRows, setDepartmentRows] = useState<typeof departmentReport>([]);
  const [trendRows, setTrendRows] = useState<typeof reportTrend>([]);
  const [paymentRows, setPaymentRows] = useState<typeof paymentReport>([]);
  const [loadError, setLoadError] = useState("");
  const [reportCounts, setReportCounts] = useState({
    appointments: 0,
    admissions: 0,
    labPending: 0,
  });
  useEffect(() => {
    let active = true;
    async function loadReports() {
      const client = getSupabaseClient();
      const [visitsResult, paymentsResult, appointmentsResult, admissionsResult, labOrdersResult] =
        await Promise.all([
          client
            .from("visits")
            .select("department_id, status, created_at")
            .eq("hospital_id", GGH_HOSPITAL_ID),
          client
            .from("payments")
            .select("amount, payment_method, received_at")
            .eq("hospital_id", GGH_HOSPITAL_ID),
          client.from("appointments").select("id").eq("hospital_id", GGH_HOSPITAL_ID),
          client.from("admissions").select("id").eq("hospital_id", GGH_HOSPITAL_ID),
          client.from("lab_orders").select("status").eq("hospital_id", GGH_HOSPITAL_ID),
        ]);
      if (!active) return;
      const error =
        visitsResult.error ??
        paymentsResult.error ??
        appointmentsResult.error ??
        admissionsResult.error ??
        labOrdersResult.error;
      if (error) {
        setLoadError(error.message);
        return;
      }
      setReportCounts({
        appointments: appointmentsResult.data?.length ?? 0,
        admissions: admissionsResult.data?.length ?? 0,
        labPending: (labOrdersResult.data ?? []).filter((row) =>
          ["Pending", "Ordered", "Processing", "In Progress"].includes(row.status),
        ).length,
      });
      const byDepartment = new Map<string, { visits: number; consultations: number }>();
      for (const row of visitsResult.data ?? []) {
        const current = byDepartment.get(row.department_id ?? "Unassigned") ?? {
          visits: 0,
          consultations: 0,
        };
        current.visits += 1;
        current.consultations += ["In Consultation", "Completed"].includes(row.status) ? 1 : 0;
        byDepartment.set(row.department_id ?? "Unassigned", current);
      }
      setDepartmentRows(
        Array.from(byDepartment.entries()).map(([department, value]) => ({
          department,
          visits: value.visits,
          consultations: value.consultations,
          revenue: 0,
          wait: 0,
        })),
      );
      const byDay = new Map<string, number>();
      for (const row of visitsResult.data ?? []) {
        const day = row.created_at.slice(0, 10);
        byDay.set(day, (byDay.get(day) ?? 0) + 1);
      }
      setTrendRows(
        Array.from(byDay.entries())
          .slice(-7)
          .map(([label, visits]) => ({ label, visits, revenue: 0 })),
      );
      const byMethod = new Map<string, number>();
      for (const row of paymentsResult.data ?? [])
        byMethod.set(
          row.payment_method,
          (byMethod.get(row.payment_method) ?? 0) + Number(row.amount ?? 0),
        );
      setPaymentRows(Array.from(byMethod.entries()).map(([name, amount]) => ({ name, amount })));
    }
    void loadReports();
    return () => {
      active = false;
    };
  }, []);
  const dataFactor = 1;
  const filteredDepartments = useMemo(
    () =>
      (filters.department === "All departments"
        ? departmentRows
        : departmentRows.filter((item) => item.department === filters.department)
      ).map((item) => ({
        ...item,
        visits: Math.max(0, Math.round(item.visits * dataFactor)),
        consultations: Math.max(0, Math.round(item.consultations * dataFactor)),
        revenue: Math.max(0, Math.round(item.revenue * dataFactor)),
        wait: Math.max(1, Math.round(item.wait * (filters.visitType === "Emergency" ? 1.3 : 1))),
      })),
    [dataFactor, departmentRows, filters.department, filters.visitType],
  );
  const filteredTrend = trendRows.map((item) => ({
    ...item,
    visits: Math.max(0, Math.round(item.visits * dataFactor)),
    revenue: Math.max(0, Math.round(item.revenue * dataFactor)),
  }));
  const filteredPayments = paymentRows.map((item) => ({
    ...item,
    amount: Math.max(0, Math.round(item.amount * dataFactor)),
  }));
  const totalVisits = filteredDepartments.reduce((sum, row) => sum + row.visits, 0);
  const totalRevenue = filteredDepartments.reduce((sum, row) => sum + row.revenue, 0);
  const totalConsultations = filteredDepartments.reduce((sum, row) => sum + row.consultations, 0);
  const averageWait = Math.round(
    filteredDepartments.reduce((sum, row) => sum + row.wait, 0) /
      Math.max(filteredDepartments.length, 1),
  );
  if (pathname !== "/admin/reports") return <Outlet />;
  return (
    <AdminShell
      title="Reports & Analytics"
      subtitle="Monitor hospital performance, clinical activity, operations, and financial trends."
    >
      <AdminSectionHeading
        eyebrow="Management intelligence"
        title="Reports & Analytics"
        description="A clear view of hospital activity and the areas requiring management attention."
      />
      {loadError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Reports error: {loadError}
        </p>
      ) : null}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        onClear={() =>
          setFilters({
            range: "Last 30 days",
            department: "All departments",
            doctor: "All doctors",
            visitType: "All visit types",
            comparison: "Previous period",
          })
        }
      />
      <div className="mb-5 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {filters.range.toLowerCase()} · {filters.department}
        </span>
        <button className="font-semibold text-[#22577a]" onClick={() => setUpdated("just now")}>
          Refresh · Last updated {updated}
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Kpi
          label="Total visits"
          value={totalVisits.toLocaleString()}
          trend={filters.comparison === "No comparison" ? "No comparison" : "Compared period"}
          tone="positive"
        />
        <Kpi
          label="Revenue collected"
          value={`$${totalRevenue.toLocaleString()}`}
          trend="Filtered collected revenue"
          tone="positive"
        />
        <Kpi
          label="Appointments"
          value={reportCounts.appointments.toLocaleString()}
          trend={`${filters.visitType} activity`}
        />
        <Kpi
          label="Admissions"
          value={reportCounts.admissions.toLocaleString()}
          trend={`${filters.department} activity`}
        />
        <Kpi
          label="Average wait"
          value={`${averageWait} min`}
          trend={filters.visitType === "Emergency" ? "Emergency wait pattern" : "Filtered average"}
          tone="negative"
        />
        <Kpi
          label="Lab pending"
          value={reportCounts.labPending.toLocaleString()}
          trend="Filtered pending work"
          tone="warning"
        />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <ChartCard
          title="Patient activity trend"
          subtitle="Visits across the selected reporting period."
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={filteredTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eef1" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="visits"
                stroke="#22577a"
                fill="#dceff0"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Payment methods" subtitle="Collected amount, not transaction count.">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={filteredPayments}
                dataKey="amount"
                nameKey="name"
                innerRadius={72}
                outerRadius={100}
                paddingAngle={3}
              >
                {filteredPayments.map((item, index) => (
                  <Cell
                    key={item.name}
                    fill={["#22577a", "#38a3a5", "#70d2c3", "#e8a44a"][index]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {paymentReport.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: ["#22577a", "#38a3a5", "#70d2c3", "#e8a44a"][index] }}
                />
                {item.name}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <ChartCard
          title="Department activity"
          subtitle="Observed workload summary for management review."
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={filteredDepartments} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8eef1" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="department"
                type="category"
                width={120}
                tickLine={false}
                axisLine={false}
                fontSize={10}
              />
              <Tooltip />
              <Bar dataKey="visits" fill="#38a3a5" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h3 className="font-display text-lg font-semibold">Department performance</h3>
              <p className="mt-1 text-xs text-slate-500">
                Activity metrics, not a quality ranking.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
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
                {filteredDepartments.map((row) => (
                  <tr key={row.department} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-800">{row.department}</td>
                    <td className="px-5 py-4">{row.visits}</td>
                    <td className="px-5 py-4">{row.consultations}</td>
                    <td className="px-5 py-4 font-semibold">${row.revenue.toLocaleString()}</td>
                    <td className="px-5 py-4 text-slate-500">{row.wait} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <section className="mt-5 rounded-2xl border border-[#f0c987] bg-[#fff9eb] p-5">
        <h3 className="font-display text-lg font-semibold">Needs attention</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {attentionItems.map((item) => (
            <div
              key={item}
              className="rounded-xl bg-white/70 p-3 text-xs leading-relaxed text-slate-600"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#38a3a5]">
              Explore reports
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">Report categories</h2>
          </div>
          <span className="text-xs text-slate-500">{reportCategories.length} available views</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reportCategories.map((category) => {
            const Icon = iconMap[category.icon as keyof typeof iconMap];
            return (
              <Link
                key={category.key}
                to="/admin/reports/$category"
                params={{ category: category.key }}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#9acfd0] hover:shadow-[0_12px_30px_-22px_rgba(18,50,71,.5)]"
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#edf5f5] text-[#22577a]">
                    <Icon className="size-5" />
                  </span>
                  <ArrowRight className="size-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-[#22577a]" />
                </div>
                <h3 className="mt-4 font-display font-semibold">{category.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {category.description}
                </p>
                <p className="mt-4 text-[11px] font-semibold text-[#22577a]">
                  {category.key === "patients"
                    ? `${totalVisits.toLocaleString()} filtered visits`
                    : category.key === "billing"
                      ? `$${totalRevenue.toLocaleString()} filtered revenue`
                      : category.key === "clinical"
                        ? `${totalConsultations.toLocaleString()} filtered consultations`
                        : `${Math.round(dataFactor * 100)}% of base period selected`}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}

function FilterBar({
  filters,
  setFilters,
  onClear,
}: {
  filters: Record<string, string>;
  setFilters: React.Dispatch<React.SetStateAction<typeof filters>>;
  onClear: () => void;
}) {
  return (
    <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-end gap-3">
        <Select
          label="Date range"
          value={filters.range}
          options={[
            "Today",
            "Last 7 days",
            "Last 30 days",
            "This month",
            "This quarter",
            "This year",
          ]}
          onChange={(value) => setFilters((current) => ({ ...current, range: value }))}
        />
        <Select
          label="Department"
          value={filters.department}
          options={["All departments", ...departmentReport.map((item) => item.department)]}
          onChange={(value) => setFilters((current) => ({ ...current, department: value }))}
        />
        <Select
          label="Doctor"
          value={filters.doctor}
          options={["All doctors", "Dr. Ahmed Yusuf", "Dr. Hawa Omar", "Dr. Hassan Ismail"]}
          onChange={(value) => setFilters((current) => ({ ...current, doctor: value }))}
        />
        <Select
          label="Visit type"
          value={filters.visitType}
          options={["All visit types", "Appointment", "Walk-in", "Emergency", "Inpatient"]}
          onChange={(value) => setFilters((current) => ({ ...current, visitType: value }))}
        />
        <Select
          label="Comparison"
          value={filters.comparison}
          options={["No comparison", "Previous period", "Previous month", "Previous year"]}
          onChange={(value) => setFilters((current) => ({ ...current, comparison: value }))}
        />
        <button onClick={onClear} className="h-10 px-2 text-xs font-semibold text-[#22577a]">
          Clear filters
        </button>
      </div>
    </section>
  );
}
function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-[11px] font-semibold text-slate-500">
      <span className="mb-1 block">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}
function Kpi({
  label,
  value,
  trend,
  tone = "neutral",
}: {
  label: string;
  value: string;
  trend: string;
  tone?: "positive" | "negative" | "warning" | "neutral";
}) {
  const trendClass =
    tone === "positive"
      ? "text-[#2d8a76]"
      : tone === "negative"
        ? "text-[#d85c3f]"
        : tone === "warning"
          ? "text-[#b57918]"
          : "text-slate-500";
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
      <p className={`mt-1 text-[11px] font-semibold ${trendClass}`}>{trend}</p>
    </article>
  );
}
