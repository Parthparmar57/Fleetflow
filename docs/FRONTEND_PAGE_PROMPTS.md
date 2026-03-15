# 🎨 FleetFlow Frontend - React + Tailwind CSS Page Prompts

Complete, copy-paste-ready prompts for generating each page of your FleetFlow frontend. Use these with Claude, ChatGPT, or any AI code generator.

---

## 📋 Prerequisites Setup Prompt

**Use this FIRST before building any pages:**

```
I'm building a React + Tailwind CSS frontend for a fleet management system.

Backend is ready at: http://localhost:5000/api

Create the following setup files:

1. src/services/api.js - Axios instance with JWT token management
   - Base URL: http://localhost:5000/api
   - Auto-add Authorization header with token from localStorage
   - Handle 401 errors (redirect to login)
   - Add response interceptor for error handling

2. src/context/AuthContext.js - Authentication state management
   - State: user, token, isAuthenticated, loading, error
   - Methods: login(email, password), register(name, email, password, role), logout()
   - Auto-check localStorage for existing token on mount
   - Auto-redirect to login if token expires

3. src/App.jsx - Main app with React Router
   - Routes: /login, /dashboard, /vehicles, /trips, /drivers, /maintenance, /expenses, /analytics, /driver-profiles
   - ProtectedRoute component that checks isAuthenticated
   - Redirect unauthenticated users to /login
   - Redirect authenticated users away from /login to /dashboard

4. src/components/Navbar.jsx - Top navigation bar
   - Show user name and role (from AuthContext)
   - Logout button that calls logout() from AuthContext
   - Tailwind styling: bg-blue-600 text-white, flex justify-between

5. src/components/Sidebar.jsx - Left navigation menu
   - Show nav links based on user role
   - Fleet Manager: Vehicles, Drivers, Trips, Maintenance, Expenses, Analytics
   - Dispatcher: Trips, Expenses, Dashboard
   - Safety Officer: Drivers, Dashboard
   - Financial Analyst: Analytics, Dashboard
   - Active link styling with bg-blue-700
   - Active route highlighting

Use ES6 modules (import/export) and functional components with React hooks.
Tailwind CSS for all styling.
```

---

## 🔐 PAGE 1: LOGIN PAGE

**Prompt:**

```
Create a login page for FleetFlow fleet management system using React + Tailwind CSS.

Requirements:
- Two forms: Login and Register (tabs or toggle)
- Login form fields:
  * Email input (type="email", required)
  * Password input (type="password", required)
  * Role selection dropdown (fleet_manager, dispatcher, safety_officer, financial_analyst)
  * "Remember me" checkbox (optional)
  * "Forgot Password?" link (no functionality needed yet)
  * Login button that calls login(email, password) from AuthContext

- Register form fields:
  * Name input (required)
  * Email input (type="email", required)
  * Password input (type="password", min 6 chars, required)
  * Role selection dropdown (default: dispatcher)
  * Phone input (optional)
  * Register button that calls register(name, email, password, role)

- Form validation:
  * Email format validation
  * Password length validation
  * Show error messages in red below each field
  * Disable button during submission (loading state)

- After successful login/register:
  * Store token in localStorage (AuthContext handles this)
  * Store user data in context
  * Redirect to /dashboard
  * Show success toast message

- Error handling:
  * Display error message from API (e.g., "Invalid credentials", "Email already exists")
  * Show in red alert box below form
  * Allow user to retry

- Styling (Tailwind CSS):
  * Centered card layout (max-width: 400px)
  * bg-white with rounded borders and shadow
  * Blue primary color (#3B82F6) for buttons
  * Input fields with border and focus states
  * Logo and title at top
  * Responsive on mobile (full width with padding)

- Components used:
  * Import useContext from React to access AuthContext
  * Import useNavigate from react-router-dom for redirect
  * Show loading spinner while submitting

State management:
- email, password, name, phone states
- loading state (disable button, show spinner)
- error state (show error message)
- formType state (login/register)
```

---

## 📊 PAGE 2: DASHBOARD (Command Center)

**Prompt:**

```
Create a dashboard page for FleetFlow showing KPIs and fleet overview using React + Tailwind CSS.

GET /api/analytics/dashboard endpoint returns:
{
  activeFleet: number,
  maintenanceAlerts: number,
  utilizationRate: number (0-100),
  pendingCargo: number,
  totalVehicles: number
}

Requirements:
- Page title: "Command Center"
- Display 4 KPI cards in a 2x2 grid (responsive: 1 column on mobile, 2 on tablet, 4 on desktop):

  Card 1: Active Fleet
  - Large number (activeFleet)
  - Icon: truck/vehicle icon
  - Text: "Vehicles On Trip"
  - Color: blue-500
  - Show trend arrow (up/down)

  Card 2: Maintenance Alerts
  - Large number (maintenanceAlerts)
  - Icon: wrench icon
  - Text: "In Shop"
  - Color: orange-500
  - Show as warning if > 0

  Card 3: Utilization Rate
  - Percentage (utilizationRate)
  - Icon: percentage icon
  - Text: "Fleet Utilization"
  - Color: green-500
  - Show progress bar filled to percentage

  Card 4: Pending Cargo
  - Large number (pendingCargo)
  - Icon: package icon
  - Text: "Awaiting Assignment"
  - Color: purple-500

- Quick action buttons below KPIs:
  * "Create Trip" → navigate to /trips
  * "Add Vehicle" → open modal (for Fleet Manager role only)
  * "Log Fuel" → navigate to /expenses
  * "View Analytics" → navigate to /analytics

- Filter section (optional):
  * Filter by Vehicle Type: Truck, Van, Bike
  * Filter by Status: Available, On Trip, In Shop, Retired
  * Filter button applies filters and refetches data

- Charts (optional but recommended):
  * Bar chart: Vehicle status distribution
  * Line chart: Fuel cost trend (last 7 days)

- Loading state:
  * Show skeleton cards while loading
  * Spinner while fetching data

- Error handling:
  * Show error message if API fails
  * Retry button

- Styling (Tailwind CSS):
  * Card: bg-white, rounded-lg, shadow, p-6
  * KPI number: text-3xl font-bold
  * Icons: 24x24 size, colored
  * Buttons: blue bg with white text, hover effects
  * Responsive grid layout

Data fetching:
- Use useEffect to call GET /api/analytics/dashboard on mount
- Store response in state
- Refetch when filters change (if filters added)
```

