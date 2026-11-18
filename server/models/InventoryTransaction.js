import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema(
  {
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      default: null,
    },
    sku: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'ADD',
        'REDUCE',
        'ORDER_RESERVE',
        'ORDER_RELEASE',
        'ORDER_FULFILL',
        'RETURN',
        'DAMAGE',
        'ADJUSTMENT',
      ],
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    performedBy: {
      type: String,
      default: 'System',
    },
  },
  {
    timestamps: true,
  }
);

export const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
export default InventoryTransaction;
