import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { AdminShell, AdminSectionHeading } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/laboratory/new")({
  head: () => ({ meta: [{ title: "New Lab Order | GGH Management Portal" }] }),
  component: NewLabOrderPage,
});

function NewLabOrderPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Array<{ id: string; number: string; name: string }>>([]);
  const [tests, setTests] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [doctors, setDoctors] = useState<Array<{ id: string; name: string }>>([]);
  const [patientId, setPatientId] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [priority, setPriority] = useState("Routine");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const client = getSupabaseClient();
      const [patientsResult, testsResult, doctorsResult] = await Promise.all([
        client
          .from("patients")
          .select("id,patient_number,first_name,last_name")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .order("last_name"),
        client
          .from("lab_tests")
          .select("id,code,name")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .eq("active", true)
          .order("name"),
        client
          .from("doctors")
          .select("id,name")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .eq("active", true)
          .order("name"),
      ]);
      if (!active) return;
      const loadError = patientsResult.error ?? testsResult.error ?? doctorsResult.error;
      if (loadError) {
        setError(loadError.message);
        return;
      }
      setPatients(
        (patientsResult.data ?? []).map((patient) => ({
          id: patient.id,
          number: patient.patient_number,
          name: `${patient.first_name} ${patient.last_name}`,
        })),
      );
      const loadedTests = testsResult.data ?? [];
      const loadedDoctors = doctorsResult.data ?? [];
      setTests(loadedTests);
      setDoctors(
        loadedDoctors.map((doctor) => ({
          id: doctor.id,
          name: doctor.name,
        })),
      );
      setRequestedBy((current) => current || loadedDoctors[0]?.id || "");
      setSelectedTests((current) =>
        current.length ? current : loadedTests.slice(0, 1).map((test) => test.id),
      );
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const selectedPatient = patients.find((patient) => patient.id === patientId);

  async function createOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!patientId || !requestedBy || selectedTests.length === 0) {
      setError("Select a patient, requesting doctor, and at least one test.");
      return;
    }
    setSaving(true);
    setError("");
    const client = getSupabaseClient();
    const order = await client
      .from("lab_orders")
      .insert({
        hospital_id: GGH_HOSPITAL_ID,
        patient_id: patientId,
        requested_by: requestedBy || null,
        order_number: `GGH-LAB-${Date.now()}`,
        priority,
        status: "Ordered",
        clinical_notes: notes || null,
      })
      .select("id")
      .single();
    if (order.error || !order.data) {
      setError(order.error?.message ?? "Unable to create lab order.");
      setSaving(false);
      return;
    }
    const items = await client.from("lab_order_items").insert(
      selectedTests.map((testId) => ({
        lab_order_id: order.data.id,
        lab_test_id: testId,
        status: "Ordered",
      })),
    );
    if (items.error) {
      setError(items.error.message);
      setSaving(false);
      return;
    }
    setSaved(true);
    setSaving(false);
  }

  return (
    <AdminShell title="New lab order" subtitle="Create a laboratory request for a patient visit.">
      <Link
        to="/admin/laboratory"
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#22577a]"
      >
        <ArrowLeft className="size-3.5" /> Laboratory
      </Link>
      <AdminSectionHeading
        eyebrow="Laboratory operations"
        title="New lab order"
        description="Select a patient and multiple laboratory tests."
      />
      {saved ? (
        <div className="rounded-2xl border border-[#b8dfd0] bg-[#edf8f3] p-5 text-sm text-[#2d8a76]">
          Lab order created successfully.
        </div>
      ) : (
        <form onSubmit={createOrder} className="max-w-3xl space-y-5">
          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Patient name *</span>
              <select
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
                className="field-control"
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
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Patient number</span>
              <input
                value={selectedPatient?.number ?? ""}
                readOnly
                className="field-control bg-slate-50"
                placeholder="Auto-filled from patient"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Requested by *</span>
              <select
                value={requestedBy}
                onChange={(event) => setRequestedBy(event.target.value)}
                className="field-control"
                required
              >
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Priority</span>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="field-control"
              >
                <option>Routine</option>
                <option>Urgent</option>
                <option>STAT</option>
              </select>
            </label>
            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-medium text-slate-700">Laboratory tests *</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {tests.map((test) => (
                  <label
                    key={test.id}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test.id)}
                      onChange={(event) =>
                        setSelectedTests((current) =>
                          event.target.checked
                            ? [...current, test.id]
                            : current.filter((id) => id !== test.id),
                        )
                      }
                    />
                    {test.name} <span className="text-xs text-slate-400">({test.code})</span>
                  </label>
                ))}
              </div>
            </div>
            <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
              <span>Clinical notes</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                className="field-control"
              />
            </label>
          </section>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/admin/laboratory" })}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                "Creating..."
              ) : (
                <>
                  <FlaskConical /> Create lab order
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </AdminShell>
  );
}
