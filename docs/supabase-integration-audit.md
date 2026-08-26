# GGH Supabase integration audit

## Current status

The Supabase project `aruzkoysgvkatxrdytnx` is connected and healthy. The browser client is configured through `.env.local` (ignored by git) using only the publishable key. The login form now uses Supabase password authentication, the admin menu uses client-side router links, and sign-out calls Supabase Auth.

The remote database now has the GGH foundation schema: 23 public tables, hospital tenancy/memberships, RLS policies, seed hospital, foreign-key indexes, and hardened append-only audit logs. Remote migrations applied: `ggh_foundation`, `ggh_foreign_key_indexes`, `ggh_audit_log_hardening`, and `ggh_rls_query_optimization`. Most clinical module screens still use typed mock data or localStorage and must be migrated module-by-module.

## Module and route inventory

| Area | Routes/pages | Current data state | Main dialogs/actions audited |
|---|---|---|---|
| Auth | `/admin/login`, `/admin/forgot-password` | Supabase password sign-in; membership guard still pending | Sign-in, password visibility, sign-out |
| Dashboard | `/admin/dashboard` | Mock dashboard data | Dashboard filters and refresh |
| Patients | `/admin/patients`, `/new`, `/$patientId`, `/$patientId/edit` | Mock data; registration local UI | Register and view patient |
| Appointments | `/admin/appointments`, `/new`, `/$appointmentId` | Mock data; local UI state | New appointment, queue, view appointment, check-in |
| Queue | `/admin/queue` | Mock data; local workflow state | Vitals, ready, consultation, completed, view visit |
| Clinical | `/admin/clinical`, `/visits/$visitId/consultation` | Mock data; consultation UI | Consultation and prescription UI |
| Laboratory | `/admin/laboratory`, `/new`, `/catalog`, `/orders/$orderId` | Mock data; catalog localStorage | New order, multi-test selection, catalog add, result workflow |
| Pharmacy | `/admin/pharmacy`, `/pos`, `/inventory`, `/medicines`, `/movements`, `/low-stock`, `/expiry`, `/prescriptions/$prescriptionId` | Mock data; pharmacy localStorage | Receive prescription, POS, receive stock, add medicine, adjust/view/update/delete batch |
| Prescriptions | `/admin/prescriptions` | Pharmacy localStorage | New prescription and view prescription |
| Billing | `/admin/billing`, `/invoices`, `/invoices/new`, invoice detail, payments, receipts, services, outstanding | Mock data; forms mostly UI state | Create/view invoice and billing workflows |
| Admissions | `/admin/admissions`, detail, wards, beds, discharges | Mock data; local UI state | New/view admission and bed board |
| Reports | `/admin/reports`, `/$category` | Typed fictional report data | Global filters, charts, tables, insights |
| Administration | `/admin/settings`, `/admin/audit-logs` | Placeholder/mock | Needs real roles and audit events |

## Recommended Supabase implementation order

1. Create project configuration and Auth session guard.
2. Add hospital tenancy, memberships, roles, and permission tables with RLS.
3. Add master data: departments, doctors/staff, services, laboratory catalog, medicines, wards, rooms, beds.
4. Add transactional data: patients, visits, appointments, queue events, consultations, prescriptions, lab orders/results, inventory batches/movements, invoices/payments, admissions/discharges.
5. Replace module-by-module mock stores with typed query services and mutation handlers.
6. Move reporting calculations to server-side aggregate queries/RPCs after metric definitions are approved.
7. Add audit events for sensitive reads/exports and all financial/inventory mutations.

## Security requirements

- Enable RLS on every exposed table.
- Scope every row through a hospital membership, never a browser-provided hospital ID alone.
- Store authorization in server-controlled role/membership data, not editable user metadata.
- Keep publishable keys client-side only; never expose `service_role` or secret keys.
- Restrict financial, clinical detail, patient-level, and staff reports by permission.
- Use server-side pagination and aggregate queries for reports; do not load entire hospital datasets into the browser.
- Preserve an audit trail for stock changes, prescriptions, lab verification, billing mutations, and sensitive exports.

## Remaining connection work

The database connection is complete, but a staff user and membership must be created before protected rows can be read. Create the first staff account in Supabase Auth, then add its user UUID to `public.memberships` for the seeded hospital with role `owner` or `admin`. Do not send a password or service-role key in chat.

Next implementation slice: add the authenticated session/membership guard, then replace Settings and Audit Logs with Supabase queries before migrating Patients, Appointments, Laboratory, Pharmacy, Prescriptions, and Billing.
