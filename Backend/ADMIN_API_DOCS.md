# GreenCare Rwanda — Admin API Documentation

Base URL: `http://localhost:5000/api/admin`

All protected routes require:
```
Authorization: Bearer <admin_token>
```

---

## 🚀 Quick Start

### 1. Seed the first admin account
```bash
node scripts/seedAdmin.js
# Also seeds Rwanda province/district data:
node scripts/seedAdmin.js --with-addresses
```
Default credentials: `admin@greencare.rw` / `GreenCare@2025!`

Override via `.env`:
```env
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=YourSecurePass!
```

---

## 🔐 Admin Auth  `/api/admin/auth`

### POST `/api/admin/auth/login`
No OTP required. Admin accounts are created via seeder or directly.

**Request:**
```json
{ "email": "admin@greencare.rw", "password": "GreenCare@2025!" }
```
**Response:**
```json
{
  "success": true,
  "token": "eyJ...",
  "user": { "id": "...", "fullName": "GreenCare Admin", "email": "...", "role": "admin" }
}
```

### GET `/api/admin/auth/me`
Returns the currently authenticated admin's profile.

---

## 👷 Collector Management  `/api/admin/collectors`

### GET `/api/admin/collectors`
List all collectors with filtering and pagination.

**Query params:**
| Param | Type | Description |
|---|---|---|
| `status` | string | `available \| on_route \| offline` |
| `district` | string | Filter by zone district |
| `search` | string | Search by name, email, or phone |
| `page` | number | Default 1 |
| `limit` | number | Default 20 |

**Response includes:** `activeAssignments` count per collector.

---

### POST `/api/admin/collectors`
Create a new collector. Admin-created collectors are **pre-verified** (no OTP needed).

**Request Body:**
```json
{
  "fullName": "Jean Baptiste Nkurunziza",
  "email": "jean.collector@greencare.rw",
  "phone": "+250788123456",
  "nationalId": "1199012345678901",
  "password": "SecurePass@123",
  "vehicleType": "motorcycle",
  "collectorZone": {
    "province": "Kigali City",
    "district": "Gasabo",
    "sector": "Remera"
  }
}
```
`vehicleType`: `truck | van | motorcycle | bicycle | on_foot`

---

### GET `/api/admin/collectors/:id`
Get a single collector with:
- Full profile
- Assignment stats (completed, in_progress, assigned counts)
- 10 most recent assignments

---

### PUT `/api/admin/collectors/:id`
Update any collector field. Pass only fields to change.

**Can also reset password:**
```json
{ "password": "NewPassword@456" }
```

---

### DELETE `/api/admin/collectors/:id`
Soft-delete (deactivates) a collector. **Blocked if the collector has active assignments** — you must reassign or cancel those first.

---

### PATCH `/api/admin/collectors/:id/status`
Manually override a collector's operational status.

```json
{ "collectorStatus": "offline" }
```
`collectorStatus`: `available | on_route | offline`

---

## 📦 Collection Requests  `/api/admin/collections`

### GET `/api/admin/collections`
Full filtered list. Supports resident name/email/phone search via aggregation pipeline.

**Query params:**
| Param | Description |
|---|---|
| `status` | `pending \| assigned \| in_progress \| completed \| cancelled` |
| `priority` | `high \| medium \| low` |
| `wasteType` | `organic \| inorganic \| mixed \| hazardous \| recyclable` |
| `district` | Filter by resident's district |
| `collectorId` | Filter by assigned collector |
| `unassigned=true` | Show only unassigned requests |
| `dateFrom` / `dateTo` | Date range filter (ISO format) |
| `search` | Search resident name, email, phone |
| `sortBy` | Default `createdAt` |
| `sortOrder` | `asc \| desc` |
| `page` / `limit` | Pagination |

---

### GET `/api/admin/collections/summary`
Dashboard statistics.

**Response:**
```json
{
  "data": {
    "byStatus": { "pending": 12, "assigned": 5, "in_progress": 3, "completed": 48, "cancelled": 2 },
    "byPriority": { "high": 4, "medium": 14, "low": 2 },
    "byWasteType": { "organic": 20, "inorganic": 15, "mixed": 8, "recyclable": 7 },
    "dailyTrend": [{ "_id": "2025-07-10", "count": 6 }, ...]
  }
}
```

---

### GET `/api/admin/collections/:id`
Full detail: resident info, collector info, waste scan link, all fields.

---

### POST `/api/admin/collections/:id/assign`
Assign a pickup to a collector.

```json
{
  "collectorId": "64abc...",
  "scheduledDate": "2025-07-15T08:00:00.000Z",
  "collectionNote": "Resident has large bins at the back gate"
}
```
- Request must be `pending` or `assigned`
- Collector must exist, be active, and have role `collector`
- Auto-sets collector status to `on_route` if they were `available`

