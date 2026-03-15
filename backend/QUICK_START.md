# FleetFlow Backend - Quick Start Guide

This guide will help you get the backend running in under 5 minutes.

## Prerequisites
- Node.js v16+ installed
- MongoDB running locally
- Postman or Thunder Client for testing

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and ensure:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fleetflow
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
JWT_EXPIRATION=7d
FRONTEND_URL=http://localhost:3000
```

## Step 3: Start MongoDB

Open a new terminal window:

**Windows:**
```bash
mongod
```

**macOS/Linux:**
```bash
brew services start mongodb-community
# or
mongod
```

## Step 4: Start Backend Server

```bash
npm run dev
```

Expected output:
```
🚀 Server running on port 5000
✅ MongoDB connected successfully
```

## Step 5: Test the API

Open Postman and test the health endpoint:

```
GET http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-03-13T10:30:00.000Z"
}
```

---

## User Roles & Permissions

### 1. Fleet Manager
- Can create, update, delete vehicles
- Can create, update servers & manage maintenance
- Can view all analytics and reports
- Can deactivate users

### 2. Dispatcher
- Can create and manage trips
- Can log fuel expenses
- Can view vehicle availability
- Cannot create/delete vehicles

### 3. Safety Officer
- Can create and manage drivers
- Can track license expirations
- Can view driver compliance reports
- Can view driver performance analytics

### 4. Financial Analyst
- Can view expense summaries
- Can export financial reports
- Can view fleet analytics
- View-only access (cannot create/modify data)

---

## Authentication Flow

### Register a User

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Manager",
  "email": "manager@fleetflow.com",
  "password": "SecurePass123",
  "role": "fleet_manager",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Manager",
    "email": "manager@fleetflow.com",
    "role": "fleet_manager"
  }
}
```