---

## 🚗 PAGE 3: VEHICLE REGISTRY (Asset Management)

**Prompt:**

```
Create a vehicle registry page for FleetFlow using React + Tailwind CSS with full CRUD operations.

APIs needed:
- GET /api/vehicles?status=&type= (list vehicles with optional filters)
- GET /api/vehicles/:id (get single vehicle details)
- POST /api/vehicles (create vehicle - Fleet Manager only)
- PUT /api/vehicles/:id (update vehicle)
- PUT /api/vehicles/:id/retire (retire vehicle - Fleet Manager only)
- DELETE /api/vehicles/:id (delete vehicle - Fleet Manager only)
- GET /api/vehicles/stats (vehicle statistics)

Requirements:
- Page title: "Vehicle Registry"
- Statistics bar (top):
  * Total Vehicles: {count}
  * Available: {count} (green)
  * On Trip: {count} (blue)
  * In Shop: {count} (orange)
  * Retired: {count} (gray)

- Controls bar:
  * Search/Filter by name or license plate (text input)
  * Filter by Status dropdown: All, Available, On Trip, In Shop, Retired
  * Filter by Type dropdown: All, Truck, Van, Bike
  * "Create Vehicle" button (Fleet Manager only, opens modal)

- Data table (responsive - collapse to cards on mobile):
  Columns:
  * Name
  * License Plate (bold)
  * Type
  * Model
  * Max Capacity (kg)
  * Current Status (colored pill badge)
  * Odometer (km)
  * Actions (Edit, Delete buttons)

  Table features:
  * Sortable columns (click header to sort)
  * Pagination (10 rows per page)
  * Hover row highlight
  * Show "No records found" message if empty

- Create/Edit Vehicle Modal:
  Form fields:
  * Name (text input, required)
  * License Plate (text input, uppercase, required)
  * Vehicle Type (dropdown: truck, van, bike, required)
  * Model (text input, required)
  * Max Capacity in Kg (number input, required)
  * Acquisition Cost (number input, required)
  * Notes (textarea, optional)

  Modal features:
  * Cancel and Save buttons
  * Form validation (show errors below fields)
  * Submit button disabled while loading
  * Success message after save
  * Pre-fill form when editing (GET /api/vehicles/:id first)

- Vehicle Details View (click row to view):
  * Full vehicle information
  * Maintenance history (if available)
  * Trip history (completed trips)
  * Show "Retire Vehicle" button
  * Show "Delete Vehicle" button (with confirmation)

- Retire Vehicle Flow:
  * Confirmation modal: "Are you sure you want to retire this vehicle?"
  * Sets status to 'retired'
  * Vehicle disappears from dispatcher's selection pool
  * Show success message

- Delete Vehicle Flow:
  * Confirmation: "Permanently delete vehicle? This cannot be undone."
  * Call DELETE /api/vehicles/:id
  * Remove from table
  * Show success message

- Status pills (colored badges):
  * available: green-500
  * on_trip: blue-500
  * in_shop: orange-500
  * retired: gray-500

- Styling (Tailwind CSS):
  * Page bg: gray-50
  * Card: white with shadow
  * Table: striped rows, hover highlight
  * Buttons: blue primary, red delete
  * Pills: rounded-full, px-3 py-1

State management:
- vehicles array
- selectedVehicle for detail view
- isModalOpen for create/edit modal
- filters object (status, type, search)
- currentPage for pagination
- loading, error states
```

---

## 🛣️ PAGE 4: TRIP DISPATCHER (Create & Manage Trips)

**Prompt:**

