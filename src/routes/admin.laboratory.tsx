import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FlaskConical,
  Plus,
  Search,
  ShieldAlert,
} from "lucide-react";

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
import { labOrders } from "@/content/laboratory";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/laboratory")({
  head: () => ({ meta: [{ title: "Laboratory | GGH Management Portal" }] }),
  component: LaboratoryPage,
});

function LaboratoryPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [orderList, setOrderList] = useState<typeof labOrders>([]);
  const [catalog, setCatalog] = useState<{ id: string; code: string; name: string }[]>([]);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<(typeof labOrders)[number] | null>(null);
  const [newOrder, setNewOrder] = useState({
    patient: "",
    patientNumber: "",
    tests: "",
    requestedBy: "Dr. Ahmed Yusuf",
    priority: "Routine",
  });
  const [selectedTests, setSelectedTests] = useState<string[]>(["CBC"]);
  useEffect(() => {
    let active = true;
    async function loadLaboratory() {
      const client = getSupabaseClient();
      const [ordersResult, testsResult] = await Promise.all([
        client
          .from("lab_orders")
          .select("*")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .order("requested_at", { ascending: false }),
        client
          .from("lab_tests")
          .select("id, code, name")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .eq("active", true)
          .order("name"),
      ]);
      if (!active) return;
      if (ordersResult.error || testsResult.error) {
        setLoadError(
          ordersResult.error?.message ??
            testsResult.error?.message ??
            "Unable to load laboratory data.",
        );
        return;
      }
      setCatalog(testsResult.data ?? []);
      setOrderList(
        (ordersResult.data ?? []).map((row) => ({
          id: row.id,
          orderNumber: row.order_number,
          patientId: row.patient_id,
          patient: row.patient_id,
          patientNumber: row.patient_id,
          visit: row.visit_id ?? "—",
          tests: "See order details",
          requestedBy: row.requested_by ?? "Unassigned",
          department: "Unassigned",
          priority: row.priority,
          requested: new Date(row.requested_at).toLocaleString(),
          status: row.status,
          tat: "—",
        })),
      );
    }
    void loadLaboratory();
    return () => {
      active = false;
    };
  }, []);
  const rows = useMemo(
    () =>
      orderList.filter(
        (row) =>
          `${row.orderNumber} ${row.patient} ${row.patientNumber} ${row.tests} ${row.requestedBy}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (status === "All statuses" || row.status === status),
      ),
    [orderList, query, status],
  );
  const updateOrder = (field: keyof typeof newOrder, value: string) =>
    setNewOrder((current) => ({ ...current, [field]: value }));
  const createLabOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newOrder.patient || selectedTests.length === 0) return;
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("lab_orders")
      .insert({
        hospital_id: GGH_HOSPITAL_ID,
        patient_id: newOrder.patient,
        order_number: `GGH-LAB-${Date.now()}`,
        priority: newOrder.priority,
        status: "Ordered",
        clinical_notes: newOrder.tests,
      })
      .select("*")
      .single();
    if (error || !data) {
      setLoadError(error?.message ?? "Unable to save lab order.");
      return;
    }
    const testRows = catalog.filter((test) => selectedTests.includes(test.code));
    const { error: itemError } = await client.from("lab_order_items").insert(
      testRows.map((test) => ({
        lab_order_id: data.id,
        lab_test_id: test.id,
        status: "Ordered",
      })),
    );
    if (itemError) {
      setLoadError(itemError.message);
      return;
    }
    setOrderList((current) => [
      {
        id: data.id,
        orderNumber: data.order_number,
        patientId: data.patient_id,
        patient: data.patient_id,
        patientNumber: data.patient_id,
        visit: data.visit_id ?? "—",
        tests: testRows.map((test) => test.name).join(" · "),
        requestedBy: data.requested_by ?? "Unassigned",
        department: "Unassigned",
        priority: data.priority,
        requested: new Date(data.requested_at).toLocaleString(),
        status: "Ordered",
        tat: "—",
      },
      ...current,
    ]);
    setNewOpen(false);
    setSelectedTests([catalog[0]?.code ?? ""]);
    return;
    const tests = selectedTests
      .map((code) => catalog.find((item) => item.code === code)?.name ?? code)
      .join(" · ");
    setOrderList((current) => [
      {
        id: `lab-${Date.now()}`,
        orderNumber: `GGH-LAB-2026-${String(189 + current.length).padStart(6, "0")}`,
        patientId: "p-new",
        patient: newOrder.patient,
        patientNumber: newOrder.patientNumber || "Pending",
        visit: "Pending",
        tests,
        requestedBy: newOrder.requestedBy,
        department: "General Medicine",
        priority: newOrder.priority as "Routine" | "Urgent" | "STAT",
        requested: "Just now",
        status: "Ordered" as const,
        tat: "—",
      },
      ...current,
    ]);
    setNewOrderOpen(false);
    setNewOrder({
      patient: "",
      patientNumber: "",
      tests: "",
      requestedBy: "Dr. Ahmed Yusuf",
      priority: "Routine",
    });
    setSelectedTests(["CBC"]);
  };
  if (pathname !== "/admin/laboratory") return <Outlet />;
  return (
    <AdminShell
      title="Laboratory"
      subtitle="Manage laboratory requests, samples, results, and verification."
    >
      <AdminSectionHeading
        eyebrow="Laboratory operations"
        title="Laboratory"
        description="Today's worklist from clinical order to verified result."
        action={
          <div className="flex gap-2">
            <a
              href="/admin/laboratory/catalog"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-[#22577a] transition-colors hover:bg-slate-50"
            >
              Catalog
            </a>
            <Button onClick={() => setNewOrderOpen(true)}>
              <Plus /> New lab order
            </Button>
          </div>
        }
      />
      {loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Laboratory error: {loadError}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Kpi
          label="Pending orders"
          value={String(
            orderList.filter((row) => ["Ordered", "Pending"].includes(row.status)).length,
          )}
          detail="Active requests"
        />
        <Kpi
          label="Awaiting sample"
          value={String(orderList.filter((row) => row.status === "Awaiting Sample").length)}
          detail="Collect next"
          tone="warning"
        />
        <Kpi
          label="Processing"
          value={String(orderList.filter((row) => row.status === "Processing").length)}
          detail="In the lab"
          tone="info"
        />
        <Kpi
          label="Completed today"
          value={String(
            orderList.filter((row) => ["Completed", "Verified"].includes(row.status)).length,
          )}
          detail="Verified orders"
          tone="success"
        />
        <Kpi
          label="Critical results"
          value={String(orderList.filter((row) => row.priority === "STAT").length)}
          detail="Review required"
          tone="danger"
        />
        <Kpi label="Average TAT" value="46 min" detail="Target 60 min" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap gap-2">
              <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3">
                <Search className="size-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search order, patient or test..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none"
              >
                <option>All statuses</option>
                <option>Ordered</option>
                <option>Awaiting Sample</option>
                <option>Sample Collected</option>
                <option>Processing</option>
                <option>Partially Completed</option>
                <option>Verified</option>
              </select>
            </div>
            <span className="text-xs font-medium text-[#2d8a76]">● Updated just now</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  {[
                    "Lab order",
                    "Patient",
                    "Test(s)",
                    "Requested by",
                    "Priority",
                    "Requested",
                    "Status",
                    "TAT",
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
                        onClick={() => setViewOrder(row)}
                        className="font-semibold text-[#22577a] hover:underline"
                      >
                        {row.orderNumber}
                      </button>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {row.visit} · {row.department}
                      </p>
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
                    <td className="px-5 py-4 text-slate-600">{row.tests}</td>
                    <td className="px-5 py-4 text-slate-600">{row.requestedBy}</td>
                    <td className="px-5 py-4">
                      <Priority priority={row.priority} />
                    </td>
                    <td className="px-5 py-4 text-slate-500">{row.requested}</td>
                    <td className="px-5 py-4">
                      <PatientStatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{row.tat}</td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setViewOrder(row)}
                        className="text-xs font-semibold text-[#22577a] hover:underline"
                      >
                        Open order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-500">
                No laboratory requests match your filters.
              </div>
            ) : null}
          </div>
        </section>
        <aside className="space-y-5">
          <section className="rounded-2xl border border-[#f0c987] bg-[#fff9eb] p-5">
            <div className="flex gap-3">
              <ShieldAlert className="mt-0.5 size-5 shrink-0 text-[#b57918]" />
              <div>
                <h3 className="font-display text-base font-semibold">Critical results</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  2 results require authorized review and clinician notification.
                </p>
              </div>
            </div>
            <button className="mt-4 text-xs font-semibold text-[#b57918] hover:underline">
              Review critical results →
            </button>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
            <h3 className="font-display text-base font-semibold">Lab activity</h3>
            <div className="mt-4 space-y-4">
              {[
                "Sample collected · 18 min ago",
                "Result entered · 24 min ago",
                "Result verified · 32 min ago",
              ].map((item) => (
                <div key={item} className="flex gap-3 text-xs">
                  <span className="mt-1 size-2 rounded-full bg-[#38a3a5]" />
                  <span className="text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
      <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New lab order</DialogTitle>
            <DialogDescription>Create a laboratory request for a patient visit.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createLabOrder} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <LabField
                label="Patient name"
                value={newOrder.patient}
                onChange={(value) => updateOrder("patient", value)}
                required
              />
              <LabField
                label="Patient number"
                value={newOrder.patientNumber}
                onChange={(value) => updateOrder("patientNumber", value)}
              />
              <div className="sm:col-span-2">
                <p className="mb-2 text-sm font-medium text-slate-700">Laboratory tests</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {catalog.map((test) => (
                    <label
                      key={test.code}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs transition-colors ${selectedTests.includes(test.code) ? "border-[#38a3a5] bg-[#edf8f7]" : "border-slate-200 bg-white"}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTests.includes(test.code)}
                        onChange={(event) =>
                          setSelectedTests((current) =>
                            event.target.checked
                              ? [...current, test.code]
                              : current.filter((code) => code !== test.code),
                          )
                        }
                        className="mt-0.5 accent-[#22577a]"
                      />
                      <span>
                        <span className="block font-semibold text-slate-800">
                          {test.name}{" "}
                          <span className="font-normal text-slate-400">({test.code})</span>
                        </span>
                        <span className="mt-1 block text-slate-500">
                          {test.category} · {test.sample} · {test.turnaround}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Select multiple tests for one patient order. Each test is processed and resulted
                  independently.
                </p>
              </div>
              <LabField
                label="Requested by"
                value={newOrder.requestedBy}
                onChange={(value) => updateOrder("requestedBy", value)}
              />
              <LabField
                label="Priority"
                as="select"
                value={newOrder.priority}
                onChange={(value) => updateOrder("priority", value)}
                options={["Routine", "Urgent", "STAT"]}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewOrderOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={selectedTests.length === 0}>
                Create lab order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(viewOrder)} onOpenChange={(open) => !open && setViewOrder(null)}>
        <DialogContent className="max-w-2xl">
          {viewOrder ? (
            <>
              <DialogHeader>
                <DialogTitle>{viewOrder.orderNumber}</DialogTitle>
                <DialogDescription>
                  {viewOrder.patient} · {viewOrder.department}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">
                    Ordered tests
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {viewOrder.tests.split(" · ").map((test) => (
                      <span
                        key={test}
                        className="rounded-full bg-[#dceff0] px-2.5 py-1 text-xs font-semibold text-[#22577a]"
                      >
                        {test}
                      </span>
                    ))}
                  </div>
                </div>
                <LabDetail label="Status">
                  <PatientStatusBadge status={viewOrder.status} />
                </LabDetail>
                <LabDetail label="Requested by">{viewOrder.requestedBy}</LabDetail>
                <LabDetail label="Priority">{viewOrder.priority}</LabDetail>
                <LabDetail label="Requested">{viewOrder.requested}</LabDetail>
                <LabDetail label="Turnaround time">{viewOrder.tat}</LabDetail>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewOrder(null)}>
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
function LabField({
  label,
  value,
  onChange,
  placeholder,
  required,
  className = "",
  as = "input",
  options = [],
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  as?: "input" | "select";
  options?: string[];
}) {
  return (
    <label className={`space-y-2 text-sm font-medium text-slate-700 ${className}`}>
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
          placeholder={placeholder}
          className="field-control"
          required={required}
        />
      )}
    </label>
  );
}
function LabDetail({ label, children }: { label: string; children: React.ReactNode }) {
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
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
      <p
        className={`mt-1 text-[11px] ${tone === "danger" ? "text-[#d85c3f]" : tone === "warning" ? "text-[#b57918]" : tone === "success" ? "text-[#2d8a76]" : tone === "info" ? "text-[#22577a]" : "text-slate-400"}`}
      >
        {detail}
      </p>
    </article>
  );
}
function Priority({ priority }: { priority: string }) {
  const tone =
    priority === "STAT"
      ? "bg-[#fbe5df] text-[#d85c3f]"
      : priority === "Urgent"
        ? "bg-[#fcf1da] text-[#b57918]"
        : "bg-slate-100 text-slate-500";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone}`}>{priority}</span>
  );
}
