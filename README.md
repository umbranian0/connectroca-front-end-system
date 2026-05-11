# ConnectTroca Frontend - Docker-First Student Guide

This project is documented for reproducible student execution with Docker as the default local runtime.

Primary documentation:

- Student workflow: `STUDENT_GUIDE.md`
- Deployment variables: `DEPLOYMENT_ENVIRONMENT.md`
- Runtime config source: `src/config/runtimeConfig.js`

## May 2026 update summary

- Backend relation and visibility rules were hardened to prevent cross-user data exposure.
- Swagger/OpenAPI is available on backend at `/documentation`.
- Local validation now includes backend health and API docs checks.

## 1) Mandatory prerequisites for students

- Docker Desktop
- Git

Node.js/npm on host are optional and only required for maintainer workflows.

## 2) Full local stack setup (recommended)

### Start backend (Strapi + Postgres)

```powershell
cd "C:\Users\vasil\Documents\Aulas\projeto integrado 2\backend_conectra\connectroca-back-end-system"
Copy-Item .env.example .env   # first run only
docker compose up --build -d
```

### Start frontend

```powershell
cd "C:\Users\vasil\Documents\Aulas\projeto integrado 2\frontend_conectra"
Copy-Item .env.example .env   # first run only
docker compose up --build -d
```

Open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:1337/api/health`
- Backend Swagger: `http://localhost:1337/documentation`

## 3) Backend target switch (single variable)

Edit `.env` and change only:

- `VITE_BACKEND_TARGET=local` -> frontend localhost container + backend localhost Strapi
- `VITE_BACKEND_TARGET=development` -> frontend localhost container + Heroku development Strapi

Keep this empty unless explicit override is required:

- `VITE_STRAPI_URL=`

After changing `.env`, restart frontend:

```powershell
docker compose up --build -d
```

## 4) Validation checklist

1. Frontend container is running:

```powershell
docker compose ps
```

2. `http://localhost:5173` returns `200`.
3. Login page `/login` loads.
4. Header API base URL matches selected target.
5. After login, protected backend data is user-scoped (no unrelated profile/membership records).

## 5) Daily Docker commands

Start/update:

```powershell
docker compose up --build -d
```

Logs:

```powershell
docker compose logs -f frontend
```

Stop:

```powershell
docker compose down
```

## 6) Vercel deployment (frontend) + Heroku backend

Use `.env.vercel.example` for Vercel environment variables.

Required baseline:

- `VITE_BACKEND_TARGET=development`
- `VITE_STRAPI_URL_DEVELOPMENT=https://connectra-backend-system-f4a977a741b9.herokuapp.com`
- `VITE_STRAPI_URL=` (empty unless explicit override is required)

Build/output:

- Build command: `npm run build`
- Output directory: `dist`

## 7) Troubleshooting

- Backend mismatch: verify `VITE_BACKEND_TARGET` and `VITE_STRAPI_URL` in `.env`.
- API auth/visibility issues: confirm backend is updated and healthy at `/api/health`.
- API docs missing: confirm backend plugin docs at `http://localhost:1337/documentation`.
- Route 404 after deployment: verify SPA rewrite in `vercel.json`.
- Container not refreshing config: run `docker compose down` then `docker compose up --build -d`.