```
Create a trip dispatcher page for FleetFlow using React + Tailwind CSS with validation logic.

APIs needed:
- GET /api/vehicles?status=available (get available vehicles)
- GET /api/drivers?status=on_duty (get available drivers)
- GET /api/trips?status= (list trips with filters)
- POST /api/trips (create trip with validation)
- GET /api/trips/:id (get trip details)
- PUT /api/trips/:id/dispatch (dispatch trip)
- PUT /api/trips/:id/complete (complete trip)
- PUT /api/trips/:id/cancel (cancel trip)

Requirements:
- Page title: "Trip Dispatcher"
- Two sections: Create Trip & Trip Management

SECTION 1: CREATE TRIP (Top)
Panel title: "Create New Trip"
Form fields:
  * Vehicle Selection (dropdown)
    - Load from GET /api/vehicles?status=available
    - Show: Name, License Plate, Max Capacity (kg)
    - Display: "Van-05 (ABC123) - 500kg capacity"

  * Driver Selection (dropdown)
    - Load from GET /api/drivers?status=on_duty
    - Show: Name, License Number, License Expiry
    - Disable if license expired
    - Display: "Alex Smith (DL123) - Valid until 2026-12-31"

  * Cargo Weight (number input, kg, required)
    - Real-time validation with selected vehicle's max capacity
    - Show error if weight > capacity: "Cargo exceeds vehicle capacity (max: 500kg)"
    - Show warning if weight > 80% of capacity

  * Origin Location (text input, required)
    - Autocomplete suggestions (optional)

  * Destination Location (text input, required)
    - Autocomplete suggestions (optional)

  * Notes (textarea, optional)
    - For special handling instructions

Form validation:
  * All required fields filled
  * Cargo weight < vehicle max capacity
  * Driver license not expired
  * Driver status = on_duty
  * Vehicle status = available
  * Show validation errors below fields in red

Buttons:
  * "Create Trip" (disabled while loading or if validation fails)
  * "Clear Form" (reset all fields)

On success:
  * Show success toast: "Trip created successfully"
  * Clear form
  * Refresh trip list
  * New trip appears as "Draft" status

On error:
  * Show error message in red alert box
  * Allow user to correct and retry

SECTION 2: TRIP MANAGEMENT (Bottom)
Panel title: "Active Trips"

Controls:
  * Filter by Status: All, Draft, Dispatched, Completed, Cancelled
  * Filter by Vehicle (dropdown)
  * Filter by Driver (dropdown)
  * Refresh button

Trip Pipeline View (Kanban-style boards):
  Column 1: Draft Trips
  Column 2: Dispatched Trips
  Column 3: Completed Trips

Each trip card shows:
  * Trip ID (e.g., TRIP-1234567-1)
  * Vehicle: Name + License Plate
  * Driver: Name
  * Cargo Weight (kg)
  * Route: Origin → Destination
  * Status badge (colored)
  * Created date

Actions based on status:
  DRAFT trips:
    * "Dispatch" button → PUT /api/trips/:id/dispatch
      - Will auto-update vehicle status to on_trip
      - Will auto-update driver status to on_duty
      - Show success message
    * "Cancel" button → PUT /api/trips/:id/cancel
      - Confirmation modal
      - Show success message

  DISPATCHED trips:
    * "Complete Trip" button → opens modal
      - Modal title: "Complete Trip"
      - Field: End Odometer (number input, required)
      - Show start odometer for reference
      - "Save" button calls PUT /api/trips/:id/complete
      - Auto-calculates distance
      - Will auto-update vehicle status to available
      - Will auto-update driver status to available
      - Will increment driver trip count
      - Show success message

  COMPLETED trips:
    * "View Details" button → show trip summary
    * Show distance traveled
    * Show trip completion time

  CANCELLED trips:
    * "View Details" only

Trip Details Modal:
  * Full trip information
  * Start/End odometer (if completed)
  * Distance traveled (if completed)
  * Time taken (if completed)
  * Notes
  * Close button

Table View (alternative to Kanban):
  Columns:
  * Trip ID
  * Vehicle
  * Driver
  * Cargo Weight
  * Route (Origin → Destination)
  * Status (colored pill)
  * Actions

  Same actions as Kanban cards

Styling (Tailwind CSS):
  * Form section: bg-white card with padding
  * Input fields: border, rounded, focus ring, p-2
  * Validation errors: text-red-600 below field
  * Buttons: blue primary, red cancel
  * Status pills: colored badges
  * Kanban boards: flex layout, columns with scroll
  * Trip cards: white bg, shadow, p-4
  * Loading spinners while submitting

State management:
- availableVehicles, availableDrivers (fetch on mount)
- form state: vehicleId, driverId, cargoWeight, origin, destination, notes
- trips array (filter by status)
- selectedTrip for detail view
- isModalOpen states (create, complete, details)
- loading, error states
- filters: status, vehicleId, driverId

Real-time feedback:
- Show/hide validation errors as user types
- Disable capacity check if cargo weight empty
- Disable dispatch if vehicle not available
- Disable complete button until odometer entered
```

---

## 🔧 PAGE 5: MAINTENANCE & SERVICE LOGS

**Prompt:**

