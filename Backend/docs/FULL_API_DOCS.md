# GreenCare Rwanda — Complete API Documentation

**Base URL:** `http://localhost:5000/api`  
**Auth Header:** `Authorization: Bearer <token>` (on all protected routes)

---

## 🚀 Quick Start

```bash
# Seed database (run once)
node scripts/seedAdmin.js --all

# Default credentials
Admin:      admin@greencare.rw  /  GreenCare@2025!
Demo Buyer: +250788999888       /  buyer123
```

---

## 👥 BUYER AUTH  `/api/buyers`

Buyers are public users — no email, no OTP, no national ID. Just name + phone + password.

### POST `/api/buyers/register`
```json
{ "fullName": "Eric Mugisha", "phone": "+250788123456", "password": "mypass123",
  "preferredDistrict": "Gasabo", "preferredSector": "Remera" }
```
Returns: `{ token, buyer: { id, fullName, phone, role:'buyer', ... } }`

### POST `/api/buyers/login`
```json
{ "phone": "+250788123456", "password": "mypass123" }
```
Returns: `{ token, buyer }`

### GET `/api/buyers/me`  🔒 buyer
Returns full buyer profile.

### PUT `/api/buyers/me`  🔒 buyer
Update fullName, preferredDistrict, preferredSector.

### POST `/api/buyers/forgot-password`
```json
{ "phone": "+250788123456" }
```
Returns OTP in `devOtp` field (dev mode only). Integrate SMS in production.

### POST `/api/buyers/reset-password`
```json
{ "phone": "+250788123456", "otp": "123456", "newPassword": "newpass123" }
```

---

## 🛍️ PRODUCTS  `/api/products`

**All product routes are PUBLIC** — no login required to browse.

### GET `/api/products`
Browse available products. Query params:
- `category` — eco_product | recycled_goods | compost | pavers | upcycled | service | voucher
- `wasteType` — organic | inorganic | recyclable | mixed | plastic | paper | glass | metal
- `search` — full-text search (name, description, tags)
- `featured=true` — featured products only
- `minPrice`, `maxPrice` — cash price range (RWF)
- `minPoints`, `maxPoints` — points cost range
- `inStock=true` (default) | `all` — include out-of-stock
- `sortBy` — createdAt (default) | cashPrice | pointsCost | totalSold
- `sortOrder` — desc (default) | asc
- `page`, `limit`

If called as authenticated resident → response includes `userPoints` (their balance).

### GET `/api/products/:id`
Single product detail. Includes `userPoints` if resident.

### POST `/api/products/:id/buy`
Place an order. Works for residents, registered buyers, AND unauthenticated guests.

**Resident (points):**
```json
{ "paymentMethod": "points", "quantity": 2, "deliveryNote": "Leave at gate" }
```

**Resident or Buyer (mobile money):**
```json
{ "paymentMethod": "mobile_money", "quantity": 1, "mobileMoneyPhone": "+250788123456",
  "deliveryAddress": { "district": "Gasabo", "sector": "Remera", "street": "KG 5 Ave" } }
```

**Buyer (cash):**
```json
{ "paymentMethod": "cash", "quantity": 1, "deliveryNote": "Call on arrival" }
```

**Guest (no account):**
```json
{ "paymentMethod": "cash", "buyerName": "Alice Uwase", "buyerPhone": "+250788000111",
  "quantity": 1 }
```

Returns: `{ order, remainingPoints? }`

### GET `/api/products/orders/mine`  🔒 resident | buyer
View my orders. Query: `status`, `page`, `limit`

### PATCH `/api/products/orders/:id/cancel`  🔒 resident | buyer
Cancel a pending order. Refunds points if payment was by points.
```json
{ "reason": "Changed my mind" }
```

---

## ♻️ WASTE-TO-PRODUCT PIPELINE

### Overview

```
Collection Request
        ↓
  [Collector completes pickup]
  → WasteCategoryIntake auto-created (processingStatus: 'received')
  → If discrepancy found → hasDiscrepancy: true, discrepancyNote set
        ↓
  [Admin advances through pipeline stages]
  PATCH /api/admin/waste-intake/:id/stage
  received → sorting → curing → forming → packaging
        ↓
  [Admin converts packaging stage to product]
  POST /api/admin/waste-intake/:id/convert-to-product
  → Uploads image, sets name, price, quantity
  → Product created → visible in shop
        ↓
  [Buyers purchase products]
  POST /api/products/:id/buy
```

---

