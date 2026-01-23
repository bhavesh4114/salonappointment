# Quick Setup Guide

## 1. Install Dependencies
```bash
cd backend
npm install
```

## 2. Setup Environment Variables
```bash
cp env.template .env
```

Edit `.env` and update:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - A secure random string for JWT signing

Example DATABASE_URL:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/salonappointment
```

## 3. Setup Database

### Option A: Using Prisma Migrate (Recommended)
```bash
# Generate Prisma Client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate
```

### Option B: Manual Database Setup
1. Create a PostgreSQL database named `salonappointment`
2. Run:
```bash
npm run prisma:generate
npm run prisma:db push
```

## 4. Start the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## 5. Verify Setup

Visit `http://localhost:5000/api/health` - you should see:
```json
{
  "status": "OK",
  "message": "Salon Appointment API is running",
  "timestamp": "..."
}
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL format in `.env`
- Verify database exists
- Check user permissions

### Prisma Client Not Generated
```bash
npm run prisma:generate
```

### Migration Issues
```bash
# Reset database (WARNING: Deletes all data)
npm run prisma:migrate reset

# Or create a new migration
npm run prisma:migrate dev --name init
```

## Next Steps

1. Test the API using the examples in `API_EXAMPLES.md`
2. Integrate with your Vite frontend
3. See `README.md` for full API documentation
