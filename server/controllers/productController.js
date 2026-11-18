import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import Inventory from '../models/Inventory.js';
import Category from '../models/Category.js';
import DeliveryZone from '../models/DeliveryZone.js';
import { recommendationService } from '../services/recommendationService.js';

// @desc    Get all products with filtering, search, sorting & pagination
// @route   GET /api/products
export const getProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      isFeatured,
      isTrending,
      isBestSeller,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isDeleted: false, status: { $ne: 'ARCHIVED' } };

    // Search keyword
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Category filter
    if (category) {
      // Find category by slug or id
      const catObj = await Category.findOne({
        $or: [{ slug: category }, { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }],
      });
      if (catObj) {
        query.category = catObj._id;
      }
    }

    // Subcategory filter
    if (subcategory) {
      const subObj = await Category.findOne({
        $or: [{ slug: subcategory }, { _id: subcategory.match(/^[0-9a-fA-F]{24}$/) ? subcategory : null }],
      });
      if (subObj) {
        query.subcategory = subObj._id;
      }
    }

    // Brand filter
    if (brand) {
      const brands = brand.split(',').map((b) => new RegExp(b.trim(), 'i'));
      query.brand = { $in: brands };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Availability filter
    if (inStock === 'true') {
      query.status = 'AVAILABLE';
    }

    if (isFeatured === 'true') query.isFeatured = true;
    if (isTrending === 'true') query.isTrending = true;
    if (isBestSeller === 'true') query.isBestSeller = true;

    // Sorting
    let sortOptions = {};
    switch (sort) {
      case 'price_asc':
        sortOptions = { basePrice: 1 };
        break;
      case 'price_desc':
        sortOptions = { basePrice: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1, reviewCount: -1 };
        break;
      case 'popularity':
      case 'best_selling':
        sortOptions = { salesCount: -1, viewCount: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    // Also collect distinct available brands for frontend filter sidebar
    const availableBrands = await Product.distinct('brand', { isDeleted: false, status: { $ne: 'ARCHIVED' } });

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products,
      availableBrands,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug or id with variants and location checker
// @route   GET /api/products/:slug
export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { pincode } = req.query;

    const product = await Product.findOne({
      $or: [{ slug }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }],
      isDeleted: false,
    })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Retrieve variants
    const variants = await ProductVariant.find({ product: product._id, status: 'ACTIVE' });

    // Location Serviceability Check
    let locationStatus = {
      isServiceable: true,
      message: 'Delivery available to most locations',
      estimatedDays: 3,
      deliveryCharge: 0,
      isCodAvailable: true,
    };

    if (pincode) {
      // Check if pincode is restricted by this product specifically
      const isRestrictedByProduct = product.restrictedPincodes?.find((rp) => rp.pincode === pincode);
      if (isRestrictedByProduct) {
        locationStatus = {
          isServiceable: false,
          status: 'NOT_DELIVERABLE_TO_PINCODE',
          message: isRestrictedByProduct.reason || 'Not deliverable to this PIN code for this item',
          pincode,
        };
      } else {
        const zone = await DeliveryZone.findOne({ pincode });
        if (zone) {
          locationStatus = {
            isServiceable: zone.isServiceable,
            status: zone.isServiceable ? 'AVAILABLE' : 'UNAVAILABLE_AT_LOCATION',
            message: zone.isServiceable
              ? `Delivery to ${zone.city}, ${zone.state} in ${zone.estimatedDeliveryDays} days`
              : 'Unavailable at your location',
            estimatedDays: zone.estimatedDeliveryDays,
            deliveryCharge: zone.deliveryFee,
            isCodAvailable: zone.isCodAvailable,
            isExpressAvailable: zone.isExpressAvailable,
            expressFee: zone.expressDeliveryFee,
            pincode,
          };
        } else {
          // Default standard delivery for valid 6-digit Indian PIN
          locationStatus = {
            isServiceable: true,
            status: 'AVAILABLE',
            message: 'Standard delivery in 3-5 business days',
            estimatedDays: 4,
            deliveryCharge: 40,
            isCodAvailable: true,
            pincode,
          };
        }
      }
    }

    // Log view for recommendation analytics (non-blocking)
    recommendationService.recordView(
      product._id,
      req.user?._id || null,
      req.cookies?.sessionId || req.headers['x-session-id'] || 'guest'
    );

    res.status(200).json({
      success: true,
      product,
      variants,
      locationStatus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search Autocomplete & Suggestions
// @route   GET /api/products/search/suggest
export const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(200).json({ success: true, suggestions: [] });
    }

    const regex = new RegExp(q.trim(), 'i');

    const [products, brands, categories] = await Promise.all([
      Product.find({ title: regex, isDeleted: false }).select('title slug thumbnail basePrice').limit(5),
      Product.distinct('brand', { brand: regex, isDeleted: false }),
      Category.find({ name: regex, isActive: true }).select('name slug').limit(3),
    ]);

    res.status(200).json({
      success: true,
      products,
      brands: brands.slice(0, 4),
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// ================= ADMIN PRODUCT MANAGEMENT =================

// @desc    Admin: Create new product with optional variants
// @route   POST /api/admin/products
export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      brand,
      category,
      subcategory,
      description,
      highlights,
      specifications,
      dynamicAttributes,
      images,
      basePrice,
      originalPrice,
      discountPercentage,
      status,
      availabilityReason,
      restrictedPincodes,
      hasVariants,
      variants,
      initialStock,
    } = req.body;

    const formattedSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await Product.findOne({ slug: formattedSlug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product slug already exists' });
    }

    const product = await Product.create({
      title,
      slug: formattedSlug,
      brand,
      category,
      subcategory: subcategory || null,
      description,
      highlights: highlights || [],
      specifications: specifications || [],
      dynamicAttributes: dynamicAttributes || {},
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
      thumbnail: Array.isArray(images) && images.length > 0 ? images[0] : '',
      basePrice,
      originalPrice: originalPrice || basePrice,
      discountPercentage: discountPercentage || 0,
      status: status || 'AVAILABLE',
      availabilityReason: availabilityReason || '',
      restrictedPincodes: restrictedPincodes || [],
      hasVariants: !!hasVariants,
    });

    // If variants provided, create them
    if (hasVariants && Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        const variant = await ProductVariant.create({
          product: product._id,
          sku: v.sku,
          title: v.title || `${product.title} - ${v.sku}`,
          attributes: v.attributes || {},
          price: v.price || product.basePrice,
          originalPrice: v.originalPrice || product.originalPrice,
          stock: v.stock || 0,
          images: v.images && v.images.length > 0 ? v.images : product.images,
          weight: v.weight || 0,
          dimensions: v.dimensions || {},
          isAvailable: v.isAvailable !== undefined ? v.isAvailable : true,
        });

        // Initialize Inventory record
        await Inventory.create({
          product: product._id,
          variant: variant._id,
          sku: variant.sku,
          currentStock: variant.stock,
          reservedStock: 0,
          lowStockThreshold: 5,
        });
      }
    } else {
      // Create base inventory record
      await Inventory.create({
        product: product._id,
        sku: `PROD-${product._id.toString().slice(-6).toUpperCase()}`,
        currentStock: initialStock !== undefined ? initialStock : 25,
        reservedStock: 0,
        lowStockThreshold: 5,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update product details
// @route   PUT /api/admin/products/:id
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    Object.assign(product, req.body);
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update product availability status & reason
// @route   PATCH /api/admin/products/:id/availability
export const updateProductAvailability = async (req, res, next) => {
  try {
    const { status, availabilityReason, restrictedPincodes } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (status) product.status = status;
    if (availabilityReason !== undefined) product.availabilityReason = availabilityReason;
    if (restrictedPincodes !== undefined) product.restrictedPincodes = restrictedPincodes;

    await product.save();

    res.status(200).json({
      success: true,
      message: `Product availability updated to ${product.status}`,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete product (soft-delete if has orders)
// @route   DELETE /api/admin/products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isDeleted = true;
    product.deletedAt = new Date();
    product.status = 'ARCHIVED';
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product archived successfully',
    });
  } catch (error) {
    next(error);
  }
};
