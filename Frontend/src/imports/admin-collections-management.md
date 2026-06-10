Admin Collections Management Screen – Green Care Rwanda

Modify ONLY the “Collections” tab content in the Admin panel.

Do NOT change:

Sidebar

Dashboard

Other tabs

Navigation structure

Only redesign the main content area when the Admin clicks on “Collections”.

This screen must function as a complete operational collection management interface.

Screen Purpose

This screen allows the Admin to:

View all collection requests submitted by residents

See full request details

Assign available collectors

Reassign missed pickups

Edit schedules

Track pickup status

Monitor zone performance

This is a system-level operations screen, not a resident view.

Layout Structure

Use a 2-panel layout:

LEFT: Collection Requests Table
RIGHT: Dynamic Request Detail Panel

🔹 Top Control Bar

Include:

Search field (search by Request ID, Resident Name, Phone, Zone)

Filter dropdowns:

Status (Pending, Assigned, In Progress, Completed, Missed, Cancelled)

Waste Type (Organic, Plastic, General, Recyclables)

District → Sector → Cell

Date range picker

“Export CSV” button

“Create Manual Pickup” button

🔹 Collection Requests Table (Main Panel)

Table columns:

Request ID

Resident Name

Phone Number

District / Sector

Waste Type

Estimated Weight (kg)

Preferred Date

Assigned Collector (if any)

Status badge

Priority level

Submitted timestamp

Status badges:

Pending (gray)

Assigned (blue)

In Progress (orange)

Completed (green)

Missed (red)

Each row is clickable.

When Admin clicks a row:
Open full details in right panel.

🔹 Right Panel: Request Detail & Assignment

When a request is selected, show:

Resident Information

Name

Phone

Full Address (District → Sector → Cell → Village)

Verification status

Request Details

Waste type

Estimated weight

Preferred date

Notes from resident

Uploaded photo preview

Time submitted

Assignment Section

If status = Pending:
Show:

Dropdown: Available collectors in that zone

Show collector workload (number of assigned pickups today)

Suggested collector (system recommendation)

Assign button

If status = Assigned:
Show:

Assigned collector

Option to Reassign

Option to Change scheduled time

If status = Missed:
Show:

Reason for miss (from collector)

Reassign button

Reschedule date picker

Mark as escalated

If status = Completed:
Show:

Completion timestamp

Actual collected weight

Collector notes

Proof photo upload

Resident confirmation status

🔹 Operational Insights Panel (Below Table)

Add small analytics section:

Total requests today

Pending requests

Missed pickups

Average response time

Zone with highest pending requests

Use small cards or mini charts.

🔹 Smart Features

Include:

Auto-priority flag if:

Waste weight > 50kg

Preferred date is today

Resident reported overflow

SLA timer indicator (time since submission)

Bulk action checkbox:

Assign multiple requests

Change status in bulk

Design Tone

This screen should feel:

Structured

Data-heavy

Administrative

Process-oriented

Operational

Avoid:

Resident-style cards

Personal widgets

Simplified layouts

Use:

Tables

Side panel detail view

Status tags

Dense information hierarchy

Important Context

This is for Rwanda municipal-level waste management.

Use address hierarchy:
District → Sector → Cell → Village

Collectors operate per zone.

Assignments must respect zone matching logic.