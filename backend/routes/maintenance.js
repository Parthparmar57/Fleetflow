import express from 'express';
import {
  getMaintenanceLogs,
  getMaintenanceById,
  createMaintenance,
  completeMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceAlerts,
  getMaintenanceHistory,
} from '../controllers/maintenanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateMaintenance, validateMongoId } from '../middleware/validation.js';

const router = express.Router();

// All maintenance routes require authentication
router.use(authenticate);

// Get all maintenance logs
router.get('/', getMaintenanceLogs);

// Get maintenance alerts
router.get('/alerts', getMaintenanceAlerts);

// Get maintenance history (completed)
router.get('/history', getMaintenanceHistory);

// Get single maintenance log by ID
router.get('/:id', validateMongoId('id'), getMaintenanceById);

// Create maintenance log (Fleet Manager)
router.post('/', authorize('fleet_manager'), validateMaintenance, createMaintenance);

// Update maintenance log (Fleet Manager)
router.put('/:id', authorize('fleet_manager'), validateMongoId('id'), updateMaintenance);

// Complete maintenance (Fleet Manager)
router.put('/:id/complete', authorize('fleet_manager'), validateMongoId('id'), completeMaintenance);

// Delete maintenance log (Fleet Manager)
router.delete('/:id', authorize('fleet_manager'), validateMongoId('id'), deleteMaintenance);

export default router;
