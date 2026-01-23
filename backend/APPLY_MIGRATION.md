# Apply Barber Schema Migration

## Problem
The database `barbers` table is missing columns that exist in the Prisma schema:
- `fullName`
- `email`
- `mobileNumber`
- `password`

## Solution

### Option 1: Using psql (Recommended)
```bash
cd backend
psql -U postgres -d salonappointment -f prisma/migrations/apply_barber_migration.sql
```

### Option 2: Using Prisma Studio
1. Open Prisma Studio:
   ```bash
   cd backend
   npx prisma studio
   ```
2. Navigate to the database
3. Execute the SQL from `prisma/migrations/apply_barber_migration.sql`

### Option 3: Using Database GUI
1. Open your PostgreSQL client (pgAdmin, DBeaver, etc.)
2. Connect to the database
3. Execute the SQL from `prisma/migrations/apply_barber_migration.sql`

## After Migration

1. Regenerate Prisma Client:
   ```bash
   cd backend
   npx prisma generate
   ```

2. Restart the server:
   ```bash
   npm run dev
   ```

## Verify

Check that the columns exist:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'barbers'
ORDER BY ordinal_position;
```

Expected columns:
- id
- fullName (NOT NULL)
- email (nullable, unique)
- mobileNumber (NOT NULL, unique)
- password (NOT NULL)
- shopName
- shopAddress
- createdAt
