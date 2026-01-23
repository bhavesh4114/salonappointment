# Barber Registration API - Updated Documentation

## Overview
Barber Registration API has been updated to completely separate Barbers from Users. Barbers now have their own independent table with no relation to the User table.

## Endpoints

### 1. Register Barber
**POST** `/api/barber/register`

Register a new barber. Creates a record ONLY in the Barber table (no User table involvement).

#### Request Body
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

#### Field Requirements
- **fullName** (required): String, barber's full name
- **mobileNumber** (required): String, unique 10-digit mobile number (checked only in Barber table)
- **email** (optional): String, valid email address (must be unique in Barber table if provided)
- **password** (required): String, minimum 6 characters
- **shopName** (required): String, name of the shop/salon
- **shopAddress** (required): String, complete address of the shop
- **categories** (required): Array of strings, at least one category must be selected

#### Allowed Categories
- `"Hair Salon"`
- `"Men Salon"`
- `"Women Salon"`
- `"Unisex Salon"`
- `"Spa"`
- `"Beauty Care Parlour"`

#### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Barber registered successfully",
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "mobileNumber": "1234567890",
    "shopName": "John's Hair Studio",
    "shopAddress": "123 Main Street, City, State, 12345",
    "categories": [
      {
        "id": 1,
        "name": "Hair Salon"
      },
      {
        "id": 2,
        "name": "Men Salon"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request** - Validation Error
```json
{
  "success": false,
  "message": "Full name is required"
}
```

**400 Bad Request** - Invalid Categories
```json
{
  "success": false,
  "message": "Invalid categories: Invalid Category Name"
}
```

**409 Conflict** - Duplicate Barber
```json
{
  "success": false,
  "message": "Barber already exists with this mobile number"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Failed to register barber",
  "error": "Error details (only in development)"
}
```

---

### 2. Get Allowed Categories
**GET** `/api/barber/categories`

Get the list of allowed categories for barber registration.

#### Success Response (200 OK)
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

---

## Example Usage

### Using cURL

```bash
# Register a barber
curl -X POST http://localhost:5000/api/barber/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "mobileNumber": "1234567890",
    "email": "john.doe@example.com",
    "password": "securepassword123",
    "shopName": "John'\''s Hair Studio",
    "shopAddress": "123 Main Street, City, State, 12345",
    "categories": ["Hair Salon", "Men Salon"]
  }'

# Get allowed categories
curl -X GET http://localhost:5000/api/barber/categories
```

### Using JavaScript (Fetch API)

```javascript
// Register a barber
const registerBarber = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/barber/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'John Doe',
        mobileNumber: '1234567890',
        email: 'john.doe@example.com',
        password: 'securepassword123',
        shopName: "John's Hair Studio",
        shopAddress: '123 Main Street, City, State, 12345',
        categories: ['Hair Salon', 'Men Salon']
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Barber registered successfully:', data);
    } else {
      console.error('Registration failed:', data.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

---

## Database Schema

The API creates records in the following tables:

1. **barbers** - Independent barber account (no relation to users table)
   - `id` (Int, Primary Key)
   - `fullName` (String)
   - `email` (String?, Unique)
   - `mobileNumber` (String, Unique)
   - `password` (String, Hashed)
   - `shopName` (String)
   - `shopAddress` (String)
   - `createdAt` (DateTime)

2. **categories** - Category master data (created if not exists)
   - `id` (Int, Primary Key)
   - `name` (String, Unique)

3. **barber_categories** - Many-to-many relationship between barbers and categories
   - `id` (Int, Primary Key)
   - `barberId` (Int, Foreign Key → Barber)
   - `categoryId` (Int, Foreign Key → Category)
   - Unique constraint on `[barberId, categoryId]`

## Key Changes from Previous Version

### ✅ Complete Separation
- **Before:** Barbers were created as Users with role="barber", then linked via `userId`
- **After:** Barbers are completely independent entities with their own table

### ✅ Duplicate Checking
- **Before:** Checked for duplicates in User table
- **After:** Checks for duplicates ONLY in Barber table

### ✅ Response Structure
- **Before:** Returned both `user` and `barber` objects
- **After:** Returns only `barber` data (all fields in one object)

### ✅ No User Table Involvement
- Barber registration does NOT create or modify User table
- User and Barber tables are completely separate

## Notes

- All database operations are performed within a Prisma transaction to ensure data consistency
- Passwords are hashed using bcrypt before storage
- Email is optional but must be unique in Barber table if provided
- Mobile number must be unique in Barber table
- At least one category is required
- Only predefined categories are allowed
- Password is never returned in the response
- User table remains untouched during barber registration
