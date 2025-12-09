// RetailFlow ERP Type Definitions

// ============================================
// ENUMS
// ============================================

export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE"
export type InventoryType = "IN" | "OUT" | "ADJUSTMENT"
export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"
export type PurchaseOrderStatus = "DRAFT" | "PENDING" | "APPROVED" | "ORDERED" | "RECEIVED" | "CANCELLED"
export type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "TERMINATED"
export type TransactionType = "INCOME" | "EXPENSE"

// ============================================
// BASE TYPES
// ============================================

export interface User {
  id: string
  email: string
  name: string
  role: Role
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  sku: string
  name: string
  description?: string | null
  price: number
  cost: number
  category: string
  minStock: number
  active: boolean
  currentStock?: number
  createdAt: Date
  updatedAt: Date
}

export interface InventoryEntry {
  id: string
  productId: string
  quantity: number
  type: InventoryType
  reason?: string | null
  createdBy?: string | null
  createdAt: Date
  product?: Product
  user?: User
}

export interface Supplier {
  id: string
  name: string
  contactName?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Customer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SalesOrder {
  id: string
  orderNumber: string
  customerId: string
  status: OrderStatus
  total: number
  notes?: string | null
  orderDate: Date
  createdBy?: string | null
  createdAt: Date
  updatedAt: Date
  customer?: Customer
  items?: SalesOrderItem[]
  user?: User
}

export interface SalesOrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
  subtotal: number
  product?: Product
}

export interface Employee {
  id: string
  userId?: string | null
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  department: string
  position: string
  hireDate: Date
  salary?: number | null
  status: EmployeeStatus
  createdAt: Date
  updatedAt: Date
  user?: User
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  description?: string | null
  orderId?: string | null
  createdBy?: string | null
  date: Date
  createdAt: Date
  order?: SalesOrder
  user?: User
}

export interface PurchaseOrder {
  id: string
  orderNumber: string
  supplierId: string
  status: PurchaseOrderStatus
  total: number
  orderDate?: Date | null
  expectedDate?: Date | null
  receivedDate?: Date | null
  notes?: string | null
  createdBy?: string | null
  createdAt: Date
  updatedAt: Date
  supplier?: Supplier
  items?: PurchaseOrderItem[]
  user?: User
}

export interface PurchaseOrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitCost: number
  subtotal: number
  product?: Product
}

// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  lowStockCount: number
  pendingOrders: number
  revenueChange: number
  ordersChange: number
}

export interface RecentActivity {
  id: string
  type: "order" | "inventory" | "transaction" | "employee"
  title: string
  description: string
  timestamp: Date
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }[]
}
