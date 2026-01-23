# Barber Registration API - Quick Reference

## Endpoint
**POST** `/api/barber/register`

## Sample Request

```bash
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
```

## Sample Success Response (201)

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

## Sample Error Responses

### 400 - Missing Required Field
```json
{
  "success": false,
  "message": "Full name is required"
}
```

### 400 - Invalid Categories
```json
{
  "success": false,
  "message": "Invalid categories: Invalid Category"
}
```

### 409 - Duplicate Mobile Number
```json
{
  "success": false,
  "message": "Barber already exists with this mobile number"
}
```

### 409 - Duplicate Email
```json
{
  "success": false,
  "message": "Barber already exists with this email"
}
```

## Allowed Categories

- `"Hair Salon"`
- `"Men Salon"`
- `"Women Salon"`
- `"Unisex Salon"`
- `"Spa"`
- `"Beauty Care Parlour"`

## Field Requirements

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| fullName | ✅ Yes | String | Barber's full name |
| mobileNumber | ✅ Yes | String | Unique, 10 digits |
| email | ❌ No | String | Optional, must be unique if provided |
| password | ✅ Yes | String | Minimum 6 characters |
| shopName | ✅ Yes | String | Shop/salon name |
| shopAddress | ✅ Yes | String | Complete address |
| categories | ✅ Yes | Array | At least one category required |

## JavaScript Example

```javascript
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
console.log(data);
```
