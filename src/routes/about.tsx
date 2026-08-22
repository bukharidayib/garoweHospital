import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Icon } from "@/components/site/Icon";
import { AppointmentCta } from "@/components/site/blocks";
import { hospital, trustIndicators, whyChooseUs } from "@/content/hospital";
import aboutImage from "@/assets/about-hospital.jpg";

const title = "About Garowe General Hospital (GGH)";
const description =
  "Learn about Garowe General Hospital (GGH): our commitment to accessible, safe and high-quality healthcare for patients and families in Garowe, Puntland.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `${title} | ${hospital.shortName}` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHeader
        title={`About ${hospital.name}`}
        description={`${hospital.shortName} is a general hospital serving ${hospital.city} and the wider ${hospital.region} region with outpatient, emergency, maternal, surgical and diagnostic services.`}
        crumbs={[{ label: "About" }]}
      />

      <section className="container-page section-y grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Our commitment"
            title="Accessible, safe and high-quality care"
            description={`${hospital.name} is committed to providing accessible, safe and high-quality healthcare to patients and families through professional medical services, modern facilities and compassionate care.`}
          />
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Our clinical departments work together so patients move smoothly from first assessment to
            diagnostics, treatment and follow-up. Emergency care is available around the clock, and
            outpatient clinics run on scheduled appointments so patients spend less time waiting.
          </p>
        </div>
        <div className="overflow-hidden rounded-3xl shadow-card">
          <img
            src={aboutImage}
            alt="Interior of Garowe General Hospital showing a bright reception and waiting area"
            loading="lazy"
            width={1408}
            height={1008}
            className="aspect-[7/5] w-full object-cover"
          />
        </div>
      </section>

      <section className="bg-surface">
        <div className="container-page section-y">
          <SectionHeading
            eyebrow="Mission & values"
            title="What guides our care"
            align="center"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon name={v.icon} className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page section-y">
        <SectionHeading eyebrow="Facilities" title="Hospital facilities and capabilities" />
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {trustIndicators.map((item) => (
            <div key={item.label} className="border-l-2 border-accent pl-5">
              <Icon name={item.icon} className="size-6 text-primary" />
              <p className="mt-3 font-display text-lg font-semibold text-foreground">{item.label}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          Verified statistics such as bed capacity, staff numbers and years of service will be
          published here once confirmed by hospital administration.
        </p>
      </section>

      <AppointmentCta />
    </>
  );
}
