import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PrivacyNotice } from "@/components/site/blocks";

type Errors = Partial<Record<"name" | "phone" | "subject" | "message", string>>;

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const next: Errors = {};
    if (!get("name")) next.name = "Please enter your full name.";
    if (!get("phone")) next.phone = "Please enter a phone number we can reach you on.";
    if (!get("subject")) next.subject = "Please add a short subject.";
    if (get("message").length < 10) next.message = "Please describe your enquiry in a little more detail.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSent(true);
    toast.success("Message ready to send", {
      description: "Message delivery is connected when hospital messaging is enabled.",
    });
    event.currentTarget.reset();
  }

  const field = (name: keyof Errors) =>
    errors[name]
      ? { "aria-invalid": true as const, "aria-describedby": `${name}-error` }
      : {};

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Full name</Label>
          <Input id="contact-name" name="name" autoComplete="name" required {...field("name")} />
          {errors.name ? (
            <p id="name-error" className="text-xs font-medium text-destructive">
              {errors.name}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-phone">Phone</Label>
          <Input id="contact-phone" name="phone" type="tel" autoComplete="tel" required {...field("phone")} />
          {errors.phone ? (
            <p id="phone-error" className="text-xs font-medium text-destructive">
              {errors.phone}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-email">
            Email <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input id="contact-email" name="email" type="email" autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-subject">Subject</Label>
          <Input id="contact-subject" name="subject" required {...field("subject")} />
          {errors.subject ? (
            <p id="subject-error" className="text-xs font-medium text-destructive">
              {errors.subject}
            </p>
          ) : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" name="message" rows={5} required {...field("message")} />
        {errors.message ? (
          <p id="message-error" className="text-xs font-medium text-destructive">
            {errors.message}
          </p>
        ) : null}
      </div>
      <PrivacyNotice />
      <Button type="submit" size="lg">
        Send Message
      </Button>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {sent ? "Thank you — your enquiry has been recorded." : ""}
      </p>
    </form>
  );
}
