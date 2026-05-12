# Komorebi Backend — Local setup

Quick steps to run backend locally (using SQLite for convenience):

1. Install dependencies

   cd backend
   npm install

2. Copy environment file

   cp .env.example .env

   # Edit .env if needed

3. Generate Prisma client

   npx prisma generate

4. Run migrations (creates sqlite DB and schema)

   npm run prisma:migrate

5. Seed DB

   npm run seed

6. Start server

   npm run dev

The API will be available at http://localhost:4000. Endpoints:

- POST /api/auth/login
- POST /api/auth/register
- GET /api/manga?q=&genre=&status=&sort=&page=&limit=
- Protected admin routes: POST/PUT/DELETE /api/manga (requires Authorization: Bearer <token>)

Notes:

- The default JWT secret is in `.env`; change it for production.
- The project uses sqlite by default for quick local testing; switch Prisma datasource back to Postgres if desired in `prisma/schema.prisma`.
