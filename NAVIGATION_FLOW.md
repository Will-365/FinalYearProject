# Green Care Rwanda - Navigation Flow Documentation

## Application Structure & Routing

### Complete User Journey Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    LANDING PAGE                             │
│                    (LandingPage.tsx)                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Navbar (Fixed)                                        │  │
│  │ - Home | Vision | Features | Testimonials            │  │
│  │ - "Get Started" Button                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Hero Section                                          │  │
│  │ - Auto-sliding image carousel (4 images)             │  │
│  │ - Continuous animation (5s interval)                 │  │
│  │ - Manual navigation (prev/next buttons)              │  │
│  │ - "Get Started Today" CTA                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Stats Section                                         │  │
│  │ - 50K+ Active Users | 2M kg Recycled                 │  │
│  │ - 98% Satisfaction | 1,200+ Trees Planted            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Vision Section                                        │  │
│  │ - Our Mission | Our Values | Our Impact              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Features Section                                      │  │
│  │ - Smart Collection | Rewards | Community | Analytics│  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Testimonials Section                                  │  │
│  │ - 3 user testimonials with ratings                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Call-to-Action Section                               │  │
│  │ - "Ready to Make a Difference?"                      │  │
│  │ - "Start Your Journey" Button                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Footer                                                │  │
│  │ - Company Info | Quick Links | Contact | Social      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Click "Get Started"
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    LOGIN PAGE                               │
│                    (Login.tsx)                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Green Care Rwanda Logo & Title                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Login / Sign Up Tabs                                  │  │
│  │                                                        │  │
│  │ Login Tab:                                            │  │
│  │  - Email                                              │  │
│  │  - Password                                           │  │
│  │  - Role Selection (Resident/Collector/Admin/Partner) │  │
│  │  - Remember Me                                        │  │
│  │  - "Login" Button                                     │  │
│  │  - Forgot Password Link                               │  │
│  │                                                        │  │
│  │ Sign Up Tab:                                          │  │
│  │  - Full Name, Email, Phone, Address                  │  │
│  │  - National ID Number                                 │  │
│  │  - Role Selection                                     │  │
│  │  - Password                                           │  │
│  │  - Terms Agreement                                    │  │
│  │  - "Create Account" Button                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ "← Back to Home" Link                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Successful Login
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              MAIN APPLICATION DASHBOARD                     │
│              (App.tsx - Authenticated State)                │
│                                                             │
│  ┌───────────┬─────────────────────────────────────────┐   │
│  │           │                                         │   │
│  │  SIDEBAR  │         MAIN CONTENT AREA               │   │
│  │           │                                         │   │
│  │  Logo     │  ┌───────────────────────────────────┐  │   │
│  │  User     │  │ Header (Top Navigation Bar)       │  │   │
│  │  Info     │  │ - Mobile Menu | Logo | Notifications│  │
│  │           │  └───────────────────────────────────┘  │   │
│  │  ┌─────┐  │                                         │   │
│  │  │Menu │  │  ┌───────────────────────────────────┐  │   │
│  │  │Items│  │  │                                   │  │   │
│  │  │     │  │  │    DYNAMIC PAGE CONTENT           │  │   │
│  │  │  1  │  │  │    (Based on Navigation)          │  │   │
│  │  │  2  │  │  │                                   │  │   │
│  │  │  3  │  │  │    - Overview                     │  │   │
│  │  │  4  │  │  │    - Dashboard                    │  │   │
│  │  │  5  │  │  │    - Collections                  │  │   │
│  │  │  6  │  │  │    - Recycling                    │  │   │
│  │  │  7  │  │  │    - Community                    │  │   │
│  │  │  8  │  │  │    - Circular Economy             │  │   │
│  │  │  9  │  │  │    - Analytics                    │  │   │
│  │  │  10 │  │  │    - Profile                      │  │   │
│  │  │  11 │  │  │    - Audit & Compliance           │  │   │
│  │  │  12 │  │  │    - Mobile Collector App         │  │   │
│  │  └─────┘  │  │    - Incentive & Rewards          │  │   │
│  │           │  │    - Notifications Hub            │  │   │
│  │  Logout   │  │                                   │  │   │
│  │  Button   │  └───────────────────────────────────┘  │   │
│  │           │                                         │   │
│  └───────────┴─────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Navigation Hierarchy

### 1. Landing Page (Public)
**Route:** Initial page load
**Features:**
- Fixed navbar with smooth scroll navigation
- Auto-sliding hero images (4 images, 5-second intervals)
- Stats showcase
- Vision & mission statements
- Feature highlights
- User testimonials
- Footer with contact info

**Actions:**
- Click "Get Started" → Navigate to Login
- Click navbar items → Smooth scroll to sections
- Click footer links → Scroll to sections

---

### 2. Login/Sign Up Page (Public)
**Route:** After clicking "Get Started" from landing page
**Features:**
- Tabbed interface (Login / Sign Up)
- Role-based authentication
- Form validation
- Back to home option

**Actions:**
- Submit login → Navigate to Main App (Overview)
- Click "Back to Home" → Return to Landing Page
- Switch tabs → Toggle between Login/Sign Up

---

