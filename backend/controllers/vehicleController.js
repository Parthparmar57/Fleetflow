import Vehicle from '../models/Vehicle.js';

export const getVehicles = async (req, res) => {
  try {    // ✅ SECURITY FIX: Add pagination to prevent data dump attacks
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20); // Max 50 per page
    const skip = (page - 1) * limit;
    const { status, type } = req.query;
    const query = { organizationId: req.user.organizationId };

    if (status) query.status = status;
    if (type) query.vehicleType = type;

    const vehicles = await Vehicle.find(query)
      .limit(limit)
      .skip(skip)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const total = await Vehicle.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({ 
      vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findOne({
      _id: id,
      organizationId: req.user.organizationId
    })
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

    // Check if license plate already exists in this organization
    const existingVehicle = await Vehicle.findOne({
      licenseplate,
      organizationId: req.user.organizationId
    });
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
      organizationId: req.user.organizationId,
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

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: id, organizationId: req.user.organizationId },
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

    const vehicle = await Vehicle.findOneAndDelete({
      _id: id,
      organizationId: req.user.organizationId
    });

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

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: id, organizationId: req.user.organizationId },
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
    const orgQuery = { organizationId: req.user.organizationId };
    const stats = {
      totalVehicles: await Vehicle.countDocuments(orgQuery),
      available: await Vehicle.countDocuments({ ...orgQuery, status: 'available' }),
      onTrip: await Vehicle.countDocuments({ ...orgQuery, status: 'on_trip' }),
      inShop: await Vehicle.countDocuments({ ...orgQuery, status: 'in_shop' }),
      retired: await Vehicle.countDocuments({ ...orgQuery, status: 'retired' }),
    };

    res.status(200).json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
