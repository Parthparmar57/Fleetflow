import mongoose from 'mongoose';

const fuelExpenseSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Please provide a vehicle'],
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },
    liters: {
      type: Number,
      required: [true, 'Please provide liters'],
      min: 0,
    },
    cost: {
      type: Number,
      required: [true, 'Please provide cost'],
      min: 0,
    },
    pricePerLiter: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    location: {
      type: String,
      trim: true,
    },
    odometerReading: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'audited', 'rejected'],
      default: 'pending',
    },
    taxDeductible: {
      type: Boolean,
      default: false,
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

// Calculate price per liter if not provided
fuelExpenseSchema.pre('validate', function (next) {
  if (!this.pricePerLiter && this.liters > 0 && this.cost) {
    this.pricePerLiter = this.cost / this.liters;
  }
  next();
});

// Index for quick lookups
fuelExpenseSchema.index({ vehicleId: 1 });
fuelExpenseSchema.index({ tripId: 1 });
fuelExpenseSchema.index({ date: 1 });

export default mongoose.model('FuelExpense', fuelExpenseSchema);
