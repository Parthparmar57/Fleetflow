import { body, param, query, validationResult } from 'express-validator';
import logger from '../config/logger.js';

// Validation error handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', {
      errors: errors.array(),
      ip: req.ip,
      path: req.path
    });
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Auth validation rules
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 12 }).withMessage('Password must be at least 12 characters')
    .matches(/[A-Z]/).withMessage('Password must contain uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain special character'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number'),
  body('organizationId')
    .notEmpty().withMessage('Organization ID is required')
    .isMongoId().withMessage('Invalid organization ID'),
  validate
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

export const validateChangePassword = [
  body('oldPassword')
    .notEmpty().withMessage('Old password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 12 }).withMessage('Password must be at least 12 characters')
    .matches(/[A-Z]/).withMessage('Password must contain uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain special character'),
  validate
];

// Vehicle validation rules
export const validateVehicle = [
  body('name')
    .trim()
    .notEmpty().withMessage('Vehicle name is required')
    .isLength({ max: 100 }).withMessage('Name too long'),
  body('licenseplate')
    .trim()
    .notEmpty().withMessage('License plate is required')
    .isLength({ max: 20 }).withMessage('License plate too long')
    .matches(/^[A-Z0-9-]+$/i).withMessage('Invalid license plate format'),
  body('vehicleType')
    .notEmpty().withMessage('Vehicle type is required')
    .isIn(['truck', 'van', 'bike']).withMessage('Invalid vehicle type'),
  body('model')
    .trim()
    .notEmpty().withMessage('Model is required')
    .isLength({ max: 100 }).withMessage('Model too long'),
  body('maxCapacityKg')
    .notEmpty().withMessage('Max capacity is required')
    .isFloat({ min: 0 }).withMessage('Capacity must be positive'),
  body('acquisitionCost')
    .notEmpty().withMessage('Acquisition cost is required')
    .isFloat({ min: 0 }).withMessage('Cost must be positive'),
  body('odometer')
    .optional()
    .isFloat({ min: 0 }).withMessage('Odometer must be positive'),
  body('fuelLevel')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Fuel level must be 0-100'),
  validate
];

// Driver validation rules
export const validateDriver = [
  body('name')
    .trim()
    .notEmpty().withMessage('Driver name is required')
    .isLength({ max: 100 }).withMessage('Name too long'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('licenseNumber')
    .trim()
    .notEmpty().withMessage('License number is required')
    .isLength({ max: 50 }).withMessage('License number too long')
    .matches(/^[A-Z0-9-]+$/i).withMessage('Invalid license number format'),
  body('licenseExpiry')
    .notEmpty().withMessage('License expiry is required')
    .isISO8601().withMessage('Invalid date format'),
  body('licenseCategory')
    .notEmpty().withMessage('License category is required')
    .isIn(['truck', 'van', 'bike']).withMessage('Invalid license category'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number'),
  validate
];

// Trip validation rules
export const validateTrip = [
  body('vehicleId')
    .notEmpty().withMessage('Vehicle ID is required')
    .isMongoId().withMessage('Invalid vehicle ID'),
  body('driverId')
    .notEmpty().withMessage('Driver ID is required')
    .isMongoId().withMessage('Invalid driver ID'),
  body('cargoWeight')
    .notEmpty().withMessage('Cargo weight is required')
    .isFloat({ min: 0 }).withMessage('Cargo weight must be positive'),
  body('originLocation')
    .trim()
    .notEmpty().withMessage('Origin location is required')
    .isLength({ max: 200 }).withMessage('Origin location too long'),
  body('destinationLocation')
    .trim()
    .notEmpty().withMessage('Destination location is required')
    .isLength({ max: 200 }).withMessage('Destination location too long'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes too long'),
  validate
];

// Maintenance validation rules
export const validateMaintenance = [
  body('vehicleId')
    .notEmpty().withMessage('Vehicle ID is required')
    .isMongoId().withMessage('Invalid vehicle ID'),
  body('serviceType')
    .notEmpty().withMessage('Service type is required')
    .isIn(['oil_change', 'repair', 'inspection', 'tire_replacement', 'other'])
    .withMessage('Invalid service type'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description too long'),
  body('cost')
    .notEmpty().withMessage('Cost is required')
    .isFloat({ min: 0 }).withMessage('Cost must be positive'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes too long'),
  validate
];

// Expense validation rules
export const validateExpense = [
  body('vehicleId')
    .notEmpty().withMessage('Vehicle ID is required')
    .isMongoId().withMessage('Invalid vehicle ID'),
  body('liters')
    .notEmpty().withMessage('Liters is required')
    .isFloat({ min: 0 }).withMessage('Liters must be positive'),
  body('cost')
    .notEmpty().withMessage('Cost is required')
    .isFloat({ min: 0 }).withMessage('Cost must be positive'),
  body('date')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Location too long'),
  body('odometerReading')
    .optional()
    .isFloat({ min: 0 }).withMessage('Odometer must be positive'),
  validate
];

// MongoDB ID validation
export const validateMongoId = (paramName = 'id') => [
  param(paramName)
    .isMongoId().withMessage('Invalid ID format'),
  validate
];

// Query validation
export const validatePeriodQuery = [
  query('period')
    .optional()
    .isIn(['today', 'week', 'month', 'all']).withMessage('Invalid period'),
  validate
];

export const validateStatusQuery = [
  query('status')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Status too long'),
  validate
];
