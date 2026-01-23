# Barber Registration API Documentation

## Overview
This API endpoint allows barbers to register in the system. It creates a user account with the "barber" role, creates a barber profile, and links the barber with selected categories.

## Endpoints

### 1. Register Barber
**POST** `/api/barber/register`

Register a new barber with personal details, shop information, and categories.

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
- **mobileNumber** (required): String, unique 10-digit mobile number
- **email** (optional): String, valid email address (must be unique if provided)
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
    "user": {
      "id": 1,
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "mobileNumber": "1234567890",
      "role": "barber",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "barber": {
      "id": 1,
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

**409 Conflict** - Duplicate User
```json
{
  "success": false,
  "message": "User already exists with this mobile number"
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

// Get allowed categories
const getCategories = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/barber/categories');
    const data = await response.json();
    console.log('Allowed categories:', data.data);
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};
```

### Using Axios

```javascript
import axios from 'axios';

// Register a barber
const registerBarber = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/barber/register', {
      fullName: 'John Doe',
      mobileNumber: '1234567890',
      email: 'john.doe@example.com',
      password: 'securepassword123',
      shopName: "John's Hair Studio",
      shopAddress: '123 Main Street, City, State, 12345',
      categories: ['Hair Salon', 'Men Salon']
    });
    
    console.log('Barber registered:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Registration error:', error.response.data.message);
    } else {
      console.error('Network error:', error.message);
    }
  }
};
```

---

## Database Schema

The API creates records in the following tables:

1. **users** - User account with role = "barber"
2. **barbers** - Barber profile linked to user
3. **categories** - Category master data (created if not exists)
4. **barber_categories** - Many-to-many relationship between barbers and categories

---

## Notes

- All database operations are performed within a Prisma transaction to ensure data consistency
- Passwords are hashed using bcrypt before storage
- Email is optional but must be unique if provided
- Mobile number must be unique
- At least one category is required
- Only predefined categories are allowed
- Password is never returned in the response

---

## Error Handling

The API handles the following error scenarios:

1. **Missing required fields** - Returns 400 with specific field error
2. **Invalid email format** - Returns 400
3. **Password too short** - Returns 400
4. **Duplicate mobile/email** - Returns 409
5. **Invalid categories** - Returns 400
6. **Database errors** - Returns 500 with error details (development only)
