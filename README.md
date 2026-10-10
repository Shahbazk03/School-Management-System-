# 🏫 Next-Gen School Management System

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js) 
![NestJS](https://img.shields.io/badge/NestJS-10-ea2845?logo=nestjs) 
![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?logo=prisma) 
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?logo=docker)

A highly scalable, modern, and comprehensive **School Management System** designed to streamline administrative tasks, enhance teacher productivity, and provide real-time academic insights for students and parents. 

Built with a state-of-the-art tech stack, this application enforces strict **Role-Based Access Control (RBAC)** across four distinct portals: **Admin**, **Teacher**, **Student**, and **Parent**.

---

## ✨ Key Features

### 🏢 Administrative Powerhouse (Admin Portal)
- **Complete Academic Control:** Manage sessions, classes, sections, and subjects seamlessly.
- **Dynamic Report Card Generation:** Generate highly customizable, professional PDF report cards (using Puppeteer) in bulk or individually.
- **Advanced Bulk Operations:** Import students and staff via CSV for instant onboarding.
- **Attendance & Timetable Engine:** Oversee school-wide attendance and intricate timetable allocations.

### 🧑‍🏫 Empowered Educators (Teacher Portal)
- **Effortless Mark Entry:** Clean, spreadsheet-like interfaces for swift mark allocations aligned with exam structures.
- **Real-Time Attendance:** Mark and track daily student attendance with one-click visualizations.
- **Schedule Management:** Instant access to daily class allocations and timetables.

### 🎓 Student & Parent Portals
- **Academic Analytics:** Deep dive into exam performance, visual grade tracking, and automated report card downloads.
- **Attendance Tracking:** Keep a close eye on presence/absence records over the academic year.
- **Notices & Communication:** Real-time updates from the administration.

---

## 🛠️ Technical Architecture

This system leverages a decoupled **Client-Server architecture** to ensure maximum performance and maintainability:

### Frontend (Client)
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Lucide Icons
- **State Management:** React Hooks + Axios Interceptors for JWT rotation
- **UI Components:** Custom highly-polished Dashboard Layouts

### Backend (API)
- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **Database:** PostgreSQL (Hosted via Neon)
- **ORM:** Prisma
- **PDF Generation:** Puppeteer + EJS Templates
- **Authentication:** JWT with secure refresh/access token rotation mechanism

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (or use Docker)
- npm or yarn

### 1. Database Setup
You can easily spin up the PostgreSQL database using Docker:
```bash
cd backend
docker-compose up -d
```

### 2. Backend Initialization
Navigate to the `backend` directory, install dependencies, and run migrations:
```bash
cd backend
npm install

# Setup environment variables (create a .env file)
# DATABASE_URL="postgresql://root:password@localhost:5432/school_management"
# JWT_SECRET="your_secret"

# Sync database schema
npx prisma db push

# Start the NestJS server
npm run dev
```

### 3. Frontend Initialization
In a new terminal, navigate to the `frontend` directory:
```bash
cd frontend
npm install

# Setup environment variables (create a .env file)
# NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"

# Start the Next.js development server
npm run dev
```

The system will now be accessible at `http://localhost:3001` (or your configured frontend port).

---

## 🛡️ Security & Best Practices
- **Password Hashing:** Argon2 hashing for maximum security against rainbow table attacks.
- **Stateless Auth:** Secure JWTs transmitted via Bearer tokens.
- **Data Validation:** Strict DTO (Data Transfer Object) validation pipelines using `class-validator`.
- **Database Integrity:** Prisma relational constraints ensuring zero orphaned records.

## 📄 License
This project is licensed under the MIT License.
