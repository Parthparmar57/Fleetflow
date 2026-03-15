import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a vehicle name'],
      trim: true,
    },
    licenseplate: {
      type: String,
      required: [true, 'Please provide a license plate'],
      unique: true,
      uppercase: true,
    },
    vehicleType: {
      type: String,
      enum: ['truck', 'van', 'bike'],
      required: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    maxCapacityKg: {
      type: Number,
      required: [true, 'Please provide max capacity'],
      min: 0,
    },
    odometer: {
      type: Number,
      default: 0,
      min: 0,
    },
    fuelLevel: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['available', 'on_trip', 'in_shop', 'retired'],
      default: 'available',
    },
    acquisitionCost: {
      type: Number,
      required: true,
      min: 0,
    },
    maintenanceHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MaintenanceLog',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookups
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ vehicleType: 1 });
vehicleSchema.index({ licenseplate: 1 });

export default mongoose.model('Vehicle', vehicleSchema);
