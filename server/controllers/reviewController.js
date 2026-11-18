import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Helper to recalculate product rating & count
const updateProductRatingStats = async (productId) => {
  const reviews = await Review.find({ product: productId, isHidden: false });
  const reviewCount = reviews.length;
  let rating = 0;

  if (reviewCount > 0) {
    const totalScore = reviews.reduce((acc, r) => acc + r.rating, 0);
    rating = parseFloat((totalScore / reviewCount).toFixed(1));
  }

  await Product.findByIdAndUpdate(productId, { rating, reviewCount });
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      isHidden: false,
    })
      .populate('user', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update customer review
// @route   POST /api/reviews
export const addReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment, images = [] } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product, rating (1-5), and comment are required.',
      });
    }

    // Verify if customer has purchased this product
    const verifiedOrder = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      orderStatus: 'Delivered',
    });

    const isVerifiedPurchase = !!verifiedOrder;

    let review = await Review.findOne({ product: productId, user: req.user._id });

    if (review) {
      review.rating = rating;
      review.title = title || review.title;
      review.comment = comment;
      if (images.length > 0) review.images = images;
      review.isVerifiedPurchase = isVerifiedPurchase;
      await review.save();
    } else {
      review = await Review.create({
        product: productId,
        user: req.user._id,
        rating,
        title: title || '',
        comment,
        images,
        isVerifiedPurchase,
      });
    }

    await updateProductRatingStats(productId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);
    await updateProductRatingStats(productId);

    res.status(200).json({
      success: true,
      message: 'Review deleted',
    });
  } catch (error) {
    next(error);
  }
};

// ================= ADMIN REVIEW MODERATION =================

// @desc    Admin: Get all reviews for moderation
// @route   GET /api/admin/reviews
export const adminGetReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'title slug thumbnail images')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Toggle review hidden status
// @route   PATCH /api/admin/reviews/:id/visibility
export const adminToggleReviewVisibility = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isHidden = !review.isHidden;
    await review.save();
    await updateProductRatingStats(review.product);

    res.status(200).json({
      success: true,
      message: `Review ${review.isHidden ? 'hidden' : 'unhidden'} successfully`,
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Permanently delete spam review
// @route   DELETE /api/admin/reviews/:id
export const adminDeleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);
    await updateProductRatingStats(productId);

    res.status(200).json({
      success: true,
      message: 'Review permanently removed',
    });
  } catch (error) {
    next(error);
  }
};
