import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { DepartmentCard } from "@/components/site/cards";
import { AppointmentCta } from "@/components/site/blocks";
import { departments, hospital } from "@/content/hospital";

const title = "Hospital Departments";
const description =
  "Explore the clinical departments at Garowe General Hospital (GGH): general medicine, emergency, pediatrics, obstetrics & gynecology, surgery, laboratory, pharmacy and radiology.";

export const Route = createFileRoute("/departments")({
  head: () => ({
    meta: [
      { title: `${title} | ${hospital.name}` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | ${hospital.shortName}` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/departments" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/departments" }],
  }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const active = departments.filter((d) => d.active);

  return (
    <>
      <PageHeader
        title="Clinical Departments"
        description={`Each department at ${hospital.name} is staffed by clinicians who work together across the hospital to support your diagnosis, treatment and recovery.`}
        crumbs={[{ label: "Departments" }]}
      />
      <section className="container-page section-y">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((department) => (
            <DepartmentCard key={department.slug} department={department} />
          ))}
        </div>
      </section>
      <AppointmentCta />
    </>
  );
}
