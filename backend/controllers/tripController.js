import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';

export const getTrips = async (req, res) => {
  try {
    const { status, vehicleId, driverId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (vehicleId) query.vehicleId = vehicleId;
    if (driverId) query.driverId = driverId;

    const trips = await Trip.find(query)
      .populate('vehicleId', 'name licenseplate maxCapacityKg')
      .populate('driverId', 'name licenseNumber safetyScore')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ trips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id)
      .populate('vehicleId')
      .populate('driverId')
      .populate('createdBy', 'name email');

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.status(200).json({ trip });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
};

export const createTrip = async (req, res) => {
  try {
    const { vehicleId, driverId, cargoWeight, originLocation, destinationLocation, notes } = req.body;

    if (!vehicleId || !driverId || cargoWeight === undefined || !originLocation || !destinationLocation) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Fetch vehicle and driver
    const vehicle = await Vehicle.findById(vehicleId);
    const driver = await Driver.findById(driverId);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Validation: Cargo weight vs vehicle capacity
    if (cargoWeight > vehicle.maxCapacityKg) {
      return res.status(400).json({
        error: 'Cargo weight exceeds vehicle capacity',
        cargoWeight,
        maxCapacity: vehicle.maxCapacityKg,
      });
    }

    // Validation: Vehicle must be available
    if (vehicle.status !== 'available') {
      return res.status(400).json({
        error: `Vehicle is not available. Current status: ${vehicle.status}`,
      });
    }

    // Validation: Driver license must be valid
    if (driver.licenseExpiry < new Date()) {
      return res.status(400).json({
        error: "Driver's license has expired",
        licenseExpiry: driver.licenseExpiry,
      });
    }

    // Validation: Driver must not be suspended
    if (driver.status === 'suspended') {
      return res.status(400).json({
        error: 'Driver is suspended and cannot be assigned to trips',
      });
    }

    // Create trip
    const trip = await Trip.create({
      vehicleId,
      driverId,
      cargoWeight,
      originLocation,
      destinationLocation,
      notes,
      assignedAt: new Date(),
      createdBy: req.user.userId,
    });

    res.status(201).json({
      message: 'Trip created successfully',
      trip: await trip.populate('vehicleId driverId'),
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    // SECURITY FIX: Never expose stack traces to clients
    res.status(500).json({ error: 'Failed to create trip' });
  }
};

export const dispatchTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft trips can be dispatched' });
    }

    // Update trip status
    trip.status = 'dispatched';
    trip.dispatchedAt = new Date();
    await trip.save();

    // Update vehicle status to 'on_trip'
    await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'on_trip' });

    // Update driver status to 'on_duty'
    await Driver.findByIdAndUpdate(trip.driverId, { status: 'on_duty' });

    res.status(200).json({
      message: 'Trip dispatched successfully',
      trip: await trip.populate('vehicleId driverId'),
    });
  } catch (error) {
    console.error('Error dispatching trip:', error);
    res.status(500).json({ error: 'Failed to dispatch trip' });
  }
};

export const completeTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { endOdometer } = req.body;

    if (!endOdometer) {
      return res.status(400).json({ error: 'Please provide end odometer reading' });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.status !== 'dispatched') {
      return res.status(400).json({ error: 'Only dispatched trips can be completed' });
    }

    // Get start odometer from vehicle
    const vehicle = await Vehicle.findById(trip.vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // SECURITY FIX: Validate odometer reading (must be monotonic and reasonable)
    const endOdometerNum = parseFloat(endOdometer);
    
    if (isNaN(endOdometerNum) || endOdometerNum < 0) {
      return res.status(400).json({ error: 'Invalid odometer reading' });
    }
    
    if (endOdometerNum < vehicle.odometer) {
      return res.status(400).json({ 
        error: 'End odometer cannot be less than start odometer',
        startOdometer: vehicle.odometer,
        endOdometer: endOdometerNum
      });
    }
    
    // Sanity check: distance shouldn't be unreasonably large (e.g., > 5000 km per trip)
    const distance = endOdometerNum - vehicle.odometer;
    if (distance > 5000) {
      return res.status(400).json({ 
        error: 'Distance exceeds reasonable limit. Please verify odometer reading.',
        distance: distance
      });
    }

    // Update trip
    trip.status = 'completed';
    trip.completedAt = new Date();
    trip.startOdometer = vehicle.odometer;
    trip.endOdometer = endOdometerNum;
    await trip.save();

    // Update vehicle status to 'available' and odometer
    await Vehicle.findByIdAndUpdate(trip.vehicleId, {
      status: 'available',
      odometer: endOdometerNum,
    });

    // Update driver status to 'on_duty' and increment completed trips
    await Driver.findByIdAndUpdate(trip.driverId, {
      $inc: { tripCount: 1, completedTrips: 1 },
    });

    res.status(200).json({
      message: 'Trip completed successfully',
      trip: await trip.populate('vehicleId driverId'),
      distance: distance,
    });
  } catch (error) {
    console.error('Error completing trip:', error);
    res.status(500).json({ error: 'Failed to complete trip' });
  }
};

