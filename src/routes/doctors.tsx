import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { DoctorCard } from "@/components/site/cards";
import { AppointmentCta } from "@/components/site/blocks";
import { departments, doctors, hospital } from "@/content/hospital";

const title = "Our Doctors";
const description =
  "Meet the doctors of Garowe General Hospital (GGH). Browse clinicians by department and specialty and book a consultation online.";

export const Route = createFileRoute("/doctors")({
  head: () => ({
    meta: [
      { title: `${title} | ${hospital.name}` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | ${hospital.shortName}` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/doctors" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/doctors" }],
  }),
  component: DoctorsPage,
});

function DoctorsPage() {
  const grouped = departments
    .map((d) => ({ department: d, team: doctors.filter((doc) => doc.departmentSlug === d.slug) }))
    .filter((g) => g.team.length > 0);

  return (
    <>
      <PageHeader
        title="Meet Our Doctors"
        description={`Clinicians at ${hospital.name} listed by department. Public profiles show professional information only.`}
        crumbs={[{ label: "Doctors" }]}
      />
      <div className="container-page section-y space-y-16">
        {grouped.map(({ department, team }) => (
          <section key={department.slug} aria-labelledby={`dept-${department.slug}`}>
            <h2
              id={`dept-${department.slug}`}
              className="font-display text-xl font-semibold text-foreground"
            >
              {department.name}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((doctor) => (
                <DoctorCard key={doctor.slug} doctor={doctor} />
              ))}
            </div>
          </section>
        ))}
      </div>
      <AppointmentCta />
    </>
  );
}
