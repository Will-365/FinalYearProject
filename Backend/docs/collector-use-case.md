# Collector Use Case Diagram

Updated diagram including **generate report**, **notifications**, and **send / receive messages**, aligned with admin and resident modules.

```mermaid
usecaseDiagram
  actor Collector as collector

  Collector --> (login)
  Collector --> (view requested pickups)
  Collector --> (view assigned pickups)
  Collector --> (confirm a pickup)
  Collector --> (generate report)
  Collector --> (notifications)
  Collector --> (send receive messages)

  (confirm a pickup) ..> (update pickup status) : <<include>>

  note right of (update pickup status)
    Extension points:
    • in progress
    • completed
  end note

  note bottom of (generate report)
    Period: 7d / 30d / 90d
    PDF export from live pickup data
  end note

  note bottom of (notifications)
    Assignment alerts from admin
    Pickup status updates
  end note

  note bottom of (send receive messages)
    Two-way messaging with
    admin and residents
  end note
```

## API mapping

| Use case | Endpoint |
|----------|----------|
| view assigned pickups | `GET /api/collector/pickups?scope=assigned` |
| view requested pickups | `GET /api/collector/pickups?scope=requested` |
| confirm a pickup / update status | `PATCH /api/collector/pickups/:id/status` |
| generate report | `GET /api/collector/reports?period=30d` |
| notifications | `GET /api/collector/notifications` |
| send receive messages | `GET/POST /api/collector/messages` |

## Related actors

- **Admin** assigns pickups → collector receives **notification**
- **Resident** requests pickup → appears in **view requested pickups** (same district)
- **Confirm pickup** → resident points awarded (via existing collection flow)
