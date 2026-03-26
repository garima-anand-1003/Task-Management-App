#  Full Stack Task Management App

A production-ready **Task Management System** built using **FastAPI (Backend)** and **React (Frontend)** with JWT Authentication.


#  Features

##  Authentication

* User Registration
* User Login (JWT authentication)
* Secure password hashing (bcrypt)
* Protected routes (frontend + backend)

##  Task Management

* Create Task
* Update Task
* Delete Task
* View all tasks (user-specific)

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
│   │   └── TaskForm.jsx
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── Dashboard.jsx
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


## 💻 Frontend Setup

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
http://localhost:3000
```


# 🔐 Authentication Flow

1. User registers
2. User logs in
3. Backend returns JWT token
4. Token stored in localStorage
5. Axios interceptor attaches token to every request
6. Protected APIs validate token using FastAPI dependency


#  API Endpoints

##  User APIs

### 1.Register User

```
POST /users/register
```

Body:

```
{
  "name": "John",
  "email": "john@example.com",
  "password": "123456"
}
```


### 2.Login User

```
POST /users/login
```

Body (form-data):

```
username: email
password: password
```

Response:

```
{
  "access_token": "JWT_TOKEN",
  "token_type": "bearer"
}
```


##  Task APIs

### 1.Create Task

```
POST /tasks
```

Headers:

```
Authorization: Bearer <token>
```

Body:

```
{
  "title": "Task 1",
  "description": "Some description",
  "status": "Pending"
}
```


### 2.Get All Tasks

```
GET /tasks
```


### 3.Update Task

```
PUT /tasks/{id}
```


### 4.Delete Task

```
DELETE /tasks/{id}
```


#  Key Concepts Implemented

* JWT Authentication
* OAuth2PasswordBearer
* Dependency Injection (FastAPI)
* Password Hashing (bcrypt)
* React Context API
* Axios Interceptors
* Protected Routes

#  Complete Application Flow

## 1. User Registration Flow

1. User enters:

   * Name
   * Email
   * Password

2. Frontend sends request:

```
POST /users/register
```

Request Body:

```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "123456"
}
```

3. Backend:

* Checks if email already exists
* Hashes password using bcrypt
* Stores user in database

4. Response:

```json
{
  "id": 1,
  "name": "John",
  "email": "john@example.com"
}
```

## 2. User Login Flow

1. User enters:

* Email
* Password

2. Frontend sends (form-data):

```
POST /users/login
```

Request Body (x-www-form-urlencoded):

```
username=john@example.com
password=123456
```

3. Backend:

* Verifies user exists
* Verifies password (hashed)
* Generates JWT token

4. Response:

```json
{
  "access_token": "JWT_TOKEN",
  "token_type": "bearer"
}
```

5. Frontend:

* Stores token in localStorage
* Updates auth state
* Redirects to dashboard


## 3. Authentication Mechanism

Every protected request includes:

```
Authorization: Bearer <token>
```

Backend flow:

* Extract token using OAuth2PasswordBearer
* Decode JWT
* Extract user email (`sub`)
* Fetch user from database
* Attach user to request

## 📝 4. Create Task Flow

1. User clicks "Create Task"
2. Fills:

* Title
* Description
* Status

3. Frontend sends:

```
POST /tasks
```

Headers:

```
Authorization: Bearer <token>
```

Request Body:

```json
{
  "title": "Task 1",
  "description": "Some description",
  "status": "Pending"
}
```

4. Backend:

* Validates user via token
* Creates task with `user_id`
* Saves to database

5. Response:

```json
{
  "id": 1,
  "title": "Task 1",
  "description": "Some description",
  "status": "Pending",
  "user_id": 1
}
```

## 5. Get Tasks Flow

1. Dashboard loads
2. Frontend sends:

```
GET /tasks
```

Headers:

```
Authorization: Bearer <token>
```

3. Backend:

* Identifies current user
* Returns only that user’s tasks

Response:

```json
[
  {
    "id": 1,
    "title": "Task 1",
    "description": "Some description",
    "status": "Pending"
  }
]
```
## 6. Update Task Flow

1. User edits a task
2. Frontend sends:

```
PUT /tasks/{id}
```

Headers:

```
Authorization: Bearer <token>
```

Request Body:

```json
{
  "title": "Updated Task",
  "description": "Updated description",
  "status": "Completed"
}
```

3. Backend:

* Verifies task belongs to user
* Updates task

## 7. Delete Task Flow

1. User clicks delete
2. Frontend sends:

```
DELETE /tasks/{id}
```

Headers:

```
Authorization: Bearer <token>
```

3. Backend:

* Verifies ownership
* Deletes task

Response:

```json
{
  "message": "Task deleted successfully"
}
```

## 8. Frontend State Flow

* Token stored in localStorage
* Auth state managed using Context API
* Tasks stored in component state
* UI updates after API calls

## 9. Session Persistence

* On page refresh:

  * Token is read from localStorage
  * User remains logged in


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

* Refresh Tokens
* Role-based access
* Pagination & Filtering
* Deployment (Docker + Cloud)

#  Conclusion

This project demonstrates a complete **full-stack authentication system with CRUD operations**, following industry best practices using FastAPI and React.

