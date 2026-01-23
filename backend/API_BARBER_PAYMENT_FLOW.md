# Barber Registration with Mandatory Payment - API Documentation

## Overview
Barber registration now requires mandatory payment before shop registration. Payment must be verified as SUCCESS before any barber record is created.

## Business Rules
- ✅ Payment is MANDATORY for barber registration
- ✅ No barber record is created without successful payment
- ✅ All operations are atomic (transaction-based)
- ✅ Payment verification happens BEFORE barber creation
- ✅ Registration fee: ₹499 (49900 paise)

## API Flow

### Step 1: Create Payment Order
**POST** `/api/barber/create-payment`

Create a payment order for barber registration.

#### Request Body
```json
{}
```
(No body required - order is created automatically)

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Payment order created successfully",
  "data": {
    "orderId": "order_1704123456789_abc123xyz",
    "amount": 49900,
    "amountInRupees": 499,
    "currency": "INR",
    "status": "created"
  }
}
```

#### Usage
Frontend should:
1. Call this endpoint to get `orderId`
2. Use `orderId` with Razorpay (or payment gateway)
3. Process payment on frontend
4. Get `paymentId` from payment gateway
5. Proceed to Step 2 with both `orderId` and `paymentId`

---

### Step 2: Register Barber (with Payment Verification)
**POST** `/api/barber/register`

Register a new barber. Payment verification happens BEFORE barber creation.

#### Request Body
```json
{
  "fullName": "John Doe",
  "mobileNumber": "1234567890",
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "shopName": "John's Hair Studio",
  "shopAddress": "123 Main Street, City, State, 12345",
  "categories": ["Hair Salon", "Men Salon"],
  "paymentId": "pay_abc123xyz456",
  "orderId": "order_1704123456789_abc123xyz"
}
```

#### Field Requirements
- **fullName** (required): String
- **mobileNumber** (required): String, unique
- **email** (optional): String, unique if provided
- **password** (required): String, minimum 6 characters
- **shopName** (required): String
- **shopAddress** (required): String
- **categories** (required): Array of strings, at least one
- **paymentId** (required): String, from payment gateway
- **orderId** (required): String, from payment order

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

**400 Bad Request** - Missing Payment
```json
{
  "success": false,
  "message": "Payment ID is required. Please complete payment first."
}
```

**400 Bad Request** - Payment Verification Failed
```json
{
  "success": false,
  "message": "Payment verification failed. Registration cannot proceed without successful payment."
}
```

**400 Bad Request** - Payment Amount Mismatch
```json
{
  "success": false,
  "message": "Payment amount mismatch. Please contact support."
}
```

**409 Conflict** - Duplicate Barber
```json
{
  "success": false,
  "message": "Barber already exists with this mobile number"
}
```

---

### Step 3: Get Registration Fee
**GET** `/api/barber/registration-fee`

Get the registration fee amount.

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "amount": 499,
    "currency": "INR",
    "description": "Barber registration fee"
  }
}
```

---

## Complete Flow Example

### Frontend Implementation

```javascript
// Step 1: Create payment order
const createPaymentOrder = async () => {
  const response = await fetch('http://localhost:5000/api/barber/create-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data.data; // { orderId, amount, amountInRupees, currency }
};

// Step 2: Process payment with Razorpay (or your payment gateway)
const processPayment = async (orderData) => {
  // Initialize Razorpay
  const options = {
    key: 'YOUR_RAZORPAY_KEY',
    amount: orderData.amount,
    currency: orderData.currency,
    order_id: orderData.orderId,
    name: 'Barber Registration',
    description: 'Registration fee for barber account',
    handler: async function (response) {
      // Payment successful
      const paymentId = response.razorpay_payment_id;
      const orderId = response.razorpay_order_id;
      
      // Step 3: Register barber with payment details
      await registerBarber(paymentId, orderId);
    }
  };
  
  const razorpay = new Razorpay(options);
  razorpay.open();
};

// Step 3: Register barber
const registerBarber = async (paymentId, orderId) => {
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
      categories: ['Hair Salon', 'Men Salon'],
      paymentId: paymentId,
      orderId: orderId
    })
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('Barber registered successfully!');
  }
};
```

---

## Payment Verification Logic

The backend verifies payment in the following order:

1. **Check payment format** - Payment ID must start with "pay_"
2. **Check database** - Look for existing successful payment with same paymentId/orderId
3. **Verify amount** - Must match registration fee (₹499)
4. **Verify status** - Must be "SUCCESS"

If any verification fails, barber registration is **rejected** and **no data is saved**.

---

## Database Transaction

All operations happen in a single Prisma transaction:

```javascript
prisma.$transaction(async (tx) => {
  // 1. Create Barber
  // 2. Create BarberPayment (status: SUCCESS)
  // 3. Create Categories
  // 4. Link Barber to Categories
  
  // If ANY step fails, ALL operations are rolled back
});
```

**Result**: Either ALL data is saved, or NOTHING is saved.

---

## Migration Name

```
add_barber_payment_model
```

---

## Notes

- Payment verification is **mandatory** - no exceptions
- Payment must be **SUCCESS** status
- Payment amount must match registration fee exactly
- All operations are **atomic** (transaction-based)
- No partial data is saved if payment fails
- Password is never returned in response
