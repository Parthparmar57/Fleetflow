import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide organization name'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'premium', 'enterprise'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'suspended', 'cancelled'],
        default: 'active',
      },
      expiresAt: Date,
    },
    settings: {
      maxVehicles: { type: Number, default: 10 },
      maxDrivers: { type: Number, default: 10 },
      maxUsers: { type: Number, default: 5 },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookups
organizationSchema.index({ slug: 1 });
organizationSchema.index({ active: 1 });

export default mongoose.model('Organization', organizationSchema);
