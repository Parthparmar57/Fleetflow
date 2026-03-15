# 🚛 FleetFlow - Advanced MERN Fleet Management System

FleetFlow is a state-of-the-art, full-stack fleet management platform designed for modern logistics operations. Built with the **MERN** stack (MongoDB, Express, React, Node.js), it offers a premium user experience with high-performance tracking, advanced analytics, and professional-grade security.

---

## ✨ Key Features

### 📡 Real-time Tracking & Logistics
*   **Live Trip Tracking**: Real-time vehicle positioning using Socket.io integration.
*   **Dynamic Interactive Maps**: Built with Leaflet for high-fidelity geographic visualization.
*   **Intelligent Dispatching**: Automated workflows for creating, dispatching, and completing trips.

### 📊 Professional Analytics Dashboard
*   **Performance Metrics**: Visualized fleet health via Bar charts and Pie charts (Recharts).
*   **Success Analytics**: Automated calculation of trip completion rates and driver efficiency.
*   **Financial Insights**: Integrated tracking for fuel expenses and operational costs.

### 👥 Personnel & Asset Management
*   **Vehicle Enrollment**: Comprehensive management of fleet units with status tracking and mileage history.
*   **Driver Professionalism**: Safety scoring, license validity monitoring, and automated alerts for expiration.
*   **Maintenance Scheduling**: Systematic logging of service history and proactive maintenance alerts.

### 🔒 Enterprise-Grade Security
*   **Role-Based Access (RBAC)**: Specialized interfaces for managers, dispatchers, safety officers, and analysts.
*   **Credential Vault**: Secure JWT-based authentication and Bcryptjs password encryption.
*   **Profile Workspace**: User-specific settings including notification preferences, light/dark themes, and data exports.

---

## 📂 Project Architecture

```text
MERN fleetflow/
├── backend/                # Professional Node.js/Express Server
│   ├── config/             # DB and Environment configuration
│   ├── controllers/        # Pure business logic layer
│   ├── middleware/         # Auth, Role-checking, and Production Hardening
│   ├── models/             # Mongoose schemas with validation
│   ├── routes/             # RESTful API definition
│   └── server.js           # Server entry with Socket.io & Production Middleware
├── frontend/               # Modern React Application (Vite + TS)
│   ├── src/
│   │   ├── components/     # UI Design System (Tailwind v4)
│   │   ├── context/        # Auth & Application State Management
│   │   ├── pages/          # Feature Pages (Dashboards, Tracking, etc.)
│   │   ├── services/       # Centralized API layer (Axios + Sockets)
│   │   └── types/          # TypeScript interface definitions
│   └── vercel.json         # SPA routing for production
└── docs/                   # Detailed documentation and integration guides
```

---

## 🚀 Quick Start

### 1. Prerequisites
*   Node.js (v18+)
*   MongoDB Instance (Local or Atlas)
*   A cup of coffee ☕

### 2. Backend Setup
```bash
cd backend
npm install
# Configure your .env (see Environment Variables)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Environment Variables

### 🔌 Backend (.env)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Server Port | `5000` |
| `MONGODB_URI` | Connection String | - |
| `JWT_SECRET` | Authentication Key | - |
| `FRONTEND_URL` | For CORS Policy | `http://localhost:5173` |

### ⚡ Frontend (.env)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend API Root | `http://localhost:5000/api` |
| `VITE_SOCKET_URL`| Socket.io Root | `http://localhost:5000` |

---

## 🏛️ Technology Stack

*   **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Recharts, Lucide Icons.
*   **Backend**: Node.js, Express, Socket.io, Morgan, Helmet (Hardening), Mongoose.
*   **Database**: MongoDB.
*   **Deployment**: Vercel (Front) & Render (Back).

---

## 📖 Extended Documentation

For deeper dives into specific architecture components, refer to our [Documentation Index](docs/INDEX.md):
*   [Authentication Guide](docs/AUTHENTICATION_TESTING_GUIDE.md)
*   [API Integration Reference](docs/FRONTEND_API_INTEGRATION_COMPLETE.md)
*   [Role Access Matrix](docs/role_access_matrix.md)
*   [System Architecture](docs/SYSTEM_ARCHITECTURE.md)

---

## 📝 License
Distributed under the **ISC License**. See `LICENSE` for more information.

Developed with ❤️ at FleetFlow HQ
