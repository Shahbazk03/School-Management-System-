# School Management System Backend

This is the fully-functional backend for the School Management and Attendance System.
Built with NestJS, Prisma, and PostgreSQL.

## Architecture
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL (Containerized via Docker)
- **ORM**: Prisma v7
- **Authentication**: JWT with Passport
- **Authorization**: RBAC (Role-Based Access Control)
- **API Docs**: Swagger (OpenAPI)

## Technology Stack
- Node.js 22.x
- TypeScript
- PostgreSQL 15
- Prisma Client & Adapter
- Argon2 for hashing
- Helmet & CORS for security

## Prerequisites
- Node.js & npm
- Docker (for PostgreSQL)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   ```bash
   # Start the PostgreSQL container
   docker-compose up -d
   ```

3. **Environment Variables**
   The `.env` file is already created:
   ```env
   DATABASE_URL="postgresql://root:password@localhost:5432/school_management?schema=public"
   JWT_SECRET="super-secret-jwt-key-2026-development-only"
   JWT_REFRESH_SECRET="super-secret-jwt-refresh-key-2026"
   PORT=3000
   NODE_ENV="development"
   ```

4. **Migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed Data**
   The seed script creates the required test scenario with historical attendance spanning 3 years for 'Rahul Sharma'.
   ```bash
   npx tsx prisma/seed.ts
   ```

## Running the Application
```bash
# Development
npm run start:dev

# Production Build
npm run build
npm run start:prod
```

## API Documentation
Once the server is running, visit the Swagger documentation:
- **URL**: `http://localhost:3000/api/docs`

## Development Accounts (Passwords are all `password123`)
- **Admin**: admin@demo.local (LoginID: ADMIN-001)
- **Teacher**: teacher@demo.local (LoginID: TEACHER-001)
- **Parent**: parent@demo.local (LoginID: PARENT-001)
- **Student**: student@demo.local (LoginID: STUDENT-001)

## Exact Next Step for Frontend
The backend is completely deployed locally and serving REST endpoints.
The frontend team can now run `npm run start:dev` and begin building the web application on top of this backend, utilizing the auto-generated Swagger schema (`/api/docs-json`) to generate frontend API client wrappers.
