# Deployment Guide

This guide covers deploying the RetailFlow ERP system to production environments like Vercel, ensuring database seeding and authentication work correctly.

## Prerequisites

1. **Database**: PostgreSQL database (e.g., Neon, Supabase, Railway, or any PostgreSQL provider)
2. **Environment Variables**: Set up required environment variables in your deployment platform

## Required Environment Variables

Set these in your deployment platform (Vercel, Railway, etc.):

```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
SEED_SECRET=your-secret-key-here-change-this
```

**Important**: 
- Use a strong random string for `SEED_SECRET` (e.g., generate with `openssl rand -hex 32`)
- Never commit `SEED_SECRET` to version control
- The `SEED_SECRET` is used to protect the database seeding API endpoint

## Deployment Steps

### 1. Set Environment Variables

In your deployment platform (e.g., Vercel):

1. Go to Project Settings → Environment Variables
2. Add `DATABASE_URL` with your PostgreSQL connection string
3. Add `SEED_SECRET` with a secure random string

### 2. Deploy the Application

Push your code to trigger a deployment. Vercel will automatically:
- Install dependencies
- Run `prisma generate` (via `postinstall` script)
- Build the Next.js application

### 3. Set Up Database Schema

After the first deployment, you need to push the database schema:

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link to your project
vercel link

# Push database schema
npx prisma db push --skip-generate
```

**Option B: Using Prisma Studio or direct connection**
```bash
# Set DATABASE_URL in your local environment
export DATABASE_URL="your-production-database-url"

# Push schema
npx prisma db push --skip-generate
```

### 4. Seed the Database

After the schema is set up, seed the database with initial data:

**Option A: Using the API Endpoint (Recommended for Production)**

```bash
# Replace YOUR_SEED_SECRET with the value you set in environment variables
# Replace YOUR_DOMAIN with your deployed domain (e.g., erp-system-design-9mk5.vercel.app)

curl -X POST https://YOUR_DOMAIN/api/db/seed \
  -H "Authorization: Bearer YOUR_SEED_SECRET" \
  -H "Content-Type: application/json"
```

**Option B: Using Prisma Seed Script (Local)**

If you have direct database access:

```bash
# Set DATABASE_URL to production database
export DATABASE_URL="your-production-database-url"

# Run seed script
npm run db:seed
```

### 5. Verify Deployment

1. Visit your deployed application (e.g., `https://your-app.vercel.app`)
2. Navigate to the login page
3. Try logging in with:
   - **Email**: `admin@retailflow.com`
   - **Password**: `password123`

## Default Test Accounts

After seeding, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@retailflow.com | password123 |
| Manager | manager@retailflow.com | password123 |
| Employee | sales@retailflow.com | password123 |
| Employee | warehouse@retailflow.com | password123 |

**⚠️ Security Warning**: Change these default passwords in production!

## Troubleshooting

### Login Not Working

1. **Check if database is seeded**: Verify that users exist in the database
2. **Check DATABASE_URL**: Ensure the environment variable is set correctly
3. **Check API logs**: Look at Vercel function logs for errors
4. **Verify password hash**: The password should be `password123` hashed with bcrypt

### Database Connection Issues

1. **Check DATABASE_URL format**: Should be a valid PostgreSQL connection string
2. **Check SSL mode**: Some databases require `?sslmode=require`
3. **Check firewall/network**: Ensure your database allows connections from Vercel IPs
4. **Check connection pooling**: For serverless environments, use connection pooling (e.g., Neon's pooler)

### Seeding Fails

1. **Check SEED_SECRET**: Ensure it matches in both environment variables and the API call
2. **Check database schema**: Ensure `prisma db push` was run successfully
3. **Check API logs**: Look for specific error messages in Vercel function logs
4. **Verify Prisma Client**: Ensure `prisma generate` ran during build

### Content Security Policy (CSP) Warnings

The CSP warning about `eval` is expected and safe. It comes from:
- Next.js development mode
- Vercel Analytics (if enabled)

The CSP headers are configured in `next.config.mjs` to allow necessary scripts. This is safe for production use.

### Vercel Analytics 404

The Vercel Analytics script 404 error is normal if:
- Vercel Analytics is not enabled for your project
- Or the deployment is still building

To enable Vercel Analytics:
1. Go to Vercel Dashboard → Project Settings → Analytics
2. Enable Web Analytics
3. Redeploy your application

## Re-seeding Database

If you need to reset and re-seed the database:

```bash
curl -X POST https://YOUR_DOMAIN/api/db/seed \
  -H "Authorization: Bearer YOUR_SEED_SECRET" \
  -H "Content-Type: application/json"
```

**Warning**: This will DELETE all existing data and recreate it from scratch!

## Production Checklist

- [ ] Set strong `SEED_SECRET` environment variable
- [ ] Set `DATABASE_URL` environment variable
- [ ] Database schema pushed (`prisma db push`)
- [ ] Database seeded with initial data
- [ ] Verified login works with test account
- [ ] Changed default passwords (if needed)
- [ ] Verified all features work correctly
- [ ] Set up monitoring/logging
- [ ] Configured backups for database
- [ ] Reviewed security settings

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

