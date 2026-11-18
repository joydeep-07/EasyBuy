import Product from '../models/Product.js';
import Order from '../models/Order.js';
import ProductView from '../models/ProductView.js';
import ProductRelation from '../models/ProductRelation.js';
import Wishlist from '../models/Wishlist.js';

class RecommendationService {
  /**
   * Frequently Bought Together:
   * Finds products that have appeared in the same order as productId.
   * If not enough order data, falls back to complementary items in same/related category.
   */
  async getFrequentlyBoughtTogether(productId, limit = 4) {
    try {
      // 1. Look up explicit relations in DB
      const relations = await ProductRelation.find({
        productA: productId,
        relationType: 'FREQUENTLY_BOUGHT_TOGETHER',
      })
        .sort({ strength: -1 })
        .limit(limit)
        .populate('productB');

      if (relations.length > 0) {
        return relations.map((r) => r.productB).filter(Boolean);
      }

      // 2. Query historical orders containing this product
      const orders = await Order.find({
        'items.product': productId,
        orderStatus: { $ne: 'Cancelled' },
      }).limit(50);

      const productFrequency = new Map();

      orders.forEach((order) => {
        order.items.forEach((item) => {
          const idStr = item.product.toString();
          if (idStr !== productId.toString()) {
            productFrequency.set(idStr, (productFrequency.get(idStr) || 0) + 1);
          }
        });
      });

      if (productFrequency.size > 0) {
        const sortedIds = Array.from(productFrequency.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(([id]) => id);

        const products = await Product.find({
          _id: { $in: sortedIds },
          status: 'AVAILABLE',
          isDeleted: false,
        });

        if (products.length > 0) return products;
      }

      // 3. Fallback: products in same category with complementary pricing
      const targetProduct = await Product.findById(productId);
      if (!targetProduct) return [];

      return await Product.find({
        _id: { $ne: productId },
        category: targetProduct.category,
        status: 'AVAILABLE',
        isDeleted: false,
      })
        .sort({ rating: -1, salesCount: -1 })
        .limit(limit);
    } catch (error) {
      console.error('[Recommendation Error - Frequently Bought Together]:', error);
      return [];
    }
  }

  /**
   * Customers Also Viewed:
   * Finds products frequently viewed in the same user session as productId.
   */
  async getCustomersAlsoViewed(productId, limit = 6) {
    try {
      // Look up precomputed relations first
      const relations = await ProductRelation.find({
        productA: productId,
        relationType: 'CUSTOMERS_ALSO_VIEWED',
      })
        .sort({ strength: -1 })
        .limit(limit)
        .populate('productB');

      if (relations.length > 0) {
        return relations.map((r) => r.productB).filter(Boolean);
      }

      // Find sessions that viewed this product
      const views = await ProductView.find({ product: productId }).limit(100);
      const sessionIds = views.map((v) => v.sessionId).filter(Boolean);

      if (sessionIds.length > 0) {
        const coViews = await ProductView.aggregate([
          {
            $match: {
              sessionId: { $in: sessionIds },
              product: { $ne: productId },
            },
          },
          {
            $group: {
              _id: '$product',
              viewCount: { $sum: 1 },
            },
          },
          { $sort: { viewCount: -1 } },
          { $limit: limit },
        ]);

        const coViewIds = coViews.map((cv) => cv._id);
        if (coViewIds.length > 0) {
          const products = await Product.find({
            _id: { $in: coViewIds },
            status: 'AVAILABLE',
            isDeleted: false,
          });
          if (products.length > 0) return products;
        }
      }

      // Fallback: Similar products in same category
      return await this.getSimilarProducts(productId, limit);
    } catch (error) {
      console.error('[Recommendation Error - Customers Also Viewed]:', error);
      return [];
    }
  }

  /**
   * Similar Products:
   * Matches by Category, Subcategory, Brand, and Price band (+/- 40%).
   */
  async getSimilarProducts(productId, limit = 6) {
    try {
      const product = await Product.findById(productId);
      if (!product) return [];

      const minPrice = product.basePrice * 0.6;
      const maxPrice = product.basePrice * 1.5;

      const similar = await Product.find({
        _id: { $ne: productId },
        category: product.category,
        basePrice: { $gte: minPrice, $lte: maxPrice },
        status: 'AVAILABLE',
        isDeleted: false,
      })
        .sort({ salesCount: -1, rating: -1 })
        .limit(limit);

      if (similar.length < limit) {
        // Expand query if not enough items
        const additional = await Product.find({
          _id: { $nin: [productId, ...similar.map((p) => p._id)] },
          category: product.category,
          status: 'AVAILABLE',
          isDeleted: false,
        })
          .sort({ rating: -1 })
          .limit(limit - similar.length);

        return [...similar, ...additional];
      }

      return similar;
    } catch (error) {
      console.error('[Recommendation Error - Similar Products]:', error);
      return [];
    }
  }

  /**
   * Recommended For You:
   * Personalized for authenticated user based on recent views, wishlist, and past orders.
   */
  async getPersonalizedRecommendations(userId, limit = 8) {
    try {
      if (!userId) {
        // Non-logged in fallback: best-selling and trending products
        return await Product.find({
          status: 'AVAILABLE',
          isDeleted: false,
          $or: [{ isBestSeller: true }, { isTrending: true }, { isFeatured: true }],
        })
          .sort({ rating: -1, salesCount: -1 })
          .limit(limit);
      }

      // Collect user category preferences
      const interestedCategoryIds = new Set();

      // 1. Check user orders
      const orders = await Order.find({ user: userId }).limit(10);
      for (const order of orders) {
        for (const item of order.items) {
          const prod = await Product.findById(item.product);
          if (prod && prod.category) interestedCategoryIds.add(prod.category.toString());
        }
      }

      // 2. Check user wishlist
      const wishlist = await Wishlist.findOne({ user: userId });
      if (wishlist && wishlist.products.length > 0) {
        for (const wItem of wishlist.products) {
          const prod = await Product.findById(wItem.product);
          if (prod && prod.category) interestedCategoryIds.add(prod.category.toString());
        }
      }

      // 3. Check recent product views
      const views = await ProductView.find({ user: userId }).sort({ viewedAt: -1 }).limit(10);
      for (const view of views) {
        const prod = await Product.findById(view.product);
        if (prod && prod.category) interestedCategoryIds.add(prod.category.toString());
      }

      const catArray = Array.from(interestedCategoryIds);

      if (catArray.length > 0) {
        const recommended = await Product.find({
          category: { $in: catArray },
          status: 'AVAILABLE',
          isDeleted: false,
        })
          .sort({ salesCount: -1, rating: -1 })
          .limit(limit);

        if (recommended.length >= 4) return recommended;
      }

      // General fallback
      return await Product.find({
        status: 'AVAILABLE',
        isDeleted: false,
      })
        .sort({ rating: -1, salesCount: -1 })
        .limit(limit);
    } catch (error) {
      console.error('[Recommendation Error - Personalized]:', error);
      return [];
    }
  }

  /**
   * Log product view
   */
  async recordView(productId, userId = null, sessionId = null) {
    try {
      await ProductView.create({
        product: productId,
        user: userId,
        sessionId: sessionId || 'guest-session',
      });
      await Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } });
    } catch (e) {
      // Non-blocking
    }
  }
}

export const recommendationService = new RecommendationService();
export default recommendationService;
