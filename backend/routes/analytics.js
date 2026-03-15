import express from 'express';
import {
  getDashboardMetrics,
  getVehicleAnalytics,
  getFleetAnalytics,
  getDriverPerformance,
  getExpenseTrends,
  getPersonalStats,
} from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes require authentication
router.use(authenticate);

// Get dashboard metrics (all authenticated users)
router.get('/dashboard', getDashboardMetrics);

// Get vehicle analytics (all authenticated users)
router.get('/vehicles/:vehicleId', getVehicleAnalytics);

// Get fleet analytics
router.get('/fleet', getFleetAnalytics);

// Get driver performance
router.get('/drivers/performance', getDriverPerformance);

// Get expense trends (Financial Analyst & Fleet Manager)
router.get('/trends/expenses', authorize('financial_analyst', 'fleet_manager'), getExpenseTrends);

// Get personal analytics for the logged-in user
router.get('/personal', getPersonalStats);

export default router;
