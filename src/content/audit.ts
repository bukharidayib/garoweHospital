export type AuditSeverity = "Info" | "Warning" | "Critical";

export type AuditEntry = {
  id: string;
  occurredAt: string;
  actor: string;
  role: string;
  action: string;
  module: string;
  target: string;
  severity: AuditSeverity;
  outcome: "Success" | "Blocked" | "Failed";
  ipAddress: string;
  details: string;
};

export const auditEntries: AuditEntry[] = [
  {
    id: "audit-001",
    occurredAt: "2026-08-25 10:51",
    actor: "Fatima Ali",
    role: "Pharmacist",
    action: "Dispensed prescription",
    module: "Pharmacy",
    target: "GGH-RX-2026-000481",
    severity: "Info",
    outcome: "Success",
    ipAddress: "10.24.8.14",
    details: "Dispensed 15 units from batch PCM-2410.",
  },
  {
    id: "audit-002",
    occurredAt: "2026-08-25 10:42",
    actor: "Dr. Ahmed Yusuf",
    role: "Doctor",
    action: "Created prescription",
    module: "Prescriptions",
    target: "GGH-RX-2026-000481",
    severity: "Info",
    outcome: "Success",
    ipAddress: "10.24.4.21",
    details: "Prescription sent to Pharmacy for review.",
  },
  {
    id: "audit-003",
    occurredAt: "2026-08-25 10:22",
    actor: "Mohamed Noor",
    role: "Pharmacy manager",
    action: "Adjusted stock",
    module: "Inventory",
    target: "CFX-2401",
    severity: "Warning",
    outcome: "Success",
    ipAddress: "10.24.8.10",
    details: "Physical count adjustment decreased Ceftriaxone by 2 units.",
  },
  {
    id: "audit-004",
    occurredAt: "2026-08-25 10:18",
    actor: "Lab Tech Fatima",
    role: "Laboratory staff",
    action: "Collected sample",
    module: "Laboratory",
    target: "GGH-LAB-2026-000184",
    severity: "Info",
    outcome: "Success",
    ipAddress: "10.24.6.12",
    details: "Blood sample marked as collected.",
  },
  {
    id: "audit-005",
    occurredAt: "2026-08-25 09:57",
    actor: "Unknown",
    role: "Unauthenticated",
    action: "Login attempt",
    module: "Authentication",
    target: "admin portal",
    severity: "Critical",
    outcome: "Blocked",
    ipAddress: "102.68.14.7",
    details: "Invalid credentials; request blocked by authentication policy.",
  },
  {
    id: "audit-006",
    occurredAt: "2026-08-25 09:44",
    actor: "Mohamed Noor",
    role: "Pharmacy manager",
    action: "Received stock",
    module: "Inventory",
    target: "AMX-2407",
    severity: "Info",
    outcome: "Success",
    ipAddress: "10.24.8.10",
    details: "Received 60 Amoxicillin capsules into inventory.",
  },
  {
    id: "audit-007",
    occurredAt: "2026-08-25 09:12",
    actor: "Admin Manager",
    role: "Administrator",
    action: "Viewed revenue report",
    module: "Reports",
    target: "Billing report · Last 30 days",
    severity: "Warning",
    outcome: "Success",
    ipAddress: "10.24.2.5",
    details: "Financial report accessed by an authorized administrator.",
  },
];
