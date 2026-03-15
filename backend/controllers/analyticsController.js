import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import Driver from '../models/Driver.js';
import FuelExpense from '../models/FuelExpense.js';
import MaintenanceLog from '../models/MaintenanceLog.js';

const getPeriodDates = (period) => {
  const now = new Date();
  let start = new Date();
  let prevStart = new Date();
  let prevEnd = new Date();

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      prevStart.setDate(start.getDate() - 1);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setDate(start.getDate() - 1);
      prevEnd.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      prevStart.setDate(start.getDate() - 7);
      prevEnd = new Date(start);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      prevStart.setMonth(start.getMonth() - 1);
      prevEnd = new Date(start);
      break;
    default: // 'all' or fallback
      return null;
  }

  return { start, prevStart, prevEnd };
};

const calculateChange = (current, previous) => {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const change = ((current - previous) / previous) * 100;
  return (change >= 0 ? '+' : '') + change.toFixed(1) + '%';
};

/**
 * CORE FISCAL LOGIC: Standard Formulas
 */
export const metricsLogic = {
  // KM/L: Higher is better
  calculateFuelEfficiency: (distance, liters) => {
    if (distance <= 0 || liters <= 0) return 0;
    return parseFloat((distance / liters).toFixed(2));
  },
  
  // $/KM: Lower is better
  calculateCostPerKm: (totalCost, distance) => {
    if (distance <= 0) return 0;
    return parseFloat((totalCost / distance).toFixed(2));
  },

  // ROI %: (Revenue - Cost) / Investment * 100
  calculateROI: (tripsCount, operationalCost, acquisitionCost) => {
    if (acquisitionCost <= 0) return 0;
    const ESTIMATED_REVENUE_PER_TRIP = 150; // Dynamic baseline
    const revenue = tripsCount * ESTIMATED_REVENUE_PER_TRIP;
    return parseFloat(((revenue - operationalCost) / acquisitionCost * 100).toFixed(2));
  }
};

