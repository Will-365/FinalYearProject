Admin – Collector Management Screen (Green Care Rwanda)

Modify ONLY the “Collectors” tab content in the Admin panel.

Do NOT change:

Sidebar

Dashboard

Collections tab

Recycling tab

Navigation structure

Redesign only the content area for Collector Management.

Screen Purpose

This screen allows administrators to manage all waste collectors in the system, including:

Assigning zones

Monitoring workload

Evaluating performance

Managing availability

Viewing activity history

Enabling/disabling accounts

This is a workforce management interface.

Layout Structure

Use a 2-section layout:

TOP: Filters & Controls
CENTER: Collectors Table
RIGHT (Slide-in Panel): Collector Details & Performance

🔹 Top Control Bar

Include:

Search field (Name, Phone, Collector ID)

Filter dropdowns:

Status (Active, Inactive, Suspended)

Zone (District → Sector)

Performance rating

Availability (Available, On Route, Offline)

“Add New Collector” button

“Export List” button

🔹 Collectors Table (Main Section)

Table columns:

Collector ID

Full Name

Phone

Assigned Zone

Status badge (Active / Suspended / Inactive)

Current Assignments (number)

Completed Pickups (This Month)

Missed Pickups (This Month)

Performance Score (%)

Availability (Online / On Route / Offline)

Actions (View / Edit)

Each row clickable.

When clicked → Open detail panel on right.

🔹 Collector Detail Panel (Slide-In)

When a collector is selected, show:

1️⃣ Basic Information

Full Name

Phone

National ID

Date Joined

Assigned Zone(s)

Account Status toggle

2️⃣ Assignment Overview

Pickups assigned today

Pickups completed today

Pending pickups

Missed pickups

Include small performance bar.

3️⃣ Performance Metrics

Show:

Completion rate %

Average response time

Average pickup duration

Missed pickup ratio

Resident rating (if implemented)

Include visual performance chart (last 7 days activity).

4️⃣ Zone Assignment Management

Include:

Current zone

Change zone dropdown

Assign additional zone button

Remove zone option

Ensure zone hierarchy:
District → Sector → Cell

5️⃣ Activity Log

Scrollable timeline:

Pickup assigned

Pickup completed

Missed pickup

Report submitted

Login activity

6️⃣ Administrative Controls

Buttons:

Suspend Collector

Reset Password

Reassign All Pickups

Send Notification

View Full History

🔹 Smart Operational Indicators

Include:

Warning badge if:

Missed pickups > threshold

Completion rate < 80%

Highlight collectors overloaded (> X pickups assigned)

SLA compliance indicator

Design Requirements

This screen must feel:

Operational

Data-driven

Workforce management oriented

Professional

Dense but structured

Avoid:

Resident-style cards

Simple profile view

Personal dashboard layout

Use:

Tables

Status badges

Charts

Timeline component

Toggle switches

Action buttons