```
Create a maintenance page for FleetFlow using React + Tailwind CSS.

APIs needed:
- POST /api/maintenance (log maintenance - auto sets vehicle to in_shop)
- GET /api/maintenance (list maintenance logs)
- GET /api/maintenance/alerts (pending maintenance)
- GET /api/maintenance/history (completed maintenance)
- PUT /api/maintenance/:id/complete (complete maintenance - auto sets vehicle to available)
- PUT /api/maintenance/:id (update maintenance)
- DELETE /api/maintenance/:id (delete maintenance)
- GET /api/vehicles (to select vehicle)

Requirements:
- Page title: "Maintenance & Service Logs"

SECTION 1: MAINTENANCE ALERTS (Top)
Panel showing:
  * "X Vehicles In Shop" (large red number)
  * "X Pending Maintenance Tasks" (large orange number)
  * List of pending maintenance:
    - Vehicle name
    - Service type (oil_change, repair, inspection, tire_replacement, other)
    - Start date
    - Status: In Progress (yellow badge)
    - Days elapsed
    - "Complete" button for each

SECTION 2: LOG NEW MAINTENANCE (Middle)
Panel title: "Log Service"
Form fields:
  * Vehicle Selection (dropdown, required)
    - Load from GET /api/vehicles
    - Show only vehicles (can filter to non-retired)
    - Display: Name + License Plate

  * Service Type (dropdown, required)
    - Options: Oil Change, Repair, Inspection, Tire Replacement, Other

  * Description (textarea, required)
    - Detailed description of service needed

  * Estimated Cost (number input, required, currency)
    - In dollars/currency

  * Notes (textarea, optional)
    - Additional notes

Form validation:
  * All required fields filled
  * Cost > 0
  * Description not empty
  * Show errors below fields in red

Buttons:
  * "Log Service" (disabled while loading)
  * "Reset Form"

On success:
  * Show success toast: "Service logged successfully. Vehicle moved to In Shop status."
  * Clear form
  * Refresh maintenance lists
  * Vehicle status auto-updated to 'in_shop'

SECTION 3: PENDING MAINTENANCE (Middle-Bottom)
Panel title: "In Progress Maintenance"
List of all in_progress maintenance records:

Table view:
  Columns:
  * Vehicle (Name + License Plate)
  * Service Type (colored badge)
  * Description (truncated, full text in hover)
  * Cost
  * Start Date
  * Days Elapsed
  * Status: In Progress
  * Actions

Service Type badges:
  * oil_change: blue
  * repair: red
  * inspection: green
  * tire_replacement: purple
  * other: gray

Actions:
  * "Complete" button → opens modal
    Modal:
    - Title: "Complete Maintenance"
    - Show vehicle name, service type, start date
    - Field: End Date (date input, defaults to today)
    - Show calculated duration
    - "Save" button calls PUT /api/maintenance/:id/complete
    - Will auto-update vehicle status to 'available'
    - Show success message: "Vehicle released from maintenance. Status set to Available."

  * "Edit" button → opens edit modal (same form as create)
  * "Delete" button → confirmation modal

Maintenance Type Filter:
  * Filter by Service Type: All, Oil Change, Repair, Inspection, Tire Replacement, Other
  * Filter by Vehicle (dropdown)

SECTION 4: MAINTENANCE HISTORY (Bottom)
Panel title: "Completed Maintenance"
List of completed maintenance records:

Table view (read-only):
  Columns:
  * Vehicle (Name + License Plate)
  * Service Type (colored badge)
  * Cost
  * Start Date
  * End Date
  * Duration (days)
  * Notes (if any)

Features:
  * Sortable by date (newest first by default)
  * Pagination (20 per page)
  * Filter by Vehicle (dropdown)
  * Filter by date range (optional)
  * "View Details" link to see full record

Styling (Tailwind CSS):
  * Alert section: bg-red-50 or orange-50 with colored text
  * Form: bg-white card
  * Input fields: border, rounded, focus ring
  * Buttons: blue primary, red delete
  * Service badges: rounded, px-2 py-1, colored
  * Tables: striped rows, hover highlight
  * Status: In Progress (yellow), Completed (green)

State management:
- pendingMaintenance array
- completedMaintenance array
- vehicles array (for selection)
- selectedVehicle for form
- form state: vehicleId, serviceType, description, cost, notes
- isModalOpen states (create, complete, edit, details)
- loading, error states
- filters: serviceType, vehicleId
- alerts: vehiclesInShop, pendingCount

On mount:
- Fetch alerts
- Fetch pending maintenance
- Fetch completed maintenance
- Fetch vehicles for dropdown
```

---

## ⛽ PAGE 6: FUEL & EXPENSE LOGGING

**Prompt:**

