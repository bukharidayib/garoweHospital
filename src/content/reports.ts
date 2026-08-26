export type ReportCategory =
  | "patients"
  | "appointments"
  | "clinical"
  | "laboratory"
  | "pharmacy"
  | "billing"
  | "admissions"
  | "operations"
  | "staff";
export type ReportFilters = {
  range: string;
  department: string;
  doctor: string;
  visitType: string;
  comparison: string;
};

export const reportCategories: {
  key: ReportCategory;
  title: string;
  description: string;
  metrics: string;
  icon: string;
}[] = [
  {
    key: "patients",
    title: "Patient reports",
    description: "Registrations, visits, demographics, and growth.",
    metrics: "2,480 patients · 18% growth",
    icon: "users",
  },
  {
    key: "appointments",
    title: "Appointment reports",
    description: "Completion, no-shows, waiting time, and demand.",
    metrics: "324 scheduled · 86% completed",
    icon: "calendar",
  },
  {
    key: "clinical",
    title: "Clinical reports",
    description: "Consultation workload and care activity trends.",
    metrics: "186 consultations · 14 doctors",
    icon: "clinical",
  },
  {
    key: "laboratory",
    title: "Laboratory reports",
    description: "Test volume, turnaround, backlog, and verification.",
    metrics: "412 tests · 46 min avg TAT",
    icon: "lab",
  },
  {
    key: "pharmacy",
    title: "Pharmacy reports",
    description: "Dispensing, medicine consumption, and stock risk.",
    metrics: "268 prescriptions · 9 low stock",
    icon: "pharmacy",
  },
  {
    key: "billing",
    title: "Billing & revenue",
    description: "Collections, invoices, balances, and payment methods.",
    metrics: "$48,200 collected · 91% paid",
    icon: "billing",
  },
  {
    key: "admissions",
    title: "Admissions & beds",
    description: "Admissions, discharges, occupancy, and length of stay.",
    metrics: "68% occupancy · 12 admissions",
    icon: "beds",
  },
  {
    key: "operations",
    title: "Operational reports",
    description: "Waiting time, peak hours, and department volume.",
    metrics: "38 min avg wait · 09:00 peak",
    icon: "operations",
  },
  {
    key: "staff",
    title: "Staff workload",
    description: "Operational activity by clinical and support teams.",
    metrics: "14 doctors · 186 consultations",
    icon: "staff",
  },
];

export const reportTrend = [
  { label: "Aug 19", visits: 182, revenue: 3120 },
  { label: "Aug 20", visits: 214, revenue: 3680 },
  { label: "Aug 21", visits: 198, revenue: 3410 },
  { label: "Aug 22", visits: 246, revenue: 4250 },
  { label: "Aug 23", visits: 231, revenue: 3990 },
  { label: "Aug 24", visits: 264, revenue: 4580 },
  { label: "Aug 25", visits: 289, revenue: 5170 },
];

export const departmentReport = [
  { department: "General Medicine", visits: 642, consultations: 428, revenue: 12800, wait: 34 },
  { department: "Pediatrics", visits: 388, consultations: 264, revenue: 7640, wait: 42 },
  { department: "Emergency", visits: 276, consultations: 192, revenue: 10920, wait: 51 },
  { department: "Maternity", visits: 244, consultations: 158, revenue: 9240, wait: 29 },
  { department: "Surgery", visits: 116, consultations: 82, revenue: 7600, wait: 38 },
];

export const paymentReport = [
  { name: "Cash", amount: 18400 },
  { name: "Mobile Money", amount: 14200 },
  { name: "Card", amount: 9800 },
  { name: "Bank Transfer", amount: 5800 },
];
export const attentionItems = [
  "Average waiting time is highest between 09:00 and 11:00.",
  "Pediatrics handled the second-highest observed patient volume this period.",
  "9 medicines are at or below their configured minimum stock level.",
];
