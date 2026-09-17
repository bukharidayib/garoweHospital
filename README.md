# GGH Patient Connect

Garowe General Hospital (GGH) — Premium Public Landing Page

Update the Hospital Management System project so the hospital brand is:

Garowe General Hospital

Short name:

GGH

Use Garowe General Hospital (GGH) consistently throughout the public-facing hospital website and hospital portal.

The project must include a completely professional, modern, responsive and visually premium public hospital website / landing page.

The landing page should NOT look like a SaaS dashboard.

It should look like a high-quality modern private/general hospital website that communicates:

Trust

Medical professionalism

Safety

Care

Accessibility

Modern healthcare

Reliability

1. WEBSITE OBJECTIVE

The Garowe General Hospital website should help patients and visitors quickly:

Understand who GGH is

Find medical services

Find doctors

Book appointments

Get emergency information

Find contact information

Find hospital location

View opening hours

Learn about departments

Learn about hospital facilities

Access patient-related services

The website should also strengthen the hospital's credibility and public image.

2. VISUAL DIRECTION

Create a clean, premium healthcare design.

Design characteristics:

Modern

Spacious

Minimal

Professional

Calm

High trust

Mobile responsive

Accessible

Fast loading

Avoid:

Old-fashioned hospital ERP styling

Excessive gradients

Too many colors

Cheap-looking stock-layout patterns

Crowded sections

Excessive animations

Cartoonish healthcare graphics

Use subtle animations only where they improve the experience.

3. BRAND SYSTEM

Create a professional brand direction for GGH.

Suggested visual direction:

Primary colors:

Deep medical blue

Clean white

Secondary/accent:

Healthcare teal or green

Soft neutral backgrounds

Use accessible contrast ratios.

The visual system should support:

Website

Hospital dashboard

Patient documents

Receipts

Appointment confirmations

Future mobile application

Create reusable design tokens instead of scattering colors throughout components.

4. HEADER / NAVIGATION

Create a premium sticky navigation bar.

Left side:

GGH logo

Garowe General Hospital

Navigation:

Home

About

Departments

Services

Doctors

Patients & Visitors

Contact

Right side actions:

Emergency

Book Appointment

Desktop navigation should be elegant and spacious.

Mobile should use a professional responsive menu.

5. HERO SECTION

The hero section is extremely important.

Create a premium healthcare hero.

Example content direction:

Headline

Advanced Healthcare. Compassionate Care.

Alternative:

Quality Healthcare You Can Trust

Supporting text should introduce Garowe General Hospital as a modern healthcare institution focused on providing accessible and professional medical care.

Example:

Garowe General Hospital provides professional, patient-centered healthcare through experienced medical teams, modern clinical services, and a commitment to safe and compassionate treatment.

Primary CTA:

Book an Appointment

Secondary CTA:

Explore Our Services

Add another visible emergency action:

Emergency Care

The hero should contain a strong hospital/doctor/patient visual composition.

Do not overwhelm the hero with text.

6. QUICK ACCESS PANEL

Immediately below or overlapping the hero, create a premium quick-access section.

Cards:

Book Appointment

Find an available doctor and schedule a consultation.

Find a Doctor

Search healthcare professionals by department or specialty.

Emergency Care

Display emergency contact information prominently.

Opening Hours

Show hospital operating hours.

Each card should use:

Icon

Short heading

Short supporting text

Action

7. TRUST / HOSPITAL STATISTICS

Create a visually clean statistics section.

Example placeholders:

24/7 Emergency Care

Experienced Medical Team

Multiple Clinical Departments

Modern Diagnostic Services

If actual numbers are unavailable, do NOT fabricate patient numbers, years of operation, doctor counts, or success rates.

Use editable placeholders until the hospital provides verified data.

8. ABOUT GGH

Create a section introducing:

Garowe General Hospital

Example direction:

Garowe General Hospital is committed to providing accessible, safe, and high-quality healthcare to patients and families through professional medical services, modern facilities, and compassionate care.

Include:

Short description

Hospital image

Learn More button

Optional highlights:

Patient-first approach

Qualified professionals

Modern facilities

Comprehensive care

9. DEPARTMENTS SECTION

Create an elegant department grid.

Example departments:

General Medicine

Emergency Medicine

Pediatrics

Obstetrics & Gynecology

Surgery

Laboratory

