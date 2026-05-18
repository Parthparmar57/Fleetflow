import Driver from '../models/Driver.js';
import asyncHandler from '../middleware/asyncHandler.js';
import logger from '../config/logger.js';

export const getDrivers = asyncHandler(async (req, res) => {
  // ✅ SECURITY FIX: Add pagination to prevent data dump attacks
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const { status, licenseCategory } = req.query;
  const query = { organizationId: req.user.organizationId };

  if (status) query.status = status;
  if (licenseCategory) query.licenseCategory = licenseCategory;

  const drivers = await Driver.find(query)
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await Driver.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({ 
    drivers,
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

export const getDriverById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const driver = await Driver.findOne({
    _id: id,
    organizationId: req.user.organizationId
  });

  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  res.status(200).json({ driver });
});

export const createDriver = asyncHandler(async (req, res) => {
  const { name, email, licenseNumber, licenseExpiry, licenseCategory, phone, licenseIssuedDate } = req.body;

  if (!name || !email || !licenseNumber || !licenseExpiry || !licenseCategory || !phone) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  // Check if driver already exists in this organization
  const existingDriver = await Driver.findOne({
    organizationId: req.user.organizationId,
    $or: [{ email }, { licenseNumber: licenseNumber.toUpperCase() }],
  });
  
  if (existingDriver) {
    return res.status(409).json({ error: 'Driver with this email or license already exists' });
  }

  const driver = await Driver.create({
    name,
    email,
    licenseNumber: licenseNumber.toUpperCase(),
    licenseExpiry,
    licenseCategory,
    phone,
    licenseIssuedDate,
    organizationId: req.user.organizationId,
  });

  logger.info('Driver created', {
    driverId: driver._id,
    organizationId: req.user.organizationId,
    userId: req.user.userId
  });

  res.status(201).json({
    message: 'Driver created successfully',
    driver,
  });
});

export const updateDriver = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, safetyScore } = req.body;

  const driver = await Driver.findOneAndUpdate(
    { _id: id, organizationId: req.user.organizationId },
    { status, safetyScore },
    { new: true, runValidators: true }
  );

  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  logger.info('Driver updated', {
    driverId: driver._id,
    organizationId: req.user.organizationId,
    userId: req.user.userId
  });

  res.status(200).json({
    message: 'Driver updated successfully',
    driver,
  });
});

export const updateDriverTrips = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { completedTrip = false } = req.body;

  const updateData = { $inc: { tripCount: 1 } };
  if (completedTrip) {
    updateData.$inc.completedTrips = 1;
  }

  // ✅ SECURITY FIX: Add organizationId check
  const driver = await Driver.findOneAndUpdate(
    { _id: id, organizationId: req.user.organizationId },
    updateData,
    { new: true }
  );

  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  res.status(200).json({
    message: 'Driver trip count updated',
    driver,
  });
});

export const checkLicenseValidity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // ✅ SECURITY FIX: Add organizationId check
  const driver = await Driver.findOne({
    _id: id,
    organizationId: req.user.organizationId
  });

  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  const isValid = driver.licenseExpiry > new Date();

  res.status(200).json({
    driver: {
      id: driver._id,
      name: driver.name,
      licenseExpiry: driver.licenseExpiry,
    },
    isLicenseValid: isValid,
    daysUntilExpiry: isValid
      ? Math.ceil((driver.licenseExpiry - new Date()) / (1000 * 60 * 60 * 24))
      : 0,
  });
});

export const deleteDriver = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ✅ SECURITY FIX: Add organizationId check
  const driver = await Driver.findOneAndDelete({
    _id: id,
    organizationId: req.user.organizationId
  });

  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  logger.info('Driver deleted', {
    driverId: driver._id,
    organizationId: req.user.organizationId,
    userId: req.user.userId
  });

  res.status(200).json({ message: 'Driver deleted successfully' });
});

export const getExpiringLicenses = asyncHandler(async (req, res) => {
  const daysThreshold = parseInt(req.query.days) || 30;
  const today = new Date();
  const expiryDate = new Date(today.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

  // ✅ SECURITY FIX: Add organizationId filter
  const drivers = await Driver.find({
    organizationId: req.user.organizationId,
    licenseExpiry: {
      $gte: today,
      $lte: expiryDate,
    },
    status: { $ne: 'suspended' },
  }).sort({ licenseExpiry: 1 });

  res.status(200).json({
    threshold: `${daysThreshold} days`,
    count: drivers.length,
    drivers,
  });
});

export const getDriverStats = asyncHandler(async (req, res) => {
  // ✅ SECURITY FIX: Add organizationId filter
  const orgQuery = { organizationId: req.user.organizationId };
  
  const stats = {
    totalDrivers: await Driver.countDocuments(orgQuery),
    onDuty: await Driver.countDocuments({ ...orgQuery, status: 'on_duty' }),
    offDuty: await Driver.countDocuments({ ...orgQuery, status: 'off_duty' }),
    suspended: await Driver.countDocuments({ ...orgQuery, status: 'suspended' }),
  };

  res.status(200).json({ stats });
});
