🚀 🧠 YOUR COMPLETE BACKEND (FINAL MAP)
🔐 AUTH (with ROLE support)
Register (role auto = user)
POST /api/auth/register
Login (returns token with role)
POST /api/auth/login
Get current user
GET /api/auth/me
👤 ROLE SYSTEM (IMPORTANT)
user → normal access
admin → can manage products + orders
👉 Role is:

stored in DB ✅

added in JWT ✅

checked in middleware ✅

🛍️ PRODUCT APIs (WITH ADMIN CONTROL + FILTERING)
➕ Create Product (ADMIN ONLY)
POST /api/products
📦 Get All Products (with filters)
GET /api/products
👉 You can support:

/api/products?category=electronics
/api/products?price[lte]=1000
/api/products?search=iphone

🔍 Get Single Product
GET /api/products/:id
✏️ Update Product (ADMIN)
PATCH /api/products/:id
❌ Delete Product (ADMIN)
DELETE /api/products/:id
🛒 CART SYSTEM (SMART LOGIC)
➕ Add to cart
POST /api/cart
✔ Prevent duplicates
✔ Increase quantity

📦 Get cart
GET /api/cart
🔄 Update quantity
PATCH /api/cart/:productId
❌ Remove item
DELETE /api/cart/:productId
🧹 Clear cart
DELETE /api/cart
📦 ORDER SYSTEM (REAL E-COMMERCE FLOW)
🛍️ Create order (from cart)
POST /api/orders
✔ validates stock
✔ calculates total
✔ clears cart

📜 Get user orders
GET /api/orders
🔍 Get single order
GET /api/orders/:id
👑 Update order status (ADMIN)
PATCH /api/orders/:id/status
❤️ HEALTH
GET /api/health
🔐 SECURITY YOU BUILT (VERY IMPORTANT)
✅ JWT authentication
✅ Role-based access (adminOnly)
✅ Password hashing (bcrypt)
✅ Protected routes
✅ No password leakage
✅ Rate limiting