### Login a User

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "manager@fleetflow.com",
  "password": "SecurePass123"
}
```

### Use Token in Requests

All subsequent requests must include the token in the Authorization header:

```
Authorization: Bearer eyJhbGc...
```

Example:
```
GET http://localhost:5000/api/vehicles
Authorization: Bearer eyJhbGc...
```

---

## Core Workflows

### Workflow 1: Create a Trip

1. **Get available vehicles:**
```
GET http://localhost:5000/api/vehicles?status=available
```

2. **Get available drivers:**
```
GET http://localhost:5000/api/drivers?status=on_duty
```

3. **Create trip:**
```
POST http://localhost:5000/api/trips
{
  "vehicleId": "vehicle_id_from_step1",
  "driverId": "driver_id_from_step2",
  "cargoWeight": 450,
  "originLocation": "Warehouse A",
  "destinationLocation": "Client B",
  "notes": "Fragile items"
}
```

**Validations:**
- ✅ cargoWeight (450 kg) < maxCapacityKg
- ✅ vehicleStatus === 'available'
- ✅ driverLicenseExpiry > today
- ✅ driverStatus !== 'suspended'

4. **Dispatch trip:**
```
PUT http://localhost:5000/api/trips/trip_id/dispatch
```

5. **Complete trip:**
```
PUT http://localhost:5000/api/trips/trip_id/complete
{
  "endOdometer": 50000
}
```

Auto-updates:
- Vehicle status: 'on_trip' → 'available'
- Driver status: 'on_duty' → 'available'
- Trip distance calculated automatically

---

### Workflow 2: Log Maintenance

1. **Create maintenance record:**
```
POST http://localhost:5000/api/maintenance
{
  "vehicleId": "vehicle_id",
  "serviceType": "oil_change",
  "description": "Regular oil change service",
  "cost": 200,
  "notes": "Vehicle now in shop"
}
```

Auto-update: Vehicle status automatically set to 'in_shop'

2. **Complete maintenance:**
```
PUT http://localhost:5000/api/maintenance/maintenance_id/complete
{
  "endDate": "2024-03-14T15:00:00Z"
}
```

Auto-update: Vehicle status automatically set back to 'available'

---

### Workflow 3: Log Fuel Expenses

1. **Create fuel expense:**
```
POST http://localhost:5000/api/expenses
{
  "vehicleId": "vehicle_id",
  "tripId": "trip_id",
  "liters": 50,
  "cost": 2500,
  "date": "2024-03-13",
  "location": "Shell Station"
}
```

2. **Get vehicle expense summary:**
```
GET http://localhost:5000/api/expenses/summary/vehicle?vehicleId=vehicle_id&month=2024-03
```

---

### Workflow 4: View Analytics

1. **Get dashboard metrics:**
```
GET http://localhost:5000/api/analytics/dashboard
```

Response:
```json
{
  "activeFleet": 5,
  "maintenanceAlerts": 2,
  "utilizationRate": 83.33,
  "pendingCargo": 3,
  "totalVehicles": 12
}
```

2. **Get vehicle analytics:**
```
GET http://localhost:5000/api/analytics/vehicles/vehicle_id
```

3. **Get fleet analytics:**
```
GET http://localhost:5000/api/analytics/fleet?month=2024-03
```

4. **Get driver performance:**
```
GET http://localhost:5000/api/analytics/drivers/performance
```

5. **Get expense trends:**
```
GET http://localhost:5000/api/analytics/trends/expenses?months=12
```

---

## Common API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Vehicles
- `GET /api/vehicles` - Get all vehicles (with filters)
- `POST /api/vehicles` - Create vehicle (Fleet Manager)
- `GET /api/vehicles/:id` - Get vehicle by ID
- `PUT /api/vehicles/:id` - Update vehicle (Fleet Manager)
- `PUT /api/vehicles/:id/retire` - Retire vehicle (Fleet Manager)
- `DELETE /api/vehicles/:id` - Delete vehicle (Fleet Manager)
- `GET /api/vehicles/stats` - Get vehicle statistics

### Drivers
- `GET /api/drivers` - Get all drivers (with filters)
- `POST /api/drivers` - Create driver (Fleet Manager, Safety Officer)
- `GET /api/drivers/:id` - Get driver by ID
- `PUT /api/drivers/:id` - Update driver (Fleet Manager, Safety Officer)
- `GET /api/drivers/:id/license-validity` - Check license validity
- `GET /api/drivers/expiring/list` - Get expiring licenses
- `DELETE /api/drivers/:id` - Delete driver (Fleet Manager)

### Trips
- `GET /api/trips` - Get all trips (with filters)
- `POST /api/trips` - Create trip (Dispatcher, Fleet Manager)
- `GET /api/trips/:id` - Get trip by ID
- `PUT /api/trips/:id/dispatch` - Dispatch trip (Dispatcher, Fleet Manager)
- `PUT /api/trips/:id/complete` - Complete trip (Dispatcher, Fleet Manager)
- `PUT /api/trips/:id/cancel` - Cancel trip (Dispatcher, Fleet Manager)
- `GET /api/trips/history` - Get trip history

### Maintenance
- `GET /api/maintenance` - Get maintenance logs
- `POST /api/maintenance` - Create maintenance log (Fleet Manager)
- `GET /api/maintenance/:id` - Get maintenance log by ID
- `PUT /api/maintenance/:id/complete` - Complete maintenance (Fleet Manager)
- `GET /api/maintenance/alerts` - Get maintenance alerts
- `GET /api/maintenance/history` - Get maintenance history

### Expenses
- `GET /api/expenses` - Get fuel expenses
- `POST /api/expenses` - Create fuel expense (Dispatcher, Fleet Manager)
- `GET /api/expenses/summary/vehicle` - Get vehicle expense summary
- `GET /api/expenses/summary/fleet` - Get fleet expense summary
- `PUT /api/expenses/:id` - Update expense (Dispatcher, Fleet Manager)
- `DELETE /api/expenses/:id` - Delete expense (Dispatcher, Fleet Manager)

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard metrics
- `GET /api/analytics/vehicles/:vehicleId` - Get vehicle analytics
- `GET /api/analytics/fleet` - Get fleet analytics
- `GET /api/analytics/drivers/performance` - Get driver performance
- `GET /api/analytics/trends/expenses` - Get expense trends

---

## Error Handling

All errors return a JSON response with error message:

```json
{
  "error": "Error description here"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Server Error

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| MongoDB connection error | Ensure `mongod` is running in another terminal |
| Token not working | Token may be expired; login again |
| 403 Forbidden error | User role doesn't have permission; check role requirements |
| Port 5000 already in use | Change PORT in .env or kill the process on port 5000 |
| Module not found error | Run `npm install` again |

---

## Next Steps

1. ✅ Set up .env with correct MongoDB URI
2. ✅ Start MongoDB: `mongod`
3. ✅ Start server: `npm run dev`
4. ✅ Test with Postman (use examples above)
5. → Create test data (vehicles, drivers, etc.)
6. → Build and test frontend integration
7. → Deploy to production

---

**Need help?** Check the detailed SETUP.md file for comprehensive documentation.
