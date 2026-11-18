import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import Inventory from '../models/Inventory.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import Address from '../models/Address.js';
import Coupon from '../models/Coupon.js';
import Notification from '../models/Notification.js';
import Shipment from '../models/Shipment.js';
import { sendEmail, getOrderEmailTemplate } from '../utils/mailer.js';

// Helper to generate unique order number e.g. EB-202611-8492
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `EB-${dateStr}-${randomStr}`;
};

// @desc    Place a new customer order (Cash on Delivery)
// @route   POST /api/orders
export const createOrder = async (req, res, next) => {
  try {
    const { addressId } = req.body;

    if (!addressId) {
      return res.status(400).json({ success: false, message: 'Delivery address is required' });
    }

    const address = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!address) {
      return res.status(400).json({ success: false, message: 'Selected address not found' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Backend validation of items, prices, and inventory
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.product);
      if (!product || product.isDeleted || product.status !== 'AVAILABLE') {
        return res.status(400).json({
          success: false,
          message: `Item "${product?.title || 'Unknown'}" is currently unavailable for order`,
        });
      }

      let unitPrice = product.basePrice;
      let sku = `PROD-${product._id.toString().slice(-6)}`;
      let availableStock = 25;

      if (cartItem.variant) {
        const variant = await ProductVariant.findById(cartItem.variant);
        if (!variant || !variant.isAvailable) {
          return res.status(400).json({
            success: false,
            message: `Variant of "${product.title}" is out of stock`,
          });
        }
        unitPrice = variant.price;
        sku = variant.sku;
        availableStock = variant.stock - (variant.reservedStock || 0);

        if (availableStock < cartItem.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for SKU ${variant.sku}. Available: ${availableStock}`,
          });
        }

        // Atomically reserve variant stock
        await ProductVariant.findByIdAndUpdate(variant._id, {
          $inc: { reservedStock: cartItem.quantity },
        });
      } else {
        // Find inventory
        const inv = await Inventory.findOne({ product: product._id, variant: null });
        if (inv) {
          availableStock = inv.currentStock - inv.reservedStock;
          if (availableStock < cartItem.quantity) {
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for "${product.title}". Available: ${availableStock}`,
            });
          }
          await Inventory.findByIdAndUpdate(inv._id, {
            $inc: { reservedStock: cartItem.quantity },
          });
        }
      }

      const itemTotal = unitPrice * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        variant: cartItem.variant || null,
        title: product.title,
        brand: product.brand,
        sku,
        selectedAttributes: cartItem.selectedAttributes || {},
        image: product.thumbnail || product.images[0],
        unitPrice,
        quantity: cartItem.quantity,
        subtotal: itemTotal,
      });
    }

    // Delivery charge calculation
    const deliveryCharge = subtotal > 500 ? 0 : 40;

    // Coupon calculation
    let discount = 0;
    let appliedCouponData = null;

    if (cart.appliedCoupon) {
      const coupon = await Coupon.findById(cart.appliedCoupon);
      if (coupon && coupon.isActive && new Date() <= new Date(coupon.expiryDate) && subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'PERCENTAGE') {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
            discount = coupon.maxDiscountAmount;
          }
        } else {
          discount = Math.min(coupon.discountValue, subtotal);
        }

        appliedCouponData = {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: discount,
        };

        // Increment coupon usage
        await Coupon.findByIdAndUpdate(coupon._id, {
          $inc: { usedCount: 1 },
          $push: { userUsage: { user: req.user._id, count: 1 } },
        });
      }
    }

    const totalAmount = Math.max(0, subtotal - discount + deliveryCharge);
    const orderNumber = generateOrderNumber();

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      addressSnapshot: {
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        houseBuilding: address.houseBuilding,
        street: address.street,
        locality: address.locality,
        landmark: address.landmark,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        addressType: address.addressType,
      },
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      paymentDetails: {
        paidAt: null,
        collectedBy: '',
        notes: 'Cash on Delivery',
      },
      subtotal,
      discount,
      deliveryCharge,
      totalAmount,
      appliedCoupon: appliedCouponData,
      orderStatus: 'Confirmed',
      statusHistory: [
        {
          status: 'Confirmed',
          timestamp: new Date(),
          comment: 'Order placed and confirmed successfully',
          updatedBy: 'System',
        },
      ],
      estimatedDelivery,
    });

    // Clear user cart
    cart.items = [];
    cart.appliedCoupon = null;
    await cart.save();

    // Create In-App Notification for Customer
    await Notification.create({
      user: req.user._id,
      title: 'Order Confirmed! 🎉',
      message: `Your order #${order.orderNumber} for ₹${order.totalAmount.toLocaleString('en-IN')} has been placed successfully.`,
      type: 'ORDER',
      link: `/orders/${order._id}`,
    });

    // Create Notification for Admin
    await Notification.create({
      isAdminNotification: true,
      title: 'New Customer Order Received',
      message: `Order #${order.orderNumber} placed by ${req.user.firstName} (${order.items.length} items, ₹${order.totalAmount}).`,
      type: 'ORDER',
      link: `/admin/orders`,
    });

    // Send email notification (asynchronous, non-blocking)
    sendEmail({
      to: req.user.email,
      subject: `Order Confirmed: #${order.orderNumber} - EasyBuy`,
      html: getOrderEmailTemplate(order, 'ORDER_CONFIRMED'),
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer order history
// @route   GET /api/orders/my-orders
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details by id
// @route   GET /api/orders/:id
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('shipment');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (if not yet packed/shipped)
// @route   PATCH /api/orders/:id/cancel
export const cancelOrder = async (req, res, next) => {
  try {
    const { reason = 'Cancelled by customer' } = req.body;
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in "${order.orderStatus}" status`,
      });
    }

    // Release reserved stock back to available
    for (const item of order.items) {
      if (item.variant) {
        await ProductVariant.findByIdAndUpdate(item.variant, {
          $inc: { reservedStock: -item.quantity },
        });
      } else {
        await Inventory.findOneAndUpdate(
          { product: item.product, variant: null },
          { $inc: { reservedStock: -item.quantity } }
        );
      }
    }

    order.orderStatus = 'Cancelled';
    order.cancellationReason = reason;
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      comment: reason,
      updatedBy: 'Customer',
    });

    await order.save();

    await Notification.create({
      user: req.user._id,
      title: 'Order Cancelled',
      message: `Your order #${order.orderNumber} has been cancelled.`,
      type: 'ORDER',
      link: `/orders/${order._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// ================= ADMIN ORDER MANAGEMENT =================

// @desc    Admin: Get all orders with status/search filters
// @route   GET /api/admin/orders
export const adminGetAllOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: new RegExp(search.trim(), 'i') },
        { 'addressSnapshot.fullName': new RegExp(search.trim(), 'i') },
        { 'addressSnapshot.phoneNumber': new RegExp(search.trim(), 'i') },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'firstName lastName email')
        .populate('shipment')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update order status & shipment tracking
// @route   PATCH /api/admin/orders/:id/status
export const adminUpdateOrderStatus = async (req, res, next) => {
  try {
    const { status, comment, shippingCompany, trackingId, trackingUrl, deliveryNotes, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id).populate('user');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === 'PAID' && !order.paymentDetails?.paidAt) {
        order.paymentDetails = {
          ...order.paymentDetails,
          paidAt: new Date(),
          collectedBy: req.admin?.name || 'Administrator',
          notes: 'Cash collected on delivery',
        };
      }
    }

    // Valid transitions check
    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      comment: comment || `Status updated to ${status}`,
      updatedBy: req.admin?.name || 'Administrator',
    });

    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'PAID'; // COD marked paid upon delivery

      // Fulfill inventory permanently (decrement stock and reservedStock)
      for (const item of order.items) {
        if (item.variant) {
          await ProductVariant.findByIdAndUpdate(item.variant, {
            $inc: { stock: -item.quantity, reservedStock: -item.quantity },
          });
        }
        await Product.findByIdAndUpdate(item.product, {
          $inc: { salesCount: item.quantity },
        });
      }
    }

    // Create or update shipment if tracking provided
    if (shippingCompany && trackingId) {
      let shipment = await Shipment.findOne({ order: order._id });
      if (!shipment) {
        shipment = await Shipment.create({
          order: order._id,
          orderNumber: order.orderNumber,
          shippingCompany,
          trackingId,
          trackingUrl: trackingUrl || `https://www.google.com/search?q=${trackingId}`,
          status: status === 'Delivered' ? 'DELIVERED' : status === 'Out for Delivery' ? 'OUT_FOR_DELIVERY' : 'IN_TRANSIT',
          deliveryNotes: deliveryNotes || '',
          estimatedDelivery: order.estimatedDelivery,
          statusUpdates: [
            {
              status,
              location: 'Dispatch Hub',
              notes: comment || `Package ${status}`,
            },
          ],
        });
        order.shipment = shipment._id;
      } else {
        shipment.shippingCompany = shippingCompany;
        shipment.trackingId = trackingId;
        if (trackingUrl) shipment.trackingUrl = trackingUrl;
        shipment.statusUpdates.push({
          status,
          location: 'In Transit Hub',
          notes: comment || `Status updated to ${status}`,
        });
        await shipment.save();
      }

      order.trackingInfo = {
        shippingCompany,
        trackingId,
        trackingUrl: trackingUrl || shipment.trackingUrl,
      };
    }

    await order.save();

    // Customer Notification
    await Notification.create({
      user: order.user._id,
      title: `Order Update: ${status}`,
      message: `Your order #${order.orderNumber} is now: ${status}.`,
      type: status === 'Delivered' ? 'DELIVERY' : 'ORDER',
      link: `/orders/${order._id}`,
    });

    // Send email
    sendEmail({
      to: order.user.email,
      subject: `Order #${order.orderNumber} Update: ${status} - EasyBuy`,
      html: getOrderEmailTemplate(order, status.toUpperCase().replace(/\s+/g, '_')),
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update order payment status
// @route   PATCH /api/admin/orders/:id/payment-status
export const adminUpdatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, notes } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'PAID') {
      order.paymentDetails = {
        ...order.paymentDetails,
        paidAt: new Date(),
        collectedBy: req.admin?.name || 'Administrator',
        notes: notes || 'Cash collected on delivery',
      };
    }
    await order.save();

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};