## 🔧 ADMIN — WASTE INTAKE  `/api/admin/waste-intake`

All routes: 🔒 admin

### GET `/api/admin/waste-intake/analytics?period=30d&district=Gasabo`
Returns: totals, byCategory (weight per type), byDistrict, trend (daily), pipelineStages, pendingDiscrepancies count.
Period options: `7d | 30d | 90d | 365d`

### GET `/api/admin/waste-intake/discrepancies?resolved=false`
All records with quantity discrepancies reported by collectors.
Shows: declared quantity, actual weight, collector's note, collection request, resident info.

### GET `/api/admin/waste-intake`
Full paginated log. Filters: `wasteType`, `district`, `processingStatus`, `hasDiscrepancy`, `dateFrom`, `dateTo`

### POST `/api/admin/waste-intake`
Manually log a waste intake record.
```json
{ "wasteType": "organic", "weightKg": 25.5, "location": { "district": "Gasabo" },
  "collectionRequestId": "...", "processingStatus": "received", "notes": "..." }
```

### PATCH `/api/admin/waste-intake/:id/stage`
Advance a waste batch through the pipeline.
```json
{ "stage": "curing", "note": "Batch moved to curing facility on Block C" }
```
Valid stages (in order): `received → sorting → curing → forming → packaging → product`
- Cannot go backwards
- Response includes `nextStage`

### POST `/api/admin/waste-intake/:id/convert-to-product`
**The key endpoint.** Converts a waste batch at `packaging` stage into a sellable product.

⚠️ The waste record MUST be at `packaging` stage before this can be called.
At least one image is required.

```json
{
  "name": "Recycled Plastic Chair",
  "description": "Sturdy chair made from 12kg of compressed plastic waste.",
  "category": "recycled_goods",
  "pointsCost": 150,
  "cashPrice": 6000,
  "phonePrice": 6000,
  "stock": 8,
  "unit": "piece",
  "imageUrl": "data:image/jpeg;base64,/9j/4AAQ...",
  "images": ["data:image/jpeg;base64,...", "https://example.com/img2.jpg"],
  "thumbnailUrl": "data:image/jpeg;base64,...",
  "partner": "EcoMake Rwanda",
  "tags": ["chair", "plastic", "furniture"],
  "isFeatured": true
}
```
Returns: `{ product, intakeRecord, pipelineSummary }`
Automatically notifies all active residents about the new product.

### PATCH `/api/admin/waste-intake/:id/resolve-discrepancy`
Admin resolves a collector-reported quantity discrepancy and awards adjusted points.

```json
{
  "resolution": "award_less",
  "pointsOverride": 7,
  "adminNote": "Actual weight was 3kg vs declared medium (22kg). Awarding reduced points."
}
```
`resolution` values:
- `award_full` — award full points for the declared quantity
- `award_less` — award reduced points (50% default, or `pointsOverride`)
- `award_more` — award bonus points (125% default, or `pointsOverride`)
- `no_change` — no points awarded, just close the discrepancy

Returns: `{ resolution, pointsAwarded, residentName, intake }`

---

## 🔧 ADMIN — CATALOG  `/api/admin/catalog`

### GET `/api/admin/catalog/products`
Full product list (including inactive). Filters: `category`, `isActive`, `wasteType`, `inStock`, `search`, `page`, `limit`
Response includes `lowStockAlerts` array.

### POST `/api/admin/catalog/products`
Create product manually (not from waste pipeline). Requires `imageUrl` or `images`.
```json
{
  "name": "Eco Tote Bag",
  "category": "recycled_goods",
  "wasteType": "recyclable",
  "pointsCost": 80,
  "cashPrice": 3500,
  "stock": 20,
  "unit": "piece",
  "imageUrl": "https://example.com/tote.jpg",
  "images": ["https://example.com/tote.jpg", "https://example.com/tote2.jpg"],
  "partner": "EcoMake Rwanda",
  "tags": ["bag", "eco"]
}
```

### GET `/api/admin/catalog/products/:id`
Single product with order stats breakdown.

### PUT `/api/admin/catalog/products/:id`
Update any product field.

### PATCH `/api/admin/catalog/products/:id/stock`
```json
{ "adjustment": -5, "reason": "Damaged in storage" }
{ "adjustment": 10, "reason": "New batch arrived" }
```

### DELETE `/api/admin/catalog/products/:id`
Soft delete. Blocked if active orders exist.

### GET `/api/admin/catalog/orders`
All orders. Filters: `status`, `paymentMethod`, `search`, `dateFrom`, `dateTo`, `page`, `limit`
Response includes `statusSummary` (count + revenue per status).