---

### PATCH `/api/admin/collections/:id/unassign`
Remove the assigned collector — sets request back to `pending`.
Auto-checks if the collector has remaining active jobs; if not, sets them back to `available`.

---

### PATCH `/api/admin/collections/:id/priority`
Set urgency level.

```json
{
  "priority": "high",
  "adminNotes": "Resident called — perishable waste, urgent"
}
```
`priority`: `high | medium | low`

---

### PATCH `/api/admin/collections/:id/status`
Force-update the status (admin override).

```json
{
  "status": "in_progress",
  "adminNotes": "Collector confirmed en route via phone"
}
```
- Completing a request (`status: "completed"`) increments the collector's `totalPickups`

---

## ♻️ Waste Category Intake  `/api/admin/waste-intake`

### GET `/api/admin/waste-intake/analytics`
Aggregated dashboard data.

**Query params:** `period` (`7d | 30d | 90d | 365d`), `district`

**Response:**
```json
{
  "data": {
    "period": "30d",
    "totals": { "totalWeightKg": 4520, "totalRecords": 182 },
    "byCategory": [
      { "_id": "organic", "totalWeightKg": 1800, "count": 72, "avgWeight": 25 },
      { "_id": "inorganic", "totalWeightKg": 1200, "count": 60, "avgWeight": 20 }
    ],
    "byDistrict": [{ "_id": "Gasabo", "totalWeightKg": 2100, "count": 84 }],
    "trend": [{ "_id": "2025-07-01", "totalWeightKg": 148, "count": 6 }],
    "completedByWasteType": { "organic": 45, "inorganic": 38 }
  }
}
```

---

### GET `/api/admin/waste-intake`
Paginated intake log. Filter by `wasteType`, `district`, `dateFrom`, `dateTo`.

---

### POST `/api/admin/waste-intake`
Manually record a waste intake event.

```json
{
  "wasteType": "organic",
  "weightKg": 25.5,
  "volumeLiters": 80,
  "location": { "province": "Kigali City", "district": "Gasabo", "sector": "Remera" },
  "intakeDate": "2025-07-10",
  "collectionRequestId": "64abc...",
  "processingStatus": "received",
  "notes": "Collected from morning route"
}
```

---

### PATCH `/api/admin/waste-intake/:id/status`
Update processing status.

```json
{ "processingStatus": "processed" }
```
`processingStatus`: `received | processing | processed | disposed`

---

## 🗺️ Address Hierarchy  `/api/admin/address`

### GET `/api/admin/address`
List nodes. Filter by `level`, `province`, `district`, `sector`, `cell`, `isActive`.

`level`: `province | district | sector | cell | village`

---

### GET `/api/admin/address/tree?province=Kigali City`
Returns a full nested tree (province → districts → sectors → cells → villages).

```json
{
  "data": {
    "province": "Kigali City",
    "districts": [
      {
        "name": "Gasabo",
        "collectionDays": ["monday", "thursday"],
        "assignedCollector": { "fullName": "Jean B.", "phone": "+250..." },
        "children": [
          { "name": "Remera", "children": [...] }
        ]
      }
    ]
  }
}
```

---

### POST `/api/admin/address`
Create a new location node.

```json
{
  "level": "sector",
  "name": "Kimironko",
  "province": "Kigali City",
  "district": "Gasabo",
  "collectionDays": ["tuesday", "friday"],
  "assignedCollector": "64abc...",
  "notes": "High-density residential area"
}
```

---

### PUT `/api/admin/address/:id`
Update a location node. Supports: `name`, `collectionDays`, `assignedCollector`, `notes`, `isActive`.

---

### DELETE `/api/admin/address/:id`
Soft-delete (deactivates) the node. Historical data is preserved.

---

### PATCH `/api/admin/address/:id/assign-collector`
Assign or remove a collector from a zone.

```json
{ "collectorId": "64abc..." }
```
Pass `null` to remove assignment.

---

## 📊 Data Models Added / Modified

### User (modified)
- `role` now includes `admin`
- New fields: `isActive`, `collectorStatus`, `collectorZone`, `vehicleType`, `totalPickups`

### CollectionRequest (modified)
- New fields: `priority` (`high|medium|low`), `adminNotes`, `assignedAt`

### AddressHierarchy (new)
- Manages Rwanda location hierarchy with collection schedules per zone

### WasteCategoryIntake (new)
- Tracks actual waste received: weight, volume, type, location, processing status

---

## 🔑 .env additions needed

No new env vars required for admin features.
Optional overrides for seeder:
```env
ADMIN_EMAIL=admin@greencare.rw
ADMIN_PASSWORD=GreenCare@2025!
```
