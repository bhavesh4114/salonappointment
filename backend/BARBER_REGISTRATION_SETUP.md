# Barber Registration API - Setup Guide

## Overview
A dedicated Barber Registration API has been implemented with clean architecture following the separation of concerns principle.

## File Structure

```
backend/
├── controllers/
│   └── barberController.js      # HTTP request/response handling
├── services/
│   └── barberService.js         # Business logic and database operations
├── routes/
│   └── barber.js                # Route definitions
├── prisma/
│   └── schema.prisma            # Updated with Category and BarberCategory models
└── index.js                     # Updated to include barber routes
```

## Database Changes

### New Models Added

1. **Category** - Master table for barber categories
   - `id` (Int, Primary Key)
   - `name` (String, Unique)

2. **BarberCategory** - Junction table for many-to-many relationship
   - `id` (Int, Primary Key)
   - `barberId` (Int, Foreign Key → Barber)
   - `categoryId` (Int, Foreign Key → Category)
   - Unique constraint on `[barberId, categoryId]`

### Updated Models

1. **Barber** - Updated fields
   - `shopName` - Changed from optional (`String?`) to required (`String`)
   - `shopAddress` - Changed from optional (`String?`) to required (`String`)
   - Added relation: `categories BarberCategory[]`

## Setup Instructions

### 1. Update Database Schema

Run Prisma migration to apply schema changes:

```bash
cd backend
npm run prisma:migrate
```

Or push schema changes directly (for development):

```bash
npx prisma db push
```

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

### 3. Start the Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### POST `/api/barber/register`
Register a new barber account.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "mobileNumber": "1234567890",
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "shopName": "John's Hair Studio",
  "shopAddress": "123 Main Street, City, State, 12345",
  "categories": ["Hair Salon", "Men Salon"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Barber registered successfully",
  "data": {
    "user": { ... },
    "barber": { ... }
  }
}
```

### GET `/api/barber/categories`
Get list of allowed categories.

**Response (200):**
```json
{
  "success": true,
  "data": [
    "Hair Salon",
    "Men Salon",
    "Women Salon",
    "Unisex Salon",
    "Spa",
    "Beauty Care Parlour"
  ]
}
```

## Features

✅ **Clean Architecture**
- Separation of concerns (Routes → Controllers → Services)
- Reusable service functions
- Easy to test and maintain

✅ **Data Validation**
- Required field validation
- Email format validation
- Password length validation (min 6 chars)
- Category validation against allowed list

✅ **Database Integrity**
- Prisma transactions for atomic operations
- Unique constraints on mobile number and email
- Foreign key relationships with cascade delete

✅ **Security**
- Password hashing with bcrypt
- Password never returned in responses
- Input sanitization (trim whitespace)

✅ **Error Handling**
- Comprehensive error messages
- HTTP status codes (400, 409, 500)
- Development error details

✅ **Category Management**
- Auto-create categories if they don't exist
- Many-to-many relationship between barbers and categories
- Predefined allowed categories list

## Testing

### Test with cURL

```bash
# Register a barber
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

### Test Categories Endpoint

```bash
curl http://localhost:5000/api/barber/categories
```

## Next Steps

1. Run the Prisma migration to update the database
2. Test the API endpoints
3. Integrate with frontend signup form
4. Add additional validation if needed
5. Consider adding rate limiting for production

## Notes

- The API does NOT include login functionality (as per requirements)
- No OTP verification is implemented
- No admin approval workflow
- Categories are auto-created if they don't exist in the database
- All operations use Prisma transactions for data consistency
