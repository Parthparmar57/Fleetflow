import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    // SECURITY: Organization scoping for multi-tenancy
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,  // CRITICAL for query performance
    },
    tripId: {
      type: String,
      unique: true,
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Please provide a vehicle'],
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Please provide a driver'],
    },
    cargoWeight: {
      type: Number,
      required: [true, 'Please provide cargo weight'],
      min: 0,
    },
    originLocation: {
      type: String,
      required: [true, 'Please provide origin location'],
      trim: true,
    },
    destinationLocation: {
      type: String,
      required: [true, 'Please provide destination location'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'dispatched', 'completed', 'cancelled'],
      default: 'draft',
    },
    notes: {
      type: String,
      trim: true,
    },
    assignedAt: {
      type: Date,
    },
    dispatchedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    startOdometer: {
      type: Number,
      min: 0,
    },
    endOdometer: {
      type: Number,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    currentLocation: {
      lat: Number,
      lng: Number,
      timestamp: Date,
      address: String,
    },
    trackingHistory: [
      {
        lat: Number,
        lng: Number,
        timestamp: { type: Date, default: Date.now },
        address: String,
      }
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual to calculate distance
tripSchema.virtual('distance').get(function () {
  if (this.startOdometer && this.endOdometer) {
    return this.endOdometer - this.startOdometer;
  }
  return 0;
});

// Index for quick lookups
tripSchema.index({ status: 1 });
tripSchema.index({ vehicleId: 1 });
tripSchema.index({ driverId: 1 });
tripSchema.index({ organizationId: 1, status: 1 });  // Compound index for scoped queries
tripSchema.index({ createdBy: 1 });

// Generate unique tripId before validation
tripSchema.pre('validate', async function (next) {
  if (this.isNew && !this.tripId) {
    const count = await mongoose.model('Trip').countDocuments();
    this.tripId = `TRIP-${Date.now()}-${count + 1}`;
  }
  next();
});

export default mongoose.model('Trip', tripSchema);
