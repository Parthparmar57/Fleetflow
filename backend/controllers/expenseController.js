import FuelExpense from '../models/FuelExpense.js';
import Vehicle from '../models/Vehicle.js';
import asyncHandler from '../middleware/asyncHandler.js';
import logger from '../config/logger.js';

export const getFuelExpenses = asyncHandler(async (req, res) => {
  // ✅ SECURITY FIX: Add pagination to prevent data dump attacks
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const { vehicleId } = req.query;
  const query = { organizationId: req.user.organizationId };

  if (vehicleId) query.vehicleId = vehicleId;

  const expenses = await FuelExpense.find(query)
    .limit(limit)
    .skip(skip)
    .populate('vehicleId', 'name licenseplate')
    .populate('tripId', 'tripId status')
    .populate('createdBy', 'name email')
    .sort({ date: -1 });

  const total = await FuelExpense.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({ 
    expenses,
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

export const getExpenseById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // ✅ SECURITY FIX: Add organizationId check
  const expense = await FuelExpense.findOne({
    _id: id,
    organizationId: req.user.organizationId
  })
    .populate('vehicleId')
    .populate('tripId')
    .populate('createdBy', 'name email');

  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  res.status(200).json({ expense });
});

export const createFuelExpense = asyncHandler(async (req, res) => {
  const { vehicleId, tripId, liters, cost, date, location, notes, status, taxDeductible, odometerReading } = req.body;

  if (!vehicleId || !liters || !cost) {
    return res.status(400).json({ error: 'Please provide vehicleId, liters, and cost' });
  }

  // ✅ SECURITY FIX: Verify vehicle belongs to user's organization
  const vehicle = await Vehicle.findOne({
    _id: vehicleId,
    organizationId: req.user.organizationId
  });
  
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  const expense = await FuelExpense.create({
    vehicleId,
    tripId,
    liters,
    cost,
    date: date || new Date(),
    location,
    notes,
    status: status || 'pending',
    taxDeductible: taxDeductible || false,
    odometerReading,
    createdBy: req.user.userId,
    organizationId: req.user.organizationId,
  });

  logger.info('Fuel expense created', {
    expenseId: expense._id,
    vehicleId,
    organizationId: req.user.organizationId,
    userId: req.user.userId
  });

  res.status(201).json({
    message: 'Fuel expense logged successfully',
    expense: await expense.populate('vehicleId'),
  });
});

export const updateFuelExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { liters, cost, date, location, notes, status, taxDeductible, odometerReading } = req.body;

  // ✅ SECURITY FIX: Add organizationId check
  const expense = await FuelExpense.findOneAndUpdate(
    { _id: id, organizationId: req.user.organizationId },
    { liters, cost, date, location, notes, status, taxDeductible, odometerReading },
    { new: true, runValidators: true }
  );

  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  logger.info('Fuel expense updated', {
    expenseId: expense._id,
    organizationId: req.user.organizationId,
    userId: req.user.userId
  });

  res.status(200).json({
    message: 'Expense updated successfully',
    expense,
  });
});

export const deleteFuelExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ✅ SECURITY FIX: Add organizationId check
  const expense = await FuelExpense.findOneAndDelete({
    _id: id,
    organizationId: req.user.organizationId
  });

  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  logger.info('Fuel expense deleted', {
    expenseId: expense._id,
    organizationId: req.user.organizationId,
    userId: req.user.userId
  });

  res.status(200).json({ message: 'Expense deleted successfully' });
});

export const getVehicleExpenseSummary = asyncHandler(async (req, res) => {
  const { vehicleId, month } = req.query;

  if (!vehicleId) {
    return res.status(400).json({ error: 'Please provide vehicleId' });
  }

  // ✅ SECURITY FIX: Verify vehicle belongs to user's organization
  const vehicle = await Vehicle.findOne({
    _id: vehicleId,
    organizationId: req.user.organizationId
  });
  
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  let query = { 
    vehicleId,
    organizationId: req.user.organizationId 
  };

  // Filter by month if provided (format: YYYY-MM)
  if (month) {
    const [year, monthNum] = month.split('-');
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    query.date = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const expenses = await FuelExpense.find(query);

  const summary = {
    totalLiters: expenses.reduce((sum, exp) => sum + exp.liters, 0),
    totalFuelCost: expenses.reduce((sum, exp) => sum + exp.cost, 0),
    averagePricePerLiter: 0,
    count: expenses.length,
  };

  if (summary.totalLiters > 0) {
    summary.averagePricePerLiter = (summary.totalFuelCost / summary.totalLiters).toFixed(2);
  }

  res.status(200).json({ summary, expenses });
});

export const getFleetExpenseSummary = asyncHandler(async (req, res) => {
  const { month } = req.query;

  // ✅ SECURITY FIX: Add organizationId filter
  let query = { organizationId: req.user.organizationId };

  // Filter by month if provided
  if (month) {
    const [year, monthNum] = month.split('-');
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    query.date = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const expenses = await FuelExpense.find(query);

  const summary = {
    totalLiters: expenses.reduce((sum, exp) => sum + exp.liters, 0),
    totalFuelCost: expenses.reduce((sum, exp) => sum + exp.cost, 0),
    vehicleCount: new Set(expenses.map(exp => exp.vehicleId.toString())).size,
    averagePricePerLiter: 0,
    count: expenses.length,
  };

  if (summary.totalLiters > 0) {
    summary.averagePricePerLiter = (summary.totalFuelCost / summary.totalLiters).toFixed(2);
  }

  res.status(200).json(summary);
});