```
Create a fuel & expense tracking page for FleetFlow using React + Tailwind CSS.

APIs needed:
- POST /api/expenses (log fuel expense)
- GET /api/expenses (list fuel expenses)
- GET /api/expenses/summary/vehicle?vehicleId=&month= (vehicle summary)
- GET /api/expenses/summary/fleet?month= (fleet summary)
- PUT /api/expenses/:id (update expense)
- DELETE /api/expenses/:id (delete expense)
- GET /api/vehicles (to select vehicle)
- GET /api/trips (to link expense to trip - optional)

Requirements:
- Page title: "Fuel & Expense Tracking"

SECTION 1: FINANCIAL SUMMARY (Top)
Panel showing current month totals:
  * Total Fuel Cost: ${amount} (blue card)
  * Total Fuel Liters: {number}L
  * Average Cost per Liter: ${amount}
  * Total Maintenance Cost: ${amount} (orange card)
  * Total Operational Cost: ${amount} (red card - sum of fuel + maintenance)
  * Average Cost per Trip: ${amount}

Month/Year selector (dropdown):
  * Default: Current month
  * Allow selection of previous months
  * Refresh summary when changed

SECTION 2: LOG FUEL EXPENSE (Middle)
Panel title: "Log Fuel Purchase"
Form fields:
  * Vehicle Selection (dropdown, required)
    - Load from GET /api/vehicles
    - Display: Name + License Plate

  * Trip Assignment (dropdown, optional)
    - Load from GET /api/trips?status=completed
    - Optional: can log fuel not directly tied to a trip
    - Display: Trip ID + Route

  * Liters (number input, required, decimal allowed)
    - Min: 0.1
    - Max: 500 (or vehicle's tank size)

  * Cost (currency input, required)
    - In dollars/currency
    - Will auto-calculate price per liter

  * Price per Liter (read-only or calculated)
    - Auto-calculated: Cost / Liters
    - 2 decimal places
    - Show above submit button as reference

  * Date (date input, required, defaults to today)
    - Can be past date for historical entries

  * Location (text input, required)
    - Gas station name or location
    - Autocomplete suggestions (optional)
    - e.g., "Shell Station Downtown", "Costco Gas"

  * Notes (textarea, optional)
    - Notes or receipt number

Form validation:
  * All required fields filled
  * Liters > 0
  * Cost > 0
  * Show validation errors in red

Buttons:
  * "Log Fuel" (disabled while loading)
  * "Reset Form"

On success:
  * Show success toast: "Fuel expense logged successfully"
  * Clear form
  * Refresh expense list
  * Update summary totals

SECTION 3: FUEL EXPENSE LIST (Middle-Bottom)
Panel title: "Recent Fuel Purchases"

Controls:
  * Filter by Vehicle (dropdown)
  * Filter by Date Range (from date, to date)
  * Search by Location (text input)
  * Refresh button

Table view:
  Columns:
  * Date (sortable, newest first)
  * Vehicle (Name + License Plate)
  * Liters
  * Cost
  * Price per Liter
  * Location
  * Notes (if any)
  * Actions

Actions:
  * "Edit" button → opens edit modal (same form as create)
  * "Delete" button → confirmation modal

Table features:
  * Sortable columns (click header)
  * Pagination (25 per page)
  * Hover highlight
  * Show "No records found" if empty
  * Last column: subtle actions on hover

Styling:
  * Cost/Liter highlighted in green if good value, red if high

SECTION 4: ANALYTICS CHARTS (Bottom - Optional)
  * Line chart: Fuel cost trend (last 30 days)
  * Bar chart: Cost per vehicle (monthly)
  * Pie chart: Distribution of operational costs (fuel vs maintenance)

Alternative: Show trends in text:
  * "Fuel cost trending up/down compared to last month"
  * "Most expensive vehicle this month: Van-05 ($2,500)"
  * "Best fuel efficiency: Van-03 (8.5 km/L)"

Styling (Tailwind CSS):
  * Summary cards: colored bg, white text, lg numbers
    - Fuel: blue-500
    - Maintenance: orange-500
    - Operational: red-500
  * Form: white card with padding
  * Input fields: border, rounded, focus ring
  * Price per liter: bold, highlighted
  * Table: white bg, striped rows, hover highlight
  * Buttons: blue primary, red delete
  * Currency: $ prefix, 2 decimals
  * Numbers right-aligned in table

State management:
- expenses array (fuel expenses)
- vehicles array (for dropdown)
- trips array (for optional linking)
- form state: vehicleId, tripId, liters, cost, pricePerLiter, date, location, notes
- selectedMonth (for summary)
- filters: vehicleId, dateRange, location
- summary data: totalCost, totalLiters, avgPrice, operationalCost
- loading, error states
- isModalOpen states (create, edit, delete)

Calculations:
- pricePerLiter = cost / liters (show with 2 decimals)
- Update summary on filter change
- Recalculate trends for selected month

On mount:
- Fetch current month's expenses
- Fetch vehicles
- Fetch trips
- Calculate and display summary
```

---

## 👥 PAGE 7: DRIVER PROFILES & SAFETY

**Prompt:**

