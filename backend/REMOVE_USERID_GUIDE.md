# Remove userId from Barber Table

## Problem
- Database has `userId` column in `barbers` table (NOT NULL constraint)
- Prisma schema doesn't have `userId` field
- Creating Barber fails with: "Null constraint violation on the fields: (userId)"

## Solution

### Step 1: Stop Server
```bash
# Stop your backend server (Ctrl+C)
```

### Step 2: Apply Migration
```bash
cd backend

# Option 1: Using NPM script (Recommended)
npm run migrate:remove-userid

# Option 2: Using psql directly
psql -U postgres -d salonappointment -f prisma/migrations/remove_userid_from_barber.sql
```

### Step 3: Regenerate Prisma Client
```bash
npm run prisma:generate
```

### Step 4: Restart Server
```bash
npm run dev
```

## What the Migration Does

1. **Drops Foreign Key Constraint**: Removes `barbers_userId_fkey` if it exists
2. **Drops Unique Constraint**: Removes `barbers_userId_key` if it exists
3. **Drops Indexes**: Removes any indexes on `userId`
4. **Drops Column**: Removes `userId` column from `barbers` table

## Verification

After migration, verify the column is gone:
```sql
-- Check barbers table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'barbers'
ORDER BY ordinal_position;

-- Should NOT have userId column
-- Should have: id, fullName, email, mobileNumber, password, shopName, shopAddress, createdAt
```

## Expected Result

- ✅ No `userId` column in `barbers` table
- ✅ Barber registration works without userId
- ✅ No Prisma P2011 error
- ✅ Clean separation between User and Barber
