# Migration Steps for Separating Barbers from Users

## Problem
You have existing barber records (2 rows) that are linked to users. The migration needs to:
1. Copy data from User table to Barber table
2. Add new required columns
3. Remove old columns and relations

## Solution: Manual Migration

### Step 1: Create Migration File (Empty)
```bash
cd backend
npx prisma migrate dev --create-only --name separate_barbers_from_users
```

### Step 2: Edit the Migration SQL File

The migration file will be created at:
```
backend/prisma/migrations/[timestamp]_separate_barbers_from_users/migration.sql
```

Replace its contents with the SQL from `prisma/migrations/MANUAL_MIGRATION_SCRIPT.sql`

### Step 3: Apply the Migration
```bash
npx prisma migrate dev
```

## Alternative: Direct SQL Execution

If the above doesn't work, you can execute the SQL directly:

### Step 1: Connect to PostgreSQL
```bash
psql -U postgres -d salonappointment
```

### Step 2: Execute the Migration SQL
Copy and paste the contents of `prisma/migrations/MANUAL_MIGRATION_SCRIPT.sql`

### Step 3: Mark Migration as Applied
```bash
cd backend
npx prisma migrate resolve --applied separate_barbers_from_users
```

### Step 4: Generate Prisma Client
```bash
npm run prisma:generate
```

## What the Migration Does

1. **Adds new columns** (nullable first):
   - `fullName`
   - `email`
   - `mobileNumber`
   - `password`

2. **Migrates data** from User table to Barber table for existing records

3. **Makes columns required** (NOT NULL)

4. **Adds unique constraints** on email and mobileNumber

5. **Drops old columns**:
   - `userId` (foreign key)
   - `title`, `bio`, `experience`, `rating`, `reviewCount`, `verified`, `expertise`, `availability`, `location`, `images`, `updatedAt`

6. **Ensures shopName and shopAddress are NOT NULL**

## Verification

After migration, verify the data:

```sql
SELECT id, "fullName", "mobileNumber", "email", "shopName", "shopAddress" 
FROM barbers;
```

You should see all barbers with their data migrated from users.

## Rollback (if needed)

If you need to rollback, restore from backup:

```bash
psql -U postgres salonappointment < backup_before_separation.sql
```
