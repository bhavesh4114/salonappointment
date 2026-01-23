# Barber Registration with Payment - Quick Reference

## Migration Name
```
add_barber_payment_model
```

## API Endpoints

### 1. Create Payment Order
**POST** `/api/barber/create-payment`

**Request:**
```bash
curl -X POST http://localhost:5000/api/barber/create-payment \
  -H "Content-Type: application/json"
```

**Response:**
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

---

### 2. Register Barber (with Payment)
**POST** `/api/barber/register`

**Request:**
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
    "categories": ["Hair Salon", "Men Salon"],
    "paymentId": "pay_abc123xyz456",
    "orderId": "order_1704123456789_abc123xyz"
  }'
```

**Response (Success):**
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
      { "id": 1, "name": "Hair Salon" },
      { "id": 2, "name": "Men Salon" }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (Payment Failed):**
```json
{
  "success": false,
  "message": "Payment verification failed. Registration cannot proceed without successful payment."
}
```

---

### 3. Get Registration Fee
**GET** `/api/barber/registration-fee`

**Request:**
```bash
curl http://localhost:5000/api/barber/registration-fee
```

**Response:**
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

## Frontend Flow

```javascript
// 1. Get registration fee
const feeResponse = await fetch('/api/barber/registration-fee');
const feeData = await feeResponse.json();
console.log(`Registration fee: ₹${feeData.data.amount}`);

// 2. Create payment order
const orderResponse = await fetch('/api/barber/create-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
const orderData = await orderResponse.json();
const { orderId, amount } = orderData.data;

// 3. Process payment with Razorpay
const options = {
  key: 'YOUR_RAZORPAY_KEY',
  amount: amount,
  currency: 'INR',
  order_id: orderId,
  name: 'Barber Registration',
  handler: async function (response) {
    // 4. Register barber with payment details
    const registerResponse = await fetch('/api/barber/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'John Doe',
        mobileNumber: '1234567890',
        email: 'john@example.com',
        password: 'password123',
        shopName: "John's Hair Studio",
        shopAddress: '123 Main St',
        categories: ['Hair Salon'],
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id
      })
    });
    
    const result = await registerResponse.json();
    if (result.success) {
      alert('Registration successful!');
    }
  }
};

const razorpay = new Razorpay(options);
razorpay.open();
```

---

## Key Points

- ✅ Payment is **MANDATORY** - no payment, no registration
- ✅ Payment verification happens **BEFORE** barber creation
- ✅ All operations are **atomic** (transaction-based)
- ✅ Registration fee: **₹499** (49900 paise)
- ✅ Payment status must be **SUCCESS**
- ✅ No partial data saved if payment fails
