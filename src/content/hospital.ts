/**
 * Single source of truth for all public-facing Garowe General Hospital (GGH)
 * content.
 *
 * ARCHITECTURE NOTE
 * -----------------
 * Nothing in the public website hardcodes copy inside components. Every page
 * reads from the typed structures below. When the Hospital Management System
 * backend is enabled, replace the exported constants with loaders that read
 * `hospital_settings`, `departments`, `services`, `doctors`, `faqs` and
 * `testimonials` tables. The shapes below are the intended data model, so
 * component code will not need to change.
 *
 * DATA INTEGRITY RULE
 * -------------------
 * Unverified facts (phone numbers, exact address, statistics, testimonials)
 * are `null` or explicitly flagged as placeholders. UI components degrade
 * gracefully and show a "pending configuration" state instead of inventing
 * data.
 */

import doctor1 from "@/assets/doctor-1.jpg";
import doctor2 from "@/assets/doctor-2.jpg";
import doctor3 from "@/assets/doctor-3.jpg";
import doctor4 from "@/assets/doctor-4.jpg";

export type HospitalSettings = {
  name: string;
  shortName: string;
  tagline: string;
  /** null until verified by hospital administration */
  phone: string | null;
  emergencyPhone: string | null;
  email: string | null;
  addressLines: string[] | null;
  city: string;
  region: string;
  country: string;
  mapQuery: string;
  emergencyIs24_7: boolean;
};

export const hospital: HospitalSettings = {
  name: "Garowe General Hospital",
  shortName: "GGH",
  tagline: "Advanced healthcare. Compassionate care.",
  phone: null,
  emergencyPhone: null,
  email: null,
  addressLines: null,
  city: "Garowe",
  region: "Nugaal, Puntland",
  country: "Somalia",
  mapQuery: "Garowe General Hospital, Garowe, Somalia",
  emergencyIs24_7: true,
};

export const CONTACT_PENDING = "Pending hospital configuration";

export type OpeningHour = { label: string; value: string; emphasis?: boolean };

/** Administratively configurable. Only the emergency line is marked 24/7. */
export const openingHours: OpeningHour[] = [
  { label: "Monday – Thursday", value: "08:00 – 18:00" },
  { label: "Friday", value: "08:00 – 12:00" },
  { label: "Saturday", value: "08:00 – 16:00" },
  { label: "Sunday", value: "Outpatient clinics closed" },
  { label: "Emergency Department", value: "Open 24 hours, 7 days", emphasis: true },
];

export type Department = {
  slug: string;
  name: string;
  icon: string;
  summary: string;
  description: string;
  services: string[];
  active: boolean;
};

