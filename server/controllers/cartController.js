import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import Coupon from '../models/Coupon.js';

// Helper to compute cart totals with live prices
const calculateCartTotals = async (cart) => {
  let subtotal = 0;
  let totalItems = 0;
  const validItems = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product || product.isDeleted || product.status === 'ARCHIVED') {
      continue; // Skip deleted items
    }

    let unitPrice = product.basePrice;
    let stock = 10;
    let sku = `PROD-${product._id.toString().slice(-6)}`;
    let images = product.images;

    if (item.variant) {
      const variant = await ProductVariant.findById(item.variant);
      if (variant) {
        unitPrice = variant.price;
        stock = variant.stock - (variant.reservedStock || 0);
        sku = variant.sku;
        if (variant.images?.length > 0) images = variant.images;
      }
    }

    const itemSubtotal = unitPrice * item.quantity;
    subtotal += itemSubtotal;
    totalItems += item.quantity;

    validItems.push({
      _id: item._id,
      product: {
        _id: product._id,
        title: product.title,
        slug: product.slug,
        brand: product.brand,
        images,
        thumbnail: product.thumbnail || images[0],
        status: product.status,
      },
      variant: item.variant,
      sku,
      selectedAttributes: item.selectedAttributes,
      quantity: item.quantity,
      price: unitPrice,
      subtotal: itemSubtotal,
      maxStock: Math.max(0, stock),
    });
  }

  // Delivery fee logic (free over 500 INR, else 40 INR)
  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 40;

  // Coupon discount calculation
  let discount = 0;
  let couponInfo = null;

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

      couponInfo = {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
      };
    }
  }

  const grandTotal = Math.max(0, subtotal - discount + deliveryFee);

  return {
    items: validItems,
    totalItems,
    subtotal,
    deliveryFee,
    discount,
    grandTotal,
    appliedCoupon: couponInfo,
  };
};

// @desc    Get user's current shopping cart
// @route   GET /api/cart
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const cartData = await calculateCartTotals(cart);
    res.status(200).json({
      success: true,
      cart: cartData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
export const addToCart = async (req, res, next) => {
  try {
    const { productId, variantId, quantity = 1, selectedAttributes = {} } = req.body;

    const product = await Product.findById(productId);
    if (!product || product.isDeleted || product.status !== 'AVAILABLE') {
      return res.status(400).json({ success: false, message: 'Product is currently unavailable' });
    }

    let price = product.basePrice;
    let sku = '';

    if (variantId) {
      const variant = await ProductVariant.findById(variantId);
      if (!variant || !variant.isAvailable) {
        return res.status(400).json({ success: false, message: 'Selected variant is not available' });
      }
      price = variant.price;
      sku = variant.sku;
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if same product & variant already in cart
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        (variantId ? item.variant?.toString() === variantId : !item.variant)
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
      cart.items[existingIndex].priceAtAddition = price;
    } else {
      cart.items.push({
        product: productId,
        variant: variantId || null,
        sku,
        selectedAttributes,
        quantity: Number(quantity),
        priceAtAddition: price,
      });
    }

    await cart.save();
    const cartData = await calculateCartTotals(cart);

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart: cartData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    item.quantity = Number(quantity);
    await cart.save();

    const cartData = await calculateCartTotals(cart);
    res.status(200).json({
      success: true,
      cart: cartData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
export const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    const cartData = await calculateCartTotals(cart);
    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: cartData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon code to cart
// @route   POST /api/cart/coupon
export const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide coupon code' });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    // Check user usage limit
    const userUsage = coupon.userUsage?.find((u) => u.user.toString() === req.user._id.toString());
    if (userUsage && userUsage.count >= coupon.perUserLimit) {
      return res.status(400).json({ success: false, message: 'You have already used this coupon maximum times' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Validate minimum cart subtotal
    const cartData = await calculateCartTotals(cart);
    if (cartData.subtotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value for this coupon is ₹${coupon.minOrderValue}`,
      });
    }

    cart.appliedCoupon = coupon._id;
    await cart.save();

    const updatedCart = await calculateCartTotals(cart);
    res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully! Saved ₹${updatedCart.discount}`,
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
export const removeCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.appliedCoupon = null;
      await cart.save();
    }
    const cartData = await calculateCartTotals(cart);
    res.status(200).json({
      success: true,
      message: 'Coupon removed',
      cart: cartData,
    });
  } catch (error) {
    next(error);
  }
};
