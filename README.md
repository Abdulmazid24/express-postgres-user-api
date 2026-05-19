# Advanced PostgreSQL & Express.js API | Modular Architecture

> **A Senior Developer's Deep Dive into Relational Databases, Modular Design (MVC), and Connection Pooling in Node.js.**

## 📌 Context & Motivation

As a Full-Stack MERN Developer accustomed to MongoDB, I built this project to deeply understand relational database mechanics and scalable backend architecture. 

This repository has evolved from a monolithic server file into a **fully modular, scalable architecture**. It demonstrates raw SQL execution, 1-to-1 relational data modeling (Foreign Keys), connection pooling, and the separation of concerns across Route, Controller, and Service layers using Express 5 and TypeScript.

## 🧠 Engineering Highlights & Architectural Decisions

### 1. Modular Architecture (Separation of Concerns)
The codebase follows a strictly modular, layer-based pattern:
- **Routes (`*.route.ts`)**: Directs incoming HTTP requests to the appropriate controllers.
- **Controllers (`*.controller.ts`)**: Handles request/response logic without containing business rules.
- **Services (`*.service.ts`)**: The "brain" of the application where complex business logic and raw database queries reside.
- **Entry Points (`server.ts` & `app.ts`)**: Separating server initialization (DB connection, port listening) from Express app configuration (middlewares, global routes) for better testability.

### 2. Relational Database Mechanics (Raw SQL)
- **Foreign Keys & Constraints**: Implemented 1-to-1 relationships between `users` and `profiles` tables using `user_id INT UNIQUE REFERENCES users(id)`.
- **Cascading Deletes**: Utilized `ON DELETE CASCADE` to automatically remove orphaned profile data when a parent user is deleted, ensuring strict data integrity at the database level.
- **SQL Injection Prevention**: Strict usage of parameterized queries (`$1, $2`).

### 3. Security & Authentication
- **Password Hashing**: Integrates `bcryptjs` to hash user passwords before storing them in the database.
- **JWT Authorization**: Utilizes `jsonwebtoken` for secure API access.
- **Protected Routes**: Custom Express middleware to verify token validity, user existence, and account status before granting access to protected routes (e.g., Get All Users).

### 4. Connection Pooling (`pg.Pool`)
Utilizes `pg.Pool` to maintain a warm pipeline of database connections in RAM, dramatically reducing TCP/IP handshake latency for subsequent API requests.

### 5. Custom Middlewares
- **Auth Middleware**: Parses `Authorization` headers, verifies JWTs, and attaches `req.user` for downstream controllers.
- **Logger Middleware**: Intercepts every incoming request to log the method, URL, and timestamp to a local `logger.txt` file for monitoring.

## 📁 Project Structure (Modular)

```text
src/
├── config/
│   └── env.ts             # Environment variables mapping
├── db/
│   └── index.ts           # PostgreSQL Pool & Schema initialization
├── modules/
│   ├── profile/
│   │   ├── profile.controller.ts
│   │   ├── profile.route.ts
│   │   └── profile.service.ts
│   └── user/
│       ├── user.controller.ts
│       ├── user.interface.ts
│       ├── user.route.ts
│       └── user.service.ts
├── app.ts                 # Express application & middleware setup
└── server.ts              # Main server entry point
```

## 📡 API Endpoints

### User Management (`/api/users`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/users` | Create User (returns created row without password) | No |
| **GET** | `/api/users` | Get All Users | Yes (JWT) |
| **GET** | `/api/users/:id` | Get Single User via Primary Key lookup | No |
| **PUT** | `/api/users/:id` | Update User dynamically using `COALESCE` | No |
| **DELETE** | `/api/users/:id` | Delete User (Triggers CASCADE delete on profile) | No |

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Login user and receive JWT Token | No |

### User Profiles (`/api/profile`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/profile` | Create a profile for an existing user | No |

## ⚙️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Abdulmazid24/express-postgres-user-api.git
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   Create a `.env` file with your PostgreSQL connection string:
   ```env
   CONNECTION_STRING="your_neon_db_connection_string_here"
   PORT=5000
   ```
4. **Run the server:**
   ```bash
   npm run dev
   ```

## 👨‍💻 About The Author

**Abdul Mazid**  
*Full-Stack MERN Developer | Distributed Systems Enthusiast*  
[LinkedIn Profile](https://www.linkedin.com/in/abdul-mazid)
