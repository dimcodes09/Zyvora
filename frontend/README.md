# Zyvora Frontend

> **Zyvora** is an AI-powered, immersive gifting storefront that blends premium shopping, AR product previews, curated hampers, and conversational discovery into one modern experience.

---

## ✨ Why Zyvora

Zyvora is built to make gifting feel personal, premium, and effortless. Instead of endless catalog scrolling, users can:

- discover products with **AI-assisted search and suggestions**,
- preview items in an **AR experience**,
- explore interactive **reels-style storytelling**,
- build custom **gift hampers**,
- and complete checkout with integrated payment flows.

The result is a storefront designed for delight, speed, and high conversion.

---

## 🚀 Core Experiences

- **Luxury-first homepage** with hero modules, curated arrivals, floral stories, testimonials, and animated sections.
- **AI Gift Discovery** through chat/suggestions and voice-enabled exploration UI.
- **AR Product Preview** flow for immersive product visualization.
- **Custom Hamper Builder** with contextual product selection and preview.
- **Reels Feed** for short-form commerce storytelling.
- **Shop + Cart + Checkout** flow including payment integration.
- **Authentication** including Google OAuth support.
- **Admin + Seller Panels** for product/order workflows.

---

## 🧱 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** React 19 + Tailwind CSS
- **Animation / Motion:** Framer Motion, GSAP
- **3D / AR Support:** Three.js
- **State Management:** Zustand + React Context
- **API Layer:** Axios + Next.js route handlers
- **AI Integrations:** OpenAI SDK + Groq SDK
- **Auth:** JWT-style backend auth + Google OAuth
- **Payments:** Razorpay (client-side checkout integration)

---

## 📁 Project Structure

```text
frontend/
├── src/app/                  # App Router pages, route groups, API handlers
├── src/components/           # Reusable UI, home modules, auth, AR, product UI
├── src/services/             # Domain-specific API service wrappers
├── src/lib/                  # API clients, helpers, utilities
├── src/store/                # Zustand stores
├── src/context/              # React context providers
├── src/hooks/                # Custom hooks (chat, hamper workflows)
├── src/data/                 # Static/demo data
└── public/                   # Images and static assets
```

---

## ⚙️ Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a local env file:

```bash
cp .env.example .env.local
```

If `.env.example` is not present, create `.env.local` manually and set at least the values below.

### 3) Run the development server

```bash
npm run dev
```

Open **http://localhost:3000**.

---

## 🔐 Environment Variables

The app reads several environment variables. Commonly used ones include:

```bash
# Backend base URLs
NEXT_PUBLIC_API_URL=http://localhost:5000/api
BACKEND_URL=http://localhost:5000/api

# OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Payments
NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_key

# AI Providers
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key

# Optional local/dev helpers
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_GIFT_BASE_URL=http://localhost:3000
NEXT_PUBLIC_AR_BASE_URL=http://localhost:3000
NEXT_PUBLIC_LOCAL_IP=192.168.x.x
NEXT_PUBLIC_PORT=3000
```

> Keep secrets in `.env.local` and never commit them.

---

## 🧪 Available Scripts

```bash
npm run dev      # start local dev server
npm run build    # production build
npm run start    # run production build
npm run lint     # run ESLint
```

---

## 🌍 Deployment Notes

- Deploy on any Next.js-compatible platform (Vercel recommended).
- Ensure all required environment variables are set in deployment settings.
- Verify backend/API CORS and auth token behavior for production domains.

---

## 🤝 Contributing

1. Create a feature branch.
2. Keep changes scoped and well documented.
3. Run lint/build checks before opening a PR.
4. Include screenshots or screen recordings for UI-impacting changes.

---

## 📌 Status

Zyvora is actively evolving. New commerce, AI-personalization, and immersive UX capabilities are expected over time.

If you're building premium digital commerce experiences, this codebase is a strong foundation.
