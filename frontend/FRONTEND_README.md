# Frontend (React + Vite + Tailwind)

Ye folder `frontend/` React app ke liye hai.

## 1) Install + run

```powershell
cd frontend
npm install
npm run dev
```

Vite usually:
- `http://127.0.0.1:5173`

## 2) API base URL

Default API base:
- `http://127.0.0.1:8000/api`

Change karna ho to `frontend/.env` (create) me:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## 3) Pages (hash routes)

- Landing: `/#/`
- Register: `/#/register`
- Verify OTP: `/#/verify?email=you@example.com`
- Login: `/#/login`
- Dashboard: `/#/dashboard`
- Pricing: `/#/pricing`
- Documents: `/#/documents`
- Renewals: `/#/renewals`

## 4) Code structure

- `frontend/src/pages/` = pages
- `frontend/src/pages/landing/` = landing components
- `frontend/src/lib/apiClient.js` = Axios client
- `frontend/src/lib/razorpay.js` = Razorpay checkout loader
- `frontend/src/state/appStore.jsx` = global state (auth/user/docs)
- `frontend/src/pages/dashboard/` = dashboard UI components
- `frontend/src/pages/renewals/` = renewals UI components
