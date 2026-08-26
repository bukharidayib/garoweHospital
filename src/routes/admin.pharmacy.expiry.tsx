import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, CalendarClock } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/pharmacy/expiry")({
  head: () => ({ meta: [{ title: "Expiry Management | GGH Management Portal" }] }),
  component: ExpiryPage,
});
function ExpiryPage() {
  const [batches, setBatches] = useState<
    Array<{
      id: string;
      batch: string;
      medicine: string;
      available: number;
      expiry: string;
      days: number;
    }>
  >([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      const client = getSupabaseClient();
      const { data, error: queryError } = await client
        .from("inventory_batches")
        .select("id,batch_number,available_quantity,expiry_date,medicines(name)")
        .eq("hospital_id", GGH_HOSPITAL_ID)
        .order("expiry_date");
      if (!active) return;
      if (queryError) {
        setError(queryError.message);
        return;
      }
      const now = Date.now();
      setBatches(
        (data ?? [])
          .map((item) => ({
            id: item.id,
            batch: item.batch_number,
            medicine:
              (Array.isArray(item.medicines) ? item.medicines[0]?.name : item.medicines?.name) ??
              "Unknown medicine",
            available: Number(item.available_quantity ?? 0),
            expiry: item.expiry_date,
            days: Math.ceil((new Date(item.expiry_date).getTime() - now) / 86400000),
          }))
          .filter((item) => item.days <= 90),
      );
    }
    void load();
    return () => {
      active = false;
    };
  }, []);
  const metrics = useMemo(
    () => ({
      thirty: batches.filter((item) => item.days <= 30 && item.days >= 0).length,
      sixty: batches.filter((item) => item.days <= 60 && item.days >= 0).length,
      ninety: batches.filter((item) => item.days <= 90 && item.days >= 0).length,
      expired: batches.filter((item) => item.days < 0).length,
    }),
    [batches],
  );
  return (
    <AdminShell
      title="Expiry management"
      subtitle="Protect patients by keeping expired stock out of dispensing."
    >
      <AdminSectionHeading
        eyebrow="Batch safety"
        title="Expiry management"
        description="Warning windows are configurable; this mock view uses a 30-day alert window."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Expiring in 30 days" value={String(metrics.thirty)} tone="danger" />
        <Metric label="Expiring in 60 days" value={String(metrics.sixty)} />
        <Metric label="Expiring in 90 days" value={String(metrics.ninety)} />
        <Metric label="Expired batches" value={String(metrics.expired)} />
      </div>
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="size-5 text-[#b57918]" />
            <div>
              <h3 className="font-display font-semibold">Expiry review queue</h3>
              <p className="mt-1 text-xs text-slate-500">
                Expired medicines must be removed from active stock with an EXPIRED movement.
              </p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {batches.map((item) => (
            <div
              key={item.batch}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-800">{item.medicine}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Batch {item.batch} · {item.available} units available
                </p>
              </div>
              <div className="flex items-center gap-6 text-xs">
                <div>
                  <p className="text-slate-400">Expiry date</p>
                  <p className="mt-1 font-semibold">{item.expiry}</p>
                </div>
                <div>
                  <p className="text-slate-400">Days remaining</p>
                  <p className="mt-1 font-semibold text-[#d85c3f]">{item.days}</p>
                </div>
                <button className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-600">
                  Remove from active stock
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Link
        to="/admin/pharmacy/inventory"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#22577a]"
      >
        <ArrowLeft className="size-4" /> Back to inventory
      </Link>
    </AdminShell>
  );
}
function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <CalendarClock
        className={`size-5 ${tone === "danger" ? "text-[#d85c3f]" : "text-[#38a3a5]"}`}
      />
      <p className="mt-3 text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
    </article>
  );
}
