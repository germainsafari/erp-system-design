# Database Connection Troubleshooting

## Common Issues and Solutions

### Issue: "Can't reach database server"

This error means your application cannot connect to your PostgreSQL database. Here are the most common causes and solutions:

#### 1. Neon Database is Paused

**Problem**: Neon databases automatically pause after a period of inactivity to save resources.

**Solution**:
- Go to your [Neon Dashboard](https://console.neon.tech)
- Find your project
- Click on your database to wake it up
- Wait 10-30 seconds for it to become active
- Try your application again

#### 2. Wrong Connection String

**Problem**: Using the direct connection string instead of the pooler, or vice versa.

**Solution**:
- In Neon Dashboard, go to your project → **Connection Details**
- For **serverless environments** (Vercel, Netlify), use the **Connection Pooling** connection string
- It should look like: `postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require`
- Make sure you're using the **pooler** endpoint (contains `pooler` in the hostname)

#### 3. Missing DATABASE_URL Environment Variable

**Problem**: The `.env` file is missing or not loaded.

**Solution**:
1. Check if `.env` file exists in the project root
2. Verify it contains:
   ```env
   DATABASE_URL="your-connection-string-here"
   ```
3. Restart your development server after adding/updating `.env`
4. In production (Vercel), set it in Project Settings → Environment Variables

#### 4. Connection String Format Issues

**Problem**: Incorrect format or missing parameters.

**Solution**:
- Ensure SSL mode is set: `?sslmode=require`
- For Neon pooler, you might need: `?sslmode=require&pgbouncer=true`
- Remove `channel_binding=require` if it causes issues
- The format should be: `postgresql://user:password@host:port/database?params`

**Correct Neon Pooler Format**:
```env
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require"
```

#### 5. Network/Firewall Issues

**Problem**: Your network or firewall is blocking the connection.

**Solution**:
- Check if you're behind a corporate firewall/VPN
- Try connecting from a different network
- Check Neon dashboard for IP allowlist settings (if any)

### How to Test Your Connection

#### Method 1: Using Prisma CLI

```bash
# Test connection
npx prisma db push --skip-generate

# If successful, you'll see:
# "Your database is now in sync with your Prisma schema."
```

#### Method 2: Using psql (if installed)

```bash
# Extract connection details from your DATABASE_URL and use psql
psql "your-connection-string-here"
```

#### Method 3: Check Environment Variable

```bash
# In your terminal (ensure you're in project root)
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL ? 'DATABASE_URL is set' : 'DATABASE_URL is missing')"
```

### Quick Fix Checklist

- [ ] Check Neon dashboard - is database active?
- [ ] Verify `.env` file exists and contains `DATABASE_URL`
- [ ] Use the **pooler** connection string (for serverless)
- [ ] Restart development server after changing `.env`
- [ ] Check connection string format is correct
- [ ] Ensure `sslmode=require` is in the connection string
- [ ] Try waking up the database in Neon dashboard
- [ ] Verify no firewall/VPN is blocking connections

### For Production (Vercel)

1. **Set Environment Variable**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `DATABASE_URL` with your connection string
   - Use the **pooler** connection string (important for serverless)
   - Redeploy after adding

2. **Verify Connection**:
   - Check Vercel function logs for connection errors
   - Test the `/api/db/seed` endpoint to verify database connectivity

3. **Connection Pooling**:
   - Neon's pooler is automatically used when you use the pooler endpoint
   - Pooler endpoints contain `pooler` in the hostname
   - Direct connections don't work well in serverless environments

### Example Connection Strings

**Neon Pooler (Recommended for Serverless)**:
```
postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
```

**Neon Direct (Not recommended for serverless)**:
```
postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### Still Having Issues?

1. **Check Neon Status**: Visit [Neon Status Page](https://status.neon.tech)
2. **Review Logs**: Check your application logs for detailed error messages
3. **Test with Simple Script**:
   ```typescript
   import { PrismaClient } from '@prisma/client'
   const prisma = new PrismaClient()
   prisma.$connect().then(() => {
     console.log('Connected!')
     prisma.$disconnect()
   }).catch(console.error)
   ```
4. **Contact Support**: If none of the above works, there might be an issue with your Neon account or the database itself

