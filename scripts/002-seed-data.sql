-- RetailFlow ERP Seed Data
-- Run this script after 001-init-db.sql to populate sample data

-- Generate unique IDs function (simple implementation)
-- In production, use proper UUID or CUID generation

-- Seed Users (password is 'password123' hashed with bcrypt)
INSERT INTO users (id, email, name, password_hash, role, active) VALUES
('usr_admin001', 'admin@retailflow.com', 'System Admin', '$2b$10$rQZ8J.hKqMYmYh5NJmrPBOzjPwQrMvXnGXO8VGbQXqvSKDsHzPJHq', 'ADMIN', true),
('usr_mgr001', 'manager@retailflow.com', 'Store Manager', '$2b$10$rQZ8J.hKqMYmYh5NJmrPBOzjPwQrMvXnGXO8VGbQXqvSKDsHzPJHq', 'MANAGER', true),
('usr_emp001', 'sales@retailflow.com', 'Sales Associate', '$2b$10$rQZ8J.hKqMYmYh5NJmrPBOzjPwQrMvXnGXO8VGbQXqvSKDsHzPJHq', 'EMPLOYEE', true),
('usr_emp002', 'warehouse@retailflow.com', 'Warehouse Staff', '$2b$10$rQZ8J.hKqMYmYh5NJmrPBOzjPwQrMvXnGXO8VGbQXqvSKDsHzPJHq', 'EMPLOYEE', true);

