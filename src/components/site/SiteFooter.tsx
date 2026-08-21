import { Link } from "@tanstack/react-router";
import { Mail, MapPin, PhoneCall, Siren } from "lucide-react";

import { Logo } from "@/components/site/Logo";
import { CONTACT_PENDING, hospital } from "@/content/hospital";

const quickLinks = [
  { to: "/about", label: "About" },
  { to: "/departments", label: "Departments" },
  { to: "/doctors", label: "Doctors" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
] as const;

const patientLinks = [
  { to: "/appointments", label: "Book Appointment" },
  { to: "/patients-visitors", label: "Visiting Information" },
  { to: "/patients-visitors", label: "Opening Hours", hash: "opening-hours" },
  { to: "/patients-visitors", label: "FAQs", hash: "faq" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-deep text-primary-foreground">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo tone="inverted" />
          <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/75">
            {hospital.name} ({hospital.shortName}) provides accessible, safe and professional
            healthcare to patients and families in {hospital.city} and the wider {hospital.region} region.
          </p>
        </div>

        <nav aria-labelledby="footer-quick" className="space-y-4">
          <h2 id="footer-quick" className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            Quick Links
          </h2>
          <ul className="space-y-2.5 text-sm">
            {quickLinks.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-patient" className="space-y-4">
          <h2 id="footer-patient" className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            Patient Information
          </h2>
          <ul className="space-y-2.5 text-sm">
            {patientLinks.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  hash={"hash" in l ? l.hash : undefined}
                  className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Contact</h2>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            <li className="flex gap-3">
              <PhoneCall className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{hospital.phone ?? CONTACT_PENDING}</span>
            </li>
            <li className="flex gap-3">
              <Siren className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>Emergency: {hospital.emergencyPhone ?? CONTACT_PENDING}</span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{hospital.email ?? CONTACT_PENDING}</span>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                {hospital.addressLines
                  ? hospital.addressLines.join(", ")
                  : `${hospital.city}, ${hospital.region}, ${hospital.country}`}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-primary-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {hospital.name}. All rights reserved.</p>
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
              <Link to="/patients-visitors" hash="accessibility" className="transition-colors hover:text-primary-foreground">
                Accessibility
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
