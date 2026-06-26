# GreenCare — Full Use Case Diagram ("The Green Loop")

Complete system use cases aligned with implemented API modules.

```mermaid
usecaseDiagram
  actor Resident as resident
  actor Collector as collector
  actor Admin as admin

  %% Resident
  resident --> (register)
  resident --> (login)
  resident --> (Update profile)
  resident --> (scan material type)
  resident --> (request a collection)
  resident --> (track collection schedule)
  resident --> (confirm collection)
  resident --> (claim coupons)
  resident --> (view the leader board)
  resident --> (buy products)
  resident --> (View nearest recyclable center)
  resident --> (schedule drop off)
  resident --> (view my environmental effect)
  resident --> (notifications send receive)

  (login) ..> (forgot password) : <<extend>>
  (forgot password) ..> (reset password) : <<include>>
  (request a collection) ..> (track collection schedule) : <<include>>
  (View nearest recyclable center) ..> (schedule drop off) : <<include>>
  (claim coupons) ..> (buy products) : <<extend>>

  note right of (buy products)
    Payment: points, phone, cash
  end note

  %% Collector
  collector --> (login)
  collector --> (view assigned pickups)
  collector --> (view requested pickups)
  collector --> (confirm a pickup)
  collector --> (generate report)
  collector --> (notifications send receive)

  (confirm a pickup) ..> (update pickup status) : <<include>>

  note right of (update pickup status)
    Extension points:
    in progress, completed
  end note

  note right of (notifications send receive)
    Extension points: send, receive
  end note

  %% Admin
  admin --> (login)
  admin --> (Update profile)
  admin --> (create collector)
  admin --> (view collector status)
  admin --> (Assign pickup)
  admin --> (view collections request)
  admin --> (set request priorities)
  admin --> (update address hierarchy)
  admin --> (generate report)
  admin --> (notifications send receive)

  (view collections request) ..> (view waste category) : <<extend>>
  (view collector status) ..> (Available) : extension
  (view collector status) ..> (not available) : extension
  (set request priorities) ..> (high) : extension
  (set request priorities) ..> (medium) : extension
  (set request priorities) ..> (low) : extension
```

## Implementation Status

| Use Case | API | Frontend |
|----------|-----|----------|
| register / login / forgot / reset | `/api/auth/*` | AuthPage, LoginPage, ForgotPassword |
| Update profile | `/api/auth/profile`, `/api/admin/auth/profile` | UserProfilePage |
| scan material type | `/api/waste/scan` | ScanPage |
| request / confirm collection | `/api/collection/*` | CollectionRequestPage, MyRequestsPage |
| track collection schedule | `/api/collection/schedules` | SchedulesPage |
| claim coupons | `/api/coupons/*` | CouponsPage |
| leaderboard | `/api/leaderboard/*` | LeaderboardPage |
| buy products | `/api/products/*` | ProductsPage |
| nearest recyclable center | `/api/recycling/centers/nearest` | ResidentRecyclingPage |
| schedule drop off | `/api/recycling/drop-offs` | ResidentRecyclingPage |
| environmental effect | `/api/reports/environmental-impact` | EnvironmentalImpactPage |
| collector pickups / status | `/api/collector/pickups/*` | CollectorTasksPage |
| collector report | `/api/collector/reports` | CollectorReportsPage |
| notifications / messages (all roles) | `/api/messaging/*`, `/api/collector/*` | AdminMessagesPage, ResidentNotificationsPage, CollectorMessagesPage |
| admin collectors / assign / priority | `/api/admin/collectors`, `/api/admin/collections` | AdminCollectorManagement, AdminCollectionManagement |
| admin waste category | `/api/admin/waste-intake` | WasteIntakeTab |
| admin address hierarchy | `/api/admin/address` | AdminZoneManagement |
| admin generate report | `/api/admin/reports` | AdminReportsPage |
| admin broadcast | `/api/admin/reports/broadcasts` | AdminMessagesPage |

## Cross-Module Communication

1. **Resident requests pickup** → Admin sees in collections → Admin assigns → Collector notified → Collector updates status → Resident notified → Resident confirms → Points awarded
2. **Admin broadcast** → Notifications created for all matching users
3. **Any user sends message** → Recipient gets notification + inbox entry
4. **Product purchase with points** → Points ledger debit + order record + notification
