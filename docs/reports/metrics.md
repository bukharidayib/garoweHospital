# GGH Reports & Analytics metric definitions

This MVP uses typed fictional data. Production reporting must replace these fixtures with hospital-scoped server-side aggregates.

- **Total visits:** qualifying visits in the selected reporting period.
- **New patients:** patients whose registration date falls in the selected period.
- **Revenue collected:** payments recorded as collected in the selected period; it is not the same as billed revenue.
- **Average waiting time:** arithmetic mean of completed queue waits with a recorded start and end time.
- **Occupancy rate:** occupied usable beds divided by total usable beds; maintenance beds are excluded.
- **Completion rate:** completed records divided by scheduled records, with an empty denominator shown as “No data”.

All production queries must enforce hospital scope, membership, permission checks, and hospital timezone on the server.
