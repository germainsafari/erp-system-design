# RetailFlow ERP - Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon, Supabase, or any PostgreSQL provider)
- npm or pnpm package manager

## Initial Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with your database URL:

```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

**Important:** The `.env` file is already in `.gitignore` and will not be committed to version control.

### 3. Set Up Database Schema

Generate Prisma Client and push the schema to your database:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Or use migrations (recommended for production)
npm run db:migrate
```

### 4. Seed the Database

Populate the database with initial demo data:

```bash
npm run db:seed
```

This will create:
- 4 users (admin, manager, 2 employees)
- 10 products across 3 categories
- 5 customers
- 3 suppliers
- 5 sales orders with items
- 5 employees
- 6 transactions
- Inventory entries

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Default Test Accounts

After seeding, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@retailflow.com | password123 |
| Manager | manager@retailflow.com | password123 |
| Employee | sales@retailflow.com | password123 |

## Production Deployment

### For Hugging Face Spaces

1. Ensure your `.env` file is configured with the production database URL
2. The Dockerfile is already configured for FastAPI/Next.js deployment
3. Push your code to the Hugging Face Space repository
4. Set the `DATABASE_URL` environment variable in Hugging Face Space settings

### Database Connection

Make sure your database:
- Accepts connections from your deployment environment
- Has SSL enabled (required for Neon and most cloud providers)
- Has the correct connection string format

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Check that your database allows connections from your IP
- Ensure SSL mode is set correctly (`sslmode=require`)

### Prisma Client Not Generated

If you see errors about Prisma Client:
```bash
npm run db:generate
```

### Seed Script Fails

If the seed script fails:
- Make sure the database schema is pushed/migrated first
- Check that the database is accessible
- Verify no conflicting data exists (the seed script will try to delete existing data)

## Next Steps

- Configure authentication (currently using mock auth)
- Set up environment-specific configurations
- Configure email services if needed
- Set up monitoring and logging







