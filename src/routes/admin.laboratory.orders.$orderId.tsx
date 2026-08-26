import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FlaskConical,
  Save,
  ShieldAlert,
} from "lucide-react";

import { AdminShell, PatientStatusBadge } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { labOrders } from "@/content/laboratory";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/laboratory/orders/$orderId")({
  head: () => ({ meta: [{ title: "Laboratory Order | GGH Management Portal" }] }),
  component: LabOrderPage,
});

function LabOrderPage() {
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<(typeof labOrders)[number] | null>(null);
  const [orderItems, setOrderItems] = useState<
    {
      test: string;
      code: string;
      sample: string;
      status: string;
      result: string;
      reference: string;
      flag: string;
      id?: string;
    }[]
  >([]);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let active = true;
    async function loadOrder() {
      const client = getSupabaseClient();
      const [orderResult, itemsResult] = await Promise.all([
        client
          .from("lab_orders")
          .select("*")
          .eq("id", orderId)
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .single(),
        client
          .from("lab_order_items")
          .select("*, lab_tests(code, name, reference_range)")
          .eq("lab_order_id", orderId),
      ]);
      if (!active) return;
      const error = orderResult.error ?? itemsResult.error;
      if (error || !orderResult.data) {
        setLoadError(error?.message ?? "Lab order not found.");
        return;
      }
      const row = orderResult.data;
      setOrder({
        id: row.id,
        orderNumber: row.order_number,
        patientId: row.patient_id,
        patient: row.patient_id,
        patientNumber: row.patient_id,
        visit: row.visit_id ?? "—",
        tests: "See ordered tests",
        requestedBy: row.requested_by ?? "Unassigned",
        department: "Unassigned",
        priority: row.priority,
        requested: new Date(row.requested_at).toLocaleString(),
        status: row.status,
        tat: "—",
      });
      setOrderItems(
        (itemsResult.data ?? []).map((item) => ({
          id: item.id,
          test: item.lab_tests?.name ?? item.lab_test_id,
          code: item.lab_tests?.code ?? item.lab_test_id,
          sample: item.sample_collected_at
            ? new Date(item.sample_collected_at).toLocaleString()
            : "Sample pending",
          status: item.status,
          result: item.result_value ?? "—",
          reference: item.lab_tests?.reference_range ?? "Awaiting result",
          flag: item.result_flag ?? "Pending",
        })),
      );
    }
    void loadOrder();
    return () => {
      active = false;
    };
  }, [orderId]);
  const [sampleCollected, setSampleCollected] = useState(false);
  const [verified, setVerified] = useState(false);
  if (!order)
    return (
      <AdminShell title="Laboratory order" subtitle="Loading laboratory order from Supabase.">
        <p className="text-sm text-red-600">{loadError || "Loading…"}</p>
      </AdminShell>
    );
  return (
    <AdminShell
      title="Laboratory order"
      subtitle="Review samples, enter results, and verify reports."
    >
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link
          to="/admin/laboratory"
          className="inline-flex items-center gap-1 font-semibold text-[#22577a] hover:underline"
        >
          <ArrowLeft className="size-3.5" /> Laboratory
        </Link>
        <span>/</span>
        <span>{order.orderNumber}</span>
      </div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#38a3a5]">
            Lab order
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">{order.orderNumber}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Requested {order.requested} · {order.requestedBy} · {order.department}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">Print report</Button>
          <Button variant="outline">Sample history</Button>
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold">Ordered tests</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Each test item can progress independently.
                </p>
              </div>
              <div className="flex gap-2">
                <Priority priority={order.priority} />
                <PatientStatusBadge status={verified ? "Verified" : order.status} />
              </div>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.12em] text-slate-400">
                  <tr>
                    {["Test", "Sample", "Status", "Result", "Reference", "Flag", "Action"].map(
                      (head) => (
                        <th key={head} className="px-4 py-3 font-semibold">
                          {head}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orderItems.map((item) => (
                    <tr key={item.code}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-800">{item.test}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{item.code}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{item.sample}</td>
                      <td className="px-4 py-4">
                        <PatientStatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-700">{item.result}</td>
                      <td className="px-4 py-4 text-slate-500">{item.reference}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`font-semibold ${item.flag === "High" ? "text-[#d85c3f]" : item.flag === "Normal" ? "text-[#2d8a76]" : "text-slate-400"}`}
                        >
                          {item.flag}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button className="text-xs font-semibold text-[#22577a] hover:underline">
                          {item.status === "Processing"
                            ? "Enter result"
                            : item.status === "Result Entered"
                              ? "Review"
                              : "View"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">Sample workflow</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Record every handoff without silently changing the order history.
                </p>
              </div>
              <FlaskConical className="size-5 text-[#22577a]" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {[
                ["Ordered", "10:18", true],
                ["Sample collected", sampleCollected ? "10:27" : "Pending", sampleCollected],
                ["Processing", sampleCollected ? "10:34" : "Pending", sampleCollected],
                ["Verified", verified ? "11:02" : "Pending", verified],
              ].map(([label, time, done]) => (
                <div key={label as string} className="rounded-xl bg-slate-50 p-3">
                  <span
                    className={`grid size-7 place-items-center rounded-full ${done ? "bg-[#e4f4ed] text-[#2d8a76]" : "bg-white text-slate-300"}`}
                  >
                    {done ? <CheckCircle2 className="size-4" /> : <Clock3 className="size-4" />}
                  </span>
                  <p className="mt-3 text-xs font-semibold text-slate-700">{label}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{time}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                onClick={async () => {
                  const { error } = await getSupabaseClient()
                    .from("lab_order_items")
                    .update({ status: "Collected", sample_collected_at: new Date().toISOString() })
                    .eq("lab_order_id", orderId);
                  if (error) {
                    setLoadError(error.message);
                    return;
                  }
                  await getSupabaseClient()
                    .from("lab_orders")
                    .update({ status: "Processing" })
                    .eq("id", orderId);
                  setSampleCollected(true);
                }}
                disabled={sampleCollected}
              >
                <FlaskConical /> {sampleCollected ? "Sample collected" : "Collect sample"}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  const { error } = await getSupabaseClient()
                    .from("lab_order_items")
                    .update({ status: "Verified", verified_at: new Date().toISOString() })
                    .eq("lab_order_id", orderId);
                  if (error) {
                    setLoadError(error.message);
                    return;
                  }
                  await getSupabaseClient()
                    .from("lab_orders")
                    .update({ status: "Verified" })
                    .eq("id", orderId);
                  setVerified(true);
                }}
                disabled={!sampleCollected || verified}
              >
                <CheckCircle2 /> {verified ? "Verified" : "Verify results"}
              </Button>
              <Button variant="outline">Reject sample</Button>
            </div>
          </section>
          <section className="rounded-2xl border border-[#dceff0] bg-[#edf5f5] p-5">
            <div className="flex gap-3">
              <Save className="mt-0.5 size-5 shrink-0 text-[#22577a]" />
              <div>
                <p className="text-sm font-semibold">Result entry workspace</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Numeric, positive/negative, and text results are supported. Reference ranges
                  should be snapshotted when a result is entered.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <input className="field-control" placeholder="Result value" />
                  <input className="field-control" placeholder="Unit" />
                  <select className="field-control">
                    <option>Normal</option>
                    <option>High</option>
                    <option>Low</option>
                    <option>Critical</option>
                    <option>Positive</option>
                  </select>
                </div>
                <Button size="sm" className="mt-4">
                  Save result draft
                </Button>
              </div>
            </div>
          </section>
        </div>
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-[#dceff0] text-xs font-bold text-[#22577a]">
                SN
              </span>
              <div>
                <p className="font-semibold text-slate-800">{order.patient}</p>
                <p className="text-xs text-slate-400">
                  {order.patientNumber} · Visit {order.visit}
                </p>
              </div>
            </div>
            <dl className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500">Department</dt>
                <dd className="font-semibold">{order.department}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Requested by</dt>
                <dd className="font-semibold">{order.requestedBy}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Priority</dt>
                <dd className="font-semibold">{order.priority}</dd>
              </div>
            </dl>
            <Link
              to="/admin/patients/$patientId"
              params={{ patientId: order.patientId }}
              className="mt-5 block text-xs font-semibold text-[#22577a] hover:underline"
            >
              View patient context →
            </Link>
          </section>
          <section className="rounded-2xl border border-[#f0c987] bg-[#fff9eb] p-5">
            <div className="flex gap-3">
              <ShieldAlert className="mt-0.5 size-5 shrink-0 text-[#b57918]" />
              <div>
                <h3 className="text-sm font-semibold">Safety review</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Only authorized laboratory staff may verify or amend results. Critical values
                  require clinician notification.
                </p>
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
            <h3 className="font-display text-base font-semibold">Audit trail</h3>
            <div className="mt-4 space-y-3 text-xs text-slate-500">
              <p>Order created · Reception · 10:18</p>
              <p>Sample collected · {sampleCollected ? "Lab Tech Fatima · 10:27" : "Pending"}</p>
              <p>Result verified · {verified ? "Senior Lab Tech · 11:02" : "Pending"}</p>
            </div>
          </section>
        </aside>
      </div>
    </AdminShell>
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
