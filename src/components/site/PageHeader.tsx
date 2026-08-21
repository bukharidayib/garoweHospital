import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; to?: string };

export function PageHeader({
  title,
  description,
  crumbs = [],
}: {
  title: string;
  description?: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="border-b border-border bg-primary-deep text-primary-foreground">
      <div className="container-page py-14 lg:py-20">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-primary-foreground/70">
            <li>
              <Link to="/" className="transition-colors hover:text-primary-foreground">
                Home
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-1">
                <ChevronRight className="size-3.5" aria-hidden="true" />
                {c.to ? (
                  <Link to={c.to} className="transition-colors hover:text-primary-foreground">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-primary-foreground" aria-current="page">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="max-w-3xl text-balance text-3xl font-semibold sm:text-4xl lg:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-primary-foreground/80">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
