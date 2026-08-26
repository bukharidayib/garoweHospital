import { medicines, pharmacyBatches, pharmacyPrescriptions } from "@/content/pharmacy";

export type PharmacyMedicine = {
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
};

export type AppPrescriptionItem = {
  medicine: string;
  dose: string;
  frequency: string;
  duration: string;
  quantity: number;
  unit: string;
  instructions?: string;
};

export type AppPrescription = {
  id: string;
  number: string;
  patientId: string;
  patient: string;
  patientNumber: string;
  doctor: string;
  department: string;
  created: string;
  priority: "Routine" | "Urgent" | "STAT";
  status: "Sent to Pharmacy" | "In Review" | "Ready to Dispense" | "Dispensed";
  medicines: number;
  items: AppPrescriptionItem[];
};

export type AppBatch = {
  medicine: string;
  code: string;
  batch: string;
  available: number;
  reserved: number;
  expiry: string;
  days: number;
  minimum: number;
  status: string;
};

const prescriptionKey = "ggh-pharmacy-prescriptions-v1";
const batchKey = "ggh-pharmacy-batches-v1";
const medicineKey = "ggh-pharmacy-medicines-v1";

const browserStorage = () => (typeof window === "undefined" ? null : window.localStorage);

export function readPrescriptions(): AppPrescription[] {
  const storage = browserStorage();
  const saved = storage?.getItem(prescriptionKey);
  if (saved) return JSON.parse(saved) as AppPrescription[];
  return pharmacyPrescriptions.map((row) => ({
    ...row,
    priority: row.priority as AppPrescription["priority"],
    status: row.status as AppPrescription["status"],
    medicines: row.medicines,
    items: [],
  }));
}

export function savePrescriptions(rows: AppPrescription[]) {
  browserStorage()?.setItem(prescriptionKey, JSON.stringify(rows));
}

export function addPrescription(
  input: Omit<AppPrescription, "id" | "number" | "created" | "medicines">,
) {
  const rows = readPrescriptions();
  const id = `rx-${Date.now()}`;
  const next = {
    ...input,
    id,
    number: `GGH-RX-${new Date().getFullYear()}-${String(rows.length + 483).padStart(6, "0")}`,
    created: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    medicines: input.items.length,
  } satisfies AppPrescription;
  savePrescriptions([next, ...rows]);
  return next;
}

export function readBatches(): AppBatch[] {
  const saved = browserStorage()?.getItem(batchKey);
  if (saved) return JSON.parse(saved) as AppBatch[];
  return pharmacyBatches.map((row) => ({ ...row }));
}

export function saveBatches(rows: AppBatch[]) {
  browserStorage()?.setItem(batchKey, JSON.stringify(rows));
}

export function receiveBatch(input: Omit<AppBatch, "days" | "status" | "reserved">) {
  const days = Math.max(0, Math.ceil((new Date(input.expiry).getTime() - Date.now()) / 86400000));
  const status =
    input.available <= input.minimum ? "Low Stock" : days <= 30 ? "Expiring Soon" : "In Stock";
  const next = { ...input, reserved: 0, days, status } satisfies AppBatch;
  const rows = readBatches();
  saveBatches([next, ...rows]);
  return next;
}

export function reduceStock(medicine: string, quantity: number) {
  const rows = readBatches();
  let remaining = quantity;
  const next = rows.map((row) => {
    if (row.medicine !== medicine || remaining <= 0) return row;
    const used = Math.min(row.available, remaining);
    remaining -= used;
    return { ...row, available: row.available - used };
  });
  saveBatches(next);
  return remaining === 0;
}

export function readMedicines(): PharmacyMedicine[] {
  const saved = browserStorage()?.getItem(medicineKey);
  if (saved) return JSON.parse(saved) as PharmacyMedicine[];
  return medicines.map((item) => ({ ...item }));
}

export function addMedicine(input: Omit<PharmacyMedicine, "stock" | "status">) {
  const next = { ...input, stock: 0, status: "Out of Stock" } satisfies PharmacyMedicine;
  const rows = readMedicines();
  browserStorage()?.setItem(medicineKey, JSON.stringify([next, ...rows]));
  return next;
}

export function adjustBatch(batchId: string, change: number) {
  const rows = readBatches();
  const next = rows.map((row) =>
    row.batch === batchId
      ? {
          ...row,
          available: Math.max(0, row.available + change),
          status: row.available + change <= row.minimum ? "Low Stock" : row.status,
        }
      : row,
  );
  saveBatches(next);
  return next;
}

export function updateBatch(
  batchId: string,
  changes: Partial<Pick<AppBatch, "available" | "reserved" | "expiry" | "minimum">>,
) {
  const rows = readBatches();
  const next = rows.map((row) => {
    if (row.batch !== batchId) return row;
    const updated = { ...row, ...changes };
    const days = Math.max(
      0,
      Math.ceil((new Date(updated.expiry).getTime() - Date.now()) / 86400000),
    );
    return {
      ...updated,
      days,
      status:
        updated.available <= updated.minimum
          ? "Low Stock"
          : days <= 30
            ? "Expiring Soon"
            : "In Stock",
    };
  });
  saveBatches(next);
  return next;
}

export function deleteBatch(batchId: string) {
  const next = readBatches().filter((row) => row.batch !== batchId);
  saveBatches(next);
  return next;
}

export const medicineCatalog = medicines;
