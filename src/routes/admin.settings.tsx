import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  Check,
  Clock3,
  LockKeyhole,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Plus,
  Trash2,
} from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { defaultSettings, type HospitalSettings } from "@/lib/admin-settings-store";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings | GGH Management Portal" }] }),
  component: SettingsPage,
});

const tabs = [
  { id: "hospital", label: "Hospital profile", icon: Building2 },
  { id: "operations", label: "Operations", icon: SlidersHorizontal },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: LockKeyhole },
  { id: "directory", label: "Doctors & departments", icon: Users },
] as const;
type TabId = (typeof tabs)[number]["id"];

function SettingsPage() {
  const [active, setActive] = useState<TabId>("hospital");
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let active = true;
    async function loadSettings() {
      const client = getSupabaseClient();
      const [hospitalResult, settingsResult] = await Promise.all([
        client.from("hospitals").select("*").eq("id", GGH_HOSPITAL_ID).single(),
        client
          .from("app_settings")
          .select("setting_value")
          .eq("hospital_id", GGH_HOSPITAL_ID)
          .eq("setting_key", "hospital_settings")
          .maybeSingle(),
      ]);
      if (!active) return;
      const error = hospitalResult.error ?? settingsResult.error;
      if (error) {
        setLoadError(error.message);
        return;
      }
      const hospital = hospitalResult.data;
      const stored = (settingsResult.data?.setting_value ?? {}) as Partial<HospitalSettings>;
      setSettings({
        ...defaultSettings,
        hospitalName: hospital.name,
        legalName: hospital.legal_name ?? "",
        phone: hospital.phone ?? "",
        email: hospital.email ?? "",
        address: hospital.address ?? "",
        timezone: hospital.timezone,
        currency: hospital.currency,
        ...stored,
      });
    }
    void loadSettings();
    return () => {
      active = false;
    };
  }, []);
  const update = <K extends keyof HospitalSettings>(key: K, value: HospitalSettings[K]) => {
    setSaved(false);
    setSettings((current) => ({ ...current, [key]: value }));
  };
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client = getSupabaseClient();
    const { error: hospitalError } = await client
      .from("hospitals")
      .update({
        name: settings.hospitalName,
        legal_name: settings.legalName,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        timezone: settings.timezone,
        currency: settings.currency,
      })
      .eq("id", GGH_HOSPITAL_ID);
    const { error: settingsError } = await client
      .from("app_settings")
      .upsert(
        { hospital_id: GGH_HOSPITAL_ID, setting_key: "hospital_settings", setting_value: settings },
        { onConflict: "hospital_id,setting_key" },
      );
    if (hospitalError || settingsError) {
      setLoadError(hospitalError?.message ?? settingsError?.message ?? "Unable to save settings.");
      return;
    }
    setLoadError("");
    setSaved(true);
  };
  const reset = () => {
    setSettings(defaultSettings);
    setSaved(false);
  };
  return (
    <AdminShell
      title="Settings"
      subtitle="Configure hospital operations, notifications, and access controls."
    >
      <AdminSectionHeading
        eyebrow="Administration"
        title="System settings"
        description="Manage the configuration that controls how the GGH portal operates."
        action={
          saved ? (
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#2d8a76]">
              <Check className="size-4" /> Settings saved
            </span>
          ) : (
            <Button type="submit" form="settings-form">
              <Save /> Save changes
            </Button>
          )
        }
      />
      {loadError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Settings error: {loadError}
        </p>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[240px_1fr]">
        <nav className="h-fit rounded-2xl border border-slate-200 bg-white p-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${active === id ? "bg-[#edf5f5] font-semibold text-[#22577a]" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>
        {active === "directory" ? (
          <DirectoryTab />
        ) : (
          <form id="settings-form" onSubmit={save} className="space-y-5">
            {active === "hospital" ? (
              <HospitalTab settings={settings} update={update} />
            ) : active === "operations" ? (
              <OperationsTab settings={settings} update={update} />
            ) : active === "notifications" ? (
              <NotificationsTab settings={settings} update={update} />
            ) : active === "security" ? (
              <SecurityTab settings={settings} update={update} />
            ) : null}
          </form>
        )}
      </div>
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={reset}
          className="text-xs font-semibold text-slate-500 hover:text-[#22577a]"
        >
          Reset local changes
        </button>
      </div>
    </AdminShell>
  );
}

function DirectoryTab() {
  const [departments, setDepartments] = useState<
    Array<{ id: string; name: string; code: string; active: boolean }>
  >([]);
  const [doctors, setDoctors] = useState<
    Array<{ id: string; name: string; phone: string; specialty: string; active: boolean }>
  >([]);
  const [departmentName, setDepartmentName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [doctor, setDoctor] = useState({ name: "", phone: "", specialty: "" });
  const [error, setError] = useState("");
  const load = async () => {
    const client = getSupabaseClient();
    const [departmentResult, doctorResult] = await Promise.all([
      client
        .from("departments")
        .select("id,name,code,active")
        .eq("hospital_id", GGH_HOSPITAL_ID)
        .order("name"),
      client
        .from("doctors")
        .select("id,name,phone,specialty,active")
        .eq("hospital_id", GGH_HOSPITAL_ID)
        .order("name"),
    ]);
    if (departmentResult.error || doctorResult.error) {
      setError(
        (departmentResult.error ?? doctorResult.error)?.message ?? "Unable to load directory.",
      );
      return;
    }
    setDepartments(departmentResult.data ?? []);
    setDoctors(
      (doctorResult.data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        phone: item.phone ?? "",
        specialty: item.specialty ?? "",
        active: item.active,
      })),
    );
  };
  useEffect(() => {
    void load();
  }, []);
  const addDepartment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!departmentName) return;
    const { data, error: insertError } = await getSupabaseClient()
      .from("departments")
      .insert({
        hospital_id: GGH_HOSPITAL_ID,
        name: departmentName,
        code: departmentCode || null,
        active: true,
      })
      .select("id,name,code,active")
      .single();
    if (insertError || !data) {
      setError(insertError?.message ?? "Unable to add department.");
      return;
    }
    setDepartments((current) => [...current, data]);
    setDepartmentName("");
    setDepartmentCode("");
  };
  const toggleDepartment = async (department: (typeof departments)[number]) => {
    const { error: updateError } = await getSupabaseClient()
      .from("departments")
      .update({ active: !department.active })
      .eq("id", department.id)
      .eq("hospital_id", GGH_HOSPITAL_ID);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDepartments((current) =>
      current.map((item) => (item.id === department.id ? { ...item, active: !item.active } : item)),
    );
  };
  const deleteDepartment = async (id: string) => {
    const { error: deleteError } = await getSupabaseClient()
      .from("departments")
      .delete()
      .eq("id", id)
      .eq("hospital_id", GGH_HOSPITAL_ID);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setDepartments((current) => current.filter((item) => item.id !== id));
  };
  const addDoctor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!doctor.name) {
      setError("Doctor name is required.");
      return;
    }
    const { data, error: insertError } = await getSupabaseClient()
      .from("doctors")
      .insert({
        hospital_id: GGH_HOSPITAL_ID,
        name: doctor.name,
        phone: doctor.phone || null,
        specialty: doctor.specialty || null,
        active: true,
      })
      .select("id,name,phone,specialty,active")
      .single();
    if (insertError || !data) {
      setError(insertError?.message ?? "Unable to add doctor.");
      return;
    }
    setDoctors((current) => [
      ...current,
      {
        id: data.id,
        name: data.name,
        phone: data.phone ?? "",
        specialty: data.specialty ?? "",
        active: data.active,
      },
    ]);
    setDoctor({ name: "", phone: "", specialty: "" });
  };
  const toggleDoctor = async (doctorRecord: (typeof doctors)[number]) => {
    const { error: updateError } = await getSupabaseClient()
      .from("doctors")
      .update({ active: !doctorRecord.active })
      .eq("hospital_id", GGH_HOSPITAL_ID)
      .eq("id", doctorRecord.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDoctors((current) =>
      current.map((item) =>
        item.id === doctorRecord.id ? { ...item, active: !doctorRecord.active } : item,
      ),
    );
  };
  return (
    <SettingsSection
      icon={<Users />}
      title="Doctors and departments"
      description="Manage the directory used by appointments, laboratory orders, visits, and prescriptions."
    >
      {error ? <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-5 xl:grid-cols-2">
        <div>
          <h3 className="font-semibold">Departments</h3>
          <form onSubmit={addDepartment} className="mt-3 grid gap-2 sm:grid-cols-[1fr_120px_auto]">
            <input
              className="field-control"
              placeholder="Department name"
              value={departmentName}
              onChange={(event) => setDepartmentName(event.target.value)}
            />
            <input
              className="field-control"
              placeholder="Code"
              value={departmentCode}
              onChange={(event) => setDepartmentCode(event.target.value)}
            />
            <Button type="submit">
              <Plus /> Add
            </Button>
          </form>
          <div className="mt-4 space-y-2">
            {departments.map((department) => (
              <div
                key={department.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm"
              >
                <span>
                  <strong>{department.name}</strong>
                  <span className="ml-2 text-xs text-slate-400">{department.code ?? ""}</span>
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleDepartment(department)}
                    className="text-xs font-semibold text-[#22577a]"
                  >
                    {department.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteDepartment(department.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Doctors</h3>
          <form onSubmit={addDoctor} className="mt-3 space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="field-control"
                placeholder="Doctor full name"
                value={doctor.name}
                onChange={(event) =>
                  setDoctor((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
              <input
                className="field-control"
                placeholder="Phone"
                value={doctor.phone}
                onChange={(event) =>
                  setDoctor((current) => ({ ...current, phone: event.target.value }))
                }
              />
              <input
                className="field-control"
                placeholder="Specialty"
                value={doctor.specialty}
                onChange={(event) =>
                  setDoctor((current) => ({ ...current, specialty: event.target.value }))
                }
              />
            </div>
            <Button type="submit">
              <Plus /> Add doctor
            </Button>
          </form>
          <div className="mt-4 space-y-2">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm"
              >
                <span>
                  <strong>{doctor.name}</strong>
                  <span className="block text-xs text-slate-400">
                    {doctor.specialty || "General"} {doctor.phone ? `· ${doctor.phone}` : ""}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => void toggleDoctor(doctor)}
                  className="text-xs font-semibold text-red-600"
                >
                  {doctor.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}

function HospitalTab({
  settings,
  update,
}: {
  settings: HospitalSettings;
  update: <K extends keyof HospitalSettings>(key: K, value: HospitalSettings[K]) => void;
}) {
  return (
    <SettingsSection
      icon={<Building2 />}
      title="Hospital profile"
      description="The identity and regional defaults used across the management portal."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Hospital name"
          value={settings.hospitalName}
          onChange={(value) => update("hospitalName", value)}
        />
        <Field
          label="Legal name"
          value={settings.legalName}
          onChange={(value) => update("legalName", value)}
        />
        <Field label="Phone" value={settings.phone} onChange={(value) => update("phone", value)} />
        <Field
          label="Administrative email"
          type="email"
          value={settings.email}
          onChange={(value) => update("email", value)}
        />
        <Field
          label="Address"
          className="sm:col-span-2"
          value={settings.address}
          onChange={(value) => update("address", value)}
        />
        <SelectField
          label="Hospital timezone"
          value={settings.timezone}
          options={["Africa/Mogadishu", "UTC", "Africa/Nairobi"]}
          onChange={(value) => update("timezone", value)}
        />
        <SelectField
          label="Currency"
          value={settings.currency}
          options={["USD ($)", "SOS (Sh)", "KES (KSh)"]}
          onChange={(value) => update("currency", value)}
        />
      </div>
    </SettingsSection>
  );
}
function OperationsTab({
  settings,
  update,
}: {
  settings: HospitalSettings;
  update: <K extends keyof HospitalSettings>(
    key: K,
    value: HospitalSettings[keyof HospitalSettings],
  ) => void;
}) {
  return (
    <SettingsSection
      icon={<SlidersHorizontal />}
      title="Operations defaults"
      description="Configure practical defaults for appointments, queues, and laboratory worklists."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField
          label="Appointment slot"
          value={settings.appointmentSlot}
          options={["10 minutes", "15 minutes", "20 minutes", "30 minutes"]}
          onChange={(value) => update("appointmentSlot", value)}
        />
        <SelectField
          label="Queue alert threshold"
          value={settings.queueThreshold}
          options={["15 minutes", "30 minutes", "45 minutes", "60 minutes"]}
          onChange={(value) => update("queueThreshold", value)}
        />
        <SelectField
          label="Lab TAT target"
          value={settings.labTatTarget}
          options={["30 minutes", "60 minutes", "90 minutes", "120 minutes"]}
          onChange={(value) => update("labTatTarget", value)}
        />
      </div>
      <div className="mt-5 rounded-xl border border-[#dceff0] bg-[#edf5f5] p-4 text-xs leading-relaxed text-slate-600">
        <Clock3 className="mb-2 size-4 text-[#22577a]" />
        These values are operational targets. They do not replace department-specific policies.
      </div>
    </SettingsSection>
  );
}
function NotificationsTab({
  settings,
  update,
}: {
  settings: HospitalSettings;
  update: <K extends keyof HospitalSettings>(
    key: K,
    value: HospitalSettings[keyof HospitalSettings],
  ) => void;
}) {
  return (
    <SettingsSection
      icon={<Bell />}
      title="Notifications"
      description="Choose which operational events should raise alerts for administrators."
    >
      <Toggle
        label="Low-stock alerts"
        description="Notify pharmacy managers when a medicine reaches its minimum level."
        checked={settings.lowStockAlerts}
        onChange={(value) => update("lowStockAlerts", value)}
      />
      <Toggle
        label="Critical laboratory results"
        description="Alert authorized clinical staff when a critical result is recorded."
        checked={settings.criticalResultAlerts}
        onChange={(value) => update("criticalResultAlerts", value)}
      />
      <Toggle
        label="Failed login alerts"
        description="Record and notify administrators about blocked sign-in attempts."
        checked={settings.failedLoginAlerts}
        onChange={(value) => update("failedLoginAlerts", value)}
      />
    </SettingsSection>
  );
}
function SecurityTab({
  settings,
  update,
}: {
  settings: HospitalSettings;
  update: <K extends keyof HospitalSettings>(
    key: K,
    value: HospitalSettings[keyof HospitalSettings],
  ) => void;
}) {
  return (
    <>
      <SettingsSection
        icon={<ShieldCheck />}
        title="Security controls"
        description="These controls will be enforced server-side when Supabase Auth and RLS are connected."
      >
        <Toggle
          label="Require multi-factor authentication"
          description="Require staff to complete MFA before accessing the portal."
          checked={settings.mfaRequired}
          onChange={(value) => update("mfaRequired", value)}
        />
        <SelectField
          label="Session timeout"
          value={settings.sessionTimeout}
          options={["15 minutes", "30 minutes", "60 minutes", "8 hours"]}
          onChange={(value) => update("sessionTimeout", value)}
        />
      </SettingsSection>
      <div className="rounded-2xl border border-[#f0c987] bg-[#fff9eb] p-5 text-xs leading-relaxed text-slate-600">
        <LockKeyhole className="mb-2 size-4 text-[#b57918]" />
        <p className="font-semibold text-slate-800">Supabase security pending</p>
        <p className="mt-1">
          MFA, session revocation, staff roles, and row-level permissions will be connected after
          the project credentials and schema are configured.
        </p>
      </div>
    </>
  );
}
function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex gap-3 border-b border-slate-100 pb-5">
        <span className="grid size-10 place-items-center rounded-xl bg-[#edf5f5] text-[#22577a]">
          {icon}
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block text-sm font-medium text-slate-700 ${className}`}>
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-control mt-2"
      />
    </label>
  );
}
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-control mt-2"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 border-b border-slate-100 py-4 first:pt-0 last:border-b-0 last:pb-0">
      <span>
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        <span className="mt-1 block max-w-xl text-xs leading-relaxed text-slate-500">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-4 accent-[#22577a]"
      />
    </label>
  );
}
