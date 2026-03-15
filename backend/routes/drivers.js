import express from 'express';
import {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  updateDriverTrips,
  checkLicenseValidity,
  deleteDriver,
  getExpiringLicenses,
  getDriverStats,
} from '../controllers/driverController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All driver routes require authentication
router.use(authenticate);

// Get all drivers with filters
router.get('/', getDrivers);

// Get driver statistics
router.get('/stats', getDriverStats);

// Get expiring licenses (Safety Officer)
router.get('/expiring/list', authorize('safety_officer', 'fleet_manager'), getExpiringLicenses);

// Check license validity
router.get('/:id/license-validity', checkLicenseValidity);

// Get single driver by ID
router.get('/:id', getDriverById);

// Create driver (Safety Officer only)
router.post('/', authorize('safety_officer'), createDriver);

// Update driver (Safety Officer only)
router.put('/:id', authorize('safety_officer'), updateDriver);

// Update driver trip count (Dispatcher)
router.put('/:id/trips', authorize('dispatcher', 'fleet_manager'), updateDriverTrips);

// Delete driver (Safety Officer only)
router.delete('/:id', authorize('safety_officer'), deleteDriver);

export default router;
