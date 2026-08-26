import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FlaskConical } from "lucide-react";

import { AdminShell, AdminSectionHeading } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/laboratory/new")({
  head: () => ({ meta: [{ title: "New Lab Order | GGH Management Portal" }] }),
  component: NewLabOrderPage,
});

function NewLabOrderPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
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
        description="Select a patient and the tests required for this visit."
      />
      {saved ? (
        <div className="rounded-2xl border border-[#b8dfd0] bg-[#edf8f3] p-5 text-sm text-[#2d8a76]">
          Lab order created successfully.
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(true);
          }}
          className="max-w-3xl space-y-5"
        >
          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
            <Field label="Patient name" required />
            <Field label="Patient number" placeholder="GGH-PAT-000000" />
            <Field label="Requested by" value="Dr. Ahmed Yusuf" />
            <Field label="Priority" as="select" options={["Routine", "Urgent", "STAT"]} />
            <Field
              label="Tests"
              placeholder="CBC, glucose, malaria test"
              className="sm:col-span-2"
            />
            <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
              <span>Clinical notes</span>
              <textarea
                rows={4}
                className="field-control"
                placeholder="Reason for testing or collection notes"
              />
            </label>
          </section>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/admin/laboratory" })}
            >
              Cancel
            </Button>
            <Button type="submit">
              <FlaskConical /> Create lab order
            </Button>
          </div>
        </form>
      )}
    </AdminShell>
  );
}
function Field({
  label,
  required,
  value,
  placeholder,
  as = "input",
  options = [],
  className = "",
}: {
  label: string;
  required?: boolean;
  value?: string;
  placeholder?: string;
  as?: "input" | "select";
  options?: string[];
  className?: string;
}) {
  return (
    <label className={`space-y-2 text-sm font-medium text-slate-700 ${className}`}>
      <span>{label}</span>
      {as === "select" ? (
        <select defaultValue={options[0]} className="field-control" required={required}>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          defaultValue={value}
          placeholder={placeholder}
          className="field-control"
          required={required}
        />
      )}
    </label>
  );
}
