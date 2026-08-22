import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarPlus, Clock, Quote, Search, Siren } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/site/Icon";
import { SectionHeading } from "@/components/site/SectionHeading";
import { DepartmentCard, DoctorCard, ServiceCard } from "@/components/site/cards";
import {
  AppointmentCta,
  EmergencyPanel,
  FaqSection,
  LocationSection,
  OpeningHoursCard,
} from "@/components/site/blocks";
import {
  departments,
  doctors,
  hospital,
  patientJourney,
  services,
  testimonials,
  testimonialsAreDemo,
  trustIndicators,
  whyChooseUs,
} from "@/content/hospital";
import heroImage from "@/assets/hero-hospital.jpg";
import aboutImage from "@/assets/about-hospital.jpg";

const title = "Garowe General Hospital (GGH) — Advanced Healthcare, Compassionate Care";
const description =
  "Garowe General Hospital (GGH) provides professional, patient-centered healthcare in Garowe: 24/7 emergency care, clinical departments, experienced doctors and online appointment booking.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Hospital",
          name: hospital.name,
          alternateName: hospital.shortName,
          address: {
            "@type": "PostalAddress",
            addressLocality: hospital.city,
            addressRegion: hospital.region,
            addressCountry: hospital.country,
          },
          medicalSpecialty: departments.map((d) => d.name),
        }),
      },
    ],
  }),
  component: HomePage,
});

