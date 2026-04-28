# ConnectTroca Frontend - Local + Vercel Deployment Guide

This frontend is implemented with React + Vite and consumes the Strapi backend API.

Student quick guide: `STUDENT_GUIDE.md`

## Main pages

- Dashboard: `/`
- Forum: `/forum`
- Topic detail: `/forum/topic/:topicId`
- Materials: `/materials`
- Groups: `/groups`
- Group chat: `/groups/:groupId/chat`
- Group members: `/groups/:groupId/members`
- Chatbot screen: `/chatbot`
- Profile: `/profile`
- Login: `/login`

## Files you should know

- `DEPLOYMENT_ENVIRONMENT.md` -> complete Vercel environment checklist

- `.env.example` -> local development template
- `.env.vercel.example` -> Vercel environment template
- `.env.develop.example` -> local frontend to develop backend template
- `.env.production.example` -> production variable template
- `vercel.json` -> Vercel build/output + SPA route fallback

## Runtime modes

Use these values to switch behavior without code changes:

1. Full local (`frontend local` + `backend local`):
   - `VITE_RUNTIME_MODE=local`
   - `VITE_STRAPI_URL=` (empty)
2. Full develop (`frontend deploy` + `backend Heroku`):
   - `VITE_RUNTIME_MODE=develop`
   - `VITE_STRAPI_URL=https://connectra-backend-system-f4a977a741b9.herokuapp.com`
3. Cross (`frontend local` -> `backend Heroku`):
   - Copy `.env.develop.example` to `.env`, or set `VITE_RUNTIME_MODE=develop` manually

Priority order in code:

1. `VITE_STRAPI_URL` (explicit override)
2. `VITE_RUNTIME_MODE` (`local` or `develop`)
3. Hostname fallback (`localhost` => local backend, other domains => Heroku backend)

## Local Docker setup (recommended for students)

### 1. Open frontend folder

```powershell
cd "C:\Users\vasil\Documents\Aulas\projeto integrado 2\frontend_conectra"
```

### 2. Configure environment (first run only)

```powershell
Copy-Item .env.example .env
```

Most important variables:

- `VITE_RUNTIME_MODE=local`
- `VITE_STRAPI_URL=` (empty to use mode defaults)

### 3. Start frontend container

```powershell
docker compose up --build -d
```

### 4. Open application

- URL: `http://localhost:5173`

### 5. Login with demo user

- Email: `integration.user@example.com`
- Password: `Integration123!`

## Vercel deployment (production + preview)

### 1. Backend requirement (must be online first)

Before deploying frontend to Vercel, your Strapi backend must be deployed on a public HTTPS URL, for example:

- `https://connectra-backend-system-f4a977a741b9.herokuapp.com`

### 2. Create Vercel project

In Vercel:

1. Import repository.
2. Set **Root Directory** to `frontend_conectra`.
3. Build command: `npm run build`.
4. Output directory: `dist`.

(`vercel.json` already defines these values.)

### 3. Add environment variables in Vercel

From `.env.vercel.example`, add these variables in Vercel Project Settings -> Environment Variables:

- `VITE_RUNTIME_MODE` (`develop` for Vercel deployments)
- `VITE_STRAPI_URL` (set to `https://connectra-backend-system-f4a977a741b9.herokuapp.com`)
- `VITE_STRAPI_AUTH_ENDPOINT`
- `VITE_STRAPI_USERS_ENDPOINT`
- `VITE_STRAPI_PROFILES_ENDPOINT`
- `VITE_STRAPI_AREAS_ENDPOINT`
- `VITE_STRAPI_GROUPS_ENDPOINT`
- `VITE_STRAPI_GROUP_MEMBERS_ENDPOINT`
- `VITE_STRAPI_USER_AREAS_ENDPOINT`
- `VITE_STRAPI_MATERIALS_ENDPOINT`
- `VITE_STRAPI_TOPICS_ENDPOINT`
- `VITE_STRAPI_POSTS_ENDPOINT`
- `VITE_STRAPI_COMMENTS_ENDPOINT`
- `VITE_STRAPI_LIKES_ENDPOINT`
- `VITE_STRAPI_ACTIVITIES_ENDPOINT`

Set them for:

- Production
- Preview

### 4. Trigger deployment

After env variables are saved, redeploy from Vercel dashboard.

### 5. Validate on deployed URL

1. Open Vercel URL.
2. Login with seeded/demo user.
3. Confirm dashboard/forum/materials are populated.

## Language support

The UI supports:

- Portuguese (`PT`)
- English (`EN`)

Use the header language switch.

## Backend endpoints consumed by frontend

- `/api/profiles`
- `/api/areas`
- `/api/groups`
- `/api/group-members`
- `/api/user-areas`
- `/api/materials`
- `/api/topics`
- `/api/posts`
- `/api/comments`
- `/api/likes`

The frontend requests `populate=*` automatically.

## Daily commands

Start:

```powershell
docker compose up -d
```

Stop:

```powershell
docker compose down
```

Logs:

```powershell
docker compose logs -f frontend
```

## Optional host-machine mode

```powershell
npm install
npm run dev
```

Build production bundle:

```powershell
npm run build
```

## Troubleshooting

If page is empty or login fails:

1. Check backend health (`http://localhost:1337/api/health` locally).
2. Confirm `VITE_STRAPI_URL` or `VITE_RUNTIME_MODE` points to the intended backend.
3. Confirm backend CORS includes your frontend origin.
4. Rebuild frontend container:

```powershell
docker compose down
docker compose up --build -d
```




