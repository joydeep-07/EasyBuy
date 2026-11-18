import Category from '../models/Category.js';
import AttributeDefinition from '../models/AttributeDefinition.js';
import Product from '../models/Product.js';

// @desc    Get all active categories with subcategories
// @route   GET /api/categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name slug')
      .sort({ displayOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category by slug with its subcategories and attribute definitions
// @route   GET /api/categories/:slug
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const subcategories = await Category.find({ parentCategory: category._id, isActive: true });
    const attributes = await AttributeDefinition.find({ category: category._id }).sort({ displayOrder: 1 });

    res.status(200).json({
      success: true,
      category,
      subcategories,
      attributes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create new category or subcategory
// @route   POST /api/admin/categories
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image, icon, parentCategory, isFeatured, displayOrder } = req.body;

    const formattedSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const exists = await Category.findOne({ slug: formattedSlug });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Category slug already exists.' });
    }

    const category = await Category.create({
      name,
      slug: formattedSlug,
      description,
      image,
      icon,
      parentCategory: parentCategory || null,
      isFeatured: !!isFeatured,
      displayOrder: displayOrder || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update category
// @route   PUT /api/admin/categories/:id
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    Object.assign(category, req.body);
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete category
// @route   DELETE /api/admin/categories/:id
export const deleteCategory = async (req, res, next) => {
  try {
    const productCount = await Product.countDocuments({
      $or: [{ category: req.params.id }, { subcategory: req.params.id }],
      isDeleted: false,
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category containing ${productCount} active products. Please reassign or delete products first.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    await AttributeDefinition.deleteMany({ category: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Category and its attribute definitions removed.',
    });
  } catch (error) {
    next(error);
  }
};

// ================= Dynamic Attribute Definition APIs =================

// @desc    Get dynamic attribute definitions for a category
// @route   GET /api/categories/:id/attributes
export const getCategoryAttributes = async (req, res, next) => {
  try {
    const attributes = await AttributeDefinition.find({ category: req.params.id }).sort({ displayOrder: 1 });
    res.status(200).json({
      success: true,
      attributes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Add dynamic attribute to a category
// @route   POST /api/admin/categories/:id/attributes
export const addCategoryAttribute = async (req, res, next) => {
  try {
    const { name, type, unit, predefinedValues, isRequired, isFilterable, allowMultiple, isVariantAttribute } = req.body;

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '_');

    const attr = await AttributeDefinition.create({
      category: req.params.id,
      name,
      slug,
      type: type || 'text',
      unit: unit || '',
      predefinedValues: Array.isArray(predefinedValues) ? predefinedValues : [],
      isRequired: !!isRequired,
      isFilterable: isFilterable !== undefined ? !!isFilterable : true,
      allowMultiple: !!allowMultiple,
      isVariantAttribute: !!isVariantAttribute,
    });

    res.status(201).json({
      success: true,
      message: 'Attribute definition created',
      attribute: attr,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update dynamic attribute
// @route   PUT /api/admin/attributes/:id
export const updateCategoryAttribute = async (req, res, next) => {
  try {
    const attr = await AttributeDefinition.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!attr) {
      return res.status(404).json({ success: false, message: 'Attribute not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Attribute updated successfully',
      attribute: attr,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete dynamic attribute
// @route   DELETE /api/admin/attributes/:id
export const deleteCategoryAttribute = async (req, res, next) => {
  try {
    await AttributeDefinition.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Attribute deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
