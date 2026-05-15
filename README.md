# PostgreSQL & Express.js Core Mechanics | Deep Dive 🚀

> **A Senior Developer's Exploration of Relational Databases, Raw SQL, and Connection Pooling in Node.js.**

## 📌 Context & Motivation

As a Full-Stack MERN Developer accustomed to the magic of MongoDB and Mongoose, I built this project with a specific goal: **to strip away the ORM abstractions and deeply understand relational database mechanics at the core level.** 

While modern frameworks make development faster, true engineering requires understanding what happens under the hood. This repository documents my deep dive into raw SQL queries, TCP/TLS connection pooling, parameterized query execution, and type-safe server architecture using TypeScript and Express 5.

## 🧠 Engineering Highlights & Architectural Decisions

### 1. Raw SQL over ORM (For Now)
Instead of relying on Prisma or TypeORM, every CRUD operation is written in raw SQL. This intentional constraint enforces a deep understanding of:
- **Schema Design & Constraints**: Implementing `UNIQUE`, `NOT NULL`, and `DEFAULT` at the database level.
- **SQL Injection Prevention**: Strict usage of parameterized queries (`$1, $2`) for all client inputs.
- **Atomic Partial Updates**: Leveraging the SQL `COALESCE` function for thread-safe, dynamic `PUT` / `PATCH` operations without multiple database round-trips.

### 2. Connection Pooling (`pg.Pool`)
Connecting to a database is an expensive operation. Instead of establishing a new TCP connection per request, this API utilizes `pg.Pool` to maintain a warm pool of connections.
- Reduces latency from hundreds of milliseconds to single digits.
- Prepares the application architecture for high-concurrency environments and scaling with tools like `PgBouncer`.

### 3. Modern Tech Stack (2026 Standards)
- **Express 5.2.x**: Native handling of asynchronous Promise rejections (eliminating the need for repetitive `try/catch` wrappers in the future).
- **TypeScript 6.0.x**: Utilizing `es2025` compilation targets and strict type-checking for zero-runtime-overhead safety.
- **Neon Serverless PostgreSQL**: Modern, scale-to-zero cloud database architecture.

## 📡 API Endpoints (CRUD)

| Method | Endpoint | Description | Deep-Dive Implementation Detail |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Health Check | Validates server instance status. |
| **POST** | `/api/users` | Create User | Uses `RETURNING *` to fetch the created row in a single network round-trip. |
| **GET** | `/api/users` | Get All Users | Fetches all records (Future implementation: Pagination via `LIMIT`/`OFFSET`). |
| **GET** | `/api/users/:id` | Get Single User | B-Tree Indexing lookup via `PRIMARY KEY` for O(log n) read speed. |
| **PUT** | `/api/users/:id` | Update User | Uses `COALESCE($1, column)` for dynamic, atomic partial updates. |
| **DELETE** | `/api/users/:id` | Delete User | Checks `result.rowCount` to handle 404s gracefully without returning data. |

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

*Documenting the journey from relying on framework magic to mastering core software engineering principles.*
