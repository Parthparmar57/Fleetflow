# FleetFlow Backend Setup Guide

Complete end-to-end setup documentation for the FleetFlow backend server.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Authentication & Authorization](#authentication--authorization)
8. [Running the Server](#running-the-server)
9. [Development Workflow](#development-workflow)

---

## Project Overview

**FleetFlow** is a modular fleet and logistics management system designed to replace manual logbooks with a centralized, rule-based digital hub.

### Key Responsibilities of Backend:
- Real-time vehicle and driver availability management
- Trip lifecycle management (Draft → Dispatched → Completed → Cancelled)
- Maintenance and service tracking with automatic status updates
- Fuel and expense logging with automated calculations
- Driver compliance and safety score tracking
- Role-Based Access Control (RBAC) for different user types
- Analytics and financial reporting

---

## Prerequisites

Ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Postman** or **Thunder Client** (for API testing) - Optional
- **Git** - [Download](https://git-scm.com/)

Verify installations:
```bash
node --version
npm --version
mongod --version
```

---

## Installation

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages:
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation
- **nodemon** - Auto-restart during development

### Step 3: Verify Installation
```bash
npm list
```

---

## Configuration

### Step 1: Create Environment File
Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

### Step 2: Configure Environment Variables
Edit `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/fleetflow

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRATION=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Email (Optional - for password reset)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Step 3: Ensure MongoDB is Running
Open a terminal and start MongoDB:

**On Windows:**
```bash
mongod
```

**On macOS/Linux:**
```bash
brew services start mongodb-community
# or
mongod
```

Verify MongoDB connection:
```bash
mongo mongodb://localhost:27017/fleetflow
```

---

## Database Schema

### Collections Overview

#### 1. Users Collection
Stores user accounts with role-based access.

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst']),
  phone: String,
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. Vehicles Collection
Fleet asset registry with capacity and status tracking.

```javascript
{
  _id: ObjectId,
  name: String (e.g., "Van-05"),
  licenseplate: String (unique),
  vehicleType: String (enum: ['truck', 'van', 'bike']),
  model: String,
  maxCapacityKg: Number,
  odometer: Number (current readings),
  status: String (enum: ['available', 'on_trip', 'in_shop', 'retired']),
  acquisitionCost: Number,
  maintenanceHistory: [ObjectId], // Reference to MaintenanceLog
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. Drivers Collection
Driver profiles with compliance tracking.

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  licenseNumber: String (unique),
  licenseExpiry: Date,
  licenseCategory: String (enum: ['truck', 'van', 'bike']),
  safetyScore: Number (0-100),
  status: String (enum: ['on_duty', 'off_duty', 'suspended']),
  tripCount: Number,
  completedTrips: Number,
  phone: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. Trips Collection
Delivery workflows and assignments.

```javascript
{
  _id: ObjectId,
  tripId: String (unique),
  vehicleId: ObjectId, // Reference to Vehicles
  driverId: ObjectId, // Reference to Drivers
  cargoWeight: Number (kg),
  originLocation: String,
  destinationLocation: String,
  status: String (enum: ['draft', 'dispatched', 'completed', 'cancelled']),
  notes: String,
  assignedAt: Date,
  dispatchedAt: Date,
  completedAt: Date,
  startOdometer: Number,
  endOdometer: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. MaintenanceLogs Collection
Service records and preventative maintenance.

```javascript
{
  _id: ObjectId,
  vehicleId: ObjectId, // Reference to Vehicles
  serviceType: String (enum: ['oil_change', 'repair', 'inspection', 'tire_replacement']),
  description: String,
  cost: Number,
  status: String (enum: ['in_progress', 'completed']),
  startDate: Date,
  endDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 6. FuelExpenses Collection
Fuel logging and cost tracking.

```javascript
{
  _id: ObjectId,
  vehicleId: ObjectId, // Reference to Vehicles
  tripId: ObjectId, // Optional: Reference to Trips
  liters: Number,
  cost: Number,
  priceLiterPerLiter: Number,
  date: Date,
  location: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 7. Analytics Collection (Optional)
Cached metrics for reporting.

```javascript
{
  _id: ObjectId,
  vehicleId: ObjectId,
  month: Date,
  totalFuelCost: Number,
  totalMaintenanceCost: Number,
  totalOperationalCost: Number,
  fuelEfficiency: Number (km/L),
  vehicleROI: Number,
  createdAt: Date
}
```

---

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password",
  "role": "fleet_manager"
}

Response: { token, user }
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}

Response: { token, user }
```

### Vehicle Management Endpoints

#### Get All Vehicles
```
GET /vehicles
Headers: Authorization: Bearer <token>

Query Parameters:
  - status: available|on_trip|in_shop|retired
  - type: truck|van|bike
```

#### Get Vehicle by ID
```
GET /vehicles/:id
Headers: Authorization: Bearer <token>
```

#### Create Vehicle
```
POST /vehicles
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Van-05",
  "licenseplate": "XYZ123",
  "vehicleType": "van",
  "model": "Ford Transit",
  "maxCapacityKg": 500,
  "acquisitionCost": 25000
}
```

#### Update Vehicle
```
PUT /vehicles/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_shop",
  "odometer": 45000
}
```

#### Delete Vehicle
```
DELETE /vehicles/:id
Headers: Authorization: Bearer <token>
```

### Driver Management Endpoints

#### Get All Drivers
```
GET /drivers
Headers: Authorization: Bearer <token>

Query Parameters:
  - status: on_duty|off_duty|suspended
  - licenseCategory: truck|van|bike
```

#### Create Driver
```
POST /drivers
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Alex Smith",
  "email": "alex@example.com",
  "licenseNumber": "DL123456",
  "licenseExpiry": "2026-12-31",
  "licenseCategory": "van",
  "phone": "+1234567890"
}
```

#### Update Driver Status
```
PUT /drivers/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "on_duty",
  "safetyScore": 95
}
```

### Trip Management Endpoints

#### Create Trip
```
POST /trips
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": "vehicle_id_here",
  "driverId": "driver_id_here",
  "cargoWeight": 450,
  "originLocation": "Warehouse A",
  "destinationLocation": "Client B",
  "notes": "Fragile items"
}

Validation:
  - cargoWeight <= vehicle.maxCapacityKg
  - driver.licenseExpiry > today
  - vehicle.status === 'available'
```

#### Dispatch Trip
```
PUT /trips/:id/dispatch
Headers: Authorization: Bearer <token>

Updates: status to 'dispatched', startOdometer, dispatchedAt
```

#### Complete Trip
```
PUT /trips/:id/complete
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "endOdometer": 50000
}

Auto-updates: vehicle/driver status to 'available', trip status to 'completed'
```

#### Get Trip History
```
GET /trips
Headers: Authorization: Bearer <token>

Query Parameters:
  - status: draft|dispatched|completed|cancelled
  - vehicleId: filter by vehicle
  - driverId: filter by driver
```

### Maintenance Endpoints

#### Log Maintenance
```
POST /maintenance
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": "vehicle_id_here",
  "serviceType": "oil_change",
  "description": "Regular oil change service",
  "cost": 200,
  "notes": "Vehicle now in shop"
}

Auto-logic: Sets vehicle.status to 'in_shop'
```

#### Complete Maintenance
```
PUT /maintenance/:id/complete
Headers: Authorization: Bearer <token>

Auto-logic: Sets vehicle.status back to 'available'
```

#### Get Maintenance History
```
GET /maintenance?vehicleId=:id
Headers: Authorization: Bearer <token>
```

### Fuel & Expense Endpoints

#### Log Fuel Expense
```
POST /expenses/fuel
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": "vehicle_id_here",
  "tripId": "optional_trip_id",
  "liters": 50,
  "cost": 2500,
  "date": "2024-03-13",
  "location": "Shell Station"
}
```

#### Get Vehicle Expenses
```
GET /expenses?vehicleId=:id&type=fuel|maintenance
Headers: Authorization: Bearer <token>
```

### Analytics Endpoints

#### Get Vehicle Analytics
```
GET /analytics/vehicles/:id
Headers: Authorization: Bearer <token>

Query Parameters:
  - month: YYYY-MM format

Response:
{
  "fuelEfficiency": 8.5,
  "totalOperationalCost": 15000,
  "vehicleROI": 0.42,
  "maintenanceAlerts": [...],
  "tripsPastMonth": 25
}
```

#### Fleet Dashboard Metrics
```
GET /analytics/dashboard
Headers: Authorization: Bearer <token>

Response:
{
  "activeFleet": 12,
  "maintenanceAlerts": 3,
  "utilizationRate": 85,
  "pendingCargo": 5
}
```

#### Export Reports
```
GET /reports/export?format=csv&month=2024-03&type=financial
Headers: Authorization: Bearer <token>

Response: CSV/PDF file download
```

---

## Authentication & Authorization

### JWT Token Flow

1. **User Login**: Receives JWT token valid for 7 days
2. **Token Storage**: Frontend stores token in localStorage
3. **API Requests**: Include token in Authorization header
   ```
   Authorization: Bearer <token>
   ```
4. **Token Verification**: Backend validates signature and expiration
5. **Role-Based Access**: Middleware checks user.role for endpoint access

### Role Hierarchy (RBAC)

```javascript
// Fleet Manager (Highest)
- Full system access
- Create/manage vehicles
- Approve maintenance
- View all analytics

// Dispatcher
- Create/manage trips
- Assign drivers
- View vehicle availability
- Cannot delete vehicles

// Safety Officer
- View driver profiles
- Track compliance
- Generate safety reports
- Cannot manage trips

// Financial Analyst (Lowest)
- View-only access to expenses
- Generate financial reports
- Cannot create trips or maintenance
```

### Middleware Structure

```
Request → Authentication Middleware (validateToken)
        → Authorization Middleware (checkRole)
        → Route Handler
        → Error Handling Middleware
        → Response
```

---

## Running the Server

### Development Mode (with Auto-Restart)
```bash
npm run dev
```

Monitor output:
```
Server running on port 5000
MongoDB connected successfully
```

### Production Mode
```bash
npm start
```

### Verify Server is Running
Open in browser or Postman:
```
GET http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-03-13T10:30:00Z"
}
```

---

## Development Workflow

### Directory Structure
```
backend/
├── models/
│   ├── User.js
│   ├── Vehicle.js
│   ├── Driver.js
│   ├── Trip.js
│   ├── MaintenanceLog.js
│   └── FuelExpense.js
├── routes/
│   ├── auth.js
│   ├── vehicles.js
│   ├── drivers.js
│   ├── trips.js
│   ├── maintenance.js
│   ├── expenses.js
│   └── analytics.js
├── controllers/
│   ├── authController.js
│   ├── vehicleController.js
│   ├── driverController.js
│   ├── tripController.js
│   ├── maintenanceController.js
│   ├── expenseController.js
│   └── analyticsController.js
├── middleware/
│   └── auth.js
├── config/
│   └── database.js
├── server.js
├── package.json
└── .env
```

### Development Best Practices

1. **Use ES6 Modules**: All files use `import`/`export`
2. **Environment Variables**: Never hardcode credentials
3. **Error Handling**: Always include try-catch blocks
4. **Validation**: Validate inputs before database operations
5. **Logging**: Log important actions for debugging
6. **Comments**: Document complex business logic

### Testing API Endpoints

Use Postman collection or Thunder Client:

1. Import collection file (if provided)
2. Set environment variables (token, baseUrl)
3. Test endpoints in order:
   - Auth (Register/Login)
   - Vehicles (Create, Read, Update)
   - Drivers (Create, Read, Update)
   - Trips (Create, Dispatch, Complete)
   - Maintenance & Expenses
   - Analytics

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Ensure mongod is running: `mongod` |
| Port 5000 already in use | Change PORT in .env or kill process on port 5000 |
| Module not found | Run `npm install` again |
| JWT token invalid | Token may be expired; login again |
| CORS errors | Check FRONTEND_URL in .env |

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure `.env` file
3. ✅ Start MongoDB: `mongod`
4. ✅ Run dev server: `npm run dev`
5. ✅ Test endpoints with Postman
6. → Proceed to [Frontend Setup](../frontend/SETUP.md)

---

## Support & Documentation

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT Reference](https://jwt.io/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)

---

**Last Updated**: March 13, 2024
**Backend Version**: 1.0.0
