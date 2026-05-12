
<img width="2816" height="1536" alt="komorebi-head" src="https://github.com/user-attachments/assets/9d4947e8-97de-457f-8da2-9ff6c6619151"> <br>
# Komorebi <br>
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/NadiiaPokorna/komorebi-system/blob/main/LICENSE)
[![GitHub release](https://img.shields.io/static/v1?label=Release&message=v.1.0.0&color=yellowgreen)](https://github.com/NadiiaPokorna/komorebi-system/releases)

**Copyright 2025 Pokorna Nadiia**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## Komorebi — Manga Reader Platform

Full-stack manga reader platform.
Backend: Node.js + TypeScript + Express + PostgreSQL.
Frontend: React (TSX, Vite).
Storage: AWS S3 (chapters and covers stored separately).

---

## Tech Stack

Backend:
- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma
- JWT (UUID-based auth)
- AWS SDK (S3)
- Multer (file uploads)
- Swagger (API docs)

Frontend:
- React
- TypeScript (TSX)
- Vite

---

## Architecture Overview

- PostgreSQL stores users, mangas, chapters metadata, comments, bookmarks, history, reports.
- AWS S3 stores:
  - Manga covers: `/covers/{mangaId}/cover.jpg`
  - Manga chapters: `/chapters/{mangaId}/{chapterId}.pdf`
- Backend generates signed S3 URLs for chapter access.
- Auth via JWT (Bearer token).
- Role-based access: `USER`, `ADMIN`.

---

## Requirements

- Node.js ≥ 18
- PostgreSQL ≥ 14
- AWS account with S3 bucket
- npm or pnpm

---

## Environment Variables

Create `.env` in backend root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/manga-reader"
JWT_SECRET="6001759b26f5f49b34178d0d5f9c9551"

VITE_PORT=4000

AWS_REGION="AWS_REGION"
AWS_ACCESS_KEY_ID="AWS_ACCESS_KEY_ID"
AWS_SECRET_ACCESS_KEY="AWS_SECRET_ACCESS_KEY"
AWS_S3_BUCKET_NAME="komorebi-storage"
```

---

## Backend Setup

```bash
cd backend
npm install
```

Generate Prisma client and apply migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

Run backend in development mode:

```bash
npm run dev
```

Backend URL:

```
http://localhost:4000
```

Swagger:

```
http://localhost:4000/api-docs
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```
http://localhost:5173
```

---

## AWS S3 Configuration

Required permissions:
- `s3:PutObject`
- `s3:GetObject`
- `s3:DeleteObject`

Recommended structure:

```
komorebi-storage/
 ├── covers/
 │    └── {mangaId}/cover.jpg
 └── chapters/
      └── {mangaId}/{chapterId}.pdf
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Purpose |
|------|---------|--------|
| POST | /api/auth/login | User login |
| POST | /api/auth/register | User registration |
| GET | /api/auth/me | Get current user |

### User

| Method | Endpoint | Purpose |
|------|---------|--------|
| GET | /api/user/profile | Get profile |
| PUT | /api/user/profile | Update profile |
| GET | /api/user/bookmarks | Get bookmarks |
| POST | /api/user/bookmarks | Toggle bookmark |
| GET | /api/user/history | Reading history |
| POST | /api/user/history | Update history |

### Manga (Public)

| Method | Endpoint | Purpose |
|------|---------|--------|
| GET | /api/manga | Manga list |
| GET | /api/manga/:id | Manga details |
| GET | /api/manga/:id/chapters | Chapters list |
| GET | /api/chapters/:chapterId/file | Signed file URL |
| GET | /api/manga/:id/comments | Comments |

### Interaction (Auth)

| Method | Endpoint | Purpose |
|------|---------|--------|
| POST | /api/manga/:id/comments | Add comment |
| DELETE | /api/comments/:id | Delete comment |
| POST | /api/manga/:id/report | Report manga |

### Admin — Manga

| Method | Endpoint | Purpose |
|------|---------|--------|
| POST | /api/manga | Create manga |
| POST | /api/manga/:id/chapters | Upload chapter |
| DELETE | /api/manga/:id | Delete manga |
| DELETE | /api/chapters/:chapterId | Delete chapter |

### Admin — Moderation

| Method | Endpoint | Purpose |
|------|---------|--------|
| GET | /api/admin/reports | Get reports |
| POST | /api/admin/reports/:id/resolve | Resolve report |
| GET | /api/admin/stats | Platform stats |

---

## Authentication

- Header: `Authorization: Bearer <token>`
- UUID-based token
- Admin routes require `ADMIN` role

---

## Production

Backend:

```bash
npm run build
npm start
```

Frontend:

```bash
npm run build
```

---

## License

MIT