```
Create a driver profile and safety monitoring page for FleetFlow using React + Tailwind CSS.

APIs needed:
- GET /api/drivers (list drivers with filters)
- GET /api/drivers/:id (driver details)
- GET /api/drivers/:id/license-validity (check license validity)
- GET /api/drivers/expiring/list?days=30 (expiring licenses)
- GET /api/drivers/stats (driver statistics)
- POST /api/drivers (create driver - Safety Officer, Fleet Manager)
- PUT /api/drivers/:id (update driver)
- DELETE /api/drivers/:id (delete driver)

Requirements:
- Page title: "Driver Profiles & Safety"

SECTION 1: COMPLIANCE ALERTS (Top)
Panel showing critical compliance issues:
  * Red alert box if any licenses expired
    - Show vehicle count: "2 drivers with expired licenses"
    - List them with expiry date in red

  * Orange alert box for licenses expiring soon (< 30 days)
    - Show vehicle count: "3 drivers with licenses expiring soon"
    - List them with days remaining in orange

  * Green checkmark if all licenses valid
    - "All drivers have valid licenses"

Each alert item:
  * Driver name
  * License expiry date
  * Days remaining (if expiring soon)
  * Action: "Renew License" link (opens form or external)

SECTION 2: DRIVER STATISTICS (Top-Right)
Panel showing metrics:
  * Total Drivers: {count}
  * On Duty: {count} (green)
  * Off Duty: {count} (gray)
  * Suspended: {count} (red)

SECTION 3: CREATE/ADD DRIVER (Middle)
Panel title: "Add New Driver"
Form fields:
  * Name (text input, required)
  * Email (email input, required, unique)
  * Phone (phone input, required)
    - Format: +1-234-567-8900 or (234) 567-8900

  * License Number (text input, required, unique, uppercase)
    - Format validation if needed

  * License Category (dropdown, required)
    - Options: Truck, Van, Bike
    - Driver can only be assigned to trips with matching category

  * License Issue Date (date input, required)
  * License Expiry Date (date input, required)
    - Must be > today
    - Show days until expiry in blue below field
    - Warn if <= 30 days remaining

  * Initial Status (dropdown, required)
    - Options: On Duty, Off Duty
    - Default: Off Duty

Form validation:
  * All required fields filled
  * Email format valid
  * License expiry > today
  * Expiry date > issue date
  * Show errors below fields in red

Buttons:
  * "Add Driver" (disabled while loading)
  * "Reset Form"

On success:
  * Show success toast: "Driver added successfully"
  * Clear form
  * Refresh driver list
  * New driver appears in list

SECTION 4: DRIVER LIST & MANAGEMENT (Middle-Bottom)
Panel title: "Active Drivers"

Controls:
  * Filter by Status: All, On Duty, Off Duty, Suspended
  * Filter by License Category: All, Truck, Van, Bike
  * Filter by Compliance: All, Valid License, Expiring Soon, Expired
  * Search by Name (text input)
  * Refresh button

Table view:
  Columns:
  * Name
  * Email
  * License Number
  * License Category (badge)
  * License Expiry (with warning icon if < 30 days)
  * Safety Score (0-100, color gradient: red < 50, yellow 50-75, green > 75)
  * Status (colored pill: on_duty=green, off_duty=gray, suspended=red)
  * Trip Count
  * Completed Trips
  * Actions (Edit, Delete, View Details)

License expiry styling:
  * Green: > 30 days
  * Orange: 1-30 days remaining with warning icon
  * Red: Expired with alert icon

Actions on each row:
  * "Edit" button → opens edit modal (same form as create)
    - Pre-fill with driver data
    - Allow update of status, safety score
    - PUT /api/drivers/:id

  * "View Details" button → opens full profile modal
    - Show all driver information
    - Show recent trips (last 10)
    - Show compliance status
    - Show safety score history (if available)
    - Show trip completion rate (completedTrips / tripCount)
    - Actions: Edit, Delete, Suspend

  * "Delete" button → confirmation modal
    - "Permanently remove this driver?"
    - DELETE /api/drivers/:id

Table features:
  * Sortable columns
  * Pagination (20 per page)
  * Hover highlight
  * "No records found" message if empty

SECTION 5: DRIVER DETAILS MODAL
  Show:
  * Full name, email, phone
  * License number, category, expiry
  * License validity status (Valid, Expiring Soon, Expired)
  * Safety score (large, colored)
  * Current status (On Duty, Off Duty, Suspended)
  * Compliance status (green checkmark or red warning)

  Statistics:
  * Total trips assigned
  * Completed trips
  * Completion rate (%)
  * Recent trips table (Trip ID, Vehicle, Route, Status, Date)

  Actions:
  * "Edit Driver" button
  * "Suspend Driver" button (only if not suspended)
  * "Activate Driver" button (only if suspended)
  * "Delete Driver" button with confirmation
  * "Close" button

SECTION 6: STATUS CHANGE WORKFLOW
  Changing driver status:
  * On Duty → Off Duty: No confirmation needed, just update
  * Off Duty → On Duty: Check license is valid, show warning if < 30 days
  * Suspended: Show confirmation modal with reason (optional)

  Show success message: "Driver status updated to {status}"

Safety Score Management (Fleet Manager/Safety Officer):
  * Can manually adjust safety score (0-100)
  * Show reason/comments field
  * Update via PUT /api/drivers/:id

Suspend Driver Flow:
  * Confirmation modal: "Suspend driver? They cannot be assigned to trips while suspended."
  * Optional reason field
  * PUT /api/drivers/:id { status: 'suspended' }
  * Driver disappears from available drivers for trip assignment

Styling (Tailwind CSS):
  * Alerts: bg-red-50, red text for expired; bg-orange-50, orange text for expiring
  * Compliance alert: rounded, px-4, py-3, border left
  * Driver cards/rows: bg-white, hover shadow
  * Status badges: rounded-full, px-3, py-1
    - on_duty: green-500
    - off_duty: gray-500
    - suspended: red-500
  * License category: blue badge
  * Safety score: large, colored text (red < 50, yellow 50-75, green > 75)
  * Buttons: blue primary, red delete
  * Form: white card
  * License expiry: green text if valid, orange if expiring, red if expired
  * Warning icons: orange or red color

State management:
- drivers array
- vehicles array (optional, for statistics)
- selectedDriver for detail view
- form state: name, email, phone, licenseNumber, licenseCategory, licenseIssueDate, licenseExpiryDate, status
- expiringLicenses array (drivers with licenses < 30 days)
- stats: totalDrivers, onDuty, offDuty, suspended
- isModalOpen states (create, edit, details, delete, suspend)
- filters: status, licenseCategory, compliance, search
- loading, error states

On mount:
- Fetch all drivers
- Fetch expiring licenses
- Calculate statistics
- Calculate safety scores
```

---

## 📈 PAGE 8: ANALYTICS & REPORTING

**Prompt:**

