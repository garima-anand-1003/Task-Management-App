#  Full Stack Task Management App

A production-ready **Task Management System** built using **FastAPI (Backend)** and **React (Frontend)** with JWT Authentication.

# Features

### Authentication & Security
    
  1. User Registration
  2. User Login (JWT access tokens & HttpOnly refresh tokens)
  3. Silent Token Refresh via Axios Interceptors
  4. Secure password hashing (bcrypt)
  5. Role-Based Access Control (Admin vs. User)
  6. Protected application routes and API endpoints

### Task Management

  1. Create, Update, and Delete Tasks
  2. View user-specific tasks
  3. Admin override capabilities (manage all tasks/users based on role)

##  Tech Stack

### Backend

* FastAPI
* SQLAlchemy
* SQLite / PostgreSQL
* JWT (python-jose)
* Passlib (bcrypt)

### Frontend

* React
* React Router
* Axios
* Context API (Auth Management)
* jwt-decode (Client-side role and token parsing)


#  Project Structure

## Backend Structure

```
backend/
│
├── models.py
├── schemas.py
├── database.py
├── auth.py
├── utils.py
├── main.py
│
├── routers/
│   ├── users.py
│   └── tasks.py
│
└── .env
```

## Frontend Structure

```
frontend/
│
├── src/
│   ├── api/
│   │   ├── axiosConfig.js
│   │   ├── auth.js
│   │   └── tasks.js
│   │
│   ├── components/
│   │   ├── TaskForm.jsx
│   │   ├── PrivateRoute.jsx
│   │   └── AdminRoute.jsx
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── Dashboard.jsx
│   │   └── UserManagement.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── AuthProvider.jsx
│   │
│   ├── App.jsx
│   └── index.js

```


#  Setup Instructions

##  Backend Setup

  1. Navigate to backend folder:

      ```
      cd backend
      ```

  2. Create virtual environment:

      ```
      python -m venv venv
      ```

  3. Activate virtual environment:

      ```
      venv\Scripts\activate   (Windows)
      source venv/bin/activate (Mac/Linux)
      ```

  4. Install dependencies:

      ```
      pip install -r requirements.txt
      ```

  5. Create `.env` file:

      ```
      SECRET_KEY=your_secret_key_here
      ```

  6. Run server:

      ```
      uvicorn main:app --reload
      ```

  7. Open Swagger Docs:

      ```
      http://localhost:8000/docs
      ```


## Frontend Setup

  1. Navigate to frontend:

      ```
      cd frontend
      ```

  2. Install dependencies:

      ```
      npm install
      ```

  3. Run frontend:

      ```
      npm start
      ```

  4. Open app:

      ```
      http://localhost:5173
      ```


#  Authentication Flow

1. Initial Login: User logs in. Backend validates credentials.
2. Token Issuance: Backend returns a short-lived access_token in the JSON response and sets a long-lived refresh_token inside HttpOnly cookie.
3. Storage & State: Frontend stores the access_token in localStorage and decodes it to determine the user's role (admin or user). The refresh_token is handled automatically by the browser.
4. Standard Requests: Axios interceptor attaches the access_token (Bearer <token>) to every outgoing API request.
5. Token Expiration & Refresh: If a request fails with a 401 Unauthorized, the Axios interceptor pauses the request, automatically calls /users/refresh (sending the HttpOnly cookie), retrieves a new access_token, updates localStorage, and seamlessly retries the original failed request.


#  API Documentation


##  User APIs

### 1. Register User

Creates a new user account.

**HTTP**
POST /users/register

**Request Body (JSON)**

```json
{
  "name": "abc",
  "email": "abc@example.com",
  "password": "securepassword123",
  "role": "user"
}
```

> **Note:** `role` can be `"user"` or `"admin"`

**Response (200 OK)**

```json
{
  "id": 1,
  "name": "abc",
  "email": "abc@example.com",
  "role": "user"
}
```



### 2. Login User

Authenticates the user, returns an access token, and sets a refresh token in an HttpOnly cookie.

