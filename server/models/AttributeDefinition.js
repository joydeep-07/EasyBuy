import mongoose from 'mongoose';

const attributeDefinitionSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ['text', 'number', 'boolean', 'dropdown', 'multi-select', 'date', 'measurement', 'range'],
      default: 'text',
    },
    unit: {
      type: String,
      default: '', // e.g. "GB", "inch", "kg", "months"
    },
    predefinedValues: {
      type: [String],
      default: [],
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    isFilterable: {
      type: Boolean,
      default: true,
    },
    allowMultiple: {
      type: Boolean,
      default: false,
    },
    isVariantAttribute: {
      type: Boolean,
      default: false, // Used for generating variant combinations like size, color, storage, flavor
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

attributeDefinitionSchema.index({ category: 1, slug: 1 }, { unique: true });

export const AttributeDefinition = mongoose.model('AttributeDefinition', attributeDefinitionSchema);
export default AttributeDefinition;
