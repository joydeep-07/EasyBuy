import Coupon from '../models/Coupon.js';

// @desc    Admin: Get all coupons
// @route   GET /api/admin/coupons
export const adminGetCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create coupon
// @route   POST /api/admin/coupons
export const adminCreateCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      startDate,
      expiryDate,
      usageLimit,
      perUserLimit,
      isActive,
    } = req.body;

    const formattedCode = code.toUpperCase().trim();
    const exists = await Coupon.findOne({ code: formattedCode });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: formattedCode,
      description,
      discountType: discountType || 'PERCENTAGE',
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      startDate: startDate || new Date(),
      expiryDate,
      usageLimit: usageLimit || 1000,
      perUserLimit: perUserLimit || 1,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update coupon
// @route   PUT /api/admin/coupons/:id
export const adminUpdateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    Object.assign(coupon, req.body);
    if (req.body.code) coupon.code = req.body.code.toUpperCase().trim();
    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete coupon
// @route   DELETE /api/admin/coupons/:id
export const adminDeleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Coupon removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active coupons list (for banner showcase / checkout modal)
// @route   GET /api/coupons/active
export const getActiveCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: new Date() },
    })
      .select('code description discountType discountValue minOrderValue maxDiscountAmount expiryDate')
      .sort({ discountValue: -1 });

    res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    next(error);
  }
};
