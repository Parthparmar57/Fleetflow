# FleetFlow Project Overview

FleetFlow is a state-of-the-art fleet management system designed to streamline logistics and operational tracking for fleeting organizations.

## Modern Tech Stack
- **Frontend**: React 19 with **Vite**, **TypeScript**, and **Tailwind CSS** for a responsive and performant user interface. Use of `motion` (Framer Motion) for smooth animations and `recharts` for data visualization.
- **Backend**: **Node.js** and **Express.js** (ES Modules) providing a robust RESTful API.
- **Database**: **MongoDB** with **Mongoose** for flexible and scalable data modeling.
- **Security**: **JWT** (JSON Web Tokens) for secure authentication and **bcryptjs** for password hashing.
- **AI Integration**: Integration with `@google/genai` suggests potential AI-driven insights or automation features.

## Core Data Models
| Model | Description |
| :--- | :--- |
| **Vehicle** | Tracks fleet assets, registration details, and status. |
| **Driver** | Manages personnel information and assignments. |
| **Trip** | Logs routes, mileage, and completion status for logistics tracking. |
| **FuelExpense** | Monitors fuel consumption and associated costs. |
| **MaintenanceLog** | Schedules and records vehicle repairs and service history. |
| **User** | Handles administrative accounts and permissions. |

## Key Functionalities
1. **Dynamic Dashboard**: Real-time analytics and KPIs for fleet performance.
2. **Unified Management**: Centralized CRUD operations for vehicles, drivers, and logistics records.
3. **Expense Tracking**: Granular tracking of fuel and maintenance costs to optimize budget.
4. **Logistics Logging**: Systematic recording of trips to ensure operational accountability.
5. **Secure Access**: Role-based access control and encrypted user data.
