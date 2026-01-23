# Database Migration: Separate Barbers from Users

## Overview
This migration separates Barbers from Users completely. Barbers will have their own independent table with no relation to the User table.

## Migration Name
```
separate_barbers_from_users
```

## Prisma Schema Changes

### 1. User Model
**Removed:**
- `barber Barber?` relation

**Result:** User table now contains ONLY normal app users.

### 2. Barber Model
**Removed:**
- `userId Int @unique`
- `user User @relation(...)`
- `title String`
- `bio String`
- `experience Int`
- `rating Float`
- `reviewCount Int`
- `verified Boolean`
- `expertise String[]`
- `availability Json?`
- `location Json?`
- `images String[]`
- `updatedAt DateTime`
- `services Service[]` relation
- `appointments Appointment[]` relation

**Added:**
- `fullName String`
- `email String? @unique`
- `mobileNumber String @unique`
- `password String`
- `shopName String`
- `shopAddress String`
- `createdAt DateTime @default(now())`

**Kept:**
- `categories BarberCategory[]` relation

**Result:** Barber table is now completely independent with its own authentication fields.

## Migration Steps

### Step 1: Backup Database
```bash
# Create a backup before migration
pg_dump -U postgres salonappointment > backup_before_separation.sql
```

### Step 2: Create Migration
```bash
cd backend
npx prisma migrate dev --name separate_barbers_from_users
```

### Step 3: Review Migration SQL
The migration will:
1. Drop the foreign key constraint from `barbers.userId` to `users.id`
2. Drop the `userId` column from `barbers` table
3. Add new columns: `fullName`, `email`, `mobileNumber`, `password`, `shopName`, `shopAddress`
4. Drop columns: `title`, `bio`, `experience`, `rating`, `reviewCount`, `verified`, `expertise`, `availability`, `location`, `images`, `updatedAt`
5. Add unique constraints on `email` and `mobileNumber` in `barbers` table

### Step 4: Handle Existing Data (if any)
If you have existing barber records linked to users, you'll need to migrate the data:

```sql
-- Example migration script for existing data
-- Run this BEFORE applying the Prisma migration if you have existing barbers

-- Copy data from users to barbers
UPDATE barbers b
SET 
  "fullName" = u."fullName",
  email = u.email,
  "mobileNumber" = u."mobileNumber",
  password = u.password,
  "shopName" = COALESCE(b."shopName", 'Default Shop'),
  "shopAddress" = COALESCE(b."shopAddress", 'Default Address')
FROM users u
WHERE b."userId" = u.id;
```

### Step 5: Generate Prisma Client
```bash
npm run prisma:generate
```

### Step 6: Test the API
```bash
# Test barber registration
curl -X POST http://localhost:5000/api/barber/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Barber",
    "mobileNumber": "9876543210",
    "email": "test@example.com",
    "password": "test123",
    "shopName": "Test Salon",
    "shopAddress": "123 Test St",
    "categories": ["Hair Salon"]
  }'
```

## Breaking Changes

### API Response Changes
**Before:**
```json
{
  "data": {
    "user": { ... },
    "barber": { ... }
  }
}
```

**After:**
```json
{
  "data": {
    "id": 1,
    "fullName": "...",
    "email": "...",
    "mobileNumber": "...",
    "shopName": "...",
    "shopAddress": "...",
    "categories": [...]
  }
}
```

### Database Queries
- **Before:** `prisma.user.findFirst({ where: { mobileNumber } })`
- **After:** `prisma.barber.findFirst({ where: { mobileNumber } })`

### Relations
- **Before:** Barbers were linked to Users via `userId`
- **After:** Barbers are completely independent entities

## Notes

⚠️ **Important:**
- This migration will break existing barber-user relationships
- If you have existing appointments linking to barbers via users, you may need to update those separately
- The `Appointment` model still references both `User` and `Barber` - this is intentional as appointments are separate entities
- Make sure to update any frontend code that expects the old response structure

## Rollback (if needed)

If you need to rollback:

```bash
# Rollback the last migration
npx prisma migrate resolve --rolled-back separate_barbers_from_users

# Or manually restore from backup
psql -U postgres salonappointment < backup_before_separation.sql
```
