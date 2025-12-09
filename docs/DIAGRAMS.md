# RetailFlow ERP - Design Diagrams

## 1. Use Case Diagram

\`\`\`mermaid
graph TB
    subgraph Actors
        Admin((Admin))
        Manager((Manager))
        Employee((Employee))
    end
    
    subgraph "Inventory Module"
        UC1[View Products]
        UC2[Add/Edit Products]
        UC3[Adjust Stock]
        UC4[View Stock Alerts]
    end
    
    subgraph "Sales Module"
        UC5[View Orders]
        UC6[Create Sales Order]
        UC7[Update Order Status]
        UC8[Manage Customers]
    end
    
    subgraph "HR Module"
        UC9[View Employees]
        UC10[Add/Edit Employees]
        UC11[Manage Departments]
    end
    
    subgraph "Accounting Module"
        UC12[View Transactions]
        UC13[Record Transaction]
        UC14[Generate Reports]
    end
    
    Admin --> UC1 & UC2 & UC3 & UC4
    Admin --> UC5 & UC6 & UC7 & UC8
    Admin --> UC9 & UC10 & UC11
    Admin --> UC12 & UC13 & UC14
    
    Manager --> UC1 & UC2 & UC3 & UC4
    Manager --> UC5 & UC6 & UC7 & UC8
    Manager --> UC9
    Manager --> UC12 & UC14
    
    Employee --> UC1 & UC4
    Employee --> UC5 & UC6
\`\`\`

---

## 2. Class Diagram (Backend Models)

\`\`\`mermaid
classDiagram
    class User {
        +String id
        +String email
        +String name
        +String passwordHash
        +Role role
        +DateTime createdAt
        +DateTime updatedAt
    }
    
    class Product {
        +String id
        +String sku
        +String name
        +String description
        +Decimal price
        +Decimal cost
        +String category
        +Int minStock
        +Boolean active
    }
    
    class InventoryEntry {
        +String id
        +String productId
        +Int quantity
        +String type
        +String reason
        +DateTime createdAt
    }
    
    class Customer {
        +String id
        +String name
        +String email
        +String phone
        +String address
    }
    
    class SalesOrder {
        +String id
        +String customerId
        +String status
        +Decimal total
        +DateTime orderDate
    }
    
    class SalesOrderItem {
        +String id
        +String orderId
        +String productId
        +Int quantity
        +Decimal unitPrice
        +Decimal subtotal
    }
    
    class Employee {
        +String id
        +String userId
        +String firstName
        +String lastName
        +String department
        +String position
        +Date hireDate
        +String status
    }
    
    class Transaction {
        +String id
        +String type
        +Decimal amount
        +String category
        +String description
        +String orderId
        +DateTime date
    }
    
    class Supplier {
        +String id
        +String name
        +String contactName
        +String email
        +String phone
    }
    
    Product "1" --> "*" InventoryEntry : has
    Product "1" --> "*" SalesOrderItem : contains
    Customer "1" --> "*" SalesOrder : places
    SalesOrder "1" --> "*" SalesOrderItem : contains
    SalesOrder "1" --> "0..1" Transaction : generates
    User "1" --> "0..1" Employee : links to
\`\`\`

---

## 3. Entity Relationship Diagram (ERD)

\`\`\`mermaid
erDiagram
    USER {
        string id PK
        string email UK
        string name
        string password_hash
        enum role
        datetime created_at
        datetime updated_at
    }
    
    PRODUCT {
        string id PK
        string sku UK
        string name
        text description
        decimal price
        decimal cost
        string category
        int min_stock
        boolean active
        datetime created_at
        datetime updated_at
    }
    
    INVENTORY_ENTRY {
        string id PK
        string product_id FK
        int quantity
        enum type
        string reason
        string created_by FK
        datetime created_at
    }
    
    CUSTOMER {
        string id PK
        string name
        string email
        string phone
        text address
        datetime created_at
        datetime updated_at
    }
    
    SALES_ORDER {
        string id PK
        string customer_id FK
        enum status
        decimal total
        datetime order_date
        string created_by FK
        datetime created_at
        datetime updated_at
    }
    
    SALES_ORDER_ITEM {
        string id PK
        string order_id FK
        string product_id FK
        int quantity
        decimal unit_price
        decimal subtotal
    }
    
    SUPPLIER {
        string id PK
        string name
        string contact_name
        string email
        string phone
        text address
        datetime created_at
    }
    
    PURCHASE_ORDER {
        string id PK
        string supplier_id FK
        enum status
        decimal total
        datetime order_date
        datetime expected_date
        string created_by FK
    }
    
    EMPLOYEE {
        string id PK
        string user_id FK
        string first_name
        string last_name
        string email
        string phone
        string department
        string position
        date hire_date
        enum status
        datetime created_at
    }
    
    TRANSACTION {
        string id PK
        enum type
        decimal amount
        string category
        text description
        string order_id FK
        string created_by FK
        datetime date
        datetime created_at
    }
    
    USER ||--o| EMPLOYEE : "links to"
    PRODUCT ||--o{ INVENTORY_ENTRY : "tracks"
    PRODUCT ||--o{ SALES_ORDER_ITEM : "sold in"
    CUSTOMER ||--o{ SALES_ORDER : "places"
    SALES_ORDER ||--|{ SALES_ORDER_ITEM : "contains"
    SALES_ORDER ||--o| TRANSACTION : "generates"
    SUPPLIER ||--o{ PURCHASE_ORDER : "fulfills"
    USER ||--o{ INVENTORY_ENTRY : "created"
    USER ||--o{ SALES_ORDER : "created"
    USER ||--o{ TRANSACTION : "recorded"
\`\`\`

---

## 4. Sequence Diagram: Create Sales Order

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant UI as Sales UI
    participant API as API Route
    participant SVC as Sales Service
    participant INV as Inventory Service
    participant DB as Database
    
    U->>UI: Fill order form
    UI->>API: POST /api/sales/orders
    API->>SVC: createOrder(orderData)
    
    SVC->>DB: Validate customer exists
    DB-->>SVC: Customer found
    
    loop For each item
        SVC->>INV: checkStock(productId, qty)
        INV->>DB: Get current stock
        DB-->>INV: Stock level
        INV-->>SVC: Stock available
    end
    
    SVC->>DB: Create SalesOrder
    DB-->>SVC: Order created
    
    loop For each item
        SVC->>DB: Create SalesOrderItem
        SVC->>INV: deductStock(productId, qty)
        INV->>DB: Create InventoryEntry (OUT)
    end
    
    SVC->>DB: Create Transaction (INCOME)
    DB-->>SVC: Transaction recorded
    
    SVC-->>API: Order complete
    API-->>UI: Success response
    UI-->>U: Show confirmation
\`\`\`

---

## 5. Sequence Diagram: Procurement Flow

\`\`\`mermaid
sequenceDiagram
    participant M as Manager
    participant UI as Procurement UI
    participant API as API Route
    participant PO as PO Service
    participant INV as Inventory Service
    participant DB as Database
    
    M->>UI: Create purchase order
    UI->>API: POST /api/procurement/orders
    API->>PO: createPurchaseOrder(data)
    PO->>DB: Create PurchaseOrder (PENDING)
    DB-->>PO: PO created
    PO-->>API: PO created
    API-->>UI: Show pending PO
    
    Note over M,DB: Later: Goods received
    
    M->>UI: Mark as received
    UI->>API: PUT /api/procurement/orders/:id
    API->>PO: receiveOrder(poId)
    PO->>DB: Update PO status (RECEIVED)
    
    loop For each PO item
        PO->>INV: addStock(productId, qty)
        INV->>DB: Create InventoryEntry (IN)
    end
    
    PO->>DB: Create Transaction (EXPENSE)
    PO-->>API: Complete
    API-->>UI: Success
    UI-->>M: Show updated stock
\`\`\`

---

## 6. Activity Diagram: Order-to-Cash Flow

\`\`\`mermaid
flowchart TD
    A[Start: Customer Request] --> B{Customer Exists?}
    B -->|No| C[Create Customer Record]
    C --> D
    B -->|Yes| D[Select Products]
    
    D --> E[Add Items to Order]
    E --> F{All Items Added?}
    F -->|No| D
    F -->|Yes| G[Calculate Total]
    
    G --> H{Stock Available?}
    H -->|No| I[Alert: Insufficient Stock]
    I --> D
    H -->|Yes| J[Create Sales Order]
    
    J --> K[Deduct Inventory]
    K --> L[Record Transaction]
    L --> M{Payment Received?}
    
    M -->|No| N[Mark as Pending]
    M -->|Yes| O[Mark as Paid]
    
    N --> P[Update Order Status]
    O --> P
    
    P --> Q[Ship Order]
    Q --> R[Update Status: Shipped]
    R --> S[Customer Confirms]
    S --> T[Update Status: Delivered]
    T --> U[End: Order Complete]
\`\`\`

---

## 7. Flowchart: Inventory Adjustment

\`\`\`mermaid
flowchart TD
    A[Start: Adjust Inventory] --> B[Select Product]
    B --> C[Enter Adjustment Details]
    C --> D{Adjustment Type?}
    
    D -->|Add Stock| E[Validate Quantity > 0]
    D -->|Remove Stock| F[Check Current Stock]
    D -->|Set Stock| G[Validate New Level >= 0]
    
    E --> H{Valid?}
    F --> I{Sufficient Stock?}
    G --> J{Valid?}
    
    H -->|No| K[Show Error]
    I -->|No| K
    J -->|No| K
    K --> C
    
    H -->|Yes| L[Create Inventory Entry]
    I -->|Yes| L
    J -->|Yes| L
    
    L --> M[Update Stock Level]
    M --> N[Log Audit Trail]
    N --> O{Below Min Stock?}
    
    O -->|Yes| P[Create Stock Alert]
    O -->|No| Q[End: Adjustment Complete]
    P --> Q
\`\`\`

---

## 8. System Architecture Diagram

\`\`\`mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Browser[Web Browser]
    end
    
    subgraph NextJS["Next.js Application"]
        subgraph Pages["Pages (App Router)"]
            Dashboard["/dashboard"]
            Inventory["/inventory/*"]
            Sales["/sales/*"]
            HR["/hr/*"]
            Accounting["/accounting/*"]
        end
        
        subgraph API["API Routes"]
            InventoryAPI["/api/inventory/*"]
            SalesAPI["/api/sales/*"]
            HRAPI["/api/hr/*"]
            AccountingAPI["/api/accounting/*"]
            AuthAPI["/api/auth/*"]
        end
        
        subgraph Services["Service Layer"]
            InventorySvc[Inventory Service]
            SalesSvc[Sales Service]
            HRSvc[HR Service]
            AccountingSvc[Accounting Service]
            AuthSvc[Auth Service]
        end
        
        subgraph Data["Data Layer"]
            Prisma[Prisma ORM]
        end
    end
    
    subgraph DB["Database"]
        PostgreSQL[(PostgreSQL)]
    end
    
    Browser --> Pages
    Pages --> API
    API --> Services
    Services --> Prisma
    Prisma --> PostgreSQL
    
    InventoryAPI --> InventorySvc
    SalesAPI --> SalesSvc
    HRAPI --> HRSvc
    AccountingAPI --> AccountingSvc
    AuthAPI --> AuthSvc
