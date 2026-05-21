# MSME (React + Laravel API + MongoDB Atlas) – Full Workflow (Hinglish)

Repo structure:
- `backend/` = Laravel API (MongoDB Atlas)
- `frontend/` = React (Vite)

Quick docs:
- Backend: `backend/BACKEND_README.md`
- Frontend: `frontend/FRONTEND_README.md`

## 0) Prerequisites (pehle se installed honi chahiye)
- PHP 8.2+ + Composer
- Node.js (LTS) + npm
- MongoDB Atlas cluster + DB user/password + IP whitelist (Network Access)

## 1) Backend (Laravel) – Setup + Run

### 1.1 Dependencies install
```powershell
cd backend
composer install
```

### 1.2 `.env` configure
Notes:
- `backend/.env` git me ignore hota hai, secrets commit mat karna
- Template: `backend/.env.example`

Atlas minimum:
```env
DB_CONNECTION=mongodb
DB_URI="mongodb+srv://<username>:<password>@<cluster>/<optional-db>?retryWrites=true&w=majority"
DB_DATABASE="MSME"
```

Recommended (ye changes `backend/.env` me kiye gaye the + kyu):
```env
# Sessions disk pe (SQL sessions table avoid)
SESSION_DRIVER=file

# Cache disk pe (database cache tables avoid)
CACHE_STORE=file

# Queue inline (database queue tables avoid)
QUEUE_CONNECTION=sync

# Local URL consistent
APP_URL=http://127.0.0.1:8000
```

### 1.3 MongoDB driver packages (agar needed ho)
```powershell
cd backend
composer require mongodb/mongodb
composer require mongodb/laravel-mongodb
```

### 1.4 Cache clear + server run
```powershell
cd backend
php artisan optimize:clear
php artisan serve --host=127.0.0.1 --port=8000
```

## 2) Backend – Quick API test

Ping route `backend/routes/api.php` me hai:
```php
Route::get('/ping', fn () => ['ok' => true]);
```

Browser test:
- `http://127.0.0.1:8000/api/ping`

Route verify:
```powershell
cd backend
php artisan route:list --path=api
```

### Common mistake (404)
- Aap `http://127.0.0.1:8000/ping` open karoge to 404 aayega (kyunki route `routes/api.php` me hai).
- Sahi URL: `http://127.0.0.1:8000/api/ping`
- React dev server port (usually `5173`) pe `/api/ping` hit karoge to bhi 404 aayega.

## 2.1) User auth (Register → OTP verify → Login)

Backend APIs (base `/api`):
- `POST /auth/register` (name, email, password) → OTP email par jayega
- `POST /auth/verify-otp` (email, otp) → verify ke baad login possible
- `POST /auth/login` (email, password) → token milega
- `GET /auth/me` (Bearer token) → current user
- `POST /auth/logout` (Bearer token)

Local OTP testing:
- `MAIL_MAILER=log` rakhoge to OTP email content `backend/storage/logs/laravel.log` me mil jayega.

## 3) Frontend (React) – Setup + Run

### 3.1 Dependencies install
```powershell
cd frontend
npm install
```

### 3.2 Dev server run
```powershell
cd frontend
npm run dev
```

Vite usually:
- `http://127.0.0.1:5173`

### 3.3 User portal pages (hash routes)
- Landing: `http://127.0.0.1:5173/#/`
- Register: `http://127.0.0.1:5173/#/register`
- Verify OTP: `http://127.0.0.1:5173/#/verify?email=you@example.com`
- Login: `http://127.0.0.1:5173/#/login`
- Dashboard: `http://127.0.0.1:5173/#/dashboard`
- Pricing (Razorpay demo): `http://127.0.0.1:5173/#/pricing`

### 3.3 Laravel API call (example)
```js
fetch("http://127.0.0.1:8000/api/ping")
  .then(r => r.json())
  .then(console.log);
```

## 4) Troubleshooting (common)

### 4.1 `Database connection [mongodb] not configured.`
- Fix: `backend/config/database.php` me `connections` ke andar `mongodb` connection add/ensure karo.

### 4.2 Atlas connect error
- Atlas console me **Network Access** me apni IP allow karo (ya temporary `0.0.0.0/0` for testing).
- DB user/password verify karo.

## 5) Document upload (ImageKit)

Backend endpoint (Bearer token required):
- `POST /api/documents` (multipart form-data) → file ImageKit pe upload hoti hai, metadata MongoDB me save hota hai
- `GET /api/documents` → recent documents list
- `PATCH /api/documents/{id}` → tags update
- `DELETE /api/documents/{id}` → delete

Required env (backend):
```env
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
IMAGEKIT_FOLDER=/msme
```

Notes:
- `IMAGEKIT_PRIVATE_KEY` missing hoga to upload fail hoga with message.
- Frontend dashboard me upload UI wired hai + upload se pehle tags select kar sakte ho (identity/address etc).

## 6) Payments (Razorpay) – Premium unlock (scaffold)

Backend endpoints (Bearer token required):
- `GET /api/billing/entitlement`
- `POST /api/billing/order` body: `{ "purpose": "premium_monthly" | "premium_yearly" }`
- `POST /api/billing/verify` body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`

Required env (backend):
```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Frontend:
- Pricing page: `/#/pricing` (Razorpay Checkout demo wired: create order → pay → verify → unlock)

Demo notes:
- Webhook demo ke liye required nahi; production me webhook recommended hota hai.

## 7) Renewals (workflow)

Endpoints (Bearer token required):
- `GET /api/renewal-types` → available types + checklist + fields schema
- `POST /api/renewals` → create draft
- `PATCH /api/renewals/{id}` → update draft (fields + document_ids)
- `POST /api/renewals/{id}/submit` → submit (required tags validate)

Frontend routes:
- `/#/renewals` (list + create)
- `/#/renewals/<id>` (draft editor + checklist + submit)

## 8) Reports (premium/demo)

Endpoint (Bearer token required):
- `GET /api/reports/renewal-summary.csv` → CSV download

Frontend:
- Dashboard → Download center (Premium) → downloads `renewal-summary.csv`

## 9) Admin portal (assisted filing)

Goal: Admin/operator uses user-submitted data + documents to file on government portal.

Backend (admin-only, Bearer token required):
- `GET /api/admin/renewals?status=submitted|payment_verified|in_review|approved|filed|completed|rejected|all`
- `GET /api/admin/renewals/{id}`
- `POST /api/admin/renewals/{id}/status`

Frontend routes:
- Admin inbox: `/#/admin/renewals`
- Admin case: `/#/admin/renewals/<id>`

Admin access:
- Create an admin user by setting `role=admin` on a user record in MongoDB (default is `user`).