Pharmacy

Radiology

However:

Do not permanently hardcode departments.

The website should eventually load active departments from the Hospital Management System.

Each department card should support:

Icon/image

Department name

Short description

View Department

10. MEDICAL SERVICES

Create a separate Featured Services section.

Examples:

General Consultation

Emergency Care

Laboratory Testing

Pharmacy Services

Maternal Care

Pediatric Care

Diagnostic Services

Inpatient Care

Services must be manageable from the hospital administration system later.

11. DOCTORS SECTION

Create a professional:

Meet Our Doctors

section.

Doctor cards:

Professional photo

Full name

Specialty

Department

Short credential information

View Profile

Book Appointment

Do not expose private staff information.

Create a:

View All Doctors

CTA.

12. DOCTOR PROFILE PAGE

Public route example:

/doctors/[slug]

Doctor public profile:

Photo

Name

Specialty

Department

Professional introduction

Qualifications

Clinical interests

Languages

Available appointment schedule where appropriate

Book Appointment button

Do not expose:

Private phone numbers

Personal email

Internal staff IDs

Private HR information

13. WHY CHOOSE GGH

Create a highly polished section.

Possible reasons:

Patient-Centered Care

Care focused on patient needs, dignity, and communication.

Professional Medical Team

Healthcare services delivered by trained professionals.

Modern Clinical Services

Access to essential diagnostic and treatment services.

Accessible Healthcare

Simplified appointment and hospital service access.

Use icons and concise text.

14. PATIENT JOURNEY SECTION

Create a simple visual workflow:

Book

Choose a department or doctor.

→

Visit

Arrive at Garowe General Hospital.

→

Consult

Receive assessment from the medical team.

→

Care

Receive treatment, prescription, tests, or follow-up.

This can use a modern numbered step design.

15. APPOINTMENT CTA

Create a strong full-width CTA.

Headline:

Need to See a Doctor?

Supporting text:

Book your consultation with Garowe General Hospital.

Buttons:

Book Appointment

Find a Doctor

16. EMERGENCY SECTION

Emergency information must be very visible.

Example:

Emergency Care

If you or someone else is experiencing a medical emergency, contact Garowe General Hospital or visit the emergency department immediately.

Display:

Emergency phone

Hospital location

Directions button

The phone number should come from hospital settings.

Do not invent a phone number.

17. OPENING HOURS

Create an operating-hours card.

Example:

Monday – Friday

Saturday

Sunday

Emergency Department — 24/7 if confirmed by hospital settings.

Operating hours must be administratively configurable.

Do NOT assume 24/7 availability for every hospital service.

18. TESTIMONIAL SECTION

Create optional patient testimonials.

Do NOT fabricate real patient testimonials.

Use development placeholders clearly marked as demo content.

The admin should eventually be able to publish approved testimonials.

Do not expose medical information in testimonials without proper consent.

19. FAQ SECTION

Create frequently asked questions.

Examples:

How do I book an appointment?

Can I visit without an appointment?

What should I bring to my appointment?

How can I access laboratory results?

Where is the hospital located?

What payment methods do you accept?

How can I contact the emergency department?

Use an accessible accordion interface.

20. CONTACT SECTION

Create:

Hospital phone

Email

Address

Opening hours

Emergency contact

Contact form

Map/location

Fields:

Name

Phone

Email — optional

Subject

Message

Never collect detailed medical records through the general contact form.

Add privacy notice.

21. LOCATION / MAP

Create a professional location section.

Show:

Garowe General Hospital

Hospital address

Directions CTA

Map integration

Do not hardcode an inaccurate address.

Store location information inside hospital settings.

22. FOOTER

Create a comprehensive modern footer.

Column 1:

Garowe General Hospital logo

Short description

Column 2:

Quick Links

About

Departments

Doctors

Services

Contact

Column 3:

Patient Information

Book Appointment

Visiting Information

Opening Hours

FAQs

Column 4:

Contact

Phone

Email

Address

Emergency contact

Bottom:

Copyright

Privacy Policy

Terms

Accessibility

Example:

© Garowe General Hospital. All rights reserved.

Year should be generated dynamically.

23. PUBLIC ROUTES

Create architecture for:

/

/about

/departments

/departments/[slug]

/services

/services/[slug]

/doctors

/doctors/[slug]

/appointments

