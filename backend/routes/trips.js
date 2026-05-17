import express from 'express';
import {
  getTrips,
  getTripById,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  getTripStats,
  getTripHistory,
  updateTrip,
  updateTripLocation,
  deleteTrip,
} from '../controllers/tripController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateTrip, validateMongoId } from '../middleware/validation.js';

const router = express.Router();

// All trip routes require authentication
router.use(authenticate);

// Get all trips with filters
router.get('/', getTrips);

// Get trip statistics
router.get('/stats', getTripStats);

// Get trip history (completed trips)
router.get('/history', getTripHistory);

// Get single trip by ID
router.get('/:id', validateMongoId('id'), getTripById);

// Create trip (Dispatcher & Fleet Manager)
router.post('/', authorize('dispatcher', 'fleet_manager'), validateTrip, createTrip);

// Dispatch trip (Dispatcher & Fleet Manager)
router.put('/:id/dispatch', authorize('dispatcher', 'fleet_manager'), validateMongoId('id'), dispatchTrip);

// Complete trip (Dispatcher & Fleet Manager)
router.put('/:id/complete', authorize('dispatcher', 'fleet_manager'), validateMongoId('id'), completeTrip);

// Cancel trip (Dispatcher & Fleet Manager)
router.put('/:id/cancel', authorize('dispatcher', 'fleet_manager'), validateMongoId('id'), cancelTrip);

// Update trip (Dispatcher & Fleet Manager)
router.put('/:id', authorize('dispatcher', 'fleet_manager'), validateMongoId('id'), updateTrip);

// Update trip location (Authenticated users - usually driver)
router.post('/:id/location', validateMongoId('id'), updateTripLocation);

// Delete trip (Fleet Manager & Dispatcher)
router.delete('/:id', authorize('fleet_manager', 'dispatcher'), validateMongoId('id'), deleteTrip);

export default router;