export const departments: Department[] = [
  {
    slug: "general-medicine",
    name: "General Medicine",
    icon: "Stethoscope",
    summary: "Diagnosis and treatment of common and chronic adult conditions.",
    description:
      "Our General Medicine department is the first point of care for most patients. The team assesses symptoms, manages chronic conditions such as hypertension and diabetes, and coordinates referrals to specialist departments when required.",
    services: ["General consultation", "Chronic disease follow-up", "Health screening", "Specialist referral"],
    active: true,
  },
  {
    slug: "emergency-medicine",
    name: "Emergency Medicine",
    icon: "Siren",
    summary: "Urgent assessment and stabilisation for acute illness and injury.",
    description:
      "The Emergency Department receives patients with acute illness and injury and provides immediate triage, resuscitation and stabilisation before admission or transfer to the appropriate clinical team.",
    services: ["Triage and resuscitation", "Trauma care", "Acute illness management", "Emergency observation"],
    active: true,
  },
  {
    slug: "pediatrics",
    name: "Pediatrics",
    icon: "Baby",
    summary: "Child-focused care from newborn through adolescence.",
    description:
      "Our pediatric team provides child-centred assessment and treatment in a calm environment designed for young patients and their families, including growth monitoring, immunisation support and management of childhood illness.",
    services: ["Child consultation", "Growth and nutrition review", "Immunisation guidance", "Newborn assessment"],
    active: true,
  },
  {
    slug: "obstetrics-gynecology",
    name: "Obstetrics & Gynecology",
    icon: "HeartPulse",
    summary: "Maternal, prenatal and women's health services.",
    description:
      "The Obstetrics & Gynecology department supports women through pregnancy, delivery and recovery, and provides gynecological assessment and treatment with attention to privacy and dignity.",
    services: ["Antenatal care", "Delivery services", "Postnatal review", "Gynecological consultation"],
    active: true,
  },
  {
    slug: "surgery",
    name: "Surgery",
    icon: "Scissors",
    summary: "Surgical assessment, operative care and recovery.",
    description:
      "Our surgical team provides pre-operative assessment, general surgical procedures and structured post-operative follow-up in coordination with anaesthesia and inpatient nursing teams.",
    services: ["Surgical consultation", "General surgery", "Minor procedures", "Post-operative follow-up"],
    active: true,
  },
  {
    slug: "laboratory",
    name: "Laboratory",
    icon: "FlaskConical",
    summary: "Clinical testing that supports accurate diagnosis.",
    description:
      "The hospital laboratory performs routine and requested clinical testing to support diagnosis and treatment monitoring, with results delivered to the requesting clinician.",
    services: ["Blood tests", "Microbiology", "Routine screening panels", "Result reporting"],
    active: true,
  },
  {
    slug: "pharmacy",
    name: "Pharmacy",
    icon: "Pill",
    summary: "Dispensing and medication guidance for patients.",
    description:
      "The hospital pharmacy dispenses prescribed medication and provides guidance on correct use, dosage and storage, working closely with the treating clinical team.",
    services: ["Prescription dispensing", "Medication counselling", "Inpatient medication supply"],
    active: true,
  },
  {
    slug: "radiology",
    name: "Radiology",
    icon: "ScanLine",
    summary: "Diagnostic imaging to support clinical decisions.",
    description:
      "Our Radiology department provides diagnostic imaging requested by hospital clinicians, with images and reports shared directly with the referring department.",
    services: ["X-ray imaging", "Ultrasound", "Imaging reports"],
    active: true,
  },
];

export type Service = {
  slug: string;
  name: string;
  icon: string;
  summary: string;
  description: string;
  departmentSlug: string;
  featured: boolean;
};

export const services: Service[] = [
  {
    slug: "general-consultation",
    name: "General Consultation",
    icon: "Stethoscope",
    summary: "Assessment and treatment planning with a hospital clinician.",
    description:
      "A structured consultation with a hospital clinician covering history, examination, diagnosis where possible, and a clear treatment or referral plan.",
    departmentSlug: "general-medicine",
    featured: true,
  },
  {
    slug: "emergency-care",
    name: "Emergency Care",
    icon: "Siren",
    summary: "Immediate care for urgent and life-threatening conditions.",
    description:
      "Emergency care is available for acute illness and injury. Patients are triaged on arrival so the most urgent needs are treated first.",
    departmentSlug: "emergency-medicine",
    featured: true,
  },
  {
    slug: "laboratory-testing",
    name: "Laboratory Testing",
    icon: "FlaskConical",
    summary: "Clinician-requested tests processed by our laboratory.",
    description:
      "Laboratory testing is carried out on request from a hospital clinician. Results are returned to the requesting department and explained during your follow-up.",
    departmentSlug: "laboratory",
    featured: true,
  },
  {
    slug: "pharmacy-services",
    name: "Pharmacy Services",
    icon: "Pill",
    summary: "Prescription dispensing and medication guidance.",
    description:
      "The hospital pharmacy dispenses medication prescribed by our clinicians and provides clear instructions for safe use.",
    departmentSlug: "pharmacy",
    featured: true,
  },
  {
    slug: "maternal-care",
    name: "Maternal Care",
    icon: "HeartPulse",
    summary: "Antenatal, delivery and postnatal support.",
    description:
      "Maternal care covers antenatal review, delivery support and postnatal follow-up for mother and newborn.",
    departmentSlug: "obstetrics-gynecology",
    featured: true,
  },
  {
    slug: "pediatric-care",
    name: "Pediatric Care",
    icon: "Baby",
    summary: "Care designed around infants, children and teenagers.",
    description:
      "Pediatric care provides age-appropriate assessment and treatment, with guidance for parents and guardians at every step.",
    departmentSlug: "pediatrics",
    featured: true,
  },
  {
    slug: "diagnostic-services",
    name: "Diagnostic Services",
    icon: "ScanLine",
    summary: "Imaging and diagnostics that guide treatment.",
    description:
      "Diagnostic imaging and testing services support accurate clinical decisions across all hospital departments.",
    departmentSlug: "radiology",
    featured: true,
  },
  {
    slug: "inpatient-care",
    name: "Inpatient Care",
    icon: "BedDouble",
    summary: "Ward-based care with continuous nursing support.",
    description:
      "Patients who require admission receive ward-based care with continuous nursing observation and daily clinical review.",
    departmentSlug: "general-medicine",
    featured: true,
  },
];