/patients-visitors

/contact

/privacy

/terms

Do not mix these public routes with authenticated hospital admin routes.

24. APPOINTMENT BOOKING PAGE

Create a clean public appointment flow.

Step 1:

Choose department

Step 2:

Choose doctor

Step 3:

Choose available date/time

Step 4:

Patient details

Step 5:

Review

Step 6:

Confirmation

Patient fields:

First name

Last name

Phone

Email — optional

Date of birth

Gender

Reason for visit

Do not ask users for unnecessary medical information during basic appointment booking.

25. APPOINTMENT CONFIRMATION

After booking:

Display:

Appointment reference

Patient name

Doctor

Department

Date

Time

Hospital location

Instructions

Future support:

SMS confirmation

WhatsApp confirmation

Email confirmation

26. PATIENT PORTAL FUTURE-READY

Do NOT build a large patient portal in the MVP unless explicitly requested.

However, make the architecture ready for a future:

/patient

portal where patients could eventually access:

Appointments

Prescriptions

Lab results

Bills

Medical documents

Profile

This should remain separate from staff hospital administration.

27. CONTENT MANAGEMENT

Important landing page content should NOT permanently live inside React components.

Prepare architecture so administrators can eventually manage:

Hero content

Hospital introduction

Departments

Services

Doctors

FAQs

Contact details

Opening hours

Emergency numbers

For MVP, configuration can be database-backed or implemented using structured hospital settings.

Avoid introducing a complex CMS unless necessary.

28. SEO

Implement strong SEO.

Each public page should have:

Unique title

Meta description

Open Graph metadata

Canonical URL

Structured headings

Semantic HTML

Prepare structured data where appropriate for:

Hospital

Medical organization

Physicians

Breadcrumbs

FAQs

Do not create false structured-data claims.

29. PERFORMANCE

The landing page should have excellent performance.

Implement:

Optimized images

Responsive images

Lazy loading

Font optimization

Minimal client JavaScript

Server rendering where beneficial

Modern image formats

Efficient components

Target strong Core Web Vitals.

30. ACCESSIBILITY

Follow WCAG-oriented design principles.

Include:

Keyboard navigation

Visible focus states

Semantic HTML

ARIA only when necessary

Sufficient contrast

Descriptive image alt text

Accessible forms

Accessible error states

Healthcare websites must work well for a broad user population.

31. RESPONSIVE EXPERIENCE

Design deliberately for:

Desktop

Tablet

Mobile

Do not simply shrink desktop layouts.

The mobile version should have:

Easy booking

Easy calling

Easy directions

Easy emergency access

Consider a mobile sticky quick-action bar for:

Call

Directions

Book

32. IMAGE DIRECTION

Use healthcare photography showing:

Professional doctors

Nurses

Modern clinical environments

Caring patient interactions

Clean hospital facilities

Photography should feel authentic, respectful, and premium.

Avoid graphic or distressing medical imagery.

33. LANDING PAGE ORDER

Recommended homepage order:

Announcement / Emergency Bar

Navigation

Hero

Quick Access

Trust Indicators

About GGH

Departments

Featured Services

Doctors

Why Choose GGH

Patient Journey

Appointment CTA

Testimonials

FAQ

Emergency + Opening Hours

Contact / Location

Footer

Optimize the final ordering based on UX rather than blindly following this sequence.

34. IMPORTANT BRANDING RULES

Throughout the system use:

Full name:

Garowe General Hospital

Short name:

GGH

Examples:

Welcome to Garowe General Hospital

GGH Hospital Portal

GGH Administration

GGH Patient Management

Do not use generic names like:

"XYZ Hospital"

"My Hospital"

"Demo Hospital"

except inside isolated development test fixtures.

35. LANDING PAGE DEVELOPMENT TASK

Before coding the complete Hospital Management System, create the landing page design specification.

Produce:

Homepage information architecture

Wireframe description

Design system

Typography hierarchy

Color system

Component inventory

Header design

Hero design

Section-by-section layout

Mobile layout

Public route structure

Appointment booking flow

Doctor directory design

Department pages

Contact page

Footer

SEO strategy

Accessibility strategy

Performance strategy

Content/data model needed to make landing content manageable

Then implement the public landing website using reusable components.

The result should look like a premium modern hospital website suitable for Garowe General Hospital, not a generic template.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
