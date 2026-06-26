# GreenCare Rwanda — API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

## 🔐 Auth (existing)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register resident/collector/business |
| POST | `/auth/verify-otp` | Verify OTP sent to email |
| POST | `/auth/resend-otp` | Resend OTP |
| POST | `/auth/login` | Login and receive JWT token |

---

## ♻️ Waste Scanning (`/api/waste`)

> All routes: `resident` role only

### POST `/waste/scan`
Upload a base64 image — Gemini 2.5 Flash classifies the waste and recommends the correct bin.

**Request Body:**
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ...",
  "mimeType": "image/jpeg"
}
```
`mimeType` defaults to `image/jpeg` if omitted. Supported: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.

**Response:**
```json
{
  "success": true,
  "data": {
    "scanId": "64abc...",
    "wasteType": "organic",
    "confidence": 92,
    "detectedItems": ["banana peel", "vegetable scraps"],
    "recommendation": "Place in the Green bin (Organic Section)",
    "binColor": "green",
    "binLabel": "Organic Section",
    "reasoning": "These are biodegradable food scraps...",
    "tips": "Consider composting for garden use.",
    "pointsEarned": 5
  }
}
```

### GET `/waste/history?page=1&limit=10`
Returns the resident's scan history.

### GET `/waste/scan/:id`
Get a single scan record by ID.

---

## 🚛 Collection (`/api/collection`)

> All routes: `resident` role only

### POST `/collection/request`
Submit a new collection request.

**Request Body:**
```json
{
  "wasteType": "organic",
  "quantity": "medium",
  "description": "Kitchen and garden waste from the week",
  "preferredDate": "2025-07-10",
  "preferredTimeSlot": "morning",
  "location": {
    "province": "Kigali",
    "district": "Gasabo",
    "sector": "Kimironko",
    "street": "KG 123 St"
  },
  "wasteScanId": "64abc..."
}
```

- `wasteType`: `organic | inorganic | mixed | hazardous | recyclable`
- `quantity`: `small | medium | large`
- `preferredTimeSlot`: `morning | afternoon | evening`
- `location` is optional — falls back to profile location
- `wasteScanId` is optional — links to an earlier scan

### GET `/collection/my-requests?status=pending&page=1&limit=10`
View your collection requests. Filter by `status`: `pending | assigned | in_progress | completed | cancelled`.

### GET `/collection/request/:id`
Get a single collection request with collector info.

### PATCH `/collection/request/:id/cancel`
Cancel a `pending` or `assigned` request.

### POST `/collection/request/:id/confirm`
Confirm a collection was completed (status must be `in_progress`).  
Awards points: small=10pts, medium=20pts, large=30pts.

**Response:**
```json
{
  "success": true,
  "message": "Collection confirmed! Thank you for keeping Rwanda clean.",
  "data": {
    "request": { ... },
    "pointsEarned": 20
  }
}
```

### GET `/collection/schedules?district=Gasabo&sector=Kimironko&page=1&limit=10`
View upcoming scheduled collections in your zone. Defaults to your profile location if no query params provided.

### GET `/collection/schedule/:id`
Get a single schedule detail.

---

## 🎟️ Coupons (`/api/coupons`)

> All routes: `resident` role only

### GET `/coupons?category=food&page=1&limit=10`
Browse available coupons. `canClaim` flag tells the frontend if the user has enough points.

Categories: `food | transport | utilities | shopping | health | other`

**Response:**
```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "_id": "64abc...",
        "title": "10% off at EcoMart",
        "description": "Discount on groceries at EcoMart Kigali",
        "pointsRequired": 50,
        "discountValue": 10,
        "discountType": "percentage",
        "partner": "EcoMart",
        "category": "shopping",
        "expiresAt": "2025-12-31",
        "canClaim": true
      }
    ],
    "userPoints": 120,
    "pagination": { ... }
  }
}
```

### POST `/coupons/:id/claim`
Claim a coupon. Deducts points and issues a unique redemption code.

**Response:**
```json
{
  "success": true,
  "message": "Coupon claimed successfully! Use code GC-A1B2C3D4 at EcoMart.",
  "data": {
    "couponCode": "GC-A1B2C3D4",
    "title": "10% off at EcoMart",
    "discountValue": 10,
    "discountType": "percentage",
    "partner": "EcoMart",
    "expiresAt": "2025-12-31",
    "pointsSpent": 50
  }
}
```

### GET `/coupons/my-coupons?status=active&page=1&limit=10`
View your claimed coupons. Statuses: `active | used | expired`.

---

## 🏆 Leaderboard (`/api/leaderboard`)

> All routes: `resident` role only

### GET `/leaderboard?scope=global&limit=20`
View the top residents ranked by total points earned.

- `scope`: `global` (default) or `district`
- `district`: required when `scope=district` (e.g. `?scope=district&district=Gasabo`)

**Response:**
```json
{
  "success": true,
  "data": {
    "scope": "global",
    "leaderboard": [
      {
        "rank": 1,
        "fullName": "Alice Uwase",
        "district": "Gasabo",
        "totalPointsEarned": 450,
        "currentPoints": 200,
        "totalWasteScans": 30,
        "totalCollections": 15
      }
    ],
    "myRank": {
      "rank": 5,
      "totalPointsEarned": 120,
      "currentPoints": 70,
      "totalWasteScans": 10,
      "totalCollections": 4
    },
    "totalParticipants": 240
  }
}
```

### GET `/leaderboard/my-stats`
Get full personal stats: rank, points history, recent activity.

---

## 📊 Points System

| Action | Points Earned |
|--------|---------------|
| Waste scan (any) | +5 pts |
| Confirm small collection | +10 pts |
| Confirm medium collection | +20 pts |
| Confirm large collection | +30 pts |
| Claim coupon | -N pts (coupon cost) |

---

## 🔑 Environment Variables

Add to your `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
Get your key at: https://aistudio.google.com/app/apikey
