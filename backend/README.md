# Salon Appointment Backend API

Backend API for the Salon Appointment System built with Node.js, Express, PostgreSQL, and Prisma.

## Features

- 🔐 User Authentication (JWT)
- 👤 User & Barber Management
- 💇 Barber Profiles & Services
- 📅 Appointment Booking System
- 💳 Payment Processing
- 🔒 Role-based Authorization

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (local or cloud instance)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
cp env.template .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/salonappointment
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

5. Generate Prisma Client:
```bash
npm run prisma:generate
```

6. Run database migrations:
```bash
npm run prisma:migrate
```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Base Route
- `GET /` - API information and available endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Appointments
- `GET /api/appointments` - Get appointments (Protected)
- `GET /api/appointments/:id` - Get single appointment (Protected)
- `POST /api/appointments` - Create an appointment (Protected, User only)
- `PUT /api/appointments/:id/status` - Update appointment status (Protected)

### Health Check
- `GET /api/health` - Server health check

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Example API Requests

### Register a User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "mobileNumber": "+1234567890",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "mobileNumber": "+1234567890",
  "password": "password123"
}
```

### Create Appointment
```bash
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "barberId": 1,
  "services": [
    {
      "service": 1,
      "quantity": 1
    }
  ],
  "appointmentDate": "2024-12-15T10:30:00Z",
  "appointmentTime": "10:30 AM",
  "notes": "Please be gentle"
}
```

## Database Models

- **User**: User accounts (both regular users and barbers)
- **Barber**: Barber profiles and information
- **Service**: Services offered by barbers
- **Appointment**: Booking appointments
- **AppointmentService**: Junction table for appointment services
- **Payment**: Payment transactions

## Frontend Integration

See `API_EXAMPLES.md` for complete frontend integration examples with fetch calls for Vite/React.

## Error Handling

The API returns standardized error responses:

```json
{
  "message": "Error message",
  "errors": [] // For validation errors
}
```

## Development

- Uses ES6 modules
- PostgreSQL with Prisma ORM
- JWT for authentication
- Express-validator for input validation
- CORS enabled for frontend integration

## Prisma Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed the database (if seed file exists)

## License

ISC
