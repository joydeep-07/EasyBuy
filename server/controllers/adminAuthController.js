import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Inventory from '../models/Inventory.js';
import Category from '../models/Category.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/jwt.js';

// @desc    Admin login
// @route   POST /api/admin/auth/login
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Admin email and password are required.',
      });
    }

    // Check Admin model first
    let admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

    // If not in Admin model, check User model with role ADMIN
    if (!admin) {
      admin = await User.findOne({ email: email.toLowerCase(), role: 'ADMIN' }).select('+password');
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.',
      });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.',
      });
    }

    // Set lastLogin if Admin model
    if (admin.lastLogin !== undefined) {
      admin.lastLogin = new Date();
      await admin.save();
    }

    const token = generateToken(admin._id, 'ADMIN');
    setAuthCookie(res, token, 'admin_token');

    res.status(200).json({
      success: true,
      message: 'Admin authenticated successfully',
      admin: {
        _id: admin._id,
        name: admin.name || `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        role: 'ADMIN',
        permissions: admin.permissions || ['all'],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin logout
// @route   POST /api/admin/auth/logout
export const adminLogout = async (req, res) => {
  clearAuthCookie(res, 'admin_token');
  res.status(200).json({
    success: true,
    message: 'Admin logged out successfully',
  });
};

// @desc    Get current admin profile
// @route   GET /api/admin/auth/me
export const getAdminProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    admin: req.admin,
  });
};

// @desc    Get real admin dashboard analytics
// @route   GET /api/admin/dashboard
export const getAdminDashboard = async (req, res, next) => {
  try {
    // 1. Total & categorized counts
    const [
      totalCustomers,
      totalProducts,
      activeProducts,
      soldOutProducts,
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      lowStockCount,
      allOrders,
    ] = await Promise.all([
      User.countDocuments({ role: 'CUSTOMER' }),
      Product.countDocuments({ isDeleted: false }),
      Product.countDocuments({ status: 'AVAILABLE', isDeleted: false }),
      Product.countDocuments({ status: 'SOLD_OUT', isDeleted: false }),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: { $in: ['Pending', 'Confirmed', 'Processing'] } }),
      Order.countDocuments({ orderStatus: { $in: ['Shipped', 'Out for Delivery'] } }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Order.countDocuments({ orderStatus: 'Cancelled' }),
      Inventory.countDocuments({ status: { $in: ['LOW_STOCK', 'OUT_OF_STOCK'] } }),
      Order.find({ orderStatus: { $ne: 'Cancelled' } }).select('totalAmount createdAt orderStatus items'),
    ]);

    // 2. Revenue calculation
    const totalRevenue = allOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    // 3. Sales trends (monthly over the past 6 months)
    const monthlySales = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
      monthlySales[label] = { label, revenue: 0, orders: 0 };
    }

    allOrders.forEach((ord) => {
      const d = new Date(ord.createdAt);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
      if (monthlySales[label]) {
        monthlySales[label].revenue += ord.totalAmount || 0;
        monthlySales[label].orders += 1;
      }
    });

    const monthlyTrends = Object.values(monthlySales);

    // 4. Category breakdown
    const categories = await Category.find({ parentCategory: null });
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const prodCount = await Product.countDocuments({ category: cat._id, isDeleted: false });
        return {
          name: cat.name,
          slug: cat.slug,
          productCount: prodCount,
        };
      })
    );

    // 5. Recent Orders
    const recentOrders = await Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(8);

    // 6. Top performing products
    const topProducts = await Product.find({ isDeleted: false })
      .sort({ salesCount: -1, rating: -1 })
      .limit(5)
      .select('title basePrice salesCount rating images status');

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        activeProducts,
        soldOutProducts,
        pendingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        lowStockCount,
      },
      charts: {
        monthlyTrends,
        categoryStats,
      },
      recentOrders,
      topProducts,
    });
  } catch (error) {
    next(error);
  }
};
