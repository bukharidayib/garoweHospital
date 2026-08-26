import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Bell,
  CalendarDays,
  ClipboardList,
  ChevronDown,
  CircleHelp,
  FlaskConical,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  MoreHorizontal,
  Pill,
  ReceiptText,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Siren,
  Stethoscope,
  UserPlus,
  Users,
  X,
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

import { Icon } from "@/components/site/Icon";
import { Button } from "@/components/ui/button";
import {
  appointments as seedAppointments,
  alerts as seedAlerts,
  activities as seedActivities,
  dashboardKpis as seedDashboardKpis,
  departmentVisits as seedDepartmentVisits,
  patientDistribution as seedPatientDistribution,
  recentPatients as seedRecentPatients,
  revenueTrend as seedRevenueTrend,
  visitTrend as seedVisitTrend,
} from "@/content/dashboard";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

const navGroups = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard, active: true }],
  },
  {
    label: "Operations",
    items: [
      { label: "Patients", to: "/admin/patients", icon: Users },
      { label: "Appointments", to: "/admin/appointments", icon: CalendarDays },
    ],
  },
  {
    label: "Clinical",
    items: [
      { label: "Laboratory", to: "/admin/laboratory", icon: FlaskConical },
      { label: "Prescriptions", to: "/admin/prescriptions", icon: ClipboardList },
      { label: "Pharmacy", to: "/admin/pharmacy", icon: Pill },
      { label: "Billing", to: "/admin/billing", icon: ReceiptText },
      { label: "Reports", to: "/admin/reports", icon: Activity },
    ],
  },
];

