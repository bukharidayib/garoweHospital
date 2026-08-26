import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Edit3, PackagePlus, Plus, Search, SlidersHorizontal } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/pharmacy/medicines")({
  head: () => ({ meta: [{ title: "Medicines | GGH Management Portal" }] }),
  component: MedicinesPage,
});
function MedicinesPage() {
  const [query, setQuery] = useState("");
  const [medicines, setMedicines] = useState<
    Array<{
      id: string;
      code: string;
      name: string;
      generic: string;
      category: string;
      form: string;
      strength: string;
      unit: string;
      price: number;
      stock: number;
      minimum: number;
      status: string;
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
          .select(
            "id,code,name,generic_name,category,form,strength,unit,price,minimum_stock,active",
          )
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .order("name"),
        client
          .from("inventory_batches")
          .select("medicine_id,available_quantity")
          .eq("hospital_id", GGH_HOSPITAL_ID),
      ]);
      if (!active) return;
      if (medicineResult.error || batchResult.error) {
        setError(
          (medicineResult.error ?? batchResult.error)?.message ?? "Could not load medicines.",
        );
        return;
      }
      const stock = new Map<string, number>();
      (batchResult.data ?? []).forEach((batch) =>
        stock.set(
          batch.medicine_id,
          (stock.get(batch.medicine_id) ?? 0) + Number(batch.available_quantity ?? 0),
        ),
      );
      setMedicines(
        (medicineResult.data ?? []).map((item) => {
          const current = stock.get(item.id) ?? 0;
          const minimum = Number(item.minimum_stock ?? 0);
          return {
            id: item.id,
            code: item.code,
            name: item.name,
            generic: item.generic_name ?? "",
            category: item.category ?? "Uncategorized",
            form: item.form ?? "",
            strength: item.strength ?? "",
            unit: item.unit ?? "unit",
            price: Number(item.price ?? 0),
            stock: current,
            minimum,
            status: !item.active ? "Inactive" : current <= minimum ? "Low Stock" : "In Stock",
          };
        }),
      );
    }
    void load();
    return () => {
      active = false;
    };
  }, []);
  const rows = medicines.filter((item) =>
    `${item.name} ${item.generic} ${item.code} ${item.category}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <AdminShell
      title="Medicine catalog"
      subtitle="Manage active medicines, prices, and stock thresholds."
    >
      <AdminSectionHeading
        eyebrow="Pharmacy inventory"
        title="Medicine catalog"
        description="A focused catalog for prescribing and dispensing."
        action={
          <Button>
            <Plus /> Add medicine
          </Button>
        }
      />
      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div className="flex h-10 min-w-[280px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3">
            <Search className="size-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search medicine, generic name or code..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600">
            <SlidersHorizontal className="size-4" /> Filters
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-400">
              <tr>
                {[
                  "Medicine",
                  "Code / generic",
                  "Category",
                  "Form",
                  "Price",
                  "Current stock",
                  "Minimum",
                  "Status",
                  "Actions",
                ].map((head) => (
                  <th key={head} className="px-5 py-3 font-semibold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((item) => (
                <tr key={item.code} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {item.strength} · {item.unit}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#22577a]">{item.code}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{item.generic}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{item.category}</td>
                  <td className="px-5 py-4 text-slate-600">{item.form}</td>
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-5 py-4 font-semibold">
                    {item.stock} {item.unit}s
                  </td>
                  <td className="px-5 py-4 text-slate-500">{item.minimum}</td>
                  <td className="px-5 py-4">
                    <StockStatus status={item.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        className="rounded-lg border border-slate-200 p-2 text-slate-500"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Edit3 className="size-3.5" />
                      </button>
                      <button
                        className="rounded-lg border border-slate-200 p-2 text-slate-500"
                        aria-label={`Adjust ${item.name}`}
                      >
                        <PackagePlus className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <p className="text-xs text-slate-400">{medicines.length} medicines loaded from Supabase.</p>
      <Link to="/admin/pharmacy/inventory" className="text-xs font-semibold text-[#22577a]">
        View batch inventory →
      </Link>
    </AdminShell>
  );
}
function StockStatus({ status }: { status: string }) {
  const tone =
    status === "In Stock"
      ? "bg-[#e4f4ed] text-[#2d8a76]"
      : status === "Low Stock" || status === "Expiring Soon"
        ? "bg-[#fcf1da] text-[#b57918]"
        : "bg-[#fbe5df] text-[#d85c3f]";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone}`}>{status}</span>
  );
}
