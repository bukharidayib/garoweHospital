import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";

import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { patients } from "@/content/patients";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/patients/$patientId/edit")({
  head: () => ({ meta: [{ title: "Edit Patient | GGH Management Portal" }] }),
  component: EditPatientPage,
});

function EditPatientPage() {
  const { patientId } = Route.useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<(typeof patients)[number] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    getSupabaseClient()
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .eq("hospital_id", GGH_HOSPITAL_ID)
      .single()
      .then(({ data, error: queryError }) => {
        if (queryError || !data) {
          setError(queryError?.message ?? "Patient not found.");
          return;
        }
        setPatient({
          id: data.id,
          patientNumber: data.patient_number,
          firstName: data.first_name,
          lastName: data.last_name,
          dateOfBirth: data.date_of_birth ?? "",
          gender: data.gender === "Female" ? "Female" : "Male",
          phone: data.phone ?? "",
          email: data.email ?? "",
          nationalId: data.national_id ?? "",
          address: data.address ?? "",
          city: data.city ?? "",
          region: data.region ?? "",
          country: data.country ?? "Somalia",
          emergencyContactName: "Not recorded",
          emergencyContactRelationship: "Not recorded",
          emergencyContactPhone: "",
          status: data.status,
          admissionStatus: "Outpatient",
          department: "Unassigned",
          lastVisit: "",
          registrationDate: data.created_at.slice(0, 10),
          lastVisitType: "",
        });
      });
  }, [patientId]);
  if (!patient)
    return (
      <AdminShell title="Edit patient" subtitle="Loading patient from Supabase.">
        <p className="text-sm text-red-600">{error || "Loading…"}</p>
      </AdminShell>
    );
  return (
    <AdminShell
      title="Edit patient"
      subtitle="Update demographic information with an auditable change history."
    >
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link
          to="/admin/patients/$patientId"
          params={{ patientId: patient.id }}
          className="inline-flex items-center gap-1 font-semibold text-[#22577a] hover:underline"
        >
          <ArrowLeft className="size-3.5" /> Patient profile
        </Link>
        <span>/</span>
        <span>Edit</span>
      </div>
      <AdminSectionHeading
        eyebrow="Patient management"
        title={`Edit ${patient.firstName} ${patient.lastName}`}
        description="Identity and contact changes should be reviewed and recorded by the connected backend."
      />
      <form
        className="max-w-4xl space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const { error: updateError } = await getSupabaseClient()
            .from("patients")
            .update({
              first_name: String(form.get("firstName") ?? ""),
              last_name: String(form.get("lastName") ?? ""),
              date_of_birth: String(form.get("dateOfBirth") ?? ""),
              phone: String(form.get("phone") ?? ""),
              email: String(form.get("email") ?? ""),
              national_id: String(form.get("nationalId") ?? ""),
            })
            .eq("id", patient.id)
            .eq("hospital_id", GGH_HOSPITAL_ID);
          if (updateError) {
            setError(updateError.message);
            return;
          }
          await navigate({ to: "/admin/patients/$patientId", params: { patientId: patient.id } });
        }}
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
          <h2 className="font-display text-lg font-semibold">Demographic information</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field name="firstName" label="First name" value={patient.firstName} />
            <Field name="lastName" label="Last name" value={patient.lastName} />
            <Field
              name="dateOfBirth"
              label="Date of birth"
              value={patient.dateOfBirth}
              type="date"
            />
            <Field name="phone" label="Phone number" value={patient.phone} />
            <Field name="email" label="Email" value={patient.email ?? ""} type="email" />
            <Field
              name="nationalId"
              label="National ID / passport"
              value={patient.nationalId ?? ""}
            />
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_-24px_rgba(18,50,71,.25)]">
          <h2 className="font-display text-lg font-semibold">Emergency contact</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <Field label="Name" value={patient.emergencyContactName} />
            <Field label="Relationship" value={patient.emergencyContactRelationship} />
            <Field label="Phone" value={patient.emergencyContactPhone} />
          </div>
        </section>
        <div className="flex justify-end gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/patients/$patientId" params={{ patientId: patient.id }}>
              Cancel
            </Link>
          </Button>
          <Button type="submit">
            <Save /> Save changes
          </Button>
        </div>
      </form>
    </AdminShell>
  );
}
function Field({
  name,
  label,
  value,
  type = "text",
}: {
  name: string;
  label: string;
  value: string;
  type?: string;
}) {
  return (
    <label className="space-y-2 text-sm font-medium text-slate-700">
      <Label>{label}</Label>
      <Input name={name} defaultValue={value} type={type} />
    </label>
  );
}
