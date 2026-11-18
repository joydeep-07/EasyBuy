import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    // Attributes like { Colour: 'Black', Size: 'M', Flavour: 'Chocolate', Storage: '128GB' }
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      index: true,
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    weight: {
      type: Number, // in grams or kg
      default: 0,
    },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for available stock (stock - reservedStock)
productVariantSchema.virtual('availableStock').get(function () {
  return Math.max(0, this.stock - (this.reservedStock || 0));
});

export const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);
export default ProductVariant;
