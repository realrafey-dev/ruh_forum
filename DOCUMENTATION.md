# RUH Forum – Complete System Overview

A fully dynamic, custom-built Islamic Donation Management System. Every feature is built from scratch with clean coding — no drag-and-drop builders, no readymade templates. 100% hand-coded, fully responsive, and database-driven.

---

## What You Can Do With This System

### 👥 User Management
- **User Registration** with password setup (auto-login after register)
- **Login / Logout** with persistent session (user stays logged in until manual logout)
- **Forgot Password** with email reset link (secure token-based system)
- **Change Password** from within the dashboard

### 💰 Donations
- **Direct Donations** – Users can donate directly to the platform
- **Trust Donations** – Donate to a specific trust fund
- **Campaign Donations** – Donate to a specific campaign
- **Guest Donations** – Users can donate without creating an account
- **Anonymous Donations** – Option to hide donor name in public lists
- **Zakat Donations** – Flag donations as Zakat for separate tracking
- **Bank Transfer Details** displayed on all donation pages (Faysal Bank)
- **Screenshot Upload** – Users upload payment proof (image file)
- **Donation History** – Every user can view their past donations with status

### 🤝 Trusts (Sadaqah-e-Jariyah)
- **Create Trust** – Users can create trust funds in memory of loved ones
- **Add Photo & Description** – Personalize each trust
- **Set Target Amount** – Fundraising goal for each trust
- **Track Progress** – Progress bar shows how much has been raised
- **Public Trust Listing** – All active trusts visible to everyone
- **Trust Detail Page** – Shows full info, progress, and donors list

### 📢 Campaigns
- **Admin creates campaigns** with categories (General, Education, Health, Emergency, Masjid)
- **Active Campaigns** displayed on homepage and campaigns page
- **Campaign Detail Page** with progress tracking and donor list
- **Set Target & Dates** – Campaign duration and fundraising goal

### 🧮 Zakat Calculator
- Input fields for gold (tola/grams), silver, cash, business assets, property
- **Automatic Nisab check** (based on 85g gold threshold)
- **Instant calculation** of 2.5% Zakat due
- One-click link to donate the calculated amount

### 📊 User Dashboard
- **Personal Stats** – Total donations made, total amount donated, trusts created
- **Recent Donations Table** with status badges (pending / verified / rejected)
- **Quick Actions** – Donate, Create Trust, View Trusts, Zakat Calculator, Change Password

### 🛡️ Admin Panel
- **Admin Dashboard** – Full statistics: donations count, total amount (verified only), users, trusts
- **Donation Verification** – Review screenshots, approve or reject donations
- **Trust & Campaign amounts auto-update** on approval
- **Create Campaigns** from admin panel
- **Manage Admins** – Add new admins by email, view all admins list
- **Recent Donations** displayed on dashboard

### 📧 Email System
- **Welcome Email** sent on registration (with account details)
- **Donation Receipt Email** sent on every donation
- **Password Reset Email** with secure reset link
- **Smart Email Queue** – Emails are stored in database and can be sent anytime

### 🔐 Security & Reliability
- **Password hashing** with bcrypt (industry standard)
- **Secure session management** with encrypted cookies
- **Token-based password reset** (expires after 1 hour)
- **Admin-only areas** protected by separate admin database table
- **No plain-text passwords** stored anywhere

### 📱 Responsive Design
- Works perfectly on **mobile, tablet, and desktop**
- **Navigation menu** collapses on small screens
- **Forms and tables** fully responsive
- **Islamic theme** with custom color scheme (green & gold)
- Arabic font support for Quranic verses

---

## Tech Highlights

| Feature | Details |
|---------|---------|
| **Frontend** | Pure JavaScript, CSS, EJS templates |
| **Database** | MySQL – fully normalized, 7 tables |
| **Responsive** | Yes – mobile, tablet, desktop |
| **Code Type** | 100% hand-coded, no builders |
| **Dynamic** | All content from database, fully customizable |

---

## How the System Works (Simple Flow)

1. **User registers** → Gets instant access to dashboard
2. **User donates** → Transfers money to bank account → Uploads screenshot on website
3. **Admin reviews** donation → Approves or rejects after verifying bank transfer
4. **Amount updates** automatically on trust/campaign progress bars
5. **User can track** donation status anytime from their dashboard

---

## Key Pages

| Page | Purpose |
|------|---------|
| Home | Welcome, stats, featured campaigns |
| Register | Create new account |
| Login | Sign in to account |
| Forgot Password | Reset password via email |
| Donate | Make a donation + upload payment proof |
| Trusts | View all trusts, create new trust |
| Campaigns | View active campaigns |
| Zakat Calculator | Calculate your Zakat |
| Dashboard | User's personal area |
| Admin Panel | Manage everything |
| Donation History | View past donations |

---

*Built with ❤️ for the RUH Forum team.*
