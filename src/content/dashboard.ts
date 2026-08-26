export type DashboardKpi = {
  label: string;
  value: string;
  detail: string;
  trend?: string;
  trendTone?: "positive" | "negative" | "neutral";
  icon: string;
};

export const dashboardKpis: DashboardKpi[] = [
  {
    label: "Patients today",
    value: "128",
    detail: "vs 114 yesterday",
    trend: "+12.3%",
    trendTone: "positive",
    icon: "Users",
  },
  {
    label: "Appointments",
    value: "46",
    detail: "8 remaining",
    trend: "+4",
    trendTone: "positive",
    icon: "CalendarDays",
  },
  {
    label: "Patients waiting",
    value: "18",
    detail: "Average wait 24 min",
    trend: "5 urgent",
    trendTone: "negative",
    icon: "Clock3",
  },
  {
    label: "Consultations",
    value: "71",
    detail: "68% of today's visits",
    trend: "+8.1%",
    trendTone: "positive",
    icon: "Stethoscope",
  },
  { label: "Current admissions", value: "34", detail: "3 admitted today", icon: "BedDouble" },
  { label: "Available beds", value: "16", detail: "68% occupancy", icon: "LayoutGrid" },
  {
    label: "Revenue today",
    value: "$8,240",
    detail: "vs $7,600 yesterday",
    trend: "+8.4%",
    trendTone: "positive",
    icon: "Banknote",
  },
  {
    label: "Outstanding bills",
    value: "$3,480",
    detail: "24 invoices",
    trend: "4 overdue",
    trendTone: "negative",
    icon: "ReceiptText",
  },
];

export const visitTrend = [
  { day: "Mon", total: 102, appointments: 64, walkIns: 38 },
  { day: "Tue", total: 118, appointments: 70, walkIns: 48 },
  { day: "Wed", total: 110, appointments: 68, walkIns: 42 },
  { day: "Thu", total: 126, appointments: 75, walkIns: 51 },
  { day: "Fri", total: 114, appointments: 62, walkIns: 52 },
  { day: "Sat", total: 96, appointments: 54, walkIns: 42 },
  { day: "Today", total: 128, appointments: 78, walkIns: 50 },
];

export const revenueTrend = [
  { day: "Mon", collected: 6200, outstanding: 2700 },
  { day: "Tue", collected: 7100, outstanding: 3100 },
  { day: "Wed", collected: 6800, outstanding: 2400 },
  { day: "Thu", collected: 7900, outstanding: 2900 },
  { day: "Fri", collected: 7600, outstanding: 3200 },
  { day: "Sat", collected: 5840, outstanding: 1800 },
  { day: "Today", collected: 8240, outstanding: 3480 },
];

export const patientDistribution = [
  { name: "Appointments", value: 78, color: "#22577a" },
  { name: "Walk-ins", value: 32, color: "#38a3a5" },
  { name: "Emergency", value: 18, color: "#e76f51" },
];

export const departmentVisits = [
  { name: "General Medicine", visits: 42 },
  { name: "Emergency", visits: 34 },
  { name: "Pediatrics", visits: 28 },
  { name: "Maternity", visits: 19 },
  { name: "Surgery", visits: 15 },
];

export const appointments = [
  {
    id: "APT-02481",
    patient: "Amina Hassan",
    number: "PAT-00128",
    doctor: "Dr. Ahmed Yusuf",
    department: "General Medicine",
    time: "08:30",
    type: "Appointment",
    status: "Completed",
  },
  {
    id: "APT-02482",
    patient: "Mohamed Ali",
    number: "PAT-00131",
    doctor: "Dr. Hawa Omar",
    department: "Pediatrics",
    time: "09:00",
    type: "Appointment",
    status: "In Consultation",
  },
  {
    id: "APT-02483",
    patient: "Sahra Nur",
    number: "PAT-00133",
    doctor: "Dr. Ahmed Yusuf",
    department: "General Medicine",
    time: "09:30",
    type: "Walk-in",
    status: "Waiting",
  },
  {
    id: "APT-02484",
    patient: "Abdi Warsame",
    number: "PAT-00134",
    doctor: "Dr. Hassan Ismail",
    department: "Emergency",
    time: "10:00",
    type: "Emergency",
    status: "Checked In",
  },
  {
    id: "APT-02485",
    patient: "Maryan Ibrahim",
    number: "PAT-00138",
    doctor: "Dr. Hawa Omar",
    department: "Maternity",
    time: "10:30",
    type: "Appointment",
    status: "Confirmed",
  },
  {
    id: "APT-02486",
    patient: "Yusuf Abdullahi",
    number: "PAT-00142",
    doctor: "Dr. Ahmed Yusuf",
    department: "General Medicine",
    time: "11:00",
    type: "Appointment",
    status: "Scheduled",
  },
];

export const recentPatients = [
  {
    name: "Amina Hassan",
    number: "PAT-00128",
    demographic: "32 / F",
    visit: "Today, 08:30",
    department: "General Medicine",
    status: "Active",
  },
  {
    name: "Mohamed Ali",
    number: "PAT-00131",
    demographic: "8 / M",
    visit: "Today, 09:00",
    department: "Pediatrics",
    status: "Active",
  },
  {
    name: "Sahra Nur",
    number: "PAT-00133",
    demographic: "46 / F",
    visit: "Today, 09:30",
    department: "General Medicine",
    status: "Waiting",
  },
  {
    name: "Abdi Warsame",
    number: "PAT-00134",
    demographic: "27 / M",
    visit: "Today, 10:00",
    department: "Emergency",
    status: "Urgent",
  },
];

export const activities = [
  {
    icon: "CheckCircle2",
    text: "Dr. Ahmed completed a consultation",
    meta: "General Medicine · 12 min ago",
  },
  {
    icon: "FlaskConical",
    text: "Lab result verified for PAT-00117",
    meta: "Laboratory · 24 min ago",
  },
  { icon: "Pill", text: "Prescription dispensed", meta: "Pharmacy · 38 min ago" },
  { icon: "UserPlus", text: "New patient registered", meta: "Reception · 52 min ago" },
];

export const alerts = [
  {
    level: "Critical",
    title: "2 critical laboratory results",
    action: "Review results",
    icon: "Siren",
  },
  { level: "Warning", title: "8 medicines running low", action: "View inventory", icon: "Pill" },
  {
    level: "Warning",
    title: "3 patients waiting over 45 min",
    action: "View queue",
    icon: "Clock3",
  },
  {
    level: "Info",
    title: "2 beds marked for maintenance",
    action: "Review beds",
    icon: "BedDouble",
  },
];
