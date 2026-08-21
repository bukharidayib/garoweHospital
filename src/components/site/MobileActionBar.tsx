import { Link } from "@tanstack/react-router";
import { CalendarPlus, MapPin, PhoneCall } from "lucide-react";

import { hospital, mapDirectionsUrl } from "@/content/hospital";

/** Sticky mobile quick actions: call, directions, book. */
export function MobileActionBar() {
  return (
    <div className="sticky bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <nav aria-label="Quick actions" className="container-page grid grid-cols-3 gap-2 py-2">
        <a
          href={hospital.phone ? `tel:${hospital.phone}` : "/contact"}
          className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <PhoneCall className="size-5 text-primary" aria-hidden="true" />
          Call
        </a>
        <a
          href={mapDirectionsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <MapPin className="size-5 text-primary" aria-hidden="true" />
          Directions
        </a>
        <Link
          to="/appointments"
          className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg bg-primary py-1.5 text-[11px] font-semibold text-primary-foreground"
        >
          <CalendarPlus className="size-5" aria-hidden="true" />
          Book
        </Link>
      </nav>
    </div>
  );
}
