import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";

import { AdminSectionHeading, AdminShell, PatientStatusBadge } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { addLabCatalogTest, readLabCatalog, type LabCatalogTest } from "@/lib/lab-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/laboratory/catalog")({
  head: () => ({ meta: [{ title: "Laboratory Catalog | GGH Management Portal" }] }),
  component: LaboratoryCatalogPage,
});

function LaboratoryCatalogPage() {
  const [tests, setTests] = useState(readLabCatalog);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<LabCatalogTest, "active">>({
    code: "",
    name: "",
    category: "",
    sample: "",
    resultType: "Numeric",
    turnaround: "60 min",
    price: "$0.00",
    referenceRange: "",
  });
  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));
  const addTest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.code || !form.name || !form.category || !form.sample) return;
    const next = addLabCatalogTest({ ...form, code: form.code.toUpperCase() });
    setTests((current) => [...current, next]);
    setOpen(false);
    setForm({
      code: "",
      name: "",
      category: "",
      sample: "",
      resultType: "Numeric",
      turnaround: "60 min",
      price: "$0.00",
      referenceRange: "",
    });
  };
  return (
    <AdminShell
      title="Laboratory catalog"
      subtitle="Manage configured tests, reference ranges, and turnaround targets."
    >
      <AdminSectionHeading
        eyebrow="Configuration"
        title="Laboratory test catalog"
        description="Test definitions will later be hospital-configurable and versioned."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Add test
          </Button>
        }
      />
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <Search className="size-4 text-slate-400" />
            <input
              placeholder="Search tests..."
              className="w-56 bg-transparent text-sm outline-none"
            />
          </div>
          <span className="text-xs text-slate-400">{tests.length} configured tests</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.12em] text-slate-400">
              <tr>
                {[
                  "Code",
                  "Test",
                  "Category",
                  "Sample",
                  "Result type",
                  "TAT",
                  "Price",
                  "Status",
                ].map((head) => (
                  <th key={head} className="px-5 py-3 font-semibold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tests.map((test) => (
                <tr key={test.code} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-[#22577a]">{test.code}</td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{test.name}</td>
                  <td className="px-5 py-4 text-slate-600">{test.category}</td>
                  <td className="px-5 py-4 text-slate-600">{test.sample}</td>
                  <td className="px-5 py-4 text-slate-600">{test.resultType}</td>
                  <td className="px-5 py-4 text-slate-600">{test.turnaround}</td>
                  <td className="px-5 py-4 font-semibold text-slate-700">{test.price}</td>
                  <td className="px-5 py-4">
                    <PatientStatusBadge status={test.active ? "Active" : "Archived"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add laboratory test</DialogTitle>
            <DialogDescription>
              Create any test or panel your laboratory offers. It will immediately be available when
              creating multi-test orders.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addTest} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["code", "Test code"],
                  ["name", "Test name"],
                  ["category", "Category"],
                  ["sample", "Sample type"],
                  ["turnaround", "Turnaround time"],
                  ["price", "Price"],
                  ["referenceRange", "Reference range"],
                ] as const
              ).map(([field, label]) => (
                <label key={field} className="text-sm font-medium text-slate-700">
                  <span>{label}</span>
                  <input
                    required={["code", "name", "category", "sample"].includes(field)}
                    value={form[field]}
                    onChange={(event) => update(field, event.target.value)}
                    className="field-control mt-2"
                    placeholder={field === "referenceRange" ? "e.g. 70–100 mg/dL" : undefined}
                  />
                </label>
              ))}
              <label className="text-sm font-medium text-slate-700">
                <span>Result type</span>
                <select
                  value={form.resultType}
                  onChange={(event) => update("resultType", event.target.value)}
                  className="field-control mt-2"
                >
                  <option>Numeric</option>
                  <option>Text</option>
                  <option>Positive / Negative</option>
                  <option>Panel</option>
                  <option>Dropdown</option>
                </select>
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add test to catalog</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
