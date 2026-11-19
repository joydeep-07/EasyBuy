import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    default: '',
  },
  sku: {
    type: String,
    default: '',
  },
  selectedAttributes: {
    type: Map,
    of: String,
    default: {},
  },
  image: {
    type: String,
    default: '',
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    trackingId: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    addressSnapshot: {
      fullName: String,
      phoneNumber: String,
      houseBuilding: String,
      street: String,
      locality: String,
      landmark: String,
      city: String,
      state: String,
      pincode: String,
      addressType: String,
    },
    paymentMethod: {
      type: String,
      enum: ['COD'],
      required: true,
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    paymentDetails: {
      paidAt: Date,
      collectedBy: String,
      notes: String,
      refundId: String,
      failureReason: String,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    appliedCoupon: {
      code: String,
      discountType: String,
      discountValue: Number,
      discountAmount: Number,
    },
    orderStatus: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Processing',
        'Packed',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Return Requested',
        'Returned',
        'Refund Initiated',
        'Refunded',
      ],
      default: 'Pending',
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        comment: { type: String, default: '' },
        updatedBy: { type: String, default: 'System' },
      },
    ],
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipment',
    },
    trackingInfo: {
      shippingCompany: String,
      trackingId: String,
      trackingUrl: String,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    estimatedDelivery: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model('Order', orderSchema);
export default Order;
