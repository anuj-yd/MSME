# Backend (Laravel + MongoDB Atlas) – Hinglish Setup

Ye folder `backend/` Laravel API ke liye hai.

## 1) Install

```powershell
cd backend
composer install
```

## 2) `.env` set karo (Atlas)

Note:
- `backend/.env` git me ignore hota hai, isme secrets aate hain.
- Template: `backend/.env.example`

Minimum:

```env
DB_CONNECTION=mongodb
DB_URI="mongodb+srv://<username>:<password>@<cluster>/<optional-db>?retryWrites=true&w=majority"
DB_DATABASE="MSME"
```

Recommended (setup ke time):

```env
SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
APP_URL=http://127.0.0.1:8000

# Local OTP testing ke liye:
MAIL_MAILER=log
```

Kyu?
- `SESSION_DRIVER=file`: SQL `sessions` table ki zarurat nahi padti.
- `CACHE_STORE=file`: SQL cache tables ka jhanjhat nahi.
- `QUEUE_CONNECTION=sync`: SQL queue tables ka jhanjhat nahi.
- `APP_URL`: local URL consistent rehta hai.

## 3) MongoDB packages

```powershell
cd backend
composer require mongodb/mongodb
composer require mongodb/laravel-mongodb
```

## 4) MongoDB connection config

`backend/config/database.php` me `connections` ke andar `mongodb` connection hona chahiye.

Agar missing hua to error aayega:
- `Database connection [mongodb] not configured.`

## 5) Cache clear + server run

```powershell
cd backend
php artisan optimize:clear
php artisan serve --host=127.0.0.1 --port=8000
```

## 6) Ping route test

Route file: `backend/routes/api.php`

```php
Route::get('/ping', fn () => ['ok' => true]);
```

Browser:
- `http://127.0.0.1:8000/api/ping`

### Agar 404 aa raha ho

- Aap `http://127.0.0.1:8000/ping` open karoge to 404 aayega (kyunki route `api.php` me hai).
- Sahi URL: `http://127.0.0.1:8000/api/ping`
- Route check:

```powershell
cd backend
php artisan route:list --path=api
```

## 7) User registration + Email OTP

APIs (base: `/api`):
- `POST /auth/register` → email pe 4-digit OTP send hota hai
- `POST /auth/verify-otp` → OTP verify karke account active hota hai
- `POST /auth/login` → verified user ko token milta hai

Local testing tip:
- Agar `MAIL_MAILER=log` hai to OTP email `backend/storage/logs/laravel.log` me log ho jayega.

## 8) Document upload (ImageKit)

Env keys:
```env
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
IMAGEKIT_FOLDER=/msme
```

APIs (Bearer token required):
- `GET /api/documents`
- `POST /api/documents` (multipart form-data: `file` + optional `tags[]`)
- `PATCH /api/documents/{id}` (JSON body: `tags: []`)
- `DELETE /api/documents/{id}`

Notes:
- Upload ImageKit pe hoti hai, metadata MongoDB me `documents` collection me store hota hai.

## 9) Premium unlock (Razorpay scaffold)

Env keys:
```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

APIs (Bearer token required):
- `GET /api/billing/entitlement`
- `POST /api/billing/order`
- `POST /api/billing/verify`

Demo notes:
- Webhook demo ke liye required nahi.
- Production me webhook + captured payment verification recommended hai.

## 10) Reports

API (Bearer token required):
- `GET /api/reports/renewal-summary.csv` (download CSV)
