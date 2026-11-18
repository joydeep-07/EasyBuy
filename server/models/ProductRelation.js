import mongoose from 'mongoose';

const productRelationSchema = new mongoose.Schema(
  {
    productA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    productB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    relationType: {
      type: String,
      enum: ['FREQUENTLY_BOUGHT_TOGETHER', 'CUSTOMERS_ALSO_VIEWED', 'SIMILAR'],
      required: true,
      index: true,
    },
    strength: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

productRelationSchema.index({ productA: 1, productB: 1, relationType: 1 }, { unique: true });

export const ProductRelation = mongoose.model('ProductRelation', productRelationSchema);
export default ProductRelation;
