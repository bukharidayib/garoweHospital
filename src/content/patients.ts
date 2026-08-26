export type PatientStatus = "Active" | "Waiting" | "Admitted" | "Archived";

export type Patient = {
  id: string;
  patientNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: "Female" | "Male";
  phone: string;
  email?: string;
  nationalId?: string;
  address: string;
  city: string;
  region: string;
  country: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  bloodGroup?: string;
  allergiesSummary?: string;
  medicalAlerts?: string;
  status: PatientStatus;
  admissionStatus: "Outpatient" | "Admitted";
  department: string;
  lastVisit: string;
  registrationDate: string;
  lastVisitType: string;
};

export const patients: Patient[] = [
  {
    id: "p-00128",
    patientNumber: "GGH-PAT-000128",
    firstName: "Amina",
    lastName: "Hassan",
    dateOfBirth: "1994-04-12",
    gender: "Female",
    phone: "+252 90 411 2840",
    email: "amina.hassan@example.com",
    nationalId: "PL-941204",
    address: "Wadajir district",
    city: "Garowe",
    region: "Nugaal, Puntland",
    country: "Somalia",
    emergencyContactName: "Hodan Hassan",
    emergencyContactRelationship: "Sister",
    emergencyContactPhone: "+252 90 411 2841",
    bloodGroup: "O+",
    allergiesSummary: "No known allergies",
    medicalAlerts: "",
    status: "Active",
    admissionStatus: "Outpatient",
    department: "General Medicine",
    lastVisit: "Today, 08:30",
    registrationDate: "2026-04-18",
    lastVisitType: "Appointment",
  },
  {
    id: "p-00131",
    patientNumber: "GGH-PAT-000131",
    firstName: "Mohamed",
    lastName: "Ali",
    dateOfBirth: "2017-09-22",
    gender: "Male",
    phone: "+252 90 522 7812",
    address: "Hantiwadag district",
    city: "Garowe",
    region: "Nugaal, Puntland",
    country: "Somalia",
    emergencyContactName: "Sahra Ali",
    emergencyContactRelationship: "Mother",
    emergencyContactPhone: "+252 90 522 7813",
    bloodGroup: "A+",
    allergiesSummary: "No known allergies",
    medicalAlerts: "",
    status: "Active",
    admissionStatus: "Outpatient",
    department: "Pediatrics",
    lastVisit: "Today, 09:00",
    registrationDate: "2026-05-02",
    lastVisitType: "Appointment",
  },
  {
    id: "p-00133",
    patientNumber: "GGH-PAT-000133",
    firstName: "Sahra",
    lastName: "Nur",
    dateOfBirth: "1980-11-03",
    gender: "Female",
    phone: "+252 90 633 1108",
    address: "Horseed district",
    city: "Garowe",
    region: "Nugaal, Puntland",
    country: "Somalia",
    emergencyContactName: "Abdi Nur",
    emergencyContactRelationship: "Husband",
    emergencyContactPhone: "+252 90 633 1109",
    bloodGroup: "B+",
    allergiesSummary: "Penicillin",
    medicalAlerts: "Confirm allergy before prescribing",
    status: "Waiting",
    admissionStatus: "Outpatient",
    department: "General Medicine",
    lastVisit: "Today, 09:30",
    registrationDate: "2026-05-10",
    lastVisitType: "Walk-in",
  },
  {
    id: "p-00134",
    patientNumber: "GGH-PAT-000134",
    firstName: "Abdi",
    lastName: "Warsame",
    dateOfBirth: "1999-02-16",
    gender: "Male",
    phone: "+252 90 744 9031",
    address: "Garowe central",
    city: "Garowe",
    region: "Nugaal, Puntland",
    country: "Somalia",
    emergencyContactName: "Warsame Abdi",
    emergencyContactRelationship: "Father",
    emergencyContactPhone: "+252 90 744 9032",
    bloodGroup: "AB+",
    allergiesSummary: "No known allergies",
    medicalAlerts: "",
    status: "Admitted",
    admissionStatus: "Admitted",
    department: "Emergency",
    lastVisit: "Today, 10:00",
    registrationDate: "2026-05-12",
    lastVisitType: "Emergency",
  },
  {
    id: "p-00138",
    patientNumber: "GGH-PAT-000138",
    firstName: "Maryan",
    lastName: "Ibrahim",
    dateOfBirth: "1988-07-21",
    gender: "Female",
    phone: "+252 90 855 6220",
    email: "maryan.ibrahim@example.com",
    address: "Biyo Kulule",
    city: "Garowe",
    region: "Nugaal, Puntland",
    country: "Somalia",
    emergencyContactName: "Ibrahim Ahmed",
    emergencyContactRelationship: "Husband",
    emergencyContactPhone: "+252 90 855 6221",
    bloodGroup: "O-",
    allergiesSummary: "No known allergies",
    medicalAlerts: "",
    status: "Active",
    admissionStatus: "Outpatient",
    department: "Obstetrics & Gynecology",
    lastVisit: "Today, 10:30",
    registrationDate: "2026-05-18",
    lastVisitType: "Appointment",
  },
  {
    id: "p-00142",
    patientNumber: "GGH-PAT-000142",
    firstName: "Yusuf",
    lastName: "Abdullahi",
    dateOfBirth: "1976-03-30",
    gender: "Male",
    phone: "+252 90 966 4710",
    address: "Shacabka",
    city: "Garowe",
    region: "Nugaal, Puntland",
    country: "Somalia",
    emergencyContactName: "Layla Abdullahi",
    emergencyContactRelationship: "Wife",
    emergencyContactPhone: "+252 90 966 4711",
    bloodGroup: "A-",
    allergiesSummary: "No known allergies",
    medicalAlerts: "",
    status: "Active",
    admissionStatus: "Outpatient",
    department: "General Medicine",
    lastVisit: "Today, 11:00",
    registrationDate: "2026-06-01",
    lastVisitType: "Appointment",
  },
  {
    id: "p-00145",
    patientNumber: "GGH-PAT-000145",
    firstName: "Hawo",
    lastName: "Omar",
    dateOfBirth: "1968-12-09",
    gender: "Female",
    phone: "+252 90 177 3084",
    address: "Waberi district",
    city: "Garowe",
    region: "Nugaal, Puntland",
    country: "Somalia",
    emergencyContactName: "Omar Hassan",
    emergencyContactRelationship: "Son",
    emergencyContactPhone: "+252 90 177 3085",
    bloodGroup: "B-",
    allergiesSummary: "No known allergies",
    medicalAlerts: "Fall risk",
    status: "Admitted",
    admissionStatus: "Admitted",
    department: "General Medicine",
    lastVisit: "Yesterday, 16:20",
    registrationDate: "2026-06-10",
    lastVisitType: "Admission",
  },
];

