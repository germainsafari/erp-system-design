// RetailFlow ERP Input Validators

import { z } from "zod"

// ============================================
// PRODUCT VALIDATORS
// ============================================

export const createProductSchema = z.object({
  sku: z.string().min(1, "SKU is required").max(50),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  cost: z.number().positive("Cost must be positive"),
  category: z.string().min(1, "Category is required"),
  minStock: z.number().int().min(0).default(10),
  active: z.boolean().default(true),
})

export const updateProductSchema = createProductSchema.partial()

// ============================================
// INVENTORY VALIDATORS
// ============================================

export const adjustInventorySchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z
    .number()
    .int()
    .refine((val) => val !== 0, "Quantity cannot be zero"),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  reason: z.string().optional(),
})

// ============================================
// CUSTOMER VALIDATORS
// ============================================

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export const updateCustomerSchema = createCustomerSchema.partial()

// ============================================
// SALES ORDER VALIDATORS
// ============================================

export const salesOrderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  unitPrice: z.number().positive("Unit price must be positive"),
})

export const createSalesOrderSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  items: z.array(salesOrderItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
})

export const updateSalesOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
})

// ============================================
// EMPLOYEE VALIDATORS
// ============================================

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  hireDate: z.string().or(z.date()),
  salary: z.number().positive().optional(),
  status: z.enum(["ACTIVE", "ON_LEAVE", "TERMINATED"]).default("ACTIVE"),
})

export const updateEmployeeSchema = createEmployeeSchema.partial()

// ============================================
// SUPPLIER VALIDATORS
// ============================================

export const createSupplierSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  contactName: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  active: z.boolean().default(true),
})

export const updateSupplierSchema = createSupplierSchema.partial()

// ============================================
// TRANSACTION VALIDATORS
// ============================================

export const createTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().or(z.date()).optional(),
})

// ============================================
// AUTH VALIDATORS
// ============================================

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]).default("EMPLOYEE"),
})

// Type exports
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type AdjustInventoryInput = z.infer<typeof adjustInventorySchema>
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type CreateSalesOrderInput = z.infer<typeof createSalesOrderSchema>
export type UpdateSalesOrderStatusInput = z.infer<typeof updateSalesOrderStatusSchema>
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