const quickAccess = [
  {
    icon: "CalendarPlus",
    title: "Book Appointment",
    body: "Find an available doctor and schedule a consultation.",
    action: "Book now",
    to: "/appointments" as const,
  },
  {
    icon: "Search",
    title: "Find a Doctor",
    body: "Search healthcare professionals by department or specialty.",
    action: "Browse doctors",
    to: "/doctors" as const,
  },
  {
    icon: "Siren",
    title: "Emergency Care",
    body: "Emergency contact details and directions to our emergency department.",
    action: "Emergency information",
    to: "/contact" as const,
    hash: "emergency",
  },
  {
    icon: "Clock",
    title: "Opening Hours",
    body: "Outpatient clinic hours and 24-hour emergency availability.",
    action: "View hours",
    to: "/patients-visitors" as const,
    hash: "opening-hours",
  },
];

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-primary-deep text-primary-foreground">
        <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/85 ring-1 ring-primary-foreground/20">
              {hospital.shortName} · {hospital.city}, {hospital.region}
            </p>
            <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              Advanced healthcare.
              <span className="block text-accent">Compassionate care.</span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              {hospital.name} provides professional, patient-centered healthcare through experienced
              medical teams, modern clinical services, and a commitment to safe and compassionate
              treatment.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="xl" variant="accent">
                <Link to="/appointments">
                  <CalendarPlus />
                  Book an Appointment
                </Link>
              </Button>
              <Button asChild size="xl" variant="hero">
                <Link to="/services">Explore Our Services</Link>
              </Button>
              <Button asChild size="xl" variant="emergency">
                <Link to="/contact" hash="emergency">
                  <Siren />
                  Emergency Care
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl ring-1 ring-primary-foreground/15">
              <img
                src={heroImage}
                alt="A doctor at Garowe General Hospital standing in a bright hospital corridor with clinical staff in the background"
                width={1600}
                height={1200}
                fetchPriority="high"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-4 hidden rounded-2xl bg-background p-5 shadow-lift sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Emergency department
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-foreground">
                Open 24 hours, every day
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section aria-labelledby="quick-access" className="bg-surface">
        <div className="container-page py-14 lg:py-16">
          <h2 id="quick-access" className="sr-only">
            Quick access
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {quickAccess.map((card) => (
              <article
                key={card.title}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Icon name={card.icon} className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-base font-semibold text-foreground">
                  {card.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
                <Link
                  to={card.to}
                  hash={card.hash}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-deep"
                >
                  {card.action}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST INDICATORS */}
      <section aria-labelledby="trust" className="container-page section-y">
        <h2 id="trust" className="sr-only">
          Why patients trust {hospital.shortName}
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {trustIndicators.map((item) => (
            <div key={item.label} className="border-l-2 border-accent pl-5">
              <Icon name={item.icon} className="size-6 text-primary" />
              <p className="mt-3 font-display text-lg font-semibold text-foreground">{item.label}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="bg-surface">
        <div className="container-page section-y grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="overflow-hidden rounded-3xl shadow-card">
            <img
              src={aboutImage}
              alt="Bright hospital reception and waiting area with a nurse assisting a patient"
              loading="lazy"
              width={1408}
              height={1008}
              className="aspect-[7/5] w-full object-cover"
            />
          </div>
          <div>
            <SectionHeading
              eyebrow={`About ${hospital.shortName}`}
              title={`Healthcare built around the patient`}
              description={`${hospital.name} is committed to providing accessible, safe and high-quality healthcare to patients and families through professional medical services, modern facilities and compassionate care.`}
            />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {["Patient-first approach", "Qualified professionals", "Modern facilities", "Comprehensive care"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                      <Icon name="Check" className="size-4" />
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ul>
            <Button asChild variant="outline" size="lg" className="mt-8">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* DEPARTMENTS */}
      <section className="container-page section-y">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Departments"
            title="Clinical departments at GGH"
            description="Coordinated care across core hospital specialties, each supported by our diagnostic and pharmacy services."
          />
          <Button asChild variant="ghost">
            <Link to="/departments">
              All departments
              <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {departments
            .filter((d) => d.active)
            .slice(0, 8)
            .map((department) => (
              <DepartmentCard key={department.slug} department={department} />
            ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-surface">
        <div className="container-page section-y">
          <SectionHeading
            eyebrow="Featured services"
            title="Medical services for every stage of care"
            description="From first consultation to diagnostics, treatment and follow-up."
            align="center"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services
              .filter((s) => s.featured)
              .slice(0, 6)
              .map((service) => (
                <ServiceCard key={service.slug} service={service} />
              ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* DOCTORS */}
      <section className="container-page section-y">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Our team"
            title="Meet our doctors"
            description="Qualified clinicians across our departments, available for scheduled consultations."
          />
          <Button asChild variant="ghost">
            <Link to="/doctors">
              View All Doctors
              <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.slice(0, 4).map((doctor) => (
            <DoctorCard key={doctor.slug} doctor={doctor} />
          ))}
        </div>
      </section>

      {/* WHY CHOOSE GGH */}
      <section className="bg-primary-deep text-primary-foreground">
        <div className="container-page section-y">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Why choose {hospital.shortName}
            </p>
            <h2 className="text-balance font-display text-3xl font-semibold sm:text-4xl">
              A hospital patients can rely on
            </h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item) => (
              <div key={item.title} className="rounded-2xl bg-primary-foreground/[0.06] p-6 ring-1 ring-primary-foreground/10">
                <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <Icon name={item.icon} className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/75">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PATIENT JOURNEY */}
      <section className="container-page section-y">
        <SectionHeading
          eyebrow="Patient journey"
          title="What to expect at your visit"
          description="Four simple steps from booking to follow-up care."
          align="center"
        />
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {patientJourney.map((step) => (
            <li key={step.step} className="relative rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="font-display text-3xl font-semibold text-primary-soft">{step.step}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <AppointmentCta />

      {/* TESTIMONIALS */}
      <section className="bg-surface">
        <div className="container-page section-y">
          <SectionHeading
            eyebrow="Patient voices"
            title="What patients say"
            description={
              testimonialsAreDemo
                ? "Demo content shown below. Approved patient testimonials will be published here by hospital administration."
                : undefined
            }
            align="center"
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.quote} className="flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-card">
                <Quote className="size-7 text-accent" aria-hidden="true" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{t.name}</span> · {t.context}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page section-y">
        <FaqSection />
      </section>

      {/* EMERGENCY + HOURS */}
      <section className="bg-surface">
        <div className="container-page section-y grid gap-6 lg:grid-cols-2">
          <EmergencyPanel />
          <OpeningHoursCard />
        </div>
      </section>

      {/* LOCATION */}
      <div className="container-page section-y">
        <LocationSection />
      </div>
    </>
  );
}
