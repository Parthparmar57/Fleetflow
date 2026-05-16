import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    // SECURITY: Organization scoping for multi-tenancy
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,  // CRITICAL for query performance
    },
    name: {
      type: String,
      required: [true, 'Please provide driver name'],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please provide license number'],
      unique: true,
      uppercase: true,
    },
    licenseExpiry: {
      type: Date,
      required: [true, 'Please provide license expiry date'],
    },
    licenseCategory: {
      type: String,
      enum: ['truck', 'van', 'bike'],
      required: true,
    },
    safetyScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['on_duty', 'off_duty', 'suspended'],
      default: 'off_duty',
    },
    tripCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedTrips: {
      type: Number,
      default: 0,
      min: 0,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    licenseIssuedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to check if license is valid
driverSchema.virtual('isLicenseValid').get(function () {
  return this.licenseExpiry > new Date();
});

// Index for quick lookups
driverSchema.index({ licenseNumber: 1 });
driverSchema.index({ status: 1 });
driverSchema.index({ licenseExpiry: 1 });
driverSchema.index({ organizationId: 1, status: 1 });  // Compound index for scoped queries

export default mongoose.model('Driver', driverSchema);
