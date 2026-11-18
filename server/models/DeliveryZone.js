import mongoose from 'mongoose';

const deliveryZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: '',
    },
    pincode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    isServiceable: {
      type: Boolean,
      default: true,
      index: true,
    },
    estimatedDeliveryDays: {
      type: Number,
      default: 3,
      min: 1,
    },
    deliveryFee: {
      type: Number,
      default: 40,
      min: 0,
    },
    isCodAvailable: {
      type: Boolean,
      default: true,
    },
    isExpressAvailable: {
      type: Boolean,
      default: false,
    },
    expressDeliveryFee: {
      type: Number,
      default: 99,
    },
  },
  {
    timestamps: true,
  }
);

export const DeliveryZone = mongoose.model('DeliveryZone', deliveryZoneSchema);
export default DeliveryZone;
