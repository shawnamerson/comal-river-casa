# Database Setup Guide

## Option 1: Supabase (Recommended - Easiest)

### Step-by-Step:

1. **Create Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up with GitHub or email (free, no credit card)

2. **Create Project**
   - Click "New project"
   - Name: `comal-river-casa`
   - Database Password: Choose a strong password (save it!)
   - Region: Select closest to you
   - Click "Create new project" (takes ~2 minutes)

3. **Get Connection String**
   - Once project is ready, click "Connect"
   - Select "Connection string" tab
   - Choose "URI" format
   - Copy the string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@...`)
   - Replace `[YOUR-PASSWORD]` with your actual password

4. **Add to Environment Variables**
   - Create `.env.local` in project root
   - Add: `DATABASE_URL="your-connection-string-here"`
   - Add: `NEXTAUTH_SECRET="generate-this-below"`

### Generate NextAuth Secret:

**Windows (PowerShell):**
```powershell
# Generate random base64 string
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Or use this online tool:**
- Go to [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)
- Copy the generated string

### Complete .env.local Example:
```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# These are optional for now (we'll add later)
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
RESEND_API_KEY=""
EMAIL_FROM=""
```

---

## Option 2: Railway

1. **Create Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create Project**
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - Wait for deployment

3. **Get Connection String**
   - Click on the PostgreSQL service
   - Go to "Variables" tab
   - Copy the `DATABASE_URL` value

4. **Add to .env.local** (same as Supabase)

---

## Option 3: Local PostgreSQL

### Windows:
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer (use default port 5432)
3. Remember the password you set for `postgres` user

### Create Database:
```bash
# Using psql
psql -U postgres
CREATE DATABASE condodb;
\q
```

### Connection String:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/condodb?schema=public"
```

---

## After Database Setup

### 1. Apply Schema to Database:
```bash
npx prisma db push
```

Expected output:
```
✔ Database synchronized with Prisma schema
```

### 2. Seed Sample Data:
```bash
npm run db:seed
```

Expected output:
```
Created admin user: admin@comalrivercasa.com
Created property: Comal River Casa
Created 5 property images
Created 13 amenities
...
Seed completed successfully!
```

### 3. Verify Database:
```bash
npm run db:studio
```

This opens Prisma Studio where you can see all your data:
- Users (admin and guest)
- Property with images and amenities
- Sample booking and review

### 4. Start Development Server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Troubleshooting

### "Can't reach database server"
- Check your connection string format
- Ensure database is running (Supabase/Railway) or PostgreSQL service is started (local)
- Check firewall settings

### "Authentication failed"
- Verify password in connection string
- For Supabase: Make sure you replaced `[YOUR-PASSWORD]` with actual password

### "Database does not exist"
- For local: Create database first with `CREATE DATABASE condodb;`
- For Supabase/Railway: Database is created automatically

### SSL/TLS Issues
Add this to your connection string:
```
?sslmode=require
```

Example:
```
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

---

## Need Help?

Common issues and solutions:

**Issue**: Prisma can't connect to database
**Solution**: Verify connection string is correct and database is accessible

**Issue**: Seed script fails
**Solution**: Make sure `npx prisma db push` ran successfully first

**Issue**: Port 3000 is already in use
**Solution**:
```bash
# Find and kill the process
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

---

## What's Next?

Once your database is set up and seeded:
1. ✅ Browse the data in Prisma Studio
2. ✅ Test the dev server starts without errors
3. ✅ Verify the homepage loads
4. 🚀 Ready to continue building features!
