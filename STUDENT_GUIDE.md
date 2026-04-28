# ConnectTroca Frontend - Student Guide

## Objective
This guide is for students who need to run, test, and customize the frontend safely.

## 1) Start the frontend

```powershell
cd "C:\Users\vasil\Documents\Aulas\projeto integrado 2\frontend_conectra"
Copy-Item .env.example .env   # first run only
docker compose up --build -d
```

Open: `http://localhost:5173`

## 2) Authentication pages

- Login: `/login`
- Register account: `/register`
- Forgot password: `/forgot-password`

If your backend permissions are private, login is required for protected actions.

## 3) Main student pages

- Dashboard: `/`
- Forum: `/forum`
- Materials: `/materials`
- Groups: `/groups`
- Profile: `/profile`
- Form examples: `/examples/forms`

## 4) Logo usage (frontend branding)

Current logo path:

- `public/assets/connectroca_logo.png`

Used in:

- Header brand
- Login/Register/Forgot Password cards
- Chatbot visual block

To replace logo later, keep the same file name and path, or update references in:

- `src/components/AppHeader.jsx`
- `src/pages/LoginPage.jsx`
- `src/pages/RegisterPage.jsx`
- `src/pages/ForgotPasswordPage.jsx`
- `src/pages/ChatbotPage.jsx`

## 5) Useful commands

```powershell
npm run build
npm run dev
```

## 6) Troubleshooting

- If links return 404 on deploy, check `vercel.json` rewrite to `/index.html`.
- If backend calls fail, confirm `VITE_STRAPI_URL` / `VITE_RUNTIME_MODE`.
- If auth endpoints fail, check Strapi permissions for Users and Auth routes.
