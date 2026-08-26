import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BedDouble, CheckCircle2, Filter, Wrench } from "lucide-react";
import { AdminSectionHeading, AdminShell } from "@/components/admin/AdminShell";
import { beds, wards } from "@/content/admissions";
import { GGH_HOSPITAL_ID } from "@/lib/supabase/hospital";
import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/bed-board")({
  head: () => ({ meta: [{ title: "Bed Board | GGH Management Portal" }] }),
  component: BedBoardPage,
});
function BedBoardPage() {
  const [filter, setFilter] = useState("All");
  const [bedRows, setBedRows] = useState<typeof beds>([]);
  const [wardRows, setWardRows] = useState<typeof wards>([]);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let active = true;
    async function loadBeds() {
      const client = getSupabaseClient();
      const [wardsResult, bedsResult] = await Promise.all([
        client.from("wards").select("*").eq("hospital_id", GGH_HOSPITAL_ID).order("name"),
        client.from("beds").select("*").eq("hospital_id", GGH_HOSPITAL_ID).order("bed_number"),
      ]);
      if (!active) return;
      if (wardsResult.error || bedsResult.error) {
        setLoadError(
          wardsResult.error?.message ?? bedsResult.error?.message ?? "Unable to load bed board.",
        );
        return;
      }
      const wardMap = new Map((wardsResult.data ?? []).map((row) => [row.id, row]));
      setWardRows(
        (wardsResult.data ?? []).map((row) => {
          const total = bedsResult.data?.filter((bed) => bed.ward_id === row.id).length ?? 0;
          const occupied =
            bedsResult.data?.filter((bed) => bed.ward_id === row.id && bed.status === "Occupied")
              .length ?? 0;
          return {
            id: row.id,
            name: row.name,
            code: row.code ?? "",
            department: "Unassigned",
            total,
            occupied,
            available: total - occupied,
            cleaning: 0,
            maintenance: 0,
            rate: total ? Math.round((occupied / total) * 100) : 0,
          };
        }),
      );
      setBedRows(
        (bedsResult.data ?? []).map((row) => {
          const ward = wardMap.get(row.ward_id);
          return {
            id: row.id,
            code: row.bed_number,
            ward: ward?.name ?? row.ward_id,
            room: "—",
            status: row.status,
            patient: "",
            patientNumber: "",
            doctor: "",
            los: "",
            isolation: false,
          };
        }),
      );
    }
    void loadBeds();
    return () => {
      active = false;
    };
  }, []);
  const visible = bedRows.filter((bed) => filter === "All" || bed.status === filter);
  return (
    <AdminShell
      title="Bed board"
      subtitle="See current capacity and placement status across GGH wards."
    >
      <AdminSectionHeading
        eyebrow="Capacity management"
        title="Bed board"
        description="Operational view of ward → room → bed. Live availability will be revalidated from the database later."
        action={
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600">
            <Filter className="size-4" /> Advanced filters
          </button>
        }
      />
      {loadError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Bed board error: {loadError}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {["All", "Available", "Occupied", "Cleaning", "Maintenance"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${filter === item ? "bg-[#123247] text-white" : "border border-slate-200 bg-white text-slate-600"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {wardRows.map((ward) => (
          <article key={ward.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-semibold">{ward.name}</p>
                <p className="mt-1 text-[11px] text-slate-400">{ward.department}</p>
              </div>
              <span className="text-lg font-semibold text-[#22577a]">{ward.rate}%</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-[#38a3a5]" style={{ width: `${ward.rate}%` }} />
            </div>
            <div className="mt-3 flex justify-between text-[11px] text-slate-500">
              <span>{ward.occupied} occupied</span>
              <span>{ward.available} available</span>
            </div>
          </article>
        ))}
      </div>
      <section className="space-y-5">
        {wardRows.map((ward) => {
          const wardBeds = visible.filter((bed) => bed.ward === ward.name);
          if (!wardBeds.length) return null;
          return (
            <div key={ward.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold">{ward.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {ward.department} · {ward.total} beds total
                  </p>
                </div>
                <Link
                  to="/admin/wards/$wardId"
                  params={{ wardId: ward.id }}
                  className="text-xs font-semibold text-[#22577a]"
                >
                  Open ward →
                </Link>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {wardBeds.map((bed) => (
                  <BedCard key={bed.id} bed={bed} />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </AdminShell>
  );
}
function BedCard({ bed }: { bed: (typeof beds)[number] }) {
  const tone =
    bed.status === "Available"
      ? "border-[#b9e0d0] bg-[#f2fbf6]"
      : bed.status === "Occupied"
        ? "border-[#c7dce9] bg-[#f4f9fc]"
        : bed.status === "Cleaning"
          ? "border-[#f0d9a4] bg-[#fffaf0]"
          : "border-[#efc0b4] bg-[#fff6f3]";
  return (
    <article className={`rounded-xl border p-4 ${tone}`}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-semibold">
          <BedDouble className="size-4 text-slate-500" />
          {bed.code}
        </span>
        <StatusIcon status={bed.status} />
      </div>
      <p className="mt-3 text-[11px] font-semibold text-slate-700">{bed.status}</p>
      {bed.patient ? (
        <>
          <p className="mt-2 text-sm font-semibold text-slate-800">{bed.patient}</p>
          <p className="mt-1 text-[11px] text-slate-500">{bed.patientNumber}</p>
          <p className="mt-2 text-[11px] text-slate-500">
            {bed.los} · {bed.doctor}
          </p>
          {bed.isolation ? (
            <span className="mt-3 inline-block rounded-full bg-[#fbe5df] px-2 py-1 text-[10px] font-semibold text-[#d85c3f]">
              Isolation
            </span>
          ) : null}
        </>
      ) : (
        <p className="mt-2 text-[11px] text-slate-500">{bed.room} · ready for placement</p>
      )}
      {bed.status === "Maintenance" ? (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-[#d85c3f]">
          <Wrench className="size-3" /> Equipment check
        </p>
      ) : null}
    </article>
  );
}
function StatusIcon({ status }: { status: string }) {
  return status === "Available" ? (
    <CheckCircle2 className="size-4 text-[#2d8a76]" />
  ) : status === "Maintenance" ? (
    <Wrench className="size-4 text-[#d85c3f]" />
  ) : (
    <span className="size-2 rounded-full bg-current text-[#b57918]" />
  );
}
