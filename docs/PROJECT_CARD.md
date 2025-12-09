# RetailFlow ERP System

## Project Card

### Project Title
**RetailFlow ERP** - A simplified Enterprise Resource Planning system for small-to-medium retail businesses.

---

## Business Problem

Small retail businesses struggle with:
- **Disconnected systems** - Inventory, sales, and accounting tracked separately
- **Manual processes** - Time-consuming data entry and reconciliation
- **Poor visibility** - No real-time insights into stock levels or sales performance
- **Inefficient HR management** - Employee records scattered across spreadsheets

---

## System Scope

RetailFlow ERP integrates **4 core modules** that work together:

| Module | Purpose | Key Features |
|--------|---------|--------------|
| **Inventory** | Stock management | Products, stock levels, reorder alerts |
| **Sales** | Order processing | Sales orders, customer management |
| **HR** | Employee management | Employee records, roles, departments |
| **Accounting** | Financial tracking | Transactions, invoices, reports |

---

## Module Descriptions

### 1. Inventory Module
- Product catalog with SKU, price, and category management
- Real-time stock tracking with minimum stock alerts
- Stock adjustment history and audit logs
- Supplier linkage for procurement

### 2. Sales Module
- Customer database with contact information
- Sales order creation and tracking
- Order status workflow (Pending → Confirmed → Shipped → Delivered)
- Automatic inventory deduction on order confirmation

### 3. HR Module
- Employee profiles with personal and contact details
- Department and role management
- Employment history and status tracking
- Role-based access control integration

### 4. Accounting Module
- Transaction ledger for all financial activities
- Invoice generation linked to sales orders
- Expense tracking and categorization
- Basic financial reports (revenue, expenses, profit)

---

## Technical Architecture

### Stack
- **Frontend**: Next.js 14+ with React Server Components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL via Prisma ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **Auth**: Role-based access control (Admin, Manager, Employee)

### Architecture Principles
1. **Modular Structure** - Each module is self-contained with its own services, validators, and UI
2. **API-First** - All operations go through typed API endpoints
3. **Type Safety** - Full TypeScript coverage
4. **Audit Trail** - All data changes logged with timestamps and user info

---

## Database Design Summary

### Core Entities
- `User` - System users with roles
- `Product` - Inventory items
- `InventoryEntry` - Stock level records
- `Customer` - Sales customers
- `SalesOrder` / `SalesOrderItem` - Order management
- `Supplier` - Vendor information
- `PurchaseOrder` - Procurement tracking
- `Employee` - HR records
- `Transaction` - Financial ledger

### Key Relationships
- Products ↔ InventoryEntries (1:N)
- SalesOrders ↔ SalesOrderItems (1:N)
- SalesOrderItems → Products (N:1)
- Employees → Users (1:1 optional)
- Transactions → SalesOrders (N:1 optional)

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
- [x] Project setup and folder structure
- [x] Database schema design
- [x] Core UI layout (sidebar, dashboard shell)
- [x] Authentication framework

### Phase 2: Core Modules (Week 2-3)
- [ ] Inventory module (CRUD + stock management)
- [ ] Sales module (orders + customer management)
- [ ] HR module (employee management)
- [ ] Accounting module (transactions + reports)

### Phase 3: Integration (Week 4)
- [ ] Cross-module workflows
- [ ] Reports and analytics
- [ ] Testing and validation

---

## Assumptions & Limitations

### Assumptions
- Single-location retail operation
- Basic accounting (not full double-entry)
- English language only
- Standard business hours operation

### Limitations
- No multi-currency support
- No advanced manufacturing/BOM features
- Basic reporting (no BI integration)
- No mobile app (responsive web only)

---

## Future Improvements

1. **Multi-location support** - Branch management
2. **Advanced analytics** - BI dashboard integration
3. **E-commerce integration** - Online sales sync
4. **Mobile app** - Native iOS/Android apps
5. **API integrations** - Third-party accounting software
6. **Advanced HR** - Payroll, leave management