export type Doctor = {
  slug: string;
  name: string;
  specialty: string;
  departmentSlug: string;
  credentials: string;
  photo: string;
  intro: string;
  qualifications: string[];
  interests: string[];
  languages: string[];
  clinicDays: string[];
};

export const doctors: Doctor[] = [
  {
    slug: "dr-abdirahman-yusuf",
    name: "Dr. Abdirahman Yusuf",
    specialty: "Internal Medicine",
    departmentSlug: "general-medicine",
    credentials: "MBBS, Internal Medicine",
    photo: doctor1,
    intro:
      "Dr. Abdirahman Yusuf leads outpatient internal medicine clinics at Garowe General Hospital, with a focus on the long-term management of chronic conditions.",
    qualifications: ["MBBS", "Postgraduate training in Internal Medicine"],
    interests: ["Hypertension", "Diabetes care", "Preventive health"],
    languages: ["Somali", "Arabic", "English"],
    clinicDays: ["Monday", "Tuesday", "Thursday"],
  },
  {
    slug: "dr-hodan-abdi",
    name: "Dr. Hodan Abdi",
    specialty: "Pediatrics",
    departmentSlug: "pediatrics",
    credentials: "MBBS, Pediatrics",
    photo: doctor2,
    intro:
      "Dr. Hodan Abdi cares for infants, children and adolescents, working closely with families to explain diagnosis and treatment clearly.",
    qualifications: ["MBBS", "Postgraduate training in Pediatrics"],
    interests: ["Childhood infections", "Nutrition and growth", "Newborn care"],
    languages: ["Somali", "English"],
    clinicDays: ["Sunday", "Wednesday", "Saturday"],
  },
  {
    slug: "dr-fatima-warsame",
    name: "Dr. Fatima Warsame",
    specialty: "Obstetrics & Gynecology",
    departmentSlug: "obstetrics-gynecology",
    credentials: "MBBS, Obstetrics & Gynecology",
    photo: doctor3,
    intro:
      "Dr. Fatima Warsame supports women through pregnancy and delivery and provides gynecological care with a strong emphasis on privacy and dignity.",
    qualifications: ["MBBS", "Postgraduate training in Obstetrics & Gynecology"],
    interests: ["Antenatal care", "Safe delivery", "Women's health education"],
    languages: ["Somali", "Arabic", "English"],
    clinicDays: ["Monday", "Wednesday", "Thursday"],
  },
  {
    slug: "dr-mohamed-farah",
    name: "Dr. Mohamed Farah",
    specialty: "General Surgery",
    departmentSlug: "surgery",
    credentials: "MBBS, General Surgery",
    photo: doctor4,
    intro:
      "Dr. Mohamed Farah performs general surgical procedures and leads pre-operative assessment and post-operative follow-up clinics.",
    qualifications: ["MBBS", "Postgraduate training in General Surgery"],
    interests: ["General surgery", "Minor procedures", "Surgical safety"],
    languages: ["Somali", "English"],
    clinicDays: ["Tuesday", "Saturday"],
  },
];

