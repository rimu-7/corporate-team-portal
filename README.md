# 🏢 Corporate Team Portal

A full-stack **Corporate Team Management System** built with **Next.js (App Router)**, **TypeScript**, **Prisma**, and **Tailwind CSS**.  
This application includes **Role-Based Access Control (RBAC)**, secure authentication, and powerful team management features.

---

## Features

- 🔐 **Authentication System**  
  Secure Login and Registration flow using **HttpOnly cookies**.

- **Role-Based Access Control (RBAC)**
  -  **Admin**
    - View all users
    - Promote/demote roles (**User / Manager / Admin**)
    - Assign/remove users from teams
  -  **Manager**
    - Restricted view (can only view members of their own assigned team)
  -  **User**
    - Basic dashboard access with personal profile information

-  **Team Management**  
  Organize users into specific departments:
  - Engineering
  - Marketing
  - Operations

-  **Responsive Design**  
  Built with **Tailwind CSS** for a modern, mobile-friendly interface.

---

##  Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL / SQLite (via Prisma ORM)
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Validation:** Zod (used in backend logic)

---

##  Project Structure

```bash
.
├── app
│   ├── admin
│   │   └── page.tsx
│   ├── api
│   │   ├── auth
│   │   │   ├── login
│   │   │   ├── logout
│   │   │   ├── me
│   │   │   └── register
│   │   ├── health
│   │   │   └── route.ts
│   │   └── user
│   │       ├── [userId]
│   │       └── route.ts
│   ├── context
│   │   └── AuthContext.tsx
│   ├── dashboard
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── lib
│   │   ├── auth.ts
│   │   └── db.ts
│   ├── login
│   │   └── page.tsx
│   ├── manager
│   │   └── page.tsx
│   ├── page.tsx
│   ├── register
│   │   └── page.tsx
│   └── types
│       └── index.ts
├── components
│   └── Navbar.tsx
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── prisma
│   ├── schema.prisma
│   └── seed.ts
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── README.md
└── tsconfig.json

22 directories, 31 files  
````

---

## Getting Started

### 1. Clone the repository

```bash
git clone <https://github.com/rimu-7/corporate-team-portal>
cd <corporate-team-portal>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Example for local SQLite (easiest for testing)

# Or for PostgreSQL
# DATABASE_URL="mysql://user:password@localhost:5432/mydb"

# Secret used for hashing/sessions
JWT_SECRET="super-secret-key-change-this"
```

### 4. Database Setup & Migration

Push the Prisma schema to your database:

```bash
npm run db:generate
npm run db:push
```

### 5. Seed the Database (Crucial)

Populate the database with initial Teams and Users to test the functionality:

```bash
npm run db:seed
```



>  The seed script creates default users with the password: **`12345678`**

### 6. Run the Application

```bash
npm run dev
```

Now open: [http://localhost:3000](http://localhost:3000)

---

## Testing Roles (Default Seed Data)

All of the following users use the password: **`12345678`**

| Role    | Email               | Capabilities                               |
| ------- | ------------------- | ------------------------------------------ |
| Manager | `john@company.com`  | Can view **Engineering** team members only |
| Manager | `bob@company.com`   | Can view **Marketing** team members only   |
| User    | `jesse@company.com` | Basic dashboard access                     |
| User    | `alice@company.com` | Basic dashboard access                     |

### Admin Access

To test the **Admin Panel**, manually change a user’s role to `ADMIN` using:

* **Prisma Studio**

  ```bash
  npx prisma studio
  ```
* Or directly in your database.

>  For security reasons, the seed file does **not** create a default Admin user.

---

## API Endpoints

### Authentication

* `POST /api/auth/login` – Authenticate user
* `POST /api/auth/register` – Create a new account
* `POST /api/auth/logout` – Clear session
* `GET /api/auth/me` – Get current session data

### Users

* `GET /api/user` – Fetch users

  * Response shape depends on the requester’s role (Admin/Manager/User).
* `PATCH /api/user/[userId]` – Update user role or team (**Admin only**)

---

## License

This project is open-source and available under the **MIT License**.





