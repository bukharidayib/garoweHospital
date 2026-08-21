import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, PhoneCall, Siren, X } from "lucide-react";

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
      {/* Announcement / emergency bar */}
      <div className="bg-primary-deep text-primary-foreground">
        <div className="container-page flex min-h-10 flex-wrap items-center justify-between gap-x-6 gap-y-1 py-1.5 text-xs sm:text-[13px]">
          <p className="flex items-center gap-2">
            <Siren className="size-4 shrink-0 text-accent" aria-hidden="true" />
            <span>Emergency department open 24 hours, every day</span>
          </p>
          <p className="flex items-center gap-2 text-primary-foreground/80">
            <PhoneCall className="size-4 shrink-0" aria-hidden="true" />
            <span>
              Emergency line:{" "}
              {hospital.emergencyPhone ? (
                <a className="font-semibold underline underline-offset-4" href={`tel:${hospital.emergencyPhone}`}>
                  {hospital.emergencyPhone}
                </a>
              ) : (
                <span className="font-medium">{CONTACT_PENDING}</span>
              )}
            </span>
          </p>
        </div>
      </div>

      <div className="border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="container-page flex h-18 items-center justify-between gap-4 py-3">
          <Logo />

          <nav aria-label="Main navigation" className="hidden items-center gap-1 xl:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-primary" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="emergency" size="sm" className="hidden sm:inline-flex">
              <Link to="/contact" hash="emergency">
                <Siren />
                Emergency
              </Link>
            </Button>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/appointments">Book Appointment</Link>
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="min-h-11 min-w-11 xl:hidden" aria-label="Open menu">
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
