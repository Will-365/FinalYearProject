Admin – Incentive & Circular Economy Management Screen (Green Care Rwanda)

Modify ONLY the “Incentive Rewards” tab content in the Admin panel.

Do NOT change:

Sidebar

Dashboard

Collections

Collectors

Recycling & Processing

Other tabs

Redesign only the content area for Incentive & Circular Economy management.

Screen Purpose

This screen allows administrators to:

Monitor recycling performance points

View resident leaderboard rankings

Manage reward campaigns

Create and distribute vouchers or discounts

Track reward redemption

Encourage waste separation behavior

This is an administrative reward governance interface.

Layout Structure

Use internal tab navigation within this page:

Top internal tabs:

Leaderboard

Points Management

Reward Campaigns

Issued Rewards & Redemption

Incentive Reports

🔹 TAB 1: Leaderboard

Purpose: Rank residents based on recycling contribution and waste separation behavior.

Display:

Top 10 residents highlighted in leaderboard format:

Rank #

Resident Name

District / Sector

Total Points

Total Recycled Weight (kg)

Separation Quality Score

Badges (Gold / Silver / Bronze)

Below that:

Full leaderboard table:

Columns:

Rank

Resident Name

Zone

Organic recycled (kg)

Plastic recycled (kg)

Total Points

Participation Rate (%)

Status (Active / Suspended)

Include:

Filter by zone

Filter by date range

Filter by waste type

Search by resident

Each row clickable → opens side panel.

Leaderboard Detail Panel

When resident clicked, show:

Full recycling history

Points breakdown:

Points from organic

Points from plastic

Bonus points

Missed pickup penalties

Reward eligibility indicator

“Issue Reward” button

“Adjust Points” button (admin control)

🔹 TAB 2: Points Management

Purpose: Define and control how points are calculated.

Display:

Points Rules Table:

Action Type

Separate organic waste

Separate plastic waste

On-time drop-off

Missed pickup penalty

Points awarded

Status (Active / Inactive)

Edit button

Include:

Add new rule button

Edit rule modal

Toggle activation

Show system-wide summary:

Total points issued this month

Average points per resident

Top performing zone

🔹 TAB 3: Reward Campaigns

Purpose: Create rewards to incentivize behavior.

Include:

“Create New Reward Campaign” button

Reward Creation Form:

Reward Name

Reward Type (Discount / Voucher / Free Pickup / Product Discount)

Points Required

Validity Period

Eligible Zones

Description

Upload badge image

Activation toggle

Show campaign list:

Columns:

Campaign Name

Points Required

Start Date

End Date

Active Status

Total Claimed

Action (Edit / Deactivate)

🔹 TAB 4: Issued Rewards & Redemption

Purpose: Track rewards given to residents.

Table columns:

Reward ID

Resident Name

Reward Type

Points Used

Date Issued

Expiry Date

Redemption Status (Pending / Redeemed / Expired)

Redeemed Date

Include:

Filter by status

Filter by date

Filter by zone

Each row clickable → detail view showing:

Resident info

Reward details

Redemption history

Notification sent status

🔹 TAB 5: Incentive Reports

Display:

Total rewards issued

Total points redeemed

Active participants (%)

Revenue impact (if applicable)

Recycling increase after campaign (%)

Include charts:

Points issued over time

Rewards redeemed over time

Top performing zones

Include export buttons:

Export CSV

Generate PDF Report

Smart System Logic

When admin clicks “Issue Reward”:

System should:

Deduct points

Generate reward code

Send notification to resident

Make reward visible in Resident → Incentive Rewards tab

Include small flow diagram indicator showing:
Issue → Notification → Resident Account → Redemption