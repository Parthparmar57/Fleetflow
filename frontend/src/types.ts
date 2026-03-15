export interface User {
  id: string;
  name: string;
  email: string;
  role: 'fleet_manager' | 'dispatcher' | 'safety_officer' | 'financial_analyst';
  phone?: string;
  avatar?: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licenseplate: string;
  vin: string;
  status: 'Available' | 'On Trip' | 'In Maintenance' | 'Out of Service';
  mileage: number;
  fuelLevel: number;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  phone: string;
  email: string;
  rating: number;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  status: 'Scheduled' | 'In Transit' | 'Completed' | 'Delayed' | 'Cancelled';
  startTime: string;
  endTime?: string;
  distance?: number;
}
