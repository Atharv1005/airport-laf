# ✈️ Airport Lost & Found Management System

Internal mobile application for airport staff to manage lost & found items.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Mobile | Capacitor (Android APK) |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (free tier) |
| Images | Cloudinary (free tier) |
| Auth | JWT + bcrypt |
| Cron | node-cron |

---

## Prerequisites

- Node.js 18+
- Android Studio (for APK build)
- Java JDK 17+
- MongoDB Atlas account (free)
- Cloudinary account (free)

---

## 1. Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Cloudinary keys
npm install
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Random secret string (32+ chars) |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |

### First User = Admin

The **first user to register** automatically becomes admin and is pre-approved.
All subsequent users require admin approval before logging in.

---

## 2. Frontend Setup (Web Dev)

```bash
cd client
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:5000/api" > .env.local

npm run dev
```

---

## 3. Android APK Build

### Step 1: Configure API URL for production

```bash
# client/.env.production
VITE_API_URL=https://your-deployed-backend.com/api
```

### Step 2: Build & Sync

```bash
cd client
npm run build
npx cap add android     # only first time
npx cap sync android
```

### Step 3: Open in Android Studio

```bash
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync to complete
2. **Build → Generate Signed Bundle / APK**
3. Choose **APK**
4. Create/select your keystore
5. Build Release APK

The APK will be at:
`android/app/build/outputs/apk/release/app-release.apk`

### Step 4: Install on Device

```bash
# Via ADB
adb install app-release.apk

# Or share the APK file directly via WhatsApp/email
```

---

## 4. Free Deployment Options (Backend)

### Option A: Render.com (Recommended)
1. Push server code to GitHub
2. Create new Web Service on render.com
3. Set environment variables in dashboard
4. Free tier: 750 hours/month

### Option B: Railway.app
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Option C: Cyclic.sh / Koyeb
- Connect GitHub repo
- Set env vars
- Deploy

---

## 5. Item Lifecycle

```
ACTIVE (0-90 days)
    ↓ [auto via cron at midnight]
EXPIRED (90+ days)
    ↓ [auto 10 days after expiry]
DISPOSED

ACTIVE / EXPIRED → CLAIMED [manual by staff]
```

---

## 6. API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/pending-users` | [Admin] Get pending approvals |
| PATCH | `/api/auth/approve-user/:id` | [Admin] Approve/reject user |

### Items
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/items` | List items (with filters) |
| POST | `/api/items` | Create item (multipart) |
| GET | `/api/items/stats` | Get status counts |
| GET | `/api/items/:id` | Get item detail |
| PATCH | `/api/items/:id` | Update item |
| PATCH | `/api/items/:id/status` | Update status only |

---

## 7. Item ID Format

`AXU-LF-YYYY-XXXX`

Example: `AXU-LF-2024-0042`

- `PNQ` = Airport IATA code (update in `server/models/Item.js`)
- `LF` = Lost & Found
- `YYYY` = Year
- `XXXX` = Sequential number

---

## 8. AI Module

The AI service (`server/services/aiService.js`) is a **replaceable stub**.

To add real image classification:
1. Install a model: `npm install @tensorflow/tfjs @tensorflow-models/mobilenet`
2. Replace the `suggestCategory` function in `aiService.js`
3. The interface remains the same: `suggestCategory(base64) → { category, confidence }`

---

## 9. Folder Structure

```
airport-laf/
├── server/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── itemController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Item.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── items.js
│   ├── services/
│   │   ├── aiService.js
│   │   ├── cloudinaryService.js
│   │   └── cronService.js
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── BottomNav.jsx
    │   │   ├── ItemCard.jsx
    │   │   └── StatusBadge.jsx
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── AddItem.jsx
    │   │   ├── ItemDetail.jsx
    │   │   ├── Profile.jsx
    │   │   └── AdminApproval.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── capacitor.config.json
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 10. Security Notes

- JWT tokens expire in 7 days
- All passwords hashed with bcrypt (salt rounds: 12)
- Unapproved users get 403 on all protected endpoints
- No record deletion — items are status-only
- Images compressed and stored on Cloudinary CDN

---

## Support

For issues, contact the Terminal Manager or IT team.
