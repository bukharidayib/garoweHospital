import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { hospital } from "@/content/hospital";

const title = "Privacy Policy";
const description =
  "How Garowe General Hospital (GGH) handles information submitted through this website, including appointment requests and contact enquiries.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `${title} | ${hospital.name}` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | ${hospital.shortName}` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/privacy" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <PageHeader
        title="Privacy Policy"
        description={`How ${hospital.name} handles information you submit through this website.`}
        crumbs={[{ label: "Privacy Policy" }]}
      />
      <article className="container-page section-y max-w-3xl space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-xl font-semibold text-foreground">Information we collect</h2>
          <p className="mt-3">
            When you request an appointment or send an enquiry we collect the details you provide, such
            as your name, phone number, optional email address and the reason for your visit. We do not
            ask for detailed medical records through this website.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-foreground">How information is used</h2>
          <p className="mt-3">
            Information is used only to arrange and confirm your care, respond to your enquiry, and
            maintain hospital records as required by clinical and administrative practice.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-foreground">Confidentiality</h2>
          <p className="mt-3">
            Patient information is treated as confidential and shared only with the clinical and
            administrative staff involved in your care, or where required by law.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-foreground">Your choices</h2>
          <p className="mt-3">
            You may ask hospital administration what information is held about you, request a
            correction, or withdraw a pending appointment request at any time.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-foreground">Contact</h2>
          <p className="mt-3">
            Privacy questions can be directed to hospital administration using the contact details
            published on our contact page.
          </p>
        </section>
        <p className="text-xs">
          This policy is a working document and will be finalised with hospital administration before
          publication.
        </p>
      </article>
    </>
  );
}
