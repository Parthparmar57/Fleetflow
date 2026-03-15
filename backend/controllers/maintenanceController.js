import MaintenanceLog from '../models/MaintenanceLog.js';
import Vehicle from '../models/Vehicle.js';

export const getMaintenanceLogs = async (req, res) => {
  try {
    const { vehicleId, status } = req.query;
    const query = {};

    if (vehicleId) query.vehicleId = vehicleId;
    if (status) query.status = status;

    const logs = await MaintenanceLog.find(query)
      .populate('vehicleId', 'name licenseplate')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMaintenanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await MaintenanceLog.findById(id)
      .populate('vehicleId')
      .populate('createdBy', 'name email');

    if (!log) {
      return res.status(404).json({ error: 'Maintenance log not found' });
    }

    res.status(200).json({ log });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createMaintenance = async (req, res) => {
  try {
    const { vehicleId, serviceType, description, cost, notes } = req.body;

    if (!vehicleId || !serviceType || !description || !cost) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Create maintenance log
    const log = await MaintenanceLog.create({
      vehicleId,
      serviceType,
      description,
      cost,
      notes,
      createdBy: req.user.userId,
    });

    // Auto-update vehicle status to 'in_shop'
    await Vehicle.findByIdAndUpdate(vehicleId, { status: 'in_shop' });

    res.status(201).json({
      message: 'Maintenance logged successfully. Vehicle status set to "in_shop"',
      log: await log.populate('vehicleId'),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const completeMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { endDate } = req.body;

    const log = await MaintenanceLog.findById(id);
    if (!log) {
      return res.status(404).json({ error: 'Maintenance log not found' });
    }

    if (log.status === 'completed') {
      return res.status(400).json({ error: 'This maintenance is already completed' });
    }

    // Update maintenance log
    log.status = 'completed';
    log.endDate = endDate || new Date();
    await log.save();

    // Auto-update vehicle status to 'available'
    await Vehicle.findByIdAndUpdate(log.vehicleId, { status: 'available' });

    res.status(200).json({
      message: 'Maintenance completed successfully. Vehicle status set to "available"',
      log: await log.populate('vehicleId'),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceType, description, cost, notes } = req.body;

    const log = await MaintenanceLog.findByIdAndUpdate(
      id,
      { serviceType, description, cost, notes },
      { new: true, runValidators: true }
    );

    if (!log) {
      return res.status(404).json({ error: 'Maintenance log not found' });
    }

    res.status(200).json({
      message: 'Maintenance updated successfully',
      log,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await MaintenanceLog.findByIdAndDelete(id);

    if (!log) {
      return res.status(404).json({ error: 'Maintenance log not found' });
    }

    res.status(200).json({ message: 'Maintenance log deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMaintenanceAlerts = async (req, res) => {
  try {
    // Get all vehicles in maintenance
    const inMaintenance = await Vehicle.countDocuments({ status: 'in_shop' });

    // Get all pending maintenance (in progress)
    const pendingLogs = await MaintenanceLog.find({ status: 'in_progress' })
      .populate('vehicleId', 'name licenseplate')
      .sort({ startDate: -1 });

    res.status(200).json({
      vehiclesInMaintenance: inMaintenance,
      pendingMaintenance: pendingLogs.length,
      logs: pendingLogs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMaintenanceHistory = async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const query = { status: 'completed' };

    if (vehicleId) query.vehicleId = vehicleId;

    const logs = await MaintenanceLog.find(query)
      .populate('vehicleId', 'name licenseplate')
      .sort({ endDate: -1 });

    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
