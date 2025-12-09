// Prisma seed script to migrate hardcoded data to database
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// Password hash for 'password123'
const PASSWORD_HASH = bcrypt.hashSync("password123", 10)

async function main() {
  console.log("🌱 Starting database seed...")

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🧹 Cleaning existing data...")
  await prisma.transaction.deleteMany()
  await prisma.salesOrderItem.deleteMany()
  await prisma.salesOrder.deleteMany()
  await prisma.inventoryEntry.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  // Seed Users (password is 'password123' hashed with bcrypt)
  console.log("👤 Seeding users...")
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: "usr_admin001",
        email: "admin@retailflow.com",
        name: "System Admin",
        passwordHash: PASSWORD_HASH,
        role: "ADMIN",
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        id: "usr_mgr001",
        email: "manager@retailflow.com",
        name: "Store Manager",
        passwordHash: PASSWORD_HASH,
        role: "MANAGER",
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        id: "usr_emp001",
        email: "sales@retailflow.com",
        name: "Sales Associate",
        passwordHash: PASSWORD_HASH,
        role: "EMPLOYEE",
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        id: "usr_emp002",
        email: "warehouse@retailflow.com",
        name: "Warehouse Staff",
        passwordHash: PASSWORD_HASH,
        role: "EMPLOYEE",
        active: true,
      },
    }),
  ])

  // Seed Products
  console.log("📦 Seeding products...")
  const products = await Promise.all([
    prisma.product.create({
      data: {
        id: "prod_001",
        sku: "ELEC-001",
        name: "Wireless Mouse",
        description: "Ergonomic wireless mouse with USB receiver",
        price: 29.99,
        cost: 15.0,
        category: "Electronics",
        minStock: 20,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        id: "prod_002",
        sku: "ELEC-002",
        name: "USB-C Hub",
        description: "7-in-1 USB-C hub with HDMI and USB 3.0",
        price: 49.99,
        cost: 25.0,
        category: "Electronics",
        minStock: 15,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        id: "prod_003",
        sku: "ELEC-003",
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with blue switches",
        price: 89.99,
        cost: 45.0,
        category: "Electronics",
        minStock: 10,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        id: "prod_004",
        sku: "ELEC-004",
        name: "Webcam HD",
        description: "1080p HD webcam with microphone",
        price: 59.99,
        cost: 30.0,
        category: "Electronics",
        minStock: 12,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        id: "prod_005",
        sku: "FURN-001",
        name: "Office Chair",
        description: "Ergonomic mesh office chair",
        price: 199.99,
        cost: 100.0,
        category: "Furniture",
        minStock: 5,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        id: "prod_006",
        sku: "FURN-002",
        name: "Standing Desk",
        description: "Electric height-adjustable standing desk",
        price: 399.99,
        cost: 200.0,
        category: "Furniture",
        minStock: 3,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        id: "prod_007",
        sku: "FURN-003",
        name: "Monitor Stand",
        description: "Adjustable monitor stand with drawer",
        price: 39.99,
        cost: 18.0,
        category: "Furniture",
        minStock: 15,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        id: "prod_008",
        sku: "SUPP-001",
        name: "Notebook Set",
        description: "Pack of 5 lined notebooks",
        price: 12.99,
        cost: 5.0,
        category: "Supplies",
        minStock: 50,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        id: "prod_009",
        sku: "SUPP-002",
        name: "Pen Pack",
        description: "Pack of 10 ballpoint pens",
        price: 8.99,
        cost: 3.0,
        category: "Supplies",
        minStock: 100,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        id: "prod_010",
        sku: "SUPP-003",
        name: "Desk Organizer",
        description: "Wooden desk organizer with compartments",
        price: 24.99,
        cost: 10.0,
        category: "Supplies",
        minStock: 25,
        active: true,
      },
    }),
  ])

  // Seed Inventory Entries (initial stock)
  console.log("📊 Seeding inventory entries...")
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  await Promise.all([
    prisma.inventoryEntry.create({
      data: {
        id: "inv_001",
        productId: "prod_001",
        quantity: 50,
        type: "IN",
        reason: "Initial stock",
        createdBy: "usr_admin001",
        createdAt: thirtyDaysAgo,
      },
    }),
    prisma.inventoryEntry.create({
      data: {
        id: "inv_002",
        productId: "prod_002",
        quantity: 30,
        type: "IN",
        reason: "Initial stock",
        createdBy: "usr_admin001",
        createdAt: thirtyDaysAgo,
      },
    }),
    prisma.inventoryEntry.create({
      data: {
        id: "inv_003",
        productId: "prod_003",
        quantity: 25,
        type: "IN",
        reason: "Initial stock",
        createdBy: "usr_admin001",
        createdAt: thirtyDaysAgo,
      },
    }),
    prisma.inventoryEntry.create({
      data: {
        id: "inv_004",
        productId: "prod_004",
        quantity: 20,
        type: "IN",
        reason: "Initial stock",
        createdBy: "usr_admin001",
        createdAt: thirtyDaysAgo,
      },
    }),
    prisma.inventoryEntry.create({
      data: {
        id: "inv_005",
        productId: "prod_005",
        quantity: 10,
        type: "IN",
        reason: "Initial stock",
        createdBy: "usr_admin001",
        createdAt: thirtyDaysAgo,
      },
    }),
    prisma.inventoryEntry.create({
      data: {
        id: "inv_006",
        productId: "prod_006",
        quantity: 5,
        type: "IN",
        reason: "Initial stock",
        createdBy: "usr_admin001",
        createdAt: thirtyDaysAgo,
      },
    }),
    prisma.inventoryEntry.create({
      data: {
        id: "inv_007",
        productId: "prod_007",
        quantity: 35,
        type: "IN",
        reason: "Initial stock",
        createdBy: "usr_admin001",
        createdAt: thirtyDaysAgo,
      },
    }),
    prisma.inventoryEntry.create({
      data: {
        id: "inv_008",
        productId: "prod_008",
        quantity: 100,
        type: "IN",
        reason: "Initial stock",
        createdBy: "usr_admin001",
        createdAt: thirtyDaysAgo,
      },
    }),
    prisma.inventoryEntry.create({
      data: {
        id: "inv_009",
        productId: "prod_009",
        quantity: 200,
        type: "IN",
        reason: "Initial stock",
        createdBy: "usr_admin001",
        createdAt: thirtyDaysAgo,
      },
    }),
    prisma.inventoryEntry.create({
      data: {
        id: "inv_010",
        productId: "prod_010",
        quantity: 40,
        type: "IN",
        reason: "Initial stock",
        createdBy: "usr_admin001",
        createdAt: thirtyDaysAgo,
      },
    }),
  ])

  // Seed Suppliers
  console.log("🏢 Seeding suppliers...")
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        id: "sup_001",
        name: "TechWorld Distributors",
        contactName: "John Smith",
        email: "john@techworld.com",
        phone: "555-0101",
        address: "123 Tech Lane, Silicon Valley, CA 94000",
        active: true,
      },
    }),
    prisma.supplier.create({
      data: {
        id: "sup_002",
        name: "Office Essentials Co.",
        contactName: "Sarah Johnson",
        email: "sarah@officeess.com",
        phone: "555-0102",
        address: "456 Business Park, New York, NY 10001",
        active: true,
      },
    }),
    prisma.supplier.create({
      data: {
        id: "sup_003",
        name: "Furniture Direct",
        contactName: "Mike Wilson",
        email: "mike@furnituredirect.com",
        phone: "555-0103",
        address: "789 Industrial Ave, Chicago, IL 60601",
        active: true,
      },
    }),
  ])

  // Seed Customers
  console.log("👥 Seeding customers...")
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        id: "cust_001",
        name: "Acme Corporation",
        email: "orders@acme.com",
        phone: "555-1001",
        address: "100 Corporate Blvd, Boston, MA 02101",
      },
    }),
    prisma.customer.create({
      data: {
        id: "cust_002",
        name: "StartupX Inc.",
        email: "purchasing@startupx.com",
        phone: "555-1002",
        address: "200 Innovation Way, San Francisco, CA 94102",
      },
    }),
    prisma.customer.create({
      data: {
        id: "cust_003",
        name: "Local Business LLC",
        email: "info@localbusiness.com",
        phone: "555-1003",
        address: "300 Main Street, Austin, TX 78701",
      },
    }),
    prisma.customer.create({
      data: {
        id: "cust_004",
        name: "Enterprise Solutions",
        email: "orders@enterprise.com",
        phone: "555-1004",
        address: "400 Tower Plaza, Seattle, WA 98101",
      },
    }),
    prisma.customer.create({
      data: {
        id: "cust_005",
        name: "Creative Agency",
        email: "hello@creative.com",
        phone: "555-1005",
        address: "500 Design District, Los Angeles, CA 90001",
      },
    }),
  ])

  // Seed Sales Orders
  console.log("🛒 Seeding sales orders...")
  const twentyDaysAgo = new Date()
  twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20)
  const fifteenDaysAgo = new Date()
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)
  const fiveDaysAgo = new Date()
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)

  const orders = await Promise.all([
    prisma.salesOrder.create({
      data: {
        id: "so_001",
        orderNumber: "SO-2024-0001",
        customerId: "cust_001",
        status: "DELIVERED",
        total: 289.95,
        notes: "Rush delivery requested",
        orderDate: twentyDaysAgo,
        createdBy: "usr_emp001",
      },
    }),
    prisma.salesOrder.create({
      data: {
        id: "so_002",
        orderNumber: "SO-2024-0002",
        customerId: "cust_002",
        status: "DELIVERED",
        total: 649.96,
        notes: null,
        orderDate: fifteenDaysAgo,
        createdBy: "usr_emp001",
      },
    }),
    prisma.salesOrder.create({
      data: {
        id: "so_003",
        orderNumber: "SO-2024-0003",
        customerId: "cust_003",
        status: "SHIPPED",
        total: 159.97,
        notes: "Leave at reception",
        orderDate: fiveDaysAgo,
        createdBy: "usr_emp001",
      },
    }),
    prisma.salesOrder.create({
      data: {
        id: "so_004",
        orderNumber: "SO-2024-0004",
        customerId: "cust_004",
        status: "CONFIRMED",
        total: 899.97,
        notes: null,
        orderDate: twoDaysAgo,
        createdBy: "usr_mgr001",
      },
    }),
    prisma.salesOrder.create({
      data: {
        id: "so_005",
        orderNumber: "SO-2024-0005",
        customerId: "cust_005",
        status: "PENDING",
        total: 179.97,
        notes: "Call before delivery",
        orderDate: oneDayAgo,
        createdBy: "usr_emp001",
      },
    }),
  ])

  // Seed Sales Order Items
  console.log("📋 Seeding sales order items...")
  await Promise.all([
    prisma.salesOrderItem.create({
      data: {
        id: "soi_001",
        orderId: "so_001",
        productId: "prod_001",
        quantity: 3,
        unitPrice: 29.99,
        subtotal: 89.97,
      },
    }),
    prisma.salesOrderItem.create({
      data: {
        id: "soi_002",
        orderId: "so_001",
        productId: "prod_005",
        quantity: 1,
        unitPrice: 199.99,
        subtotal: 199.98,
      },
    }),
    prisma.salesOrderItem.create({
      data: {
        id: "soi_003",
        orderId: "so_002",
        productId: "prod_003",
        quantity: 2,
        unitPrice: 89.99,
        subtotal: 179.98,
      },
    }),
    prisma.salesOrderItem.create({
      data: {
        id: "soi_004",
        orderId: "so_002",
        productId: "prod_002",
        quantity: 3,
        unitPrice: 49.99,
        subtotal: 149.97,
      },
    }),
    prisma.salesOrderItem.create({
      data: {
        id: "soi_005",
        orderId: "so_002",
        productId: "prod_006",
        quantity: 1,
        unitPrice: 399.99,
        subtotal: 399.99,
      },
    }),
    prisma.salesOrderItem.create({
      data: {
        id: "soi_006",
        orderId: "so_003",
        productId: "prod_001",
        quantity: 2,
        unitPrice: 29.99,
        subtotal: 59.98,
      },
    }),
    prisma.salesOrderItem.create({
      data: {
        id: "soi_007",
        orderId: "so_003",
        productId: "prod_007",
        quantity: 2,
        unitPrice: 39.99,
        subtotal: 79.98,
      },
    }),
    prisma.salesOrderItem.create({
      data: {
        id: "soi_008",
        orderId: "so_003",
        productId: "prod_009",
        quantity: 2,
        unitPrice: 8.99,
        subtotal: 17.98,
      },
    }),
    prisma.salesOrderItem.create({
      data: {
        id: "soi_009",
        orderId: "so_004",
        productId: "prod_005",
        quantity: 3,
        unitPrice: 199.99,
        subtotal: 599.97,
      },
    }),
    prisma.salesOrderItem.create({
      data: {
        id: "soi_010",
        orderId: "so_004",
        productId: "prod_001",
        quantity: 10,
        unitPrice: 29.99,
        subtotal: 299.9,
      },
    }),
    prisma.salesOrderItem.create({
      data: {
        id: "soi_011",
        orderId: "so_005",
        productId: "prod_004",
        quantity: 3,
        unitPrice: 59.99,
        subtotal: 179.97,
      },
    }),
  ])

  // Update inventory for sold items
  console.log("📦 Updating inventory for sold items...")
  const nineteenDaysAgo = new Date()
  nineteenDaysAgo.setDate(nineteenDaysAgo.getDate() - 19)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  const fourDaysAgo = new Date()
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4)

  await Promise.all([
    prisma.inventoryEntry.create({
      data: {
        id: "inv_011",
        productId: "prod_001",
        quantity: -3,
        type: "OUT",
        reason: "Sales Order SO-2024-0001",
        createdBy: "usr_emp001",
        createdAt: nineteenDaysAgo,
      },
    }),
    prisma.inventoryEntry.create({
      data: {
        id: "inv_012",
        productId: "prod_005",
        quantity: -1,
        type: "OUT",
        reason: "Sales Order SO-2024-0001",
        createdBy: "usr_emp001",
        createdAt: nineteenDaysAgo,
      },
    }),
    prisma.inventoryEntry.create({
      data: {
        id: "inv_013",
        productId: "prod_003",
        quantity: -2,
        type: "OUT",
        reason: "Sales Order SO-2024-0002",
        createdBy: "usr_emp001",
        createdAt: fourteenDaysAgo,
      },
    }),
    prisma.inventoryEntry.create({
      data: {
        id: "inv_014",
        productId: "prod_002",
        quantity: -3,
        type: "OUT",
        reason: "Sales Order SO-2024-0002",
        createdBy: "usr_emp001",
        createdAt: fourteenDaysAgo,
      },
    }),
    prisma.inventoryEntry.create({
      data: {
        id: "inv_015",
        productId: "prod_006",
        quantity: -1,
        type: "OUT",
        reason: "Sales Order SO-2024-0002",
        createdBy: "usr_emp001",
        createdAt: fourteenDaysAgo,
      },
    }),
    prisma.inventoryEntry.create({
      data: {
        id: "inv_016",
        productId: "prod_001",
        quantity: -2,
        type: "OUT",
        reason: "Sales Order SO-2024-0003",
        createdBy: "usr_emp001",
        createdAt: fourDaysAgo,
      },
    }),
    prisma.inventoryEntry.create({
      data: {
        id: "inv_017",
        productId: "prod_007",
        quantity: -2,
        type: "OUT",
        reason: "Sales Order SO-2024-0003",
        createdBy: "usr_emp001",
        createdAt: fourDaysAgo,
      },
    }),
    prisma.inventoryEntry.create({
      data: {
        id: "inv_018",
        productId: "prod_009",
        quantity: -2,
        type: "OUT",
        reason: "Sales Order SO-2024-0003",
        createdBy: "usr_emp001",
        createdAt: fourDaysAgo,
      },
    }),
  ])

  // Seed Employees
  console.log("👔 Seeding employees...")
  await Promise.all([
    prisma.employee.create({
      data: {
        id: "emp_001",
        userId: "usr_mgr001",
        firstName: "Alice",
        lastName: "Thompson",
        email: "manager@retailflow.com",
        phone: "555-2001",
        department: "Management",
        position: "Store Manager",
        hireDate: new Date("2022-01-15"),
        salary: 65000.0,
        status: "ACTIVE",
      },
    }),
    prisma.employee.create({
      data: {
        id: "emp_002",
        userId: "usr_emp001",
        firstName: "Bob",
        lastName: "Martinez",
        email: "sales@retailflow.com",
        phone: "555-2002",
        department: "Sales",
        position: "Sales Associate",
        hireDate: new Date("2023-03-01"),
        salary: 42000.0,
        status: "ACTIVE",
      },
    }),
    prisma.employee.create({
      data: {
        id: "emp_003",
        userId: "usr_emp002",
        firstName: "Carol",
        lastName: "Davis",
        email: "warehouse@retailflow.com",
        phone: "555-2003",
        department: "Warehouse",
        position: "Warehouse Staff",
        hireDate: new Date("2023-06-15"),
        salary: 38000.0,
        status: "ACTIVE",
      },
    }),
    prisma.employee.create({
      data: {
        id: "emp_004",
        userId: null,
        firstName: "David",
        lastName: "Chen",
        email: "david.chen@retailflow.com",
        phone: "555-2004",
        department: "Sales",
        position: "Sales Associate",
        hireDate: new Date("2024-01-10"),
        salary: 40000.0,
        status: "ACTIVE",
      },
    }),
    prisma.employee.create({
      data: {
        id: "emp_005",
        userId: null,
        firstName: "Eva",
        lastName: "Rodriguez",
        email: "eva.r@retailflow.com",
        phone: "555-2005",
        department: "Accounting",
        position: "Accountant",
        hireDate: new Date("2022-08-20"),
        salary: 55000.0,
        status: "ACTIVE",
      },
    }),
  ])

  // Seed Transactions
  console.log("💰 Seeding transactions...")
  const tenDaysAgo = new Date()
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  await Promise.all([
    prisma.transaction.create({
      data: {
        id: "txn_001",
        type: "INCOME",
        amount: 289.95,
        category: "Sales",
        description: "Payment for SO-2024-0001",
        orderId: "so_001",
        createdBy: "usr_emp001",
        date: nineteenDaysAgo,
      },
    }),
    prisma.transaction.create({
      data: {
        id: "txn_002",
        type: "INCOME",
        amount: 649.96,
        category: "Sales",
        description: "Payment for SO-2024-0002",
        orderId: "so_002",
        createdBy: "usr_emp001",
        date: fourteenDaysAgo,
      },
    }),
    prisma.transaction.create({
      data: {
        id: "txn_003",
        type: "EXPENSE",
        amount: 1500.0,
        category: "Inventory",
        description: "Stock replenishment - Electronics",
        orderId: null,
        createdBy: "usr_mgr001",
        date: tenDaysAgo,
      },
    }),
    prisma.transaction.create({
      data: {
        id: "txn_004",
        type: "EXPENSE",
        amount: 800.0,
        category: "Operations",
        description: "Monthly utilities",
        orderId: null,
        createdBy: "usr_mgr001",
        date: sevenDaysAgo,
      },
    }),
    prisma.transaction.create({
      data: {
        id: "txn_005",
        type: "EXPENSE",
        amount: 250.0,
        category: "Marketing",
        description: "Social media advertising",
        orderId: null,
        createdBy: "usr_mgr001",
        date: fiveDaysAgo,
      },
    }),
    prisma.transaction.create({
      data: {
        id: "txn_006",
        type: "INCOME",
        amount: 159.97,
        category: "Sales",
        description: "Payment for SO-2024-0003",
        orderId: "so_003",
        createdBy: "usr_emp001",
        date: fourDaysAgo,
      },
    }),
  ])

  console.log("✅ Database seed completed successfully!")
  console.log(`   - ${users.length} users created`)
  console.log(`   - ${products.length} products created`)
  console.log(`   - ${suppliers.length} suppliers created`)
  console.log(`   - ${customers.length} customers created`)
  console.log(`   - ${orders.length} sales orders created`)
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


