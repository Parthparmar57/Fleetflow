# Role Access Matrix

This document outlines the specific access levels for each user role within the FleetFlow system. Access is categorized into **View** (Read-only) and **Edit** (Create, Update, Delete) permissions across different system modules.

| Module | Fleet Manager | Dispatcher | Safety Officer | Financial Analyst |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | Full View | Operational View | Safety View | Financial View |
| **Vehicles** | **Edit** | View | View | View |
| **Trips / Scheduling** | **Edit** | **Edit** | View | View |
| **Drivers / Compliance** | View | View | **Edit** | View |
| **Cargo / Loads** | View | **Edit** | View | View |
| **Maintenance Logs** | **Edit** | View | View | View |
| **Fuel & Expenses** | View | View | - | **Edit** |
| **ROI / Financial Analytics**| View | - | - | **Edit** |

---

## Detailed Responsibilities

### 🚛 Fleet Managers
*Primary Focus: Asset Lifecycle and Operational Health*
- **Edit**: Vehicle profiles, maintenance schedules, and high-level scheduling.
- **View**: Real-time fleet utilization and operational costs.

### 🗺️ Dispatchers
*Primary Focus: Daily Operations and Logistics*
- **Edit**: Trip creation, vehicle/driver assignment, and cargo validation.
- **View**: Driver availability and vehicle status.

### 🛡️ Safety Officers
*Primary Focus: Compliance and Risk Management*
- **Edit**: Driver safety scores, license validation, and compliance records.
- **View**: Vehicle health reports and expiring document alerts.

### 💰 Financial Analysts
*Primary Focus: Fiscal Audit and Efficiency*
- **Edit**: Expense auditing, fuel tax logs, and fleet budget metrics.
- **View**: Maintenance ROI, operational cost trends, and fuel efficiency reports.
