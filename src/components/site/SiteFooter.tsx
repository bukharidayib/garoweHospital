import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Mail, MapPin, Navigation, PhoneCall, Siren } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { CONTACT_PENDING, hospital } from "@/content/hospital";

const quickLinks = [
  { to: "/about", label: "About GGH" },
  { to: "/departments", label: "Departments" },
  { to: "/doctors", label: "Our doctors" },
  { to: "/services", label: "Medical services" },
  { to: "/contact", label: "Contact" },
] as const;

const patientLinks = [
  { to: "/appointments", label: "Book appointment" },
  { to: "/patients-visitors", label: "Visiting information" },
  { to: "/patients-visitors", label: "Opening hours", hash: "opening-hours" },
  { to: "/patients-visitors", label: "Frequently asked questions", hash: "faq" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-deep text-primary-foreground">
      <div className="container-page py-10">
        <div className="grid gap-6 rounded-3xl bg-primary-foreground/[0.07] p-6 ring-1 ring-primary-foreground/10 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Your care starts here
            </p>
            <h2 className="mt-2 max-w-2xl font-display text-2xl font-semibold sm:text-3xl">
              Trusted care for you and your family.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-primary-foreground/70">
              Find a department, meet our doctors, or request a consultation with Garowe General
              Hospital.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="accent" size="lg">
              <Link to="/appointments">
                Book an Appointment <ArrowUpRight />
              </Link>
            </Button>
            <Button asChild variant="hero" size="lg">
              <Link to="/contact" hash="emergency">
                <Siren /> Emergency Care
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container-page grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_0.75fr_0.9fr_1.2fr]">
          <div className="space-y-5">
            <Logo tone="inverted" />
            <p className="max-w-sm text-sm leading-relaxed text-primary-foreground/70">
              {hospital.name} ({hospital.shortName}) provides accessible, safe and professional
              healthcare to patients and families in {hospital.city} and the wider {hospital.region}{" "}
              region.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-primary-foreground"
            >
              Learn more about GGH <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <FooterNav title="Explore" links={quickLinks} />
          <FooterNav title="Patient information" links={patientLinks} />

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              Contact us
            </h2>
            <ul className="space-y-4 text-sm text-primary-foreground/75">
              <ContactItem icon={PhoneCall}>{hospital.phone ?? CONTACT_PENDING}</ContactItem>
              <ContactItem icon={Siren}>
                Emergency: {hospital.emergencyPhone ?? CONTACT_PENDING}
              </ContactItem>
              <ContactItem icon={Mail}>{hospital.email ?? CONTACT_PENDING}</ContactItem>
              <ContactItem icon={MapPin}>
                {hospital.addressLines
                  ? hospital.addressLines.join(", ")
                  : `${hospital.city}, ${hospital.region}, ${hospital.country}`}
              </ContactItem>
            </ul>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground transition-colors hover:text-accent"
            >
              <Navigation className="size-4" /> Get directions
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {hospital.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link to="/privacy" className="transition-colors hover:text-primary-foreground">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="transition-colors hover:text-primary-foreground">
                Terms
              </Link>
            </li>
            <li>
              <Link
                to="/patients-visitors"
                hash="accessibility"
                className="transition-colors hover:text-primary-foreground"
              >
                Accessibility
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterNav({
  title,
  links,
}: {
  title: string;
  links: readonly { to: string; label: string; hash?: string }[];
}) {
  return (
    <nav aria-label={title} className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{title}</h2>
      <ul className="space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              hash={link.hash}
              className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ContactItem({
  icon: Icon,
  children,
}: {
  icon: typeof PhoneCall;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}
