import Inventory from '../models/Inventory.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import ProductVariant from '../models/ProductVariant.js';
import Product from '../models/Product.js';

// @desc    Admin: Get inventory list with filters
// @route   GET /api/admin/inventory
export const adminGetInventory = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      query.sku = new RegExp(search.trim(), 'i');
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Inventory.find(query)
        .populate('product', 'title slug images status')
        .populate('variant', 'title sku price stock reservedStock attributes')
        .sort({ status: 1, currentStock: 1 })
        .skip(skip)
        .limit(limitNum),
      Inventory.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      inventory: items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update inventory stock (Add, Reduce, Adjust, Damage, Return)
// @route   PATCH /api/admin/inventory/:id
export const adminUpdateStock = async (req, res, next) => {
  try {
    const { type = 'ADJUSTMENT', quantity, reason, lowStockThreshold } = req.body;
    const inv = await Inventory.findById(req.params.id);

    if (!inv) {
      return res.status(404).json({ success: false, message: 'Inventory record not found' });
    }

    const previousStock = inv.currentStock;
    let newStock = previousStock;

    const qty = Number(quantity);

    switch (type) {
      case 'ADD':
        newStock = previousStock + qty;
        break;
      case 'REDUCE':
      case 'DAMAGE':
        newStock = Math.max(0, previousStock - qty);
        break;
      case 'RETURN':
        newStock = previousStock + qty;
        break;
      case 'ADJUSTMENT':
        newStock = Math.max(0, qty);
        break;
      default:
        newStock = previousStock;
    }

    inv.currentStock = newStock;
    if (lowStockThreshold !== undefined) {
      inv.lowStockThreshold = Number(lowStockThreshold);
    }

    await inv.save();

    // If linked to variant, update variant stock as well
    if (inv.variant) {
      await ProductVariant.findByIdAndUpdate(inv.variant, { stock: newStock });
    }

    // Log transaction
    await InventoryTransaction.create({
      inventory: inv._id,
      product: inv.product,
      variant: inv.variant || null,
      sku: inv.sku,
      type,
      quantity: Math.abs(newStock - previousStock),
      previousStock,
      newStock,
      reason: reason || `Manual stock adjustment (${type})`,
      performedBy: req.admin?.name || 'Admin',
    });

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      inventory: inv,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get inventory transaction logs
// @route   GET /api/admin/inventory/transactions
export const adminGetTransactions = async (req, res, next) => {
  try {
    const { sku, limit = 50 } = req.query;
    const query = {};
    if (sku) query.sku = sku;

    const transactions = await InventoryTransaction.find(query)
      .populate('product', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};
