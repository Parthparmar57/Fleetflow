import Vehicle from '../models/Vehicle.js';

export const getVehicles = async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.vehicleType = type;

    const vehicles = await Vehicle.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ vehicles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id)
      .populate('createdBy', 'name email')
      .populate('maintenanceHistory');

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.status(200).json({ vehicle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const { name, licenseplate, vehicleType, model, maxCapacityKg, acquisitionCost, odometer, fuelLevel } = req.body;

    if (!name || !licenseplate || !vehicleType || !model || !maxCapacityKg || !acquisitionCost) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if license plate already exists
    const existingVehicle = await Vehicle.findOne({ licenseplate });
    if (existingVehicle) {
      return res.status(409).json({ error: 'Vehicle with this license plate already exists' });
    }

    const vehicle = await Vehicle.create({
      name,
      licenseplate: licenseplate.toUpperCase(),
      vehicleType,
      model,
      maxCapacityKg,
      acquisitionCost,
      odometer: odometer || 0,
      fuelLevel: fuelLevel ?? 100,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicle,
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      licenseplate, 
      vehicleType, 
      model, 
      maxCapacityKg, 
      acquisitionCost, 
      status, 
      odometer, 
      fuelLevel 
    } = req.body;

    const updateData = { 
      status, 
      odometer,
      ...(name && { name }),
      ...(licenseplate && { licenseplate: licenseplate.toUpperCase() }),
      ...(vehicleType && { vehicleType }),
      ...(model && { model }),
      ...(maxCapacityKg && { maxCapacityKg }),
      ...(acquisitionCost && { acquisitionCost }),
      ...(fuelLevel !== undefined && { fuelLevel })
    };

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.status(200).json({
      message: 'Vehicle updated successfully',
      vehicle,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findByIdAndDelete(id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const retireVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { status: 'retired' },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.status(200).json({
      message: 'Vehicle retired successfully',
      vehicle,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVehicleStats = async (req, res) => {
  try {
    const stats = {
      totalVehicles: await Vehicle.countDocuments(),
      available: await Vehicle.countDocuments({ status: 'available' }),
      onTrip: await Vehicle.countDocuments({ status: 'on_trip' }),
      inShop: await Vehicle.countDocuments({ status: 'in_shop' }),
      retired: await Vehicle.countDocuments({ status: 'retired' }),
    };

    res.status(200).json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
