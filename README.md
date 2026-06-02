# Datify 💜 — Dating App

A full-stack dating app built with **React + Vite**, **Tailwind CSS**, **Node.js**, **Express**, **MongoDB**, and **Cloudinary**.

---

## 📁 Project Structure

```
datify/
├── frontend/          # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── common/          # Button, Input, Logo, Spinner, Modal, Checkbox, BackButton, FloatingHearts
│       │   ├── auth/            # LoginSuccessModal
│       │   └── onboarding/      # MatchesIllustration, ProfileIllustration, MatchIllustration
│       ├── pages/
│       │   ├── SplashScreen.jsx
│       │   ├── Dashboard.jsx
│       │   ├── onboarding/      # OnboardingPage (3-slide carousel)
│       │   └── auth/            # LoginPage, SignupPage, VerifyEmailPage
│       ├── services/            # api.js (axios), authService.js
│       ├── store/               # authStore.js (Zustand)
│       └── utils/               # validators.js
│
└── backend/           # Node.js + Express API
    └── src/
        ├── config/              # database.js, cloudinary.js, email.js
        ├── controllers/         # authController.js, userController.js
        ├── middleware/          # auth, error, rateLimit, upload, validation
        ├── models/              # User.js (Mongoose)
        ├── routes/              # authRoutes.js, userRoutes.js
        └── utils/               # jwt.js, response.js
```

---

## 🖥️ Screens Implemented

| # | Screen | Route |
|---|--------|-------|
| 1 | Splash Screen | `/` |
| 2 | Onboarding Slide 1 — Discover Meaningful Connections | `/onboarding` |
| 3 | Onboarding Slide 2 — Be Yourself | `/onboarding` |
| 4 | Onboarding Slide 3 — Find Your Perfect Match | `/onboarding` |
| 5 | Login Page | `/login` |
| 6 | Login Success Modal | (overlay on `/login`) |
| 7 | Sign Up Page | `/signup` |
| 8 | Verify Email Page | `/verify-email` |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account
- SMTP email credentials (Gmail / Mailgun / etc.)

---

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

Backend runs on **http://localhost:5000**

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## 🔐 API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/signup` | Register new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/verify-email/:token` | Verify email | Public |
| POST | `/resend-verification` | Resend verification | Public |
| POST | `/forgot-password` | Send reset email | Public |
| POST | `/reset-password/:token` | Reset password | Public |
| GET | `/me` | Get current user | 🔒 Private |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| PUT | `/profile` | Update profile | 🔒 Private |
| POST | `/photos` | Upload photo | 🔒 Private |
| DELETE | `/photos/:photoId` | Delete photo | 🔒 Private |
| GET | `/discover` | Get potential matches | 🔒 Private + Verified |
| POST | `/:userId/like` | Like a user | 🔒 Private + Verified |

---

## ⚙️ Environment Variables

### Backend `.env`

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/datify
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Datify <noreply@datify.app>
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Datify
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| State | Zustand (persisted) |
| Icons | React Icons |
| HTTP | Axios |
| Notifications | React Toastify |
| Routing | React Router v6 |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| File Storage | Cloudinary |
| Email | Nodemailer |
| Validation | express-validator |
| Security | Helmet, CORS, Rate Limiting |

---

## 📦 Build for Production

```bash
# Frontend
cd frontend && npm run build

# Backend — set NODE_ENV=production in .env
cd backend && npm start
```

---

## 📄 License

MIT — free to use and modify.