export const patientVisits = [
  {
    id: "VIS-00881",
    date: "22 Aug 2026 · 08:30",
    type: "Appointment",
    department: "General Medicine",
    doctor: "Dr. Ahmed Yusuf",
    status: "Completed",
  },
  {
    id: "VIS-00742",
    date: "14 Jul 2026 · 10:15",
    type: "Follow-up",
    department: "General Medicine",
    doctor: "Dr. Ahmed Yusuf",
    status: "Completed",
  },
  {
    id: "VIS-00610",
    date: "02 Jun 2026 · 09:00",
    type: "Walk-in",
    department: "General Medicine",
    doctor: "Dr. Hawa Omar",
    status: "Completed",
  },
];

export const patientAppointments = [
  {
    id: "APT-02481",
    date: "22 Aug 2026",
    time: "08:30",
    department: "General Medicine",
    doctor: "Dr. Ahmed Yusuf",
    reason: "Follow-up consultation",
    status: "Completed",
  },
  {
    id: "APT-02410",
    date: "02 Sep 2026",
    time: "10:00",
    department: "General Medicine",
    doctor: "Dr. Ahmed Yusuf",
    reason: "Routine review",
    status: "Scheduled",
  },
];

export const patientActivities = [
  { title: "Patient registered", detail: "Reception · 18 Apr 2026", icon: "UserPlus" },
  {
    title: "Profile contact details updated",
    detail: "Admin Manager · 09 Jun 2026",
    icon: "FilePenLine",
  },
  {
    title: "Appointment completed",
    detail: "Dr. Ahmed Yusuf · Today, 09:12",
    icon: "CheckCircle2",
  },
];

export function patientAge(dateOfBirth: string) {
  const today = new Date("2026-08-22T00:00:00");
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1;
  return age;
}