```
Create an analytics and reporting page for FleetFlow using React + Tailwind CSS with charts.

APIs needed:
- GET /api/analytics/dashboard (KPIs)
- GET /api/analytics/vehicle/:vehicleId (vehicle metrics)
- GET /api/analytics/fleet?month= (fleet metrics)
- GET /api/analytics/drivers/performance (driver performance)
- GET /api/analytics/trends/expenses?months=12 (cost trends)

Analytics libraries:
- Use Recharts for charts (npm install recharts) OR
- Use Chart.js (npm install chart.js react-chartjs-2) OR
- Use simple SVG/canvas or HTML tables if prefer minimal deps

Requirements:
- Page title: "Analytics & Financial Reports"
- Role-based access: Financial Analyst & Fleet Manager can view; others see basic dashboard only

SECTION 1: DATE RANGE SELECTOR (Top)
  * Quick presets: Last 7 Days, Last Month, Last 3 Months, Last Year, All Time
  * Custom date range picker (from date, to date)
  * "Apply" button refreshes all data
  * Show selected range in title: "Analytics - March 2024"

SECTION 2: KPI CARDS (Below Date Selector)
  Grid of 6 cards:

  Card 1: Total Fleet Cost
  - Large number: ${amount}
  - Color: red-500
  - Trend arrow: up/down ↑↓
  - Comparison: "vs ${previousAmount} last month (+x%)"

  Card 2: Fuel Cost
  - Large number: ${amount}
  - Color: orange-500
  - Percentage of total operational cost

  Card 3: Maintenance Cost
  - Large number: ${amount}
  - Color: blue-500
  - Percentage of total operational cost

  Card 4: Average Fuel Efficiency
  - Large number: {x.xx} km/L
  - Color: green-500
  - Trend: better/worse than last month

  Card 5: Fleet Utilization Rate
  - Large number: {x}%
  - Color: purple-500
  - Progress bar fill to percentage

  Card 6: Total Trips
  - Large number: {count}
  - Color: indigo-500

SECTION 3: EXPENSE TRENDS (Middle)
Panel title: "Cost Trends Over Time"
  * Line chart showing:
    - Fuel cost by month (orange line)
    - Maintenance cost by month (blue line)
    - Total operational cost (red line) on secondary axis
  * X-axis: months (Jan, Feb, Mar, etc.)
  * Y-axis: cost in dollars
  * Hover shows exact values
  * 12-month view by default
  * Smooth curves, area under line

Alternative table view:
  Month | Fuel Cost | Maintenance | Total | Trend
  ------------------------------------------------
  March | $5,000    | $2,500      | $7,500| ↑
  Feb   | $4,800    | $2,300      | $7,100|
  Jan   | $5,200    | $2,100      | $7,300| ↓

SECTION 4: VEHICLE PERFORMANCE (Middle-Bottom)
Panel title: "Vehicle Performance Metrics"

Controls:
  * Select specific vehicle (dropdown) OR show all vehicles comparison
  * Sort by: Fuel Efficiency, Total Cost, ROI, Trip Count

Table view (for all vehicles):
  Columns:
  * Vehicle Name + License Plate
  * Trips (completed count)
  * Total Distance (km)
  * Fuel Efficiency (km/L) - color coded: green > 8, yellow 5-8, red < 5
  * Total Fuel Cost
  * Total Maintenance Cost
  * Total Operational Cost
  * Cost per KM
  * ROI (%) - car-coded: green > 50, yellow 0-50, red negative

  Sorting: Click column header to sort
  Filtering: Filter by vehicle status (optional)

Detailed view for single vehicle (click row):
  * Vehicle information (name, type, capacity, odometer)
  * Metrics dashboard:
    - Distance traveled
    - Fuel efficiency
    - Fuel cost
    - Maintenance cost
    - Total operational cost
    - ROI percentage

  * Monthly breakdown:
    - Table showing metrics by month
    - Best month highlighted
    - Trend indicators

  * Trip history:
    - Recent completed trips (last 10)
    - Distance, date, driver

SECTION 5: DRIVER PERFORMANCE (Bottom)
Panel title: "Driver Performance & Compliance"

Table view:
  Columns:
  * Driver Name
  * License Status (Valid/Expiring/Expired)
  * Safety Score (0-100, color: red < 50, yellow 50-75, green > 75)
  * Trip Count
  * Completed Trips
  * Completion Rate (%)
  * Average Trip Distance
  * Status (On Duty, Off Duty, Suspended)

Sorting: Click column header

Actions:
  * Click row to view driver details
  * "View License" link (if expires soon, highlighted orange)
  * "Performance Report" link (opens detailed view)

Performance details modal:
  * All metrics listed
  * Trip history (recent 15 trips)
  * Safety incidents (if tracked)
  * Compliance status (green checkmark or warning)

SECTION 6: COST BREAKDOWN (Optional)
Panel title: "Operational Cost Distribution"

Option 1: Pie/Donut Chart
  * Segments: Fuel (orange), Maintenance (blue), Other (gray)
  * Labels with percentages
  * Hover shows exact costs
  * Legend below

Option 2: Horizontal Bar Chart
  * Fuel: orange bar
  * Maintenance: blue bar
  * Heights proportional to costs

Option 3: Text summary
  * Total Fuel: $5,000 (60%)
  * Total Maintenance: $3,000 (36%)
  * Other: $200 (4%)

SECTION 7: EXPORT REPORTS (Bottom Right)
Panel title: "Generate Reports"
  * "Export to CSV" button
    - Exports vehicle performance data
    - Exports driver performance data

  * "Export to PDF" button (optional, may need additional library)
    - Includes charts, tables, summary
    - Date range in header

  * "Email Report" button (optional)
    - Email to user or specific recipients

Export format:
  - CSV: Columns as in tables, one row per vehicle/driver
  - PDF: Professional layout with charts, tables, summary page
  - Include date range and generation timestamp

Charts Styling (Recharts or Chart.js):
  * Use Tailwind colors
  * Legend below chart
  * Responsive (adjust for mobile)
  * Hover tooltips with values
  * Grid lines subtle (gray-200)
  * Smooth animations
  * Y-axis label: "Cost ($)" or "km/L"
  * X-axis label: "Month" or "Vehicle"

Styling (Tailwind CSS):
  * KPI cards:
    - bg-white, shadow
    - Number: text-3xl font-bold, colored
    - Trend arrow: colored icon
    - Comparison: text-sm gray-600

  * Charts:
    - bg-white card
    - p-6
    - rounded-lg shadow

  * Tables:
    - bg-white
    - striped rows (alternate gray-50)
    - Hover highlight
    - Right-align numbers

  * Buttons: blue primary, download icon
  * Links: blue underline on hover
  * Status: colored badges

State management:
- dateRange (from, to dates)
- selectedVehicle (for detail view)
- metrics object (contains all KPIs)
- vehicleMetrics array (all vehicles)
- driverMetrics array (all drivers)
- chartData (prepared for charts)
- trends array (cost by month)
- loading states (chart loading, table loading)
- error states

On mount:
- Fetch dashboard KPIs
- Fetch fleet analytics
- Fetch vehicle metrics
- Fetch driver performance
- Fetch trends (12 months)
- Prepare chart data

On date range change:
- Refetch all data for new date range
- Update charts
- Update tables
- Show loading state

Chart data preparation:
- Format dates for x-axis
- Aggregate costs by month
- Calculate percentages for pie chart
- Sort vehicles by selected metric
```

