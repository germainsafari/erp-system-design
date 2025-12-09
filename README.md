# RetailFlow ERP

A Modern Enterprise Resource Planning System for Retail Businesses

## Features

- 📊 **Unified Dashboard** - Real-time business insights and KPIs
- 📦 **Inventory Management** - Track products, stock levels, and low stock alerts
- 🛒 **Sales Orders** - Complete order lifecycle management
- 👥 **Customer Management** - Maintain customer database
- 👔 **HR Module** - Employee management and tracking
- 💰 **Accounting** - Financial transactions and reporting
- 🏢 **Supplier Management** - Track suppliers and purchase orders

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Radix UI, shadcn/ui

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

### 3. Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Default Accounts

After seeding:

- **Admin**: admin@retailflow.com / password123
- **Manager**: manager@retailflow.com / password123
- **Employee**: sales@retailflow.com / password123

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── inventory/         # Inventory pages
│   ├── sales/             # Sales pages
│   └── ...
├── components/            # React components
├── lib/                   # Utilities and database
│   ├── db.ts             # Prisma client
│   └── types.ts          # TypeScript types
├── prisma/               # Prisma schema and migrations
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
└── scripts/             # SQL scripts (legacy)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with demo data

## Database Schema

The system uses Prisma ORM with PostgreSQL. Key models:

- **User** - System users with role-based access
- **Product** - Inventory products
- **Customer** - Customer records
- **SalesOrder** - Sales orders with items
- **Employee** - HR records
- **Transaction** - Financial transactions
- **Supplier** - Supplier information
- **InventoryEntry** - Stock movement tracking

## Deployment

### Hugging Face Spaces

1. Push code to your Hugging Face Space repository
2. Set `DATABASE_URL` in Space settings
3. The system will automatically build and deploy

### Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string

## Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [API Documentation](./docs/API_DOCUMENTATION.md) - API endpoints
- [Demo Guide](./docs/DEMO_GUIDE.md) - Demo presentation guide

## License

Private - All rights reserved


