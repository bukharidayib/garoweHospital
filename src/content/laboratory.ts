export type LabOrderStatus =
  | "Ordered"
  | "Awaiting Sample"
  | "Sample Collected"
  | "Processing"
  | "Partially Completed"
  | "Completed"
  | "Verified";
export type LabPriority = "Routine" | "Urgent" | "STAT";

export const labOrders = [
  {
    id: "lab-184",
    orderNumber: "GGH-LAB-2026-000184",
    patientId: "p-00133",
    patient: "Sahra Nur",
    patientNumber: "GGH-PAT-000133",
    visit: "VIS-00883",
    tests: "CBC · Malaria Test · Glucose",
    requestedBy: "Dr. Ahmed Yusuf",
    department: "General Medicine",
    priority: "Urgent" as LabPriority,
    requested: "10:18",
    status: "Processing" as LabOrderStatus,
    tat: "34 min",
  },
  {
    id: "lab-185",
    orderNumber: "GGH-LAB-2026-000185",
    patientId: "p-00134",
    patient: "Abdi Warsame",
    patientNumber: "GGH-PAT-000134",
    visit: "VIS-00884",
    tests: "Blood glucose",
    requestedBy: "Dr. Hassan Ismail",
    department: "Emergency",
    priority: "STAT" as LabPriority,
    requested: "10:24",
    status: "Awaiting Sample" as LabOrderStatus,
    tat: "12 min",
  },
  {
    id: "lab-186",
    orderNumber: "GGH-LAB-2026-000186",
    patientId: "p-00131",
    patient: "Mohamed Ali",
    patientNumber: "GGH-PAT-000131",
    visit: "VIS-00885",
    tests: "CBC",
    requestedBy: "Dr. Hawa Omar",
    department: "Pediatrics",
    priority: "Routine" as LabPriority,
    requested: "09:32",
    status: "Verified" as LabOrderStatus,
    tat: "48 min",
  },
  {
    id: "lab-187",
    orderNumber: "GGH-LAB-2026-000187",
    patientId: "p-00138",
    patient: "Maryan Ibrahim",
    patientNumber: "GGH-PAT-000138",
    visit: "VIS-00886",
    tests: "Urinalysis",
    requestedBy: "Dr. Hawa Omar",
    department: "Obstetrics & Gynecology",
    priority: "Routine" as LabPriority,
    requested: "09:40",
    status: "Sample Collected" as LabOrderStatus,
    tat: "31 min",
  },
  {
    id: "lab-188",
    orderNumber: "GGH-LAB-2026-000188",
    patientId: "p-00142",
    patient: "Yusuf Abdullahi",
    patientNumber: "GGH-PAT-000142",
    visit: "VIS-00887",
    tests: "Liver function",
    requestedBy: "Dr. Ahmed Yusuf",
    department: "General Medicine",
    priority: "Routine" as LabPriority,
    requested: "08:52",
    status: "Partially Completed" as LabOrderStatus,
    tat: "1 hr 12 min",
  },
];

export const labOrderItems = [
  {
    test: "Complete blood count",
    code: "CBC",
    sample: "Blood",
    status: "Result Entered",
    result: "Hemoglobin 12.4 g/dL",
    reference: "12.0–16.0 g/dL",
    flag: "Normal",
  },
  {
    test: "Malaria parasite test",
    code: "MAL",
    sample: "Blood",
    status: "Processing",
    result: "—",
    reference: "Negative",
    flag: "Pending",
  },
  {
    test: "Fasting glucose",
    code: "GLU",
    sample: "Serum",
    status: "Verified",
    result: "6.1 mmol/L",
    reference: "3.9–5.5 mmol/L",
    flag: "High",
  },
];

export const labCatalog = [
  {
    code: "CBC",
    name: "Complete blood count",
    category: "Hematology",
    sample: "Blood",
    resultType: "Panel",
    turnaround: "45 min",
    price: "$8.00",
    active: true,
  },
  {
    code: "MAL",
    name: "Malaria parasite test",
    category: "Parasitology",
    sample: "Blood",
    resultType: "Positive / Negative",
    turnaround: "30 min",
    price: "$5.00",
    active: true,
  },
  {
    code: "GLU",
    name: "Fasting glucose",
    category: "Chemistry",
    sample: "Serum",
    resultType: "Numeric",
    turnaround: "30 min",
    price: "$4.00",
    active: true,
  },
  {
    code: "UA",
    name: "Urinalysis",
    category: "Urinalysis",
    sample: "Urine",
    resultType: "Panel",
    turnaround: "40 min",
    price: "$6.00",
    active: true,
  },
  {
    code: "LFT",
    name: "Liver function test",
    category: "Chemistry",
    sample: "Serum",
    resultType: "Panel",
    turnaround: "90 min",
    price: "$15.00",
    active: true,
  },
];

export const labActivity = [
  {
    action: "Result verified",
    detail: "CBC · GGH-LAB-2026-000186",
    user: "Senior Lab Tech · 12 min ago",
  },
  {
    action: "Sample collected",
    detail: "GGH-LAB-2026-000184",
    user: "Lab Tech Fatima · 18 min ago",
  },
  {
    action: "Result entered",
    detail: "Fasting glucose · GGH-LAB-2026-000184",
    user: "Lab Tech Ahmed · 24 min ago",
  },
];
