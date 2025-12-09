# RetailFlow ERP - API Documentation

## Base URL
\`/api\`

## Authentication
All API endpoints require authentication (to be implemented with proper auth middleware).

---

## Products API

### GET /api/products
List all products with optional filtering.

**Query Parameters:**
- \`category\` (string) - Filter by category
- \`search\` (string) - Search by name or SKU
- \`active\` (boolean) - Filter by active status

**Response:**
\`\`\`json
{
  "success": true,
  "data": [...],
  "total": 10
}
\`\`\`

### POST /api/products
Create a new product.

**Request Body:**
\`\`\`json
{
  "sku": "ELEC-005",
  "name": "Bluetooth Speaker",
  "description": "Portable wireless speaker",
  "price": 49.99,
  "cost": 25.00,
  "category": "Electronics",
  "minStock": 15,
  "active": true
}
\`\`\`

### GET /api/products/:id
Get a single product by ID.

### PUT /api/products/:id
Update a product.

### DELETE /api/products/:id
Soft delete (deactivate) a product.

---

## Inventory API

### POST /api/inventory/adjust
Adjust inventory levels.

**Request Body:**
\`\`\`json
{
  "productId": "prod_001",
  "quantity": 10,
  "type": "IN",
  "reason": "Stock replenishment"
}
\`\`\`

**Type values:** \`IN\`, \`OUT\`, \`ADJUSTMENT\`

---

## Sales Orders API

### GET /api/sales/orders
List all sales orders.

**Query Parameters:**
- \`status\` (string) - Filter by status
- \`customerId\` (string) - Filter by customer
- \`search\` (string) - Search by order number or customer name

### POST /api/sales/orders
Create a new sales order.

**Request Body:**
\`\`\`json
{
  "customerId": "cust_001",
  "items": [
    {
      "productId": "prod_001",
      "quantity": 2,
      "unitPrice": 29.99
    }
  ],
  "notes": "Rush delivery"
}
\`\`\`

### GET /api/sales/orders/:id
Get a single order by ID.

### PUT /api/sales/orders/:id
Update order status.

**Request Body:**
\`\`\`json
{
  "status": "CONFIRMED"
}
\`\`\`

**Status values:** \`PENDING\`, \`CONFIRMED\`, \`SHIPPED\`, \`DELIVERED\`, \`CANCELLED\`

---

## Customers API

### GET /api/customers
List all customers.

### POST /api/customers
Create a new customer.

**Request Body:**
\`\`\`json
{
  "name": "New Company Inc.",
  "email": "contact@newcompany.com",
  "phone": "555-1234",
  "address": "123 Main St, City, ST 12345"
}
\`\`\`

---

## Employees API

### GET /api/employees
List all employees.

**Query Parameters:**
- \`department\` (string) - Filter by department
- \`status\` (string) - Filter by status
- \`search\` (string) - Search by name or email

### POST /api/employees
Create a new employee.

**Request Body:**
\`\`\`json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@retailflow.com",
  "phone": "555-5678",
  "department": "Sales",
  "position": "Sales Associate",
  "hireDate": "2024-01-15",
  "salary": 45000,
  "status": "ACTIVE"
}
\`\`\`

---

## Transactions API

### GET /api/transactions
List all transactions.

**Query Parameters:**
- \`type\` (string) - Filter by type (\`INCOME\`, \`EXPENSE\`)
- \`category\` (string) - Filter by category
- \`search\` (string) - Search by category or description

**Response includes summary:**
\`\`\`json
{
  "success": true,
  "data": [...],
  "total": 6,
  "summary": {
    "totalIncome": 1099.88,
    "totalExpenses": 2550.00,
    "netProfit": -1450.12
  }
}
\`\`\`

### POST /api/transactions
Create a new transaction.

**Request Body:**
\`\`\`json
{
  "type": "EXPENSE",
  "amount": 500.00,
  "category": "Operations",
  "description": "Office supplies purchase",
  "date": "2024-12-08"
}
\`\`\`

---

## Suppliers API

### GET /api/suppliers
List all suppliers.

### POST /api/suppliers
Create a new supplier.

**Request Body:**
\`\`\`json
{
  "name": "New Supplier Ltd.",
  "contactName": "Jane Smith",
  "email": "jane@newsupplier.com",
  "phone": "555-9999",
  "address": "456 Supplier Way, City, ST 67890",
  "active": true
}
\`\`\`

---

## Dashboard API

### GET /api/dashboard/stats
Get dashboard statistics.

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "totalRevenue": 1099.88,
    "totalOrders": 5,
    "totalProducts": 10,
    "totalCustomers": 5,
    "lowStockCount": 0,
    "pendingOrders": 1,
    "revenueChange": 12.5,
    "ordersChange": 8.2
  }
}
\`\`\`

---

## Error Responses

All endpoints return errors in this format:

\`\`\`json
{
  "success": false,
  "error": "Error message",
  "details": [...] // Optional validation details
}
\`\`\`

**HTTP Status Codes:**
- \`200\` - Success
- \`201\` - Created
- \`400\` - Bad Request (validation errors)
- \`404\` - Not Found
- \`500\` - Server Error
