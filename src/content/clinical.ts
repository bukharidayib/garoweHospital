export const clinicalQueue = [
  {
    visitId: "VIS-00883",
    queue: "GEN-014",
    patientId: "p-00133",
    patient: "Sahra Nur",
    number: "GGH-PAT-000133",
    age: 46,
    gender: "F",
    department: "General Medicine",
    arrival: "08:43",
    wait: 47,
    priority: "Urgent",
    vitals: "Recorded",
    status: "Waiting",
  },
  {
    visitId: "VIS-00884",
    queue: "GEN-015",
    patientId: "p-00142",
    patient: "Yusuf Abdullahi",
    number: "GGH-PAT-000142",
    age: 50,
    gender: "M",
    department: "General Medicine",
    arrival: "10:06",
    wait: 22,
    priority: "Normal",
    vitals: "Complete",
    status: "Ready for Doctor",
  },
  {
    visitId: "VIS-00885",
    queue: "PED-009",
    patientId: "p-00131",
    patient: "Mohamed Ali",
    number: "GGH-PAT-000131",
    age: 8,
    gender: "M",
    department: "Pediatrics",
    arrival: "08:52",
    wait: 18,
    priority: "Normal",
    vitals: "Complete",
    status: "In Consultation",
  },
  {
    visitId: "VIS-00886",
    queue: "GEN-016",
    patientId: "p-00128",
    patient: "Amina Hassan",
    number: "GGH-PAT-000128",
    age: 32,
    gender: "F",
    department: "General Medicine",
    arrival: "10:32",
    wait: 8,
    priority: "Normal",
    vitals: "Pending",
    status: "Waiting",
  },
];

export const currentVitals = {
  temperature: "37.2 °C",
  bloodPressure: "128/82",
  pulse: "78 bpm",
  respiratory: "16 /min",
  oxygen: "98%",
  weight: "64 kg",
  recorded: "Today · 09:18",
  recordedBy: "Nurse Fatima",
};

export const clinicalHistory = [
  {
    date: "14 Jul 2026",
    department: "General Medicine",
    diagnosis: "Gastroenteritis",
    detail: "2 medicines prescribed",
  },
  {
    date: "02 Jun 2026",
    department: "Laboratory",
    diagnosis: "CBC completed",
    detail: "Verified · no critical flags",
  },
  {
    date: "18 Apr 2026",
    department: "General Medicine",
    diagnosis: "Routine review",
    detail: "Follow-up recommended",
  },
];

export const recentLabs = [
  { test: "Complete blood count", result: "Normal", date: "02 Jun 2026", flag: "Normal" },
  { test: "Glucose, fasting", result: "6.1 mmol/L", date: "02 Jun 2026", flag: "Review" },
];

export const recentMedications = [
  { medicine: "Paracetamol", dose: "500 mg · as needed", date: "14 Jul 2026", status: "Completed" },
  {
    medicine: "Oral rehydration salts",
    dose: "1 sachet daily",
    date: "14 Jul 2026",
    status: "Dispensed",
  },
];
