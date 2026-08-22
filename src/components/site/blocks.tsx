import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Navigation, PhoneCall, ShieldCheck, Siren } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import {
  CONTACT_PENDING,
  faqs,
  hospital,
  mapDirectionsUrl,
  mapEmbedUrl,
  openingHours,
} from "@/content/hospital";

export function OpeningHoursCard() {
  return (
    <div id="opening-hours" className="scroll-mt-32 rounded-2xl border border-border bg-card p-7 shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
          <Clock className="size-5" aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl font-semibold text-foreground">Opening Hours</h2>
      </div>
      <dl className="mt-6 divide-y divide-border">
        {openingHours.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4 py-3">
            <dt className={row.emphasis ? "text-sm font-semibold text-primary" : "text-sm text-muted-foreground"}>
              {row.label}
            </dt>
            <dd className={row.emphasis ? "text-sm font-semibold text-primary" : "text-sm font-medium text-foreground"}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs text-muted-foreground">
        Hours are maintained by hospital administration and may change on public holidays.
      </p>
    </div>
  );
}

export function EmergencyPanel() {
  return (
    <div
      id="emergency"
      className="scroll-mt-32 overflow-hidden rounded-2xl bg-emergency p-7 text-emergency-foreground shadow-lift"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-emergency-foreground/15">
          <Siren className="size-5" aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl font-semibold">Emergency Care</h2>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-emergency-foreground/90">
        If you or someone else is experiencing a medical emergency, contact {hospital.name} or go to
        the emergency department immediately.
      </p>
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <PhoneCall className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <dt className="font-semibold">Emergency phone</dt>
            <dd className="text-emergency-foreground/90">
              {hospital.emergencyPhone ? (
                <a className="underline underline-offset-4" href={`tel:${hospital.emergencyPhone}`}>
                  {hospital.emergencyPhone}
                </a>
              ) : (
                CONTACT_PENDING
              )}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <dt className="font-semibold">Location</dt>
            <dd className="text-emergency-foreground/90">
              {hospital.addressLines?.join(", ") ??
                `${hospital.city}, ${hospital.region}, ${hospital.country}`}
            </dd>
          </div>
        </div>
      </dl>
      <Button asChild variant="hero" className="mt-6">
        <a href={mapDirectionsUrl} target="_blank" rel="noreferrer">
          <Navigation />
          Get Directions
        </a>
      </Button>
    </div>
  );
}

export function FaqSection({ heading = true }: { heading?: boolean }) {
  return (
    <section id="faq" className="scroll-mt-32">
      {heading ? (
        <SectionHeading
          eyebrow="Frequently asked questions"
          title="Answers for patients and visitors"
          description="Practical information about appointments, visits and hospital services."
          align="center"
          className="mb-10"
        />
      ) : null}
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-2 shadow-card sm:p-4">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.question} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function LocationSection() {
  return (
    <section id="location" className="scroll-mt-32 grid gap-8 lg:grid-cols-2 lg:items-center">
      <div>
        <SectionHeading
          eyebrow="Find us"
          title={`Visiting ${hospital.name}`}
          description={`We are located in ${hospital.city}, ${hospital.region}. The exact street address is published here once confirmed in hospital settings.`}
        />
        <ul className="mt-7 space-y-4 text-sm">
          <li className="flex gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-muted-foreground">
              {hospital.addressLines?.join(", ") ??
                `${hospital.city}, ${hospital.region}, ${hospital.country} — street address pending confirmation`}
            </span>
          </li>
          <li className="flex gap-3">
            <PhoneCall className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-muted-foreground">{hospital.phone ?? CONTACT_PENDING}</span>
          </li>
          <li className="flex gap-3">
            <Mail className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-muted-foreground">{hospital.email ?? CONTACT_PENDING}</span>
          </li>
        </ul>
        <Button asChild className="mt-7">
          <a href={mapDirectionsUrl} target="_blank" rel="noreferrer">
            <Navigation />
            Get Directions
          </a>
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <iframe
          title={`Map showing the location of ${hospital.name}`}
          src={mapEmbedUrl}
          loading="lazy"
          className="h-80 w-full border-0 lg:h-[26rem]"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}

export function AppointmentCta() {
  return (
    <section className="bg-primary-deep text-primary-foreground">
      <div className="container-page section-y text-center">
        <h2 className="text-balance font-display text-3xl font-semibold sm:text-4xl">
          Need to see a doctor?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-primary-foreground/80">
          Book your consultation with {hospital.name}.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="xl" variant="accent">
            <Link to="/appointments">Book Appointment</Link>
          </Button>
          <Button asChild size="xl" variant="hero">
            <Link to="/doctors">Find a Doctor</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function PrivacyNotice() {
  return (
    <p className="flex gap-2 rounded-lg bg-secondary p-4 text-xs leading-relaxed text-muted-foreground">
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <span>
        Please do not send medical records, test results or detailed health information through this
        form. Messages are handled by hospital administration and used only to respond to your
        enquiry. See our{" "}
        <Link to="/privacy" className="font-semibold text-primary underline underline-offset-2">
          privacy policy
        </Link>
        .
      </span>
    </p>
  );
}