-- Seed Products
INSERT INTO products (id, sku, name, description, price, cost, category, min_stock, active) VALUES
('prod_001', 'ELEC-001', 'Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 29.99, 15.00, 'Electronics', 20, true),
('prod_002', 'ELEC-002', 'USB-C Hub', '7-in-1 USB-C hub with HDMI and USB 3.0', 49.99, 25.00, 'Electronics', 15, true),
('prod_003', 'ELEC-003', 'Mechanical Keyboard', 'RGB mechanical keyboard with blue switches', 89.99, 45.00, 'Electronics', 10, true),
('prod_004', 'ELEC-004', 'Webcam HD', '1080p HD webcam with microphone', 59.99, 30.00, 'Electronics', 12, true),
('prod_005', 'FURN-001', 'Office Chair', 'Ergonomic mesh office chair', 199.99, 100.00, 'Furniture', 5, true),
('prod_006', 'FURN-002', 'Standing Desk', 'Electric height-adjustable standing desk', 399.99, 200.00, 'Furniture', 3, true),
('prod_007', 'FURN-003', 'Monitor Stand', 'Adjustable monitor stand with drawer', 39.99, 18.00, 'Furniture', 15, true),
('prod_008', 'SUPP-001', 'Notebook Set', 'Pack of 5 lined notebooks', 12.99, 5.00, 'Supplies', 50, true),
('prod_009', 'SUPP-002', 'Pen Pack', 'Pack of 10 ballpoint pens', 8.99, 3.00, 'Supplies', 100, true),
('prod_010', 'SUPP-003', 'Desk Organizer', 'Wooden desk organizer with compartments', 24.99, 10.00, 'Supplies', 25, true);

-- Seed Inventory Entries (initial stock)
INSERT INTO inventory_entries (id, product_id, quantity, type, reason, created_by, created_at) VALUES
('inv_001', 'prod_001', 50, 'IN', 'Initial stock', 'usr_admin001', NOW() - INTERVAL '30 days'),
('inv_002', 'prod_002', 30, 'IN', 'Initial stock', 'usr_admin001', NOW() - INTERVAL '30 days'),
('inv_003', 'prod_003', 25, 'IN', 'Initial stock', 'usr_admin001', NOW() - INTERVAL '30 days'),
('inv_004', 'prod_004', 20, 'IN', 'Initial stock', 'usr_admin001', NOW() - INTERVAL '30 days'),
('inv_005', 'prod_005', 10, 'IN', 'Initial stock', 'usr_admin001', NOW() - INTERVAL '30 days'),
('inv_006', 'prod_006', 5, 'IN', 'Initial stock', 'usr_admin001', NOW() - INTERVAL '30 days'),
('inv_007', 'prod_007', 35, 'IN', 'Initial stock', 'usr_admin001', NOW() - INTERVAL '30 days'),
('inv_008', 'prod_008', 100, 'IN', 'Initial stock', 'usr_admin001', NOW() - INTERVAL '30 days'),
('inv_009', 'prod_009', 200, 'IN', 'Initial stock', 'usr_admin001', NOW() - INTERVAL '30 days'),
('inv_010', 'prod_010', 40, 'IN', 'Initial stock', 'usr_admin001', NOW() - INTERVAL '30 days');

-- Seed Suppliers
INSERT INTO suppliers (id, name, contact_name, email, phone, address, active) VALUES
('sup_001', 'TechWorld Distributors', 'John Smith', 'john@techworld.com', '555-0101', '123 Tech Lane, Silicon Valley, CA 94000', true),
('sup_002', 'Office Essentials Co.', 'Sarah Johnson', 'sarah@officeess.com', '555-0102', '456 Business Park, New York, NY 10001', true),
('sup_003', 'Furniture Direct', 'Mike Wilson', 'mike@furnituredirect.com', '555-0103', '789 Industrial Ave, Chicago, IL 60601', true);

-- Seed Customers
INSERT INTO customers (id, name, email, phone, address) VALUES
('cust_001', 'Acme Corporation', 'orders@acme.com', '555-1001', '100 Corporate Blvd, Boston, MA 02101'),
('cust_002', 'StartupX Inc.', 'purchasing@startupx.com', '555-1002', '200 Innovation Way, San Francisco, CA 94102'),
('cust_003', 'Local Business LLC', 'info@localbusiness.com', '555-1003', '300 Main Street, Austin, TX 78701'),
('cust_004', 'Enterprise Solutions', 'orders@enterprise.com', '555-1004', '400 Tower Plaza, Seattle, WA 98101'),
('cust_005', 'Creative Agency', 'hello@creative.com', '555-1005', '500 Design District, Los Angeles, CA 90001');

-- Seed Sales Orders
INSERT INTO sales_orders (id, order_number, customer_id, status, total, notes, order_date, created_by) VALUES
('so_001', 'SO-2024-0001', 'cust_001', 'DELIVERED', 289.95, 'Rush delivery requested', NOW() - INTERVAL '20 days', 'usr_emp001'),
('so_002', 'SO-2024-0002', 'cust_002', 'DELIVERED', 649.96, NULL, NOW() - INTERVAL '15 days', 'usr_emp001'),
('so_003', 'SO-2024-0003', 'cust_003', 'SHIPPED', 159.97, 'Leave at reception', NOW() - INTERVAL '5 days', 'usr_emp001'),
('so_004', 'SO-2024-0004', 'cust_004', 'CONFIRMED', 899.97, NULL, NOW() - INTERVAL '2 days', 'usr_mgr001'),
('so_005', 'SO-2024-0005', 'cust_005', 'PENDING', 179.97, 'Call before delivery', NOW() - INTERVAL '1 day', 'usr_emp001');

-- Seed Sales Order Items
INSERT INTO sales_order_items (id, order_id, product_id, quantity, unit_price, subtotal) VALUES
('soi_001', 'so_001', 'prod_001', 3, 29.99, 89.97),
('soi_002', 'so_001', 'prod_005', 1, 199.99, 199.98),
('soi_003', 'so_002', 'prod_003', 2, 89.99, 179.98),
('soi_004', 'so_002', 'prod_002', 3, 49.99, 149.97),
('soi_005', 'so_002', 'prod_006', 1, 399.99, 399.99),
('soi_006', 'so_003', 'prod_001', 2, 29.99, 59.98),
('soi_007', 'so_003', 'prod_007', 2, 39.99, 79.98),
('soi_008', 'so_003', 'prod_009', 2, 8.99, 17.98),
('soi_009', 'so_004', 'prod_005', 3, 199.99, 599.97),
('soi_010', 'so_004', 'prod_001', 10, 29.99, 299.90),
('soi_011', 'so_005', 'prod_004', 3, 59.99, 179.97);

-- Update inventory for sold items
INSERT INTO inventory_entries (id, product_id, quantity, type, reason, created_by, created_at) VALUES
('inv_011', 'prod_001', -3, 'OUT', 'Sales Order SO-2024-0001', 'usr_emp001', NOW() - INTERVAL '20 days'),
('inv_012', 'prod_005', -1, 'OUT', 'Sales Order SO-2024-0001', 'usr_emp001', NOW() - INTERVAL '20 days'),
('inv_013', 'prod_003', -2, 'OUT', 'Sales Order SO-2024-0002', 'usr_emp001', NOW() - INTERVAL '15 days'),
('inv_014', 'prod_002', -3, 'OUT', 'Sales Order SO-2024-0002', 'usr_emp001', NOW() - INTERVAL '15 days'),
('inv_015', 'prod_006', -1, 'OUT', 'Sales Order SO-2024-0002', 'usr_emp001', NOW() - INTERVAL '15 days'),
('inv_016', 'prod_001', -2, 'OUT', 'Sales Order SO-2024-0003', 'usr_emp001', NOW() - INTERVAL '5 days'),
('inv_017', 'prod_007', -2, 'OUT', 'Sales Order SO-2024-0003', 'usr_emp001', NOW() - INTERVAL '5 days'),
('inv_018', 'prod_009', -2, 'OUT', 'Sales Order SO-2024-0003', 'usr_emp001', NOW() - INTERVAL '5 days');

-- Seed Employees
INSERT INTO employees (id, user_id, first_name, last_name, email, phone, department, position, hire_date, salary, status) VALUES
('emp_001', 'usr_mgr001', 'Alice', 'Thompson', 'manager@retailflow.com', '555-2001', 'Management', 'Store Manager', '2022-01-15', 65000.00, 'ACTIVE'),
('emp_002', 'usr_emp001', 'Bob', 'Martinez', 'sales@retailflow.com', '555-2002', 'Sales', 'Sales Associate', '2023-03-01', 42000.00, 'ACTIVE'),
('emp_003', 'usr_emp002', 'Carol', 'Davis', 'warehouse@retailflow.com', '555-2003', 'Warehouse', 'Warehouse Staff', '2023-06-15', 38000.00, 'ACTIVE'),
('emp_004', NULL, 'David', 'Chen', 'david.chen@retailflow.com', '555-2004', 'Sales', 'Sales Associate', '2024-01-10', 40000.00, 'ACTIVE'),
('emp_005', NULL, 'Eva', 'Rodriguez', 'eva.r@retailflow.com', '555-2005', 'Accounting', 'Accountant', '2022-08-20', 55000.00, 'ACTIVE');

-- Seed Transactions
INSERT INTO transactions (id, type, amount, category, description, order_id, created_by, date) VALUES
('txn_001', 'INCOME', 289.95, 'Sales', 'Payment for SO-2024-0001', 'so_001', 'usr_emp001', NOW() - INTERVAL '19 days'),
('txn_002', 'INCOME', 649.96, 'Sales', 'Payment for SO-2024-0002', 'so_002', 'usr_emp001', NOW() - INTERVAL '14 days'),
('txn_003', 'EXPENSE', 1500.00, 'Inventory', 'Stock replenishment - Electronics', NULL, 'usr_mgr001', NOW() - INTERVAL '10 days'),
('txn_004', 'EXPENSE', 800.00, 'Operations', 'Monthly utilities', NULL, 'usr_mgr001', NOW() - INTERVAL '7 days'),
('txn_005', 'EXPENSE', 250.00, 'Marketing', 'Social media advertising', NULL, 'usr_mgr001', NOW() - INTERVAL '5 days'),
('txn_006', 'INCOME', 159.97, 'Sales', 'Payment for SO-2024-0003', 'so_003', 'usr_emp001', NOW() - INTERVAL '4 days');

-- Success message
SELECT 'Seed data inserted successfully!' as message;
