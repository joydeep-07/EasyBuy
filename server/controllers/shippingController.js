import DeliveryZone from '../models/DeliveryZone.js';
import Shipment from '../models/Shipment.js';
import Order from '../models/Order.js';

// @desc    Check pincode delivery availability and rates
// @route   GET /api/shipping/check-pincode/:pincode
export const checkPincode = async (req, res, next) => {
  try {
    const { pincode } = req.params;

    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit Indian PIN code.',
      });
    }

    const zone = await DeliveryZone.findOne({ pincode: pincode.trim() });

    if (!zone) {
      // Default serviceable zone fallback for valid Indian PINs
      return res.status(200).json({
        success: true,
        data: {
          pincode: pincode.trim(),
          isServiceable: true,
          city: 'Standard Region',
          state: 'India',
          estimatedDays: 4,
          deliveryFee: 40,
          isCodAvailable: true,
          isExpressAvailable: false,
          statusText: 'Deliverable',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        pincode: zone.pincode,
        isServiceable: zone.isServiceable,
        city: zone.city,
        state: zone.state,
        estimatedDays: zone.estimatedDeliveryDays,
        deliveryFee: zone.deliveryFee,
        isCodAvailable: zone.isCodAvailable,
        isExpressAvailable: zone.isExpressAvailable,
        expressFee: zone.expressDeliveryFee,
        statusText: zone.isServiceable ? 'Deliverable' : 'Unavailable at your location',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tracking timeline for an order
// @route   GET /api/shipping/track/:orderId
export const getOrderTracking = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('shipment');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Default timeline stages
    const stages = [
      { key: 'Confirmed', label: 'Order Confirmed', completed: true },
      { key: 'Processing', label: 'Processing', completed: false },
      { key: 'Packed', label: 'Packed', completed: false },
      { key: 'Shipped', label: 'Shipped', completed: false },
      { key: 'Out for Delivery', label: 'Out for Delivery', completed: false },
      { key: 'Delivered', label: 'Delivered', completed: false },
    ];

    const currentIdx = stages.findIndex((s) => s.key === order.orderStatus);
    stages.forEach((s, idx) => {
      s.completed = currentIdx !== -1 && idx <= currentIdx;
      s.current = s.key === order.orderStatus;
    });

    res.status(200).json({
      success: true,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      estimatedDelivery: order.estimatedDelivery,
      deliveredAt: order.deliveredAt,
      addressSnapshot: order.addressSnapshot,
      shipment: order.shipment || null,
      statusHistory: order.statusHistory || [],
      stages,
    });
  } catch (error) {
    next(error);
  }
};

// ================= ADMIN DELIVERY ZONE CONTROLS =================

// @desc    Admin: Get all delivery zones
// @route   GET /api/admin/shipping/zones
export const adminGetZones = async (req, res, next) => {
  try {
    const zones = await DeliveryZone.find().sort({ pincode: 1 });
    res.status(200).json({
      success: true,
      count: zones.length,
      zones,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create or update delivery zone
// @route   POST /api/admin/shipping/zones
export const adminCreateZone = async (req, res, next) => {
  try {
    const { pincode, city, state, isServiceable, estimatedDeliveryDays, deliveryFee, isCodAvailable, isExpressAvailable } =
      req.body;

    const zone = await DeliveryZone.findOneAndUpdate(
      { pincode: pincode.trim() },
      {
        city,
        state,
        isServiceable: isServiceable !== undefined ? isServiceable : true,
        estimatedDeliveryDays: estimatedDeliveryDays || 3,
        deliveryFee: deliveryFee !== undefined ? deliveryFee : 40,
        isCodAvailable: isCodAvailable !== undefined ? isCodAvailable : true,
        isExpressAvailable: !!isExpressAvailable,
      },
      { new: true, upsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Delivery zone saved successfully',
      zone,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete delivery zone
// @route   DELETE /api/admin/shipping/zones/:id
export const adminDeleteZone = async (req, res, next) => {
  try {
    await DeliveryZone.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Delivery zone removed',
    });
  } catch (error) {
    next(error);
  }
};
