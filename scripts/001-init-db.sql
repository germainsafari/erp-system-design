-- RetailFlow ERP Database Initialization Script
-- Run this script to set up the database schema

-- Create enum types
CREATE TYPE role AS ENUM ('ADMIN', 'MANAGER', 'EMPLOYEE');
CREATE TYPE inventory_type AS ENUM ('IN', 'OUT', 'ADJUSTMENT');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE purchase_order_status AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED');
CREATE TYPE employee_status AS ENUM ('ACTIVE', 'ON_LEAVE', 'TERMINATED');
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(30) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role role DEFAULT 'EMPLOYEE',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(30) PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    min_stock INT DEFAULT 10,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory entries table
CREATE TABLE IF NOT EXISTS inventory_entries (
    id VARCHAR(30) PRIMARY KEY,
    product_id VARCHAR(30) NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    type inventory_type NOT NULL,
    reason VARCHAR(255),
    created_by VARCHAR(30) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sales orders table
CREATE TABLE IF NOT EXISTS sales_orders (
    id VARCHAR(30) PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id VARCHAR(30) NOT NULL REFERENCES customers(id),
    status order_status DEFAULT 'PENDING',
    total DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    order_date TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(30) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sales order items table
CREATE TABLE IF NOT EXISTS sales_order_items (
    id VARCHAR(30) PRIMARY KEY,
    order_id VARCHAR(30) NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id VARCHAR(30) NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Purchase orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id VARCHAR(30) PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    supplier_id VARCHAR(30) NOT NULL REFERENCES suppliers(id),
    status purchase_order_status DEFAULT 'DRAFT',
    total DECIMAL(10, 2) NOT NULL,
    order_date TIMESTAMP,
    expected_date TIMESTAMP,
    received_date TIMESTAMP,
    notes TEXT,
    created_by VARCHAR(30) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Purchase order items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id VARCHAR(30) PRIMARY KEY,
    order_id VARCHAR(30) NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id VARCHAR(30) NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(30) PRIMARY KEY,
    user_id VARCHAR(30) UNIQUE REFERENCES users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    hire_date DATE NOT NULL,
    salary DECIMAL(10, 2),
    status employee_status DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(30) PRIMARY KEY,
    type transaction_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    order_id VARCHAR(30) REFERENCES sales_orders(id),
    created_by VARCHAR(30) REFERENCES users(id),
    date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_inventory_entries_product ON inventory_entries(product_id);
CREATE INDEX idx_inventory_entries_type ON inventory_entries(type);
CREATE INDEX idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);
CREATE INDEX idx_sales_orders_date ON sales_orders(order_date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);

-- Success message
SELECT 'Database schema created successfully!' as message;
