# Express & PostgreSQL User Management API

A robust, TypeScript-based RESTful API built with Express.js and PostgreSQL. This module demonstrates advanced database connectivity, CRUD operations, and secure querying practices using parameterized SQL.

## 🚀 Features

- **TypeScript Integrated**: Full type-safety across the application.
- **Express.js Server**: Fast, unopinionated, minimalist web framework.
- **PostgreSQL Database**: Relational database integration using the `pg` driver.
- **Connection Pooling**: Efficient database connection management via `pg.Pool`.
- **Environment Configuration**: Secure environment variable handling.
- **Complete CRUD Operations**: Create, Read, Update, and Delete endpoints for user management.
- **SQL Injection Prevention**: Implementation of parameterized queries.
- **Smart Updates**: Utilizing SQL `COALESCE` for dynamic partial updates.

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js (v5 compatible)
- **Language**: TypeScript (v6)
- **Database**: PostgreSQL (Neon Serverless DB)
- **Dependencies**: `pg`, `dotenv`, `cors`, `express`
- **Dev Dependencies**: `tsx`, `typescript`, `@types/express`, `@types/pg`

## 📁 Project Structure

```text
src/
├── config/
│   └── env.ts         # Environment variable configuration
└── server.ts          # Main application entry point & API routes
```

## ⚙️ Setup & Installation

1. **Clone the repository** (or navigate to the project directory).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   CONNECTION_STRING="your_postgresql_connection_string"
   PORT=5000
   ```
4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5000` (or your configured port) and automatically initialize the database tables.*

## 📡 API Endpoints

### 1. Health Check
- **GET** `/`
- **Description**: Checks if the server is running.
- **Response**: `200 OK`

### 2. Create User
- **POST** `/api/users`
- **Body Payload**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword",
    "age": 28
  }
  ```
- **Description**: Creates a new user in the database.

### 3. Get All Users
- **GET** `/api/users`
- **Description**: Retrieves a list of all users.

### 4. Get Single User
- **GET** `/api/users/:id`
- **Description**: Retrieves specific user details by ID. Returns `404` if not found.

### 5. Update User
- **PUT** `/api/users/:id`
- **Body Payload** (Partial update supported):
  ```json
  {
    "name": "John Updated",
    "age": 29
  }
  ```
- **Description**: Updates user information dynamically using SQL `COALESCE`.

### 6. Delete User
- **DELETE** `/api/users/:id`
- **Description**: Removes a user from the database by ID.

## 👨‍💻 Author Information

- **Name**: Abdul Mazid
- **Email**: abdulmazid.dev@gmail.com
- **Phone**: 01621455174

---
*Developed with a passion for world-class Full-Stack Engineering.*
