import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { hospital } from "@/content/hospital";

const title = "Terms of Use";
const description =
  "Terms of use for the Garowe General Hospital (GGH) website, including appointment requests and the limits of online health information.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `${title} | ${hospital.name}` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | ${hospital.shortName}` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/terms" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <PageHeader
        title="Terms of Use"
        description={`Conditions for using the ${hospital.shortName} website and online appointment requests.`}
        crumbs={[{ label: "Terms" }]}
      />
      <article className="container-page section-y max-w-3xl space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-xl font-semibold text-foreground">Not medical advice</h2>
          <p className="mt-3">
            Information on this website is general and does not replace assessment by a qualified
            clinician. In an emergency, contact the hospital or attend the emergency department
            immediately.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-foreground">Appointment requests</h2>
          <p className="mt-3">
            An online request is a request, not a confirmed booking. Hospital reception confirms the
            department, clinician, date and time before your visit.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-foreground">Accurate information</h2>
          <p className="mt-3">
            Please provide accurate personal and contact details so we can reach you and match your
            request to the correct hospital record.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-foreground">Website content</h2>
          <p className="mt-3">
            Content, branding and images on this website belong to {hospital.name} unless stated
            otherwise, and may not be reproduced without permission.
          </p>
        </section>
        <p className="text-xs">
          These terms are a working document and will be finalised with hospital administration before
          publication.
        </p>
      </article>
    </>
  );
}
