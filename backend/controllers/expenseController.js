import FuelExpense from '../models/FuelExpense.js';

export const getFuelExpenses = async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const query = {};

    if (vehicleId) query.vehicleId = vehicleId;

    const expenses = await FuelExpense.find(query)
      .populate('vehicleId', 'name licenseplate')
      .populate('tripId', 'tripId status')
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    res.status(200).json({ expenses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await FuelExpense.findById(id)
      .populate('vehicleId')
      .populate('tripId')
      .populate('createdBy', 'name email');

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.status(200).json({ expense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createFuelExpense = async (req, res) => {
  try {
    const { vehicleId, tripId, liters, cost, date, location, notes, status, taxDeductible, odometerReading } = req.body;

    if (!vehicleId || !liters || !cost) {
      return res.status(400).json({ error: 'Please provide vehicleId, liters, and cost' });
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
    });

    res.status(201).json({
      message: 'Fuel expense logged successfully',
      expense: await expense.populate('vehicleId'),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFuelExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { liters, cost, date, location, notes, status, taxDeductible, odometerReading } = req.body;

    const expense = await FuelExpense.findByIdAndUpdate(
      id,
      { liters, cost, date, location, notes, status, taxDeductible, odometerReading },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.status(200).json({
      message: 'Expense updated successfully',
      expense,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFuelExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await FuelExpense.findByIdAndDelete(id);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVehicleExpenseSummary = async (req, res) => {
  try {
    const { vehicleId, month } = req.query;

    if (!vehicleId) {
      return res.status(400).json({ error: 'Please provide vehicleId' });
    }

    let query = { vehicleId };

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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFleetExpenseSummary = async (req, res) => {
  try {
    const { month } = req.query;

    let query = {};

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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