### PATCH `/api/admin/catalog/orders/:id/status`
```json
{ "status": "fulfilled", "trackingNote": "Delivered by Amahoro Delivery at 10am" }
{ "status": "cancelled", "cancelReason": "Product out of stock" }
```
Status flow: `pending → confirmed → processing → ready → fulfilled`
On cancel: stock restored, points refunded automatically.

### GET `/api/admin/catalog/buyers`
All registered buyers. Filters: `search`, `isActive`, `page`, `limit`
Each buyer includes `orderCount`.

### PATCH `/api/admin/catalog/buyers/:id/toggle`
Activate or deactivate a buyer account.

---

## 🔧 ADMIN — COLLECTIONS  `/api/admin/collections`

### GET `/api/admin/collections/summary`
Dashboard stats: byStatus, byPriority, byWasteType, dailyTrend (7 days), pendingApproval count.

### GET `/api/admin/collections`
Full filtered list. Key params:
- `pendingApproval=true` — completed but not yet approved (needs points award)
- `unassigned=true` — not yet assigned to a collector
- `status`, `priority`, `wasteType`, `district`, `collectorId`, `search`, `dateFrom`, `dateTo`

### POST `/api/admin/collections/:id/approve`
**Award points to resident** after verifying collection is complete.
⚠️ Blocked if an unresolved discrepancy exists — resolve via waste-intake route first.

Returns: `{ pointsAwarded, base, bonus, resident }`
- base: small=10, medium=20, large=30
- bonus: +5 for organic waste

### POST `/api/admin/collections/:id/assign`
```json
{ "collectorId": "...", "scheduledDate": "2025-07-15T08:00:00Z", "collectionNote": "Large bins at rear gate" }
```

### PATCH `/api/admin/collections/:id/priority`
```json
{ "priority": "high", "adminNotes": "Elderly resident, urgent" }
```

### PATCH `/api/admin/collections/:id/status`
Force status update. On `in_progress` → notifies resident.

---

## 🚛 COLLECTOR  `/api/collector`  🔒 collector

### PATCH `/api/collector/pickups/:id/status`
Update pickup status. When completing, optionally report a discrepancy:
```json
{
  "status": "completed",
  "collectionNote": "Gate was locked, resident let us in",
  "hasDiscrepancy": true,
  "actualWeightKg": 3.5,
  "discrepancyNote": "Resident declared 'medium' (~22kg) but actual waste was about 3.5kg — much less than expected."
}
```
When `hasDiscrepancy: true`:
- Waste intake record is created with `hasDiscrepancy: true`
- Admin is notified with ⚠️ flag
- Admin must resolve via `PATCH /api/admin/waste-intake/:id/resolve-discrepancy` before approving points

---

## 🔐 RESIDENT AUTH  `/api/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register resident (requires OTP verification) |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/login` | Login → returns token |
| POST | `/api/auth/forgot-password` | Request reset OTP |
| POST | `/api/auth/reset-password` | Reset with OTP |

---

## 📊 POINTS FLOW

```
❌ Scan waste         → 0 pts  (scan = classification only)
❌ Resident confirms  → 0 pts  (just a flag: residentConfirmed)
✅ Admin approves     → +pts   (small=10, medium=20, large=30, organic bonus=+5)
✅ Discrepancy resolved → admin decides exact points
❌ Buy with cash      → 0 pts change
❌ Buy with M-Money   → 0 pts change
✅ Buy with points    → -N pts deducted
```

---

## 🖼️ IMAGE HANDLING

Images are stored as base64 strings OR external URLs in the `imageUrl` and `images` fields.

**Sending a base64 image:**
```json
{
  "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "images":   ["data:image/jpeg;base64,...", "data:image/png;base64,..."]
}
```

**Sending a URL:**
```json
{
  "imageUrl": "https://storage.example.com/products/chair.jpg"
}
```

The server stores whatever string is provided — no file upload middleware needed.
For production, upload to cloud storage (S3, Cloudinary, Firebase) first, then send the URL.

---

## 🌿 .env Reference

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/greencare
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
EMAIL_USER=your_gmail@gmail.com
EMAIL_APP_PASSWORD=your_app_password
EMAIL_FROM=GreenCare Rwanda <your_gmail@gmail.com>
CLIENT_URL=http://localhost:5173
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key
ADMIN_EMAIL=admin@greencare.rw
ADMIN_PASSWORD=GreenCare@2025!
```
