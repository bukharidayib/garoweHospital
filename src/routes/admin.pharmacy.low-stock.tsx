import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Package } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/pharmacy/low-stock")({
  head: () => ({ meta: [{ title: "Low Stock | GGH Management Portal" }] }),
  component: LowStockPage,
});
function LowStockPage() {
  const [rows, setRows] = useState<
    Array<{
      id: string;
      code: string;
      name: string;
      category: string;
      strength: string;
      stock: number;
      minimum: number;
    }>
  >([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      const client = getSupabaseClient();
      const [medicineResult, batchResult] = await Promise.all([
        client
          .from("medicines")
          .select("id,code,name,category,strength,minimum_stock")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .eq("active", true),
        client
          .from("inventory_batches")
          .select("medicine_id,available_quantity")
          .eq("hospital_id", GGH_HOSPITAL_ID),
      ]);
      if (!active) return;
      if (medicineResult.error || batchResult.error) {
        setError((medicineResult.error ?? batchResult.error)?.message ?? "Could not load stock.");
        return;
      }
      const stock = new Map<string, number>();
      (batchResult.data ?? []).forEach((batch) =>
        stock.set(
          batch.medicine_id,
          (stock.get(batch.medicine_id) ?? 0) + Number(batch.available_quantity ?? 0),
        ),
      );
      setRows(
        (medicineResult.data ?? [])
          .map((item) => ({
            id: item.id,
            code: item.code,
            name: item.name,
            category: item.category ?? "Uncategorized",
            strength: item.strength ?? "",
            stock: stock.get(item.id) ?? 0,
            minimum: Number(item.minimum_stock ?? 0),
          }))
          .filter((item) => item.stock <= item.minimum),
      );
    }
    void load();
    return () => {
      active = false;
    };
  }, []);
  return (
    <AdminShell
      title="Low-stock medicines"
      subtitle="Review medicines at or below their configured minimum threshold."
    >
      <AdminSectionHeading
        eyebrow="Stock alerts"
        title="Low stock"
        description="Restock planning stays outside this MVP; this view gives pharmacy staff a clear action list."
      />
      <section className="rounded-2xl border border-[#f0c987] bg-[#fff9eb] p-5">
        <div className="flex gap-3">
          <AlertTriangle className="size-5 shrink-0 text-[#b57918]" />
          <div>
            <h3 className="font-display font-semibold">{rows.length} medicines need attention</h3>
            <p className="mt-1 text-xs text-slate-600">
              Do not promise availability to patients until stock is confirmed.
            </p>
          </div>
        </div>
      </section>
      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="divide-y divide-slate-100">
          {rows.map((item) => (
            <div
              key={item.code}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-500">
                  <Package className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.code} · {item.category} · {item.strength}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-8 text-xs">
                <div>
                  <p className="text-slate-400">Current</p>
                  <p className="mt-1 font-semibold text-[#d85c3f]">{item.stock}</p>
                </div>
                <div>
                  <p className="text-slate-400">Minimum</p>
                  <p className="mt-1 font-semibold">{item.minimum}</p>
                </div>
                <div>
                  <p className="text-slate-400">Difference</p>
                  <p className="mt-1 font-semibold text-[#b57918]">{item.stock - item.minimum}</p>
                </div>
                <button className="font-semibold text-[#22577a]">View medicine</button>
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
