import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    highlights: {
      type: [String],
      default: [],
    },
    specifications: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    dynamicAttributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
      validate: [(v) => v.length > 0, 'At least one image is required'],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price must be non-negative'],
      index: true,
    },
    originalPrice: {
      type: Number,
      default: function () {
        return this.basePrice;
      },
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    hasVariants: {
      type: Boolean,
      default: false,
      index: true,
    },
    seller: {
      name: { type: String, default: 'EasyBuy Retail' },
      rating: { type: Number, default: 4.8 },
      policy: { type: String, default: '7 Days Replacement Policy' },
    },
    warranty: {
      type: String,
      default: '1 Year Manufacturer Warranty',
    },
    returnPolicy: {
      type: String,
      default: '7 Days Returnable if unopened/defective',
    },
    status: {
      type: String,
      enum: [
        'AVAILABLE',
        'SOLD_OUT',
        'TEMPORARILY_UNAVAILABLE',
        'COMING_SOON',
        'DISABLED',
        'ARCHIVED',
      ],
      default: 'AVAILABLE',
      index: true,
    },
    availabilityReason: {
      type: String,
      default: '',
    },
    restrictedPincodes: [
      {
        pincode: { type: String, required: true },
        reason: { type: String, default: 'Not deliverable to this PIN code' },
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
    metaTitle: {
      type: String,
      default: '',
    },
    metaDescription: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for variants
productSchema.virtual('variants', {
  ref: 'ProductVariant',
  localField: '_id',
  foreignField: 'product',
});

// Text index for search
productSchema.index(
  {
    title: 'text',
    brand: 'text',
    description: 'text',
    highlights: 'text',
  },
  {
    weights: {
      title: 10,
      brand: 5,
      highlights: 3,
      description: 1,
    },
    name: 'ProductTextIndex',
  }
);

export const Product = mongoose.model('Product', productSchema);
export default Product;
