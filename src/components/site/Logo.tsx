import { Link } from "@tanstack/react-router";
import { hospital } from "@/content/hospital";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "inverted";
}) {
  return (
    <Link
      to="/"
      className={cn("group flex items-center gap-3", className)}
      aria-label={`${hospital.name} — home`}
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-xl font-display text-sm font-bold tracking-tight transition-transform group-hover:-translate-y-0.5",
          tone === "inverted"
            ? "bg-primary-foreground/10 text-primary-foreground ring-1 ring-primary-foreground/25"
            : "bg-primary text-primary-foreground",
        )}
      >
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z" fill="currentColor" />
        </svg>
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={cn(
            "font-display text-base font-semibold sm:text-lg",
            tone === "inverted" ? "text-primary-foreground" : "text-foreground",
          )}
        >
          {hospital.name}
        </span>
        <span
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.18em]",
            tone === "inverted" ? "text-primary-foreground/70" : "text-accent",
          )}
        >
          {hospital.shortName} · {hospital.city}
        </span>
      </span>
    </Link>
  );
}
