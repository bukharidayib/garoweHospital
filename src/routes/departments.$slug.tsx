import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionHeading } from "@/components/site/SectionHeading";
import { DoctorCard } from "@/components/site/cards";
import { AppointmentCta, OpeningHoursCard } from "@/components/site/blocks";
import { doctorsByDepartment, getDepartment, hospital, services } from "@/content/hospital";

export const Route = createFileRoute("/departments/$slug")({
  loader: ({ params }) => {
    const department = getDepartment(params.slug);
    if (!department || !department.active) throw notFound();
    return { department };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Department unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const t = `${loaderData.department.name} Department | ${hospital.shortName}`;
    return {
      meta: [
        { title: t },
        { name: "description", content: loaderData.department.summary },
        { property: "og:title", content: t },
        { property: "og:description", content: loaderData.department.summary },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/departments/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/departments/${params.slug}` }],
    };
  },
  component: DepartmentPage,
  notFoundComponent: DepartmentNotFound,
});

function DepartmentPage() {
  const { department } = Route.useLoaderData();
  const team = doctorsByDepartment(department.slug);
  const related = services.filter((s) => s.departmentSlug === department.slug);

  return (
    <>
      <PageHeader
        title={department.name}
        description={department.summary}
        crumbs={[{ label: "Departments", to: "/departments" }, { label: department.name }]}
      />

      <section className="container-page section-y grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionHeading title={`About the ${department.name} department`} description={department.description} />
          <h3 className="mt-10 font-display text-lg font-semibold text-foreground">
            Services in this department
          </h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {department.services.map((s) => (
              <li key={s} className="flex items-center gap-3 text-sm text-foreground">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                {s}
              </li>
            ))}
          </ul>

          {related.length > 0 ? (
            <div className="mt-10">
              <h3 className="font-display text-lg font-semibold text-foreground">Related hospital services</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {related.map((s) => (
                  <li key={s.slug}>
                    <Link
                      to="/services/$slug"
                      params={{ slug: s.slug }}
                      className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Button asChild size="lg" className="mt-10">
            <Link to="/appointments" search={{ department: department.slug }}>
              Book in {department.name}
            </Link>
          </Button>
        </div>
        <OpeningHoursCard />
      </section>

      {team.length > 0 ? (
        <section className="bg-surface">
          <div className="container-page section-y">
            <SectionHeading eyebrow="Team" title={`Doctors in ${department.name}`} />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((doctor) => (
                <DoctorCard key={doctor.slug} doctor={doctor} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <AppointmentCta />
    </>
  );
}

function DepartmentNotFound() {
  return (
    <div className="container-page section-y text-center">
      <h1 className="font-display text-3xl font-semibold text-foreground">Department not found</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        This department is not currently listed at {hospital.name}.
      </p>
      <Button asChild className="mt-6">
        <Link to="/departments">View all departments</Link>
      </Button>
    </div>
  );
}
