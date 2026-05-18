import MaintenanceLog from '../models/MaintenanceLog.js';
import Vehicle from '../models/Vehicle.js';
import asyncHandler from '../middleware/asyncHandler.js';
import logger from '../config/logger.js';

export const getMaintenanceLogs = asyncHandler(async (req, res) => {
  // ✅ SECURITY FIX: Add pagination to prevent data dump attacks
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const { vehicleId, status } = req.query;
  const query = { organizationId: req.user.organizationId };

  if (vehicleId) query.vehicleId = vehicleId;
  if (status) query.status = status;

  const logs = await MaintenanceLog.find(query)
    .limit(limit)
    .skip(skip)
    .populate('vehicleId', 'name licenseplate')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  const total = await MaintenanceLog.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({ 
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
});

export const getMaintenanceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // ✅ SECURITY FIX: Add organizationId check
  const log = await MaintenanceLog.findOne({
    _id: id,
    organizationId: req.user.organizationId
  })
    .populate('vehicleId')
    .populate('createdBy', 'name email');

  if (!log) {
    return res.status(404).json({ error: 'Maintenance log not found' });
  }

  res.status(200).json({ log });
});

export const createMaintenance = asyncHandler(async (req, res) => {
  const { vehicleId, serviceType, description, cost, notes } = req.body;

  if (!vehicleId || !serviceType || !description || !cost) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  // Check if vehicle exists and belongs to user's organization
  const vehicle = await Vehicle.findOne({
    _id: vehicleId,
    organizationId: req.user.organizationId
  });
  
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
    organizationId: req.user.organizationId,
  });

  // Auto-update vehicle status to 'in_shop'
  await Vehicle.findByIdAndUpdate(vehicleId, { status: 'in_shop' });

  logger.info('Maintenance log created', {
    logId: log._id,
    vehicleId,
    organizationId: req.user.organizationId,
    userId: req.user.userId
  });

  res.status(201).json({
    message: 'Maintenance logged successfully. Vehicle status set to "in_shop"',
    log: await log.populate('vehicleId'),
  });
});

export const completeMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { endDate } = req.body;

  // ✅ SECURITY FIX: Add organizationId check
  const log = await MaintenanceLog.findOne({
    _id: id,
    organizationId: req.user.organizationId
  });
  
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

  logger.info('Maintenance completed', {
    logId: log._id,
    vehicleId: log.vehicleId,
    organizationId: req.user.organizationId,
    userId: req.user.userId
  });

  res.status(200).json({
    message: 'Maintenance completed successfully. Vehicle status set to "available"',
    log: await log.populate('vehicleId'),
  });
});

export const updateMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { serviceType, description, cost, notes } = req.body;

  // ✅ SECURITY FIX: Add organizationId check
  const log = await MaintenanceLog.findOneAndUpdate(
    { _id: id, organizationId: req.user.organizationId },
    { serviceType, description, cost, notes },
    { new: true, runValidators: true }
  );

  if (!log) {
    return res.status(404).json({ error: 'Maintenance log not found' });
  }

  logger.info('Maintenance updated', {
    logId: log._id,
    organizationId: req.user.organizationId,
    userId: req.user.userId
  });

  res.status(200).json({
    message: 'Maintenance updated successfully',
    log,
  });
});

export const deleteMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ✅ SECURITY FIX: Add organizationId check
  const log = await MaintenanceLog.findOneAndDelete({
    _id: id,
    organizationId: req.user.organizationId
  });

  if (!log) {
    return res.status(404).json({ error: 'Maintenance log not found' });
  }

  logger.info('Maintenance deleted', {
    logId: log._id,
    organizationId: req.user.organizationId,
    userId: req.user.userId
  });

  res.status(200).json({ message: 'Maintenance log deleted successfully' });
});

export const getMaintenanceAlerts = asyncHandler(async (req, res) => {
  // ✅ SECURITY FIX: Add organizationId filter
  const orgQuery = { organizationId: req.user.organizationId };
  
  // Get all vehicles in maintenance
  const inMaintenance = await Vehicle.countDocuments({ ...orgQuery, status: 'in_shop' });

  // Get all pending maintenance (in progress)
  const pendingLogs = await MaintenanceLog.find({ ...orgQuery, status: 'in_progress' })
    .populate('vehicleId', 'name licenseplate')
    .sort({ startDate: -1 });

  res.status(200).json({
    vehiclesInMaintenance: inMaintenance,
    pendingMaintenance: pendingLogs.length,
    logs: pendingLogs,
  });
});

export const getMaintenanceHistory = asyncHandler(async (req, res) => {
  const { vehicleId } = req.query;
  const query = { 
    status: 'completed',
    organizationId: req.user.organizationId 
  };

  if (vehicleId) query.vehicleId = vehicleId;

  const logs = await MaintenanceLog.find(query)
    .populate('vehicleId', 'name licenseplate')
    .sort({ endDate: -1 });

  res.status(200).json({ logs });
});
