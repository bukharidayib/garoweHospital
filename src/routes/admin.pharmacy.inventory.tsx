import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Eye, PackagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/pharmacy/inventory")({
  head: () => ({ meta: [{ title: "Inventory | GGH Management Portal" }] }),
  component: InventoryPage,
});
function InventoryPage() {
  type Medicine = {
    id: string;
    code: string;
    name: string;
    generic: string;
    category: string;
    form: string;
    strength: string;
    unit: string;
    price: number;
    minimum: number;
  };
  type Batch = {
    id: string;
    medicineId: string;
    medicine: string;
    code: string;
    batch: string;
    available: number;
    reserved: number;
    expiry: string;
    minimum: number;
  };
  const [batches, setBatches] = useState<Batch[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loadError, setLoadError] = useState("");
  const [open, setOpen] = useState(false);
  const [medicine, setMedicine] = useState(medicines[0]?.name ?? "");
  const [batch, setBatch] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [expiry, setExpiry] = useState("");
  const [minimum, setMinimum] = useState(10);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<(typeof batches)[number] | null>(null);
  const [viewBatch, setViewBatch] = useState<(typeof batches)[number] | null>(null);
  const [editBatch, setEditBatch] = useState<(typeof batches)[number] | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<(typeof batches)[number] | null>(null);
  const [editForm, setEditForm] = useState({ available: 0, reserved: 0, expiry: "", minimum: 0 });
  const [adjustment, setAdjustment] = useState(1);
  const [newMedicineOpen, setNewMedicineOpen] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    code: "",
    name: "",
    generic: "",
    category: "",
    form: "Tablet",
    strength: "",
    unit: "unit",
    price: 0,
    minimum: 10,
  });
  useEffect(() => {
    let active = true;
    async function loadInventory() {
      const client = getSupabaseClient();
      const [medicineResult, batchResult] = await Promise.all([
        client.from("medicines").select("*").eq("hospital_id", GGH_HOSPITAL_ID).order("name"),
        client
          .from("inventory_batches")
          .select("*")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .order("expiry_date"),
      ]);
      if (!active) return;
      if (medicineResult.error || batchResult.error) {
        setLoadError(
          medicineResult.error?.message ??
            batchResult.error?.message ??
            "Unable to load inventory.",
        );
        return;
      }
      const medicineRows = (medicineResult.data ?? []).map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        generic: row.generic_name ?? "",
        category: row.category ?? "",
        form: row.form ?? "",
        strength: row.strength ?? "",
        unit: row.unit ?? "unit",
        price: Number(row.price ?? 0),
        minimum: Number(row.minimum_stock ?? 0),
      }));
      const medicineMap = new Map(medicineRows.map((row) => [row.id, row]));
      setMedicines(medicineRows);
      setBatches(
        (batchResult.data ?? []).map((row) => {
          const med = medicineMap.get(row.medicine_id);
          return {
            id: row.id,
            medicineId: row.medicine_id,
            medicine: med?.name ?? row.medicine_id,
            code: med?.code ?? "",
            batch: row.batch_number,
            available: Number(row.available_quantity),
            reserved: Number(row.reserved_quantity),
            expiry: row.expiry_date,
            minimum: med?.minimum ?? 0,
          };
        }),
      );
    }
    void loadInventory();
    return () => {
      active = false;
    };
  }, []);
  const selected = medicines.find((item) => item.name === medicine) ?? medicines[0];
  const available = useMemo(
    () => batches.reduce((sum, item) => sum + item.available, 0),
    [batches],
  );
  const receive = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!batch || !expiry || !selected) return;
    const { data, error } = await getSupabaseClient()
      .from("inventory_batches")
      .insert({
        hospital_id: GGH_HOSPITAL_ID,
        medicine_id: selected.id,
        batch_number: batch,
        available_quantity: quantity,
        reserved_quantity: 0,
        expiry_date: expiry,
      })
      .select("*")
      .single();
    if (error || !data) {
      setLoadError(error?.message ?? "Unable to receive stock.");
      return;
    }
    setBatches((current) => [
      {
        id: data.id,
        medicineId: selected.id,
        medicine: selected.name,
        code: selected.code,
        batch: data.batch_number,
        available: Number(data.available_quantity),
        reserved: Number(data.reserved_quantity),
        expiry: data.expiry_date,
        minimum: selected.minimum,
      },
      ...current,
    ]);
    setOpen(false);
    setBatch("");
  };
  const saveAdjustment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedBatch) return;
    const { data, error } = await getSupabaseClient()
      .from("inventory_batches")
      .update({ available_quantity: Math.max(0, selectedBatch.available + adjustment) })
      .eq("id", selectedBatch.id)
      .eq("hospital_id", GGH_HOSPITAL_ID)
      .select("*")
      .single();
    if (error || !data) {
      setLoadError(error?.message ?? "Unable to adjust stock.");
      return;
    }
    setBatches((current) =>
      current.map((row) =>
        row.id === selectedBatch.id
          ? {
              ...row,
              available: Number(data.available_quantity),
              reserved: Number(data.reserved_quantity),
            }
          : row,
      ),
    );
    setAdjustOpen(false);
    setSelectedBatch(null);
  };
  const openEdit = (item: (typeof batches)[number]) => {
    setEditBatch(item);
    setEditForm({
      available: item.available,
      reserved: item.reserved,
      expiry: item.expiry,
      minimum: item.minimum,
    });
  };
  const saveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editBatch) return;
    const { data, error } = await getSupabaseClient()
      .from("inventory_batches")
      .update({
        available_quantity: editForm.available,
        reserved_quantity: editForm.reserved,
        expiry_date: editForm.expiry,
      })
      .eq("id", editBatch.id)
      .eq("hospital_id", GGH_HOSPITAL_ID)
      .select("*")
      .single();
    if (error || !data) {
      setLoadError(error?.message ?? "Unable to update batch.");
      return;
    }
    setBatches((current) =>
      current.map((row) =>
        row.id === editBatch.id
          ? {
              ...row,
              available: Number(data.available_quantity),
              reserved: Number(data.reserved_quantity),
              expiry: data.expiry_date,
            }
          : row,
      ),
    );
    setEditBatch(null);
  };
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { error } = await getSupabaseClient()
      .from("inventory_batches")
      .delete()
      .eq("id", deleteConfirm.id)
      .eq("hospital_id", GGH_HOSPITAL_ID);
    if (error) {
      setLoadError(error.message);
      return;
    }
    setBatches((current) => current.filter((row) => row.id !== deleteConfirm.id));
    setDeleteConfirm(null);
  };
  const saveMedicine = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newMedicine.code || !newMedicine.name) return;
    const { data, error } = await getSupabaseClient()
      .from("medicines")
      .insert({
        hospital_id: GGH_HOSPITAL_ID,
        code: newMedicine.code,
        name: newMedicine.name,
        generic_name: newMedicine.generic,
        category: newMedicine.category,
        form: newMedicine.form,
        strength: newMedicine.strength,
        unit: newMedicine.unit,
        price: newMedicine.price,
        minimum_stock: newMedicine.minimum,
        active: true,
      })
      .select("*")
      .single();
    if (error || !data) {
      setLoadError(error?.message ?? "Unable to add medicine.");
      return;
    }
    const next = {
      id: data.id,
      code: data.code,
      name: data.name,
      generic: data.generic_name ?? "",
      category: data.category ?? "",
      form: data.form ?? "",
      strength: data.strength ?? "",
      unit: data.unit ?? "unit",
      price: Number(data.price ?? 0),
      minimum: Number(data.minimum_stock ?? 0),
    };
    setMedicines((current) => [next, ...current]);
    setMedicine(next.name);
    setNewMedicineOpen(false);
    setNewMedicine({
      code: "",
      name: "",
      generic: "",
      category: "",
      form: "Tablet",
      strength: "",
      unit: "unit",
      price: 0,
      minimum: 10,
    });
  };
  return (
    <AdminShell
      title="Pharmacy inventory"
      subtitle="Track batches, available stock, and expiry without warehouse clutter."
    >
      <AdminSectionHeading
        eyebrow="Stock control"
        title="Inventory overview"
        description="Every stock change will create an auditable movement."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setNewMedicineOpen(true)}>
              <Plus /> Add medicine
            </Button>
            <Button onClick={() => setOpen(true)}>
              <PackagePlus /> Receive stock
            </Button>
          </div>
        }
      />
      {loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Inventory error: {loadError}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          label="Available units"
          value={String(available)}
          detail={`Across ${batches.length} batches`}
        />
        <Metric
          label="Low stock items"
          value={String(
            medicines.filter(
              (item) =>
                batches
                  .filter((batch) => batch.medicineId === item.id)
                  .reduce((sum, batch) => sum + batch.available, 0) <= item.minimum,
            ).length,
          )}
          detail="At or below threshold"
          tone="warning"
        />
        <Metric
          label="Expiring batches"
          value={String(
            batches.filter(
              (item) =>
                item.expiry && new Date(item.expiry).getTime() - Date.now() <= 30 * 86400000,
            ).length,
          )}
          detail="Within 30 days"
          tone="danger"
        />
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="font-display text-lg font-semibold">Batch inventory</h3>
            <p className="mt-1 text-xs text-slate-500">
              FEFO recommends the nearest valid expiry during dispensing.
            </p>
          </div>
          <a href="/admin/pharmacy/movements" className="text-xs font-semibold text-[#22577a]">
            View movements <ArrowRight className="ml-1 inline size-3.5" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-400">
              <tr>
                {[
                  "Medicine / code",
                  "Batch",
                  "Available",
                  "Reserved",
                  "Expiry",
                  "Minimum",
                  "Status",
                  "Action",
                ].map((head) => (
                  <th key={head} className="px-5 py-3 font-semibold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.map((batch) => (
                <tr key={batch.batch} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{batch.medicine}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{batch.code}</p>
                  </td>
                  <td className="px-5 py-4 font-medium text-[#22577a]">{batch.batch}</td>
                  <td className="px-5 py-4 font-semibold">{batch.available}</td>
                  <td className="px-5 py-4 text-slate-500">{batch.reserved}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-700">{batch.expiry}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{batch.days} days</p>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{batch.minimum}</td>
                  <td className="px-5 py-4">
                    <StockStatus status={batch.status} />
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setViewBatch(batch)}
                        className="inline-flex items-center gap-1 font-semibold text-[#22577a] hover:underline"
                      >
                        <Eye className="size-3.5" /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(batch)}
                        className="inline-flex items-center gap-1 font-semibold text-[#22577a] hover:underline"
                      >
                        <Pencil className="size-3.5" /> Update
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(batch)}
                        className="inline-flex items-center gap-1 font-semibold text-[#d85c3f] hover:underline"
                      >
                        <Trash2 className="size-3.5" /> Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBatch(batch);
                          setAdjustment(1);
                          setAdjustOpen(true);
                        }}
                        className="font-semibold text-slate-500 hover:underline"
                      >
                        Adjust
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="flex flex-wrap gap-4 text-xs">
        <a href="/admin/pharmacy/low-stock" className="font-semibold text-[#22577a]">
          Low-stock medicines →
        </a>
        <a href="/admin/pharmacy/expiry" className="font-semibold text-[#22577a]">
          Expiry management →
        </a>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive new medicine</DialogTitle>
            <DialogDescription>Add a new batch to the pharmacy inventory.</DialogDescription>
          </DialogHeader>
          <form onSubmit={receive} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Medicine
              <select
                value={medicine}
                onChange={(event) => setMedicine(event.target.value)}
                className="field-control mt-2"
              >
                {medicines.map((item) => (
                  <option key={item.code}>{item.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Batch number
              <input
                required
                value={batch}
                onChange={(event) => setBatch(event.target.value)}
                className="field-control mt-2"
                placeholder="e.g. PCM-2601"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-medium text-slate-700">
                Quantity
                <input
                  required
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="field-control mt-2"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Minimum
                <input
                  required
                  type="number"
                  min="0"
                  value={minimum}
                  onChange={(event) => setMinimum(Number(event.target.value))}
                  className="field-control mt-2"
                />
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Expiry date
              <input
                required
                type="date"
                value={expiry}
                onChange={(event) => setExpiry(event.target.value)}
                className="field-control mt-2"
              />
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Receive stock</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust stock</DialogTitle>
            <DialogDescription>
              Record a positive or negative adjustment for this batch. The available quantity cannot
              go below zero.
            </DialogDescription>
          </DialogHeader>
          {selectedBatch ? (
            <form onSubmit={saveAdjustment} className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4 text-sm">
                <p className="font-semibold">
                  {selectedBatch.medicine} · {selectedBatch.batch}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Current available stock: {selectedBatch.available}
                </p>
              </div>
              <label className="block text-sm font-medium text-slate-700">
                Adjustment quantity
                <input
                  required
                  type="number"
                  value={adjustment}
                  onChange={(event) => setAdjustment(Number(event.target.value))}
                  className="field-control mt-2"
                />
                <span className="mt-1 block text-[11px] font-normal text-slate-400">
                  Use a positive number for stock in, or a negative number for stock out/damage.
                </span>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Reason
                <select className="field-control mt-2">
                  <option>Physical count</option>
                  <option>Damaged stock</option>
                  <option>Expired stock</option>
                  <option>Correction</option>
                </select>
              </label>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAdjustOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save adjustment</Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog open={newMedicineOpen} onOpenChange={setNewMedicineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new medicine</DialogTitle>
            <DialogDescription>
              Create a medicine master record before receiving its first batch.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveMedicine} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["code", "Medicine code"],
                  ["name", "Medicine name"],
                  ["generic", "Generic name"],
                  ["category", "Category"],
                  ["strength", "Strength"],
                ] as const
              ).map(([field, label]) => (
                <label key={field} className="text-sm font-medium text-slate-700">
                  <span>{label}</span>
                  <input
                    required={field === "code" || field === "name"}
                    value={newMedicine[field]}
                    onChange={(event) =>
                      setNewMedicine((current) => ({ ...current, [field]: event.target.value }))
                    }
                    className="field-control mt-2"
                  />
                </label>
              ))}
              <label className="text-sm font-medium text-slate-700">
                <span>Form</span>
                <select
                  value={newMedicine.form}
                  onChange={(event) =>
                    setNewMedicine((current) => ({ ...current, form: event.target.value }))
                  }
                  className="field-control mt-2"
                >
                  <option>Tablet</option>
                  <option>Capsule</option>
                  <option>Injection</option>
                  <option>Syrup</option>
                  <option>Cream</option>
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                <span>Unit</span>
                <input
                  value={newMedicine.unit}
                  onChange={(event) =>
                    setNewMedicine((current) => ({ ...current, unit: event.target.value }))
                  }
                  className="field-control mt-2"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                <span>Price</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newMedicine.price}
                  onChange={(event) =>
                    setNewMedicine((current) => ({ ...current, price: Number(event.target.value) }))
                  }
                  className="field-control mt-2"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                <span>Minimum stock</span>
                <input
                  type="number"
                  min="0"
                  value={newMedicine.minimum}
                  onChange={(event) =>
                    setNewMedicine((current) => ({
                      ...current,
                      minimum: Number(event.target.value),
                    }))
                  }
                  className="field-control mt-2"
                />
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewMedicineOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add medicine</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(viewBatch)}
        onOpenChange={(nextOpen) => !nextOpen && setViewBatch(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View batch inventory</DialogTitle>
            <DialogDescription>Current batch details and stock position.</DialogDescription>
          </DialogHeader>
          {viewBatch ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Medicine">
                {viewBatch.medicine} · {viewBatch.code}
              </Info>
              <Info label="Batch">{viewBatch.batch}</Info>
              <Info label="Available">{viewBatch.available} units</Info>
              <Info label="Reserved">{viewBatch.reserved} units</Info>
              <Info label="Minimum stock">{viewBatch.minimum} units</Info>
              <Info label="Expiry">
                {viewBatch.expiry} · {viewBatch.days} days
              </Info>
              <Info label="Status">
                <StockStatus status={viewBatch.status} />
              </Info>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewBatch(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(editBatch)}
        onOpenChange={(nextOpen) => !nextOpen && setEditBatch(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update batch</DialogTitle>
            <DialogDescription>
              Update stock quantities, minimum level, or expiry date.
            </DialogDescription>
          </DialogHeader>
          {editBatch ? (
            <form onSubmit={saveEdit} className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-3 text-sm font-semibold">
                {editBatch.medicine} · {editBatch.batch}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-medium text-slate-700">
                  Available
                  <input
                    type="number"
                    min="0"
                    value={editForm.available}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        available: Number(event.target.value),
                      }))
                    }
                    className="field-control mt-2"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Reserved
                  <input
                    type="number"
                    min="0"
                    value={editForm.reserved}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        reserved: Number(event.target.value),
                      }))
                    }
                    className="field-control mt-2"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Minimum
                  <input
                    type="number"
                    min="0"
                    value={editForm.minimum}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        minimum: Number(event.target.value),
                      }))
                    }
                    className="field-control mt-2"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Expiry
                  <input
                    type="date"
                    value={editForm.expiry}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, expiry: event.target.value }))
                    }
                    className="field-control mt-2"
                  />
                </label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditBatch(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(deleteConfirm)}
        onOpenChange={(nextOpen) => !nextOpen && setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete batch?</DialogTitle>
            <DialogDescription>
              This action will permanently remove the batch from the inventory list. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {deleteConfirm ? (
            <div className="rounded-xl border border-[#f3c8bd] bg-[#fff4f0] p-4 text-sm">
              <p className="font-semibold text-slate-800">
                {deleteConfirm.medicine} · {deleteConfirm.batch}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Available stock: {deleteConfirm.available} units
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-[#d85c3f] hover:bg-[#bd4b31]"
              onClick={confirmDelete}
            >
              Delete batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
function Metric({
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
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
      <p
        className={`mt-1 text-[11px] ${tone === "warning" ? "text-[#b57918]" : tone === "danger" ? "text-[#d85c3f]" : "text-slate-400"}`}
      >
        {detail}
      </p>
    </article>
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
function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">{label}</p>
      <div className="mt-1 text-sm text-slate-700">{children}</div>
    </div>
  );
}
