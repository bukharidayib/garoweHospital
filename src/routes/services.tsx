import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { ServiceCard } from "@/components/site/cards";
import { AppointmentCta } from "@/components/site/blocks";
import { hospital, services } from "@/content/hospital";

const title = "Medical Services";
const description =
  "Medical services at Garowe General Hospital (GGH): general consultation, emergency care, laboratory testing, pharmacy, maternal and pediatric care, diagnostics and inpatient care.";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: `${title} | ${hospital.name}` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | ${hospital.shortName}` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/services" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <PageHeader
        title="Medical Services"
        description={`Services offered at ${hospital.name}, from routine consultation and diagnostics to emergency and inpatient care.`}
        crumbs={[{ label: "Services" }]}
      />
      <section className="container-page section-y">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>
      <AppointmentCta />
    </>
  );
}
