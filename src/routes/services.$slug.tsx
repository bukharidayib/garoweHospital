import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionHeading } from "@/components/site/SectionHeading";
import { AppointmentCta, OpeningHoursCard } from "@/components/site/blocks";
import { departmentName, getService, hospital } from "@/content/hospital";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = getService(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Service unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const t = `${loaderData.service.name} | ${hospital.shortName}`;
    return {
      meta: [
        { title: t },
        { name: "description", content: loaderData.service.summary },
        { property: "og:title", content: t },
        { property: "og:description", content: loaderData.service.summary },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/services/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/services/${params.slug}` }],
    };
  },
  component: ServicePage,
  notFoundComponent: ServiceNotFound,
});

function ServicePage() {
  const { service } = Route.useLoaderData();

  return (
    <>
      <PageHeader
        title={service.name}
        description={service.summary}
        crumbs={[{ label: "Services", to: "/services" }, { label: service.name }]}
      />
      <section className="container-page section-y grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionHeading title={`About this service`} description={service.description} />
          <p className="mt-6 text-sm text-muted-foreground">
            Delivered by{" "}
            <Link
              to="/departments/$slug"
              params={{ slug: service.departmentSlug }}
              className="font-semibold text-primary underline underline-offset-4"
            >
              {departmentName(service.departmentSlug)}
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/appointments" search={{ department: service.departmentSlug }}>
                Book Appointment
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/doctors">Find a Doctor</Link>
            </Button>
          </div>
        </div>
        <OpeningHoursCard />
      </section>
      <AppointmentCta />
    </>
  );
}

function ServiceNotFound() {
  return (
    <div className="container-page section-y text-center">
      <h1 className="font-display text-3xl font-semibold text-foreground">Service not found</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        This service is not currently listed at {hospital.name}.
      </p>
      <Button asChild className="mt-6">
        <Link to="/services">View all services</Link>
      </Button>
    </div>
  );
}
