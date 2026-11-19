import Category from '../models/Category.js';
import AttributeDefinition from '../models/AttributeDefinition.js';
import Product from '../models/Product.js';

// @desc    Get all categories with subcategories & product counts
// @route   GET /api/categories
export const getCategories = async (req, res, next) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const categories = await Category.find(filter)
      .populate('parentCategory', 'name slug')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const categoryIds = categories.map((c) => c._id);

    // Compute associated product counts for all returned categories
    const counts = await Product.aggregate([
      {
        $match: {
          $or: [
            { category: { $in: categoryIds } },
            { subcategory: { $in: categoryIds } },
          ],
          isDeleted: false,
        },
      },
      {
        $facet: {
          byCategory: [
            { $match: { category: { $in: categoryIds } } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
          ],
          bySubcategory: [
            { $match: { subcategory: { $in: categoryIds } } },
            { $group: { _id: '$subcategory', count: { $sum: 1 } } },
          ],
        },
      },
    ]);

    const countMap = {};
    if (counts && counts.length > 0) {
      (counts[0].byCategory || []).forEach((item) => {
        if (item._id) {
          const idStr = item._id.toString();
          countMap[idStr] = (countMap[idStr] || 0) + item.count;
        }
      });
      (counts[0].bySubcategory || []).forEach((item) => {
        if (item._id) {
          const idStr = item._id.toString();
          // Only add subcategory count if not already counted as main category
          if (!countMap[idStr]) {
            countMap[idStr] = item.count;
          }
        }
      });
    }

    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      productCount: countMap[cat._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      categories: categoriesWithCount,
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
// @route   POST /api/categories/admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image, icon, parentCategory, isFeatured, isActive, displayOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const trimmedName = name.trim();
    const formattedSlug = (slug || trimmedName)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!formattedSlug) {
      return res.status(400).json({ success: false, message: 'Invalid category slug generated.' });
    }

    // Check duplicate name or slug
    const duplicate = await Category.findOne({
      $or: [
        { slug: formattedSlug },
        { name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
      ],
    });

    if (duplicate) {
      if (duplicate.slug === formattedSlug) {
        return res.status(400).json({ success: false, message: `Category slug "${formattedSlug}" already exists.` });
      }
      return res.status(400).json({ success: false, message: `Category name "${trimmedName}" already exists.` });
    }

    const category = await Category.create({
      name: trimmedName,
      slug: formattedSlug,
      description: description ? description.trim() : '',
      image: image ? image.trim() : '',
      icon: icon ? icon.trim() : '',
      parentCategory: parentCategory || null,
      isFeatured: !!isFeatured,
      isActive: isActive !== undefined ? !!isActive : true,
      displayOrder: Number(displayOrder) || 0,
    });

    res.status(201).json({
      success: true,
      message: `Category "${category.name}" created successfully`,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update category
// @route   PUT /api/categories/admin/:id
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const { name, slug, description, image, icon, parentCategory, isFeatured, isActive, displayOrder } = req.body;

    if (name && name.trim()) {
      const trimmedName = name.trim();
      const duplicateName = await Category.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });
      if (duplicateName) {
        return res.status(400).json({ success: false, message: `Category name "${trimmedName}" is already taken.` });
      }
      category.name = trimmedName;
    }

    if (slug || name) {
      const candidateSlug = slug || category.slug || name;
      const formattedSlug = candidateSlug
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      if (formattedSlug) {
        const duplicateSlug = await Category.findOne({
          _id: { $ne: req.params.id },
          slug: formattedSlug,
        });
        if (duplicateSlug) {
          return res.status(400).json({ success: false, message: `Category slug "${formattedSlug}" is already taken.` });
        }
        category.slug = formattedSlug;
      }
    }

    if (description !== undefined) category.description = description ? description.trim() : '';
    if (image !== undefined) category.image = image ? image.trim() : '';
    if (icon !== undefined) category.icon = icon ? icon.trim() : '';
    if (parentCategory !== undefined) {
      // Prevent setting parent to itself
      if (parentCategory && parentCategory.toString() === req.params.id) {
        return res.status(400).json({ success: false, message: 'A category cannot be its own parent category.' });
      }
      category.parentCategory = parentCategory || null;
    }
    if (isFeatured !== undefined) category.isFeatured = !!isFeatured;
    if (isActive !== undefined) category.isActive = !!isActive;
    if (displayOrder !== undefined) category.displayOrder = Number(displayOrder) || 0;

    await category.save();

    res.status(200).json({
      success: true,
      message: `Category "${category.name}" updated successfully`,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete category (with optional product reassignment)
// @route   DELETE /api/categories/admin/:id
export const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const reassignTo = req.body?.reassignTo || req.query?.reassignTo;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const productCount = await Product.countDocuments({
      $or: [{ category: categoryId }, { subcategory: categoryId }],
      isDeleted: false,
    });

    if (productCount > 0) {
      if (reassignTo) {
        if (reassignTo.toString() === categoryId.toString()) {
          return res.status(400).json({
            success: false,
            message: 'Target reassignment category cannot be the category being deleted.',
          });
        }
        const targetCategory = await Category.findById(reassignTo);
        if (!targetCategory) {
          return res.status(404).json({
            success: false,
            message: 'Target category for reassignment was not found.',
          });
        }

        // Reassign products to the target category
        await Product.updateMany(
          { category: categoryId, isDeleted: false },
          { $set: { category: targetCategory._id } }
        );
        await Product.updateMany(
          { subcategory: categoryId, isDeleted: false },
          { $set: { subcategory: null } }
        );
      } else {
        return res.status(400).json({
          success: false,
          hasProducts: true,
          productCount,
          message: `Cannot delete category "${category.name}". It is currently assigned to ${productCount} active product(s). Please reassign them to another category first.`,
        });
      }
    }

    // Unlink any subcategories that had this as parent
    await Category.updateMany(
      { parentCategory: categoryId },
      { $set: { parentCategory: null } }
    );

    await Category.findByIdAndDelete(categoryId);
    await AttributeDefinition.deleteMany({ category: categoryId });

    res.status(200).json({
      success: true,
      message: `Category "${category.name}" and associated attributes removed successfully.`,
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
