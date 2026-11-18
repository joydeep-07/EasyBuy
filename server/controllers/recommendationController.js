import recommendationService from '../services/recommendationService.js';

// @desc    Get personalized product recommendations
// @route   GET /api/recommendations
export const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user?._id || null;
    const limit = parseInt(req.query.limit || 8, 10);

    const recommended = await recommendationService.getPersonalizedRecommendations(userId, limit);

    res.status(200).json({
      success: true,
      count: recommended.length,
      recommendations: recommended,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related products for product details page
// @route   GET /api/products/:id/related
export const getProductRelated = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [frequentlyBought, customersAlsoViewed, similar] = await Promise.all([
      recommendationService.getFrequentlyBoughtTogether(id, 4),
      recommendationService.getCustomersAlsoViewed(id, 6),
      recommendationService.getSimilarProducts(id, 6),
    ]);

    res.status(200).json({
      success: true,
      frequentlyBoughtTogether: frequentlyBought,
      customersAlsoViewed,
      similarProducts: similar,
    });
  } catch (error) {
    next(error);
  }
};
