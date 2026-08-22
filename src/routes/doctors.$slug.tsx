import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { departmentName, getDoctor, hospital } from "@/content/hospital";

export const Route = createFileRoute("/doctors/$slug")({
  loader: ({ params }) => {
    const doctor = getDoctor(params.slug);
    if (!doctor) throw notFound();
    return { doctor };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Doctor profile unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const { doctor } = loaderData;
    const t = `${doctor.name} — ${doctor.specialty} | ${hospital.shortName}`;
    return {
      meta: [
        { title: t },
        { name: "description", content: doctor.intro },
        { property: "og:title", content: t },
        { property: "og:description", content: doctor.intro },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: `/doctors/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/doctors/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Physician",
            name: doctor.name,
            medicalSpecialty: doctor.specialty,
            worksFor: { "@type": "Hospital", name: hospital.name },
            knowsLanguage: doctor.languages,
          }),
        },
      ],
    };
  },
  component: DoctorPage,
  notFoundComponent: DoctorNotFound,
});

function DoctorPage() {
  const { doctor } = Route.useLoaderData();

  return (
    <>
      <PageHeader
        title={doctor.name}
        description={`${doctor.specialty} · ${departmentName(doctor.departmentSlug)}`}
        crumbs={[{ label: "Doctors", to: "/doctors" }, { label: doctor.name }]}
      />

      <section className="container-page section-y grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-border shadow-card">
            <img
              src={doctor.photo}
              alt={`Portrait of ${doctor.name}, ${doctor.specialty} at ${hospital.name}`}
              loading="lazy"
              width={800}
              height={1000}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-base font-semibold text-foreground">Clinic days</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {doctor.clinicDays.map((day) => (
                <li key={day} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-primary">
                  {day}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Availability is confirmed by hospital reception when your appointment is booked.
            </p>
            <Button asChild className="mt-5 w-full">
              <Link to="/appointments" search={{ doctor: doctor.slug }}>
                Book Appointment
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">Professional profile</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{doctor.intro}</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">Qualifications</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {doctor.qualifications.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">Clinical interests</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {doctor.interests.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">Languages</h3>
              <p className="mt-3 text-sm text-muted-foreground">{doctor.languages.join(", ")}</p>
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">Department</h3>
              <p className="mt-3 text-sm">
                <Link
                  to="/departments/$slug"
                  params={{ slug: doctor.departmentSlug }}
                  className="font-semibold text-primary underline underline-offset-4"
                >
                  {departmentName(doctor.departmentSlug)}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function DoctorNotFound() {
  return (
    <div className="container-page section-y text-center">
      <h1 className="font-display text-3xl font-semibold text-foreground">Doctor not found</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        This profile is not currently published at {hospital.name}.
      </p>
      <Button asChild className="mt-6">
        <Link to="/doctors">View all doctors</Link>
      </Button>
    </div>
  );
}
