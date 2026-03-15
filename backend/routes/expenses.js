import express from 'express';
import {
  getFuelExpenses,
  getExpenseById,
  createFuelExpense,
  updateFuelExpense,
  deleteFuelExpense,
  getVehicleExpenseSummary,
  getFleetExpenseSummary,
} from '../controllers/expenseController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All expense routes require authentication
router.use(authenticate);

// Get all fuel expenses (Financial Analyst, Fleet Manager & Dispatcher)
router.get('/', authorize('financial_analyst', 'fleet_manager', 'dispatcher'), getFuelExpenses);

// Get vehicle expense summary (Financial Analyst & Fleet Manager & Dispatcher)
router.get('/summary/vehicle', authorize('financial_analyst', 'fleet_manager', 'dispatcher'), getVehicleExpenseSummary);

// Get fleet expense summary (Financial Analyst & Fleet Manager & Dispatcher)
router.get('/summary/fleet', authorize('financial_analyst', 'fleet_manager', 'dispatcher'), getFleetExpenseSummary);

// Get single expense by ID
router.get('/:id', getExpenseById);

// Create fuel expense (Financial Analyst only)
router.post('/', authorize('financial_analyst'), createFuelExpense);

// Update fuel expense (Financial Analyst only)
router.put('/:id', authorize('financial_analyst'), updateFuelExpense);

// Delete fuel expense (Financial Analyst only)
router.delete('/:id', authorize('financial_analyst'), deleteFuelExpense);

export default router;
