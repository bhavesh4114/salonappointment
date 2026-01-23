# Quick Migration Guide - Separate Barbers from Users

## Problem
You have 2 existing barber records that need to be migrated from the User table structure to the new independent Barber structure.

## Solution: Execute SQL Directly

### Option 1: Using psql (Recommended)

1. **Open PostgreSQL command line:**
   ```bash
   psql -U postgres -d salonappointment
   ```

2. **Copy and paste the entire SQL from:**
   ```
   backend/prisma/migrations/MANUAL_MIGRATION_SCRIPT.sql
   ```

3. **Press Enter to execute**

4. **Exit psql:**
   ```bash
   \q
   ```

5. **Mark migration as applied:**
   ```bash
   cd backend
   npx prisma migrate resolve --applied separate_barbers_from_users
   ```

6. **Generate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

### Option 2: Using Prisma Migrate (After Manual SQL)

1. **First, execute the SQL manually** (see Option 1, steps 1-3)

2. **Create an empty migration:**
   ```bash
   cd backend
   npx prisma migrate dev --create-only --name separate_barbers_from_users
   ```

3. **Delete the generated migration.sql file** (it will be empty or have wrong SQL)

4. **Copy the SQL from MANUAL_MIGRATION_SCRIPT.sql** into the migration file

5. **Apply the migration:**
   ```bash
   npx prisma migrate dev
   ```

6. **Generate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

## What the Migration Does

1. ✅ Adds new columns (`fullName`, `email`, `mobileNumber`, `password`) as nullable
2. ✅ Copies data from User table to Barber table for existing records
3. ✅ Sets defaults for any missing data
4. ✅ Makes columns required (NOT NULL)
5. ✅ Adds unique constraints
6. ✅ Removes duplicate records if any
7. ✅ Drops old columns and foreign key relationships
8. ✅ Ensures `shopName` and `shopAddress` are NOT NULL

## Verification

After migration, verify:

```sql
SELECT id, "fullName", "mobileNumber", "email", "shopName", "shopAddress" 
FROM barbers;
```

You should see all 2 barbers with their data properly migrated.

## Troubleshooting

### If you get duplicate key errors:
The script handles duplicates automatically, but if you still get errors, check:
```sql
SELECT "mobileNumber", COUNT(*) 
FROM barbers 
GROUP BY "mobileNumber" 
HAVING COUNT(*) > 1;
```

### If shopName or shopAddress are NULL:
The script sets defaults, but you can manually update:
```sql
UPDATE barbers 
SET "shopName" = 'Your Shop Name', "shopAddress" = 'Your Address'
WHERE "shopName" IS NULL OR "shopAddress" IS NULL;
```

## Next Steps

After successful migration:
1. ✅ Test the barber registration API
2. ✅ Verify existing barbers can still be queried
3. ✅ Update frontend if needed
