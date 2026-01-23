# User and Barber Complete Separation

## ✅ Changes Applied

### 1. Prisma Schema
- **User Model**: Only for regular users and admins (role: 'user' or 'admin')
- **Barber Model**: Completely independent, no relation to User
- **No shared fields**: Each has its own fullName, email, mobileNumber, password

### 2. Routes Updated

#### `/api/auth/register` (User Registration Only)
- ❌ **Removed**: Barber creation logic
- ❌ **Removed**: Role validation for 'barber'
- ✅ **Now**: Only creates User records
- ✅ **Error**: Returns 400 if role='barber' is attempted

#### `/api/barber/register` (Barber Registration)
- ✅ **Already**: Only creates Barber records
- ✅ **No User involvement**: Completely separate

#### `/api/barbers/profile/me` (Update Profile)
- ❌ **Removed**: `userId` lookup
- ❌ **Removed**: `user` relation include
- ✅ **Now**: Finds barber by mobileNumber/email from token
- ✅ **Updates**: Only Barber table fields

### 3. Database Migration

The migration script (`clean_separation.sql`) will:
1. Remove `userId` column from `barbers` table
2. Remove old columns: `title`, `bio`, `experience`, `rating`, `reviewCount`, `verified`, `expertise`, `availability`, `location`, `images`, `updatedAt`
3. Ensure required columns exist: `fullName`, `email`, `mobileNumber`, `password`
4. Add unique constraints on `mobileNumber` and `email`
5. Update User table: Change any `role='barber'` to `role='user'`

## 🚀 How to Apply

### Step 1: Stop Server
```bash
# Stop your backend server (Ctrl+C)
```

### Step 2: Apply Migration
```bash
cd backend

# Option 1: Using NPM script (Recommended)
npm run migrate:clean-separation

# Option 2: Using psql directly
psql -U postgres -d salonappointment -f prisma/migrations/clean_separation.sql
```

### Step 3: Regenerate Prisma Client
```bash
npm run prisma:generate
```

### Step 4: Restart Server
```bash
npm run dev
```

## 📋 Verification

### Check Database Structure
```sql
-- Check barbers table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'barbers'
ORDER BY ordinal_position;

-- Expected columns:
-- id, fullName, email, mobileNumber, password, shopName, shopAddress, createdAt
-- Should NOT have: userId, title, bio, experience, etc.
```

### Check User Table
```sql
-- Verify no barbers in users table
SELECT * FROM users WHERE role = 'barber';
-- Should return 0 rows
```

## 🎯 Registration Flow

### User Registration
```
POST /api/auth/register
→ Creates record in `users` table only
→ Returns JWT token
```

### Barber Registration
```
POST /api/barber/register
→ Creates record in `barbers` table only
→ Requires payment verification
→ No User table involvement
```

## ⚠️ Important Notes

1. **No Cross-Table Queries**: User and Barber queries are completely separate
2. **No Shared Authentication**: Barbers have their own login (if implemented separately)
3. **Appointments**: Still link User and Barber (this is correct - appointments connect users to barbers)
4. **Payments**: 
   - User payments: `Payment` model (for appointments)
   - Barber payments: `BarberPayment` model (for registration)

## 🔒 Data Integrity

- ✅ User mobileNumber/email are unique within `users` table
- ✅ Barber mobileNumber/email are unique within `barbers` table
- ✅ Same mobileNumber can exist in both tables (they're separate entities)
- ✅ No foreign key constraints between User and Barber

## 📝 Future Scalability

This separation allows:
- Independent authentication systems
- Different password policies
- Separate profile management
- Independent verification flows
- Easy addition of new user types (e.g., Admin, Staff)
