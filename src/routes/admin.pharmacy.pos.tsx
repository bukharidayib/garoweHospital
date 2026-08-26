import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ShoppingCart, UserRound } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/pharmacy/pos")({
  head: () => ({ meta: [{ title: "Pharmacy POS | GGH Management Portal" }] }),
  component: PharmacyPosPage,
});
type Patient = { id: string; number: string; name: string; allergies: string };
type Medicine = {
  id: string;
  name: string;
  code: string;
  strength: string;
  unit: string;
  price: number;
  available: number;
};
type CartItem = Medicine & { quantity: number };

function PharmacyPosPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [patientId, setPatientId] = useState("");
  const [medicineId, setMedicineId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountPaid, setAmountPaid] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    async function load() {
      const client = getSupabaseClient();
      const [patientsResult, medicinesResult, batchesResult] = await Promise.all([
        client
          .from("patients")
          .select("id,patient_number,first_name,last_name,allergies_summary")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .order("last_name"),
        client
          .from("medicines")
          .select("id,name,code,strength,unit,price")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .eq("active", true)
          .order("name"),
        client
          .from("inventory_batches")
          .select("medicine_id,available_quantity")
          .eq("hospital_id", GGH_HOSPITAL_ID),
      ]);
      if (!active) return;
      const loadError = patientsResult.error ?? medicinesResult.error ?? batchesResult.error;
      if (loadError) {
        setError(loadError.message);
        return;
      }
      const stock = new Map<string, number>();
      for (const batch of batchesResult.data ?? [])
        stock.set(
          batch.medicine_id,
          (stock.get(batch.medicine_id) ?? 0) + Number(batch.available_quantity ?? 0),
        );
      const loadedMedicines = (medicinesResult.data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        strength: item.strength ?? "",
        unit: item.unit,
        price: Number(item.price ?? 0),
        available: stock.get(item.id) ?? 0,
      }));
      setPatients(
        (patientsResult.data ?? []).map((item) => ({
          id: item.id,
          number: item.patient_number,
          name: `${item.first_name} ${item.last_name}`,
          allergies: item.allergies_summary ?? "No allergies recorded.",
        })),
      );
      setMedicines(loadedMedicines);
      setPatientId((current) => current || patientsResult.data?.[0]?.id || "");
      setMedicineId((current) => current || loadedMedicines[0]?.id || "");
    }
    void load();
    return () => {
      active = false;
    };
  }, []);
  const selectedMedicine = medicines.find((item) => item.id === medicineId);
  const selectedPatient = patients.find((item) => item.id === patientId);
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [cart],
  );
  const discountAmount = Math.min(Math.max(0, discount), subtotal);
  const total = Math.max(0, subtotal - discountAmount);
  const balance = Math.max(0, total - Math.max(0, amountPaid));
  const status = amountPaid <= 0 ? "Unpaid" : balance > 0 ? "Partially Paid" : "Paid";
  const addToCart = () => {
    if (!selectedMedicine || quantity < 1 || quantity > selectedMedicine.available) {
      setError("Choose a medicine with sufficient stock.");
      return;
    }
    setError("");
    setCart((current) => {
      const existing = current.find((item) => item.id === selectedMedicine.id);
      if (existing)
        return current.map((item) =>
          item.id === selectedMedicine.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, selectedMedicine.available) }
            : item,
        );
      return [...current, { ...selectedMedicine, quantity }];
    });
  };
  const completeSale = async () => {
    if (!patientId || !cart.length || total <= 0) {
      setError("Select a patient and add at least one medicine.");
      return;
    }
    if (amountPaid > total) {
      setError("Payment cannot be greater than the total.");
      return;
    }
    setSaving(true);
    setError("");
    const client = getSupabaseClient();
    const invoice = await client
      .from("invoices")
      .insert({
        hospital_id: GGH_HOSPITAL_ID,
        patient_id: patientId,
        invoice_number: `GGH-POS-${Date.now()}`,
        status,
        subtotal,
        discount: discountAmount,
        total,
        paid: amountPaid,
        due: balance,
        issued_at: new Date().toISOString(),
      })
      .select("*")
      .single();
    if (invoice.error || !invoice.data) {
      setError(invoice.error?.message ?? "Unable to record POS sale.");
      setSaving(false);
      return;
    }
    const invoiceItems = await client.from("invoice_items").insert(
      cart.map((item) => ({
        invoice_id: invoice.data.id,
        description: `${item.name}${item.strength ? ` · ${item.strength}` : ""}`,
        quantity: item.quantity,
        unit_price: item.price,
        amount: item.quantity * item.price,
      })),
    );
    if (invoiceItems.error) {
      setError(invoiceItems.error.message);
      setSaving(false);
      return;
    }
    if (amountPaid > 0) {
      const payment = await client.from("payments").insert({
        hospital_id: GGH_HOSPITAL_ID,
        invoice_id: invoice.data.id,
        patient_id: patientId,
        payment_method: paymentMethod,
        amount: amountPaid,
        received_at: new Date().toISOString(),
      });
      if (payment.error) {
        setError(payment.error.message);
        setSaving(false);
        return;
      }
    }
    setMessage(`Sale ${invoice.data.invoice_number} recorded as ${status}.`);
    setCart([]);
    setDiscount(0);
    setAmountPaid(0);
    setSaving(false);
  };
  return (
    <AdminShell
      title="Pharmacy POS"
      subtitle="Record patient medicine sales with Cash or Sahal Merchant payments."
    >
      <AdminSectionHeading
        eyebrow="Point of sale"
        title="Patient pharmacy sale"
        description="Select the patient, add medicines, apply a discount, and record full, partial, or unpaid sales."
        action={
          <a href="/admin/pharmacy/inventory" className="text-sm font-semibold text-[#22577a]">
            Open inventory →
          </a>
        }
      />
      {message ? (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#b9e5d8] bg-[#effaf5] p-4 text-sm text-[#2d8a76]">
          <CheckCircle2 className="size-4" />
          {message}
        </div>
      ) : null}
      {error ? (
        <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          POS error: {error}
        </p>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[1fr_400px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Patient
              <select
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
                className="field-control mt-2"
                required
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.number} · {patient.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
              <UserRound className="mb-2 size-4 text-[#38a3a5]" />
              {selectedPatient?.allergies ?? "Select a patient to review allergies."}
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_120px_auto] md:items-end">
            <label className="text-sm font-medium text-slate-700">
              Medicine
              <select
                value={medicineId}
                onChange={(event) => setMedicineId(event.target.value)}
                className="field-control mt-2"
              >
                <option value="">Select medicine</option>
                {medicines.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.strength} · ${item.price.toFixed(2)} · Stock{" "}
                    {item.available}
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
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
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
              cart.map((item) => (
                <div
                  key={item.id}
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
          <div className="mt-6 space-y-3 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <label className="flex items-center justify-between gap-3">
              Discount
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(event) => setDiscount(Number(event.target.value))}
                className="field-control w-32"
              />
            </label>
            <div className="flex justify-between text-base">
              <span className="font-semibold">Total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <label className="flex items-center justify-between gap-3">
              Payment method
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="field-control w-44"
              >
                <option>Cash</option>
                <option>Sahal Merchant</option>
              </select>
            </label>
            <label className="flex items-center justify-between gap-3">
              Amount paid
              <input
                type="number"
                min="0"
                max={total}
                value={amountPaid}
                onChange={(event) => setAmountPaid(Number(event.target.value))}
                className="field-control w-32"
              />
            </label>
            <div className="flex justify-between">
              <span>Balance</span>
              <strong>
                ${balance.toFixed(2)} · {status}
              </strong>
            </div>
          </div>
          <Button
            className="mt-4 w-full"
            onClick={() => void completeSale()}
            disabled={saving || !patientId || !cart.length}
          >
            {saving ? "Recording..." : "Complete sale"}
          </Button>
        </section>
      </div>
    </AdminShell>
  );
}
