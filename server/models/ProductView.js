import mongoose from 'mongoose';

const productViewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Expire view logs after 60 days
productViewSchema.index({ viewedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 60 });

export const ProductView = mongoose.model('ProductView', productViewSchema);
export default ProductView;
