import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, PhoneCall } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ContactForm } from "@/components/site/ContactForm";
import {
  EmergencyPanel,
  LocationSection,
  OpeningHoursCard,
} from "@/components/site/blocks";
import { CONTACT_PENDING, hospital } from "@/content/hospital";

const title = "Contact Us";
const description =
  "Contact Garowe General Hospital (GGH): phone, email, address, opening hours, emergency contact details and an enquiry form for patients and visitors.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `${title} | ${hospital.name}` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | ${hospital.shortName}` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const details = [
    { icon: PhoneCall, label: "Hospital phone", value: hospital.phone ?? CONTACT_PENDING },
    { icon: Mail, label: "Email", value: hospital.email ?? CONTACT_PENDING },
    {
      icon: MapPin,
      label: "Address",
      value:
        hospital.addressLines?.join(", ") ??
        `${hospital.city}, ${hospital.region}, ${hospital.country}`,
    },
  ];

  return (
    <>
      <PageHeader
        title="Contact Garowe General Hospital"
        description="Get in touch with hospital administration, find our location, or use the emergency contact details below."
        crumbs={[{ label: "Contact" }]}
      />

      <section className="container-page section-y grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <SectionHeading
            eyebrow="Send a message"
            title="How can we help?"
            description="Use this form for general enquiries, appointment questions and feedback."
          />
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-7 shadow-card">
            <h2 className="font-display text-xl font-semibold text-foreground">Contact details</h2>
            <dl className="mt-6 space-y-5">
              {details.map((d) => (
                <div key={d.label} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <d.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {d.label}
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium text-foreground">{d.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
          <OpeningHoursCard />
        </div>
      </section>

      <section className="bg-surface">
        <div className="container-page section-y grid gap-6 lg:grid-cols-2">
          <EmergencyPanel />
          <div className="rounded-2xl border border-border bg-card p-7 shadow-card">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Administration enquiries
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Hospital administration handles appointment support, records requests, billing questions
              and feedback. Contact numbers and email addresses are published here as soon as they are
              confirmed in hospital settings.
            </p>
          </div>
        </div>
      </section>

      <div className="container-page section-y">
        <LocationSection />
      </div>
    </>
  );
}
