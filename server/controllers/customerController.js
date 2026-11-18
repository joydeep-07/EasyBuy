import User from '../models/User.js';
import Order from '../models/Order.js';
import Address from '../models/Address.js';

// @desc    Admin: Get all customers with search and pagination
// @route   GET /api/admin/customers
export const adminGetCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 15 } = req.query;
    const query = { role: 'CUSTOMER' };

    if (search) {
      query.$or = [
        { firstName: new RegExp(search.trim(), 'i') },
        { lastName: new RegExp(search.trim(), 'i') },
        { email: new RegExp(search.trim(), 'i') },
        { phone: new RegExp(search.trim(), 'i') },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [customers, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    // Attach order count and total spend for each customer
    const enhancedCustomers = await Promise.all(
      customers.map(async (cust) => {
        const orders = await Order.find({ user: cust._id, orderStatus: { $ne: 'Cancelled' } }).select('totalAmount');
        const totalSpent = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
        return {
          ...cust.toObject(),
          orderCount: orders.length,
          totalSpent,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enhancedCustomers.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      customers: enhancedCustomers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get single customer details with order history and addresses
// @route   GET /api/admin/customers/:id
export const adminGetCustomerDetails = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const [orders, addresses] = await Promise.all([
      Order.find({ user: customer._id }).sort({ createdAt: -1 }),
      Address.find({ user: customer._id }),
    ]);

    const totalSpent = orders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);

    res.status(200).json({
      success: true,
      customer,
      addresses,
      orders,
      stats: {
        totalOrders: orders.length,
        totalSpent,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Toggle customer account active/disabled
// @route   PATCH /api/admin/customers/:id/status
export const adminToggleCustomerStatus = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.isActive = !customer.isActive;
    await customer.save();

    res.status(200).json({
      success: true,
      message: `Customer account ${customer.isActive ? 'activated' : 'deactivated'}`,
      isActive: customer.isActive,
    });
  } catch (error) {
    next(error);
  }
};
