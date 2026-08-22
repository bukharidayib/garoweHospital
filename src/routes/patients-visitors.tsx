import { createFileRoute, Link } from "@tanstack/react-router";
import { Accessibility, BadgeCheck, ClipboardList, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionHeading } from "@/components/site/SectionHeading";
import {
  AppointmentCta,
  EmergencyPanel,
  FaqSection,
  OpeningHoursCard,
} from "@/components/site/blocks";
import { hospital, patientJourney } from "@/content/hospital";

const title = "Patients & Visitors";
const description =
  "Practical information for patients and visitors at Garowe General Hospital (GGH): opening hours, what to bring, visiting guidance, accessibility and frequently asked questions.";

export const Route = createFileRoute("/patients-visitors")({
  head: () => ({
    meta: [
      { title: `${title} | ${hospital.name}` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | ${hospital.shortName}` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/patients-visitors" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/patients-visitors" }],
  }),
  component: PatientsVisitorsPage,
});

const guidance = [
  {
    icon: ClipboardList,
    title: "What to bring",
    body: "Identification, previous hospital documents or test results, and a list of medication you currently take.",
  },
  {
    icon: Users,
    title: "Visiting guidance",
    body: "Visiting times are set per ward to protect patient rest and privacy. Ward staff will confirm times on arrival.",
  },
  {
    icon: BadgeCheck,
    title: "At reception",
    body: "Check in at reception with your appointment reference. Emergency patients are triaged by clinical urgency.",
  },
  {
    icon: Accessibility,
    title: "Accessibility support",
    body: "Tell reception if you need step-free access, seating assistance or help understanding your care plan.",
  },
];

function PatientsVisitorsPage() {
  return (
    <>
      <PageHeader
        title="Patients & Visitors"
        description={`Everything you need to prepare for a visit to ${hospital.name}.`}
        crumbs={[{ label: "Patients & Visitors" }]}
      />

      <section className="container-page section-y grid gap-6 lg:grid-cols-2">
        <OpeningHoursCard />
        <EmergencyPanel />
      </section>

      <section className="bg-surface">
        <div className="container-page section-y">
          <SectionHeading eyebrow="Before you arrive" title="Preparing for your visit" align="center" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {guidance.map((item) => (
              <article key={item.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page section-y">
        <SectionHeading eyebrow="Patient journey" title="How a visit works" align="center" />
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {patientJourney.map((step) => (
            <li key={step.step} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="font-display text-3xl font-semibold text-primary-soft">{step.step}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="accessibility" className="scroll-mt-32 bg-surface">
        <div className="container-page section-y grid gap-10 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Accessibility"
            title="Care that is accessible to everyone"
            description="This website is built to WCAG-oriented principles: keyboard navigation, visible focus states, semantic structure, sufficient colour contrast and descriptive image alternatives."
          />
          <div className="rounded-2xl border border-border bg-card p-7 shadow-card">
            <p className="text-sm leading-relaxed text-muted-foreground">
              If you experience a barrier using this website, or need assistance during a hospital
              visit, please contact us so we can help. Accessibility feedback is reviewed by hospital
              administration.
            </p>
            <Button asChild className="mt-6">
              <Link to="/contact">Contact the hospital</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page section-y">
        <FaqSection />
      </section>

      <AppointmentCta />
    </>
  );
}
