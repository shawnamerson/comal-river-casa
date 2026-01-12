# Comal River Casa - Booking Platform

A full-featured vacation rental booking platform built with Next.js 14, TypeScript, Prisma, and Stripe.

## Project Status

✅ **Phase 1 Complete**: Foundation & Project Setup
- Next.js 14 with TypeScript and Tailwind CSS initialized
- All dependencies installed
- Project directory structure created
- Prisma ORM configured with comprehensive database schema

## Tech Stack

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Payments**: Stripe
- **Email**: Resend
- **File Storage**: Cloudinary
- **Type-Safe APIs**: tRPC

## Getting Started

### 1. Database Setup

First, you need a PostgreSQL database. Choose one of these options:

#### Option A: Local PostgreSQL
Install PostgreSQL locally and create a database:
```bash
createdb condodb
```

#### Option B: Supabase (Recommended for Development)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Copy the connection string from Settings > Database

#### Option C: Railway
1. Go to [railway.app](https://railway.app)
2. Create a new project and add PostgreSQL
3. Copy the connection string

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database - Replace with your actual connection string
DATABASE_URL="postgresql://user:password@localhost:5432/condodb?schema=public"

# NextAuth - Generate secret with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Stripe (Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # We'll set this up later

# Email (Get from https://resend.com/api-keys)
RESEND_API_KEY="re_..."
EMAIL_FROM="bookings@yourdomain.com"

# Cloudinary (Get from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@yourdomain.com"

# Optional: Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### 3. Run Database Migrations

Apply the database schema:

```bash
npx prisma db push
```

### 4. Seed the Database

Populate with sample data (admin user, property, reviews):

```bash
npm run db:seed
```

**Default Credentials:**
- Admin: `admin@comalrivercasa.com` / `admin123`
- Guest: `guest@example.com` / `guest123`

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking

# Database commands
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio (database GUI)
```

## Project Structure

```
comal-river-casa/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   ├── (auth)/        # Auth pages (login, signup)
│   │   ├── (booking)/     # Booking flow pages
│   │   ├── (dashboard)/   # User dashboard
│   │   ├── admin/         # Admin dashboard
│   │   └── property/      # Property pages
│   ├── components/
│   │   ├── ui/            # UI components (shadcn)
│   │   ├── booking/       # Booking components
│   │   ├── property/      # Property components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── admin/         # Admin components
│   │   ├── reviews/       # Review components
│   │   └── emails/        # Email templates
│   ├── lib/
│   │   ├── db/            # Database client
│   │   ├── auth/          # Auth configuration
│   │   ├── stripe/        # Stripe integration
│   │   ├── email/         # Email utilities
│   │   ├── pricing/       # Pricing calculator
│   │   └── trpc/          # tRPC client/server
│   ├── server/            # tRPC routers
│   │   └── routers/
│   ├── types/             # TypeScript types
│   └── hooks/             # Custom React hooks
└── tests/
    ├── lib/               # Unit tests
    ├── integration/       # Integration tests
    └── e2e/               # E2E tests
```

## Database Schema

The database includes these main models:

- **User**: Authentication and user management
- **Property**: Property details, amenities, images
- **Booking**: Booking records with payment tracking
- **Review**: Guest reviews with ratings
- **SeasonalPrice**: Dynamic pricing by date range
- **BlockedDate**: Unavailable dates

See `prisma/schema.prisma` for the complete schema.

## Next Steps

### Immediate (Phase 2-3):
1. ✅ Configure NextAuth.js for authentication
2. ✅ Set up tRPC routers for type-safe APIs
3. ✅ Integrate Stripe for payments

### Short-term (Phase 4-8):
4. Build property display pages
5. Implement booking flow with calendar
6. Create user dashboard
7. Build admin dashboard
8. Set up email system

### Long-term (Phase 9-15):
9. Implement review system
10. Add automated tasks (reminders, etc.)
11. Write comprehensive tests
12. Deploy to production

## Development Workflow

1. Create a new branch for each feature
2. Make changes and test locally
3. Run type checking: `npm run type-check`
4. Run linting: `npm run lint`
5. Commit and push
6. Create pull request

## Database Management

### View Database
```bash
npm run db:studio
```

This opens Prisma Studio where you can view and edit data.

### Reset Database
```bash
npx prisma db push --force-reset
npm run db:seed
```

### Create Migration (for production)
```bash
npx prisma migrate dev --name your_migration_name
```

## External Services Setup

### Stripe
1. Create account at [stripe.com](https://stripe.com)
2. Get test API keys from Dashboard
3. Set up webhook endpoint (later phase)

### Resend
1. Create account at [resend.com](https://resend.com)
2. Verify your domain (or use resend.dev for testing)
3. Get API key

### Cloudinary
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get cloud name and API credentials
3. Configure upload presets (optional)

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database exists

### Prisma Issues
```bash
# Regenerate Prisma Client
npm run db:generate

# Reset and resync
npx prisma db push --force-reset
```

### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [tRPC Docs](https://trpc.io)
- [Stripe Docs](https://stripe.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## Implementation Plan

The full implementation plan is available at `.claude/plans/keen-sauteeing-cook.md`

It includes:
- Detailed phase-by-phase implementation guide
- Code examples for key features
- Best practices and patterns
- Deployment instructions
- Timeline estimates

## License

Private project - All rights reserved
