# 🔐 AUTH (JWT + ROLE)

## Register (default role = user)
POST /api/auth/register

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123"
}

(Optional admin creation)
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "Admin@123",
  "role": "admin"
}


## Login
POST /api/auth/login

Body:
{
  "email": "john@example.com",
  "password": "Password@123"
}


## Get current user
GET /api/auth/me
(No body)


# 🛍️ PRODUCT APIs

## Create Product (ADMIN ONLY)
POST /api/products

Body:
{
  "name": "iPhone 15",
  "description": "Latest Apple phone",
  "price": 999,
  "category": "electronics",
  "stock": 10,
  "image": "https://example.com/image.jpg"
}


## Get All Products
GET /api/products
(No body)

Filters:
- /api/products?category=electronics
- /api/products?price[lte]=1000
- /api/products?search=iphone


## Get Single Product
GET /api/products/:id
(No body)


## Update Product (ADMIN)
PATCH /api/products/:id

Body (any field optional):
{
  "name": "iPhone 15 Pro",
  "price": 1200,
  "stock": 5
}


## Delete Product (ADMIN)
DELETE /api/products/:id
(No body)


# 🛒 CART SYSTEM

## Add to Cart
POST /api/cart

Body:
{
  "productId": "PRODUCT_ID_HERE",
  "quantity": 2
}


## Get Cart
GET /api/cart
(No body)


## Update Quantity
PATCH /api/cart/:productId

Body:
{
  "quantity": 3
}


## Remove Item
DELETE /api/cart/:productId
(No body)


## Clear Cart
DELETE /api/cart
(No body)


# 📦 ORDER SYSTEM

## Create Order (from cart)
POST /api/orders

Body:
(No body required)


## Get User Orders
GET /api/orders
(No body)


## Get Single Order
GET /api/orders/:id
(No body)


## Update Order Status (ADMIN)
PATCH /api/orders/:id/status

Body:
{
  "status": "shipped"
}

Allowed values:
- pending
- paid
- shipped
- delivered
- cancelled


# 💳 PAYMENT SYSTEM (STRIPE)

## Create Checkout Session
POST /api/payments/create-checkout-session

Body:
(No body required)


## Payment Success
GET /api/payments/success?session_id=xxx

(No body)


## Payment Cancel
GET /api/payments/cancel

(No body)


## Stripe Webhook
POST /api/payments/webhook

Body:
❌ Do NOT send manually (handled by Stripe)


# ❤️ HEALTH CHECK

GET /api/health
(No body)


# 🔐 COMMON HEADERS (IMPORTANT)

Authorization:
Bearer YOUR_JWT_TOKEN


# 🧠 FULL FLOW

1. Register / Login
2. Add items to cart
3. Create order
4. Create checkout session
5. Pay via Stripe
6. Webhook updates order → PAID ✅

# 💳 RAZORPAY PAYMENT APIs

---

## 🟢 1. CREATE RAZORPAY ORDER

### Endpoint
POST /api/payments/razorpay/create-order

### Auth
Bearer Token REQUIRED

### Body
No body required (uses cart from DB)

### Example Request (Postman)
Headers:
Authorization: Bearer <your_token>

Body:
{}

### Response

{
  "success": true,
  "razorpayOrderId": "order_xxx",
  "amount": 20000,
  "currency": "INR",
  "orderId": "mongo_order_id"
}

---

## 🟢 2. VERIFY PAYMENT

### Endpoint
POST /api/payments/razorpay/verify

### Auth
Bearer Token REQUIRED

### Headers
Authorization: Bearer <your_token>  
Content-Type: application/json

---

### Body (IMPORTANT)

{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}

---

### Success Response

{
  "success": true,
  "message": "Payment verified successfully.",
  "orderId": "mongo_order_id",
  "status": "paid"
}

---

### Failure Response

{
  "success": false,
  "message": "Invalid payment signature."
}

---

## 🧠 FIELD SOURCES

| Field                  | Source                         |
|----------------------|--------------------------------|
| razorpay_order_id     | From create-order API          |
| razorpay_payment_id   | From Razorpay checkout popup   |
| razorpay_signature    | From Razorpay checkout popup   |

---

## 🔥 FULL FLOW

1. Add items to cart  
2. POST /razorpay/create-order  
3. Receive razorpayOrderId  
4. Open Razorpay checkout (frontend)  
5. User completes payment  
6. Razorpay returns payment_id + signature  
7. POST /razorpay/verify  
8. Order status → "paid" ✅  

---

## 🧪 TESTING WITHOUT FRONTEND

### Fake Request (for testing backend)

{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_test123",
  "razorpay_signature": "invalid"
}

### Expected Response

400 Bad Request  
"Invalid payment signature."

---

## ⚠️ NOTES

- Amount is always in **paise**
  - ₹200 → 20000
- Signature MUST match (security critical)
- Do NOT disable signature check in production
- Razorpay does NOT use webhooks here (unlike Stripe)

---

## ✅ STATUS CHECK

GET /api/orders

Expected:

{
  "status": "paid"
}