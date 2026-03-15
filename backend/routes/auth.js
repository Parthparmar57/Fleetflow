import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  updateSettings,
  exportData,
  deleteAccount,
  getAllUsers,
  deactivateUser,
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication needed)
router.post('/register', register);
router.post('/login', login);

// Protected routes (authentication required)
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);
router.put('/settings', authenticate, updateSettings);
router.get('/export-data', authenticate, exportData);
router.delete('/account', authenticate, deleteAccount);

// Admin routes (authorization required)
router.get('/users', authenticate, authorize('fleet_manager'), getAllUsers);
router.put('/users/:userId/deactivate', authenticate, authorize('fleet_manager'), deactivateUser);

export default router;
