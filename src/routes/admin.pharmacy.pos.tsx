import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ShoppingCart, UserRound } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { patients } from "@/content/patients";
import { medicineCatalog, reduceStock } from "@/lib/pharmacy-store";

export const Route = createFileRoute("/admin/pharmacy/pos")({
  head: () => ({ meta: [{ title: "Pharmacy POS | GGH Management Portal" }] }),
  component: PharmacyPosPage,
});

function PharmacyPosPage() {
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [medicineCode, setMedicineCode] = useState(medicineCatalog[0]?.code ?? "");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<
    { code: string; name: string; quantity: number; price: number }[]
  >([]);
  const [message, setMessage] = useState("");
  const selected = medicineCatalog.find((item) => item.code === medicineCode) ?? medicineCatalog[0];
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [cart],
  );
  const addToCart = () => {
    if (selected)
      setCart((current) => [
        ...current,
        { code: selected.code, name: selected.name, quantity, price: selected.price },
      ]);
  };
  const completeSale = () => {
    if (!patientId || cart.length === 0) return;
    const valid = cart.every((item) => reduceStock(item.name, item.quantity));
    if (!valid) {
      setMessage("Insufficient stock for one or more medicines.");
      return;
    }
    setMessage(
      `Sale recorded for ${patients.find((item) => item.id === patientId)?.firstName ?? "patient"}.`,
    );
    setCart([]);
  };
  return (
    <AdminShell
      title="Pharmacy POS"
      subtitle="Sell medicines against a selected patient and keep stock movements recorded."
    >
      <AdminSectionHeading
        eyebrow="Point of sale"
        title="Patient pharmacy sale"
        description="Select the patient, add medicines, and complete the sale."
        action={
          <a href="/admin/pharmacy/inventory" className="text-sm font-semibold text-[#22577a]">
            Open inventory →
          </a>
        }
      />
      {message && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#b9e5d8] bg-[#effaf5] p-4 text-sm text-[#2d8a76]">
          <CheckCircle2 className="size-4" />
          {message}
        </div>
      )}
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Patient
              <select
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
                className="field-control mt-2"
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.patientNumber} · {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
              <UserRound className="mb-2 size-4 text-[#38a3a5]" />
              {patients.find((item) => item.id === patientId)?.allergiesSummary ??
                "Select a patient to review allergies."}
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_120px_auto] md:items-end">
            <label className="text-sm font-medium text-slate-700">
              Medicine
              <select
                value={medicineCode}
                onChange={(event) => setMedicineCode(event.target.value)}
                className="field-control mt-2"
              >
                {medicineCatalog.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name} · {item.strength} · ${item.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Qty
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="field-control mt-2"
              />
            </label>
            <Button onClick={addToCart}>
              <ShoppingCart /> Add
            </Button>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-display text-lg font-semibold">Current sale</h3>
          <div className="mt-4 space-y-3">
            {cart.length === 0 ? (
              <p className="text-sm text-slate-500">No medicines added yet.</p>
            ) : (
              cart.map((item, index) => (
                <div
                  key={`${item.code}-${index}`}
                  className="flex justify-between border-b border-slate-100 pb-3 text-sm"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold">${(item.quantity * item.price).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="font-semibold">Total</span>
            <span className="font-display text-xl font-semibold">${total.toFixed(2)}</span>
          </div>
          <Button
            className="mt-4 w-full"
            onClick={completeSale}
            disabled={!patientId || cart.length === 0}
          >
            Complete sale
          </Button>
        </section>
      </div>
    </AdminShell>
  );
}