export function DashboardPage() {
  const [mobileNav, setMobileNav] = useState(false);
  const [range, setRange] = useState("Today");
  const [department, setDepartment] = useState("All departments");
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [refreshToken, setRefreshToken] = useState(0);
  const [query, setQuery] = useState("");
  const [sortNewest, setSortNewest] = useState(true);
  const [dashboardKpis, setDashboardKpis] = useState<typeof seedDashboardKpis>([]);
  const [appointments, setAppointments] = useState<typeof seedAppointments>([]);
  const [visitTrend, setVisitTrend] = useState<typeof seedVisitTrend>([]);
  const [patientDistribution, setPatientDistribution] = useState<typeof seedPatientDistribution>(
    [],
  );
  const [departmentVisits, setDepartmentVisits] = useState<typeof seedDepartmentVisits>([]);
  const [revenueTrend, setRevenueTrend] = useState<typeof seedRevenueTrend>([]);
  const [recentPatients, setRecentPatients] = useState<typeof seedRecentPatients>([]);
  const [activities, setActivities] = useState<typeof seedActivities>([]);
  const [alerts, setAlerts] = useState<typeof seedAlerts>([]);
  const [labOverview, setLabOverview] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    critical: 0,
  });
  const [pharmacyOverview, setPharmacyOverview] = useState({
    pending: 0,
    dispensed: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      const client = getSupabaseClient();
      const [
        patientsResult,
        appointmentsResult,
        visitsResult,
        bedsResult,
        paymentsResult,
        labOrdersResult,
        prescriptionsResult,
        inventoryResult,
        medicinesResult,
      ] = await Promise.all([
        client
          .from("patients")
          .select("*")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .order("created_at", { ascending: false }),
        client
          .from("appointments")
          .select("*")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .order("appointment_at", { ascending: true }),
        client
          .from("visits")
          .select("*")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .order("created_at", { ascending: false }),
        client.from("beds").select("status").eq("hospital_id", GGH_HOSPITAL_ID),
        client.from("payments").select("amount, received_at").eq("hospital_id", GGH_HOSPITAL_ID),
        client
          .from("lab_orders")
          .select("status, priority, requested_at")
          .eq("hospital_id", GGH_HOSPITAL_ID),
        client
          .from("prescriptions")
          .select("status, created_at")
          .eq("hospital_id", GGH_HOSPITAL_ID),
        client
          .from("inventory_batches")
          .select("medicine_id, available_quantity")
          .eq("hospital_id", GGH_HOSPITAL_ID),
        client.from("medicines").select("id, minimum_stock").eq("hospital_id", GGH_HOSPITAL_ID),
      ]);
      if (!active) return;
      const firstError = [
        patientsResult,
        appointmentsResult,
        visitsResult,
        bedsResult,
        paymentsResult,
        labOrdersResult,
        prescriptionsResult,
        inventoryResult,
        medicinesResult,
      ].find((result) => result.error)?.error;
      if (firstError) {
        setDashboardError(firstError.message);
        return;
      }
      setDashboardError("");
      const patientRows = patientsResult.data ?? [];
      const appointmentRows = appointmentsResult.data ?? [];
      const visitRows = visitsResult.data ?? [];
      const today = new Date().toISOString().slice(0, 10);
      const dayAppointments = appointmentRows.filter(
        (row) => row.appointment_at.slice(0, 10) === today,
      );
      const waiting = visitRows.filter((row) => row.status === "Waiting").length;
      const consultations = visitRows.filter((row) =>
        ["In Consultation", "Completed"].includes(row.status),
      ).length;
      const dayPayments = (paymentsResult.data ?? []).filter(
        (row) => row.received_at?.slice(0, 10) === today,
      );
      const revenue = dayPayments.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
      const labOrders = labOrdersResult.data ?? [];
      const prescriptions = prescriptionsResult.data ?? [];
      const medicines = medicinesResult.data ?? [];
      const availableByMedicine = new Map<string, number>();
      for (const batch of inventoryResult.data ?? []) {
        availableByMedicine.set(
          batch.medicine_id,
          (availableByMedicine.get(batch.medicine_id) ?? 0) + Number(batch.available_quantity ?? 0),
        );
      }
      const beds = bedsResult.data ?? [];
      const occupied = beds.filter((row) => row.status === "Occupied").length;
      const available = beds.filter((row) => row.status === "Available").length;
      setDashboardKpis([
        {
          label: "Patients today",
          value: String(patientRows.filter((row) => row.created_at.slice(0, 10) === today).length),
          detail: "Registered today",
          icon: "Users",
        },
        {
          label: "Appointments",
          value: String(dayAppointments.length),
          detail: "Scheduled today",
          icon: "CalendarDays",
        },
        {
          label: "Patients waiting",
          value: String(waiting),
          detail: "Current queue",
          trendTone: "negative",
          icon: "Clock3",
        },
        {
          label: "Consultations",
          value: String(consultations),
          detail: "Current visits",
          icon: "Stethoscope",
        },
        { label: "Current admissions", value: "0", detail: "Admissions", icon: "BedDouble" },
        {
          label: "Available beds",
          value: String(available),
          detail: `${occupied} occupied`,
          icon: "LayoutGrid",
        },
        {
          label: "Revenue today",
          value: `$${revenue.toLocaleString()}`,
          detail: "Recorded payments",
          icon: "Banknote",
        },
        { label: "Outstanding bills", value: "$0", detail: "Invoices", icon: "ReceiptText" },
      ]);
      setLabOverview({
        pending: labOrders.filter((row) => ["Pending", "Ordered"].includes(row.status)).length,
        processing: labOrders.filter((row) => ["Processing", "In Progress"].includes(row.status))
          .length,
        completed: labOrders.filter((row) => ["Completed", "Verified"].includes(row.status)).length,
        critical: labOrders.filter(
          (row) => row.priority === "Critical" || row.status === "Critical",
        ).length,
      });
      setPharmacyOverview({
        pending: prescriptions.filter((row) => ["Pending", "Sent to Pharmacy"].includes(row.status))
          .length,
        dispensed: prescriptions.filter((row) => ["Dispensed", "Completed"].includes(row.status))
          .length,
        lowStock: medicines.filter((medicine) => {
          const available = availableByMedicine.get(medicine.id) ?? 0;
          return available > 0 && available <= Number(medicine.minimum_stock ?? 0);
        }).length,
        outOfStock: medicines.filter((medicine) => (availableByMedicine.get(medicine.id) ?? 0) <= 0)
          .length,
      });
      setAppointments(
        dayAppointments.map((row, index) => ({
          id: row.id.slice(0, 8).toUpperCase(),
          patient: row.patient_id,
          number: row.patient_id,
          doctor: row.doctor_id ?? "Unassigned",
          department: row.department_id ?? "Unassigned",
          time: new Date(row.appointment_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: row.visit_type,
          status: row.status,
        })),
      );
      setVisitTrend([
        {
          day: "Today",
          total: visitRows.length,
          appointments: dayAppointments.length,
          walkIns: visitRows.filter((row) => row.visit_type === "Walk-in").length,
        },
      ]);
      setPatientDistribution([
        { name: "Appointments", value: dayAppointments.length, color: "#22577a" },
        {
          name: "Walk-ins",
          value: visitRows.filter((row) => row.visit_type === "Walk-in").length,
          color: "#38a3a5",
        },
        {
          name: "Emergency",
          value: visitRows.filter((row) => row.visit_type === "Emergency").length,
          color: "#e76f51",
        },
      ]);
      setDepartmentVisits([]);
      setRevenueTrend([{ day: "Today", collected: revenue, outstanding: 0 }]);
      setRecentPatients(
        patientRows.slice(0, 6).map((row) => ({
          name: `${row.first_name} ${row.last_name}`,
          number: row.patient_number,
          demographic: row.gender ?? "",
          visit: "Registered",
          department: row.department_id ?? "Unassigned",
          status: row.status,
        })),
      );
      setActivities([]);
      setAlerts([]);
    }
    void loadDashboard();
    return () => {
      active = false;
    };
  }, [refreshToken]);
  const departmentRatio =
    department === "All departments"
      ? 1
      : (departmentVisits.find((entry) => entry.name === department)?.visits ?? 0) /
        departmentVisits.reduce((total, entry) => total + entry.visits, 0);
  const rangeRatio = range === "Yesterday" ? 0.9 : range === "Last 30 days" ? 4 : 1;
  const dataRatio = departmentRatio * rangeRatio;
  const scale = useCallback(
    (value: number) => Math.max(0, Math.round(value * dataRatio)),
    [dataRatio],
  );
  const filteredAppointments = useMemo(() => {
    const rows = appointments.filter(
      (row) =>
        (department === "All departments" || row.department === department) &&
        `${row.patient} ${row.number} ${row.doctor} ${row.department} ${row.id}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
    return sortNewest ? rows : [...rows].reverse();
  }, [department, query, sortNewest]);
  const scopedAppointments = useMemo(
    () =>
      appointments.filter(
        (row) => department === "All departments" || row.department === department,
      ),
    [department],
  );
  const visibleVisitTrend = useMemo(() => {
    const source =
      range === "Today"
        ? visitTrend.slice(-1)
        : range === "Yesterday"
          ? [{ ...visitTrend[5], day: "Yesterday" }]
          : visitTrend;
    return source.map((point) => ({
      ...point,
      total: scale(point.total),
      appointments: scale(point.appointments),
      walkIns: scale(point.walkIns),
    }));
  }, [range, scale]);
  const visiblePatientDistribution = useMemo(
    () => patientDistribution.map((entry) => ({ ...entry, value: scale(entry.value) })),
    [scale],
  );
  const visibleDepartmentVisits = useMemo(
    () =>
      department === "All departments"
        ? departmentVisits.map((entry) => ({ ...entry, visits: scale(entry.visits) }))
        : departmentVisits
            .filter((entry) => entry.name === department)
            .map((entry) => ({ ...entry, visits: scale(entry.visits) })),
    [department, scale],
  );
  const visibleRevenueTrend = useMemo(
    () =>
      revenueTrend.map((entry) => ({
        ...entry,
        collected: scale(entry.collected),
        outstanding: scale(entry.outstanding),
      })),
    [scale],
  );
  const visibleRecentPatients = useMemo(
    () =>
      recentPatients.filter(
        (patient) => department === "All departments" || patient.department === department,
      ),
    [department],
  );
  const visibleActivities = useMemo(
    () =>
      activities.filter(
        (activity) => department === "All departments" || activity.meta.includes(department),
      ),
    [department],
  );
  const visibleAlerts = useMemo(
    () =>
      alerts.map((alert) => {
        const count = alert.title.match(/^\d+/)?.[0];
        return count
          ? { ...alert, title: alert.title.replace(/^\d+/, String(scale(Number(count)))) }
          : alert;
      }),
    [scale],
  );
  const visibleKpis = useMemo(
    () =>
      dashboardKpis.slice(0, 4).map((kpi) => ({
        ...kpi,
        value: kpi.label === "Appointments" ? String(scopedAppointments.length) : kpi.value,
      })),
    [dashboardKpis, scopedAppointments.length],
  );
  const handleRefresh = () => {
    setRefreshToken((current) => current + 1);
    setLastUpdated(new Date());
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-slate-900 lg:flex">
      <aside
        className={`${mobileNav ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-[#123247] text-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#38a3a5] font-display text-lg font-bold">
              +
            </span>
            <span>
              <span className="block font-display text-base font-semibold">GGH Portal</span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-white/55">
                Management system
              </span>
            </span>
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setMobileNav(false)}
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6" aria-label="Admin navigation">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <a
                    key={item.label}
                    href={item.to}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${item.active ? "bg-white/12 font-semibold text-white shadow-sm" : "text-white/65 hover:bg-white/8 hover:text-white"}`}
                  >
                    <item.icon
                      className={`size-[18px] ${item.active ? "text-[#70d2c3]" : "text-white/50"}`}
                    />
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
          <div>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Administration
            </p>
            <a
              href="/admin/settings"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/65 hover:bg-white/8 hover:text-white"
            >
              <Settings className="size-[18px] text-white/50" />
              Settings
            </a>
            <a
              href="/admin/audit-logs"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/65 hover:bg-white/8 hover:text-white"
            >
              <ShieldCheck className="size-[18px] text-white/50" />
              Audit logs
            </a>
          </div>
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/8 p-3">
            <span className="grid size-9 place-items-center rounded-full bg-[#70d2c3] text-xs font-bold text-[#123247]">
              AM
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Admin Manager</p>
              <p className="text-xs text-white/50">Hospital administrator</p>
            </div>
            <LogOut className="size-4 text-white/40" />
          </div>
        </div>
      </aside>
      {mobileNav ? (
        <button
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation overlay"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-20 items-center justify-between gap-4 px-5 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                onClick={() => setMobileNav(true)}
                aria-label="Open navigation"
              >
                <Menu />
              </button>
              <div>
                <p className="text-xs font-medium text-slate-500">Saturday, 22 August 2026</p>
                <h1 className="font-display text-xl font-semibold text-slate-900">
                  Good morning, Administrator
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 md:flex">
                <Search className="size-4" />
                <span>Search patients, appointments...</span>
                <kbd className="ml-4 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px]">
                  ⌘K
                </kbd>
              </div>
              <button
                className="relative rounded-lg p-2.5 text-slate-500 hover:bg-slate-100"
                aria-label="Notifications"
              >
                <Bell className="size-[18px]" />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#e76f51] ring-2 ring-white" />
              </button>
              <button className="hidden items-center gap-2 rounded-lg p-1.5 text-left hover:bg-slate-100 sm:flex">
                <span className="grid size-8 place-items-center rounded-full bg-[#dceff0] text-xs font-bold text-[#22577a]">
                  AM
                </span>
                <span className="hidden text-xs lg:block">
                  <span className="block font-semibold text-slate-700">Admin Manager</span>
                  <span className="block text-slate-400">Administrator</span>
                </span>
                <ChevronDown className="size-4 text-slate-400" />
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] space-y-6 p-5 lg:p-8">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#38a3a5]">
                Operational command center
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900">
                Today at GGH
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Hospital overview and today's operational performance.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={range}
                onChange={(event) => setRange(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#38a3a5]/30"
              >
                <option>Today</option>
                <option>Yesterday</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#38a3a5]/30"
              >
                <option>All departments</option>
                <option>General Medicine</option>
                <option>Emergency</option>
                <option>Pediatrics</option>
                <option>Maternity</option>
                <option>Surgery</option>
              </select>
              <Button
                variant="outline"
                size="icon"
                aria-label="Refresh dashboard"
                onClick={handleRefresh}
                title={`Last updated ${lastUpdated.toLocaleTimeString()}`}
              >
                <RefreshCw
                  className={`size-4 transition-transform ${refreshToken % 2 ? "rotate-180" : ""}`}
                />
              </Button>
            </div>
          </div>
          {dashboardError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Dashboard data could not be loaded from Supabase: {dashboardError}
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {visibleKpis.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </div>
          <div className="grid gap-5 xl:grid-cols-[1.65fr_0.85fr]">
            <ChartCard
              title="Patient visits"
              description={`${range} · appointments, walk-ins and emergency visits`}
              action={
                <select className="rounded-md border-0 bg-slate-50 px-2 py-1 text-xs text-slate-600 outline-none">
                  <option>7 days</option>
                  <option>30 days</option>
                </select>
              }
            >
              <ResponsiveContainer width="100%" height={270}>
                <AreaChart
                  data={visibleVisitTrend}
                  margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="visitFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22577a" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#22577a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e8edf0" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#7c8b96", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#7c8b96", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e8edf0",
                      boxShadow: "0 8px 24px rgba(18,50,71,.08)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Total visits"
                    stroke="#22577a"
                    strokeWidth={2.5}
                    fill="url(#visitFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="appointments"
                    name="Appointments"
                    stroke="#38a3a5"
                    strokeWidth={2}
                    fill="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="walkIns"
                    name="Walk-ins"
                    stroke="#e7a23b"
                    strokeWidth={2}
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard
              title="Patient distribution"
              description={`${visiblePatientDistribution.reduce((total, entry) => total + entry.value, 0)} total visits in ${range.toLowerCase()}`}
            >
              <div className="relative h-[270px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={visiblePatientDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={72}
                      outerRadius={100}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {visiblePatientDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-3xl font-semibold text-slate-900">
                    {visiblePatientDistribution.reduce((total, entry) => total + entry.value, 0)}
                  </span>
                  <span className="text-xs text-slate-500">Total visits</span>
                </div>
              </div>
              <div className="space-y-2">
                {visiblePatientDistribution.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-500">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      {entry.name}
                    </span>
                    <span className="font-semibold text-slate-700">
                      {entry.value}{" "}
                      <span className="font-normal text-slate-400">
                        (
                        {Math.round(
                          (entry.value /
                            Math.max(
                              1,
                              visiblePatientDistribution.reduce(
                                (total, item) => total + item.value,
                                0,
                              ),
                            )) *
                            100,
                        )}
                        %)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <ChartCard title="Visits by department" description="Busiest departments today">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart
                  data={visibleDepartmentVisits}
                  layout="vertical"
                  margin={{ left: 10, right: 16 }}
                >
                  <CartesianGrid horizontal={false} stroke="#edf1f3" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={105}
                    tick={{ fill: "#667784", fontSize: 11 }}
                  />
                  <Tooltip cursor={{ fill: "#f5f8f9" }} />
                  <Bar dataKey="visits" fill="#38a3a5" radius={[0, 5, 5, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Revenue overview" description="Collected vs outstanding · USD">
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart
                  data={visibleRevenueTrend}
                  margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="#edf1f3" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#7c8b96", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#7c8b96", fontSize: 10 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Area
                    type="monotone"
                    dataKey="collected"
                    name="Collected"
                    stroke="#38a3a5"
                    fill="#38a3a5"
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="outstanding"
                    name="Outstanding"
                    stroke="#e7a23b"
                    fill="none"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <StatusWidget
              title="Laboratory overview"
              icon={FlaskConical}
              items={[
                ["Pending tests", String(labOverview.pending), "text-[#e7a23b]"],
                ["Processing", String(labOverview.processing), "text-[#22577a]"],
                ["Completed today", String(labOverview.completed), "text-[#38a3a5]"],
                ["Critical results", String(labOverview.critical), "text-[#e76f51]"],
              ]}
              action="View laboratory"
            />
            <StatusWidget
              title="Pharmacy overview"
              icon={Pill}
              items={[
                ["Prescriptions pending", String(pharmacyOverview.pending), "text-[#e7a23b]"],
                ["Dispensed today", String(pharmacyOverview.dispensed), "text-[#38a3a5]"],
                ["Low stock medicines", String(pharmacyOverview.lowStock), "text-[#e7a23b]"],
                ["Out of stock", String(pharmacyOverview.outOfStock), "text-[#e76f51]"],
              ]}
              action="View pharmacy"
            />
          </div>
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  Today's appointments
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Operational view of scheduled consultations and walk-ins.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                  <Search className="size-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search appointments..."
                    className="w-40 bg-transparent text-xs outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  onClick={() => setSortNewest((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Time{" "}
                  <ChevronDown
                    className={`size-3.5 transition-transform ${sortNewest ? "" : "rotate-180"}`}
                  />
                </button>
                <button
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                  aria-label="More appointment actions"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-xs">
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
                      "",
                    ].map((header) => (
                      <th key={header} className="px-5 py-3 font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-5 py-4 font-semibold text-[#22577a]">{row.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{row.patient}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{row.number}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{row.doctor}</td>
                      <td className="px-5 py-4 text-slate-600">{row.department}</td>
                      <td className="px-5 py-4 font-semibold text-slate-700">{row.time}</td>
                      <td className="px-5 py-4 text-slate-500">{row.type}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-5 py-4">
                        <button
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          aria-label={`More actions for ${row.patient}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAppointments.length === 0 ? (
                <div className="p-10 text-center text-sm text-slate-500">
                  No appointments match your search.
                </div>
              ) : null}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
              <span>
                Showing {filteredAppointments.length} of {scopedAppointments.length} appointments
              </span>
              <div className="flex gap-1">
                <button className="rounded-md border border-slate-200 px-3 py-1.5 hover:bg-slate-50">
                  Previous
                </button>
                <button className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700">
                  1
                </button>
                <button className="rounded-md border border-slate-200 px-3 py-1.5 hover:bg-slate-50">
                  2
                </button>
                <button className="rounded-md border border-slate-200 px-3 py-1.5 hover:bg-slate-50">
                  Next
                </button>
              </div>
            </div>
          </section>
          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <TableCard title="Recent patients" action="View all">
              <div className="space-y-1">
                {visibleRecentPatients.map((patient) => (
                  <div
                    key={patient.number}
                    className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-slate-50"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#dceff0] text-xs font-bold text-[#22577a]">
                      {patient.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {patient.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {patient.number} · {patient.department}
                      </p>
                    </div>
                    <StatusBadge status={patient.status} />
                  </div>
                ))}
              </div>
            </TableCard>
            <TableCard title="Needs attention">
              <div className="space-y-3">
                {visibleAlerts.map((alert) => (
                  <div key={alert.title} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-lg ${alert.level === "Critical" ? "bg-[#fbe5df] text-[#d85c3f]" : alert.level === "Warning" ? "bg-[#fcf1da] text-[#b57918]" : "bg-[#dceff0] text-[#22577a]"}`}
                    >
                      <Icon name={alert.icon} className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800">{alert.title}</p>
                      <button className="mt-1 text-[11px] font-semibold text-[#22577a] hover:underline">
                        {alert.action} <ArrowUpRight className="inline size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </TableCard>
            <TableCard title="Recent activity" action="View all">
              <div className="space-y-4">
                {visibleActivities.map((activity) => (
                  <div key={activity.text} className="flex gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#edf5f5] text-[#38a3a5]">
                      <Icon name={activity.icon} className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold leading-relaxed text-slate-700">
                        {activity.text}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">{activity.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TableCard>
          </div>
        </main>
      </div>
    </div>
  );
}

function KpiCard({ label, value, detail, trend, trendTone, icon }: (typeof dashboardKpis)[number]) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-[#edf5f5] text-[#22577a]">
          <Icon name={icon} className="size-[18px]" />
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px]">
        {trend ? (
          <span
            className={`inline-flex items-center gap-0.5 font-semibold ${trendTone === "negative" ? "text-[#d85c3f]" : "text-[#2d8a76]"}`}
          >
            {trendTone === "negative" ? (
              <ArrowDownRight className="size-3" />
            ) : (
              <ArrowUpRight className="size-3" />
            )}
            {trend}
          </span>
        ) : null}
        <span className="text-slate-400">{detail}</span>
      </div>
    </article>
  );
}
function ChartCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
function StatusWidget({
  title,
  icon: IconComponent,
  items,
  action,
}: {
  title: string;
  icon: typeof FlaskConical;
  items: string[][];
  action: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-[#edf5f5] text-[#22577a]">
          <IconComponent className="size-[18px]" />
        </span>
        <h2 className="font-display text-base font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {items.map(([label, value, tone]) => (
          <div key={label} className="rounded-xl bg-slate-50 p-3">
            <p className="text-[11px] text-slate-500">{label}</p>
            <p className={`mt-1 font-display text-2xl font-semibold ${tone}`}>{value}</p>
          </div>
        ))}
      </div>
      <button className="mt-4 text-xs font-semibold text-[#22577a] hover:underline">
        {action} <ArrowUpRight className="inline size-3" />
      </button>
    </section>
  );
}
function TableCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-slate-900">{title}</h2>
        {action ? (
          <button className="text-xs font-semibold text-[#22577a] hover:underline">{action}</button>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Completed" || status === "Active"
      ? "bg-[#e4f4ed] text-[#2d8a76]"
      : status === "Waiting" || status === "Urgent"
        ? "bg-[#fcf1da] text-[#b57918]"
        : status === "In Consultation" || status === "Checked In"
          ? "bg-[#dceff0] text-[#22577a]"
          : "bg-slate-100 text-slate-500";
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone}`}
    >
      {status}
    </span>
  );
}
