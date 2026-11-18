import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products.product',
      match: { isDeleted: false },
      select: 'title slug brand basePrice originalPrice discountPercentage rating reviewCount images status',
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    // Filter out any null products (e.g. deleted products)
    const validProducts = wishlist.products.filter((p) => p.product != null);

    res.status(200).json({
      success: true,
      count: validProducts.length,
      wishlist: validProducts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    const product = await Product.findById(productId);
    if (!product || product.isDeleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    const alreadyExists = wishlist.products.some(
      (p) => p.product.toString() === productId
    );

    if (!alreadyExists) {
      wishlist.products.unshift({ product: productId, addedAt: new Date() });
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      count: wishlist.products.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (p) => p.product.toString() !== productId
      );
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      count: wishlist?.products?.length || 0,
    });
  } catch (error) {
    next(error);
  }
};