export const getDashboardMetrics = async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    const dates = getPeriodDates(period);

    // Baseline current state metrics
    const totalVehicles = await Vehicle.countDocuments({ status: { $ne: 'retired' } });
    const availableVehicles = await Vehicle.countDocuments({ status: 'available' });
    const onTripVehicles = await Vehicle.countDocuments({ status: 'on_trip' });
    const inShopVehicles = await Vehicle.countDocuments({ status: 'in_shop' });
    
    // metrics for current period
    let activeFleet, maintenanceAlerts, pendingCargo;
    let prevActiveFleet = 0, prevMaintenanceAlerts = 0, prevPendingCargo = 0;

    if (!dates) {
      // 'all' logic
      activeFleet = await Vehicle.countDocuments({ status: 'on_trip' });
      maintenanceAlerts = await Vehicle.countDocuments({ status: 'in_shop' });
      pendingCargo = await Trip.countDocuments({ status: 'draft' });
    } else {
      const { start, prevStart, prevEnd } = dates;

      // Active Fleet = Vehicles with trips in period
      const currentTrips = await Trip.distinct('vehicleId', { createdAt: { $gte: start } });
      activeFleet = currentTrips.length;
      const prevTrips = await Trip.distinct('vehicleId', { createdAt: { $gte: prevStart, $lte: prevEnd } });
      prevActiveFleet = prevTrips.length;

      // Maintenance Alerts = Logs in period
      maintenanceAlerts = await MaintenanceLog.countDocuments({ createdAt: { $gte: start } });
      prevMaintenanceAlerts = await MaintenanceLog.countDocuments({ createdAt: { $gte: prevStart, $lte: prevEnd } });

      // Pending Cargo = New drafts in period
      pendingCargo = await Trip.countDocuments({ status: 'draft', createdAt: { $gte: start } });
      prevPendingCargo = await Trip.countDocuments({ status: 'draft', createdAt: { $gte: prevStart, $lte: prevEnd } });
    }

    const utilizationRate = totalVehicles > 0 ? ((activeFleet / totalVehicles) * 100).toFixed(1) : 0;
    
    let prevUtilizationRate = 0;
    if (dates) {
       prevUtilizationRate = totalVehicles > 0 ? ((prevActiveFleet / totalVehicles) * 100) : 0;
    }

    res.status(200).json({
      activeFleet: {
        value: activeFleet,
        change: dates ? calculateChange(activeFleet, prevActiveFleet) : '0%'
      },
      utilizationRate: {
        value: parseFloat(utilizationRate),
        change: dates ? calculateChange(parseFloat(utilizationRate), prevUtilizationRate) : '0%'
      },
      maintenanceAlerts: {
        value: maintenanceAlerts,
        change: dates ? calculateChange(maintenanceAlerts, prevMaintenanceAlerts) : '0%'
      },
      pendingCargo: {
        value: pendingCargo,
        change: dates ? calculateChange(pendingCargo, prevPendingCargo) : '0%'
      },
      statusDistribution: {
        available: availableVehicles,
        onTrip: onTripVehicles,
        inMaintenance: inShopVehicles
      },
      totalVehicles,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVehicleAnalytics = async (req, res) => {
  try {
    const { vehicleId, month } = req.params;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Build date range query if month provided
    let dateQuery = {};
    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);

      dateQuery = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Get completed trips
    const trips = await Trip.find({
      vehicleId,
      status: 'completed',
      ...(month && { completedAt: dateQuery }),
    });

    // Calculate distance
    const totalDistance = trips.reduce((sum, trip) => {
      return sum + (trip.endOdometer - trip.startOdometer);
    }, 0);

    // Get fuel expenses
    const fuelExpenses = await FuelExpense.find({
      vehicleId,
      ...(month && { date: dateQuery }),
    });

    const totalFuelLiters = fuelExpenses.reduce((sum, exp) => sum + exp.liters, 0);
    const totalFuelCost = fuelExpenses.reduce((sum, exp) => sum + exp.cost, 0);

    // Get maintenance expenses
    const maintenanceLogs = await MaintenanceLog.find({
      vehicleId,
      status: 'completed',
      ...(month && { endDate: dateQuery }),
    });

    const totalMaintenanceCost = maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);

    // Calculate metrics using standard formulas
    const fuelEfficiency = metricsLogic.calculateFuelEfficiency(totalDistance, totalFuelLiters);
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost;
    const vehicleROI = metricsLogic.calculateROI(trips.length, totalOperationalCost, vehicle.acquisitionCost);
    const costPerKm = metricsLogic.calculateCostPerKm(totalOperationalCost, totalDistance);

    res.status(200).json({
      vehicle: {
        id: vehicle._id,
        name: vehicle.name,
        licenseplate: vehicle.licenseplate,
      },
      period: month || 'all_time',
      trips: {
        completed: trips.length,
        totalDistance: totalDistance,
      },
      fuel: {
        totalLiters: totalFuelLiters,
        totalCost: totalFuelCost,
        efficiency: parseFloat(fuelEfficiency),
      },
      maintenance: {
        logs: maintenanceLogs.length,
        totalCost: totalMaintenanceCost,
      },
      costs: {
        totalOperational: totalOperationalCost,
        costPerKm: parseFloat(costPerKm),
      },
      roi: parseFloat(vehicleROI),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFleetAnalytics = async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    const dates = getPeriodDates(period);

    let dateQuery = {};
    let prevDateQuery = {};

    if (dates) {
      const { start, prevStart, prevEnd } = dates;
      dateQuery = { $gte: start };
      prevDateQuery = { $gte: prevStart, $lte: prevEnd };
    }

    // Current period data
    const vehicles = await Vehicle.find({ status: { $ne: 'retired' } });
    const trips = await Trip.find({
      status: 'completed',
      ...(dates && { completedAt: dateQuery }),
    });
    const totalDistance = trips.reduce((sum, trip) => sum + (trip.endOdometer - trip.startOdometer), 0);
    const fuelExpenses = await FuelExpense.find({
      ...(dates && { date: dateQuery }),
    });
    const totalFuelLiters = fuelExpenses.reduce((sum, exp) => sum + exp.liters, 0);
    const totalFuelCost = fuelExpenses.reduce((sum, exp) => sum + exp.cost, 0);
    const maintenanceLogs = await MaintenanceLog.find({
      status: 'completed',
      ...(dates && { endDate: dateQuery }),
    });
    const totalMaintenanceCost = maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);
    const totalAcquisitionCost = vehicles.reduce((sum, v) => sum + v.acquisitionCost, 0);
    
    // Calculate current metrics using standard logic
    const fuelEfficiency = metricsLogic.calculateFuelEfficiency(totalDistance, totalFuelLiters);
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost;
    const costPerKm = metricsLogic.calculateCostPerKm(totalOperationalCost, totalDistance);

    // Previous period data (for change calculation)
    let prevOperationalCost = 0, prevCostPerKm = 0, prevFuelEfficiency = 0, prevFuelCost = 0;

    if (dates) {
      const prevTrips = await Trip.find({ status: 'completed', completedAt: prevDateQuery });
      const prevDistance = prevTrips.reduce((sum, trip) => sum + (trip.endOdometer - trip.startOdometer), 0);
      const prevFuel = await FuelExpense.find({ date: prevDateQuery });
      const prevLiters = prevFuel.reduce((sum, exp) => sum + exp.liters, 0);
      prevFuelCost = prevFuel.reduce((sum, exp) => sum + exp.cost, 0);
      const prevMaint = await MaintenanceLog.find({ status: 'completed', endDate: prevDateQuery });
      const prevMaintCost = prevMaint.reduce((sum, log) => sum + log.cost, 0);

      prevFuelEfficiency = metricsLogic.calculateFuelEfficiency(prevDistance, prevLiters);
      prevOperationalCost = prevFuelCost + prevMaintCost;
      prevCostPerKm = metricsLogic.calculateCostPerKm(prevOperationalCost, prevDistance);
    }

    res.status(200).json({
      period: period,
      fleet: {
        totalVehicles: vehicles.length,
        activeVehicles: vehicles.filter(v => v.status === 'on_trip').length,
      },
      trips: {
        completed: trips.length,
        totalDistance: totalDistance,
        averageDistance: trips.length > 0 ? (totalDistance / trips.length).toFixed(2) : 0,
      },
      fuel: {
        totalLiters: totalFuelLiters,
        totalCost: totalFuelCost,
        efficiency: parseFloat(fuelEfficiency.toFixed(2)),
        change: dates ? calculateChange(fuelEfficiency, prevFuelEfficiency) : '0%',
        costChange: dates ? calculateChange(totalFuelCost, prevFuelCost) : '0%'
      },
      maintenance: {
        logs: maintenanceLogs.length,
        totalCost: totalMaintenanceCost,
      },
      costs: {
        totalOperational: totalOperationalCost,
        costPerKm: parseFloat(costPerKm.toFixed(2)),
        totalAcquisitionCost: totalAcquisitionCost,
        operationalChange: dates ? calculateChange(totalOperationalCost, prevOperationalCost) : '0%',
        costPerKmChange: dates ? calculateChange(costPerKm, prevCostPerKm) : '0%'
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDriverPerformance = async (req, res) => {
  try {
    const drivers = await Driver.find();

    const performance = await Promise.all(
      drivers.map(async (driver) => {
        const trips = await Trip.find({
          driverId: driver._id,
          status: 'completed',
        });

        const completionRate = driver.tripCount > 0 ? ((driver.completedTrips / driver.tripCount) * 100).toFixed(2) : 0;

        return {
          id: driver._id,
          name: driver.name,
          licenseNumber: driver.licenseNumber,
          licenseExpiry: driver.licenseExpiry,
          status: driver.status,
          safetyScore: driver.safetyScore,
          tripCount: driver.tripCount,
          completedTrips: driver.completedTrips,
          completionRate: parseFloat(completionRate),
        };
      })
    );

    res.status(200).json({ drivers: performance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getExpenseTrends = async (req, res) => {
  try {
    const { months = 12 } = req.query;

    const trends = [];
    for (let i = months - 1; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - i);

      const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

      const fuelCost = await FuelExpense.aggregate([
        {
          $match: {
            date: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$cost' },
          },
        },
      ]);

      const maintenanceCost = await MaintenanceLog.aggregate([
        {
          $match: {
            endDate: { $gte: monthStart, $lte: monthEnd },
            status: 'completed',
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$cost' },
          },
        },
      ]);

      trends.push({
        month: targetDate.toISOString().slice(0, 7),
        fuelCost: fuelCost[0]?.total || 0,
        maintenanceCost: maintenanceCost[0]?.total || 0,
        totalCost: (fuelCost[0]?.total || 0) + (maintenanceCost[0]?.total || 0),
      });
    }

    res.status(200).json({ trends });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPersonalStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Trips created by this user
    const userTrips = await Trip.find({ createdBy: userId });
    
    // 2. Status distribution of user's trips
    const statusDistribution = {
      draft: 0,
      dispatched: 0,
      completed: 0,
      cancelled: 0
    };
    
    let totalCargoWeight = 0;
    userTrips.forEach(trip => {
      statusDistribution[trip.status] = (statusDistribution[trip.status] || 0) + 1;
      totalCargoWeight += trip.cargoWeight || 0;
    });

    // 3. Vehicles created by this user
    const vehiclesCreated = await Vehicle.countDocuments({ createdBy: userId });

    res.status(200).json({
      totalTrips: userTrips.length,
      statusDistribution,
      totalCargoWeight,
      vehiclesCreated,
      recentTrips: userTrips.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};