/** Qualitative trust indicators only — no fabricated figures. */
export const trustIndicators = [
  { icon: "Siren", label: "24/7 Emergency Care", detail: "Emergency department open every day of the year." },
  { icon: "Users", label: "Experienced Medical Team", detail: "Qualified clinicians across core specialties." },
  { icon: "Building2", label: "Multiple Clinical Departments", detail: "Coordinated care under one hospital." },
  { icon: "ScanLine", label: "Modern Diagnostic Services", detail: "Laboratory and imaging support on site." },
];

export const whyChooseUs = [
  {
    icon: "HandHeart",
    title: "Patient-Centered Care",
    body: "Care focused on patient needs, dignity and clear communication at every stage of treatment.",
  },
  {
    icon: "Users",
    title: "Professional Medical Team",
    body: "Healthcare delivered by trained clinicians, nurses and support staff working as one team.",
  },
  {
    icon: "Activity",
    title: "Modern Clinical Services",
    body: "Access to essential diagnostic, treatment and inpatient services within the hospital.",
  },
  {
    icon: "CalendarCheck",
    title: "Accessible Healthcare",
    body: "Simplified appointment booking and clear guidance on hospital services for every patient.",
  },
];

export const patientJourney = [
  { step: "01", title: "Book", body: "Choose a department or doctor and request a suitable time." },
  { step: "02", title: "Visit", body: "Arrive at Garowe General Hospital and check in at reception." },
  { step: "03", title: "Consult", body: "Receive assessment from the medical team caring for you." },
  { step: "04", title: "Care", body: "Receive treatment, prescriptions, tests or a follow-up plan." },
];

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "How do I book an appointment?",
    answer:
      "You can request an appointment online through the booking page by choosing a department, a doctor and a preferred date and time. Reception confirms your appointment before your visit.",
  },
  {
    question: "Can I visit without an appointment?",
    answer:
      "Emergency care is always available without an appointment. For outpatient clinics we recommend booking in advance so a clinician and time slot can be reserved for you.",
  },
  {
    question: "What should I bring to my appointment?",
    answer:
      "Please bring identification, any previous hospital documents or test results you have, and a list of medication you are currently taking.",
  },
  {
    question: "How can I access laboratory results?",
    answer:
      "Laboratory results are returned to the clinician who requested them and are explained during your follow-up visit. A patient portal for online access is planned.",
  },
  {
    question: "Where is the hospital located?",
    answer:
      "Garowe General Hospital is located in Garowe, Nugaal, Puntland. The exact street address and directions are published on the contact page once confirmed by hospital administration.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Accepted payment methods are confirmed by hospital administration and published here once finalised. Please contact reception before your visit for current information.",
  },
  {
    question: "How can I contact the emergency department?",
    answer:
      "The emergency contact number is published in the emergency section of this website as soon as it is confirmed in hospital settings. In an emergency you can also go directly to the emergency department.",
  },
];

export type Testimonial = { quote: string; name: string; context: string };

/** DEMO CONTENT — not real patient testimonials. Replace with approved, consented quotes. */
export const testimonials: Testimonial[] = [
  {
    quote:
      "The staff explained every step clearly and treated my family with respect throughout our visit.",
    name: "Demo placeholder",
    context: "Outpatient visit",
  },
  {
    quote: "Booking was simple and we were seen at the time we were given.",
    name: "Demo placeholder",
    context: "Appointment booking",
  },
  {
    quote: "The emergency team responded quickly and kept us informed while we waited.",
    name: "Demo placeholder",
    context: "Emergency department",
  },
];

export const testimonialsAreDemo = true;

export const getDepartment = (slug: string) => departments.find((d) => d.slug === slug);
export const getService = (slug: string) => services.find((s) => s.slug === slug);
export const getDoctor = (slug: string) => doctors.find((d) => d.slug === slug);
export const departmentName = (slug: string) => getDepartment(slug)?.name ?? slug;
export const doctorsByDepartment = (slug: string) => doctors.filter((d) => d.departmentSlug === slug);
export const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(hospital.mapQuery)}&output=embed`;
export const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital.mapQuery)}`;