export const cancelTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.status === 'completed' || trip.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot cancel completed or already cancelled trips' });
    }

    // SECURITY FIX: Check status BEFORE mutation to ensure vehicle/driver release logic runs
    const wasDispatched = trip.status === 'dispatched';

    // Update trip status
    trip.status = 'cancelled';
    await trip.save();

    // If trip was dispatched, release vehicle and driver
    if (wasDispatched) {
      await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'available' });
      await Driver.findByIdAndUpdate(trip.driverId, { status: 'off_duty' });
    }

    res.status(200).json({
      message: 'Trip cancelled successfully',
      trip,
    });
  } catch (error) {
    console.error('Error cancelling trip:', error);
    res.status(500).json({ error: 'Failed to cancel trip' });
  }
};

export const getTripStats = async (req, res) => {
  try {
    const stats = {
      totalTrips: await Trip.countDocuments(),
      draft: await Trip.countDocuments({ status: 'draft' }),
      dispatched: await Trip.countDocuments({ status: 'dispatched' }),
      completed: await Trip.countDocuments({ status: 'completed' }),
      cancelled: await Trip.countDocuments({ status: 'cancelled' }),
    };

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error fetching trip stats:', error);
    res.status(500).json({ error: 'Failed to fetch trip statistics' });
  }
};

export const getTripHistory = async (req, res) => {
  try {
    const { vehicleId, driverId } = req.query;
    const query = { status: 'completed' };

    if (vehicleId) query.vehicleId = vehicleId;
    if (driverId) query.driverId = driverId;

    const trips = await Trip.find(query)
      .populate('vehicleId', 'name licenseplate')
      .populate('driverId', 'name')
      .sort({ completedAt: -1 });

    res.status(200).json({ trips });
  } catch (error) {
    console.error('Error fetching trip history:', error);
    res.status(500).json({ error: 'Failed to fetch trip history' });
  }
};
export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicleId, driverId, cargoWeight, originLocation, destinationLocation, notes } = req.body;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft trips can be edited. Dispatched trips must be cancelled or completed.' });
    }

    // If vehicle or driver changed, validate again
    if (vehicleId && vehicleId !== trip.vehicleId.toString()) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle || vehicle.status !== 'available') {
        return res.status(400).json({ error: 'Selected vehicle is not available' });
      }
      if (cargoWeight && cargoWeight > vehicle.maxCapacityKg) {
        return res.status(400).json({ error: 'Cargo weight exceeds new vehicle capacity' });
      }
      trip.vehicleId = vehicleId;
    }

    if (driverId && driverId !== trip.driverId.toString()) {
      const driver = await Driver.findById(driverId);
      if (!driver || driver.status === 'suspended' || driver.licenseExpiry < new Date()) {
        return res.status(400).json({ error: 'Selected driver is ineligible' });
      }
      trip.driverId = driverId;
    }

    if (cargoWeight !== undefined) trip.cargoWeight = cargoWeight;
    if (originLocation) trip.originLocation = originLocation;
    if (destinationLocation) trip.destinationLocation = destinationLocation;
    if (notes) trip.notes = notes;

    await trip.save();
    res.status(200).json({ message: 'Trip updated successfully', trip: await trip.populate('vehicleId driverId') });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
};

export const updateTripLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, address } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    if (trip.status !== 'dispatched') {
      return res.status(400).json({ error: 'Can only track dispatched trips' });
    }

    const newLocation = { lat, lng, timestamp: new Date(), address };
    
    // SECURITY FIX: Cap tracking history to prevent unbounded document growth
    // Keep only the last 500 locations (configurable based on requirements)
    const MAX_TRACKING_HISTORY = 500;
    
    trip.currentLocation = newLocation;
    
    // Use $push with $slice to maintain a capped array
    await Trip.findByIdAndUpdate(id, {
      currentLocation: newLocation,
      $push: {
        trackingHistory: {
          $each: [newLocation],
          $slice: -MAX_TRACKING_HISTORY  // Keep only last N items
        }
      }
    });

    // Broadcast update via Socket.io (Socket will be attached to req.app in server.js)
    if (req.app.get('io')) {
      req.app.get('io').to(`trip_${id}`).emit('location_update', { tripId: id, location: newLocation });
    }

    res.status(200).json({ message: 'Location updated', location: newLocation });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Only allow deleting draft or cancelled trips to maintain integrity
    if (trip.status !== 'draft' && trip.status !== 'cancelled') {
      return res.status(400).json({ error: 'Only draft or cancelled trips can be deleted' });
    }

    await Trip.findByIdAndDelete(id);
    res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
};
