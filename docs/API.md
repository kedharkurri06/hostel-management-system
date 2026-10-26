# HostelHub REST API Documentation

Centralized RESTful API documentation for the Hostel Hub Management System (MERN Stack).

**Base URL**: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### Register Student
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Access**: Public (Creates Student role accounts)
- **Request Body**:
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@hostelhub.edu",
  "password": "Password123!"
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "66a87b8...",
      "name": "Rahul Sharma",
      "email": "rahul@hostelhub.edu",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
}
```

### User Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "warden@hostelhub.edu",
  "password": "WardenPass123!"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "66a87b8...",
      "name": "Head Warden Admin",
      "email": "warden@hostelhub.edu",
      "role": "warden"
    },
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
}
```

### Current User Profile
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Access**: Private (Bearer Token)
- **Header**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "66a87b8...",
      "name": "Head Warden Admin",
      "email": "warden@hostelhub.edu",
      "role": "warden"
    }
  }
}
```

---

## 2. Complaint Management Endpoints

### List Complaints
- **Method**: `GET`
- **Path**: `/api/complaints`
- **Query Parameters**:
  - `status`: `All`, `Pending`, `In Progress`, `Resolved`
  - `priority`: `Low`, `Medium`, `High`, `Emergency`
  - `category`: `AC`, `Water`, `Electrical`, `Wi-Fi`, `Cleanliness`, `Furniture`, `Pest Control`
  - `search`: Keyword string (matches ticketId, roomNo, studentName, block, description)
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
- **Access**: Public / Authenticated

### Get Single Complaint
- **Method**: `GET`
- **Path**: `/api/complaints/:id`
- **Access**: Public / Authenticated

### Submit Complaint
- **Method**: `POST`
- **Path**: `/api/complaints`
- **Access**: Public / Authenticated
- **Request Body**:
```json
{
  "studentName": "Ananya Roy",
  "phone": "+91 98123 45678",
  "roomNo": "112",
  "block": "Block B (Girls)",
  "category": "Water",
  "priority": "Emergency",
  "visitTimeSlot": "Immediate / Emergency",
  "description": "Bathroom pipe leakage causing water overflow into main room floor."
}
```
- **Success Response (201 Created)**: Returns created complaint object with unique generated `ticketId`.

### Update Complaint Status & Staff Assignment
- **Method**: `PATCH`
- **Path**: `/api/complaints/:id`
- **Access**: Private (Role: `warden`)
- **Header**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "status": "In Progress",
  "assignedTo": "Ramesh Kumar (HVAC Tech)",
  "resolutionNotes": "Technician dispatched for pressure check."
}
```

### Delete Complaint
- **Method**: `DELETE`
- **Path**: `/api/complaints/:id`
- **Access**: Private (Role: `warden`)

---

## 3. Weekly Food Menu Endpoints

### Get Full Week Menu
- **Method**: `GET`
- **Path**: `/api/menu`
- **Access**: Public
- **Response**: Object keyed by day of week (`Monday` to `Sunday`), each containing `breakfast`, `lunch`, `snacks`, and `dinner`.

### Update Meal Slot
- **Method**: `PATCH`
- **Path**: `/api/menu/:id`
- **Access**: Private (Role: `warden`)
- **Header**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "meal": "lunch",
  "time": "12:30 PM - 2:30 PM",
  "type": "Special Veg Lunch",
  "items": ["Paneer Butter Masala", "Dal Tadka", "Jeera Rice", "Chapati", "Gulab Jamun"]
}
```

---

## 4. Wardens & Staff Directory

### Get Wardens and Technicians
- **Method**: `GET`
- **Path**: `/api/wardens`
- **Access**: Public
- **Response**:
```json
{
  "success": true,
  "data": {
    "wardens": [ ... ],
    "staff": [ ... ]
  }
}
```

---

## 5. Notice Board Circulars

### List Notices
- **Method**: `GET`
- **Path**: `/api/notices`
- **Access**: Public

### Create Notice
- **Method**: `POST`
- **Path**: `/api/notices`
- **Access**: Private (Role: `warden`)
- **Request Body**:
```json
{
  "title": "Scheduled Water Tank Cleaning & Pipe Maintenance",
  "category": "Maintenance",
  "priority": "High",
  "content": "Water supply to Block A and Block B will be suspended from 10:00 AM to 2:00 PM."
}
```

### Update Notice
- **Method**: `PATCH`
- **Path**: `/api/notices/:id`
- **Access**: Private (Role: `warden`)

### Delete Notice
- **Method**: `DELETE`
- **Path**: `/api/notices/:id`
- **Access**: Private (Role: `warden`)

---

## 6. Dashboard Statistics

### Get Metrics & Analytics
- **Method**: `GET`
- **Path**: `/api/dashboard/stats`
- **Access**: Public / Authenticated
- **Response**:
```json
{
  "success": true,
  "data": {
    "total": 5,
    "pending": 2,
    "inProgress": 1,
    "resolved": 2,
    "emergency": 1,
    "resolutionRate": 40,
    "categoryBreakdown": [ ... ],
    "activeQueue": [ ... ]
  }
}
```

---

## 7. Health Check

- **Method**: `GET`
- **Path**: `/api/health`
- **Access**: Public
- **Response**: `{ "status": "ok", "timestamp": "...", "uptime": 12.34 }`