---

## 🔗 INTEGRATION CHECKLIST

```
Before asking for page prompts, ensure you have:

☑️ Backend running at http://localhost:5000
☑️ MongoDB connected
☑️ All API endpoints working (test with Postman)
☑️ JWT tokens being generated and returned
☑️ CORS enabled and working

For each page, you'll need:

☑️ Created api.js (Axios instance with interceptors)
☑️ Created AuthContext (authentication state)
☑️ Created App.jsx (routing, ProtectedRoute)
☑️ Created Navbar and Sidebar components
☑️ Imported all necessary libraries (react-router-dom, axios, react-icons for icons)

Page order to build:
1. LoginPage (must work first for authentication)
2. DashboardPage (shows KPIs, requires other data)
3. VehicleRegistryPage (CRUD for vehicles)
4. TripDispatcherPage (create/manage trips)
5. DriverProfilePage (manage drivers)
6. MaintenancePage (log maintenance)
7. ExpensesPage (log fuel expenses)
8. AnalyticsPage (reports - requires data from other pages)
```

---

## 🎨 RECOMMENDED LIBRARIES

```bash
# Install before building pages:

# UI & styling
npm install tailwindcss autoprefixer
npm install @tailwindcss/forms @tailwindcss/typography

# Icons
npm install react-icons

# Routing
npm install react-router-dom

# HTTP client (will be in api.js)
npm install axios

# Forms & validation
npm install react-hook-form
npm install zod  # or yup for validation

# Charts (for analytics page)
npm install recharts
# OR
npm install chart.js react-chartjs-2

# Notifications/Toast
npm install react-toastify
# OR
npm install react-hot-toast

# Date picker (for reports)
npm install react-datepicker

# PDF export (optional)
npm install jspdf
npm install html2canvas

# CSV export (optional)
npm install papaparse

# Loading skeletons
npm install react-skeleton-loading
```

---

## 🌐 ENVIRONMENT SETUP

Create `.env` file in frontend/:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=FleetFlow
REACT_APP_ENVIRONMENT=development
```

Use in code:
```javascript
const API_URL = process.env.REACT_APP_API_URL;
```

---

## ✅ Testing Your Pages

For each page after creating it:

1. **Create test user**: POST /api/auth/register with Fleet Manager role
2. **Login**: Use credentials to get JWT token
3. **Create test data**:
   - 3 vehicles (different types)
   - 5 drivers (mixed roles/licenses)
   - 2 trips (draft and dispatched)
4. **Test page functionality**:
   - Load data from API
   - Create/update/delete operations
   - Form validation
   - Error handling
5. **Check styling**: Responsive on mobile/tablet/desktop

---

## 💡 QUICK TIPS

- Use `navigate('/dashboard')` after login for redirect
- Store token in localStorage with key: `authToken`
- Add Authorization header in all requests: `header.Authorization = 'Bearer ' + token`
- Show loading spinner while fetching data
- Handle 401 errors by clearing token and redirecting to login
- Use React.memo() for components that don't change
- Extract repeated code into components (InputField, SelectField, etc.)
- Test API with Postman FIRST before building each page
- Use TypeScript if you want type safety (optional)

---

## 📞 SUPPORT

If stuck on a page:
1. Check backend API is working (Postman)
2. Check token is valid (console.log it)
3. Check request format matches API docs in backend/SETUP.md
4. Check error message in console
5. Verify Tailwind CSS is configured (check tailwind.config.js)

---

**Ready to build?** Start with the **Prerequisites Setup Prompt** above! 🚀

Each page prompt is ready to copy-paste into Claude, ChatGPT, or Cursor.
