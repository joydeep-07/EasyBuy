import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    shippingCompany: {
      type: String,
      required: true,
      default: 'BlueDart Express',
    },
    trackingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    trackingUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'LABEL_CREATED',
        'PICKED_UP',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'RETURN_TO_ORIGIN',
        'FAILED',
      ],
      default: 'LABEL_CREATED',
      index: true,
    },
    statusUpdates: [
      {
        status: { type: String, required: true },
        location: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
      },
    ],
    shipmentDate: {
      type: Date,
      default: Date.now,
    },
    estimatedDelivery: {
      type: Date,
    },
    deliveryNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Shipment = mongoose.model('Shipment', shipmentSchema);
export default Shipment;
