# Smart Tourist Website
## Damascus Tour Guide

[العربية](#العربية) | [English](#english)

---

## العربية

### نبذة

`Smart Tourist Website` هو مشروع ويب سياحي مخصص لمدينة دمشق، يوفّر تجربة متكاملة لاستكشاف الأماكن السياحية، حفظ المفضلة، إنشاء الحجوزات، متابعة المدفوعات، والتفاعل مع خدمات إضافية مثل تخطيط الرحلات والدردشة ولوحة التحكم الإدارية.

المشروع مبني بهيكلية `Frontend + Backend`:

- `frontend`: تطبيق React حديث مبني باستخدام Vite وTypeScript
- `backend`: واجهة API مبنية باستخدام Express وTypeScript وMongoDB

### المميزات

- عرض الأماكن السياحية والمعالم في دمشق
- صفحة تفاصيل شاملة لكل مكان
- تسجيل حساب وتسجيل دخول
- إدارة المفضلة
- إنشاء الحجوزات وعرضها وإلغاؤها
- ربط الدفع عبر Stripe Checkout
- مخطط رحلات `Itinerary Planner`
- صفحات خدمية إضافية مثل النقل، الصحة، التسوق، والطوارئ
- لوحة تحكم إدارية لإدارة المستخدمين والأماكن والحجوزات
- واجهة متعددة اللغات تدعم العربية والإنجليزية

### التقنيات المستخدمة

#### الواجهة الأمامية

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Zustand
- Framer Motion
- React Router
- Leaflet / Google Maps

#### الواجهة الخلفية

- Node.js
- Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Stripe
- Nodemailer

### هيكل المشروع

```text
.
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seeders/
│   │   └── services/
│   └── package.json
└── README.md
```

### المتطلبات

- Node.js 18 أو أحدث
- npm
- MongoDB محلي أو سحابي

### إعداد البيئة

#### الواجهة الأمامية

أنشئ ملف `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/api
VITE_GOOGLE_MAPS_KEY=your_google_maps_key
```

#### الواجهة الخلفية

أنشئ ملف `backend/.env`:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/damascus_tour_guide
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRE=7d

CLIENT_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
SMTP_FROM=your_email@example.com

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

SEED_DATABASE=false
```

### التثبيت

#### تثبيت الواجهة

```bash
cd frontend
npm install
```

#### تثبيت الخلفية

```bash
cd backend
npm install
```

### التشغيل المحلي

#### تشغيل الخادم الخلفي

```bash
cd backend
npm run dev
```

سيعمل على:

`http://localhost:5001`

#### تشغيل الواجهة

```bash
cd frontend
npm run dev
```

ستعمل على:

`http://localhost:3000`

### البناء والفحص

#### بناء الواجهة

```bash
cd frontend
npm run build
```

#### فحص TypeScript للخلفية

```bash
cd backend
npx tsc -p tsconfig.json --noEmit
```

### أهم المسارات

#### مسارات الواجهة

- `/`
- `/places`
- `/places/:id`
- `/favorites`
- `/book/:placeId`
- `/bookings`
- `/chat`
- `/profile`
- `/admin`

#### مسارات الـ API

- `/api/auth`
- `/api/places`
- `/api/favorites`
- `/api/bookings`
- `/api/payments`
- `/api/chat`
- `/api/itineraries`
- `/api/utility`
- `/api/admin`
- `/health`

### ملاحظات

- الواجهة تعتمد على `VITE_API_URL`، وإذا لم يتم تعريفه فسيتم استخدام `http://localhost:5001/api`.
- الدفع يتم عبر Stripe Checkout، لذلك لا يتم تخزين بيانات البطاقة داخل الواجهة.
- تفعيل البريد والدفع يتطلب إعداد القيم الصحيحة في `.env`.
- يمكن تشغيل إدخال بيانات تجريبية عبر:

```env
SEED_DATABASE=true
```

### الإدارة والبيانات التجريبية

راجع الملفات التالية:

- `backend/src/seeders/seedDatabaseFixed.ts`
- `backend/src/scripts/promote-admin.ts`


---

## English

### Overview

`Smart Tourist Website` is a Damascus-focused tourism web application that provides a complete experience for exploring attractions, saving favorites, creating bookings, handling payments, planning itineraries, chatting with support tools, and managing data through an admin dashboard.

The project follows a `frontend + backend` structure:

- `frontend`: a modern React application built with Vite and TypeScript
- `backend`: an Express API powered by TypeScript and MongoDB

### Features

- Browse tourist attractions and places in Damascus
- Detailed page for each place
- User registration and login
- Favorites management
- Booking creation, listing, and cancellation
- Stripe Checkout payment integration
- Itinerary planner
- Extra service pages such as transport, health, shopping, and emergency help
- Admin dashboard for users, places, and bookings
- Multilingual interface with Arabic and English support

### Tech Stack

#### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Zustand
- Framer Motion
- React Router
- Leaflet / Google Maps

#### Backend

- Node.js
- Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Stripe
- Nodemailer

### Project Structure

```text
.
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seeders/
│   │   └── services/
│   └── package.json
└── README.md
```

### Requirements

- Node.js 18+
- npm
- Local or hosted MongoDB instance

### Environment Setup

#### Frontend

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_KEY=your_google_maps_key
```

#### Backend

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/damascus_tour_guide
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRE=7d

CLIENT_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
SMTP_FROM=your_email@example.com

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

SEED_DATABASE=false
```

### Installation

#### Install frontend dependencies

```bash
cd frontend
npm install
```

#### Install backend dependencies

```bash
cd backend
npm install
```

### Local Development

#### Run the backend

```bash
cd backend
npm run dev
```

Default URL:

`http://localhost:5000`

#### Run the frontend

```bash
cd frontend
npm run dev
```

Default URL:

`http://localhost:3000`

### Build and Validation

#### Build frontend

```bash
cd frontend
npm run build
```

#### Type-check backend

```bash
cd backend
npx tsc -p tsconfig.json --noEmit
```

### Main Routes

#### Frontend routes

- `/`
- `/places`
- `/places/:id`
- `/favorites`
- `/book/:placeId`
- `/bookings`
- `/chat`
- `/profile`
- `/admin`

#### API routes

- `/api/auth`
- `/api/places`
- `/api/favorites`
- `/api/bookings`
- `/api/payments`
- `/api/chat`
- `/api/itineraries`
- `/api/utility`
- `/api/admin`
- `/health`

### Notes

- The frontend uses `VITE_API_URL`; if it is not set, it falls back to `http://localhost:5000/api`.
- Payments are handled through Stripe Checkout, so raw card details are not stored in the frontend.
- Email and payment features require valid `.env` credentials to function correctly.
- To enable seed data:

```env
SEED_DATABASE=true
```

### Admin and Seed Data

Relevant files:

- `backend/src/seeders/seedDatabaseFixed.ts`
- `backend/src/scripts/promote-admin.ts`