### 3. Main Application (Authenticated)
**Route:** After successful login
**Features:**
- Persistent sidebar navigation (12 modules)
- Role-based user info display
- Mobile-responsive menu
- Real-time notifications badge

**Navigation Menu:**

1. **Overview** (Home icon)
   - Dashboard summary
   - Quick access cards to all modules

2. **Dashboard** (LayoutDashboard icon)
   - Waste collection metrics
   - Real-time statistics
   - Performance charts

3. **Collections** (Truck icon)
   - Schedule management
   - Route optimization
   - Collection history
   - Requests management

4. **Recycling** (Package icon)
   - Recycling centers
   - Material tracking
   - Points system
   - Performance metrics

5. **Community** (Users icon)
   - Social feed
   - Events calendar
   - Educational content
   - Leaderboards

6. **Circular Economy** (TrendingUp icon)
   - Material flow tracking
   - Marketplace
   - Impact metrics
   - Sustainability reports

7. **Analytics** (Link2 icon)
   - Environmental impact
   - Operational analytics
   - Custom reports
   - Data export

8. **Profile** (User icon)
   - User settings
   - Notification preferences
   - Activity history
   - Account management

9. **Audit & Compliance** (Shield icon)
   - Compliance checklist
   - Audit trail
   - Document repository
   - Incident reporting
   - Certificates tracking

10. **Mobile Collector App** (Smartphone icon)
    - Route management
    - QR/barcode scanner
    - Collection stops
    - Offline mode
    - Mobile wallet
    - Photo verification

11. **Incentive & Rewards** (Gift icon)
    - Points dashboard
    - Reward catalog
    - Achievement system
    - Referral program
    - Transaction history
    - Redemption interface

12. **Notifications Hub** (Bell icon)
    - Unified inbox
    - Quick actions
    - Dashboard widgets
    - Alert preferences
    - Activity feed
    - Tutorial guides

**Actions:**
- Click menu item → Load corresponding module
- Click "Logout" → Return to Landing Page
- Click notification bell → View alerts

---

## State Management Flow

```
App State:
├── showLanding (Boolean)
│   ├── true → Display LandingPage
│   └── false → Check authentication
│
├── isLoggedIn (Boolean)
│   ├── false → Display Login
│   └── true → Display Main App
│
├── userRole (String)
│   └── 'resident' | 'collector' | 'admin' | 'partner'
│
└── currentPage (String)
    └── 'overview' | 'dashboard' | 'collection' | ... (12 options)
```

## Component Architecture

```
App.tsx (Root)
├── LandingPage.tsx
│   ├── Navbar (Fixed, with smooth scroll)
│   ├── HeroSection (Auto-sliding images)
│   ├── StatsSection
│   ├── VisionSection
│   ├── FeaturesSection
│   ├── TestimonialsSection
│   ├── CTASection
│   └── Footer
│
├── Login.tsx
│   ├── LoginForm (Tab 1)
│   ├── SignUpForm (Tab 2)
│   └── BackToHomeButton
│
└── Main Application Layout
    ├── Sidebar
    │   ├── Logo & Branding
    │   ├── User Info Card
    │   ├── Navigation Menu (12 items)
    │   └── Logout Button
    │
    └── Content Area
        ├── Header
        │   ├── Mobile Menu Toggle
        │   ├── Logo (Mobile)
        │   └── Notifications Badge
        │
        └── Dynamic Page Content
            ├── Overview.tsx
            ├── Dashboard.tsx
            ├── CollectionManagement.tsx
            ├── RecyclingModule.tsx
            ├── CommunityEngagement.tsx
            ├── CircularEconomy.tsx
            ├── AnalyticsReporting.tsx
            ├── UserProfile.tsx
            ├── AuditCompliance.tsx
            ├── MobileCollectorApp.tsx
            ├── IncentiveReward.tsx
            └── NotificationHub.tsx
```

## Animation & Interaction Details

### Landing Page Hero Slider
- **Auto-play:** 5-second interval
- **Transition:** Smooth fade with scale animation
- **Controls:** Dot indicators + Previous/Next buttons
- **Images:** 4 project-relevant images
- **Content:** Dynamic title and subtitle per slide

### Navigation
- **Smooth Scroll:** All landing page sections
- **Hover Effects:** All interactive elements
- **Mobile Menu:** Slide-in animation
- **Page Transitions:** Instant switching in main app

### Responsive Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

## User Roles & Access

All roles have access to all modules, with content potentially filtered based on role:
- **Resident:** Full access to collection scheduling, rewards, community
- **Collector:** Enhanced mobile app features, route optimization
- **Admin:** Full system access, compliance, analytics
- **Partner:** Marketplace, circular economy, analytics

## Next Steps for Development

1. **Backend Integration**
   - Connect to Supabase for authentication
   - Implement real API endpoints
   - Add real-time data sync

2. **Enhanced Features**
   - Real QR code scanning
   - Actual payment integration
   - Live GPS tracking
   - Push notifications

3. **Performance Optimization**
   - Image lazy loading
   - Code splitting by route
   - Service worker for offline mode

4. **Testing**
   - Unit tests for components
   - E2E testing for user flows
   - Mobile device testing

---

**Built with:** React, TypeScript, Tailwind CSS, Motion (Framer Motion), shadcn/ui components
**Last Updated:** January 20, 2026
