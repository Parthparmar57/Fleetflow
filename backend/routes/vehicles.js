import express from 'express';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  retireVehicle,
  getVehicleStats,
} from '../controllers/vehicleController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateVehicle, validateMongoId } from '../middleware/validation.js';

const router = express.Router();

// All vehicle routes require authentication
router.use(authenticate);

// Get all vehicles with filters
router.get('/', getVehicles);

// Get vehicle statistics
router.get('/stats', getVehicleStats);

// Get single vehicle by ID
router.get('/:id', validateMongoId('id'), getVehicleById);

// Create vehicle (Fleet Manager only)
router.post('/', authorize('fleet_manager'), validateVehicle, createVehicle);

// Update vehicle (Fleet Manager only)
router.put('/:id', authorize('fleet_manager'), validateMongoId('id'), updateVehicle);

// Retire vehicle (Fleet Manager only)
router.put('/:id/retire', authorize('fleet_manager'), validateMongoId('id'), retireVehicle);

// Delete vehicle (Fleet Manager only)
router.delete('/:id', authorize('fleet_manager'), validateMongoId('id'), deleteVehicle);

export default router;
