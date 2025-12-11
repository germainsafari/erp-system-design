# Environment Setup

## Important: Create .env File

Since `.env` files are protected, you need to manually create the `.env` file in the root directory.

### Steps:

1. Create a new file named `.env` in the root directory
2. Add the following content:

```env
DATABASE_URL="postgresql://neondb_owner:npg_ruhZXF9cxY5E@ep-jolly-tree-ag7jyryr-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### Verification

After creating the `.env` file, verify it's working:

```bash
# Generate Prisma Client
npm run db:generate

# Test database connection
npm run db:push
```

If the connection is successful, you should see:
- Prisma Client generated successfully
- Database schema pushed without errors

### Next Steps

Once the `.env` file is created:

1. Run `npm install` to install Prisma dependencies
2. Run `npm run db:generate` to generate Prisma Client
3. Run `npm run db:push` to create database tables
4. Run `npm run db:seed` to populate with demo data
5. Run `npm run dev` to start the development server

### Security Note

The `.env` file is already in `.gitignore`, so it won't be committed to GitHub or Hugging Face Space. Make sure to:

- Set the `DATABASE_URL` environment variable in Hugging Face Space settings for production
- Never commit the `.env` file to version control
- Use different database URLs for development and production





