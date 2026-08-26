import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, PhoneCall, Siren, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/site/Logo";
import { CONTACT_PENDING, hospital } from "@/content/hospital";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/departments", label: "Departments" },
  { to: "/services", label: "Services" },
  { to: "/doctors", label: "Doctors" },
  { to: "/patients-visitors", label: "Patients & Visitors" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-primary-deep text-primary-foreground">
        <div className="container-page flex min-h-9 items-center justify-between gap-4 py-1.5 text-[11px] sm:text-xs">
          <Link
            to="/contact"
            hash="emergency"
            className="flex items-center gap-2 font-medium transition-colors hover:text-accent"
          >
            <span className="relative flex size-5 items-center justify-center">
              <span className="absolute size-2 animate-ping rounded-full bg-accent/70" />
              <Siren className="relative size-3.5 text-accent" aria-hidden="true" />
            </span>
            Emergency department open 24 hours
            <ArrowUpRight className="hidden size-3.5 sm:block" aria-hidden="true" />
          </Link>
          <p className="hidden items-center gap-2 text-primary-foreground/75 sm:flex">
            <PhoneCall className="size-3.5" aria-hidden="true" />
            <span>Emergency line:</span>
            {hospital.emergencyPhone ? (
              <a
                className="font-semibold text-primary-foreground underline underline-offset-4"
                href={`tel:${hospital.emergencyPhone}`}
              >
                {hospital.emergencyPhone}
              </a>
            ) : (
              <span className="font-medium">{CONTACT_PENDING}</span>
            )}
          </p>
        </div>
      </div>

      <div className="border-b border-border/80 bg-background/95 shadow-[0_4px_20px_-18px_var(--color-primary-deep)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container-page flex min-h-[4.75rem] items-center justify-between gap-4 py-3">
          <Logo />

          <nav aria-label="Main navigation" className="hidden items-center gap-0.5 xl:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-lg px-3 py-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{
                  className:
                    "rounded-lg bg-primary-soft px-3 py-2 text-[13px] font-semibold text-primary",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="emergency" size="sm" className="hidden sm:inline-flex">
              <Link to="/contact" hash="emergency">
                <Siren />
                <span className="hidden 2xl:inline">Emergency</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link to="/appointments">
                Book Appointment <ArrowUpRight />
              </Link>
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="min-h-11 min-w-11 xl:hidden"
                  aria-label="Open menu"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(22rem,90vw)] p-0">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <div className="flex items-center justify-between border-b border-border p-4">
                  <Logo />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-h-11 min-w-11"
                    aria-label="Close menu"
                    onClick={() => setOpen(false)}
                  >
                    <X />
                  </Button>
                </div>
                <nav aria-label="Mobile navigation" className="flex flex-col p-3">
                  {nav.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      activeOptions={{ exact: item.to === "/" }}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                      activeProps={{ className: "bg-secondary text-primary" }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="flex flex-col gap-2 border-t border-border p-4">
                  <Button asChild onClick={() => setOpen(false)}>
                    <Link to="/appointments">Book Appointment</Link>
                  </Button>
                  <Button asChild variant="emergency" onClick={() => setOpen(false)}>
                    <Link to="/contact" hash="emergency">
                      <Siren />
                      Emergency Care
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
