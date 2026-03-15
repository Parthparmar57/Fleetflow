import Driver from '../models/Driver.js';

export const getDrivers = async (req, res) => {
  try {
    const { status, licenseCategory } = req.query;
    const query = {};

    if (status) query.status = status;
    if (licenseCategory) query.licenseCategory = licenseCategory;

    const drivers = await Driver.find(query).sort({ createdAt: -1 });

    res.status(200).json({ drivers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findById(id);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.status(200).json({ driver });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDriver = async (req, res) => {
  try {
    const { name, email, licenseNumber, licenseExpiry, licenseCategory, phone, licenseIssuedDate } = req.body;

    if (!name || !email || !licenseNumber || !licenseExpiry || !licenseCategory || !phone) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if driver already exists
    const existingDriver = await Driver.findOne({
      $or: [{ email }, { licenseNumber }],
    });
    if (existingDriver) {
      return res.status(409).json({ error: 'Driver with this email or license already exists' });
    }

    const driver = await Driver.create({
      name,
      email,
      licenseNumber: licenseNumber.toUpperCase(),
      licenseExpiry,
      licenseCategory,
      phone,
      licenseIssuedDate,
    });

    res.status(201).json({
      message: 'Driver created successfully',
      driver,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, safetyScore } = req.body;

    const driver = await Driver.findByIdAndUpdate(
      id,
      { status, safetyScore },
      { new: true, runValidators: true }
    );

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.status(200).json({
      message: 'Driver updated successfully',
      driver,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDriverTrips = async (req, res) => {
  try {
    const { id } = req.params;
    const { completedTrip = false } = req.body;

    const updateData = { $inc: { tripCount: 1 } };
    if (completedTrip) {
      updateData.$inc.completedTrips = 1;
    }

    const driver = await Driver.findByIdAndUpdate(id, updateData, { new: true });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.status(200).json({
      message: 'Driver trip count updated',
      driver,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const checkLicenseValidity = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findById(id);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const isValid = driver.licenseExpiry > new Date();

    res.status(200).json({
      driver: {
        id: driver._id,
        name: driver.name,
        licenseExpiry: driver.licenseExpiry,
      },
      isLicenseValid: isValid,
      daysUntilExpiry: isValid
        ? Math.ceil((driver.licenseExpiry - new Date()) / (1000 * 60 * 60 * 24))
        : 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findByIdAndDelete(id);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.status(200).json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getExpiringLicenses = async (req, res) => {
  try {
    const daysThreshold = parseInt(req.query.days) || 30;
    const today = new Date();
    const expiryDate = new Date(today.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

    const drivers = await Driver.find({
      licenseExpiry: {
        $gte: today,
        $lte: expiryDate,
      },
      status: { $ne: 'suspended' },
    }).sort({ licenseExpiry: 1 });

    res.status(200).json({
      threshold: `${daysThreshold} days`,
      count: drivers.length,
      drivers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDriverStats = async (req, res) => {
  try {
    const stats = {
      totalDrivers: await Driver.countDocuments(),
      onDuty: await Driver.countDocuments({ status: 'on_duty' }),
      offDuty: await Driver.countDocuments({ status: 'off_duty' }),
      suspended: await Driver.countDocuments({ status: 'suspended' }),
    };

    res.status(200).json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
