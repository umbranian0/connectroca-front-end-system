# ConnectTroca Frontend - Docker-First Reproducible Guide

This project is documented for student execution with Docker as the mandatory local runtime.

Primary documentation:

- Student workflow: `STUDENT_GUIDE.md`
- Deployment variables: `DEPLOYMENT_ENVIRONMENT.md`
- Runtime config source: `src/config/runtimeConfig.js`

## 1. Mandatory prerequisites for students

- Docker Desktop
- Git

Node.js/npm on host are optional and only required for maintainer workflows.

## 2. First-time setup on a student computer

```powershell
cd "C:\Users\vasil\Documents\Aulas\projeto integrado 2\frontend_conectra"
Copy-Item .env.example .env
docker compose up --build -d
```

Open:

- `http://localhost:5173`

## 3. Backend target switch (single variable)

Edit `.env` and change only:

- `VITE_BACKEND_TARGET=local` -> frontend localhost container + backend localhost Strapi
- `VITE_BACKEND_TARGET=development` -> frontend localhost container + Heroku development Strapi

Keep this empty unless an explicit override is required:

- `VITE_STRAPI_URL=`

After changing `.env`, restart the frontend container:

```powershell
docker compose up --build -d
```

## 4. Validation checklist (reproducibility)

1. Container is running:

```powershell
docker compose ps
```

2. Frontend opens at `http://localhost:5173`.
3. Login page `/login` loads.
4. Header API base URL matches selected target (localhost Strapi or Heroku URL).
5. Dashboard/forum/materials load data with correct backend permissions.

## 5. Daily Docker commands

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

## 6. Vercel deployment (frontend) + Heroku development backend

Use `.env.vercel.example` for Vercel environment variables.

Required baseline:

- `VITE_BACKEND_TARGET=development`
- `VITE_STRAPI_URL_DEVELOPMENT=https://connectra-backend-system-f4a977a741b9.herokuapp.com`
- `VITE_STRAPI_URL=` (empty unless explicit override is required)

Build/output:

- Build command: `npm run build`
- Output directory: `dist`

## 7. Troubleshooting

- Backend mismatch: verify `VITE_BACKEND_TARGET` and `VITE_STRAPI_URL` in `.env`.
- Route 404 after deployment: verify SPA rewrite in `vercel.json`.
- Auth errors: verify Strapi permissions for auth/users endpoints.
- Container not refreshing config: run `docker compose down` then `docker compose up --build -d`.