**HTTP**
POST /users/login

**Request Body (x-www-form-urlencoded)**

```
username: abc@example.com
password: securepassword123
```

**Response (200 OK)**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5c...",
  "token_type": "bearer"
}
```

> **Note:** Server also sends:

```
Set-Cookie: refresh_token=...; HttpOnly;
```



### 3. Refresh Token

Generates a new access token using the refresh token stored in cookies.

**HTTP**
POST /users/refresh

**Headers**

```
Cookie: refresh_token=...
```

*(Handled automatically when `withCredentials: true` is enabled)*

**Request Body**
(empty)

**Response (200 OK)**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5c_NEW_TOKEN...",
  "token_type": "bearer"
}
```



### 4. Get All Users (Admin Only)

Fetches all registered users.

**HTTP**
GET /users/

**Headers**

```
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  {
    "id": 1,
    "name": "abc",
    "email": "abc@example.com",
    "role": "admin"
  },
  {
    "id": 2,
    "name": "Ankit",
    "email": "ankit@example.com",
    "role": "user"
  }
]
```



### 5. Delete User (Admin Only)

Deletes a user.

**HTTP**
DELETE /users/{id}

**Headers**

```
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
{
  "detail": "User deleted"
}
```



##  Task APIs

### 1. Create Task

Creates a new task for the authenticated user.

**HTTP**
POST /tasks/

**Headers**

```
Authorization: Bearer <access_token>
```

**Request Body (JSON)**

```json
{
  "title": "Setup PostgreSQL",
  "description": "Configure the local database and run Alembic migrations",
  "status": "In Progress"
}
```

**Response (200 OK)**

```json
{
  "id": 1,
  "title": "Setup PostgreSQL",
  "description": "Configure the local database and run Alembic migrations",
  "status": "In Progress",
  "owner_id": 1
}
```



### 2. Get User Tasks

Fetches all tasks of the logged-in user.

**HTTP**
GET /tasks/

**Headers**

```
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  {
    "id": 1,
    "title": "Setup PostgreSQL",
    "description": "Configure the local database and run Alembic migrations",
    "status": "In Progress",
    "owner_id": 1
  }
]
```



### 3. Update Task

Updates an existing task.

> Users can update only their tasks unless they are admin.

**HTTP**
PUT /tasks/{id}

**Headers**

```
Authorization: Bearer <access_token>
```

**Request Body (JSON)** *(partial update allowed)*

```json
{
  "status": "Completed"
}
```

**Response (200 OK)**

```json
{
  "id": 1,
  "title": "Setup PostgreSQL",
  "description": "Configure the local database and run Alembic migrations",
  "status": "Completed",
  "owner_id": 1
}
```



### 4. Delete Task

Deletes a task.

> Only the owner or admin can delete.

**HTTP**
DELETE /tasks/{id}

**Headers**

```
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
{
  "detail": "Task deleted successfully"
}
```





#  Key Concepts Implemented

* JWT Authentication
* OAuth2PasswordBearer
* Dependency Injection (FastAPI)
* Password Hashing (bcrypt)
* React Context API
* Axios Interceptors
* Refresh token
* Role-based access
* Access token
* Protected Routes


##  Overall Architecture Flow

```
React UI
   ↓
Axios (with JWT token)
   ↓
FastAPI Routes
   ↓
Auth Dependency (JWT validation)
   ↓
Database (SQLAlchemy)
   ↓
Response → UI Update
```

#  Common Issues & Fixes

### 1. 422 Error (Unprocessable Entity)

Cause: Wrong request format
Fix: Use form-data for login

### 2. Token not working

Cause: Axios not attaching token
Fix: Use interceptor

### 3. Create Task fails

Cause: Missing Authorization header
Fix: Ensure token is sent


# Future Improvements

  * Pagination & Filtering
  * Deployment (Docker + Cloud)

#  Conclusion

This project demonstrates a complete **full-stack authentication system with CRUD operations**, following industry best practices using FastAPI and React.

