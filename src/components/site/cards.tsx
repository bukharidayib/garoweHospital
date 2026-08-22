import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/site/Icon";
import { departmentName, type Department, type Doctor, type Service } from "@/content/hospital";

export function DepartmentCard({ department }: { department: Department }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift">
      <span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon name={department.icon} className="size-6" />
      </span>
      <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{department.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{department.summary}</p>
      <Link
        to="/departments/$slug"
        params={{ slug: department.slug }}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-deep"
      >
        View Department
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </article>
  );
}

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group flex h-full gap-4 rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
        <Icon name={service.icon} className="size-5" />
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-base font-semibold text-foreground">{service.name}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{service.summary}</p>
        <Link
          to="/services/$slug"
          params={{ slug: service.slug }}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-deep"
        >
          Learn more
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="aspect-[4/5] overflow-hidden bg-secondary">
        <img
          src={doctor.photo}
          alt={`Portrait of ${doctor.name}, ${doctor.specialty} at Garowe General Hospital`}
          loading="lazy"
          width={800}
          height={1000}
          className="size-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-foreground">{doctor.name}</h3>
        <p className="mt-1 text-sm font-semibold text-accent">{doctor.specialty}</p>
        <p className="mt-1 text-sm text-muted-foreground">{departmentName(doctor.departmentSlug)}</p>
        <p className="mt-3 flex-1 text-xs uppercase tracking-wide text-muted-foreground">{doctor.credentials}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/doctors/$slug" params={{ slug: doctor.slug }}>
              View Profile
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/appointments" search={{ doctor: doctor.slug }}>
              Book Appointment
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
