import mongoose from 'mongoose';

const maintenanceLogSchema = new mongoose.Schema(
  {
    // SECURITY: Organization scoping for multi-tenancy
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,  // CRITICAL for query performance
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Please provide a vehicle'],
    },
    serviceType: {
      type: String,
      enum: ['oil_change', 'repair', 'inspection', 'tire_replacement', 'other'],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
    },
    cost: {
      type: Number,
      required: [true, 'Please provide cost'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
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
maintenanceLogSchema.index({ vehicleId: 1 });
maintenanceLogSchema.index({ status: 1 });
maintenanceLogSchema.index({ organizationId: 1, status: 1 });  // Compound index for scoped queries
maintenanceLogSchema.index({ vehicleId: 1, status: 1 });  // For vehicle maintenance queries

// Middleware to update vehicle status
maintenanceLogSchema.post('save', async function (doc) {
  const Vehicle = mongoose.model('Vehicle');
  if (this.status === 'in_progress') {
    await Vehicle.findByIdAndUpdate(this.vehicleId, { status: 'in_shop' });
  } else if (this.status === 'completed') {
    await Vehicle.findByIdAndUpdate(this.vehicleId, { status: 'available' });
  }
});

export default mongoose.model('MaintenanceLog', maintenanceLogSchema);
