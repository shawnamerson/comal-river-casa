# Comal River Casa — Feature Documentation

## Booking System

### Guest Booking Flow
- Real-time availability calendar showing booked, blocked, and available dates
- Two-step booking: guest details, then Stripe payment
- Server-side price calculation (nightly rate x nights + cleaning fee + taxes)
- Dynamic pricing with per-date rate overrides and seasonal rates
- Configurable minimum/maximum night stays (global and per-date)
- 10-minute hold on pending bookings — auto-cancelled if payment not completed
- Atomic database transactions prevent double-booking race conditions
- Confirmation page with booking ID, dates, pricing summary, and next steps

### Guest Self-Service (`/manage-booking`)
- Look up booking by confirmation number + email
- View full booking details and pricing breakdown
- Cancel booking with automatic refund calculation
  - 5+ days before check-in: full refund
  - Within 5 days: 50% refund
- View any damage charges
- Submit a review (after checkout date has passed, one per booking)

---

## Payment Processing (Stripe)

- Stripe Elements integration for card payment
- Customer creation with card saved for future damage charges (`setup_future_usage: 'off_session'`)
- PaymentIntent reuse if guest returns to complete payment
- Webhook handling for `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- On success: booking confirmed, confirmation emails sent
- On failure: payment status updated
- On refund: booking cancelled, refund notification sent

---

## Damage Charges

- Admin can charge a guest's saved card after checkout for property damage
- Each charge creates a separate Stripe PaymentIntent
- Guest receives an email with charge amount and description
- Damage charges tracked per booking with Stripe payment status

---

## Pricing & Rates

- **Base rates**: nightly price, cleaning fee
- **Stay limits**: minimum and maximum nights (global defaults)
- **Per-date overrides**: custom price and/or minimum nights for specific dates or ranges
- **Tax rates**: multiple configurable tax rates (name, percentage, active/inactive)
- **Rate calendar**: visual 12-month calendar for managing overrides
- All pricing calculated server-side — guests cannot manipulate totals

---

## Availability Management

- **Manual blocking**: block single dates or date ranges with a reason
- **Intelligent unblocking**: splitting blocked ranges when individual dates are freed
- **12-month calendar view** with color coding:
  - Green = booked
  - Red = blocked
  - White = available
- Shows block reason (manual entry or synced from external calendar)

---

## External Calendar Sync

### Import (iCal)
- Add calendars from Airbnb, VRBO, Booking.com, or custom iCal URLs
- Auto-sync every hour via Vercel cron job
- Manual on-demand sync (single calendar or all)
- Synced events create blocked date ranges
- Sync status tracking with error messages
- Toggle calendars active/inactive

### Export (iCal)
- Shareable iCal feed URL at `/api/calendar/export`
- Includes all confirmed/pending bookings and blocked dates
- Token-based authentication
- Paste into Airbnb/VRBO to sync availability outward

---

## Reviews

- **Guest reviews**: submitted through `/manage-booking` after checkout
  - Star rating (1–5) and written comment
  - One review per booking, validated against booking email
- **External reviews**: admin can manually add Airbnb/VRBO reviews with backdating
- **Host responses**: admin can add/edit a response to any review
- **Publish control**: reviews can be published/unpublished for the homepage carousel
- **Homepage display**: published reviews shown in a carousel on the landing page

---

## Email Notifications (Resend + React Email)

| Email | Recipient | Trigger |
|---|---|---|
| Booking Confirmation | Guest | Payment succeeded |
| New Booking Notification | Admin | Payment succeeded |
| Booking Cancellation | Guest | Guest or admin cancels |
| Cancellation Notification | Admin | Guest or admin cancels |
| Damage Charge | Guest | Admin charges for damages |
| Booking Expired (Recovery) | Guest | Pending booking expires without payment |

All emails are React components with responsive HTML styling.

---

## Admin Dashboard (`/admin`)

### Overview
- Stats cards: total bookings, upcoming, current, pending, net revenue
- Upcoming bookings list with quick status changes
- Change password modal

### Bookings (`/admin/bookings`)
- List all active bookings (excludes cancelled and expired-pending)
- Booking detail view with full pricing breakdown, payment info, Stripe ID
- Actions: mark completed, cancel, charge for damages
- Damage charge history per booking

### Availability (`/admin/availability`)
- 12-month interactive calendar
- Block/unblock dates (single or range mode)
- View upcoming and past blocked periods

### Rates (`/admin/rates`)
- Edit base rates (nightly price, cleaning fee, min/max nights)
- Manage tax rates (add, edit, activate/deactivate, delete)
- Rate override calendar (set custom prices and min-nights per date)

### Calendar Sync (`/admin/calendars`)
- Add/edit/delete external calendar connections
- Manual sync with status display
- Copy iCal export URL for external platforms

### Reviews (`/admin/reviews`)
- View all reviews across sources (direct, Airbnb, VRBO)
- Add external reviews manually
- Publish/unpublish, respond, delete

### Accounting (`/admin/accounting`)
- Summary cards: booking income, taxes collected, refunds, damage charges, net revenue
- Transaction ledger with running balance
- Date range filtering
- CSV export (date, type, guest, description, amount, balance, booking ID)

---

## Scheduled Jobs (Vercel Cron)

| Job | Schedule | What it does |
|---|---|---|
| Expire Bookings | Every 5 minutes | Cancels pending bookings older than 10 minutes, sends recovery emails |
| Sync Calendars | Every hour | Fetches iCal feeds from external platforms, updates blocked dates |

Both routes are protected with `Bearer $CRON_SECRET` authentication.

---

## Security

- **Authentication**: NextAuth v5 with credentials provider (admin only)
- **Rate limiting**: 10 login attempts per 15 minutes per IP (Upstash Redis)
- **Password hashing**: bcrypt
- **Security headers**: configured in middleware
- **Audit logging**: all admin actions recorded (booking changes, damage charges, password changes)
- **Atomic transactions**: serializable isolation for booking creation
- **Server-side validation**: Zod schemas on all tRPC inputs
- **Webhook verification**: Stripe signature validation
- **Calendar export auth**: token-based access

---

## Public Pages

| Page | Path | Description |
|---|---|---|
| Homepage | `/` | Property showcase, photo gallery, reviews, booking calendar |
| Booking | `/booking` | Guest booking form with Stripe payment |
| Confirmation | `/booking/confirmation` | Post-payment confirmation with details |
| Manage Booking | `/manage-booking` | Guest self-service (lookup, cancel, review) |
| Terms of Service | `/policies/terms` | Legal terms |
| Cancellation Policy | `/policies/cancellation` | Refund policy details |
| House Rules | `/policies/house-rules` | Guest rules and expectations |
| Login | `/login` | Admin login |
